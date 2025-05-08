// src/composables/useFrontendLogger.js
import { ref } from "vue";
import axios from "axios";

export default function useFrontendLogger() {
  const message = ref(null);
  const error = ref(null);
  const isLoading = ref(false); // Флаг для отображения индикатора загрузки

  const sendLog = async (
    location,
    method,
    params = {},
    results = {},
    answer = ""
  ) => {
    isLoading.value = true; // Устанавливаем isLoading в true перед отправкой запроса
    message.value = null; // Очищаем message
    error.value = null; // Очищаем error
    try {
      const response = await axios.post("http://localhost:4000/api/new_log", {
        location,
        method,
        params,
        results,
        answer,
      });

      message.value = response.data.message;
      error.value = null;
    } catch (err) {
      console.error("error", err);
      error.value = err.response ? err.response.data.error : err.message;
      message.value = null;
    } finally {
      isLoading.value = false; // Устанавливаем isLoading в false после завершения запроса
    }
  };

  return {
    message,
    error,
    isLoading, // Возвращаем isLoading
    sendLog,
  };
}
