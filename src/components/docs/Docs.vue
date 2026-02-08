<script setup>
import { ref, shallowRef, onMounted, computed, watch } from "vue";
import Fuse from "fuse.js";
import Nav from "./Nav.vue";

const brandName = ref("whatsapi");

const renderModules = import.meta.glob("@/docs/**/*.md");

const rawModules = import.meta.glob("@/docs/**/*.md", {
  query: "?raw",
  import: "default",
});

// Состояние
const menu = ref([]);
const currentDoc = shallowRef(null);
const currentPath = ref("");
const currentDocName = ref("");
const currentCategory = ref("");

const isLoading = ref(true);
const errorMsg = ref("");

const searchQuery = ref("");
const searchResults = ref([]);
const searchIndex = ref([]);
const isIndexing = ref(true);

const buildSearchIndex = async () => {
  const index = [];
  const targetBrand = brandName.value.toLowerCase();

  for (const path in rawModules) {
    if (path.toLowerCase().includes(`/${targetBrand}/`)) {
      try {
        const rawContent = await rawModules[path]();

        const title = path
          .split("/")
          .pop()
          .replace(".md", "")
          .replace(/^\d+-/, "")
          .replace(/-/g, " ");

        const plainText = rawContent
          .replace(/[#*`>]/g, "")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
          .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
          .replace(/\n+/g, " ");

        index.push({ path, title, content: plainText });
      } catch (e) {
        console.warn(`Ошибка индексации файла ${path}:`, e);
      }
    }
  }
  searchIndex.value = index;
  isIndexing.value = false;
};

const fuse = computed(
  () =>
    new Fuse(searchIndex.value, {
      keys: [
        { name: "title", weight: 0.8 },
        { name: "content", weight: 0.2 },
      ],
      threshold: 0.1,
      ignoreLocation: true,
      findAllMatches: true,
      minMatchCharLength: 2,
      includeMatches: true,
    }),
);

const getHighlightedSnippet = (resultItem) => {
  const query = searchQuery.value.toLowerCase();
  const match = resultItem.matches?.find((m) => m.key === "content");

  if (!match) return resultItem.item.content.substring(0, 60) + "...";

  const text = resultItem.item.content;

  const bestIndex = match.indices.reduce((prev, curr) => {
    return curr[1] - curr[0] > prev[1] - prev[0] ? curr : prev;
  });

  const start = bestIndex[0];
  const end = bestIndex[1] + 1;

  if (end - start < query.length * 0.7) {
    return text.substring(0, 60) + "...";
  }

  const snippetStart = Math.max(0, start - 40);
  const snippetEnd = Math.min(text.length, end + 40);

  let snippet = text.substring(snippetStart, snippetEnd);
  const matchedWord = text.substring(start, end);

  const highlighted = snippet.replace(
    new RegExp(`(${matchedWord})`, "gi"),
    "<mark>$1</mark>",
  );

  return (
    (snippetStart > 0 ? "..." : "") +
    highlighted +
    (snippetEnd < text.length ? "..." : "")
  );
};

watch(searchQuery, (query) => {
  if (query.trim().length >= 2 && !isIndexing.value) {
    searchResults.value = fuse.value.search(query).slice(0, 10);
  } else {
    searchResults.value = [];
  }
});

const selectSearchResult = (path) => {
  loadDoc(path);
  searchQuery.value = "";
  searchResults.value = [];
};

const normalizePath = (fullPath) => {
  const brandSegment = `/${brandName.value}/`;
  const idx = fullPath.indexOf(brandSegment);
  if (idx === -1) return null;
  return fullPath.substring(idx + brandSegment.length).replace(".md", "");
};

const buildTree = () => {
  const root = [];
  for (const path in renderModules) {
    const cleanPath = normalizePath(path);
    if (!cleanPath) continue;

    const parts = cleanPath.split("/");
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const cleanName = part.replace(/^\d+-/, "").replace(/-/g, " ");

      let existingNode = currentLevel.find((node) => node.name === cleanName);

      if (!existingNode) {
        existingNode = {
          name: cleanName,
          path: path,
          isFile: isFile,
          children: isFile ? null : [],
        };
        currentLevel.push(existingNode);
      }
      if (!isFile) currentLevel = existingNode.children;
    });
  }
  return root;
};

const loadDoc = async (path) => {
  isLoading.value = true;
  errorMsg.value = "";
  const importFn = renderModules[path];

  if (!importFn) {
    errorMsg.value = `Файл не найден: ${path}`;
    isLoading.value = false;
    return;
  }

  try {
    const mod = await importFn();
    currentDoc.value = mod.default;
    currentPath.value = path;

    const cleanPath = normalizePath(path) || "";
    const parts = cleanPath.split("/");
    const fileName =
      parts.pop()?.replace(/^\d+-/, "").replace(/-/g, " ") || "Doc";
    const categoryName = parts.pop()?.replace(/^\d+-/, "").replace(/-/g, " ");

    currentDocName.value = fileName;
    currentCategory.value = categoryName || "";

    document.querySelector(".content-area")?.scrollTo(0, 0);
  } catch (e) {
    console.error(e);
    errorMsg.value = "Ошибка загрузки документа";
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  try {
    menu.value = buildTree();
    if (menu.value.length === 0) {
      errorMsg.value = `Документы не найдены.`;
      isLoading.value = false;
      return;
    }
    const findFirstFile = (nodes) => {
      for (const node of nodes) {
        if (node.isFile) return node.path;
        if (node.children) {
          const path = findFirstFile(node.children);
          if (path) return path;
        }
      }
    };
    const firstPath = findFirstFile(menu.value);
    if (firstPath) await loadDoc(firstPath);
    buildSearchIndex();
  } catch (e) {
    errorMsg.value = "Критическая ошибка инициализации";
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="kb-layout">
    <aside class="sidebar">
      <div class="sidebar-nav-scroll">
        <Nav :items="menu" :loadDoc="loadDoc" :selectedPath="currentPath" />
      </div>
    </aside>

    <div class="content-area">
      <div class="sidebar-header">
        <div class="search-wrapper">
          <div class="search-input-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по заголовку"
            class="kb-search-input"
          />

          <div v-if="searchResults.length" class="kb-search-results">
            <div
              v-for="res in searchResults"
              :key="res.item.path"
              @click="selectSearchResult(res.item.path)"
              class="kb-search-item"
            >
              <div class="item-title">{{ res.item.title }}</div>
              <div
                class="item-snippet"
                v-html="getHighlightedSnippet(res)"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-container">
        <transition name="page-fade" mode="out-in">
          <div
            :key="currentPath"
            class="article-wrapper"
            v-if="!isLoading && currentDoc"
          >
            <header class="doc-header">
              <h1 class="main-title">{{ currentDocName }}</h1>
              <div class="meta-info"></div>
            </header>

            <article class="markdown-body">
              <component :is="currentDoc" />
            </article>
          </div>

          <div v-else-if="isLoading" class="empty-state">
            <div class="loader-spinner"></div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kb-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #ffffff;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
}
.sidebar-header {
  padding: 20px 40px;
}
.sidebar-nav-scroll {
  flex: 1;
  overflow-y: auto;
}
.search-wrapper {
  position: relative;
  max-width: 400px;
}
.search-input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b778c;
}
.kb-search-input {
  width: 100%;
  padding: 8px 12px 8px 38px;
  border: 1px solid #dfe1e6;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.kb-search-input:focus {
  border-color: #4c9aff;
}
.kb-search-results {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #dfe1e6;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}
.kb-search-item {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #f4f5f7;
}
.content-area {
  flex: 1;
  overflow-y: auto;
  background: #fff;
}

.content-container {
  margin: 0 auto;
  padding: 40px 40px;
}

.doc-header {
  margin-bottom: 32px;
}

.main-title {
  font-size: 32px;
  font-weight: 500;
  color: #172b4d;
  margin-bottom: 12px;
  letter-spacing: -0.01em;
}

.meta-info {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6b778c;
  margin-bottom: 24px;
}

/* Markdown контент */
.markdown-body {
  font-size: 16px;
  line-height: 1.6;
  color: #172b4d;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  color: #172b4d;
  margin-top: 28px;
  margin-bottom: 12px;
  font-weight: 600;
}

.markdown-body :deep(h1) {
  font-size: 24px;
  border-bottom: 1px solid #dfe1e6;
  padding-bottom: 8px;
}
.markdown-body :deep(h2) {
  font-size: 20px;
}
.markdown-body :deep(h3) {
  font-size: 18px;
}

/* Списки */
.markdown-body :deep(ol),
.markdown-body :deep(ul) {
  padding-left: 24px;
  margin-bottom: 16px;
}

.markdown-body :deep(li) {
  margin-bottom: 8px;
}

/* Изображения (ОБНОВЛЕНО) */
.markdown-body :deep(img) {
  max-width: 80%; /* Не более 80% от ширины статьи */
  height: auto;
  display: block;
  margin: 32px 0; /* Отступы сверху и снизу */
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  box-shadow:
    0 2px 4px rgba(9, 30, 66, 0.08),
    0 0 1px rgba(9, 30, 66, 0.31);
}

/* Текст */
.markdown-body :deep(p) {
  margin-bottom: 16px;
}

/* Код */
.markdown-body :deep(code) {
  background: #f4f5f7;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 14px;
}

/* Загрузка */
.loader-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #ebecf0;
  border-top-color: #0052cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.15s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
