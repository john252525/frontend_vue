<template>
  <div class="code-component">
    <div class="code-header">
      <h3 class="code-title">Введите код</h3>
      <button class="code-close" @click="handleClose">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    
    <div class="code-body">
      <div class="input-cont">
        <!-- <label for="code">Код подтверждения</label> -->
        <input
          class="code-input"
          type="number"
          v-model="code"
          required
          placeholder="000000"
        />
      </div>
    </div>
    
    <div class="code-footer">
      <button @click="solveChallenge" class="code-button">
        Далее
      </button>
      
      <button @click="getQr" class="code-switch">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M2 9V7C2 5.89543 2.89543 5 4 5H7M16 5H20C21.1046 5 22 5.89543 22 7V9M22 16V20C22 21.1046 21.1046 22 20 22H16M7 22H4C2.89543 22 2 21.1046 2 20V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Перейти к QR-коду
      </button>
    </div>

    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
    <ResultModal v-if="station.station === false" />
    <LoadingModal :station-loading="station.loading" />
    <ResultModalTrue v-if="station.resultTrue" />
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import axios from "axios";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import ResultModal from "../ResultModal.vue";
import ResultModalTrue from "../ResultModalTrue.vue";
import LoadingModal from "../LoadingModal.vue";
import { ref, inject, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const props = defineProps({
  changeChallengeRequired: {
    type: Function
  },
  openEnableMenuTrue: {
    type: Function
  }
})

const router = useRouter();
const code = ref("");
const { selectedItem, offQrQrStation, startFunc } = inject("accountItems");
const { source, login, storage } = selectedItem.value;
const { changeEnableStation } = inject("changeEnableStation");
const station = reactive({
  station: undefined,
  loading: false,
  code: true,
  resultTrue: false,
});
import { useDomain } from "@/composables/getDomain";
const { stationDomain } = useDomain();
const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
  }
};

const handleClose = () => {
  // Логика закрытия компонента
};

const solveChallenge = async () => {
  station.loading = true;
  station.code = false;
  let params = {
    source: source,
    login: login,
  };
  if (stationDomain.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
      code: `{{ ${code.value} }}`,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
      code: `{{ ${code.value} }}`,
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
        "ChallengeRequired",
        "solveChallenge",
        params,
        response.data.ok,
        response.data
      );
    }

    if (response.data.status === "ok") {
      props.openEnableMenuTrue()
      station.loading = false;
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      station.station = false;
      station.loading = false;
    }
  } catch (error) {
    console.error(`error`, error);

    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const disablePhoneAuth = async () => {
  try {
    const response = await axios.post(
      `${FRONTEND_URL}disablePhoneAuth`,
      {
        source: source,
        login: login,
        phone: "89228556998",
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );

    if (response.data) {
      await handleSendLog(
        "ChallengeRequired",
        "solveChallenge",
        {
          source: source,
          login: login,
          phone: "89228556998",
        },
        response.data.ok,
        response.data
      );
    }

    if (response.data.status === "ok") {
      station.loading = false;
    } else {
      station.station = false;
      station.loading = false;
    }
  } catch (error) {
    console.error(`error`, error);

    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const getQr = async () => {
  station.loading = true;
  await disablePhoneAuth();
  await changeEnableStation();
  await startFunc();
};
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
  box-sizing: border-box;
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
  flex-direction: column;
  gap: 12px;
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
  
  .code-switch {
    padding: 10px 14px;
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