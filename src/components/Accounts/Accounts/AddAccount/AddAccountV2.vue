<template>
  <LoadModal :stationLoading="stationLoading" />
  <div v-if="!stationLoading.loading" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Настройка интеграции</h2>
        <button class="close-btn" @click="openModal">&times;</button>
      </div>

      <div class="modal-content">
        <!-- Group Select -->
        <div class="form-group">
          <label>Тип интеграции</label>
          <div class="custom-select" ref="groupSelect">
            <div class="selected-option" @click="toggleDropdown('group')">
              <span>{{ getSelectedGroupText() || "Выберите тип" }}</span>
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
                v-for="option in groupOptions"
                :key="option.value"
                class="option"
                @click="selectOption('group', option.value)"
              >
                {{ option.text }}
              </div>
            </div>
          </div>
        </div>

        <!-- Messenger Select (shown when group is messenger) -->
        <div v-if="selectedGroup === 'messenger'" class="form-group">
          <label>Мессенджер</label>
          <div class="custom-select" ref="messengerSelect">
            <div class="selected-option" @click="toggleDropdown('messenger')">
              <span>{{
                getSelectedMessengerText() || "Выберите мессенджер"
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
                v-for="option in messengerOptions"
                :key="option.value"
                class="option"
                @click="selectOption('messenger', option.value)"
              >
                {{ option.text }}
              </div>
            </div>
          </div>
        </div>

        <!-- CRM Select (shown when group is crm) -->
        <div v-if="selectedGroup === 'crm'" class="form-group">
          <label>CRM система</label>
          <div class="custom-select" ref="crmSelect">
            <div class="selected-option" @click="toggleDropdown('crm')">
              <span>{{ getSelectedCrmText() || "Выберите CRM" }}</span>
              <svg
                class="dropdown-icon"
                :class="{ 'rotate-180': dropdownOpen.crm }"
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
            <div class="dropdown-options" v-show="dropdownOpen.crm">
              <div
                v-for="option in crmOptions"
                :key="option.value"
                class="option"
                @click="selectOption('crm', option.value)"
              >
                {{ option.text }}
              </div>
            </div>
          </div>
        </div>

        <!-- Phone input for Telegram -->
        <div
          v-if="
            selectedGroup === 'messenger' && selectedMessenger === 'telegram'
          "
          class="form-field"
        >
          <label>Номер телефона</label>
          <input
            v-model="phoneDisplay"
            @input="handlePhoneInput"
            @keydown.delete="handleBackspace"
            type="tel"
            :placeholder="
              isRussianFormat ? '+7 (___) ___-__-__' : 'Введите номер'
            "
            required
          />
        </div>

        <!-- Domain input for CRM -->
        <div v-if="selectedGroup === 'crm' && selectedCrm" class="form-field">
          <label>Адрес аккаунта</label>
          <input
            v-model="formValues.domain"
            type="text"
            :placeholder="getDomainPlaceholder()"
            required
          />
        </div>

        <!-- Info message for WhatsApp -->
        <div
          v-if="
            selectedGroup === 'messenger' && selectedMessenger === 'whatsapp'
          "
          class="info-message"
        >
          <p>
            Привязать номер своего Whatsapp можно будет после создания аккаунта
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
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  reactive,
} from "vue";
import axios from "axios";
import LoadModal from "../LoadingMoadal/LoadModal.vue";
const props = defineProps({
  isOpen: Boolean,
  openModal: {
    type: Function,
  },
});

const emit = defineEmits(["close", "submit"]);

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

// Selected values

const stationLoading = reactive({
  loading: false,
});
const selectedGroup = ref("");
const selectedMessenger = ref("");
const selectedCrm = ref("");

// Form values
const formValues = ref({
  phone: "",
  domain: "",
});

// Dropdown states
const dropdownOpen = ref({
  group: false,
  messenger: false,
  crm: false,
});

const phoneDisplay = ref("");
const isRussianFormat = ref(true);

// Options
const groupOptions = [
  { value: "messenger", text: "Мессенджер" },
  { value: "crm", text: "CRM" },
];

const messengerOptions = [
  { value: "whatsapp", text: "WhatsApp" },
  { value: "telegram", text: "Telegram" },
];

const crmOptions = [
  { value: "amocrm", text: "AmoCRM" },
  { value: "bitrix24", text: "Bitrix24" },
];

// Helper functions to get display text for selected values
const getSelectedGroupText = () => {
  const option = groupOptions.find((opt) => opt.value === selectedGroup.value);
  return option ? option.text : "";
};

const getSelectedMessengerText = () => {
  const option = messengerOptions.find(
    (opt) => opt.value === selectedMessenger.value
  );
  return option ? option.text : "";
};

const getSelectedCrmText = () => {
  const option = crmOptions.find((opt) => opt.value === selectedCrm.value);
  return option ? option.text : "";
};

const handlePhoneInput = (event) => {
  const input = event.target;
  let value = input.value.replace(/\D/g, "");
  let cursorPos = input.selectionStart;

  // Определяем, российский ли номер
  isRussianFormat.value = /^[78]/.test(value) && value.length <= 11;

  if (isRussianFormat.value) {
    // Форматируем российский номер
    let formattedValue = "+7";

    if (value.length > 1) {
      formattedValue += ` (${value.substring(1, 4)}`;
      cursorPos += value.length > 1 ? 2 : 0;
    }
    if (value.length > 4) {
      formattedValue += `) ${value.substring(4, 7)}`;
      cursorPos += value.length > 4 ? 2 : 0;
    }
    if (value.length > 7) {
      formattedValue += `-${value.substring(7, 9)}`;
      cursorPos += value.length > 7 ? 1 : 0;
    }
    if (value.length > 9) {
      formattedValue += `-${value.substring(9)}`;
      cursorPos += value.length > 9 ? 1 : 0;
    }

    phoneDisplay.value = formattedValue;
    formValues.value.phone = value;

    // Корректируем позицию курсора
    nextTick(() => {
      input.setSelectionRange(cursorPos, cursorPos);
    });
  } else {
    // Для не российских номеров
    phoneDisplay.value = value;
    formValues.value.phone = value;
  }
};

const handleBackspace = (event) => {
  if (!isRussianFormat.value) return;

  const input = event.target;
  const value = input.value;
  const cursorPos = input.selectionStart;

  // Если удаляем разделитель, удаляем предыдущую цифру
  if (cursorPos > 0 && /\D/.test(value[cursorPos - 1])) {
    event.preventDefault();
    const cleanValue = phoneDisplay.value.replace(/\D/g, "");
    const newValue =
      cleanValue.substring(0, cursorPos - 2) +
      cleanValue.substring(cursorPos - 1);
    phoneDisplay.value = newValue;
    handlePhoneInput({
      target: { value: newValue, selectionStart: cursorPos - 1 },
    });
  }
};

// Refs for dropdown elements
const groupSelect = ref(null);
const messengerSelect = ref(null);
const crmSelect = ref(null);

// Get domain placeholder based on selected CRM
const getDomainPlaceholder = () => {
  if (selectedCrm.value === "amocrm") return "account.amocrm.ru";
  if (selectedCrm.value === "bitrix24") return "account.bitrix24.ru";
  return "Введите адрес аккаунта";
};

// Form validation
const isFormValid = computed(() => {
  if (!selectedGroup.value) return false;

  if (selectedGroup.value === "messenger") {
    if (!selectedMessenger.value) return false;
    if (selectedMessenger.value === "telegram" && !formValues.value.phone)
      return false;
  }

  if (selectedGroup.value === "crm") {
    if (!selectedCrm.value) return false;
    if (!formValues.value.domain) return false;
  }

  return true;
});

// Handle clicks outside dropdowns
const handleClickOutside = (event) => {
  if (groupSelect.value && !groupSelect.value.contains(event.target)) {
    dropdownOpen.value.group = false;
  }
  if (messengerSelect.value && !messengerSelect.value.contains(event.target)) {
    dropdownOpen.value.messenger = false;
  }
  if (crmSelect.value && !crmSelect.value.contains(event.target)) {
    dropdownOpen.value.crm = false;
  }
};

// Set up event listeners
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Dropdown methods
const toggleDropdown = (name) => {
  // Close all other dropdowns
  Object.keys(dropdownOpen.value).forEach((key) => {
    if (key !== name) dropdownOpen.value[key] = false;
  });
  // Toggle current dropdown
  dropdownOpen.value[name] = !dropdownOpen.value[name];
};

const selectOption = (name, value) => {
  if (name === "group") {
    selectedGroup.value = value;
    selectedMessenger.value = "";
    selectedCrm.value = "";
    formValues.value.phone = "";
    formValues.value.domain = "";
  } else if (name === "messenger") {
    selectedMessenger.value = value;
    formValues.value.phone = "";
  } else if (name === "crm") {
    selectedCrm.value = value;
    formValues.value.domain = "";
  }

  dropdownOpen.value[name] = false;
};

const submitForm = async () => {
  const formData = {
    group: selectedGroup.value,
    ...(selectedGroup.value === "messenger" && {
      messenger: selectedMessenger.value,
      ...(selectedMessenger.value === "telegram" && {
        phone: formValues.value.phone,
      }),
    }),
    ...(selectedGroup.value === "crm" && {
      type: selectedCrm.value,
      domain: formValues.value.domain,
    }),
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
      location.reload();
      props.openModal();
    } else {
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
