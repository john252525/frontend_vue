<template>
  <div class="news-page">
    <div v-if="loading" class="state-msg">Загрузка...</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>

    <template v-else-if="!selectedArticle">
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
              v-for="item in articles.slice(1)"
              :key="item.id"
              class="card"
              @click="selectedArticle = item"
            >
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
import { ref, onMounted } from "vue";
import Article from "./Article.vue";
import { useArticles } from "@/composables/useArticles";

const { articles, loading, error, fetchArticles } = useArticles();
const selectedArticle = ref(null);

onMounted(async () => {
  await fetchArticles();
});

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
.news-page {
  padding: 0 18px 4rem;
}

/* ── States ── */
.state-msg {
  text-align: center;
  padding: 4rem 1rem;
  color: #94a3b8;
  font-size: 1rem;
}
.state-msg.error { color: #ef4444; }

/* ── Badge ── */
.badge {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 3px;
  white-space: nowrap;
}
.badge.feature      { background: #dcfce7; color: #15803d; }
.badge.fix          { background: #fee2e2; color: #b91c1c; }
.badge.announcement { background: #ede9fe; color: #6d28d9; }
.badge.news         { background: #e0e7ff; color: #3730a3; }
.badge.sm { font-size: 0.62rem; padding: 2px 7px; }

/* ── Featured ── */
.featured {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 2.5rem;
  min-height: 440px;
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
    rgba(0,0,0,0.88) 0%,
    rgba(0,0,0,0.25) 55%,
    transparent 100%
  );
}

.featured-content {
  position: relative;
  padding: 2rem 2.5rem;
  color: #fff;
}

.featured-content .badge {
  margin-bottom: 0.8rem;
}

.featured-title {
  font-size: clamp(1.4rem, 3vw, 2.1rem);
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: -0.025em;
  margin: 0 0 0.6rem;
  max-width: 640px;
  color: #fff;
}

.featured-desc {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255,255,255,0.72);
  margin: 0 0 1.25rem;
  max-width: 500px;
}

.featured-footer {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.read-more {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.35);
  padding-bottom: 1px;
  transition: border-color 0.2s;
}

.featured:hover .read-more {
  border-color: #fff;
}

/* ── Grid ── */
.grid-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
}

.grid-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 1.25rem;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* ── Card ── */
.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.18s, transform 0.18s;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
  transform: translateY(-2px);
}

.card-img-wrap {
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: #f1f5f9;
  flex-shrink: 0;
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
  padding: 1.1rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex: 1;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.01em;
  margin: 0;
  color: #0f172a;
}

.card-desc {
  font-size: 0.82rem;
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
  font-size: 0.72rem;
  color: #94a3b8;
  letter-spacing: 0.02em;
  margin-top: auto;
  padding-top: 0.5rem;
}

/* ── Responsive ── */
@media (max-width: 860px) {
  .articles-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 560px) {
  .news-page { padding: 0 12px 3rem; }
  .articles-grid { grid-template-columns: 1fr; }
  .featured { min-height: 320px; }
  .featured-content { padding: 1.5rem; }
}
</style>
