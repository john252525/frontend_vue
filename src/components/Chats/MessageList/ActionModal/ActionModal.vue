<template>
  <div @click="$emit('close')" class="fon"></div>
  <div
    :style="{
      top: modalPosition.top + 'px',
      left: modalPosition.left + 'px',
    }"
    class="action-menu"
  >
    <ul>
      <li>
        <p class="option" @click="addDataToReplyMessage(message)">Ответить</p>
      </li>
      <li>
        <p v-if="!message.delete" class="option" @click="copyMessage">
          Копировать
        </p>
      </li>
      <!-- <li><p class="option">Отреагировать</p></li> -->
      <li>
        <p
          v-if="deleteMessageBolean && (apiUrl === 'https://hellylo.apitter.com/api' || apiUrl === 'http://localhost:4000/api')"
          @click="deleteMessage"
          class="option delete"
        >
          Удалить
        </p>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps, ref, toRefs, defineEmits } from "vue";
import axios from "axios";

const props = defineProps({
  modalPosition: {
    type: Object,
  },
  message: {
    type: Object,
  },
  addDataToReply: {
    type: Function,
  },
  updateDeleteMessage: {
    type: Function,
  },
  chatInfo: {
    type: Object,
  },
});
const emit = defineEmits();
const { chatInfo, message } = toRefs(props);
const apiUrl = import.meta.env.VITE_API_URL;

const deleteMessageBolean = ref(false)

const deleteMessage = () => {
  console.log(chatInfo.value.lastMessage.id.remote);
  console.log(message.value.uniq);
  deleteMessageAxios(chatInfo.value.lastMessage.id.remote, message.value.uniq);
  props.updateDeleteMessage(message.value.uniq);
};

const addDataToReplyMessage = (message) => {
  props.addDataToReply(message);
  emit("close");
};

if (message.value.delete) {

  deleteMessageBolean.value = false
} else {
  deleteMessageBolean.value = true
}

const deleteMessageAxios = async (uniq, item) => {
  console.log(chatInfo);
  try {
    const response = await axios.post(`${apiUrl}/delete-messages`, {
      uniq: uniq,
      item: item,
      login: chatInfo.value.loginUser,
    });
    console.log("Response:", response.data); // Логируем ответ сервера
  } catch (error) {
    console.error(
      "Ошибка при очистке новых сообщений:",
      error.response ? error.response.data : error.message
    );
  }
  emit("close");
};

const copyMessage = () => {
  const textToCopy = message.value.data.text;
  console.log(message.value.data.text);
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      console.log("Текст скопирован в буфер обмена");
      emit("close"); // Закрыть модалку после копирования
    })
    .catch((err) => {
      console.error("Не удалось скопировать текст: ", err);
      // Здесь можно добавить обработку ошибки, например, показать сообщение пользователю
    });
};
</script>

<style scoped>
.action-menu {
  position: absolute;
  border-radius: 5px;
  padding: 15px 17px;
  width: 113px;
  height: auto; /* Изменяем высоту в зависимости от содержимого */
  box-shadow: 4px 2px 8px 0 rgba(0, 0, 0, 0.06), 0 0 4px 0 rgba(0, 0, 0, 0.04);
  background: #fff;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fon {
  position: fixed;
  z-index: 5;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
}

ul {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 6px;
}

.option {
  color: rgb(54, 54, 54);
  font-size: 16px;
  cursor: pointer;
  padding: 6px 10px;
  width: 120px;
}

.delete {
  color: rgb(54, 54, 54);
}

.option:hover {
  background-color: rgb(247, 247, 247);
  border-radius: 5px;
  color: black;
}

.delete:hover {
  color: rgb(235, 83, 83);
}

.action-menu.fade-enter-active,
.action-menu.fade-leave-active {
  transition: opacity 0.5s ease;
}
.action-menu.fade-enter,
.action-menu.fade-leave-to {
  opacity: 0;
}

.action-menu {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
