<template>
  <div class="simple-accounts-container">
    <!-- Заголовок -->

    <!-- Состояние загрузки (всегда показываем, если идет загрузка) -->
    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
      <p>Загрузка аккаунтов...</p>
    </div>

    <!-- Состояние ошибки -->
    <div v-if="error" class="error">
      <p>Ошибка: {{ error }}</p>
      <button @click="fetchAccounts" class="retry-button">Повторить</button>
    </div>

    <!-- Список аккаунтов (показываем даже во время загрузки, если есть найденные аккаунты) -->
    <div v-if="filteredAccounts.length > 0" class="accounts-section">
      <h2 class="accounts-subtitle">Доступные аккаунты</h2>
      <div class="accounts-grid">
        <div
          v-for="account in filteredAccounts"
          :key="account.uuid || account.id"
          class="account-card"
        >
          <div class="account-cover">
            <div class="account-avatar">
              {{ getAccountInitial(account) }}
            </div>
          </div>

          <div class="account-info">
            <h3 class="account-name">{{ account.name || account.login }}</h3>
            <p class="account-source">{{ formatSource(account.source) }}</p>
            <p class="account-status">✓ Готов к работе</p>
          </div>

          <div class="account-actions">
            <button @click="openChat(account)" class="chat-button">
              Открыть чат
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Сообщение если нет аккаунтов после завершения загрузки -->
    <div
      v-if="!loading && !error && filteredAccounts.length === 0"
      class="no-accounts"
    >
      <p>Нет аккаунтов с шагом 5</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
const router = useRouter();
const accountStore = useAccountStore();

const token = computed(() => accountStore.getAccountToken);
const loading = ref(false);
const error = ref(null);
const accounts = ref([]);
const filteredAccounts = ref([]);

onMounted(() => {
  fetchAccounts();
});

async function fetchAccounts() {
  loading.value = true;
  error.value = null;
  filteredAccounts.value = []; // Сбрасываем найденные аккаунты

  try {
    const response = await axios.post(
      `${FRONTEND_URL}getInfoByToken`,
      {
        group: ["messenger", "crm", "bulk"],
        source: ["telegram", "whatsapp", "crm"],
        type: ["amocrm", "bitrix24", "bulk"],
      },
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.ok) {
      const allAccounts = response.data.data.instances;
      await fetchAccountsInfo(allAccounts);
    } else {
      throw new Error(response.data.message || "Ошибка получения аккаунтов");
    }
  } catch (err) {
    error.value = err.message || "Произошла ошибка при загрузке данных";
    console.error("Ошибка при получении аккаунтов:", err);
  } finally {
    // loading.value = false // Не останавливаем загрузку сразу
  }
}

async function fetchAccountsInfo(allAccounts) {
  const promises = allAccounts.map(async (account) => {
    try {
      const payload = {
        source: account.source,
        login: account.login,
        type: account.type,
        storage: account.storage || "local",
      };

      const response = await axios.post(`${FRONTEND_URL}getInfo`, payload, {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
      });

      const accountWithInfo = {
        ...account,
        ...response.data,
      };

      // Если аккаунт с шагом 5, сразу добавляем в отображаемые
      if (accountWithInfo.step?.value === 5) {
        filteredAccounts.value.push(accountWithInfo);
      }

      return accountWithInfo;
    } catch (err) {
      console.error(
        `Ошибка при получении информации для аккаунта ${account.login}:`,
        err
      );
      return {
        ...account,
        step: { value: null, message: "Ошибка загрузки" },
      };
    }
  });

  // Ждем завершения всех запросов
  accounts.value = await Promise.all(promises);
  loading.value = false; // Завершаем загрузку только когда все аккаунты проверены
}

function openChat(account) {
  router.push({
    name: "Chats",
    query: {
      source: account.source,
      login: account.login,
      type: account.type,
    },
  });
}

function getAccountInitial(account) {
  const name = account.name || account.login || "";
  return name.charAt(0).toUpperCase();
}

function formatSource(source) {
  const sources = {
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    crm: "CRM",
  };
  return sources[source] || source;
}
</script>

<style scoped>
.simple-accounts-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  text-align: left;
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 30px 0;
  padding: 0;
}

.accounts-subtitle {
  text-align: left;
  font-size: 20px;
  font-weight: 600;
  color: #34495e;
  margin: 0 0 20px 0;
}

/* Стили для загрузчика */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 20px 0;
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid #e3e3e3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-container p {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
}

.error,
.no-accounts {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 20px 0;
}

.error p {
  color: #e74c3c;
  margin-bottom: 16px;
}

.retry-button {
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.retry-button:hover {
  background: #2980b9;
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.account-card {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.account-cover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 80px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.account-avatar {
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  border: 3px solid white;
  position: absolute;
  bottom: -30px;
}

.account-info {
  padding: 40px 20px 20px 20px;
  text-align: center;
}

.account-name {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.account-source {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0 0 8px 0;
  text-transform: capitalize;
}

.account-status {
  font-size: 12px;
  color: #27ae60;
  font-weight: 500;
  margin: 0;
}

.account-actions {
  padding: 0 20px 20px 20px;
  text-align: center;
}

.chat-button {
  width: 100%;
  padding: 12px 16px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.chat-button:hover {
  background: #219a52;
}

@media (max-width: 768px) {
  .accounts-grid {
    grid-template-columns: 1fr;
  }

  .simple-accounts-container {
    padding: 15px;
  }

  .page-title {
    font-size: 24px;
    margin-bottom: 20px;
  }
}
</style>
