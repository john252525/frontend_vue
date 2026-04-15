<template>
  <ModalFrame
    :text="{ title: 'SMS авторизация', close: 'Закрыть' }"
    :item="item"
    :close="close"
  >
    <div class="sms-auth-content">
      <p class="sms-auth-description">
        Отсканируйте QR-код телефоном или скопируйте код и введите его вручную
      </p>

      <div class="qr-wrapper">
        <qrcode-vue :value="authCode" :size="220" class="qr-code" />
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
    </div>
  </ModalFrame>
</template>

<script setup>
import { ref } from "vue";
import QrcodeVue from "qrcode.vue";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";

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
</style>
