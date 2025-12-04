<template>
  <div class="simple-accounts-container">
    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading-section">
      <div v-if="filteredAccounts.length === 0" class="initial-loading">
        <LoadAccount />
      </div>

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

        <!-- Индикатор загрузки дополнительных аккаунтов -->
        <div class="loading-more">
          <div class="loading-spinner"></div>
          <p>Загружаем информацию об аккаунтах...</p>
        </div>
      </div>
    </div>

    <!-- Состояние ошибки -->
    <div v-else-if="error" class="error">
      <p>Ошибка: {{ error }}</p>
      <button @click="fetchAccounts" class="retry-button">Повторить</button>
    </div>

    <!-- Список аккаунтов после загрузки -->
    <div v-else>
      <div v-if="hasActiveAccounts" class="accounts-grid">
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

      <!-- Состояние, когда аккаунтов не найдено -->
      <div v-else class="no-accounts-found">
        <div class="no-accounts-content">
          <div class="no-accounts-icon">📱</div>
          <h3 class="no-accounts-title">Аккаунты не найдены</h3>
          <p class="no-accounts-description">
            Нет подключенных аккаунтов или все аккаунты требуют настройки.
          </p>
          <div class="no-accounts-actions">
            <button @click="fetchAccounts" class="refresh-button">
              Обновить
            </button>
            <button @click="goToSetup" class="setup-button">
              Настроить аккаунты
            </button>
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

// Вычисляемое свойство для проверки наличия активных аккаунтов
const hasActiveAccounts = computed(() => {
  return filteredAccounts.value.length > 0;
});

onMounted(() => {
  fetchAccounts();
});

async function fetchAccounts() {
  loading.value = true;
  error.value = null;
  filteredAccounts.value = [];
  accounts.value = [];

  try {
    console.log("Начало загрузки аккаунтов...");
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

    console.log("Ответ getInfoByToken:", response.data);

    if (response.data.ok) {
      const allAccounts = response.data.data.instances;
      console.log("Найдено аккаунтов:", allAccounts.length);

      if (allAccounts.length === 0) {
        console.log("Нет аккаунтов для загрузки");
        loading.value = false;
        return;
      }

      await fetchAccountsInfo(allAccounts);
    } else {
      throw new Error(response.data.message || "Ошибка получения аккаунтов");
    }
  } catch (err) {
    console.error("Ошибка при получении аккаунтов:", err);
    error.value = err.message || "Произошла ошибка при загрузке данных";
  } finally {
    loading.value = false;
  }
}

async function fetchAccountsInfo(allAccounts) {
  console.log("Начало загрузки информации по аккаунтам...");

  const promises = allAccounts.map(async (account) => {
    try {
      console.log(
        `Загрузка информации для аккаунта: ${account.login}`,
        account
      );

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

      console.log(`Информация для ${account.login}:`, response.data);

      const accountWithInfo = {
        ...account,
        ...response.data,
      };

      // Если аккаунт с шагом 5, добавляем в отображаемые
      if (accountWithInfo.step?.value === 5) {
        console.log(`Аккаунт ${account.login} готов к использованию (шаг 5)`);
        filteredAccounts.value.push(accountWithInfo);
      } else {
        console.log(
          `Аккаунт ${account.login} не готов, шаг:`,
          accountWithInfo.step?.value
        );
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
  console.log("Все аккаунты загружены:", accounts.value);
  console.log("Активные аккаунты (шаг 5):", filteredAccounts.value);
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

function goToSetup() {
  // Навигация к странице настройки аккаунтов
  router.push({ name: "AccountsSetup" }); // Замените на нужный маршрут
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

/* Стили для загрузки */
.initial-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.accounts-with-loading {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-top: 3px solid #4950ca;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-more p {
  margin: 0;
  color: #666;
  font-size: 14px;
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
  transition: box-shadow 0.3s ease;
}

.account-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

/* Состояние ошибки */
.error {
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

/* Состояние, когда аккаунтов не найдено */
.no-accounts-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px 20px;
}

.no-accounts-content {
  text-align: center;
  max-width: 400px;
}

.no-accounts-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.7;
}

.no-accounts-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.no-accounts-description {
  font-size: 16px;
  color: #7f8c8d;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.no-accounts-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.refresh-button {
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

.refresh-button:hover {
  background: #3a41b8;
}

.setup-button {
  padding: 12px 24px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.setup-button:hover {
  background: #219653;
}

@media (max-width: 768px) {
  .accounts-grid {
    grid-template-columns: 1fr;
  }

  .simple-accounts-container {
    padding: 15px;
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

  .no-accounts-found {
    min-height: 300px;
  }

  .no-accounts-icon {
    font-size: 48px;
  }

  .no-accounts-title {
    font-size: 20px;
  }

  .no-accounts-description {
    font-size: 14px;
  }

  .no-accounts-actions {
    flex-direction: column;
    align-items: center;
  }

  .refresh-button,
  .setup-button {
    width: 200px;
  }
}
</style>
