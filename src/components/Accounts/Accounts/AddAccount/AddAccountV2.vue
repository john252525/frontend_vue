<template>
  <LoadModal
    :changeStationLoading="changeStationLoading"
    :stationLoading="stationLoading"
  />
  <div v-if="!stationLoading.loading" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Настройка интеграции</h2>
        <button class="close-btn" @click="openModal">&times;</button>
      </div>

      <div class="modal-content">
        <!-- Group Select -->
        <div v-if="showElement('group')" class="form-group">
          <label v-if="getLabel('group')">{{ getLabel("group") }}</label>
          <div class="custom-select" ref="groupSelect">
            <div class="selected-option" @click="toggleDropdown('group')">
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
            <div class="dropdown-options" v-show="dropdownOpen.group">
              <div
                v-for="option in getOptions('group')"
                :key="option.value"
                class="option"
                @click="selectOption('group', option.value)"
              >
                {{ option.text }}
              </div>
            </div>
          </div>
        </div>

        <!-- Messenger Select -->
        <div v-if="showElement('messenger')" class="form-group">
          <label v-if="getLabel('messenger')">{{
            getLabel("messenger")
          }}</label>
          <div class="custom-select" ref="messengerSelect">
            <div class="selected-option" @click="toggleDropdown('messenger')">
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
            <div class="dropdown-options" v-show="dropdownOpen.messenger">
              <div
                v-for="option in getOptions('messenger')"
                :key="option.value"
                class="option"
                @click="selectOption('messenger', option.value)"
              >
                {{ option.text }}
              </div>
            </div>
          </div>
        </div>

        <!-- CRM Select -->
        <div v-if="showElement('type')" class="form-group">
          <label v-if="getLabel('type')">{{ getLabel("type") }}</label>
          <div class="custom-select" ref="crmSelect">
            <div class="selected-option" @click="toggleDropdown('type')">
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
            <div class="dropdown-options" v-show="dropdownOpen.type">
              <div
                v-for="option in getOptions('type')"
                :key="option.value"
                class="option"
                @click="selectOption('type', option.value)"
              >
                {{ option.text }}
              </div>
            </div>
          </div>
        </div>

        <!-- Domain input for CRM -->
        <div
          v-if="formValues.group === 'crm' && formValues.type"
          class="form-field"
        >
          <label>Адрес аккаунта</label>
          <input
            v-model="formValues.domain"
            type="text"
            :placeholder="getDomainPlaceholder()"
            required
          />
        </div>

        <!-- Info messages -->
        <div
          v-if="
            formValues.group === 'messenger' &&
            formValues.messenger === 'whatsapp'
          "
          class="info-message"
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
          class="info-message"
        >
          <p>
            Привязать свой аккаунт Telegram можно будет после создания аккаунта
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="openModal">Отмена</button>
        <button class="submit-btn" @click="submitForm" :disabled="!isFormValid">
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

import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

// State
const stationLoading = reactive({
  loading: false,
});

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

// Fetch form structure from API
const fetchFormStructure = async () => {
  stationLoading.loading = true;
  try {
    const response = await axios.get(
      "https://bapi88.developtech.ru/api/v1/forms/getForm?referer=https://app2.touch-api.com/"
    );

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

// Handle clicks outside dropdowns
const handleClickOutside = (event) => {
  if (!event.target.closest(".custom-select")) {
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
      "https://bapi88.developtech.ru/api/v1/users/addAccount",
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
  z-index: 1000;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.3s ease-out;
  overflow-y: auto;
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
  margin: 20px;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
  height: 600px;
}

/* Modal header */
.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

/* Form styles */
.form-group {
  margin-bottom: 20px;
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

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: min(200px, 50vh);
  overflow-y: auto;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  margin-top: 4px;
  animation: fadeIn 0.2s ease-out;
}

.option {
  padding: 10px 12px;
  transition: background-color 0.2s;
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
</style>
