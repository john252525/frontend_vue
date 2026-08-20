<template>
  <ModalFrame
    :text="modalText"
    :close="props.close"
    :item="props.item"
    :action="handleAction"
    :is-loading="step === 'loading' || step === 'verifying'"
    :is-disabled="step === 'success'"
  >
    <div v-if="step === 'link'" class="waba-step">
      <p class="waba-desc">
        Нажмите кнопку ниже, чтобы перейти в WhatsApp Business API и
        авторизоваться в аккаунте
        <strong>{{ props.item?.login }}</strong>.
      </p>
      <a :href="authUrl" target="_blank" rel="noopener noreferrer" class="waba-open-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#25D366" />
          <path
            d="M16.1055 6.89153C15.5065 6.2897 14.7931 5.81251 14.0069 5.48777C13.2207 5.16303 12.3774 4.99723 11.5261 5.00004C7.9593 5.00004 5.05226 7.89253 5.05226 11.4415C5.05226 12.579 5.35276 13.684 5.91457 14.659L5 18L8.42965 17.103C9.37688 17.6165 10.4417 17.8895 11.5261 17.8895C15.093 17.8895 18 14.997 18 11.448C18 9.72552 17.3271 8.10703 16.1055 6.89153ZM11.5261 16.7975C10.5593 16.7975 9.61206 16.5375 8.78241 16.05L8.58643 15.933L6.54824 16.466L7.09045 14.49L6.9598 14.2885C6.42252 13.4351 6.13729 12.4485 6.13668 11.4415C6.13668 8.49053 8.55377 6.08553 11.5196 6.08553C12.9568 6.08553 14.309 6.64453 15.3216 7.65853C15.8231 8.15504 16.2205 8.74568 16.4907 9.39619C16.761 10.0467 16.8987 10.7441 16.896 11.448C16.909 14.399 14.492 16.7975 11.5261 16.7975ZM14.4789 12.7935C14.3156 12.7155 13.5186 12.3255 13.3749 12.267C13.2246 12.215 13.1201 12.189 13.009 12.345C12.898 12.5075 12.591 12.8715 12.4995 12.9755C12.408 13.086 12.31 13.099 12.1467 13.0145C11.9834 12.9365 11.4608 12.761 10.8467 12.215C10.3633 11.786 10.0432 11.2595 9.94523 11.097C9.85377 10.9345 9.93216 10.85 10.0171 10.7655C10.0889 10.694 10.1804 10.577 10.2588 10.486C10.3372 10.395 10.3698 10.3235 10.4221 10.2195C10.4744 10.109 10.4482 10.018 10.409 9.94002C10.3698 9.86202 10.0432 9.06902 9.91256 8.74403C9.78191 8.43203 9.64472 8.47103 9.54673 8.46453H9.23317C9.12211 8.46453 8.95226 8.50353 8.80201 8.66603C8.65829 8.82852 8.2402 9.21852 8.2402 10.0115C8.2402 10.8045 8.82161 11.5715 8.9 11.6755C8.97839 11.786 10.0432 13.411 11.6633 14.1065C12.0487 14.2755 12.3492 14.373 12.5844 14.4445C12.9698 14.568 13.3226 14.5485 13.6035 14.5095C13.9171 14.464 14.5638 14.1195 14.6945 13.7425C14.8317 13.3655 14.8317 13.047 14.7859 12.9755C14.7402 12.904 14.6422 12.8715 14.4789 12.7935Z"
            fill="white"
          />
        </svg>
        Открыть WABA
      </a>
      <p class="waba-hint">После авторизации вернитесь сюда и нажмите «Я авторизовался».</p>
    </div>

    <div v-else-if="step === 'success'" class="waba-step waba-success">
      <div class="waba-success-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#22c55e" />
          <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <p class="waba-success-text">Аккаунт успешно подключён!</p>
    </div>

    <div v-else-if="step === 'error'" class="waba-step waba-error">
      <div class="waba-error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#ef4444" />
          <path d="M8 8l8 8M16 8l-8 8" stroke="white" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
      <p class="waba-error-text">{{ errorMessage }}</p>
    </div>
  </ModalFrame>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import axios from "axios";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";
import { useAccountStore } from "@/stores/accountStore";

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const props = defineProps({
  item: { type: Object, required: true },
  close: { type: Function, required: true },
  getAccounts: { type: Function, default: null },
});

const step = ref("loading");
const authUrl = ref("");
const errorMessage = ref("Аккаунт не авторизован. Попробуйте снова.");

const modalText = computed(() => {
  if (step.value === "link") {
    return { title: "Подключить WABA", close: "Отмена", action: "Я авторизовался" };
  }
  if (step.value === "verifying") {
    return { title: "Проверка статуса", close: "Отмена", action: "Проверяем..." };
  }
  if (step.value === "success") {
    return { title: "WABA подключён", close: "Закрыть", action: "" };
  }
  if (step.value === "error") {
    return { title: "Ошибка подключения", close: "Закрыть", action: "Попробовать снова" };
  }
  return { title: "Подключить WABA", close: "Отмена", action: "" };
});

const fetchAuthUrl = async () => {
  step.value = "loading";
  try {
    const response = await axios.get(`${FRONTEND_URL}getAuthUrl`, {
      params: {
        login: props.item.login,
        source: props.item.source,
        type: props.item.type,
      },
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
    if (response.data?.ok && response.data?.data?.auth_url) {
      authUrl.value = response.data.data.auth_url;
      step.value = "link";
    } else {
      errorMessage.value = "Не удалось получить ссылку авторизации.";
      step.value = "error";
    }
  } catch (e) {
    console.error("getAuthUrl error:", e);
    errorMessage.value = "Ошибка при получении ссылки авторизации.";
    step.value = "error";
  }
};

const verifyAuth = async () => {
  step.value = "verifying";
  try {
    const response = await axios.post(
      `${FRONTEND_URL}getInfo`,
      {
        login: props.item.login,
        source: props.item.source,
        type: props.item.type,
        storage: props.item.storage,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      },
    );
    if (response.data?.step?.value === 5) {
      step.value = "success";
      props.getAccounts?.();
    } else {
      errorMessage.value = "Авторизация не завершена. Убедитесь, что вы вошли в WABA, и попробуйте снова.";
      step.value = "error";
    }
  } catch (e) {
    console.error("getInfo error:", e);
    errorMessage.value = "Ошибка проверки статуса.";
    step.value = "error";
  }
};

const handleAction = () => {
  if (step.value === "link") {
    verifyAuth();
  } else if (step.value === "error") {
    fetchAuthUrl();
  }
};

const handleEscape = (e) => {
  if (e.key === "Escape") props.close();
};

onMounted(() => {
  document.addEventListener("keydown", handleEscape);
  document.body.style.overflow = "hidden";
  fetchAuthUrl();
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscape);
  document.body.style.overflow = "";
});
</script>

<style scoped>
.waba-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 8px 0;
}

.waba-desc {
  margin: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
}

.waba-open-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 12px;
  background: #25d366;
  color: white;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: opacity 0.2s, transform 0.2s;
  box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);
}

.waba-open-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.waba-hint {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}

.waba-success-icon,
.waba-error-icon {
  margin-bottom: 4px;
}

.waba-success-text {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #15803d;
}

.waba-error-text {
  margin: 0;
  font-size: 14px;
  color: #dc2626;
  line-height: 1.5;
}
</style>
