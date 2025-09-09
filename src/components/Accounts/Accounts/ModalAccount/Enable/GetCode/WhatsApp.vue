<template>
  <div class="code-component">
    <div class="code-header">
      <h3 class="code-title">Код авторизации</h3>
      <button class="code-close" @click="handleClose">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    
    <div class="code-body">
      <div class="code-display">
        <div class="code-value">{{ userCode }}</div>
        <button 
          class="code-copy"
          :class="{'code-copy-copied': isCopied}"
          @click="copyCode"
          :disabled="!userCode"
        >
          <svg v-if="!isCopied" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <p class="code-description">
        Используйте этот код для авторизации в приложении
      </p>
    </div>
    
    <div class="code-footer">
      <button class="code-switch" @click="getQr">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M2 9V7C2 5.89543 2.89543 5 4 5H7M16 5H20C21.1046 5 22 5.89543 22 7V9M22 16V20C22 21.1046 21.1046 22 20 22H16M7 22H4C2.89543 22 2 21.1046 2 20V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Перейти к QR-коду
      </button>
    </div>

    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
    <LoadingModal
      :textLoadin="station.text"
      :stationLoading="station.stationLoading"
    />
    <ResultModal v-if="station.error" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject, computed } from "vue";
import axios from "axios";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
import ResultModal from "../ResultModal.vue";
import LoadingModal from "../LoadingModal.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const { changeEnableStation } = inject("changeEnableStation");
const phone = ref("7 ");
const station = reactive({
  stationLoading: false,
  phone: true,
  code: false,
  inpPhone: false,
  error: false,
  text: "",
});
import { useDomain } from "@/composables/getDomain";
const { stationDomain } = useDomain();
const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
let authCodeInterval = null;
const isRunning = ref(false);
const { selectedItem, startFunc, offQrQrStation } = inject("accountItems");
const { source, login, storage } = selectedItem.value;
const userCode = ref(null);
const isCopied = ref(false);

const copyCode = async () => {
  if (!userCode.value) return;
  
  try {
    await navigator.clipboard.writeText(userCode.value);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const handleClose = () => {
  stopAuthCode();
  changeEnableStation();
};

const formatPhone = () => {
  const cleaned = phone.value.replace(/\D/g, "");

  if (cleaned.length === 0) {
    phone.value = "7 ";
    return;
  }

  const match = cleaned.match(/^(7)?(\d{0,3})(\d{0,3})(\d{0,4})$/);

  if (match) {
    phone.value = `7 (${match[2]}) ${match[3]}${
      match[4] ? "-" + match[4] : ""
    }`;
  }
};

const getInternationalFormat = () => {
  return phone.value.replace(/\D/g, "");
};

const forceStop = async () => {
  try {
    const response = await axios.post(
      `${FRONTEND_URL}forceStop`,
      {
        source: source,
        login: login,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
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

const enablePhoneAuth = async () => {
  const phone = getInternationalFormat();
  try {
    const response = await axios.post(
      `${FRONTEND_URL}enablePhoneAuth`,
      {
        source: source,
        login: login,
        phone: phone,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
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
    console.error("error", error);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error:", err);
  }
};

const disablePhoneAuth = async () => {
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
    const response = await axios.post(
      `${FRONTEND_URL}disablePhoneAuth`,
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data) {
      await handleSendLog(
        "getCode",
        "disablePhoneAuth",
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
    console.error("error", error);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const setState = async () => {
  try {
    const response = await axios.post(
      `${FRONTEND_URL}setState`,
      {
        source: source,
        login: login,
        setState: true,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
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
    console.error("error", error);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const getAuthCode = async () => {
  let params = {
    source: source,
    login: login,
    storage: storage,
  };
  if (stationDomain.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
      storage: storage,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
    };
  }
  try {
    const response = await axios.post(`${FRONTEND_URL}getAuthCode`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      await handleSendLog(
        "getCode",
        "getAuthCode",
        params,
        response.data.ok,
        response.data
      );
    }

    if (response.data.status === "ok") {
      station.stationLoading = false;
      station.code = true;
      userCode.value = response.data.authCode;
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else if (response.data.error?.message === "Auth code is undefined") {
      station.error = true;
      clearInterval(authCodeInterval);
      station.stationLoading = false;
      station.code = false;
    }
  } catch (error) {
    console.error("error", error);
    return;
  }
};

const nextButton = () => {
  station.phone = false;
  station.stationLoading = true;

  isRunning.value = true;

  authCodeInterval = setInterval(() => {
    getAuthCode();
  }, 20000);

  setTimeout(() => {
    clearInterval(authCodeInterval);
    authCodeInterval = null;
    isRunning.value = false;
    changeEnableStation();
  }, 60000);

  sendCode();
};

const sendCode = async () => {
  station.text = "Загрузка кода";
  await getAuthCode();
};

const getQr = async () => {
  clearInterval(authCodeInterval);
  authCodeInterval = null;
  isRunning.value = false;
  await disablePhoneAuth();
  await offQrQrStation();
  await startFunc();
};

const stopAuthCode = () => {
  clearInterval(authCodeInterval);
  authCodeInterval = null;
  isRunning.value = false;
};

onMounted(() => {
  nextButton();
});

defineExpose({ stopAuthCode });
</script>

<style scoped>
.code-component {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
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
  gap: 12px;
}

.code-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.code-value {
  flex: 1;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 2px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  text-align: center;
  color: #495057;
  word-break: break-all;
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-copy {
  background: none;
  border: 1px solid #e9ecef;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #6c757d;
  transition: all 0.2s ease;
  flex-shrink: 0;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-copy:hover {
  background: #f8f9fa;
  color: #495057;
  border-color: #ced4da;
}

.code-copy-copied {
  color: #28a745;
  border-color: #28a745;
  background: #f8fff9;
}

.code-description {
  font-size: 14px;
  color: #6c757d;
  text-align: center;
  margin: 0;
  line-height: 1.4;
}

.code-footer {
  display: flex;
  justify-content: center;
}

.code-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: none;
  border: 1px solid #e9ecef;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  color: #6c757d;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
}

.code-switch:hover {
  background: #f8f9fa;
  color: #495057;
  border-color: #ced4da;
}

/* Мобильная адаптация */
@media (max-width: 480px) {
  .code-component {
    gap: 14px;
  }
  
  .code-display {
    flex-direction: column;
    gap: 10px;
  }
  
  .code-value {
    font-size: 18px;
    padding: 14px;
    min-height: 50px;
    width: 100%;
    letter-spacing: 1.5px;
  }
  
  .code-copy {
    padding: 10px;
    height: 46px;
    width: 100%;
    max-width: 200px;
  }
  
  .code-description {
    font-size: 13px;
    line-height: 1.3;
  }
  
  .code-switch {
    padding: 11px 14px;
    font-size: 13px;
  }
}

@media (max-width: 360px) {
  .code-value {
    font-size: 16px;
    padding: 12px;
    min-height: 46px;
  }
  
  .code-copy {
    padding: 9px;
    height: 42px;
  }
  
  .code-title {
    font-size: 16px;
  }
}

/* Планшеты */
@media (min-width: 768px) and (max-width: 1024px) {
  .code-value {
    font-size: 22px;
    padding: 18px;
  }
  
  .code-copy {
    padding: 14px;
    height: 58px;
  }
}
</style>