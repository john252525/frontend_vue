<template>
  <div class="black-fon">
    <section class="screen-section">
      <button @click="sendScreen">sadasdas</button>
      <div>
        <h1>Изображение из Base64</h1>
        <img :src="base64Image" alt="Base64 Image" />
      </div>
    </section>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref } from "vue";

const base64Image = ref("");

const forceStop = async () => {
  //   const { source, login } = selectedItems.value;

  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/forceStop`,
      {
        source: "whatsapp",
        login: "helly",
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );
    if (response.data.ok === true) {
      console.log(response.data);
      console.log("forceStop");
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error(` - Ошибка`, error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const setState = async () => {
  //   const { source, login } = selectedItems.value;

  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/setState`,
      {
        source: "whatsapp",
        login: "helly",
        setState: true,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );
    if (response.data.ok === true) {
      console.log(response.data);
      console.log("setState");
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error(` - Ошибка`, error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const getScreen = async () => {
  //   const { source, login } = selectedItems.value;

  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/screenshot`,
      {
        source: "whatsapp",
        login: "helly",
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );
    if (response.data.ok === true) {
      console.log("getScreen");
      console.log(response.data.value);
      base64Image.value = `data:image/png;base64,${response.data.value}`;
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error(` - Ошибка`, error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const sendScreen = async () => {
  await forceStop();
  await setState();
  getScreen();
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

.screen-section {
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
</style>
