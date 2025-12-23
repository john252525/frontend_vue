// composables/usePhoneFormatter.js
import { ref, reactive, nextTick } from "vue";

export const usePhoneFormatter = () => {
  // Ссылка на DOM-элемент инпута
  const phoneInput = ref(null);

  const state = reactive({
    phoneNumber: "",
    formattedPhone: "",
    showMask: true,
    errorPhone: false,
  });

  /**
   * Обработка ввода телефона с форматированием
   * Формат: +7 (XXX) XXX-XX-XX
   */
  const formatPhone = () => {
    const value = state.phoneNumber;
    const cursorPosition = phoneInput.value
      ? phoneInput.value.selectionStart
      : 0;

    if (value === "") {
      state.showMask = true;
      return;
    }

    // Преобразование просто "7" или "+" в "+7"
    if (value === "+") {
      state.phoneNumber = "+7";
      nextTick(() => {
        if (phoneInput.value) phoneInput.value.setSelectionRange(2, 2);
      });
      return;
    }

    if (value === "7") {
      state.phoneNumber = "+7";
      nextTick(() => {
        if (phoneInput.value) phoneInput.value.setSelectionRange(2, 2);
      });
      return;
    }

    // Извлекаем только цифры и знак "+"
    let digits = value.replace(/[^\d+]/g, "");

    if (digits.startsWith("+")) {
      digits = "+" + digits.substring(1).replace(/\D/g, "");
    } else {
      digits = digits.replace(/\D/g, "");
    }

    // Считаем количество цифр (без +)
    const digitsCount = digits.startsWith("+")
      ? digits.length - 1
      : digits.length;

    // Если больше 11 цифр - показываем без маски
    if (digitsCount > 11) {
      state.showMask = false;
      state.phoneNumber = digits;
      return;
    } else {
      state.showMask = true;
    }

    // Форматируем с маской
    if (state.showMask) {
      let formatted = "";

      if (digits.startsWith("+")) {
        formatted = "+";
        digits = digits.substring(1);
      }

      // +7
      if (digits.length > 0) {
        if (formatted === "+" && digits[0] !== "7") {
          digits = "7" + digits;
        }
        formatted += digits[0];
        digits = digits.substring(1);
      }

      // +7 (XXX
      if (digits.length > 0) {
        formatted += " (" + digits.substring(0, 3);
        digits = digits.substring(3);
      }

      // +7 (XXX) XXX
      if (digits.length > 0) {
        formatted += ") " + digits.substring(0, 3);
        digits = digits.substring(3);
      }

      // +7 (XXX) XXX-XX
      if (digits.length > 0) {
        formatted += "-" + digits.substring(0, 2);
        digits = digits.substring(2);
      }

      // +7 (XXX) XXX-XX-XX
      if (digits.length > 0) {
        formatted += "-" + digits.substring(0, 2);
      }

      state.phoneNumber = formatted;

      // Корректируем позицию курсора
      nextTick(() => {
        if (!phoneInput.value) return;

        let newCursorPos = cursorPosition;
        const changes = state.phoneNumber.length - value.length;

        if (changes > 0) {
          newCursorPos += changes;
        }

        newCursorPos = Math.min(newCursorPos, state.phoneNumber.length);
        phoneInput.value.setSelectionRange(newCursorPos, newCursorPos);
      });
    }
  };

  /**
   * Обработка клавиши Delete/Backspace
   */
  const handleBackspace = (e) => {
    const value = state.phoneNumber;
    const cursorPosition = phoneInput.value
      ? phoneInput.value.selectionStart
      : 0;

    if (!state.showMask) return;

    // Если пытаемся удалить первые символы "+7"
    if (value === "+7" && cursorPosition <= 2) {
      state.phoneNumber = "";
      e.preventDefault();
      return;
    }

    if (value.startsWith("+7") && cursorPosition === 2) {
      state.phoneNumber = "";
      e.preventDefault();
      return;
    }

    // Пропускаем удаление символов форматирования (пробелы, скобки, тире)
    if (
      cursorPosition > 0 &&
      [" ", "(", ")", "-"].includes(value[cursorPosition - 1])
    ) {
      e.preventDefault();
      phoneInput.value.setSelectionRange(
        cursorPosition - 1,
        cursorPosition - 1
      );
    }
  };

  /**
   * Получить телефон в международном формате (только цифры)
   */
  const getInternationalFormat = () => {
    return state.phoneNumber.replace(/\D/g, "");
  };

  /**
   * Валидация телефонного номера
   */
  const validatePhone = () => {
    const digits = getInternationalFormat();
    const isValid = digits.length >= 8;
    state.errorPhone = !isValid;
    return isValid;
  };

  /**
   * Очистка формы
   */
  const clearPhone = () => {
    state.phoneNumber = "";
    state.showMask = true;
    state.errorPhone = false;
  };

  return {
    phoneInput,
    state,
    formatPhone,
    handleBackspace,
    getInternationalFormat,
    validatePhone,
    clearPhone,
  };
};
