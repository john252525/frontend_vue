<template>
  <Teleport to="body">
    <Transition name="toast-slide">
      <div v-if="stationLoading.isOpen" class="toast" :class="`toast--${variant}`">
        <div class="toast-icon">
          <span v-if="variant === 'loading'" class="toast-spinner"></span>
          <svg
            v-else-if="variant === 'success'"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <g fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="m8 12.5l3 3l5-6" />
              <circle cx="12" cy="12" r="10" />
            </g>
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10s10-4.486 10-10S17.493 2 11.953 2M13 17h-2v-2h2zm0-4h-2V7h2z"
            />
          </svg>
        </div>

        <div class="toast-body">
          <p class="toast-text">{{ displayText }}</p>
          <div v-if="variant === 'loading'" class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: stationLoading.progress + '%' }"
            ></div>
          </div>
        </div>

        <button
          v-if="variant !== 'loading'"
          class="toast-close"
          @click="changeStationLoadingModal"
          aria-label="Закрыть"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { toRefs, computed, defineProps } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const props = defineProps({
  stationLoading: {
    type: Object,
    required: true,
  },
  changeStationLoadingModal: {
    type: Function,
  },
});

const { stationLoading } = toRefs(props);

const variant = computed(() => {
  if (stationLoading.value.loading) return "loading";
  if (stationLoading.value.successfully) return "success";
  return "error";
});

const displayText = computed(() => {
  if (variant.value === "error") {
    return stationLoading.value.text || t("resultModal.messageFalse");
  }
  return stationLoading.value.text || t("resultModal.messageTrue");
});
</script>

<style scoped>
.toast {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 320px;
  padding: 14px;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid transparent;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.toast-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 2px;
}

.toast-text {
  margin: 0;
  font-weight: 600;
  font-size: 13.5px;
  line-height: 1.4;
  word-break: break-word;
}

.toast-close {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: inherit;
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    opacity 0.15s ease,
    background 0.15s ease;
}

.toast-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.06);
}

/* Success */
.toast--success {
  border-color: #bbf0d0;
  background: #f4fdf8;
}

.toast--success .toast-icon {
  background: rgba(22, 163, 74, 0.12);
  color: #16a34a;
}

.toast--success .toast-text {
  color: #15803d;
}

/* Error */
.toast--error {
  border-color: #f5c2c2;
  background: #fef5f5;
}

.toast--error .toast-icon {
  background: rgba(220, 38, 38, 0.12);
  color: #dc2626;
}

.toast--error .toast-text {
  color: #b91c1c;
}

/* Loading */
.toast--loading {
  border-color: #bfdbfe;
  background: #f5f9ff;
}

.toast--loading .toast-icon {
  background: rgba(29, 78, 216, 0.12);
}

.toast--loading .toast-text {
  color: #1d4ed8;
}

.toast-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(29, 78, 216, 0.25);
  border-top-color: #1d4ed8;
  border-radius: 50%;
  animation: toast-spin 0.8s linear infinite;
}

@keyframes toast-spin {
  to {
    transform: rotate(360deg);
  }
}

.progress-track {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(29, 78, 216, 0.15);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  background: #1d4ed8;
  transition: width 0.4s ease;
}

/* Выезжает справа и уезжает обратно вправо, а не просто гаснет на месте */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition:
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.35s ease;
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: translateX(120%);
  opacity: 0;
}
</style>
