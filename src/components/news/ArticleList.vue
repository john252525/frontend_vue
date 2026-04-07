<template>
  <div class="news-page">
    <!-- Кнопка создания для admin -->
    <div v-if="isAdmin" class="admin-bar">
      <button class="create-btn" @click="openCreateForm">+ Новая статья</button>
    </div>

    <div v-if="loading" class="state-msg">Загрузка...</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>

    <!-- Сетка карточек -->
    <div v-else-if="!selectedArticle" class="articles-grid">
      <article
        v-for="item in articles"
        :key="item.id"
        class="update-card"
        @click="selectedArticle = item"
      >
        <div class="category-strip" :class="item.category"></div>

        <div class="card-content">
          <div v-if="item.image" class="card-image">
            <img :src="item.image" :alt="item.title" />
          </div>

          <div class="card-header">
            <span class="date">{{ formatDate(item.dt_published || item.dt_ins) }}</span>
            <span class="category-label" :class="item.category">
              {{ getCategoryName(item.category) }}
            </span>
          </div>

          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-text">{{ item.description }}</p>

          <!-- Кнопка редактирования для admin -->
          <div v-if="isAdmin" class="card-admin-actions" @click.stop>
            <button class="edit-btn" @click="openEditForm(item)">
              Редактировать
            </button>
          </div>
        </div>
      </article>

      <div v-if="articles.length === 0" class="state-msg">Новостей пока нет</div>
    </div>

    <!-- Полный просмотр статьи -->
    <Article
      v-else
      :update="mapToArticleProps(selectedArticle)"
      @close="selectedArticle = null"
    />

    <!-- Модальная форма (только admin) -->
    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal-box">
        <h2 class="modal-title">
          {{ editingArticle ? "Редактировать статью" : "Новая статья" }}
        </h2>

        <div v-if="formError" class="form-error">{{ formError }}</div>

        <form @submit.prevent="submitForm" class="article-form">
          <label class="form-label">
            Заголовок *
            <input v-model="form.title" class="form-input" required />
          </label>

          <label class="form-label">
            Краткое описание
            <input v-model="form.description" class="form-input" />
          </label>

          <label class="form-label">
            Содержание (Markdown) *
            <textarea
              v-model="form.content"
              class="form-textarea"
              rows="12"
              required
            ></textarea>
          </label>

          <label class="form-label">
            URL изображения
            <input v-model="form.image" class="form-input" placeholder="https://..." />
          </label>

          <label class="form-label">
            Категория
            <select v-model="form.category" class="form-select">
              <option value="news">Новость</option>
              <option value="feature">Новая функция</option>
              <option value="fix">Исправление</option>
              <option value="announcement">Объявление</option>
            </select>
          </label>

          <label class="checkbox-label">
            <input type="checkbox" v-model="form.publish" />
            Опубликовать сразу
          </label>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeForm">
              Отмена
            </button>
            <button type="submit" class="btn-submit" :disabled="formLoading">
              {{ formLoading ? "Сохранение..." : "Сохранить" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Article from "./Article.vue";
import { useArticles } from "@/composables/useArticles";
import { useAccountStore } from "@/stores/accountStore";

const accountStore = useAccountStore();

const {
  articles,
  loading,
  error,
  isAdmin,
  checkAdminAccess,
  fetchArticles,
  fetchAllArticles,
  addArticle,
  editArticle,
} = useArticles();

const selectedArticle = ref(null);
const showForm = ref(false);
const editingArticle = ref(null);
const formLoading = ref(false);
const formError = ref(null);

const defaultForm = () => ({
  title: "",
  description: "",
  content: "",
  image: "",
  category: "news",
  publish: false,
});

const form = ref(defaultForm());

onMounted(async () => {
  checkAdminAccess();
  await fetchArticles();
});

// Маппинг полей API → пропсы Article.vue
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

const openCreateForm = () => {
  editingArticle.value = null;
  form.value = defaultForm();
  formError.value = null;
  showForm.value = true;
};

const openEditForm = (item) => {
  editingArticle.value = item;
  form.value = {
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    image: item.image ?? "",
    category: item.category ?? "news",
    publish: item.status === "published",
  };
  formError.value = null;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingArticle.value = null;
};

const submitForm = async () => {
  formLoading.value = true;
  formError.value = null;
  try {
    if (editingArticle.value) {
      await editArticle(editingArticle.value.id, form.value);
    } else {
      await addArticle(form.value);
    }
    closeForm();
    await fetchArticles();
  } catch (err) {
    formError.value = err.message;
  } finally {
    formLoading.value = false;
  }
};
</script>

<style scoped>
.admin-bar {
  display: flex;
  justify-content: flex-end;
  padding: 0 1rem 1.25rem;
}

.create-btn {
  background: oklch(0.541 0.198 267);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.create-btn:hover {
  background: #565cc8;
}

.state-msg {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
  font-size: 1rem;
}

.state-msg.error {
  color: #ef4444;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
  gap: 2rem 2.5rem;
  padding: 0 1rem;
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

/* Карточка */
.update-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
  cursor: pointer;
  position: relative;
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

.category-strip.feature { background: #10b981; }
.category-strip.fix { background: #ef4444; }
.category-strip.announcement { background: #8b5cf6; }
.category-strip.news { background: oklch(0.541 0.198 267); }

.card-content {
  padding: 1.75rem 2rem;
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

.category-label.feature { background: #d1fae5; color: #065f46; }
.category-label.fix { background: #fee2e2; color: #991b1b; }
.category-label.announcement { background: #f3e8ff; color: #6b21a8; }
.category-label.news { background: rgba(84, 92, 200, 0.12); color: oklch(0.541 0.198 267); }

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

.card-admin-actions {
  margin-top: 0.75rem;
}

.edit-btn {
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-box {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.5rem;
}

.form-error {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.article-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #111827;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  border-color: oklch(0.541 0.198 267);
}

.form-textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: "Courier New", monospace;
  color: #111827;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  border-color: oklch(0.541 0.198 267);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #374151;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: oklch(0.541 0.198 267);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #565cc8;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
