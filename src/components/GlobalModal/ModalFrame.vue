<template>
  <Transition name="modal" mode="out-in">
    <div class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <div class="header-left">
            <template v-if="!isLoading">
              <h3>{{ text.title }}</h3>
              <div v-if="item" class="account-badge">
                <AccountIcon :item="item" class="mini-icon" />
                <span class="account-name">{{ item.name }}</span>
              </div>
            </template>
            <div v-else class="skeleton skeleton-title"></div>
          </div>

          <button class="close-btn" @click="close" aria-label="Закрыть">
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

        <div class="modal-body">
          <Transition name="fade" mode="out-in">
            <div v-if="!isLoading" key="content">
              <slot></slot>
            </div>
            <div v-else key="loading" class="loading-skeleton-wrapper">
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text short"></div>
              <div class="skeleton skeleton-block"></div>
            </div>
          </Transition>
        </div>

        <div class="modal-footer">
          <button
            v-if="text.close"
            class="done-btn"
            :disabled="isLoading"
            @click="close"
          >
            {{ text.close }}
          </button>

          <button
            v-if="text.action"
            class="active-btn"
            :disabled="isDisabled || isLoading"
            @click="action"
          >
            <span v-if="isLoading" class="spinner"></span>
            <span :class="{ 'btn-text-loading': isLoading }">{{
              text.action
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import AccountIcon from "../Accounts/AccountIcon.vue";

defineProps({
  text: {
    type: Object,
    default: () => ({
      title: "Заголовок",
      close: "Отмена",
      action: "Сохранить",
    }),
  },
  item: { type: Object, default: null },
  isDisabled: { type: Boolean },
  action: { type: Function, default: () => {} },
  close: { type: Function, default: () => {} },
  isLoading: { type: Boolean, default: false },
});
</script>

<style scoped>
/* --- Анимации появления модалки --- */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from .modal-content {
  transform: scale(0.9) translateY(20px);
}

/* Анимация смены контента внутри (Fade) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- Основные стили --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  padding: 20px;
}

.modal-content {
  background: #ffffff;
  width: 100%;
  max-width: 500px;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* --- Шапка --- */
.modal-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 32px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #1e293b;
  font-weight: 700;
}

.account-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  padding: 4px 12px 4px 6px;
  border-radius: 100px;
  border: 1px solid #e2e8f0;
}

.mini-icon {
  width: 20px !important;
  height: 20px !important;
}

.account-name {
  font-size: 12px;
  color: #475569;
  font-weight: 600;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  color: #64748b;
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

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

/* --- Скелетоны (Красивая загрузка) --- */
.skeleton {
  background: linear-gradient(90deg, #f0f2f5 25%, #e2e8f0 50%, #f0f2f5 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 6px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-title {
  width: 140px;
  height: 24px;
}
.skeleton-text {
  width: 100%;
  height: 16px;
  margin-bottom: 12px;
}
.skeleton-text.short {
  width: 60%;
}
.skeleton-block {
  width: 100%;
  height: 120px;
  margin-top: 20px;
  border-radius: 12px;
}

/* --- Футер --- */
.modal-footer {
  padding: 16px 24px;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #f1f5f9;
}

.active-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.active-btn:hover:not(:disabled) {
  background: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.active-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.done-btn {
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

/* Спиннер внутри кнопки */
.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-text-loading {
  opacity: 0.8;
}
</style>
