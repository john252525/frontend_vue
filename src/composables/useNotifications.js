import { ref, computed } from "vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";

const NOTIFICATIONS_URL = `${import.meta.env.VITE_BASE_URL}notifications/`;

export function useNotifications() {
  const accountStore = useAccountStore();
  const token = computed(() => accountStore.getAccountToken);

  const unreadNotifications = ref([]);
  const unreadCount = ref(0);
  const loading = ref(false);
  const error = ref(null);

  const authHeaders = computed(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token.value}`,
  }));

  // Непрочитанные уведомления (без пагинации, макс. 1000)
  const fetchUnread = async ({ sinceDate, full = false, userId } = {}) => {
    error.value = null;
    try {
      const params = {};
      if (sinceDate) params.since_date = sinceDate;
      if (full) params.full = true;
      if (userId) params.user_id = userId;

      const response = await axios.get(`${NOTIFICATIONS_URL}getNotRead`, {
        headers: authHeaders.value,
        params,
      });

      const data = response.data.data;
      unreadNotifications.value = data.notifications;
      unreadCount.value = data.total;
    } catch (err) {
      error.value = err.response?.data?.message || "Ошибка загрузки непрочитанных";
    }
  };

  // Конкретное уведомление по type + item_id
  const fetchNotificationItem = async ({ type, itemId, full = false, userId } = {}) => {
    error.value = null;
    try {
      const params = { type, item_id: itemId };
      if (full) params.full = true;
      if (userId) params.user_id = userId;

      const response = await axios.get(`${NOTIFICATIONS_URL}getNotificationItem`, {
        headers: authHeaders.value,
        params,
      });

      return response.data.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Ошибка загрузки уведомления";
      return null;
    }
  };

  // Отметить уведомление как прочитанное
  const markAsRead = async (id, userId) => {
    error.value = null;
    try {
      const params = {};
      if (userId) params.user_id = userId;

      await axios.post(
        `${NOTIFICATIONS_URL}markAsRead/${id}`,
        {},
        { headers: authHeaders.value, params },
      );

      // Обновляем локальное состояние
      unreadNotifications.value = unreadNotifications.value.filter(
        (n) => n.id !== String(id),
      );
      unreadCount.value = Math.max(0, unreadCount.value - 1);

      const item = notifications.value.find((n) => n.id === String(id));
      if (item) item.is_read = "1";
    } catch (err) {
      error.value = err.response?.data?.message || "Ошибка при отметке как прочитанное";
    }
  };

  return {
    unreadNotifications,
    unreadCount,
    loading,
    error,
    fetchUnread,
    fetchNotificationItem,
    markAsRead,
  };
}
