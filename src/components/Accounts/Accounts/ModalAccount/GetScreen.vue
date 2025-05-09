<template>
  <div @click="changeGetScreenStation" class="black-fon">
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
import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();
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
import { useDomain } from "@/composables/getDomen";
const { stationDomen } = useDomain();
const { selectedItem, getScreenStation } = toRefs(props);
const { source, login, storage } = selectedItem.value;

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
    // Optionally, update the error message ref
  }
};

const getScreen = async () => {
  let params = {
    source: source,
    login: login,
  };
  if (stationDomen.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
    };
  }
  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/screenshot`,
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );

    if (response.data) {
      await handleSendLog(
        "screenshot",
        "screenshot",
        params,
        response.data.ok,
        response.data
      );
    }

    if (response.data.ok === true) {
      station.loading = false;
      setLoadingStatus(true, "success");
      station.screen = true;
      base64Image.value = `data:image/png;base64,${response.data.value}`;
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      props.changeGetScreenStation();
      station.screen = false;
      station.loading = false;
      setLoadingStatus(true, "error");
    }
  } catch (error) {
    console.error(`error`, error);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const sendScreen = async () => {
  getScreen();
};

onMounted(() => {
  station.textLoadin = t("GetScreen.text");
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
