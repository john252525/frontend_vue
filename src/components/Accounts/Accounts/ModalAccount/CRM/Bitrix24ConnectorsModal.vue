<template>
  <div class="connectors-overlay" @click.self="props.close">
    <div class="connectors-modal" role="dialog" aria-modal="true">
      <div class="connectors-header">
        <div class="header-left">
          <h3>Коннекторы Bitrix24</h3>
          <div class="account-badge">
            <AccountIcon :item="props.item" class="mini-icon" />
            <span class="account-name">{{ props.item.name || props.item.login }}</span>
          </div>
        </div>

        <button class="close-btn" @click="props.close" aria-label="Закрыть">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="connectors-body">
        <div v-if="state === 'error'" class="state-box">
          <p class="state-error">{{ errorMessage }}</p>
          <button class="retry-btn" @click="load">Повторить</button>
        </div>

        <template v-else>
          <div v-if="state === 'loading' || !frameLoaded" class="state-box frame-loader">
            <div class="spinner"></div>
            <p class="state-text">Загружаем настройки коннекторов...</p>
          </div>

          <iframe
            v-if="state === 'ready'"
            :src="iframeSrc"
            class="connectors-frame"
            :class="{ 'frame-hidden': !frameLoaded }"
            title="Настройка коннекторов Bitrix24"
            allow="clipboard-write"
            @load="frameLoaded = true"
          ></iframe>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AccountIcon from "@/components/Accounts/AccountIcon.vue";
import { useSessions } from "@/composables/useSessions";

const props = defineProps({
  item: { type: Object, required: true },
  close: { type: Function, required: true },
});

const { getSessionId } = useSessions();

const state = ref("loading"); // loading | ready | error
const errorMessage = ref("");
const iframeSrc = ref("");
const frameLoaded = ref(false);

// [base_domain] в https://bitrix24.[base_domain]/apps/connectors-setup/ —
// это базовый домен инфраструктуры (тот же, что у bapi88.*), а не домен
// фронта: dev → developtech.ru, prod → apitter.com. Явно задаётся через
// VITE_BITRIX24_URL (env.config.json); если переменной нет в .env —
// выводим из VITE_BASE_URL, отбросив первый label хоста.
const getConnectorsUrl = () => {
  const explicit = import.meta.env.VITE_BITRIX24_URL;
  if (explicit) return explicit;

  const apiHost = new URL(import.meta.env.VITE_BASE_URL).hostname;
  const baseDomain = apiHost.split(".").slice(1).join(".");
  return `https://bitrix24.${baseDomain}/apps/connectors-setup/`;
};

const load = async () => {
  state.value = "loading";
  frameLoaded.value = false;

  try {
    // domain — source вендора bitrix24, member_id — его login
    const { source, login } = props.item;
    if (!source || !login) {
      throw new Error("У аккаунта Bitrix24 не хватает данных (domain / member_id)");
    }

    const { sessionId, brandSlug } = await getSessionId();

    const url = new URL(getConnectorsUrl());
    url.search = new URLSearchParams({
      session_id: sessionId,
      app: "dashboard",
      brand_slug: brandSlug,
      domain: source,
      member_id: login,
    }).toString();

    iframeSrc.value = url.toString();
    state.value = "ready";
  } catch (error) {
    console.error("Ошибка при подготовке коннекторов Bitrix24:", error);
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      "Не удалось открыть настройки коннекторов";
    state.value = "error";
  }
};

onMounted(load);
</script>

<style scoped>
.connectors-overlay {
  position: fixed;
  inset: 0;
  background: var(--backgroundComponentModal);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  padding: 20px;
}

.connectors-modal {
  background: var(--modalBg);
  width: min(1200px, 100%);
  height: min(860px, 100%);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.connectors-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.connectors-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: var(--modalColor);
  font-weight: 700;
}

.account-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--tableAccountBg);
  padding: 4px 12px 4px 6px;
  border-radius: 100px;
  border: 1px solid var(--line);
}

.mini-icon {
  width: 20px !important;
  height: 20px !important;
}

.account-name {
  font-size: 12px;
  color: var(--headerAccountText);
  font-weight: 600;
}

.close-btn {
  background: var(--tableAccountBg);
  border: none;
  color: var(--headerAccountText);
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
  transform: rotate(90deg);
}

.connectors-body {
  position: relative;
  flex: 1;
  min-height: 0;
}

.connectors-frame {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  background: #fff;
}

.frame-hidden {
  visibility: hidden;
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 100%;
  padding: 24px;
  text-align: center;
}

.frame-loader {
  position: absolute;
  inset: 0;
}

.state-text {
  margin: 0;
  color: var(--headerAccountText);
  font-size: 0.9rem;
}

.state-error {
  margin: 0;
  color: #ef4444;
  font-size: 0.95rem;
  max-width: 420px;
}

.retry-btn {
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--primary);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.retry-btn:hover {
  background: var(--primaryHover);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--line);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .connectors-overlay {
    padding: 8px;
  }

  .connectors-header {
    padding: 14px 16px;
  }

  .account-badge {
    display: none;
  }
}
</style>
