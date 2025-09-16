<template>
  <div class="layout">
    <div class="content">
      <!-- Состояние загрузки -->
      <div v-if="loading" class="state-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Загрузка чата...</p>
      </div>

      <!-- Состояние ошибки -->
      <div v-else-if="error" class="state-container error-container">
        <div class="error-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <h2 class="error-title">Ошибка загрузки чата</h2>
        <p class="error-message">{{ error }}</p>
        <button @click="fetchChatUrl" class="retry-btn">
          <span>Попробовать снова</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <!-- Состояние отсутствия данных -->
      <div v-else-if="dataError" class="state-container data-error-container">
        <div class="data-error-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 15V15.01M12 12C12.216 12 12.422 11.914 12.576 11.762C12.73 11.61 12.816 11.406 12.816 11.192C12.816 10.978 12.73 10.774 12.576 10.622C12.422 10.47 12.216 10.384 12 10.384C11.784 10.384 11.578 10.47 11.424 10.622C11.27 10.774 11.184 10.978 11.184 11.192C11.184 11.406 11.27 11.61 11.424 11.762C11.578 11.914 11.784 12 12 12ZM21 12C21 16.971 16.971 21 12 21C7.029 21 3 16.971 3 12C3 7.029 7.029 3 12 3C16.971 3 21 7.029 21 12Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <h2 class="data-error-title">Недостаточно данных</h2>
        <p class="data-error-message">Для загрузки чата нет нужных данных</p>
      </div>

      <iframe
        v-else-if="chatUrl"
        :src="chatUrl"
        frameborder="0"
        class="chat-iframe"
        @load="handleIframeLoad"
        title="Чат"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";

const dataError = ref(false);
const loading = ref(true);
const error = ref(null);
const chatUrl = ref(null);

const route = useRoute();
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const fetchChatUrl = async () => {
  try {
    loading.value = true;
    error.value = null;
    dataError.value = false;

    if (!route.query?.login || !route.query?.uuid) {
      dataError.value = true;
      loading.value = false;
      return;
    }

    const response = await axios.post(
      "https://chats.apitter.com/account/get-url",
      {
        login: route.query?.login,
        source: route.query?.source,
        storage: route.query?.storage,
        type: route.query?.type,
        uuid: route.query?.uuid,
      },
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { data } = response;

    if (data.ok && data.data?.chats_url) {
      chatUrl.value = data.data.chats_url;
    } else {
      throw new Error(data.message || "Не удалось получить URL чата");
    }
  } catch (err) {
    if (err.response) {
      error.value =
        err.response.data?.message || `Ошибка сервера: ${err.response.status}`;
    } else if (err.request) {
      error.value = "Не удалось подключиться к серверу";
    } else {
      error.value = err.message || "Произошла ошибка";
    }
    console.error("Ошибка при получении URL чата:", err);
  } finally {
    loading.value = false;
  }
};

const handleIframeLoad = () => {
  console.log("Чат загружен");
};

onMounted(() => {
  fetchChatUrl();
});
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.content {
  flex-grow: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* Общие стили для контейнеров состояний */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
  width: 100%;
}

/* Стили для загрузки */
.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #e0e0e0;
  border-top: 3px solid #5a4fc1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  font-size: 1.1rem;
  color: #666;
  font-weight: 500;
}

/* Стили для ошибки */
.error-container {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.error-icon {
  color: #ff4757;
  margin-bottom: 1rem;
}

.error-title {
  color: #2d3436;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #636e72;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

/* Стили для ошибки данных */
.data-error-container {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.data-error-icon {
  color: #fdcb6e;
  margin-bottom: 1rem;
}

.data-error-title {
  color: #2d3436;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.data-error-message {
  color: #636e72;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Стили для кнопки */
.retry-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px 24px;
  background-color: #5a4fc1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(90, 79, 193, 0.3);
}

.retry-btn:hover {
  background-color: #4a3fb0;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(90, 79, 193, 0.4);
}

.retry-btn:active {
  transform: translateY(0);
}

/* Анимации */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .layout {
    padding: 1rem;
  }

  .state-container {
    padding: 1.5rem;
    margin: 1rem;
  }

  .error-container,
  .data-error-container {
    padding: 2rem 1.5rem;
  }

  .error-title,
  .data-error-title {
    font-size: 1.3rem;
  }

  .chat-iframe {
    border-radius: 8px;
  }
}

@media (max-width: 480px) {
  .loading-spinner {
    width: 40px;
    height: 40px;
  }

  .error-icon svg,
  .data-error-icon svg {
    width: 40px;
    height: 40px;
  }

  .retry-btn {
    padding: 10px 20px;
    font-size: 0.9rem;
  }

  .state-container {
    padding: 1rem;
  }
}
</style>
