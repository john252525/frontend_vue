<template>
  <div v-if="settingsModalStation" class="modal-overlay">
    <div
      @click="props.changeStationSettingsModal()"
      class="modal-backdrop"
    ></div>
    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />

    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Настройки аккаунта</h2>
        <button
          class="close-button"
          @click="props.changeStationSettingsModal()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Показываем лоадер только при загрузке данных -->
        <div v-if="initialLoading" class="loading-overlay">
          <SettingsLoad />
          <!-- <p>Загрузка данных...</p> -->
        </div>

        <template v-else>
          <div class="account-info">
            <div class="info-item">
              <span class="info-label">Логин:</span>
              <div v-if="selectedItems.name" class="account-name-box">
                <AccountIcon :item="selectedItems" />
                <span class="info-value">{{ selectedItems.name }}</span>
              </div>

              <div v-else class="account-name-box">
                <AccountIcon :item="selectedItems" />
                <span class="info-value">{{ selectedItems.login }}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">Источник:</span>
              <span class="info-value">{{
                getType(selectedItems.source)
              }}</span>
            </div>
          </div>

          <div class="webhooks-section">
            <h3 class="section-title">Вебхуки</h3>
            <p class="section-description">
              Добавьте или удалите URL-адреса для получения уведомлений
            </p>

            <div class="webhooks-list">
              <div
                v-for="(url, index) in webhookUrls"
                :key="index"
                class="webhook-item"
              >
                <div class="webhook-content">
                  <svg
                    class="webhook-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                    ></path>
                    <path
                      d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                    ></path>
                  </svg>
                  <span class="webhook-url">{{ url }}</span>
                </div>
                <button
                  class="delete-button"
                  @click="removeWebhook(index)"
                  :disabled="saving"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>

              <!-- Блок добавления нового вебхука -->
              <div class="webhook-item add-webhook">
                <div class="webhook-content">
                  <svg
                    class="webhook-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  <input
                    v-model="newWebhookUrl"
                    type="text"
                    placeholder="Введите URL вебхука"
                    class="webhook-input"
                    :disabled="saving"
                    @keypress.enter="addNewWebhook"
                  />
                </div>
                <button
                  class="add-button"
                  @click="addNewWebhook"
                  :disabled="saving || !newWebhookUrl.trim()"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Overlay для сохранения -->
          <div v-if="saving" class="loading-overlay">
            <SettingsLoad />
            <p>Сохранение изменений...</p>
          </div>
        </template>
      </div>

      <div class="modal-footer">
        <button
          class="cancel-button"
          @click="props.changeStationSettingsModal()"
          :disabled="initialLoading || saving"
        >
          Отмена
        </button>
        <button
          class="save-button"
          @click="saveWebhooks"
          :disabled="initialLoading || saving || !hasChanges"
          v-if="!initialLoading"
        >
          {{ saving ? "Сохранение..." : "Сохранить изменения" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import SettingsLoad from "../../LoadingMoadal/SettingsLoad.vue";
import { useRouter } from "vue-router";
import { useAccountStore } from "@/stores/accountStore";
import { ref, toRefs, watch, reactive, computed, onMounted } from "vue";
import axios from "axios";
import { useI18n } from "vue-i18n";
import { useStationLoading } from "@/composables/useStationLoading";
import useFrontendLogger from "@/composables/useFrontendLogger";
import { useDomain } from "@/composables/getDomain";
import AccountIcon from "@/components/Accounts/AccountIcon.vue";
import { useDownloads } from "@/composables/useDownloads";

const { addDownload, completeDownload } = useDownloads();
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
const router = useRouter();
const accountStore = useAccountStore();
const { setLoadingStatus } = useStationLoading();
const { t } = useI18n();
const { sendLog } = useFrontendLogger();
const { stationDomain } = useDomain();

const token = computed(() => accountStore.getAccountToken);

const props = defineProps({
  closeModal: {
    type: Function,
  },
  selectedItems: {
    type: Object,
  },
  changeStationSettingsModal: {
    type: Function,
  },
  settingsModalStation: {
    type: Boolean,
  },
});

const { selectedItems, settingsModalStation } = toRefs(props);

// Реактивные данные
const accountData = reactive({
  login: "",
  source: "",
  connectedPhone: "",
  step: null,
  webhookUrl: "",
  webhookUrls: [],
});

const webhookUrls = ref([]);
const newWebhookUrl = ref("");
const initialLoading = ref(false); // Для первоначальной загрузки данных
const saving = ref(false); // Для процесса сохранения
const errorBlock = ref(false);
const originalWebhooks = ref([]);

// Вычисляемые свойства
const hasChanges = computed(() => {
  return (
    JSON.stringify(webhookUrls.value) !== JSON.stringify(originalWebhooks.value)
  );
});

function getType(type) {
  switch (type) {
    case "bulk": // Успешный платеж
      return "Аккаунт рассылки";
    case "amocrm": // Ошибка
      return "AmoCRM";
    case "bitrix24": // В обработке
      return "Битрикс 24";
    case "telegram":
      return "Telegram";
    case "whatsapp":
      return "WhatsApp";
    default:
      return type;
  }
}

// Методы
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
  }
};

const addNewWebhook = () => {
  const url = newWebhookUrl.value.trim();
  if (url && !webhookUrls.value.includes(url)) {
    webhookUrls.value.push(url);
    newWebhookUrl.value = "";
  }
};

const removeWebhook = (index) => {
  webhookUrls.value.splice(index, 1);
};

// В функции getInfoAccount
const getInfoAccount = async () => {
  let downloadId = null; // Объявляем переменную здесь

  try {
    initialLoading.value = true;
    if (!selectedItems.value) return;

    const { source, login, storage, type } = selectedItems.value;
    let params = { source, login };

    if (stationDomain.navigate.value === "whatsapi") {
      params.storage = storage;
    }

    // Сохраняем ID загрузки в переменную
    downloadId = addDownload("Загрузка настроек аккаунта");

    const response = await axios.post(`${FRONTEND_URL}getInfo`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    Object.assign(accountData, response.data);

    if (Array.isArray(response.data.webhookUrls)) {
      webhookUrls.value = [...response.data.webhookUrls];
      originalWebhooks.value = [...response.data.webhookUrls];
    }

    if (response.data) {
      await handleSendLog(
        "settingsAccount",
        "getInfo",
        params,
        response.data.ok,
        response.data
      );

      completeDownload(downloadId, true);
    }

    if (response.data === 401) {
      errorBlock.value = true;
      completeDownload(downloadId, false); // Используем сохраненный ID
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    }
  } catch (error) {
    console.error("error", error);

    // Используем сохраненный downloadId для отметки ошибки
    if (downloadId) {
      completeDownload(downloadId, false);
    }

    if (error.response) {
      console.error("error", error.response.data);

      // Если это ошибка авторизации
      if (error.response.status === 401) {
        errorBlock.value = true;
        setTimeout(() => {
          localStorage.removeItem("accountToken");
          router.push("/login");
        }, 2000);
      }
    }
  } finally {
    initialLoading.value = false;
  }
};

// В функции saveWebhooks
const saveWebhooks = async () => {
  let downloadId = null; // Объявляем переменную здесь

  try {
    saving.value = true;
    if (!selectedItems.value) return;

    const { source, login, storage } = selectedItems.value;
    let params = {
      source: source,
      login: login,
      webhookUrls: webhookUrls.value,
    };

    if (stationDomain.navigate.value === "whatsapi") {
      params.storage = storage;
    }

    // Сохраняем ID загрузки
    downloadId = addDownload("Сохранение вебхуков");

    const response = await axios.post(`${FRONTEND_URL}updateAccount`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      await handleSendLog(
        "settingsAccount",
        "updateAccount",
        params,
        response.data.ok,
        response.data
      );

      completeDownload(downloadId, true);
    }

    if (response.data === 401) {
      errorBlock.value = true;
      completeDownload(downloadId, false); // Используем сохраненный ID
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    }

    originalWebhooks.value = [...webhookUrls.value];
  } catch (error) {
    console.error("error", error);

    // Используем сохраненный downloadId для отметки ошибки
    if (downloadId) {
      completeDownload(downloadId, false);
    }

    if (error.response) {
      console.error("error", error.response.data);

      // Если это ошибка авторизации
      if (error.response.status === 401) {
        errorBlock.value = true;
        setTimeout(() => {
          localStorage.removeItem("accountToken");
          router.push("/login");
        }, 2000);
      }
    }
  } finally {
    saving.value = false;
    setLoadingStatus(true, "success");
    props.changeStationSettingsModal();
  }
};

// Наблюдатель за открытием модального окна
watch(settingsModalStation, (newValue) => {
  if (newValue === true) {
    getInfoAccount();
    newWebhookUrl.value = ""; // Сбрасываем поле ввода
  }
});

// Инициализация
onMounted(() => {
  if (settingsModalStation.value) {
    getInfoAccount();
  }
});
</script>

<style scoped>
/* Стили остаются без изменений */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
  position: relative;
  min-height: 300px;
}

.account-info {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  color: #374151;
  min-width: 80px;
}

.info-value {
  color: #6b7280;
  flex: 1;
  text-align: right;
}

.webhooks-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.section-description {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 16px;
}

.webhooks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.account-name-box {
  display: flex;
  align-items: center;
  gap: 4px;
}

.webhook-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  transition: all 0.2s ease;
}

.webhook-item:hover {
  border-color: #d1d5db;
}

.webhook-item.add-webhook {
  background: #f8fafc;
  border-style: dashed;
}

.webhook-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.webhook-icon {
  color: #6b7280;
  flex-shrink: 0;
}

.webhook-url {
  font-size: 14px;
  color: #374151;
  word-break: break-all;
}

.webhook-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
  color: #374151;
  padding: 0;
}

.webhook-input::placeholder {
  color: #9ca3af;
}

.delete-button,
.add-button {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.delete-button:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
}

.add-button:hover:not(:disabled) {
  background: #dcfce7;
  color: #16a34a;
}

.delete-button:disabled,
.add-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  border-radius: 12px;
}

.loading-overlay p {
  margin-top: 12px;
  color: #6b7280;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.cancel-button,
.save-button {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button {
  background: #f3f4f6;
  color: #374151;
}

.cancel-button:hover:not(:disabled) {
  background: #e5e7eb;
}

.save-button {
  background: #3b82f6;
  color: white;
}

.save-button:hover:not(:disabled) {
  background: #2563eb;
}

.save-button:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 16px 20px;
    flex-direction: column;
  }

  .info-item {
    flex-direction: column;
    gap: 4px;
  }

  .info-label {
    min-width: auto;
  }

  .info-value {
    text-align: left;
  }
}

@media (max-width: 400px) {
  .modal-header {
    padding: 12px 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .webhook-content {
    gap: 6px;
  }

  .webhook-url {
    font-size: 13px;
  }
}
</style>
