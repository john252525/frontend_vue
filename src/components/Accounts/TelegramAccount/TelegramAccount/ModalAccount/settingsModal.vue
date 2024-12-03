<template>
  <div v-if="settingsModalStation">
    <div @click="props.changeStationSettingsModal()" class="black-fon"></div>
    <form @submit.prevent="submitForm">
      <h2 @click="changeStationSettingsModal" class="title">
        Webhook URLs (указывать с новой строки)
      </h2>
      <textarea id="messageTextarea" v-model="message"></textarea>
      <button class="submit-button" @click="settingsAccount">Сохранить</button>
    </form>
  </div>
</template>

<script setup>
import { ref, toRefs } from "vue";
import axios from "axios";

const props = defineProps({
  closeModal: {
    type: Function,
  },
  selectedItems: {
    type: Object,
  },
  changeStationSettingsModal: {
    type: Function,
  },
  settingsModalStation: {
    type: Boolean,
  },
});

const { selectedItems } = toRefs(props);
const message = ref("");
const messages = ref([]);

const submitForm = () => {
  if (message.value.trim() !== "") {
    messages.value.push({ text: message.value });
    message.value = "";
  }
};

const settingsAccount = async () => {
  try {
    if (!selectedItems.value) {
      console.error("selectedItems не определен");
      return;
    }
    const { source, login } = selectedItems.value;

    await submitForm();

    const response = await axios.post(
      "https://b2288.apitter.com/instances/getInfo",
      {
        source: source,
        login: login,
        token: "342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        webhookUrls: messages.value,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );

    console.log("Аккаунт успешно создан:", response.data);
  } catch (error) {
    console.error("Ошибка при создании аккаунта:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};
</script>

<style scoped>
.black-fon {
  position: fixed;
  z-index: 5;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 0;
  left: 0;
}

form {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  background-color: white;
  padding: 25px 30px;
  border-radius: 10px;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}

.title {
  font-size: 14px;
  color: rgb(78, 78, 78);
  font-weight: 600;
  margin-bottom: 14px;
}

textarea {
  max-width: 350px;
  max-height: 700px;
  min-width: 350px;
  min-height: 400px;
  padding: 10px;
  outline: none;
  border: 0.5px solid rgb(207, 207, 207);
  border-radius: 5px;
  font-family: "Montserrat", serif;
  font-size: 14px;
  color: rgb(78, 78, 78);
  font-weight: 500;
  margin-bottom: 8px;
}

.submit-button {
  width: 100%;
  height: 35px;
  border-radius: 5px;
  background-color: #4950ca;
  font-size: 14px;
  color: rgb(255, 255, 255);
  font-weight: 600;
  margin-top: 12px;
}
</style>
