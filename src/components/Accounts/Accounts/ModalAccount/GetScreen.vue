<template>
  <div class="black-fon">
    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
    <LoadingModal
      :textLoadin="station.textLoadin"
      :stationLoading="station.loading"
    />
    <section v-if="station.screen" class="screen-section">
      <img class="screen-img" :src="base64Image" alt="screenshot" />
      <button @click="changeGetScreenStation" class="close">
        {{ t("GetScreen.close") }}
      </button>
    </section>
  </div>
</template>

<script setup>
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import axios from "axios";
import { ref, toRefs, inject, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const router = useRouter();
import LoadingModal from "./Enable/LoadingModal.vue";
const base64Image = ref("");
const props = defineProps({
  selectedItem: {
    type: Object,
  },
  getScreenStation: {
    type: Boolean,
  },
  changeGetScreenStation: {
    type: Function,
  },
});

const station = reactive({
  loading: false,
  screen: false,
  textLoadin: "",
});

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const { selectedItem, getScreenStation } = toRefs(props);
const { source, login } = selectedItem.value;

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
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    if (response.data.ok === true) {
      station.loading = false;
      station.screen = true;
      base64Image.value = `data:image/png;base64,${response.data.value}`;
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
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
  getScreen();
};
onMounted(() => {
  station.textLoadin = "Генерируем изображение...";
  station.loading = true;
  sendScreen();
});
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

.screen-img {
  width: 600px;
}

.close {
  border-radius: 5px;
  width: 100%;
  height: 35px;
  margin-top: 24px;
  background: #4950ca;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  transition: all 0.25s;
}

@media (max-width: 700px) {
  .screen-img {
    width: 500px;
  }
}

@media (max-width: 600px) {
  .screen-img {
    width: 400px;
  }
}

@media (max-width: 500px) {
  .screen-img {
    width: 300px;
  }
}
</style>
