<template>
  <ModalFrame
    :text="modalText"
    :close="props.close"
    :item="props.item"
    :action="handleAction"
    :is-loading="step === 'loading' || step === 'verifying'"
    :is-disabled="step === 'success'"
  >
    <div v-if="step === 'link'" class="ig-step">
      <p class="ig-desc">
        Нажмите кнопку ниже, чтобы перейти в Instagram и авторизоваться в аккаунте
        <strong>{{ props.item?.login }}</strong>.
      </p>
      <a :href="authUrl" target="_blank" rel="noopener noreferrer" class="ig-open-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <defs>
            <radialGradient id="ig-btn-g" cx="30%" cy="107%" r="130%">
              <stop offset="0%" stop-color="#fdf497" />
              <stop offset="30%" stop-color="#fd5949" />
              <stop offset="65%" stop-color="#d6249f" />
              <stop offset="100%" stop-color="#285AEB" />
            </radialGradient>
          </defs>
          <circle cx="12" cy="12" r="12" fill="url(#ig-btn-g)" />
          <rect x="6.5" y="6.5" width="11" height="11" rx="3" stroke="white" stroke-width="1.5" fill="none" />
          <circle cx="12" cy="12" r="2.8" stroke="white" stroke-width="1.5" fill="none" />
          <circle cx="16.2" cy="7.8" r="0.7" fill="white" />
        </svg>
        Открыть Instagram
      </a>
      <p class="ig-hint">После авторизации вернитесь сюда и нажмите «Я авторизовался».</p>
    </div>

    <div v-else-if="step === 'success'" class="ig-step ig-success">
      <div class="ig-success-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#22c55e" />
          <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <p class="ig-success-text">Аккаунт успешно подключён!</p>
    </div>

    <div v-else-if="step === 'error'" class="ig-step ig-error">
      <div class="ig-error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#ef4444" />
          <path d="M8 8l8 8M16 8l-8 8" stroke="white" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
      <p class="ig-error-text">{{ errorMessage }}</p>
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
    return { title: "Подключить Instagram", close: "Отмена", action: "Я авторизовался" };
  }
  if (step.value === "verifying") {
    return { title: "Проверка статуса", close: "Отмена", action: "Проверяем..." };
  }
  if (step.value === "success") {
    return { title: "Instagram подключён", close: "Закрыть", action: "" };
  }
  if (step.value === "error") {
    return { title: "Ошибка подключения", close: "Закрыть", action: "Попробовать снова" };
  }
  return { title: "Подключить Instagram", close: "Отмена", action: "" };
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
      errorMessage.value = "Авторизация не завершена. Убедитесь, что вы вошли в Instagram, и попробуйте снова.";
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
.ig-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 8px 0;
}

.ig-desc {
  margin: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
}

.ig-open-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  color: white;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: opacity 0.2s, transform 0.2s;
  box-shadow: 0 4px 14px rgba(188, 24, 136, 0.35);
}

.ig-open-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.ig-hint {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}

.ig-success-icon,
.ig-error-icon {
  margin-bottom: 4px;
}

.ig-success-text {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #15803d;
}

.ig-error-text {
  margin: 0;
  font-size: 14px;
  color: #dc2626;
  line-height: 1.5;
}
</style>
