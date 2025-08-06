<template>
  <div class="mailing-creator">
    <div class="creator-body">
      <div class="blocks-container">
        <!-- Блок контактов -->
        <div class="creator-block">
          <div class="block-header">
            <div class="block-number">1</div>
            <h2>Контакты</h2>
          </div>

          <div class="block-content">
            <div class="form-group">
              <label>Введите номера:</label>
              <textarea
                v-model="inputText"
                class="form-control"
                :class="{ 'input-error': messageContactError }"
                rows="4"
                placeholder="По одному номеру на строку"
              ></textarea>
              <div v-if="messageContactError" class="error-message">
                Необходимо указать номера
              </div>
            </div>
            <div class="form-group">
              <label>Колонка в базе:</label>
              <select v-model="selectedLetter" class="form-control">
                <option
                  v-for="letter in alphabet"
                  :key="letter"
                  :value="letter"
                >
                  {{ letter }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Или загрузите файл:</label>
              <div class="file-upload-wrapper">
                <label
                  class="file-upload-label"
                  :class="{ 'input-error': errorFile }"
                >
                  {{ otherFile ? otherFile.name : "Выберите файл" }}
                  <input
                    type="file"
                    @change="handleOtherFileUpload"
                    class="file-input"
                  />
                </label>
                <button
                  v-if="otherFile"
                  @click="otherFile = null"
                  class="file-clear-btn"
                >
                  &times;
                </button>
              </div>
              <div v-if="errorFile" class="error-message">
                Необходим файл или номера
              </div>
            </div>
            <div class="creator-footer">
              <button @click="cancelMailing" class="btn-cancel">
                Отменить
              </button>
              <button @click="createMailing" class="btn-submit">
                Создать рассылку
              </button>
            </div>
          </div>
        </div>

        <!-- Блок сообщения -->
        <div class="creator-block">
          <div class="block-header">
            <div class="block-number">2</div>
            <h2>Сообщение</h2>
          </div>

          <div class="block-content">
            <div class="form-group">
              <label>Введите текст сообщения:</label>
              <textarea
                v-model="messageText"
                class="form-control"
                :class="{ 'input-error': messageError }"
                rows="6"
                placeholder="Текст сообщения"
              ></textarea>
              <div v-if="messageError" class="error-message">
                Введите текст сообщения
              </div>
            </div>

            <div class="form-group">
              <label>Добавить вложение:</label>
              <div class="file-upload-wrapper">
                <label class="file-upload-label">
                  {{ imageFile ? imageFile.name : "Выберите изображение" }}
                  <input
                    type="file"
                    @change="handleImageUpload"
                    accept="image/*"
                    class="file-input"
                  />
                </label>
                <button
                  v-if="imageFile"
                  @click="imageFile = null"
                  class="file-clear-btn"
                >
                  &times;
                </button>
              </div>
              <div v-if="imagePreview" class="image-preview">
                <img :src="imagePreview" alt="Превью" />
              </div>
            </div>
          </div>
        </div>

        <!-- Блок настроек -->
        <div class="creator-block">
          <div class="block-header">
            <div class="block-number">3</div>
            <h2>Настройки</h2>
          </div>

          <div class="block-content">
            <div class="form-group">
              <label>Название:</label>
              <input
                v-model="nameMailing"
                type="text"
                class="form-control"
                placeholder="Название рассылки"
              />
            </div>

            <div class="form-group">
              <label>Дни отправки:</label>
              <div class="days-container">
                <label
                  v-for="(day, index) in days"
                  :key="index"
                  class="day-item"
                  :class="{ active: selectedDays.includes(index + 1) }"
                >
                  <input
                    type="checkbox"
                    :value="index + 1"
                    v-model="selectedDays"
                    class="day-checkbox"
                  />
                  {{ day }}
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Время отправки:</label>
              <div class="time-range">
                <input type="time" v-model="startTime" class="time-input" />
                <span class="time-separator">—</span>
                <input type="time" v-model="endTime" class="time-input" />
              </div>
            </div>

            <div class="form-group">
              <label>Интервал (мин):</label>
              <div class="interval-range">
                <select v-model="startNum" class="interval-select">
                  <option v-for="minute in minutes" :value="minute">
                    {{ minute }}
                  </option>
                </select>
                <span class="interval-separator">—</span>
                <select v-model="endNum" class="interval-select">
                  <option v-for="minute in minutes" :value="minute">
                    {{ minute }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Доп. настройки:</label>
              <div class="options-list">
                <label class="option-item">
                  <input type="checkbox" v-model="removeDuplicates" />
                  <span class="option-checkmark"></span>
                  Удалять дубликаты
                </label>
                <label class="option-item">
                  <input type="checkbox" v-model="sendOnlyExistingDialogs" />
                  <span class="option-checkmark"></span>
                  Только диалоги
                </label>
                <label class="option-item">
                  <input type="checkbox" v-model="sendMessagesRandomOrder" />
                  <span class="option-checkmark"></span>
                  Случайный порядок
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, computed, inject } from "vue";
import axios from "axios";
import LoadMoadal from "@/components/Accounts/Accounts/LoadingMoadal/LoadModal.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const props = defineProps({
  station: {
    type: Object,
  },
  changeAddMailing: {
    type: Function,
  },
});

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const stationLoading = reactive({
  loading: false,
});

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
    // Optionally, update the error message ref
  }
};

import { useRouter } from "vue-router";
const router = useRouter();

const stations = inject("station");
const { station } = toRefs(props);
const days = ref(["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]);

const selectedDays = ref([1, 2, 3, 4, 5]);
const removeDuplicates = ref(true);
const sendOnlyExistingDialogs = ref(true);
const sendMessagesRandomOrder = ref(false);
const messageText = ref("");
const nameMailing = ref("");
const inputText = ref("");
const imageFile = ref(null);
const otherFile = ref(null);
const imagePreview = ref(null);
const messageError = ref(false);
const messageContactError = ref(false);
const errorFile = ref(false);
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const resultString = computed(() => {
  // Разбиваем текст на массив строк, фильтруем пустые строки и объединяем в строку через запятую
  return inputText.value
    .split("\n")
    .filter((item) => item.trim() !== "")
    .join(", ");
});

import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();

const alphabet = ref(
  Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
);
const selectedLetter = ref(alphabet.value[0]); // По умолчанию первая буква алфавита
const letter = ref(selectedLetter.value); // Инициализируем текущей выбранной буквой

const selectAlphavit = (item) => {
  letter.value = item;
};

// Обработчик загрузки картинки
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const navigateTo = (page) => {
  router.push(page);
};

// Обработчик загрузки другого файла
const handleOtherFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    otherFile.value = file;
  }
};

const startTime = ref("10:00");
const endTime = ref("17:00");

const minutes = Array.from({ length: 1440 }, (_, index) => index + 1);

const startNum = ref(10);
const endNum = ref(17);

// Функция для обновления выбранных дней
const updateSelectedDays = () => {};

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};
const apiUrl = import.meta.env.VITE_WHATSAPI_URL;

async function createWhatsAppBroadcast() {
  const url = `${apiUrl}/new/`;
  stationLoading.loading = true;

  // Создаем FormData для отправки файлов
  const formData = new FormData();

  // Добавляем текстовые данные
  formData.append("name", nameMailing.value);
  formData.append("base", inputText.value);
  formData.append("text", messageText.value);
  formData.append("days", JSON.stringify(selectedDays.value));
  formData.append("time_from", startTime.value);
  formData.append("time_to", endTime.value);
  formData.append("delay_from", startNum.value);
  formData.append("delay_to", endNum.value);
  formData.append("uniq", removeDuplicates.value);
  formData.append("exist", sendOnlyExistingDialogs.value);
  formData.append("random", sendMessagesRandomOrder.value);
  formData.append("cascade", "whatsapp");
  formData.append("ph_col", letter.value);

  // Добавляем файлы, если они есть
  if (otherFile.value) {
    formData.append("file_base", otherFile.value);
  }
  if (imageFile.value) {
    formData.append("file", imageFile.value); // Убедитесь, что ключ 'file' соответствует ожиданиям сервера
  }

  try {
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      await handleSendLog(
        "mailing",
        "new",
        formData, // Изменил params на formData для логирования
        response.data.ok,
        response.data
      );
    }

    if (response.data.ok === true) {
      stationLoading.loading = false;
      setLoadingStatus(true, "success");
      props.changeAddMailing();
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      stationLoading.loading = false;
      setLoadingStatus(true, "error");
    }
  } catch (error) {
    console.error(
      "error",
      error.response ? error.response.data : error.message
    );
    stationLoading.loading = false;
    setLoadingStatus(true, "error");
  }
}

const createMailing = () => {
  if (otherFile.value === null && !inputText.value) {
    if (!inputText.value) {
      messageContactError.value = true;
    } else {
      messageContactError.value = false;
    }

    if (otherFile.value === null) {
      errorFile.value = true;
    } else {
      errorFile.value = false;
    }
  } else if (!messageText.value) {
    messageError.value = true;
    messageContactError.value = false;
    errorFile.value = false;
  } else {
    messageError.value = false;
    messageContactError.value = false;
    errorFile.value = false;
    createWhatsAppBroadcast();
  }
};
</script>

<style scoped>
/* Основные стили */
.mailing-creator {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.creator-header {
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #e1e5eb;
}

.creator-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
}

.creator-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.blocks-container {
  --min-block-width: 400px;
  --gap: 20px;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* grid-template-columns: repeat(auto-fit, minmax(var(--min-block-width), 1fr)); */
  gap: 20px;
  height: 100%;

  /* Для широких экранов - 3 колонки */
  /* @media (min-width: 1500px) {
    grid-template-columns: repeat(3, minmax(var(--min-block-width), 1fr));
    overflow: visible;
  } */

  /* Средние экраны - горизонтальный скролл */
  /* @media (max-width: 1499px) and (min-width: 1001px) {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 15px; 
  } */

  /* Узкие экраны - 2 колонки */
  @media (max-width: 1000px) and (min-width: 769px) {
    grid-template-columns: repeat(2, 1fr);
    overflow-y: auto;
  }

  /* Мобильные - 1 колонка */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
}

/* Блоки */
.creator-block {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;

  /* @media (max-width: 1499px) and (min-width: 1001px) {
    min-width: calc(1500 - 20);
    scroll-snap-align: start;
    flex: 0 0 auto;
  } */
}

.block-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #edf2f7;
}

.block-number {
  width: 28px;
  height: 28px;
  background: #4950ca;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  margin-right: 16px;
}

.block-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.block-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px; /* Место для кнопок */
}
/* Формы */
.form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
}

.form-control {
  box-sizing: border-box;
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  background: #f8fafc;
}

.form-control:focus {
  border-color: #4950ca;
  outline: none;
  box-shadow: 0 0 0 3px rgba(73, 80, 202, 0.1);
  background: white;
}

.input-error {
  border-color: #f56565 !important;
}

.error-message {
  color: #f56565;
  font-size: 13px;
  margin-top: 8px;
}

textarea.form-control {
  min-height: 120px;
  width: 400px;
  box-sizing: border-box;
  resize: vertical;
}

/* Загрузка файлов */
.file-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-upload-label {
  flex: 1;
  padding: 12px 16px;
  border: 1px dashed #cbd5e0;
  border-radius: 8px;
  background: #f8fafc;
  font-size: 14px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-upload-label:hover {
  border-color: #a0aec0;
  background: #edf2f7;
}

.file-input {
  display: none;
}

.file-clear-btn {
  background: none;
  border: none;
  color: #a0aec0;
  font-size: 20px;
  cursor: pointer;
  padding: 0 6px;
  line-height: 1;
}

.file-clear-btn:hover {
  color: #718096;
}

.image-preview {
  margin-top: 12px;
  max-width: 100%;
  max-height: 180px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

/* Дни недели */
.days-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.day-item {
  padding: 10px;
  text-align: center;
  border-radius: 6px;
  background: #f8fafc;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.day-item.active {
  background: #4950ca;
  color: white;
}

.day-checkbox {
  display: none;
}

/* Время и интервал */
.time-range,
.interval-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background: #f8fafc;
}

.time-separator {
  color: #a0aec0;
  font-size: 14px;
}

.interval-select {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background: #f8fafc;
  flex: 1;
}

.interval-separator {
  color: #a0aec0;
  font-size: 14px;
}

/* Опции */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #4a5568;
  cursor: pointer;
}

.option-checkmark {
  width: 16px;
  height: 16px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.option-item input:checked + .option-checkmark {
  background: #4950ca;
  border-color: #4950ca;
}

.option-item input:checked + .option-checkmark::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

@media (hover: hover) {
  .blocks-container {
    scroll-behavior: smooth;
  }
}

/* Кнопки */
.creator-footer {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 20px 0;
  margin-top: auto;
  border-top: 1px solid #e1e5eb;
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: white;
  border: 1px solid #e2e8f0;
  color: #4a5568;
}

.btn-cancel:hover {
  background: #f8fafc;
  border-color: #cbd5e0;
}

.btn-submit {
  background: #4950ca;
  border: none;
  color: white;
}

.btn-submit:hover {
  background: #3a40b0;
}

/* @media (max-width: 1500px) {
  textarea.form-control {
    min-height: 120px;
    width: 350px;
    box-sizing: border-box;
    resize: vertical;
  }

  .creator-block {
    height: 100%;
    width: 350px;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
}

@media (max-width: 1360px) {
  textarea.form-control {
    min-height: 120px;
    width: 300px;
    box-sizing: border-box;
    resize: vertical;
  }

  .creator-block {
    height: 100%;
    width: 300px;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
} */

@media (max-width: 1200px) {
  textarea.form-control {
    min-height: 120px;
    width: 300px;
    box-sizing: border-box;
    resize: vertical;
  }

  .creator-block {
    height: 100%;
    width: 300px;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .blocks-container {
    /* width: 300px; */
    gap: 20px;
  }
}

@media (max-width: 1000px) {
  textarea.form-control {
    min-height: 120px;
    width: 300px;
    box-sizing: border-box;
    resize: vertical;
  }

  .block-content {
    padding-bottom: 0px; /* Место для кнопок */
  }

  .creator-block {
    height: 100%;
    width: 300px;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
}

@media (max-width: 768px) {
  .creator-header {
    padding: 20px 24px;
  }

  .creator-body {
    padding: 20px;
  }

  .days-container {
    grid-template-columns: repeat(4, 1fr);
  }

  .creator-footer {
    flex-direction: column;
    gap: 12px;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .days-container {
    grid-template-columns: repeat(3, 1fr);
  }

  .block-content {
    padding: 20px;
  }

  .creator-header {
    padding: 16px 20px;
  }

  .creator-body {
    padding: 16px;
  }
}
</style
