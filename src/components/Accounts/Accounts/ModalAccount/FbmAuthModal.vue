<template>
  <ModalFrame
    :text="modalText"
    :close="props.close"
    :item="props.item"
    :action="handleAction"
    :is-loading="step === 'loading' || step === 'verifying'"
    :is-disabled="step === 'success'"
  >
    <div v-if="step === 'link'" class="fbm-step">
      <p class="fbm-desc">
        Нажмите кнопку ниже, чтобы перейти в Facebook Messenger и
        авторизоваться в аккаунте
        <strong>{{ props.item?.login }}</strong>.
      </p>
      <a :href="authUrl" target="_blank" rel="noopener noreferrer" class="fbm-open-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#0084FF" />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12 4c-4.632 0-8.25 3.393-8.25 7.875c0 2.482 1.11 4.635 2.916 6.11a.65.65 0 0 1 .234.474l.06 1.943a.65.65 0 0 0 .911.578l2.169-.955a.66.66 0 0 1 .44-.033c.487.13.998.2 1.52.2c4.632 0 8.25-3.393 8.25-7.875S16.632 4 12 4Zm-4.94 9.99l2.407-3.816a1.22 1.22 0 0 1 1.766-.325l1.918 1.437a.49.49 0 0 0 .59 0l2.585-1.96c.345-.262.79.145.559.514l-2.407 3.815a1.22 1.22 0 0 1-1.766.326l-1.918-1.437a.49.49 0 0 0-.59 0l-2.585 1.96c-.345.263-.79-.144-.559-.514Z"
            fill="white"
          />
        </svg>
        Открыть Facebook
      </a>
      <p class="fbm-hint">После авторизации вернитесь сюда и нажмите «Я авторизовался».</p>
    </div>

    <div v-else-if="step === 'success'" class="fbm-step fbm-success">
      <div class="fbm-success-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#22c55e" />
          <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <p class="fbm-success-text">Аккаунт успешно подключён!</p>
    </div>

    <div v-else-if="step === 'error'" class="fbm-step fbm-error">
      <div class="fbm-error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#ef4444" />
          <path d="M8 8l8 8M16 8l-8 8" stroke="white" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
      <p class="fbm-error-text">{{ errorMessage }}</p>
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
    return { title: "Подключить Facebook", close: "Отмена", action: "Я авторизовался" };
  }
  if (step.value === "verifying") {
    return { title: "Проверка статуса", close: "Отмена", action: "Проверяем..." };
  }
  if (step.value === "success") {
    return { title: "Facebook подключён", close: "Закрыть", action: "" };
  }
  if (step.value === "error") {
    return { title: "Ошибка подключения", close: "Закрыть", action: "Попробовать снова" };
  }
  return { title: "Подключить Facebook", close: "Отмена", action: "" };
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
      errorMessage.value = "Авторизация не завершена. Убедитесь, что вы вошли в Facebook, и попробуйте снова.";
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
.fbm-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 8px 0;
}

.fbm-desc {
  margin: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
}

.fbm-open-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 12px;
  background: #0084ff;
  color: white;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: opacity 0.2s, transform 0.2s;
  box-shadow: 0 4px 14px rgba(0, 132, 255, 0.35);
}

.fbm-open-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.fbm-hint {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}

.fbm-success-icon,
.fbm-error-icon {
  margin-bottom: 4px;
}

.fbm-success-text {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #15803d;
}

.fbm-error-text {
  margin: 0;
  font-size: 14px;
  color: #dc2626;
  line-height: 1.5;
}
</style>
