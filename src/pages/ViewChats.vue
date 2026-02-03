<template>
  <div class="accounts-page">
    <header class="page-header">
      <section class="account-section">
        <h2 class="title">Ваши чаты</h2>
      </section>
    </header>

    <!-- Основной контент -->
    <div class="accounts-content">
      <!-- Состояние загрузки -->
      <div v-if="loading" class="loading-section">
        <LoadAccount v-if="filteredAccounts.length === 0" />

        <div v-else class="accounts-with-loading">
          <div class="accounts-grid">
            <div
              v-for="account in filteredAccounts"
              :key="account.uuid || account.id"
              class="account-card"
            >
              <div class="account-card-header">
                <div class="account-avatar">
                  {{ getAccountInitial(account) }}
                </div>
                <div class="account-status-indicator"></div>
              </div>

              <div class="account-info">
                <h3 class="account-name">
                  {{ account.name || account.login }}
                </h3>
                <div class="account-meta">
                  <span class="account-source-badge">{{
                    formatSource(account.source)
                  }}</span>
                  <span class="account-type-badge">{{
                    formatType(account.type)
                  }}</span>
                </div>
                <p class="account-status">✓ Аккаунт готов к работе</p>
              </div>

              <div class="account-actions">
                <button @click="openChat(account)" class="chat-button">
                  <span class="button-icon">💬</span>
                  Открыть чат
                </button>
              </div>
            </div>
          </div>

          <!-- Псевдо-аккаунт загрузки -->
          <div class="account-card loading-account">
            <div class="account-card-header">
              <div class="account-avatar-skeleton"></div>
              <div class="status-indicator-skeleton"></div>
            </div>

            <div class="account-info">
              <div class="account-name-skeleton"></div>
              <div class="account-meta-skeleton">
                <div class="source-badge-skeleton"></div>
                <div class="type-badge-skeleton"></div>
              </div>
              <div class="account-status-skeleton"></div>
            </div>

            <div class="account-actions">
              <div class="chat-button-skeleton"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Состояние ошибки -->
      <div v-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p class="error-message">Ошибка: {{ error }}</p>
        <button @click="fetchAccounts" class="retry-button">
          Повторить попытку
        </button>
      </div>

      <!-- Список аккаунтов после загрузки -->
      <div v-if="!loading && !error">
        <!-- Состояние "аккаунты не найдено" -->
        <div
          v-if="filteredAccounts.length === 0 && accounts.length === 0"
          class="no-accounts-found"
        >
          <div class="empty-state">
            <div class="empty-icon">📱</div>
            <h3 class="empty-title">Аккаунты не найдены</h3>
            <p class="empty-description">
              У вас пока нет подключенных аккаунтов для работы с чатами.
            </p>
            <button @click="fetchAccounts" class="refresh-button">
              Обновить список
            </button>
          </div>
        </div>

        <!-- Состояние "нет готовых аккаунтов" -->
        <div
          v-else-if="filteredAccounts.length === 0 && accounts.length > 0"
          class="no-ready-accounts"
        >
          <NoData type="chats" />
        </div>

        <div v-else class="accounts-grid">
          <div
            v-for="account in filteredAccounts"
            :key="account.uuid || account.id"
            class="account-card"
          >
            <div class="account-card-header">
              <div class="account-avatar">
                {{ getAccountInitial(account) }}
              </div>
              <div class="account-status-indicator"></div>
            </div>

            <div class="account-info">
              <h3 class="account-name">{{ account.name || account.login }}</h3>
              <div class="account-meta">
                <span class="account-source-badge">{{
                  formatSource(account.source)
                }}</span>
                <span class="account-type-badge">{{
                  formatType(account.type)
                }}</span>
              </div>
              <p class="account-status">✓ Аккаунт готов к работе</p>
            </div>

            <div class="account-actions">
              <button @click="openChat(account)" class="chat-button">
                <span class="button-icon">💬</span>
                Открыть чат
              </button>
            </div>
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
import NoData from "@/components/GlobalModal/StationList/NoData.vue";

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
        source: ["telegram", "whatsapp", "crm", "max"],
        type: ["amocrm", "bitrix24", "bulk"],
      },
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
      },
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
        err,
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
    name: "UserChats",
    query: {
      login: account.login,
      uuid: account.uuid,
      type: account.type,
      storage: account.storage,
      source: account.source,
    },
  });
}

function getAccountInitial(account) {
  const name = account.name || account.login || "";
  return name.charAt(0).toUpperCase();
}

function formatSource(source) {
  const sources = {
    telegram: "TG",
    whatsapp: "WA",
    crm: "CRM",
  };
  return sources[source] || source;
}

function formatType(type) {
  const types = {
    amocrm: "Amo",
    bitrix24: "Bitrix",
    bulk: "Bulk",
  };
  return types[type] || type;
}
</script>

<style scoped>
.accounts-page {
  width: 100%;
  min-height: 100vh;
  background: var(--background);
  padding: 0;
}

.page-header {
  padding: 18px 12px 18px 18px;
  background: var(--header-bg, #ffffff);
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.account-section {
  display: flex;
  align-items: center;
}

.title {
  font-weight: 500;
  font-size: 22px;
  color: var(--text);
  margin: 0;
  text-align: left;
}

.accounts-content {
  padding: 20px;
  max-width: none;
  margin: 0;
}

/* Стили для загрузки с аккаунтами */
.accounts-with-loading {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
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

/* Скелетоны */
.account-avatar-skeleton,
.status-indicator-skeleton,
.account-name-skeleton,
.source-badge-skeleton,
.type-badge-skeleton,
.account-status-skeleton,
.chat-button-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.account-avatar-skeleton {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.status-indicator-skeleton {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: absolute;
  top: 0;
  right: 0;
}

.account-name-skeleton {
  width: 120px;
  height: 20px;
  margin-bottom: 8px;
}

.account-meta-skeleton {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.source-badge-skeleton {
  width: 40px;
  height: 20px;
}

.type-badge-skeleton {
  width: 35px;
  height: 20px;
}

.account-status-skeleton {
  width: 150px;
  height: 14px;
}

.chat-button-skeleton {
  width: 100%;
  height: 40px;
  border-radius: 8px;
}

/* Стили аккаунтов */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.account-card {
  background: white;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.account-card-header {
  position: relative;
  display: flex;
  justify-content: center;
}

.account-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4950ca 0%, #3a41b8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.account-status-indicator {
  width: 12px;
  height: 12px;
  background: #27ae60;
  border: 2px solid white;
  border-radius: 50%;
  position: absolute;
  top: 0;
  right: 0;
}

.account-info {
  text-align: center;
}

.account-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.account-meta {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.account-source-badge,
.account-type-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.account-source-badge {
  background: #e3f2fd;
  color: #1976d2;
}

.account-type-badge {
  background: #f3e5f5;
  color: #7b1fa2;
}

.account-status {
  font-size: 13px;
  color: #27ae60;
  font-weight: 500;
  margin: 0;
}

.account-actions {
  margin-top: auto;
}

.chat-button {
  width: 100%;
  padding: 12px 16px;
  background: #4950ca;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.chat-button:hover {
  background: #3a41b8;
  transform: translateY(-1px);
}

.button-icon {
  font-size: 16px;
}

/* Состояния ошибки */
.error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid var(--border-color, #e0e0e0);
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-message {
  color: #e74c3c;
  font-size: 16px;
  margin: 0 0 20px 0;
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

/* Состояния "нет аккаунтов" */
.no-accounts-found,
.no-ready-accounts {
  padding: 60px 20px;
}

.empty-state {
  text-align: center;
  background: white;
  border-radius: 16px;
  border: 1px solid var(--border-color, #e0e0e0);
  padding: 60px 40px;
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.7;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 16px 0;
}

.empty-description {
  font-size: 16px;
  color: var(--text-secondary, #666);
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.accounts-count {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 24px;
  display: inline-block;
}

.refresh-button {
  padding: 12px 32px;
  background: #4950ca;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.refresh-button:hover {
  background: #3a41b8;
  transform: translateY(-1px);
}

.no-accounts {
  padding: 40px 20px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .accounts-content {
    padding: 15px;
  }

  .accounts-grid,
  .accounts-with-loading {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .account-card {
    padding: 16px;
  }

  .title {
    font-size: 20px;
  }

  .empty-state {
    padding: 40px 20px;
  }

  .empty-icon {
    font-size: 48px;
  }

  .empty-title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 15px;
  }

  .accounts-content {
    padding: 12px;
  }

  .empty-state {
    padding: 30px 15px;
  }
}
</style>
