<template>
  <div class="simple-accounts-container">
    <!-- Заголовок -->

    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading-section">
      <LoadAccount v-if="filteredAccounts.length === 0" />

      <div v-else class="accounts-with-loading">
        <!-- Уже найденные аккаунты -->
        <div class="accounts-grid">
          <div
            v-for="account in filteredAccounts"
            :key="account.uuid || account.id"
            class="account-card"
          >
            <div class="account-info">
              <div class="account-header">
                <h3 class="account-name">
                  {{ account.name || account.login }}
                </h3>
                <span class="account-status-badge">✓</span>
              </div>
              <p class="account-source">{{ formatSource(account.source) }}</p>
              <p class="account-type">{{ formatType(account.type) }}</p>
            </div>

            <div class="account-actions">
              <button @click="openChat(account)" class="chat-button">
                Чат
              </button>
            </div>
          </div>
        </div>

        <!-- Псевдо-аккаунт загрузки -->
        <div class="account-card loading-account">
          <div class="account-info">
            <div class="account-header">
              <div class="account-name-skeleton"></div>
              <div class="status-skeleton"></div>
            </div>
            <div class="source-skeleton"></div>
            <div class="type-skeleton"></div>
          </div>
          <div class="account-actions">
            <div class="button-skeleton"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Состояние ошибки -->
    <div v-if="error" class="error">
      <p>Ошибка: {{ error }}</p>
      <button @click="fetchAccounts" class="retry-button">Повторить</button>
    </div>

    <!-- Список аккаунтов после загрузки -->
    <div v-if="!loading && !error">
      <div v-if="filteredAccounts.length === 0" class="no-accounts">
        <LoadAccount />
      </div>

      <div v-else class="accounts-grid">
        <div
          v-for="account in filteredAccounts"
          :key="account.uuid || account.id"
          class="account-card"
        >
          <div class="account-info">
            <div class="account-header">
              <h3 class="account-name">{{ account.name || account.login }}</h3>
              <span class="account-status-badge">✓</span>
            </div>
            <p class="account-source">{{ formatSource(account.source) }}</p>
            <p class="account-type">{{ formatType(account.type) }}</p>
          </div>

          <div class="account-actions">
            <button @click="openChat(account)" class="chat-button">Чат</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";
import LoadAccount from "@/components/Accounts/Accounts/LoadAccount.vue";

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
  filteredAccounts.value = [];

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
    loading.value = false;
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

  accounts.value = await Promise.all(promises);
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

function formatSource(source) {
  const sources = {
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    crm: "CRM",
  };
  return sources[source] || source;
}

function formatType(type) {
  const types = {
    amocrm: "AmoCRM",
    bitrix24: "Bitrix24",
    bulk: "Bulk",
  };
  return types[type] || type;
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

/* Стили для загрузки с аккаунтами */
.accounts-with-loading {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.loading-account {
  opacity: 0.7;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 0.7;
  }
}

.account-name-skeleton,
.status-skeleton,
.source-skeleton,
.type-skeleton,
.button-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.account-name-skeleton {
  width: 120px;
  height: 20px;
}

.status-skeleton {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.source-skeleton {
  width: 80px;
  height: 14px;
  margin: 5px 0;
}

.type-skeleton {
  width: 60px;
  height: 14px;
}

.button-skeleton {
  width: 60px;
  height: 32px;
  border-radius: 6px;
}

/* Стили аккаунтов */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.account-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.account-info {
  flex: 1;
}

.account-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.account-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.account-status-badge {
  color: #27ae60;
  font-weight: bold;
  font-size: 16px;
}

.account-source {
  font-size: 14px;
  color: #666;
  margin: 0 0 5px 0;
  text-transform: capitalize;
}

.account-type {
  font-size: 12px;
  color: #888;
  margin: 0;
  text-transform: capitalize;
}

.account-actions {
  margin-left: 15px;
}

.chat-button {
  padding: 8px 16px;
  background: #4950ca;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.chat-button:hover {
  background: #3a41b8;
}

/* Состояния ошибки и пустого списка */
.error,
.no-accounts {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;
}

.error p {
  color: #e74c3c;
  margin-bottom: 16px;
}

.retry-button {
  padding: 12px 24px;
  background: #4950ca;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.retry-button:hover {
  background: #3a41b8;
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

  .account-card {
    flex-direction: column;
    gap: 12px;
  }

  .account-actions {
    margin-left: 0;
    align-self: stretch;
  }

  .chat-button {
    width: 100%;
  }
}
</style>
