<template>
  <LoadModal
    :changeStationLoading="changeStationLoading"
    :stationLoading="stationLoading"
  />

  <!-- Модальное окно подтверждения интеграции -->
  <div v-if="showIntegrationModal" class="modal-overlay">
    <div class="modal-container integration-modal">
      <div class="modal-header">
        <h2>Подтверждение интеграции</h2>
      </div>
      <div class="modal-content">
        <p class="integration-question">
          Интеграция ChatServ установлена в
          <strong>{{ selectedCrmName }}</strong
          >?
        </p>
      </div>
      <div class="modal-footer">
        <button class="cancel-btn" @click="handleIntegrationNo">Нет</button>
        <button class="submit-btn" @click="handleIntegrationYes">Да</button>
      </div>
    </div>
  </div>

  <!-- Модальное окно предупреждения -->
  <div v-if="showWarningModal" class="modal-overlay">
    <div class="modal-container warning-modal">
      <div class="modal-header">
        <h2>Внимание</h2>
      </div>
      <div class="modal-content">
        <div class="warning-message">
          <p>
            Если интеграция не установлена на вашем портале CRM, рекомендуем
            сначала установить ее.
          </p>
          <p>
            В противном случае не забудьте обновить настройки аккаунта
            (Действия→Обновить) после ее установки на стороне CRM.
          </p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="submit-btn" @click="handleWarningConfirm">
          Продолжить создание
        </button>
      </div>
    </div>
  </div>

  <!-- Основное модальное окно добавления аккаунта -->
  <div v-if="!stationLoading.loading" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="accounts-addAccounts-title-text">Настройка интеграции</h2>
        <button
          class="close-btn accounts-addAccounts-close-button"
          @click="openModal"
        >
          &times;
        </button>
      </div>

      <div class="modal-content">
        <!-- Group Select -->
        <div v-if="showElement('group')" class="form-group">
          <label
            v-if="getLabel('group')"
            class="accounts-addAccounts-group-label"
            >{{ getLabel("group") }}</label
          >
          <div class="custom-select" ref="groupSelect">
            <div
              class="selected-option accounts-addAccounts-group-select"
              @click="toggleDropdown('group')"
            >
              <span>{{ getSelectedText("group") || "Выберите тип" }}</span>
              <svg
                class="dropdown-icon"
                :class="{ 'rotate-180': dropdownOpen.group }"
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L6 6L11 1"
                  stroke="#6B7280"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <teleport to="body" v-if="dropdownOpen.group">
              <div
                class="dropdown-options-global accounts-addAccounts-group-dropdown"
                :style="getDropdownStyle('group')"
              >
                <div
                  v-for="option in getOptions('group')"
                  :key="option.value"
                  class="option accounts-addAccounts-group-option"
                  @click="selectOption('group', option.value)"
                >
                  {{ option.text }}
                </div>
              </div>
            </teleport>
          </div>
        </div>

        <!-- Messenger Select -->
        <div v-if="showElement('messenger')" class="form-group">
          <label
            v-if="getLabel('messenger')"
            class="accounts-addAccounts-messenger-label"
            >{{ getLabel("messenger") }}</label
          >
          <div class="custom-select" ref="messengerSelect">
            <div
              class="selected-option accounts-addAccounts-messenger-select"
              @click="toggleDropdown('messenger')"
            >
              <span>{{
                getSelectedText("messenger") || "Выберите мессенджер"
              }}</span>
              <svg
                class="dropdown-icon"
                :class="{ 'rotate-180': dropdownOpen.messenger }"
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L6 6L11 1"
                  stroke="#6B7280"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <teleport to="body" v-if="dropdownOpen.messenger">
              <div
                class="dropdown-options-global accounts-addAccounts-messenger-dropdown"
                :style="getDropdownStyle('messenger')"
              >
                <div
                  v-for="option in getOptions('messenger')"
                  :key="option.value"
                  class="option accounts-addAccounts-messenger-option"
                  @click="selectOption('messenger', option.value)"
                >
                  {{ option.text }}
                </div>
              </div>
            </teleport>
          </div>
        </div>

        <!-- CRM Select -->
        <div v-if="showElement('type')" class="form-group">
          <label
            v-if="getLabel('type')"
            class="accounts-addAccounts-crmType-label"
            >{{ getLabel("type") }}</label
          >
          <div class="custom-select" ref="typeSelect">
            <div
              class="selected-option accounts-addAccounts-crmType-select"
              @click="toggleDropdown('type')"
            >
              <span>{{ getSelectedText("type") || "Выберите CRM" }}</span>
              <svg
                class="dropdown-icon"
                :class="{ 'rotate-180': dropdownOpen.type }"
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L6 6L11 1"
                  stroke="#6B7280"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <teleport to="body" v-if="dropdownOpen.type">
              <div
                class="dropdown-options-global accounts-addAccounts-crmType-dropdown"
                :style="getDropdownStyle('type')"
              >
                <div
                  v-for="option in getOptions('type')"
                  :key="option.value"
                  class="option accounts-addAccounts-crmType-option"
                  @click="handleCrmSelect(option.value, option.text)"
                >
                  {{ option.text }}
                </div>
              </div>
            </teleport>
          </div>
        </div>

        <!-- Domain input for CRM -->
        <div
          v-if="formValues.group === 'crm' && formValues.type"
          class="form-field"
        >
          <label class="accounts-addAccounts-domain-label"
            >Адрес аккаунта</label
          >
          <input
            v-model="formValues.domain"
            type="text"
            :placeholder="getDomainPlaceholder()"
            required
            class="accounts-addAccounts-domain-input"
          />
        </div>

        <!-- Info messages -->
        <div
          v-if="
            formValues.group === 'messenger' &&
            formValues.messenger === 'whatsapp'
          "
          class="info-message accounts-addAccounts-whatsapp-info"
        >
          <p>
            Привязать номер своего Whatsapp можно будет после создания аккаунта
          </p>
        </div>

        <div
          v-if="
            formValues.group === 'messenger' &&
            formValues.messenger === 'telegram'
          "
          class="info-message accounts-addAccounts-telegram-info"
        >
          <p>
            Привязать свой аккаунт Telegram можно будет после создания аккаунта
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <button
          class="cancel-btn accounts-addAccounts-cancel-button"
          @click="openModal"
        >
          Отмена
        </button>
        <button
          class="submit-btn accounts-addAccounts-submit-button"
          @click="submitForm"
          :disabled="!isFormValid"
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, reactive } from "vue";
import axios from "axios";
import LoadModal from "../LoadingMoadal/LoadModal.vue";

const props = defineProps({
  isOpen: Boolean,
  openModal: {
    type: Function,
  },
  getAccounts: {
    type: Function,
  },
});

const emit = defineEmits(["close", "submit"]);
const FRONTEND_URL_USERS = import.meta.env.VITE_FRONTEND_URL_USERS;
const FRONTEND_URL_FORMS = import.meta.env.VITE_FRONTEND_URL_FORMS;

import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

// State
const stationLoading = reactive({
  loading: false,
});

// Модальные окна
const showIntegrationModal = ref(false);
const showWarningModal = ref(false);
const selectedCrmName = ref("");

const changeStationLoading = () => {
  stationLoading.loading = false;
};
const formElements = ref([]);
const formValues = reactive({
  group: "",
  messenger: "",
  type: "",
  domain: "",
});
const dropdownOpen = reactive({
  group: false,
  messenger: false,
  type: false,
});

// Refs для элементов select
const groupSelect = ref(null);
const messengerSelect = ref(null);
const typeSelect = ref(null);

// Fetch form structure from API
const fetchFormStructure = async () => {
  stationLoading.loading = true;
  try {
    const response = await axios.get(`${FRONTEND_URL_FORMS}getForm`);

    if (response.data.ok) {
      formElements.value = response.data.data;
    }
  } catch (error) {
    console.error("Error fetching form structure:", error);
  } finally {
    stationLoading.loading = false;
  }
};

// Helper functions
const getSelectElement = (name) => {
  return formElements.value.find(
    (el) => el.element === "select" && el.name === name
  );
};

const getLabel = (forAttr) => {
  const label = formElements.value.find(
    (el) => el.element === "label" && el.for === forAttr
  );
  return label?.text_content || "";
};

const getOptions = (selectName) => {
  const select = getSelectElement(selectName);
  if (!select) return [];

  return formElements.value
    .filter((el) => el.parent_id === select.id && el.element === "option")
    .map((option) => ({
      value: option.value,
      text: option.text_content,
    }));
};

const getSelectedText = (selectName) => {
  const select = getSelectElement(selectName);
  if (!select) return "";

  const selectedValue = formValues[selectName];
  if (!selectedValue) return "";

  const option = formElements.value.find(
    (el) =>
      el.parent_id === select.id &&
      el.element === "option" &&
      el.value === selectedValue
  );

  return option?.text_content || "";
};

const showElement = (name) => {
  if (name === "group") return true;
  if (name === "messenger") return formValues.group === "messenger";
  if (name === "type") return formValues.group === "crm";
  return false;
};

const getDomainPlaceholder = () => {
  if (formValues.type === "amocrm") return "account.amocrm.ru";
  if (formValues.type === "bitrix24") return "account.bitrix24.ru";
  return "Введите адрес аккаунта";
};

// Form validation
const isFormValid = computed(() => {
  if (!formValues.group) return false;

  if (formValues.group === "messenger") {
    return !!formValues.messenger;
  }

  if (formValues.group === "crm") {
    return !!formValues.type && !!formValues.domain;
  }

  return true;
});

// Dropdown methods
const toggleDropdown = (name) => {
  Object.keys(dropdownOpen).forEach((key) => {
    if (key !== name) dropdownOpen[key] = false;
  });
  dropdownOpen[name] = !dropdownOpen[name];
};

const selectOption = (name, value) => {
  formValues[name] = value;

  // Reset dependent values when parent changes
  if (name === "group") {
    formValues.messenger = "";
    formValues.type = "";
    formValues.domain = "";
  }

  dropdownOpen[name] = false;
};

// Обработка выбора CRM
const handleCrmSelect = (value, text) => {
  selectedCrmName.value = text;
  formValues.type = value;
  dropdownOpen.type = false;

  // Показываем модальное окно подтверждения интеграции
  showIntegrationModal.value = true;
};

// Обработчики для модальных окон
const handleIntegrationYes = () => {
  showIntegrationModal.value = false;
  // Продолжаем без предупреждения
};

const handleIntegrationNo = () => {
  showIntegrationModal.value = false;
  showWarningModal.value = true;
};

const handleWarningConfirm = () => {
  showWarningModal.value = false;
  // Пользователь подтвердил, что понимает риски
};

// Получение стилей для позиционирования dropdown
const getDropdownStyle = (name) => {
  const selectRef =
    name === "group"
      ? groupSelect
      : name === "messenger"
      ? messengerSelect
      : typeSelect;

  if (!selectRef.value) return {};

  const rect = selectRef.value.getBoundingClientRect();
  return {
    top: `${rect.bottom}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  };
};

// Handle clicks outside dropdowns
const handleClickOutside = (event) => {
  // Проверяем, был ли клик вне dropdown
  const isClickInsideDropdown =
    event.target.closest(".custom-select") ||
    event.target.closest(".dropdown-options-global");

  if (!isClickInsideDropdown) {
    Object.keys(dropdownOpen).forEach((key) => {
      dropdownOpen[key] = false;
    });
  }
};

// Set up event listeners
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  fetchFormStructure();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

const handleSomeAction = () => {
  if (props.getAccounts) {
    props.getAccounts();
  }
};

const submitForm = async () => {
  const formData = {
    ...formValues,
  };

  stationLoading.loading = true;
  try {
    const response = await axios.post(
      `${FRONTEND_URL_USERS}addAccount`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data.ok) {
      emit("submit", formData);
      stationLoading.loading = false;
      handleSomeAction();
      setLoadingStatus(true, "success");
      changeStationLoading();
      props.openModal();
      location.reload();
    } else {
      setLoadingStatus(true, "error");
      changeStationLoading();
      console.error("Ошибка сохранения:", response.data.message);
    }
  } catch (error) {
    console.error("Ошибка при отправке данных:", error);
    stationLoading.loading = false;
  }
};
</script>

<style scoped>
/* Добавляем стили для новых модальных окон */
.integration-modal,
.warning-modal {
  max-width: 400px;
  z-index: 1002;
}

.integration-question {
  text-align: center;
  font-size: 1rem;
  margin: 0;
}

.integration-question strong {
  color: #6366f1;
}

.warning-message {
  background-color: #fef3cd;
  border: 1px solid #fde68a;
  border-radius: 6px;
  padding: 12px;
  color: #92400e;
}

.warning-message p {
  margin: 8px 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.warning-message p:first-child {
  margin-top: 0;
}

.warning-message p:last-child {
  margin-bottom: 0;
}

/* Увеличиваем z-index для основного модального окна когда открыты дополнительные */
.modal-overlay {
  z-index: 1001;
}

.modal-overlay:has(.integration-modal),
.modal-overlay:has(.warning-modal) {
  z-index: 1002;
}

/* Остальные существующие стили остаются без изменений */
/* Base styles */
* {
  box-sizing: border-box;
}

/* Modal overlay */
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
  backdrop-filter: blur(2px);
  animation: fadeIn 0.3s ease-out;
  overflow-y: auto;
  padding: 20px;
}

.hidden-input {
  display: none;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
  max-height: calc(100vh - 40px);
  height: auto;
  margin: 0;
}

/* Modal header */
.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #111827;
}

/* Modal content */
.modal-content {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
  max-height: calc(100vh - 200px);
}

/* Form styles */
.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

/* Custom select styles */
.custom-select {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.selected-option {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  transition: all 0.2s;
  position: relative;
  z-index: 2;
}

.selected-option:hover {
  border-color: #9ca3af;
}

.dropdown-icon {
  transition: transform 0.2s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Global dropdown options */
.dropdown-options-global {
  position: fixed;
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10010;
  animation: fadeInDropdown 0.2s ease-out;
}

.option {
  padding: 10px 12px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.option:hover {
  background-color: #f3f4f6;
}

.option:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

/* Form fields */
.fields-group {
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  background-color: #f9fafb;
}

.form-field {
  margin-bottom: 20px;
}

.form-field:last-child {
  margin-bottom: 0;
}

.form-field label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-field input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-field input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

/* Info message */
.info-message {
  padding: 12px;
  background-color: #eff6ff;
  border-radius: 6px;
  color: #1e40af;
  font-size: 0.875rem;
  margin-bottom: 20px;
}

.info-message p {
  margin: 0;
}

.link {
  color: #1e40af;
  text-decoration: underline;
}

.link:hover {
  color: #1e3a8a;
}

/* Modal footer */
.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.submit-btn {
  padding: 8px 16px;
  background-color: #6366f1;
  border: 1px solid #6366f1;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover {
  background-color: #4f46e5;
  border-color: #4f46e5;
}

.submit-btn:disabled {
  background-color: #d1d5db;
  border-color: #d1d5db;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeInDropdown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Адаптивные стили для мобильных устройств */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
    align-items: flex-start;
  }

  .modal-container {
    max-height: calc(100vh - 20px);
  }

  .modal-content {
    max-height: calc(100vh - 160px);
  }

  .modal-header {
    padding: 12px 16px;
  }

  .modal-header h2 {
    font-size: 1.1rem;
  }

  .modal-footer {
    padding: 12px 16px;
  }

  .dropdown-options-global {
    max-height: 150px;
  }
}

/* Особые стили для альбомной ориентации */
@media (max-width: 768px) and (orientation: landscape) {
  .modal-overlay {
    padding: 5px;
    align-items: flex-start;
  }

  .modal-container {
    max-height: calc(100vh - 10px);
    max-width: 90%;
  }

  .modal-content {
    max-height: calc(100vh - 120px);
    padding: 12px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .selected-option,
  .form-field input {
    padding: 8px 10px;
    font-size: 0.8rem;
  }

  .info-message {
    padding: 8px 10px;
    font-size: 0.8rem;
  }

  .dropdown-options-global {
    max-height: 120px;
    z-index: 10011;
  }
}

/* Улучшения для очень маленьких экранов */
@media (max-width: 480px) {
  .modal-content {
    padding: 12px;
  }

  .form-group label,
  .form-field label {
    font-size: 0.8rem;
  }

  .selected-option,
  .form-field input {
    font-size: 0.8rem;
  }

  .cancel-btn,
  .submit-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .dropdown-options-global {
    max-height: 120px;
  }
}

/* Улучшения для iOS Safari */
@supports (-webkit-touch-callout: none) {
  .modal-content {
    max-height: calc(
      100vh - 200px - env(safe-area-inset-top) - env(safe-area-inset-bottom)
    );
  }

  @media (max-width: 768px) and (orientation: landscape) {
    .modal-content {
      max-height: calc(
        100vh - 120px - env(safe-area-inset-top) - env(safe-area-inset-bottom)
      );
    }

    .dropdown-options-global {
      max-height: calc(
        100vh - 150px - env(safe-area-inset-top) - env(safe-area-inset-bottom)
      );
    }
  }
}
</style>
