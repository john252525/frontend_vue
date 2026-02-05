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
  // Нормализуем строку поиска бренда
  const targetBrand = brandName.value.toLowerCase();

  for (const path in rawModules) {
    // Проверяем, относится ли файл к бренду
    if (path.toLowerCase().includes(`/${targetBrand}/`)) {
      try {
        const rawContent = await rawModules[path]();

        // Формируем заголовок
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
      // threshold: 0.0 делает поиск абсолютно точным.
      // Поставим 0.1, чтобы допускать только минимальные различия (например, регистр).
      threshold: 0.1,

      // Ищем совпадение в любом месте текста
      ignoreLocation: true,

      // Включаем нахождение всех совпадений
      findAllMatches: true,

      // Минимальная длина слова для поиска
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

  // Оборачиваем только точное совпадение
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

// --- ДЕРЕВО И НАВИГАЦИЯ ---

// Хелпер для нормализации путей (убирает /src/docs/brand/...)
const normalizePath = (fullPath) => {
  // Ищем вхождение бренда в путь
  const brandSegment = `/${brandName.value}/`;
  const idx = fullPath.indexOf(brandSegment);
  if (idx === -1) return null;

  // Возвращаем часть пути после бренда
  return fullPath.substring(idx + brandSegment.length).replace(".md", "");
};

const buildTree = () => {
  const root = [];

  for (const path in renderModules) {
    const cleanPath = normalizePath(path);
    if (!cleanPath) continue; // Пропускаем файлы других брендов

    const parts = cleanPath.split("/");
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const cleanName = part.replace(/^\d+-/, "").replace(/-/g, " ");

      let existingNode = currentLevel.find((node) => node.name === cleanName);

      if (!existingNode) {
        existingNode = {
          name: cleanName,
          path: path, // Сохраняем ОРИГИНАЛЬНЫЙ полный путь
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
    // 1. Строим меню
    menu.value = buildTree();

    if (menu.value.length === 0) {
      errorMsg.value = `Документы не найдены в папке /src/docs/${brandName.value}/. Проверьте путь.`;
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

    if (firstPath) {
      await loadDoc(firstPath);
    } else {
      errorMsg.value = "Не найдено ни одного MD файла в структуре.";
      isLoading.value = false;
    }

    buildSearchIndex();
  } catch (e) {
    console.error("Critical error:", e);
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
            placeholder="Найти..."
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
          <div
            v-else-if="searchQuery.length > 1 && searchResults.length === 0"
            class="kb-search-results empty"
          >
            Ничего не найдено
          </div>
        </div>
      </div>
      <div class="content-container">
        <div v-if="errorMsg" class="error-state">
          <h3>Упс!</h3>
          <p>{{ errorMsg }}</p>
        </div>

        <transition name="page-fade" mode="out-in">
          <div
            :key="currentPath"
            class="article-wrapper"
            v-if="!isLoading && currentDoc"
          >
            <header class="doc-header">
              <nav class="breadcrumb">
                <span class="root-label">Docs</span>
                <span v-if="currentCategory" class="separator">/</span>
                <span v-if="currentCategory" class="category-name">{{
                  currentCategory
                }}</span>
              </nav>
              <h1 class="main-title">{{ currentDocName }}</h1>
              <div class="header-divider"></div>
            </header>

            <article class="markdown-body">
              <component :is="currentDoc" />
            </article>

            <footer class="doc-footer">
              <p>Обновлено: {{ new Date().toLocaleDateString() }}</p>
            </footer>
          </div>

          <div v-else-if="isLoading" class="empty-state">
            <div class="loader-spinner"></div>
            <p>Загрузка...</p>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Layout */
.kb-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #ffffff;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.sidebar-header {
  padding: 20px;
  /* flex-shrink: 0; */
}

.sidebar-nav-scroll {
  flex: 1;
  overflow-y: auto;
  /* padding: 0 20px 20px 20px; */
}

/* Scrollbar */
.sidebar-nav-scroll::-webkit-scrollbar {
  width: 6px;
}
.sidebar-nav-scroll::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 4px;
}

/* Search */
.search-wrapper {
  position: relative;
}

.search-input-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

.kb-search-input {
  width: 100%;
  padding: 10px 10px 10px 36px;
  box-sizing: border-box;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  transition: all 0.2s;
  outline: none;
}

.kb-search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.kb-search-results {
  position: absolute;
  top: calc(100% + 8px); /* Плотная привязка под инпутом */
  left: 0;
  width: 100%; /* Ширина точно как у поля ввода */
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  max-height: 450px;
  overflow-y: auto;
  z-index: 9999; /* Поверх всего */
}

.kb-search-results.empty {
  padding: 12px;
  text-align: center;
  color: #6b7280;
  font-size: 0.85rem;
}

.kb-search-item {
  padding: 14px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background 0.2s ease;
}
.kb-search-item:last-child {
  border-bottom: none;
}
.kb-search-item:hover {
  background: #f1f5f9;
}

.item-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
  margin-bottom: 4px;
}
.item-snippet {
  font-size: 0.8rem;
  line-height: 1.5;
  color: #64748b;
}
.item-snippet :deep(mark) {
  background: #ffde58;
  color: #000;
  border-radius: 2px;
  padding: 0 2px;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
  background: white;
}
.content-container {
  margin: 0 auto;
  padding: 40px 20px;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: #ef4444;
  text-align: center;
}

/* Headers & Markdown */
.doc-header {
  margin-bottom: 40px;
}
.breadcrumb {
  display: flex;
  gap: 8px;
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 16px;
}
.category-name {
  color: #3b82f6;
  font-weight: 600;
  text-transform: capitalize;
}
.main-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 20px 0;
  line-height: 1.2;
}
.header-divider {
  height: 1px;
  background: #e5e7eb;
  width: 100%;
  margin-top: 20px;
}

.doc-footer {
  margin-top: 60px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
  color: #9ca3af;
  font-size: 0.85rem;
}

/* Loader */
.empty-state {
  height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}
.loader-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Transition */
.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
