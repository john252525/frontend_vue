<template>
  <div class="code-component">
    <div class="code-header">
      <h3 class="code-title">Код подтверждения</h3>
      <button class="code-close" @click="changeEnableStation">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M12 4L4 12M4 4L12 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <div class="code-body">
      <div class="input-cont">
        <label for="code">Введите код подтверждения</label>
        <input
          class="code-input"
          type="number"
          v-model="formData.code"
          required
          placeholder="000000"
        />
      </div>
    </div>

    <div class="code-footer">
      <button
        @click="solveChallenge"
        v-if="station.error.challengeRequired"
        class="code-button"
      >
        Подтвердить
      </button>
      <button
        @click="twoFactorAuth"
        v-if="station.error.twoFactor"
        class="code-button"
      >
        Подтвердить
      </button>
    </div>

    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
    <LoadingModal :stationLoading="station.loading" />
    <ResultModalTrue v-if="station.resultTrue" />
  </div>
</template>

<script setup>
import { inject, reactive, ref, onMounted, computed } from "vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import axios from "axios";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
import ResultModalTrue from "../ResultModalTrue.vue";
import LoadingModal from "../LoadingModal.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const { selectedItem } = inject("accountItems");
const { source, login, storage } = selectedItem.value;
const stationLoading = ref(false);
import { useDomain } from "@/composables/getDomain";
const { stationDomain } = useDomain();
const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const props = defineProps({
  changeForceStopItemData: {
    type: Function,
  },
  openEnableMenuTrue: {
    type: Function,
  },
  changeEnableStation: {
    type: Function,
  },
});

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
  }
};

const station = reactive({
  code: false,
  loading: false,
  error: {
    twoFactor: false,
    challengeRequired: false,
  },
  resultTrue: false,
});

const formData = reactive({
  code: null,
});

const handleClose = () => {
  // Логика закрытия компонента
};

const forceStop = async () => {
  let params = {
    source: source,
    login: login,
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
    const response = await axios.post(`${FRONTEND_URL}forceStop`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      await handleSendLog(
        "getCode",
        "forceStop",
        params,
        response.data.ok,
        response.data
      );
    }

    if (response.data.status === "ok") {
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
    }
  } catch (error) {
    console.error(`error`, error);

    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const setStateTelegram = async () => {
  let params = {
    source: source,
    login: login,
  };
  if (stationDomain.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
      setState: true,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
      setState: true,
    };
  }
  try {
    const response = await axios.post(`${FRONTEND_URL}setState`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      await handleSendLog(
        "getCode",
        "setState",
        params,
        response.data.ok,
        response.data
      );
    }

    if (!response.data.error) {
    }
    if (response.data.error.message === "Challenge required") {
      station.loading = false;
      station.code = true;
      station.error.challengeRequired = true;
    } else if (response.data.error.message === "Two factor auth required") {
      station.loading = false;
      station.code = true;
      station.error.twoFactor = true;
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
    }
  } catch (error) {
    console.error("error", error);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const solveChallenge = async () => {
  let params = {
    source: source,
    login: login,
  };
  if (stationDomain.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
      code: `{{ ${formData.code} }}`,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
      code: `{{ ${formData.code} }}`,
    };
  }
  try {
    const response = await axios.post(`${FRONTEND_URL}solveChallenge`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      await handleSendLog(
        "getCode",
        "solveChallenge",
        params,
        response.data.ok,
        response.data
      );
    }

    if (response.data.status === "ok") {
      station.resultTrue = true;
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
    }
  } catch (error) {
    console.error(`error`, error);

    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const twoFactorAuth = async () => {
  let params = {
    source: source,
    login: login,
  };
  if (stationDomain.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
      code: `{{ ${formData.code} }}`,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
      code: `{{ ${formData.code} }}`,
    };
  }
  try {
    const response = await axios.post(`${FRONTEND_URL}twoFactorAuth`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      await handleSendLog(
        "getCode",
        "twoFactorAuth",
        params,
        response.data.ok,
        response.data
      );
    }

    if (response.data.status === "ok") {
      station.resultTrue = true;
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
    }
  } catch (error) {
    console.error(`error`, error);

    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const sendCodeTelegram = async () => {
  station.loading = true;
  await forceStop();
  setStateTelegram();
};

onMounted(() => {
  sendCodeTelegram();
});
</script>

<style scoped>
.code-component {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.code-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.code-close {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: #666;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.code-close:hover {
  background: #f5f5f5;
  color: #333;
}

.code-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.input-cont {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

label {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  text-align: center;
}

.code-input {
  border-radius: 8px;
  width: 100%;
  height: 60px;
  font-weight: 500;
  font-size: 20px;
  color: #000;
  border: 1px solid #e9ecef;
  background: #f8f9fa;
  text-align: center;
  padding: 0 16px;
  transition: all 0.2s ease;
}

.code-input:focus {
  outline: none;
  border-color: #4950ca;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(73, 80, 202, 0.1);
}

.code-input::placeholder {
  color: #adb5bd;
  font-weight: 400;
}

.code-footer {
  display: flex;
  justify-content: center;
}

.code-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #4950ca;
  border: none;
  padding: 14px 20px;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  width: 100%;
}

.code-button:hover {
  background: #3a40a0;
}

.code-button:disabled {
  background: #adb5bd;
  cursor: not-allowed;
}

/* Мобильная адаптация */
@media (max-width: 480px) {
  .code-component {
    gap: 16px;
  }

  .code-input {
    height: 54px;
    font-size: 18px;
    padding: 0 14px;
  }

  .code-button {
    padding: 12px 16px;
    font-size: 13px;
  }

  label {
    font-size: 13px;
  }
}

@media (max-width: 360px) {
  .code-input {
    height: 50px;
    font-size: 16px;
  }

  .code-title {
    font-size: 16px;
  }
}
</style>
