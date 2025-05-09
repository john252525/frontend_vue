// src/composables/useFrontendLogger.js
import { ref } from "vue";
import axios from "axios";

export default function useFrontendLogger() {
  const message = ref(null);
  const error = ref(null);
  const isLoading = ref(false);

  const sendLog = async (
    location,
    method,
    params = {},
    results = {},
    answer = ""
  ) => {
    // Ничего не делаем
    return;
  };

  return {
    message,
    error,
    isLoading,
    sendLog,
  };
}
