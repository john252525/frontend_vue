<template>
  <div class="text-editor">
    <textarea v-model="textContent" placeholder="Загрузка текста..."></textarea>
    <button @click="saveText" :disabled="isLoading || !isReady">
      {{ isLoading ? "Сохранение..." : "Сохранить" }}
    </button>
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// Реактивные переменные
const textContent = ref("");
const isLoading = ref(false);
const isReady = ref(false);
const message = ref("");
const messageType = ref("");
const userId = ref(null);
const token = ref(localStorage.getItem("accountToken"));

// Методы
const getUserIdByToken = async () => {
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getUserUuid",
      {},
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
    userId.value = response.data.uuid;
    return response.data.uuid;
  } catch (error) {
    console.error("Ошибка при получении UUID:", error);
    throw error;
  }
};

const initialize = async () => {
  try {
    if (!token.value) {
      throw new Error("Токен не найден в localStorage");
    }

    await getUserIdByToken();
    isReady.value = true;
  } catch (error) {
    showMessage("Ошибка инициализации: " + error.message, "error");
    console.error("Ошибка инициализации:", error);
  }
};

const loadText = async () => {
  if (!isReady.value) return;

  isLoading.value = true;
  try {
    const response = await axios.get(
      `https://indiparser.apitter.com/indiparser.php?token=i&user_id=${userId.value}`
    );
    textContent.value = response.data.components[0].value;
    console.log(response.data.components[0].value);
  } catch (error) {
    showMessage("Ошибка при загрузке текста", "error");
    console.error("Ошибка загрузки:", error);
  } finally {
    isLoading.value = false;
  }
};

const saveText = async () => {
  if (isLoading.value || !isReady.value) return;

  isLoading.value = true;
  try {
    const response = await axios.post(
      `https://indiparser.apitter.com/indiparser.php?token=i&user_id=${userId.value}`,
      { text: textContent.value }
    );
  } catch (error) {
    showMessage(error.message, "error");
    console.error("Ошибка сохранения:", error);
  } finally {
    isLoading.value = false;
  }
};

const showMessage = (text, type) => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = "";
    messageType.value = "";
  }, 3000);
};

// Хуки жизненного цикла
onMounted(async () => {
  await initialize();
  loadText();
});
</script>

<style scoped>
.text-editor {
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 20px; /* Отступы со всех сторон */
  box-sizing: border-box;
}

textarea {
  width: 100%;
  min-height: 300px;
  max-height: 75vh;
  max-width: 100%; /* Максимальная ширина - 100% контейнера */
  padding: 15px;
  font-size: 16px;
  line-height: 1.5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  resize: both; /* Разрешаем растягивание и по ширине и по высоте */
  overflow: auto; /* Добавляем скролл при необходимости */
  box-sizing: border-box;
  transition: all 0.08s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-width: 100%; /* Минимальная ширина - 100% контейнера */
}

/* Ограничиваем максимальную ширину для очень широких экранов */
@media (min-width: 1600px) {
  .text-editor {
    max-width: calc(1600px - 40px); /* 1600px минус отступы */
    margin: 20px auto; /* Центрируем на широких экранах */
  }
}

/* Адаптация для мобильных */
@media (max-width: 768px) {
  .text-editor {
    margin: 15px;
  }

  textarea {
    min-height: 200px;
    resize: vertical; /* На мобильных оставляем только вертикальный ресайз */
  }
}

/* Состояния при взаимодействии */
textarea:focus {
  border-color: #2742d9;
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

textarea:hover {
  border-color: #2742d9;
}
button {
  margin-top: 14px;
  padding: 10px 20px;
  background: oklch(0.541 0.198 267);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.25s;
}

button:hover {
  background-color: #2742d9;
  transition: all 0.25s;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
}

.success {
  background-color: #dff0d8;
  color: #3c763d;
}

.error {
  background-color: #f2dede;
  color: #a94442;
}
</style>
