<template>
  <div class="news-page">
    <div class="content-wrapper">
      <div v-if="!selectedUpdate" class="articles-grid">
        <article
          v-for="item in sortedUpdates"
          :key="item.id"
          class="update-card"
          @click="selectedUpdate = item"
        >
          <div class="category-strip" :class="item.category"></div>

          <div class="card-content">
            <div v-if="item.image" class="card-image">
              <img :src="item.image" :alt="item.title" />
            </div>

            <div class="card-header">
              <span class="date">{{ formatDate(item.date) }}</span>
              <span class="category-label" :class="item.category">
                {{ getCategoryName(item.category) }}
              </span>
            </div>

            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-text">{{ item.description }}</p>

            <div v-if="item.link" class="card-footer">
              <a :href="item.link" class="read-more" @click.stop>
                Подробнее →
              </a>
            </div>
          </div>
        </article>
      </div>

      <div v-if="selectedUpdate" class="full-article-view">
        <button class="close-article" @click="selectedUpdate = null">
          ← Назад к списку
        </button>

        <article class="full-article">
          <div v-if="selectedUpdate.image" class="hero-image">
            <img :src="selectedUpdate.image" :alt="selectedUpdate.title" />
          </div>

          <div class="article-container">
            <div class="meta">
              <span class="category-badge" :class="selectedUpdate.category">
                {{ getCategoryName(selectedUpdate.category) }}
              </span>
              <time>{{ formatDate(selectedUpdate.date) }}</time>
            </div>

            <h1 class="article-title">{{ selectedUpdate.title }}</h1>

            <p v-if="selectedUpdate.lead" class="lead">
              {{ selectedUpdate.lead }}
            </p>

            <div class="article-content">
              <p
                v-for="(paragraph, i) in selectedUpdate.content.split('\n\n')"
                :key="i"
              >
                {{ paragraph }}
              </p>
            </div>

            <div v-if="selectedUpdate.tags?.length" class="tags">
              <span v-for="tag in selectedUpdate.tags" :key="tag" class="tag">
                #{{ tag }}
              </span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const selectedUpdate = ref(null);

const updates = [
  {
    id: 1,
    date: "2026-03-17",
    title: "Запущена новая система рекомендаций",
    lead: "Мы полностью переработали алгоритм рекомендаций — теперь он учитывает не только просмотры, но и время взаимодействия, лайки, скрытия и даже скорость скролла.",
    description: "Краткое описание для карточки…",
    content: `
Это одно из самых масштабных обновлений за последние полгода.

**Что изменилось:**
- Алгоритм теперь смотрит на 14 разных сигналов вместо прежних 4
- Появилась персональная «температура интереса» к темам
- Рекомендации обновляются каждые 15 минут вместо 1 раза в сутки

**Результаты первых тестов (A/B 50/50):**
- Время сессии +28%
- Глубина просмотра +41%
- CTR на карточки рекомендаций +19%

Мы продолжаем собирать обратную связь — пишите в чат, если что-то кажется странным или наоборот очень крутым.
    `,
    category: "feature",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200",
    tags: ["рекомендации", "ai", "персонализация", "алгоритмы"],
    author: {
      name: "Алексей Иванов",
      role: "Lead ML Engineer",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
  },
  {
    id: 1,
    date: "2026-03-17",
    title: "Запущена новая система рекомендаций",
    lead: "Мы полностью переработали алгоритм рекомендаций — теперь он учитывает не только просмотры, но и время взаимодействия, лайки, скрытия и даже скорость скролла.",
    description: "Краткое описание для карточки…",
    content: `
Это одно из самых масштабных обновлений за последние полгода.

**Что изменилось:**
- Алгоритм теперь смотрит на 14 разных сигналов вместо прежних 4
- Появилась персональная «температура интереса» к темам
- Рекомендации обновляются каждые 15 минут вместо 1 раза в сутки

**Результаты первых тестов (A/B 50/50):**
- Время сессии +28%
- Глубина просмотра +41%
- CTR на карточки рекомендаций +19%

Мы продолжаем собирать обратную связь — пишите в чат, если что-то кажется странным или наоборот очень крутым.
    `,
    category: "feature",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200",
    tags: ["рекомендации", "ai", "персонализация", "алгоритмы"],
  },
];

const sortedUpdates = computed(() =>
  [...updates].sort((a, b) => new Date(b.date) - new Date(a.date)),
);

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
  return "Объявление";
};
</script>

<style scoped>
.content-wrapper {
  margin: 0 auto;
  padding: 1rem;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
  gap: 2rem 2.5rem;
}

@media (min-width: 1200px) {
  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

/* === Карточка новости === */
.update-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
  cursor: pointer;
}

.update-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);
}

.category-strip {
  width: 6px;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
}

.card-content {
  padding: 1.75rem 2rem;
  position: relative;
}

.card-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  margin-bottom: 1.25rem;
  border-radius: 8px;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #64748b;
}

.category-label {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.category-label.feature {
  background: #d1fae5;
  color: #065f46;
}
.category-label.fix {
  background: #fee2e2;
  color: #991b1b;
}
.category-label.announcement {
  background: #f3e8ff;
  color: #6b21a8;
}

.card-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  line-height: 1.35;
  color: #111827;
}

.card-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 1rem;
}

.read-more {
  color: #3b82f6;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.95rem;
}

.read-more:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* === Полная статья === */
.full-article-view {
  padding: 2rem 1rem;
}

.close-article {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero-image {
  width: 100%;
  height: 380px;
  overflow: hidden;
  border-radius: 16px;
  margin-bottom: 2rem;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-container {
  max-width: 900px;
  margin: 0 auto;
}

.meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  color: #64748b;
  font-size: 0.95rem;
}

.category-badge {
  padding: 6px 16px;
  border-radius: 999px;
  font-weight: 600;
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

.article-title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 1.5rem;
  color: #111827;
}

.lead {
  font-size: 1.35rem;
  line-height: 1.65;
  color: #374151;
  margin: 0 0 2.5rem;
  font-weight: 400;
}

.article-content {
  font-size: 1.15rem;
  line-height: 1.85;
  color: #1f2937;
}

.article-content p {
  margin-bottom: 1.6rem;
}

.tags {
  margin-top: 3rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.tag {
  background: #e5e7eb;
  color: #374151;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .article-title {
    font-size: 2rem;
  }
  .hero-image {
    height: 260px;
  }
}
</style>
