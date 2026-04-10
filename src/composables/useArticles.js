import { ref, computed } from "vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";

const ARTICLES_URL = `${import.meta.env.VITE_BASE_URL}articles/`;
const ADMIN_EMAIL = import.meta.env.VITE_NEWS_ADMIN_EMAIL;
const ADMIN_TOKEN = import.meta.env.VITE_NEWS_ADMIN_TOKEN;

export function useArticles() {
  const accountStore = useAccountStore();
  const token = computed(() => accountStore.getAccountToken);

  const articles = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const paginator = ref(null);
  const isAdmin = ref(false);

  const authHeaders = computed(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token.value}`,
  }));

  const adminHeaders = {
    "Content-Type": "application/json",
    "X-Api-Key": ADMIN_TOKEN,
  };

  // Проверяем доступ по email пользователя
  const checkAdminAccess = () => {
    const email = accountStore.accountData;
    isAdmin.value = email === ADMIN_EMAIL;
  };

  // Публичные статьи (для всех пользователей)
  const fetchArticles = async ({ page = 1, perPage = 20, sinceDate } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const params = { page, per_page: perPage };
      if (sinceDate) params.since_date = sinceDate;

      const response = await axios.get(`${ARTICLES_URL}getPublished`, {
        headers: authHeaders.value,
        params,
      });

      const data = response.data.data;
      articles.value = data.data;
      paginator.value = data.paginator;
    } catch (err) {
      error.value = err.response?.data?.message || "Ошибка загрузки новостей";
    } finally {
      loading.value = false;
    }
  };

  // Все статьи включая черновики (только admin)
  const fetchAllArticles = async ({
    page = 1,
    perPage = 20,
    status,
    authorId,
  } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const params = { page, per_page: perPage };
      if (status) params.status = status;
      if (authorId) params.author_id = authorId;

      const response = await axios.get(`${ARTICLES_URL}getAll`, {
        headers: adminHeaders,
        params,
      });

      const data = response.data.data;
      articles.value = data.data;
      paginator.value = data.paginator;
    } catch (err) {
      error.value = err.response?.data?.message || "Ошибка загрузки статей";
    } finally {
      loading.value = false;
    }
  };

  // Создать статью (только admin)
  const addArticle = async (data) => {
    const response = await axios.post(`${ARTICLES_URL}addArticle`, data, {
      headers: adminHeaders,
    });
    return response.data;
  };

  // Редактировать статью (только admin)
  const editArticle = async (id, data) => {
    const response = await axios.post(
      `${ARTICLES_URL}editArticle/${id}`,
      data,
      { headers: adminHeaders },
    );
    return response.data;
  };

  // Получить статью по ID (только admin)
  const getArticleById = async (id) => {
    const response = await axios.get(`${ARTICLES_URL}getById/${id}`, {
      headers: adminHeaders,
    });
    return response.data.data;
  };

  // Неопубликованные статьи — черновики (только admin)
  const fetchNotPublished = async ({ page = 1, perPage = 20 } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get(`${ARTICLES_URL}getNotPublished`, {
        headers: adminHeaders,
        params: { page, per_page: perPage },
      });
      const data = response.data.data;
      articles.value = Array.isArray(data) ? data : data.data ?? [];
      paginator.value = response.data.paginator ?? null;
    } catch (err) {
      error.value = err.response?.data?.message || "Ошибка загрузки черновиков";
    } finally {
      loading.value = false;
    }
  };

  return {
    articles,
    loading,
    error,
    paginator,
    isAdmin,
    checkAdminAccess,
    fetchArticles,
    fetchAllArticles,
    addArticle,
    editArticle,
    getArticleById,
    fetchNotPublished,
  };
}
