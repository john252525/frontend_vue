<template>
  <!-- Модальное окно для установки CRM -->
  <div v-if="showCrmInstallModal" class="modal-overlay">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Требуется установка CRM</h3>
        <button class="close-btn" @click="closeCrmInstallModal">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="crm-install-content">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path
              d="M32 24V32M32 40H32.01M52 32C52 43.0457 43.0457 52 32 52C20.9543 52 12 43.0457 12 32C12 20.9543 20.9543 12 32 12C43.0457 12 52 20.9543 52 32Z"
              stroke="#3C61E0"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <h4>Интеграция с CRM не установлена</h4>
          <p>
            Для привязки мессенджеров к воронкам необходимо установить
            интеграцию с CRM в вашем аккаунте.
          </p>
          <div class="install-steps">
            <div class="step">
              <span class="step-number">1</span>
              <span class="step-text">Перейдите в настройки вашей CRM</span>
            </div>
            <div class="step">
              <span class="step-number">2</span>
              <span class="step-text"
                >Найдите раздел "Интеграции" или "Приложения"</span
              >
            </div>
            <div class="step">
              <span class="step-number">3</span>
              <span class="step-text">Установите приложение Chatserv</span>
            </div>
            <div class="step">
              <span class="step-number">4</span>
              <span class="step-text"
                >Настройте подключение и вернитесь на эту страницу</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeCrmInstallModal" class="close-modal-btn">
          Понятно
        </button>
        <button @click="retryCrmCheck" class="retry-btn">
          Проверить снова
        </button>
      </div>
    </div>
  </div>

  <!-- Основное модальное окно привязки воронок -->
  <div v-else class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Привязка мессенджеров к воронкам</h3>
        <button class="close-btn" @click="closeModal">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="crmLoading" class="loading">
          <div class="spinner"></div>
          <p>Проверка установки CRM...</p>
        </div>

        <div v-else-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Загрузка воронок...</p>
        </div>

        <div v-else-if="error" class="error">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p>Ошибка: {{ error }}</p>
          <button @click="initializeModal" class="retry-btn">Повторить</button>
        </div>

        <div v-else-if="pipelines.length === 0" class="no-data">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12H15M9 16H15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <p>Нет данных о воронках</p>
        </div>

        <div v-else>
          <!-- Отображение для одной воронки -->
          <div v-if="pipelines.length === 1" class="single-pipeline">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path
                d="M16 24L22 30L32 18M42 24C42 33.9411 33.9411 42 24 42C14.0589 42 6 33.9411 6 24C6 14.0589 14.0589 6 24 6C33.9411 6 42 14.0589 42 24Z"
                stroke="#10B981"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <h4>Найдена только одна воронка</h4>
            <p>
              Все мессенджеры автоматически будут привязаны к ней. Настройка не
              требуется
            </p>
          </div>

          <!-- Отображение для нескольких воронок -->
          <div v-else class="multiple-pipelines">
            <div class="info-section">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 7V9M8 12H8.01M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z"
                  stroke="#3C61E0"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
              <p>Вы можете подключить один мессенджер к каждой воронке</p>
            </div>

            <div class="pipelines-list">
              <div
                v-for="pipeline in pipelines"
                :key="pipeline.id"
                class="pipeline-card"
                :class="{ 'has-vendor': pipeline.vendors.length > 0 }"
              >
                <div class="pipeline-header">
                  <div class="pipeline-info">
                    <h4>{{ pipeline.name }}</h4>
                    <span class="pipeline-id">ID: {{ pipeline.id }}</span>
                  </div>
                  <div class="pipeline-status">
                    <span
                      v-if="pipeline.vendors.length > 0"
                      class="status-connected"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M13 4L6 11L3 8"
                          stroke="#10B981"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      Подключено
                    </span>
                    <span v-else class="status-disconnected">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M12 4L4 12M4 4L12 12"
                          stroke="#EF4444"
                          stroke-width="2"
                          stroke-linecap="round"
                        />
                      </svg>
                      Не подключено
                    </span>
                  </div>
                </div>

                <div class="pipeline-vendors">
                  <div v-if="pipeline.vendors.length > 0" class="vendors-list">
                    <strong>Подключенные мессенджеры:</strong>
                    <div class="vendor-tags">
                      <span
                        v-for="vendor in pipeline.vendors"
                        :key="vendor"
                        class="vendor-tag"
                      >
                        {{ getVendorName(vendor) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="pipeline-actions">
                  <button
                    v-if="pipeline.vendors.length === 0"
                    @click="showAccountsList(pipeline)"
                    class="add-account-btn"
                    :disabled="
                      pipeline.loading || filteredAccounts.length === 0
                    "
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 3V13M13 8H3"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                    <span v-if="pipeline.loading" class="btn-loader"></span>
                    <span v-else>Добавить мессенджер</span>
                  </button>

                  <div v-else class="connected-state">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M13 4L6 11L3 8"
                        stroke="#10B981"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span>Мессенджер подключен</span>
                  </div>

                  <div v-if="pipeline.showAccounts" class="accounts-dropdown">
                    <div class="dropdown-header">
                      <span>Выберите мессенджер</span>
                      <button
                        @click="hideAccountsList(pipeline)"
                        class="close-dropdown"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M10 4L4 10M4 4L10 10"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                          />
                        </svg>
                      </button>
                    </div>

                    <div class="accounts-list">
                      <div
                        v-for="account in filteredAccounts"
                        :key="account.uuid"
                        class="account-item"
                        @click="attachAccount(pipeline, account)"
                      >
                        <div class="account-info">
                          <div class="account-icon" :class="account.source">
                            <svg
                              v-if="account.source === 'telegram'"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M21 5L2 12.5L9 15M21 5L18.5 21L9 15M21 5L9 15"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                            <svg
                              v-else-if="account.source === 'whatsapp'"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M21 11.5C21.0034 12.819 20.6951 14.121 20.1 15.3C19.3944 16.7117 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.181 20.0034 9.879 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.121 3.99656 12.819 4 11.5C4.00061 9.92176 4.44061 8.37485 5.27072 7.03255C6.10083 5.69025 7.28825 4.60557 8.7 3.9C9.879 3.30493 11.181 3.00656 12.5 3H13C15.0843 3.11499 17.053 3.99477 18.5291 5.47086C20.0052 6.94695 20.885 8.91565 21 11V11.5Z"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </div>
                          <div class="account-details">
                            <div class="account-name">
                              {{ account.name || account.login }}
                            </div>
                            <div class="account-login">{{ account.login }}</div>
                          </div>
                        </div>
                        <div class="account-action">
                          <span
                            v-if="pipeline.attachingAccount === account.uuid"
                            class="attach-loader"
                          ></span>
                          <span v-else class="attach-icon">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <path
                                d="M3 8H13M13 8L9 4M13 8L9 12"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>

                      <div
                        v-if="filteredAccounts.length === 0"
                        class="no-accounts"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M10 9V11M10 15H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                          />
                        </svg>
                        Нет доступных мессенджер-аккаунтов
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="pipeline.attachResult"
                    class="attach-result"
                    :class="{
                      success: pipeline.attachResult.success,
                      error: !pipeline.attachResult.success,
                    }"
                  >
                    <svg
                      v-if="pipeline.attachResult.success"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M13 4L6 11L3 8"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <svg
                      v-else
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M10 4L4 10M4 4L10 10"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                    {{ pipeline.attachResult.message }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="close-modal-btn">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, toRefs } from "vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";

const props = defineProps({
  close: {
    type: Function,
    required: true,
  },
  selectedItem: {
    type: Object,
    required: true,
  },
  getAllAccounts: {
    type: Function,
  },
});

const emit = defineEmits(["close"]);

const { selectedItem, getAllAccounts } = toRefs(props);

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const pipelines = ref([]);
const accounts = ref([]);
const loading = ref(false);
const crmLoading = ref(false);
const error = ref(null);
const showCrmInstallModal = ref(false);
const crmInstalled = ref(false);

<<<<<<< HEAD
const API_BASE_URL = import.meta.env.VITE_BINDING_URL;
=======
const API_BASE_URL = "https://bapi88.developtech.ru/api/v1/crm";
>>>>>>> dev

// Получаем отфильтрованные аккаунты (ТОЛЬКО telegram и whatsapp)
const filteredAccounts = computed(() => {
  return accounts.value.filter(
    (account) => account.source === "telegram" || account.source === "whatsapp"
  );
});

const closeModal = () => {
  props.close();
};

const closeCrmInstallModal = () => {
  showCrmInstallModal.value = false;
  closeModal();
};

const retryCrmCheck = async () => {
  await checkCrmInstallation();
};

// Получаем CRM тип и домен из selectedItem
const getCrmParams = () => {
  if (!selectedItem.value) return {};

  // Предполагаем, что selectedItem содержит информацию о CRM
  // Если нет, используем значения по умолчанию или извлекаем из других полей
  return {
    crm_type: selectedItem.value.type || "amocrm", // предполагаем amoCRM по умолчанию
    crm_domain: selectedItem.value.login || selectedItem.value.domain || "",
  };
};

// Проверка установки CRM
const checkCrmInstallation = async () => {
  if (!selectedItem.value?.uuid) {
    error.value = "UUID не найден в selectedItem";
    return false;
  }

  if (!token.value) {
    error.value = "Токен авторизации не найден";
    return false;
  }

  crmLoading.value = true;
  error.value = null;

  try {
    const crmParams = getCrmParams();

    const response = await axios.post(
      `${API_BASE_URL}/isCrmInstalled`,
      {
        uuid: selectedItem.value.uuid,
        type: crmParams.crm_type,
        domain: crmParams.crm_domain,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data.ok) {
      crmInstalled.value = response.data.data.installed;
      if (!crmInstalled.value) {
        showCrmInstallModal.value = true;
        return false;
      }
      return true;
    } else {
      error.value =
        response.data.message || "Ошибка при проверке установки CRM";
      return false;
    }
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      err.message ||
      "Ошибка при проверке установки CRM";
    console.error("Ошибка при проверке установки CRM:", err);
    return false;
  } finally {
    crmLoading.value = false;
  }
};

// Получение имени вендора
const getVendorName = (vendorUuid) => {
  const account = accounts.value.find((acc) => acc.uuid === vendorUuid);
  return account ? account.name || account.login : vendorUuid;
};

// Показать список аккаунтов для воронки
const showAccountsList = (pipeline) => {
  // Скрываем другие открытые списки
  pipelines.value.forEach((p) => {
    if (p.id !== pipeline.id) {
      p.showAccounts = false;
    }
  });
  pipeline.showAccounts = true;
};

// Скрыть список аккаунтов
const hideAccountsList = (pipeline) => {
  pipeline.showAccounts = false;
};

// Привязать аккаунт к воронке
const attachAccount = async (pipeline, account) => {
  if (!token.value) {
    error.value = "Токен авторизации не найден";
    return;
  }

  pipeline.attachingAccount = account.uuid;
  pipeline.attachResult = null;

  try {
    const response = await axios.post(
      `${API_BASE_URL}/attachToAmocrmPipeline`,
      {
        amocrm_uuid: selectedItem.value.uuid,
        messenger_uuid: account.uuid,
        pipeline_id: pipeline.id.toString(),
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data.ok) {
      pipeline.attachResult = {
        success: true,
        message: "Мессенджер успешно привязан к воронке",
      };
      // Обновляем список вендоров воронки
      if (!pipeline.vendors.includes(account.uuid)) {
        pipeline.vendors.push(account.uuid);
      }
    } else {
      pipeline.attachResult = {
        success: false,
        message: response.data.message || "Ошибка при привязке мессенджера",
      };
    }
  } catch (err) {
    pipeline.attachResult = {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Ошибка при привязке мессенджера",
    };
    console.error("Ошибка при привязке мессенджера:", err);
  } finally {
    pipeline.attachingAccount = null;

    // Автоматически скрываем результат через 3 секунды
    setTimeout(() => {
      pipeline.attachResult = null;
      pipeline.showAccounts = false;
    }, 3000);
  }
};

const fetchPipelines = async () => {
  if (!selectedItem.value?.uuid) {
    error.value = "UUID не найден в selectedItem";
    return;
  }

  if (!token.value) {
    error.value = "Токен авторизации не найден";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const crmParams = getCrmParams();

    // Получаем воронки с передачей всех необходимых параметров
    const response = await axios.get(`${API_BASE_URL}/getAmocrmPipelines`, {
      params: {
        uuid: selectedItem.value.uuid,
        crm_type: crmParams.crm_type,
        crm_domain: crmParams.crm_domain,
      },
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data.ok && response.data.data && response.data.data[0]) {
      pipelines.value = response.data.data[0].map((pipeline) => ({
        ...pipeline,
        showAccounts: false,
        attachingAccount: null,
        attachResult: null,
        loading: false,
      }));
    } else {
      pipelines.value = [];
    }

    // Получаем аккаунты
    if (getAllAccounts.value) {
      accounts.value = getAllAccounts.value();
    }
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      err.message ||
      "Ошибка при загрузке данных";
    console.error("Ошибка при загрузке воронок:", err);
  } finally {
    loading.value = false;
  }
};

const initializeModal = async () => {
  // Сначала проверяем установку CRM
  const isCrmInstalled = await checkCrmInstallation();

  // Если CRM установлена, загружаем воронки
  if (isCrmInstalled) {
    await fetchPipelines();
  }
};

onMounted(() => {
  initializeModal();
});
</script>

<style scoped>
/* Стили остаются такими же как в предыдущем коде */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 520px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-weight: 600;
  font-size: 18px;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.crm-install-content {
  text-align: center;
  padding: 20px 0;
}

.crm-install-content h4 {
  margin: 16px 0 8px;
  color: #111827;
  font-weight: 600;
}

.crm-install-content p {
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 24px;
}

.install-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  text-align: left;
}

.step-number {
  background: #3c61e0;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-text {
  color: #374151;
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.spinner {
  border: 2px solid #f3f4f6;
  border-top: 2px solid #3c61e0;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error,
.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.error {
  color: #dc2626;
}

.error svg,
.no-data svg {
  margin-bottom: 12px;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: #3c61e0;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #2d54d2;
}

.single-pipeline {
  text-align: center;
  padding: 32px 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.single-pipeline h4 {
  color: #111827;
  margin: 16px 0 8px;
  font-weight: 600;
}

.single-pipeline p {
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

.multiple-pipelines .info-section {
  background: #f0f7ff;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  color: #1e40af;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
}

.info-section svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.pipelines-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pipeline-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: white;
  transition: border-color 0.2s;
}

.pipeline-card.has-vendor {
  border-color: #10b981;
  background: #f0fdf4;
}

.pipeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.pipeline-info h4 {
  margin: 0 0 4px 0;
  color: #111827;
  font-weight: 600;
  font-size: 16px;
}

.pipeline-id {
  color: #6b7280;
  font-size: 13px;
}

.pipeline-status {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-connected {
  color: #10b981;
}

.status-disconnected {
  color: #ef4444;
}

.pipeline-vendors {
  margin-bottom: 16px;
}

.vendor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.vendor-tag {
  background: #3c61e0;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.pipeline-actions {
  position: relative;
}

.add-account-btn {
  background: #3c61e0;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: center;
}

.add-account-btn:hover:not(:disabled) {
  background: #2d54d2;
}

.add-account-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-loader {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.connected-state {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #10b981;
  font-weight: 500;
  font-size: 14px;
  padding: 10px 0;
  justify-content: center;
}

.accounts-dropdown {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-top: 8px;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  background: #f8fafc;
  border-radius: 8px 8px 0 0;
  font-weight: 500;
  font-size: 14px;
}

.close-dropdown {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-dropdown:hover {
  background: #f3f4f6;
}

.accounts-list {
  max-height: 200px;
  overflow-y: auto;
}

.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background 0.2s;
}

.account-item:hover {
  background: #f8fafc;
}

.account-item:last-child {
  border-bottom: none;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.account-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  flex-shrink: 0;
}

.account-icon.telegram {
  color: #0088cc;
  background: #f0f9ff;
}

.account-icon.whatsapp {
  color: #25d366;
  background: #f0fdf4;
}

.account-details {
  flex: 1;
}

.account-name {
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
  font-size: 14px;
}

.account-login {
  color: #6b7280;
  font-size: 12px;
  font-family: monospace;
}

.account-action {
  margin-left: 12px;
}

.attach-loader {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3c61e0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.attach-icon {
  color: #3c61e0;
}

.no-accounts {
  padding: 20px;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.attach-result {
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.attach-result.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.attach-result.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.close-modal-btn {
  padding: 8px 16px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: background 0.2s;
}

.close-modal-btn:hover {
  background: #4b5563;
}
</style>
