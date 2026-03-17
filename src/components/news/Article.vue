<template>
  <article class="full-article">
    <!-- Hero-изображение -->
    <div v-if="update.image" class="hero">
      <img :src="update.image" :alt="update.title" class="hero-img" />
    </div>

    <div class="container">
      <div class="grid-layout">
        <!-- Основной контент -->
        <div class="main-content">
          <div class="meta-top">
            <span class="category-badge" :class="update.category">
              {{ getCategoryName(update.category) }}
            </span>
            <time class="pub-date">{{ formatDate(update.date) }}</time>
            <span class="read-time">· ~{{ readTime }} мин чтения</span>
          </div>

          <h1 class="article-h1">{{ update.title }}</h1>

          <p v-if="update.lead" class="lead-paragraph">
            {{ update.lead }}
          </p>

          <div class="prose" v-html="renderedContent"></div>

          <div v-if="update.tags?.length" class="tags-section">
            <div class="tags-title">Теги:</div>
            <div class="tags-list">
              <span v-for="tag in update.tags" :key="tag" class="tag-item">
                #{{ tag }}
              </span>
            </div>
          </div>

          <div class="back-area">
            <button class="back-button" @click="$emit('close')">
              ← Назад к обновлениям
            </button>
          </div>
        </div>

        <!-- Боковая панель (метаданные) -->
        <aside class="sidebar">
          <div class="sidebar-box">
            <div class="author-block">
              <div v-if="update.author?.avatar" class="author-avatar">
                <img :src="update.author.avatar" alt="Автор" />
              </div>
              <div class="author-info">
                <div class="author-name">
                  {{ update.author?.name || "Команда проекта" }}
                </div>
                <div class="author-role">
                  {{ update.author?.role || "Разработка" }}
                </div>
              </div>
            </div>

            <dl class="meta-list">
              <dt>Опубликовано</dt>
              <dd>{{ formatDate(update.date) }}</dd>

              <dt>Категория</dt>
              <dd>{{ getCategoryName(update.category) }}</dd>

              <dt>Время чтения</dt>
              <dd>~{{ readTime }} минут</dd>
            </dl>

            <div class="share-hint">Поделитесь обновлением с коллегами</div>
          </div>
        </aside>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  update: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getCategoryName = (cat) => {
  if (cat === "feature") return "Новая функция";
  if (cat === "fix") return "Исправление";
  return "Важное объявление";
};

// Примерный расчёт времени чтения (≈ 220 слов в минуту)
const readTime = computed(() => {
  if (!props.update.content) return 2;
  const words = props.update.content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
});

// Простой рендер контента (можно заменить на marked/markdown-it позже)
const renderedContent = computed(() => {
  if (!props.update.content) return "";

  let text = props.update.content
    // Заголовки
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    // Жирный и курсив
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Списки
    .replace(/^\s*[-*+] (.*)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/g, "<ul>$1</ul>")
    // Абзацы
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");

  return `<p>${text}</p>`;
});
</script>

<style scoped>
.full-article {
  background: #f9fafb;
  padding-bottom: 6rem;
}

.hero {
  width: 100%;
  height: 480px;
  overflow: hidden;
  position: relative;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 4rem;
  padding-top: 3.5rem;
}

.main-content {
  grid-column: 1;
}

.sidebar {
  grid-column: 2;
  position: sticky;
  top: 2rem;
  align-self: start;
}

.sidebar-box {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.author-block {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.author-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-info {
  flex: 1;
}

.author-name {
  font-weight: 600;
  color: #111827;
}

.author-role {
  font-size: 0.9rem;
  color: #6b7280;
}

.meta-list {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.6rem 1.5rem;
  font-size: 0.95rem;
  color: #4b5563;
}

.meta-list dt {
  font-weight: 500;
  color: #374151;
}

.meta-top {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  color: #6b7280;
}

.category-badge {
  padding: 6px 16px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9rem;
}

.category-badge.feature {
  background: #10b981;
  color: white;
}
.category-badge.fix {
  background: #ef4444;
  color: white;
}
.category-badge.announcement {
  background: #8b5cf6;
  color: white;
}

.pub-date {
  font-weight: 500;
}

.read-time {
  color: #9ca3af;
}

.article-h1 {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.12;
  margin: 0 0 1.5rem;
  color: #111827;
  letter-spacing: -0.8px;
}

.lead-paragraph {
  font-size: 1.4rem;
  line-height: 1.65;
  color: #374151;
  margin: 0 0 2.5rem;
  font-weight: 400;
}

.prose {
  font-size: 1.18rem;
  line-height: 1.9;
  color: #1f2937;
}

.prose h2 {
  font-size: 2.1rem;
  margin: 3rem 0 1.2rem;
  font-weight: 700;
  color: #111827;
}

.prose h3 {
  font-size: 1.6rem;
  margin: 2.5rem 0 1rem;
  font-weight: 700;
  color: #111827;
}

.prose p {
  margin: 0 0 1.8rem;
}

.prose ul {
  margin: 0 0 1.8rem 1.5rem;
  list-style-type: disc;
}

.prose li {
  margin-bottom: 0.6rem;
}

.tags-section {
  margin: 4rem 0 5rem;
}

.tags-title {
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 1rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.tag-item {
  background: #e5e7eb;
  color: #374151;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.92rem;
}

.back-area {
  text-align: center;
  margin-top: 4rem;
}

.back-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 999px;
  font-size: 1.15rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
}

.back-button:hover {
  background: #2563eb;
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.25);
}

@media (max-width: 1024px) {
  .grid-layout {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  .sidebar {
    position: static;
  }
  .hero {
    height: 380px;
  }
  .article-h1 {
    font-size: 2.5rem;
  }
}

@media (max-width: 640px) {
  .hero {
    height: 300px;
  }
  .article-h1 {
    font-size: 2.1rem;
  }
  .container {
    padding: 0 1rem;
  }
}
</style>
