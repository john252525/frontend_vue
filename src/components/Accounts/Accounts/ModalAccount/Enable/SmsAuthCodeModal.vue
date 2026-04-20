<template>
  <ModalFrame
    :text="{ title: 'SMS авторизация', close: 'Закрыть' }"
    :item="item"
    :close="close"
  >
    <div class="sms-auth-content">
      <!-- Step 1: Download app -->
      <template v-if="!appDownloaded">
        <p class="sms-auth-description">
          Для SMS авторизации установите приложение из RuStore
        </p>

        <div class="qr-wrapper">
          <qrcode-vue :value="RUSTORE_URL" :size="220" class="qr-code" />
        </div>

        <a :href="RUSTORE_URL" target="_blank" rel="noopener noreferrer" class="rustore-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Открыть в RuStore
        </a>

        <button class="downloaded-btn" @click="appDownloaded = true">
          Я уже скачал
        </button>
      </template>

      <!-- Step 2: Auth code -->
      <template v-else>
        <p class="sms-auth-description">
          Отсканируйте QR-код телефоном или скопируйте код и введите его вручную
        </p>

        <div class="qr-wrapper">
          <qrcode-vue :value="authCodeUrl" :size="220" class="qr-code" />
        </div>

        <div class="code-block">
          <span class="code-text">{{ authCode }}</span>
          <button class="copy-btn" @click="copyCode" :class="{ copied: isCopied }">
            <svg
              v-if="!isCopied"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <svg
              v-else
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {{ isCopied ? "Скопировано" : "Скопировать" }}
          </button>
        </div>

        <button class="back-btn" @click="appDownloaded = false">
          Назад
        </button>
      </template>
    </div>
  </ModalFrame>
</template>

<script setup>
import { ref, computed } from "vue";
import QrcodeVue from "qrcode.vue";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";

const RUSTORE_URL = "https://www.rustore.ru/catalog/app/com.touch.api.sms.app";

const props = defineProps({
  authCode: {
    type: String,
    required: true,
  },
  item: {
    type: Object,
    default: null,
  },
  close: {
    type: Function,
    required: true,
  },
});

const isCopied = ref(false);
const appDownloaded = ref(false);

const authCodeUrl = computed(() => `https://sms.touch-api.com/auth?authCode=${props.authCode}`);

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.authCode);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch {
    const el = document.createElement("textarea");
    el.value = props.authCode;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  }
};
</script>

<style scoped>
.sms-auth-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.sms-auth-description {
  font-size: 14px;
  color: #64748b;
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.qr-wrapper {
  padding: 16px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.qr-code {
  display: block;
}

.rustore-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2563eb;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  transition: all 0.2s ease;
}

.rustore-link:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

.downloaded-btn {
  width: 100%;
  background: #2563eb;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.downloaded-btn:hover {
  background: #1d4ed8;
}

.code-block {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
}

.code-text {
  flex: 1;
  font-family: monospace;
  font-size: 13px;
  color: #1e293b;
  word-break: break-all;
  line-height: 1.4;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.copy-btn:hover {
  background: #1d4ed8;
}

.copy-btn.copied {
  background: #16a34a;
}

.back-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: #64748b;
}
</style>
