<template>
  <div class="loader-container">
    <div class="card">
      <div class="header">
        <h2>Проверка аккаунтов</h2>
        <div class="progress-indicator">
          <span v-if="!completed">{{ currentStatus }}</span>
          <span v-else class="completed">Готово!</span>
        </div>
      </div>

      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progress + '%' }"
          :class="{ pulse: !completed }"
        ></div>
      </div>

      <div class="source-progress">
        <div class="source" :class="{ active: loading.telegram }">
          <span>Telegram</span>
          <span class="checkmark" v-if="telegramCompleted">✓</span>
        </div>
        <div class="source" :class="{ active: loading.whatsapp }">
          <span>WhatsApp</span>
          <span class="checkmark" v-if="whatsappCompleted">✓</span>
        </div>
      </div>

      <div class="stats" v-if="premiumAccounts.length > 0">
        <div class="stat-item">
          <span class="stat-value">{{ premiumAccounts.length }}</span>
          <span class="stat-label">аккаунтов с step 5</span>
        </div>
      </div>

      <div class="account-list" v-if="completed && premiumAccounts.length > 0">
        <div
          class="account-item"
          v-for="(account, index) in premiumAccounts"
          :key="index"
        >
          <span class="account-login">{{ account.login }}</span>
          <span class="account-source" :class="account.source">{{
            account.source
          }}</span>
        </div>
      </div>

      <button class="refresh-btn" @click="processAllAccounts" v-if="completed">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C15.76 2 19 4.01 20.8 7.14M20.8 7.14V2M20.8 7.14H15.66"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Обновить данные
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

const loading = ref({
  telegram: false,
  whatsapp: false,
});
const completed = ref(false);
const telegramCompleted = ref(false);
const whatsappCompleted = ref(false);
const currentStatus = ref("Загрузка общих чатов...");
const telegramAccounts = ref([]);
const whatsappAccounts = ref([]);
const premiumAccounts = ref([]);

const progress = computed(() => {
  if (completed.value) return 100;
  if (loading.value.whatsapp) return 66;
  if (loading.value.telegram) return 33;
  return 0;
});

const getAccountInfo = async (source, login) => {
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getInfo",
      {
        source: source,
        login: login,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Ошибка при запросе ${login}:`, error);
    return null;
  }
};

const fetchAccounts = async (source) => {
  try {
    loading.value[source] = true;
    currentStatus.value = `Загрузка ${source} аккаунтов...`;

    const response = await axios.post(
      "https://b2288.apitter.com/instances/getInfoByToken",
      {
        source: source,
        skipDetails: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    return response.data.data.instances || [];
  } catch (error) {
    console.error(`Ошибка при получении ${source} аккаунтов:`, error);
    return [];
  } finally {
    loading.value[source] = false;
    if (source === "telegram") telegramCompleted.value = true;
    if (source === "whatsapp") whatsappCompleted.value = true;
  }
};

const saveToLocalStorage = (accounts) => {
  const dataToSave = accounts.map((account) => ({
    login: account.login,
    source: account.source,
  }));

  localStorage.setItem("loginWhatsAppChatsStep", JSON.stringify(dataToSave));
  console.log("Данные сохранены в localStorage:", dataToSave);
};

const processAllAccounts = async () => {
  try {
    // Сброс состояния
    completed.value = false;
    telegramCompleted.value = false;
    whatsappCompleted.value = false;
    premiumAccounts.value = [];
    currentStatus.value = "Загрузка общих чатов...";

    const resultAccounts = [];

    // Обработка Telegram
    const telegramAccounts = await fetchAccounts("telegram");
    for (const account of telegramAccounts) {
      currentStatus.value = `Проверка Telegram: ${account.login}`;
      const info = await getAccountInfo("telegram", account.login);
      if (info?.data?.step?.value === 5) {
        resultAccounts.push({
          login: account.login,
          source: "telegram",
        });
      }
    }

    // Обработка WhatsApp
    const whatsappAccounts = await fetchAccounts("whatsapp");
    for (const account of whatsappAccounts) {
      currentStatus.value = `Проверка WhatsApp: ${account.login}`;
      const info = await getAccountInfo("whatsapp", account.login);
      if (info?.data?.step?.value === 5) {
        resultAccounts.push({
          login: account.login,
          source: "whatsapp",
        });
      }
    }

    // Сохраняем результат
    premiumAccounts.value = resultAccounts;
    if (resultAccounts.length > 0) {
      saveToLocalStorage(resultAccounts);
    } else {
      localStorage.removeItem("loginWhatsAppChatsStep");
    }

    completed.value = true;
    currentStatus.value = "Проверка завершена";
  } catch (error) {
    console.error("Ошибка в основном потоке:", error);
    currentStatus.value = "Ошибка при проверке";
  }
};

onMounted(() => {
  processAllAccounts();
});
</script>

<style scoped>
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 32px;
  width: 100%;
  max-width: 500px;
  transition: all 0.3s ease;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.progress-indicator {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.progress-indicator .completed {
  color: #27ae60;
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  margin-bottom: 32px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-fill.pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

.source-progress {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.source {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
  text-align: center;
  font-weight: 500;
  color: #95a5a6;
  position: relative;
  transition: all 0.3s ease;
}

.source.active {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.source .checkmark {
  position: absolute;
  right: 8px;
  top: 8px;
  color: #27ae60;
  font-weight: bold;
}

.stats {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.stat-item {
  text-align: center;
  padding: 12px 24px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  display: block;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.account-list {
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.account-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.account-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.account-login {
  font-weight: 500;
  color: #2c3e50;
}

.account-source {
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.account-source.telegram {
  background: rgba(0, 136, 204, 0.1);
  color: #0088cc;
}

.account-source.whatsapp {
  background: rgba(37, 211, 102, 0.1);
  color: #25d366;
}

.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-top: 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.refresh-btn:active {
  transform: translateY(0);
}

/* Анимации */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
