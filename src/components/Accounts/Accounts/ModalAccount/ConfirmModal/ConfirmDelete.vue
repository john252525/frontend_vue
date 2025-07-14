<template>
  <div @click="ChangeconfirmStation" class="black-fon"></div>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <transition name="fade">
    <section class="confirm-modal">
      <article class="circle">
        <span>!</span>
      </article>
      <h2 class="title">{{ t("confirmMoadal.delete.message") }}</h2>
      <article class="button-cont">
        <button class="confirm-button" @click="confirm">
          {{ t("confirmMoadal.delete.continue") }}
        </button>
        <button class="cansel-button" @click="ChangeconfirmStation">
          {{ t("confirmMoadal.delete.cancel") }}
        </button>
      </article>
    </section>
  </transition>
</template>

<script setup>
import { toRefs, ref, computed } from "vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useRouter } from "vue-router";
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();

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

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const router = useRouter();
import axios from "axios";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
const props = defineProps({
  loadingStart: {
    type: Function,
  },
  changeStationLoadingModal: {
    type: Function,
  },
  ChangeconfirmStation: {
    type: Function,
  },
  selectedItem: {
    type: Object,
  },
  errorStationOn: {
    type: Function,
  },
  errorStationOff: {
    type: Function,
  },
  loadingStop: {
    type: Function,
  },
});

const { selectedItem } = toRefs(props);

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

import { useDomain } from "@/composables/getDomain";
const { stationDomain } = useDomain();

const createRequest = async (request) => {
  const { source, login, storage, type } = selectedItem.value;
  let params = {
    source: source,
    login: login,
    storage: storage,
    type: type,
  };
  if (stationDomain.navigate.value != "whatsapi") {
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
    const response = await axios.post(`${FRONTEND_URL}${request}`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });
    if (response.data) {
      await handleSendLog(
        "deleteAccount",
        request,
        params,
        response.data.ok,
        response.data
      );
    }

    if (response.data.ok === true) {
      if (request === "deleteAccount") {
        props.loadingStop();
        setLoadingStatus(true, "success");
        location.reload();
      } else {
      }
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      props.loadingStop();
      setLoadingStatus(true, "error");
    }
  } catch (error) {
    console.error(`error`, error);
    props.errorStationOn();
    props.changeStationLoadingModal(true);
    setTimeout(() => {
      props.changeStationLoadingModal(false);
      props.errorStationOff();
    }, 5000);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const confirm = async () => {
  await props.ChangeconfirmStation();
  await props.loadingStart(t("globalLoading.delete"));
  await createRequest("forceStop");
  await createRequest("deleteAccount");
};
</script>

<style scoped>
.confirm-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  border-radius: 5px;
  width: 389px;
  height: 208px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.circle {
  border: 2px solid #b73131;
  border-radius: 199px;
  width: 51px;
  height: 51px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
}

.circle span {
  font-weight: 500;
  font-size: 18px;
  color: #b73131;
}

.title {
  font-weight: 500;
  font-size: 16px;
  color: #8b8b8b;
  margin-bottom: 28px;
}

.button-cont {
  display: flex;
  align-self: center;
  gap: 16px;
}

.confirm-button {
  border-radius: 5px;
  width: 119px;
  height: 36px;
  background: #b73131;
  font-weight: 600;
  font-size: 12px;
  color: #fff;
}

.cansel-button {
  border: 0.5px solid #c3c3c3;
  border-radius: 5px;
  width: 119px;
  height: 36px;
  font-weight: 600;
  font-size: 12px;
  color: #000;
  background-color: transparent;
}

.confirm-modal.fade-enter-active,
.confirm-modal.fade-leave-active {
  transition: opacity 0.5s ease;
}
.confirm-modal.fade-enter,
.confirm-modal.fade-leave-to {
  opacity: 0;
}

.confirm-modal {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -48%);
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 420px) {
  .confirm-modal {
    width: 330px;
  }

  .title {
    font-size: 15px;
  }
}
</style>
