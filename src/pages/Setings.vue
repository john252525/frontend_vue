<template>
  <div class="text-editor">
    <div v-if="!isAuthenticated" class="auth-message">
      <p>Для работы с редактором необходимо авторизоваться</p>
      <button @click="redirectToLogin">Войти</button>
    </div>

    <template v-else>
      <textarea
        v-model="textContent"
        placeholder="Загрузка текста..."
        :style="textareaStyle"
        :disabled="!isReady"
      ></textarea>
      <button @click="saveText" :disabled="isLoading || !isReady">
        {{ isLoading ? "Сохранение..." : "Сохранить" }}
      </button>
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("Ошибка при парсинге JSON:", err);
    // Optionally, update the error message ref
  }
};

const router = useRouter();

// Реактивные переменные
const textContent = ref("");
const isLoading = ref(false);
const isReady = ref(false);
const message = ref("");
const messageType = ref("");
const userId = ref(null);
const isAuthenticated = ref(false);
const windowWidth = ref(window.innerWidth);

// Проверяем авторизацию при инициализации
const checkAuth = () => {
  const token = localStorage.getItem("accountToken"); // Исправлено: "acconutToken" → "accountToken"
  isAuthenticated.value = !!token;
  return token;
};

// Вычисляем стили для textarea
const textareaStyle = computed(() => ({
  minHeight: windowWidth.value < 400 ? "200px" : "300px",
  minWidth: windowWidth.value < 400 ? "100%" : "600px",
}));

// Обновляем ширину окна при ресайзе
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

// Методы
const getUserIdByToken = async (token) => {
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getUserUuid",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data) {
      await handleSendLog(
        "settings",
        "getUserUuid",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        response.data.ok,
        response.data
      );
    }

    userId.value = response.data.uuid;
    return response.data.uuid;
  } catch (error) {
    console.error("Ошибка при получении UUID:", error);
    throw error;
  }
};

const initialize = async () => {
  try {
    const token = checkAuth();
    if (!token) {
      showMessage("Требуется авторизация", "error");
      return;
    }

    await getUserIdByToken(token);
    isReady.value = true;
    loadText();
  } catch (error) {
    showMessage("Ошибка инициализации: " + error.message, "error");
    console.error("Ошибка инициализации:", error);
  }
};

const loadText = async () => {
  if (!isReady.value) return;

  isLoading.value = true;
  try {
    const response = await axios.get(
      `https://indiparser.apitter.com/indiparser.php?token=i&user_id=${userId.value}`
    );
    textContent.value = response.data.components[0]?.value || "";

    if (response.data) {
      await handleSendLog(
        "settings",
        "https://indiparser.apitter.com/inb",
        "https://indiparser.apitter.com/indiparser.php?token=i&user_id=${userId.value}",
        response.data,
        response.data
      );
    }
  } catch (error) {
    showMessage("Ошибка при загрузке текста", "error");
    console.error("Ошибка загрузки:", error);
  } finally {
    isLoading.value = false;
  }
};

const saveText = async () => {
  if (isLoading.value || !isReady.value) return;

  isLoading.value = true;
  try {
    await axios.post(
      `https://indiparser.apitter.com/indiparser.php?token=i&user_id=${userId.value}`,
      { text: textContent.value }
    );

    if (response.data) {
      await handleSendLog(
        "settings",
        "https://indiparser.apitter.com/indiparser.php?token=i&user_id=${userId.value}",
        "text: textContent.value",
        response.data,
        response.data
      );
    }

    showMessage("Текст успешно сохранен", "success");
  } catch (error) {
    showMessage(error.message, "error");
    console.error("Ошибка сохранения:", error);
  } finally {
    isLoading.value = false;
  }
};

const showMessage = (text, type) => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = "";
    messageType.value = "";
  }, 3000);
};

const redirectToLogin = () => {
  router.push("/login");
};

// Хуки жизненного цикла
onMounted(async () => {
  window.addEventListener("resize", updateWindowWidth);
  await initialize();
});

onUnmounted(() => {
  window.removeEventListener("resize", updateWindowWidth);
});
</script>

<style scoped>
.text-editor {
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 10px;
  box-sizing: border-box;
  width: calc(100% - 20px);
  max-width: 100%;
}

textarea {
  width: 100%;
  height: 100%;
  min-height: 200px;
  max-height: 75vh;
  min-width: 100%;
  padding: 12px;
  font-size: 14px;
  line-height: 1.4;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  resize: vertical;
  overflow: auto;
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

button {
  margin-top: 12px;
  padding: 8px 16px;
  background: oklch(0.541 0.198 267);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  width: 100%;
  max-width: 200px;
  align-self: center;
}

button:hover {
  background-color: #2742d9;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.message {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
}

.success {
  background-color: #dff0d8;
  color: #3c763d;
}

.error {
  background-color: #f2dede;
  color: #a94442;
}

/* Адаптация для очень маленьких экранов (300-400px) */
@media (max-width: 400px) {
  .text-editor {
    margin: 8px;
    width: calc(100% - 16px);
  }

  textarea {
    padding: 10px;
    font-size: 13px;
    min-height: 180px;
  }

  button {
    padding: 7px 14px;
    font-size: 13px;
    max-width: 100%;
  }
}

/* Адаптация для средних экранов (400-600px) */
@media (min-width: 401px) and (max-width: 600px) {
  textarea {
    min-height: 250px;
    font-size: 15px;
  }
}

/* Адаптация для широких экранов */
@media (min-width: 1600px) {
  .text-editor {
    max-width: 1600px;
    margin: 20px auto;
  }
}
</style>
