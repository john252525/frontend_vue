<template>
  <section class="file-section">
    <section class="message-section">
      <article class="alphabet-comp">
        <h2 class="title">Столбец с номером телефона:</h2>
        <select v-model="selectedLetter" class="alphabet-select">
          <option v-for="letter in alphabet" :key="letter" :value="letter">
            {{ letter }}
          </option>
        </select>
      </article>
      <article class="textarea-comp">
        <textarea
          v-if="messageError"
          :class="{ active: station.text }"
          v-model="messageText"
          class="message-text-error"
          placeholder="В тексте можно использовать данные из загружаемой базы.
Пример: %G% (где G - другой столбец)"
          name="text"
          id="text"
        ></textarea>
        <textarea
          v-else
          :class="{ active: station.text }"
          v-model="messageText"
          class="message-text"
          placeholder="В тексте можно использовать данные из загружаемой базы.
Пример: %G% (где G - другой столбец)"
          name="text"
          id="text"
        ></textarea>
        <textarea
          :class="{ active: station.text }"
          v-if="station.text && !messageContactError"
          placeholder="79111111111;ольга
79111111111;иван          "
          v-model="inputText"
          @input="updateArray"
          class="message-text"
          name="text"
          id="text"
        ></textarea>
        <textarea
          :class="{ active: station.text }"
          v-if="station.text && messageContactError"
          placeholder="79111111111;ольга
79111111111;иван          "
          v-model="inputText"
          @input="updateArray"
          class="message-text-error"
          name="text"
          id="text"
        ></textarea>
      </article>
      <article v-if="station.file" class="file-upload-comp">
        <div class="file-upload-container">
          <label
            for="other-upload"
            class="file-upload-label"
            :class="{ error: errorFile }"
            >Загрузить файл</label
          >
          <input
            type="file"
            id="other-upload"
            @change="handleOtherFileUpload"
            class="file-input"
          />
          <div v-if="otherFile" class="file-preview">
            <p class="file-name">{{ otherFile.name }}</p>
          </div>
        </div>
      </article>
    </section>
    <section class="info-section">
      <article class="name-comp">
        <h2 class="title">Название:</h2>
        <input v-model="nameMailing" type="text" class="name-input" />
      </article>
      <article class="upload-file-comp">
        <div class="file-upload-container">
          <div class="file-cont">
            <h2 class="title">Картинка:</h2>
            <label for="image-upload" class="file-upload-label"
              >Загрузить файл</label
            >
            <input
              type="file"
              id="image-upload"
              @change="handleImageUpload"
              accept="image/*"
              class="file-input"
            />
          </div>
          <div v-if="imageFile" class="file-preview">
            <p class="file-name">{{ imageFile.name }}</p>
          </div>
        </div>
      </article>

      <article class="days-comp">
        <h2 class="title">Дни недели:</h2>
        <div class="checkbox-group">
          <div
            v-for="(day, index) in days"
            :key="index"
            class="checkbox-container"
          >
            <input
              type="checkbox"
              :id="'day-' + (index + 1)"
              :value="index + 1"
              v-model="selectedDays"
              @change="updateSelectedDays"
            />
            <label :for="'day-' + (index + 1)">
              <span class="custom-checkbox"></span>
              {{ day }}
            </label>
          </div>
        </div>
      </article>

      <article class="title-comp">
        <h2 class="title">Время (по МСК):</h2>
        <div class="time-selection">
          <label for="start-time">c</label>
          <input
            type="time"
            id="start-time"
            v-model="startTime"
            @change="updateTimes"
          />
        </div>
        <div class="time-selection">
          <label for="end-time">по</label>
          <input
            type="time"
            id="end-time"
            v-model="endTime"
            @change="updateTimes"
          />
        </div>
      </article>
      <article class="time-comp">
        <h2 class="title">Задержка между сообщениями:</h2>
        <div class="time-selection">
          <label for="start-num">с</label>
          <select class="time-select" id="start-num" v-model="startNum">
            <option v-for="minute in minutes" :key="minute" :value="minute">
              {{ minute }}
            </option>
          </select>
        </div>
        <div class="time-selection">
          <label for="end-num">по</label>
          <select class="time-select" id="end-num" v-model="endNum">
            <option v-for="minute in minutes" :key="minute" :value="minute">
              {{ minute }}
            </option>
          </select>
          <p class="min">мин.</p>
        </div>
      </article>
    </section>
    <section class="settings-section">
      <article class="remove-duplicates-comp">
        <div class="checkbox-container">
          <input
            type="checkbox"
            id="remove-duplicates"
            v-model="removeDuplicates"
          />
          <label for="remove-duplicates">
            <span class="custom-checkbox"></span>
            Удалить дубликаты контактов
          </label>
        </div>

        <div class="checkbox-container">
          <input
            type="checkbox"
            id="existing-dialogs"
            v-model="sendOnlyExistingDialogs"
          />
          <label for="existing-dialogs">
            <span class="custom-checkbox"></span>
            Отправка только по уже существующим диалогам
          </label>
        </div>

        <div class="checkbox-container">
          <input
            type="checkbox"
            id="random-order"
            v-model="sendMessagesRandomOrder"
          />
          <label for="random-order">
            <span class="custom-checkbox"></span>
            Отправлять сообщения в случайном порядке
          </label>
        </div>
      </article>
    </section>
    <button @click="createMailing" class="create">Создать</button>
  </section>
</template>

<script setup>
import { ref, toRefs, computed, inject } from "vue";
import axios from "axios";
const props = defineProps({
  station: {
    type: Object,
  },
});
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
const resultString = computed(() => {
  // Разбиваем текст на массив строк, фильтруем пустые строки и объединяем в строку через запятую
  return inputText.value
    .split("\n")
    .filter((item) => item.trim() !== "")
    .join(", ");
});

const alphabet = ref(
  Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
);
const selectedLetter = ref(alphabet.value[0]);

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
    console.log("Загруженная картинка:", imageFile.value);
  }
};

// Обработчик загрузки другого файла
const handleOtherFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    otherFile.value = file;
    console.log("Загруженный файл:", otherFile.value);
  }
};

const startTime = ref("10:00");
const endTime = ref("17:00");

const minutes = Array.from({ length: 1440 }, (_, index) => index + 1);

const startNum = ref(10);
const endNum = ref(17);

// Функция для обновления выбранных дней
const updateSelectedDays = () => {
  console.log("Выбранные дни:", selectedDays.value);
};

async function createWhatsAppBroadcast() {
  const url = "https://whatsapi.ru/ru/api/autosend/whatsapp/new/";

  // Параметры запроса
  const params = {
    token: "d7039fe337873da68d28945cd6e5c61d",
    name: nameMailing.value,
    base: inputText.value,
    file_base: otherFile.value,
    text: messageText.value, // Обязательный параметр
    days: selectedDays.value, // Необязательно, по умолчанию 1-5
    time_from: startTime.value, // Необязательно, по умолчанию 10:00
    time_to: endTime.value, // Необязательно, по умолчанию 17:00
    delay_from: startNum.value, // Необязательно, по умолчанию 900 секунд
    delay_to: endNum.value, // Необязательно, по умолчанию 2700 секунд
    uniq: removeDuplicates.value, // Необязательно, по умолчанию true
    exist: sendOnlyExistingDialogs.value, // Необязательно, по умолчанию true
    random: sendMessagesRandomOrder.value, // Необязательно, по умолчанию false
    cascade: "whatsapp", // Необязательно, по умолчанию whatsapp
  };

  try {
    const response = await axios.post(url, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (response.data.ok === true) {
      console.log(startNum.value);
      console.log("Ответ от API:", response.data);
      location.reload();
    } else {
      console.log("ошибка");
    }
  } catch (error) {
    console.error(
      "Ошибка при отправке запроса:",
      error.response ? error.response.data : error.message
    );
  }
}

const createMailing = () => {
  if (stations.file === true) {
    if (otherFile.value === null) {
      errorFile.value = true;
    } else {
      errorFile.value = false;
    }
    if (otherFile.value != null && messageText.value) {
      createWhatsAppBroadcast();
    }
  } else {
    if (!inputText.value) {
      messageContactError.value = true;
    } else {
      messageContactError.value = false;
    }
    if (inputText.value && messageText.value) {
      createWhatsAppBroadcast();
    }
  }
  if (!messageText.value) {
    messageError.value = true;
  } else {
    messageError.value = false;
  }
};
</script>

<style scoped>
.message-text {
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  width: 590px;
  height: 103px;
  background: #f6f6f6;
  padding-left: 10px;
  padding-top: 10px;
  max-width: 574px;
  min-width: 574px;
  max-height: 97px;
  min-height: 97px;
}

.message-text-error {
  border: 1px solid #fa7171;
  border-radius: 10px;
  width: 590px;
  height: 103px;
  background: #f6f6f6;
  padding-left: 10px;
  padding-top: 10px;
  max-width: 574px;
  min-width: 574px;
  max-height: 97px;
  min-height: 97px;
}

.message-text-error.active {
  max-width: 255px;
  min-width: 255px;
  max-height: 97px;
  min-height: 97px;
}

.message-text.active {
  max-width: 255px;
  min-width: 255px;
  max-height: 97px;
  min-height: 97px;
}

.file-section {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  gap: 20px;
  margin-top: 0px;
}

.message-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.remove-duplicates-comp {
  display: flex;
  flex-direction: column;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.days-comp {
  display: flex;
  align-items: center;
  gap: 14px;
}

.title {
  font-weight: 600;
  font-size: 16px;
  color: #000;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox-container {
  display: flex;
  position: relative;
  margin: 10px 0;
}

input[type="checkbox"] {
  display: none; /* Скрываем стандартный чекбокс */
}

label {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding-left: 20px;
  position: relative;
}

.custom-checkbox {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  border-radius: 4px; /* Скругление углов */
  background-color: #d9d9d9; /* Цвет фона */
  transition: background-color 0.2s, border-color 0.2s;
}

input[type="checkbox"]:checked + label .custom-checkbox {
  background-color: #4950ca; /* Цвет фона при выборе */
}

input[type="checkbox"]:checked + label .custom-checkbox::after {
  content: "";
  position: absolute;
  left: 6px;
  top: 2.5px;
  width: 3px;
  height: 7px;
  border: solid white; /* Цвет галочки */
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.time-selection {
  display: flex;
  align-items: center;
}

.title-comp {
  display: flex;
  align-items: center;
}

input[type="time"] {
  padding: 6px;
  border: 1px solid #000;
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s;
  margin-left: 6px;
}

input[type="time"]:focus {
  border-color: #0056b3;
}

.time-comp {
  display: flex;
  align-items: center;
}

.time-select {
  padding: 6px;
  border: 1px solid #000;
  border-radius: 3px;
  outline: none;
  transition: border-color 0.3s;
  margin-left: 6px;
}

.min {
  margin-left: 6px;
}

.upload-file-comp {
  display: flex;
  align-items: center;
}

.file-upload-container {
  position: relative;
}

.file-cont {
  display: flex;
  align-items: center;
  gap: 14px;
}

.file-upload-label {
  margin-right: 10px;
}

.file-input {
  display: none; /* Скрываем стандартный input */
}

.file-upload-label {
  display: inline-block;
  padding: 4px 8px;
  background-color: #4950ca;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
}

.file-upload-label.error {
  background-color: #e65f5f;
}

.file-upload-label:hover {
  background-color: #3748a1;
}

.file-preview {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.image-preview {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
  margin-right: 10px;
}

.file-name {
  font-size: 14px;
  color: #333;
}

/* Стили для нового раздела алфавита */
.alphabet-comp {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 20px;
}

.alphabet-select {
  padding: 6px;
  border: 1px solid #000;
  border-radius: 3px;
  outline: none;
  transition: border-color 0.3s;
}

.alphabet-select:focus {
  border-color: #0056b3;
}

.create {
  border-radius: 5px;
  width: 100%;
  height: 38px;
  background: #4950ca;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  transition: all 0.25s;
}

.name-comp {
  display: flex;
  align-items: center;
  gap: 14px;
}

.name-input {
  border: 1px solid #000;
  border-radius: 3px;
  padding: 4px 16px;
  width: 90px;
  height: 20px;
}

.textarea-comp {
  display: flex;
  align-items: center;
  gap: 50px;
}
</style>
