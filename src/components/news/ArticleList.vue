<template>
  <div class="news-page">
    <div v-if="loading" class="state-msg">Загрузка...</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>

    <template v-else-if="!selectedArticle">
      <!-- Шапка -->
      <header class="page-header">
        <div class="header-meta">
          <span class="header-label">Журнал обновлений</span>
          <span class="header-date">{{ todayFormatted }}</span>
        </div>
        <h1 class="page-title">Новости<br />и обновления</h1>
      </header>

      <div v-if="articles.length === 0" class="state-msg">Новостей пока нет</div>

      <template v-else>
        <!-- Featured -->
        <article class="featured" @click="selectedArticle = articles[0]">
          <div class="featured-image-wrap">
            <img
              v-if="articles[0].image"
              :src="articles[0].image"
              :alt="articles[0].title"
              class="featured-img"
            />
            <div v-else class="featured-img-placeholder" />
            <div class="featured-overlay" />
          </div>
          <div class="featured-content">
            <span class="badge" :class="articles[0].category">
              {{ getCategoryName(articles[0].category) }}
            </span>
            <h2 class="featured-title">{{ articles[0].title }}</h2>
            <p class="featured-desc">{{ articles[0].description }}</p>
            <div class="featured-footer">
              <time class="meta-time">
                {{ formatDate(articles[0].dt_published || articles[0].dt_ins) }}
              </time>
              <span class="read-more">Читать →</span>
            </div>
          </div>
        </article>

        <!-- Сетка -->
        <div v-if="articles.length > 1" class="grid-section">
          <div class="grid-label">Все материалы</div>
          <div class="articles-grid">
            <article
              v-for="(item, i) in articles.slice(1)"
              :key="item.id"
              class="card"
              @click="selectedArticle = item"
            >
              <div class="card-index">{{ String(i + 1).padStart(2, "0") }}</div>
              <div v-if="item.image" class="card-img-wrap">
                <img :src="item.image" :alt="item.title" class="card-img" />
              </div>
              <div class="card-body">
                <span class="badge sm" :class="item.category">
                  {{ getCategoryName(item.category) }}
                </span>
                <h3 class="card-title">{{ item.title }}</h3>
                <p class="card-desc">{{ item.description }}</p>
                <time class="meta-time">
                  {{ formatDate(item.dt_published || item.dt_ins) }}
                </time>
              </div>
            </article>
          </div>
        </div>
      </template>
    </template>

    <Article
      v-else
      :update="mapToArticleProps(selectedArticle)"
      @close="selectedArticle = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Article from "./Article.vue";
import { useArticles } from "@/composables/useArticles";

const { articles, loading, error, fetchArticles } = useArticles();
const selectedArticle = ref(null);

onMounted(async () => {
  await fetchArticles();
});

const todayFormatted = computed(() =>
  new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
);

const mapToArticleProps = (item) => ({
  ...item,
  date: item.dt_published || item.dt_ins,
});

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getCategoryName = (cat) => {
  const names = {
    feature: "Новая функция",
    fix: "Исправление",
    announcement: "Объявление",
    news: "Новость",
  };
  return names[cat] ?? "Новость";
};
</script>

<style scoped>
/* ── Base ── */
.news-page {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 2rem 6rem;
  color: #0a0a0a;
}

/* ── Header ── */
.page-header {
  padding: 3rem 0 2.5rem;
  border-bottom: 1px solid #0a0a0a;
  margin-bottom: 3rem;
}

.header-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6b7280;
}

.page-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.04em;
  margin: 0;
  color: #0a0a0a;
}

/* ── Badge ── */
.badge {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 3px;
}

.badge.feature      { background: #dcfce7; color: #15803d; }
.badge.fix          { background: #fee2e2; color: #b91c1c; }
.badge.announcement { background: #ede9fe; color: #6d28d9; }
.badge.news         { background: #e0e7ff; color: #3730a3; }

.badge.sm {
  font-size: 0.62rem;
  padding: 3px 8px;
}

/* ── Featured ── */
.featured {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 4rem;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: #0a0a0a;
}

.featured-image-wrap {
  position: absolute;
  inset: 0;
}

.featured-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.65;
  transition: opacity 0.4s, transform 0.6s;
}

.featured-img-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

.featured:hover .featured-img {
  opacity: 0.5;
  transform: scale(1.02);
}

.featured-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0,0,0,0.85) 0%,
    rgba(0,0,0,0.3) 50%,
    transparent 100%
  );
}

.featured-content {
  position: relative;
  padding: 2.5rem 3rem;
  color: #fff;
}

.featured-content .badge {
  margin-bottom: 1rem;
}

.featured-title {
  font-size: clamp(1.6rem, 3.5vw, 2.4rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.025em;
  margin: 0 0 0.75rem;
  max-width: 680px;
  color: #fff;
}

.featured-desc {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255,255,255,0.75);
  margin: 0 0 1.5rem;
  max-width: 520px;
}

.featured-footer {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.read-more {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.4);
  padding-bottom: 1px;
  transition: border-color 0.2s;
}

.featured:hover .read-more {
  border-color: #fff;
}

/* ── Grid section ── */
.grid-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 2rem;
}

.grid-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 1.75rem;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
}

/* ── Card ── */
.card {
  padding: 1.75rem 2rem 1.75rem 0;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  position: relative;
  transition: background 0.15s;
  display: flex;
  flex-direction: column;
}

.card:nth-child(3n) {
  border-right: none;
  padding-right: 0;
}

.card:nth-last-child(-n+3) {
  border-bottom: none;
}

.card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: transparent;
  transition: background 0.2s;
}

.card:hover::before  { background: #0a0a0a; }
.card:hover { background: #fafafa; }

.card:not(:nth-child(3n)) {
  padding-right: 2rem;
}

.card-index {
  font-size: 0.7rem;
  font-weight: 700;
  color: #cbd5e1;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.card-img-wrap {
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  border-radius: 3px;
  margin-bottom: 1rem;
  background: #f1f5f9;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.card:hover .card-img {
  transform: scale(1.04);
}

.card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.5rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.015em;
  margin: 0;
  color: #0a0a0a;
}

.card-desc {
  font-size: 0.85rem;
  line-height: 1.6;
  color: #64748b;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta-time {
  font-size: 0.75rem;
  color: #94a3b8;
  letter-spacing: 0.02em;
  margin-top: auto;
  padding-top: 0.75rem;
}

/* ── States ── */
.state-msg {
  text-align: center;
  padding: 5rem 1rem;
  color: #94a3b8;
  font-size: 1rem;
}

.state-msg.error { color: #ef4444; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .card:nth-child(3n) {
    border-right: 1px solid #e2e8f0;
    padding-right: 2rem;
  }
  .card:nth-child(2n) {
    border-right: none;
    padding-right: 0;
  }
  .card:nth-last-child(-n+2) {
    border-bottom: none;
  }
  .card:nth-last-child(-n+3) {
    border-bottom: 1px solid #e2e8f0;
  }
}

@media (max-width: 600px) {
  .news-page { padding: 0 1rem 4rem; }
  .articles-grid { grid-template-columns: 1fr; }
  .card {
    border-right: none !important;
    padding-right: 0 !important;
    border-bottom: 1px solid #e2e8f0 !important;
  }
  .card:last-child { border-bottom: none !important; }
  .featured { min-height: 360px; }
  .featured-content { padding: 1.5rem; }
}
</style>
