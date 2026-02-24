<template>
  <LoadModal
    :changeStationLoading="changeStationLoading"
    :stationLoading="stationLoading"
  />

  <div
    v-if="formLoadError"
    class="modal-overlay error-overlay"
    data-testid="form-error-overlay"
  >
    <div class="modal-container error-modal" data-testid="form-error-modal">
      <div class="modal-header error-header">
        <h2>Ошибка загрузки</h2>
      </div>
      <div class="modal-content error-content">
        <div class="error-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="24" cy="24" r="22" stroke="#ef4444" stroke-width="2" />
            <path
              d="M24 14V24M24 30H24.01"
              stroke="#ef4444"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <p class="error-message">{{ formLoadErrorMessage }}</p>
        <p class="error-hint" v-if="retryCount > 0">
          Попыток: {{ retryCount }}/{{ maxRetries }}
        </p>
      </div>
      <div class="modal-footer error-footer">
        <button
          class="cancel-btn"
          @click="closeFormError"
          data-testid="error-close-btn"
        >
          Закрыть
        </button>
        <button
          v-if="retryCount < maxRetries"
          class="submit-btn"
          @click="retryLoadForm"
          data-testid="error-retry-btn"
        >
          Повторить
        </button>
      </div>
    </div>
  </div>

  <div
    v-if="showIntegrationModal"
    class="modal-overlay"
    data-testid="integration-modal-overlay"
  >
    <div
      class="modal-container integration-modal"
      data-testid="integration-modal"
    >
      <div class="modal-header">
        <h2>Подтверждение интеграции</h2>
      </div>
      <div class="modal-content">
        <p class="integration-question">
          Интеграция установлена в
          <strong>{{ selectedCrmName }}</strong
          >?
        </p>
      </div>
      <div class="modal-footer">
        <button
          class="cancel-btn"
          @click="handleIntegrationNo"
          data-testid="integration-no-btn"
        >
          Нет
        </button>
        <button
          class="submit-btn"
          @click="handleIntegrationYes"
          data-testid="integration-yes-btn"
        >
          Да
        </button>
      </div>
    </div>
  </div>

  <div
    v-if="showWarningModal"
    class="modal-overlay"
    data-testid="warning-modal-overlay"
  >
    <div class="modal-container warning-modal" data-testid="warning-modal">
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
        <button
          class="submit-btn"
          @click="handleWarningConfirm"
          data-testid="warning-confirm-btn"
        >
          Продолжить создание
        </button>
      </div>
    </div>
  </div>

  <ModalFrame
    v-if="!stationLoading.loading && !formLoadError"
    :text="modalText"
    :close="openModal"
    :action="submitForm"
    :isDisabled="!isFormValid"
  >
    <div class="modal-content">
      <div v-if="showElement('group')" class="form-group">
        <label
          v-if="getLabel('group')"
          class="accounts-addAccounts-group-label"
          data-testid="group-label"
        >
          {{ getLabel("group") }}
        </label>
        <div class="custom-select" ref="groupSelect" data-testid="group-select">
          <div
            class="selected-option accounts-addAccounts-group-select"
            @click="toggleDropdown('group')"
            data-testid="group-select-button"
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
              data-testid="group-dropdown"
            >
              <div
                v-for="option in getOptions('group')"
                :key="option.value"
                class="option accounts-addAccounts-group-option"
                @click="selectOption('group', option.value)"
                :data-testid="`group-option-${option.value}`"
              >
                {{ option.text }}
              </div>
            </div>
          </teleport>
        </div>
      </div>

      <div v-if="showElement('messenger')" class="form-group">
        <label
          v-if="getLabel('messenger')"
          class="accounts-addAccounts-messenger-label"
          data-testid="messenger-label"
        >
          {{ getLabel("messenger") }}
        </label>
        <div
          class="custom-select"
          ref="messengerSelect"
          data-testid="messenger-select"
        >
          <div
            class="selected-option accounts-addAccounts-messenger-select"
            @click="toggleDropdown('messenger')"
            data-testid="messenger-select-button"
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
              data-testid="messenger-dropdown"
            >
              <div
                v-for="option in getOptions('messenger')"
                :key="option.value"
                class="option accounts-addAccounts-messenger-option"
                @click="selectOption('messenger', option.value)"
                :data-testid="`messenger-option-${option.value}`"
              >
                {{ option.text }}
              </div>
            </div>
          </teleport>
        </div>
      </div>

      <template v-if="formValues.group === 'messenger' && formValues.messenger">
        <div
          v-for="field in getDynamicFields('messenger', formValues.messenger)"
          :key="field.name"
          class="form-field"
        >
          <label
            :class="`accounts-addAccounts-${field.name}-label`"
            :data-testid="`${field.name}-label`"
          >
            {{ field.label }}
          </label>
          <input
            v-model="formValues[field.name]"
            type="text"
            :placeholder="field.placeholder"
            :required="field.required"
            :class="`accounts-addAccounts-${field.name}-input`"
            :data-testid="`${field.name}-input`"
          />
          <p
            v-if="field.hint"
            class="field-hint"
            :data-testid="`${field.name}-hint`"
          >
            {{ field.hint }}
          </p>
        </div>
      </template>

      <div v-if="showElement('type')" class="form-group">
        <label
          v-if="getLabel('type')"
          class="accounts-addAccounts-crmType-label"
          data-testid="type-label"
        >
          {{ getLabel("type") }}
        </label>
        <div class="custom-select" ref="typeSelect" data-testid="type-select">
          <div
            class="selected-option accounts-addAccounts-crmType-select"
            @click="toggleDropdown('type')"
            data-testid="type-select-button"
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
              data-testid="type-dropdown"
            >
              <div
                v-for="option in getOptions('type')"
                :key="option.value"
                class="option accounts-addAccounts-crmType-option"
                @click="handleCrmSelect(option.value, option.text)"
                :data-testid="`type-option-${option.value}`"
              >
                {{ option.text }}
              </div>
            </div>
          </teleport>
        </div>
      </div>

      <template v-if="formValues.group === 'crm' && formValues.type">
        <div
          v-for="field in getDynamicFields('type', formValues.type)"
          :key="field.name"
          class="form-field"
        >
          <label
            :class="`accounts-addAccounts-${field.name}-label`"
            :data-testid="`${field.name}-label`"
          >
            {{ field.label }}
          </label>
          <input
            v-model="formValues[field.name]"
            type="text"
            :placeholder="field.placeholder"
            :required="field.required"
            :class="`accounts-addAccounts-${field.name}-input`"
            :data-testid="`${field.name}-input`"
          />
          <p
            v-if="field.hint"
            class="field-hint"
            :data-testid="`${field.name}-hint`"
          >
            {{ field.hint }}
          </p>
        </div>
      </template>

      <div
        v-if="
          formValues.group === 'messenger' &&
          formValues.messenger === 'whatsapp'
        "
        class="info-message accounts-addAccounts-whatsapp-info"
        data-testid="whatsapp-info"
      >
        <p>
          Привязать номер своего Whatsapp можно будет после создания аккаунта
        </p>
      </div>

      <div
        v-if="
          formValues.group === 'messenger' && formValues.messenger === 'max'
        "
        class="info-message accounts-addAccounts-whatsapp-info"
        data-testid="whatsapp-info"
      >
        <p>Привязать номер своего Max можно будет после создания аккаунта</p>
      </div>

      <div
        v-if="
          formValues.group === 'messenger' &&
          formValues.messenger === 'telegram'
        "
        class="info-message accounts-addAccounts-telegram-info"
        data-testid="telegram-info"
      >
        <p>
          Привязать свой аккаунт Telegram можно будет после создания аккаунта
        </p>
      </div>

      <div
        v-if="formValues.group === 'sms'"
        class="info-message accounts-addAccounts-sms-warning"
        data-testid="sms-warning"
      >
        <p>
          Внимание! Если у вас нет телефона на ОС Android (не ниже версии 7.0),
          вы не сможете подключить канал СМС
        </p>
      </div>
    </div>
  </ModalFrame>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, reactive } from "vue";
import axios from "axios";
import LoadModal from "../LoadingMoadal/LoadModal.vue";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";

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

const modalText = ref({
  title: "Настройка интеграции",
  close: "Отмена",
  action: "Сохранить",
});

// State
const stationLoading = reactive({
  loading: false,
});

// Ошибка загрузки формы
const formLoadError = ref(false);
const formLoadErrorMessage = ref("");
const retryCount = ref(0);
const maxRetries = 3;

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
  crm_api_key: "",
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
  formLoadError.value = false;
  formLoadErrorMessage.value = "";

  try {
    const response = await axios.get(`${FRONTEND_URL_FORMS}getForm`, {
      timeout: 10000,
    });

    if (response.data.ok) {
      formElements.value = response.data.data;
      retryCount.value = 0;
    } else {
      throw new Error(
        response.data.message || "Не удалось загрузить структуру формы",
      );
    }
  } catch (error) {
    formLoadError.value = true;

    if (error.code === "ECONNABORTED") {
      formLoadErrorMessage.value =
        "Истекло время ожидания. Проверьте подключение к интернету";
    } else if (error.response?.status === 401) {
      formLoadErrorMessage.value =
        "Ошибка авторизации. Попробуйте заново войти";
    } else if (error.response?.status === 403) {
      formLoadErrorMessage.value = "У вас нет доступа к этой функции";
    } else if (error.response?.status === 404) {
      formLoadErrorMessage.value = "Форма не найдена на сервере";
    } else if (error.response?.status >= 500) {
      formLoadErrorMessage.value = "Ошибка сервера. Попробуйте позже";
    } else if (error.message === "Network Error") {
      formLoadErrorMessage.value =
        "Ошибка сети. Проверьте подключение к интернету";
    } else {
      formLoadErrorMessage.value = error.message || "Ошибка при загрузке формы";
    }

    console.error("Error fetching form structure:", error);
  } finally {
    stationLoading.loading = false;
  }
};

const retryLoadForm = async () => {
  if (retryCount.value < maxRetries) {
    retryCount.value += 1;
    await fetchFormStructure();
  } else {
    formLoadErrorMessage.value =
      "Не удалось загрузить форму после нескольких попыток. Обновите страницу";
  }
};

const closeFormError = () => {
  formLoadError.value = false;
  formLoadErrorMessage.value = "";
  props.openModal();
};

// Helper functions
const getSelectElement = (name) => {
  return formElements.value.find(
    (el) => el.element === "select" && el.name === name,
  );
};

const getLabel = (forAttr) => {
  const label = formElements.value.find(
    (el) => el.element === "label" && el.for === forAttr,
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
      el.value === selectedValue,
  );

  return option?.text_content || "";
};

// 🔑 ИЗМЕНЕНО: Универсальная функция получения динамических полей (и для CRM, и для Мессенджеров)
const getDynamicFields = (selectName, optionValue) => {
  const selectElement = getSelectElement(selectName);
  if (!selectElement) return [];

  // Ищем выбранную опцию внутри нужного селекта
  const targetOption = formElements.value.find(
    (el) =>
      el.element === "option" &&
      el.value === optionValue &&
      el.parent_id === selectElement.id,
  );

  if (!targetOption) return [];

  // Ищем все поля, привязанные к этой опции
  const fields = formElements.value.filter(
    (el) =>
      el.parent_id === targetOption.id &&
      (el.element === "input" || el.element === "label"),
  );

  const fieldMap = {};

  fields.forEach((field) => {
    if (field.element === "label") {
      fieldMap[field.for] = {
        name: field.for,
        label: field.text_content,
        required: false,
        placeholder: "",
        hint: null,
      };
    } else if (field.element === "input") {
      if (fieldMap[field.name]) {
        fieldMap[field.name].required = field.required || false;
        fieldMap[field.name].placeholder = field.placeholder || "";
      } else {
        fieldMap[field.name] = {
          name: field.name,
          label: "",
          required: field.required || false,
          placeholder: field.placeholder || "",
          hint: null,
        };
      }
    }
  });

  // Ищем подсказки (тег p)
  const hints = formElements.value.filter(
    (el) => el.parent_id === targetOption.id && el.element === "p",
  );
  hints.forEach((hint) => {
    const firstField = Object.values(fieldMap)[0];
    if (firstField) {
      firstField.hint = hint.text_content;
    }
  });

  return Object.values(fieldMap).filter((f) => f.name);
};

const showElement = (name) => {
  if (name === "group") return true;
  if (name === "messenger") return formValues.group === "messenger";
  if (name === "type") return formValues.group === "crm";
  return false;
};

// 🔑 ИЗМЕНЕНО: Обновленная валидация формы с учетом динамических полей мессенджеров
const isFormValid = computed(() => {
  if (!formValues.group) return false;

  if (formValues.group === "messenger") {
    if (!formValues.messenger) return false;

    // Проверка динамических полей для мессенджеров (например, токен VK)
    const requiredFields = getDynamicFields("messenger", formValues.messenger);
    return requiredFields.every((field) => {
      return field.required ? !!formValues[field.name] : true;
    });
  }

  if (formValues.group === "crm") {
    if (!formValues.type) return false;

    // Проверка динамических полей для CRM
    const requiredFields = getDynamicFields("type", formValues.type);
    return requiredFields.every((field) => {
      return field.required ? !!formValues[field.name] : true;
    });
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
    formValues.crm_api_key = "";
    // Очищаем потенциальные динамические поля, чтобы не тянуть старые данные
    Object.keys(formValues).forEach((key) => {
      if (
        !["group", "messenger", "type", "domain", "crm_api_key"].includes(key)
      ) {
        formValues[key] = "";
      }
    });
  }

  if (name === "type") {
    formValues.domain = "";
    formValues.crm_api_key = "";
  }

  dropdownOpen[name] = false;
};

// Обработка выбора CRM
const handleCrmSelect = (value, text) => {
  selectedCrmName.value = text;
  selectOption("type", value);

  if (text === "U-ON") {
    return;
  }

  showIntegrationModal.value = true;
};

// Обработчики для модальных окон
const handleIntegrationYes = () => {
  showIntegrationModal.value = false;
};

const handleIntegrationNo = () => {
  showIntegrationModal.value = false;
  showWarningModal.value = true;
};

const handleWarningConfirm = () => {
  showWarningModal.value = false;
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

// 🔑 ИЗМЕНЕНО: Сборка и отправка данных для всех типов
const submitForm = async () => {
  const formData = {
    group: formValues.group,
    messenger: formValues.messenger,
    type: formValues.type,
  };

  // Собираем поля в зависимости от выбранной группы
  if (formValues.group === "crm" && formValues.type) {
    const fields = getDynamicFields("type", formValues.type);
    fields.forEach((field) => {
      if (formValues[field.name]) {
        formData[field.name] = formValues[field.name];
      }
    });
  } else if (formValues.group === "messenger" && formValues.messenger) {
    const fields = getDynamicFields("messenger", formValues.messenger);
    fields.forEach((field) => {
      if (formValues[field.name]) {
        formData[field.name] = formValues[field.name];
      }
    });
  }

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
      },
    );

    if (response.data.ok) {
      emit("submit", formData);
      if (props.openModal) {
        props.openModal(); // Закрываем модалку при успехе
      }
      handleSomeAction(); // Если нужно обновить список аккаунтов
    }
  } catch (error) {
    console.error("Ошибка при отправке формы:", error);
    // Здесь можно добавить обработку ошибки отправки (например, показать тост)
  } finally {
    stationLoading.loading = false;
  }
};
</script>

<style scoped>
/* Ошибка загрузки */
.error-overlay {
  z-index: 1003;
}

.error-modal {
  max-width: 400px;
  z-index: 1003;
}

.error-header {
  border-bottom-color: #fee2e2;
}

.error-header h2 {
  color: #dc2626;
}

.error-content {
  text-align: center;
  padding: 30px 20px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.error-icon {
  margin-bottom: 8px;
}

.error-icon svg circle,
.error-icon svg path {
  stroke: #ef4444;
}

.error-message {
  margin: 0;
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.5;
  font-weight: 500;
}

.error-hint {
  margin: 0;
  font-size: 0.8rem;
  color: #9ca3af;
  font-style: italic;
}

.error-footer {
  gap: 12px;
}

.error-footer .submit-btn {
  background-color: #ef4444;
  border-color: #ef4444;
}

.error-footer .submit-btn:hover {
  background-color: #dc2626;
  border-color: #dc2626;
}

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

.field-hint {
  margin-top: 6px;
  font-size: 0.8rem;
  color: #6b7280;
  font-style: italic;
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

/* SMS warning */
.accounts-addAccounts-sms-warning {
  background-color: #fee2e2;
  color: #991b1b;
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
