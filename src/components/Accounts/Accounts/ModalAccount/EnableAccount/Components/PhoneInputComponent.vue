<template>
  <section class="phone-input-section">
    <div class="section-header">
      <h3 class="section-title">Введите номер телефона</h3>
    </div>

    <div class="input-container">
      <div class="input-wrapper" :class="{ error: error }">
        <input
          :placeholder="
            showMask ? '+7 (___) ___-__-__' : 'Введите номер телефона'
          "
          @input="formatPhone"
          @keydown.delete="handleBackspace"
          class="phone-input"
          type="text"
          v-model="phoneNumber"
          ref="phoneInput"
        />
      </div>

      <div v-if="error" class="error-message">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
          />
        </svg>
        Введите корректный номер телефона
      </div>
    </div>

    <button
      @click="handleContinue"
      class="continue-button"
      :disabled="!isValidPhone || loading"
    >
      <span v-if="loading">Загрузка...</span>
      <span v-else>Продолжить</span>
    </button>
  </section>
</template>

<script setup>
import { ref, computed, nextTick, toRefs } from "vue";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const emit = defineEmits(["continue"]);

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const props = defineProps({
  selectedItem: {
    type: Object,
    required: true,
  },
  startFunction: {
    type: Function,
    required: true,
  },
});

import axios from "axios";
const phoneNumber = ref("");
const phoneInput = ref(null);
const error = ref(false);
const loading = ref(false);
const showMask = ref(true);

const { selectedItem } = toRefs(props);
const { source, login, storage } = selectedItem.value;

// Обработчик backspace
const handleBackspace = (e) => {
  const value = phoneNumber.value;
  const cursorPosition = phoneInput.value.selectionStart;

  if (!showMask.value) return;

  // Полное удаление +7 при нажатии Backspace на +7
  if (value === "+7" && cursorPosition <= 2) {
    phoneNumber.value = "";
    e.preventDefault();
    return;
  }

  // Удаление +7 при курсоре после них
  if (value.startsWith("+7") && cursorPosition === 2) {
    phoneNumber.value = "";
    e.preventDefault();
    return;
  }

  // Пропуск разделителей при удалении
  if (
    cursorPosition > 0 &&
    [" ", "(", ")", "-"].includes(value[cursorPosition - 1])
  ) {
    e.preventDefault();
    phoneInput.value.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
  }
};

// Форматирование телефона
const formatPhone = () => {
  const value = phoneNumber.value;
  const cursorPosition = phoneInput.value.selectionStart;

  if (value === "") {
    showMask.value = true;
    return;
  }

  // Автодобавление +7 при вводе + или 7
  if (value === "+") {
    phoneNumber.value = "+7";
    nextTick(() => phoneInput.value.setSelectionRange(2, 2));
    return;
  }

  if (value === "7") {
    phoneNumber.value = "+7";
    nextTick(() => phoneInput.value.setSelectionRange(2, 2));
    return;
  }

  let digits = value.replace(/[^\d+]/g, "");

  if (digits.startsWith("+")) {
    digits = "+" + digits.substring(1).replace(/\D/g, "");
  } else {
    digits = digits.replace(/\D/g, "");
  }

  const digitsCount = digits.startsWith("+")
    ? digits.length - 1
    : digits.length;

  if (digitsCount > 11) {
    showMask.value = false;
    phoneNumber.value = digits;
    return;
  } else {
    showMask.value = true;
  }

  if (showMask.value) {
    let formatted = "";

    if (digits.startsWith("+")) {
      formatted = "+";
      digits = digits.substring(1);
    }

    if (digits.length > 0) {
      if (formatted === "+" && digits[0] !== "7") {
        digits = "7" + digits;
      }
      formatted += digits[0];
      digits = digits.substring(1);
    }

    // Форматирование по маске
    if (digits.length > 0) {
      formatted += " (" + digits.substring(0, 3);
      digits = digits.substring(3);
    }

    if (digits.length > 0) {
      formatted += ") " + digits.substring(0, 3);
      digits = digits.substring(3);
    }

    if (digits.length > 0) {
      formatted += "-" + digits.substring(0, 2);
      digits = digits.substring(2);
    }

    if (digits.length > 0) {
      formatted += "-" + digits.substring(0, 2);
    }

    phoneNumber.value = formatted;

    nextTick(() => {
      let newCursorPos = cursorPosition;
      const changes = phoneNumber.value.length - value.length;

      if (changes > 0) {
        newCursorPos += changes;
      }

      newCursorPos = Math.min(newCursorPos, phoneNumber.value.length);
      phoneInput.value.setSelectionRange(newCursorPos, newCursorPos);
    });
  }
};

// Получаем номер в международном формате (только цифры)
const getInternationalFormat = () => {
  return phoneNumber.value.replace(/\D/g, "");
};

// Проверяем валидность номера
const isValidPhone = computed(() => {
  const digits = getInternationalFormat();
  return digits.length >= 11; // Минимум 11 цифр для международного формата
});

const enablePhoneAuth = async () => {
  const userNumber = getInternationalFormat();

  try {
    const params = {
      source: source,
      phone: userNumber,
      login: login,
      ...(storage && { storage: storage }),
    };

    const response = await axios.post(
      `${FRONTEND_URL}enablePhoneAuth`,
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data.status === "ok") {
      props.startFunction();
    } else {
      // Если ошибка, продолжаем попытки
      console.log("Ошибка получения QR, пробуем снова...");
    }
  } catch (error) {
    console.error("Ошибка при получении QR-кода:", error);
  }
};

// Обработка нажатия кнопки
const handleContinue = async () => {
  if (!isValidPhone.value) {
    error.value = true;
    return;
  }

  error.value = false;
  loading.value = true;

  await enablePhoneAuth();
};

// Фокусировка на инпуте
const focus = () => {
  if (phoneInput.value) {
    phoneInput.value.focus();
  }
};

// Очистка поля
const clear = () => {
  phoneNumber.value = "";
  error.value = false;
  loading.value = false;
  showMask.value = true;
};

// Установка загрузки
const setLoading = (value) => {
  loading.value = value;
};

// Установка ошибки
const setError = (value) => {
  error.value = value;
};

// Экспортируем методы для использования извне
defineExpose({
  focus,
  clear,
  setLoading,
  setError,
  getInternationalFormat,
  isValidPhone,
});
</script>

<style scoped>
.phone-input-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0;
}

.section-header {
  margin-bottom: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.section-description {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
  transition: all 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #3b82f6;
}

.input-wrapper.error {
  border-color: #ef4444;
}

.phone-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  background: transparent;
  padding: 0;
  width: 100%;
}

.phone-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #ef4444;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 6px;
}

.continue-button {
  width: 100%;
  height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.continue-button:not(:disabled):hover {
  background: #f8fafc;
  border-color: #d1d5db;
}

.continue-button:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

.hint {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

/* Адаптивность */
@media (max-width: 600px) {
  .section-title {
    font-size: 15px;
  }

  .section-description {
    font-size: 13px;
  }

  .phone-input {
    font-size: 13px;
  }

  .continue-button {
    height: 38px;
    font-size: 13px;
  }
}

@media (max-width: 400px) {
  .phone-input-section {
    gap: 16px;
  }

  .input-wrapper {
    padding: 10px 14px;
  }

  .hint {
    font-size: 11px;
    padding: 6px 10px;
  }
}
</style>
