<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <div class="header-left">
            <h3>{{ text.title }}</h3>
            <div v-if="item" class="account-badge">
              <AccountIcon :item="item" class="mini-icon" />
              <span class="account-name">{{ item.name }}</span>
            </div>
          </div>

          <button class="close-btn" @click="close" aria-label="Закрыть">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <slot></slot>
        </div>

        <div class="modal-footer">
          <span v-if="saveStatus === 'saving'" class="save-loader"
            >Сохранение...</span
          >

          <button
            v-if="text.close"
            class="done-btn"
            :disabled="saveStatus === 'saving'"
            @click="close"
          >
            {{ text.close }}
          </button>

          <button
            v-if="text.action"
            class="active-btn"
            :disabled="saveStatus === 'saving'"
            @click="action"
          >
            <span v-if="saveStatus === 'saving'" class="spinner"></span>
            {{ text.action }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import AccountIcon from "../Accounts/AccountIcon.vue";

defineProps({
  isOpen: { type: Boolean, default: false },
  text: {
    type: Object,
    default: () => ({
      title: "Заголовок",
      close: "Отмена",
      action: "Сохранить",
    }),
  },
  item: { type: Object, default: null },
  saveStatus: { type: String, default: "idle" }, // 'idle', 'saving', 'success'
  action: { type: Function, default: () => {} },
  close: { type: Function, default: () => {} },
});
</script>

<style scoped>
/* --- Анимация появления --- */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Анимация контента (выплывание чуть снизу + зум) */
.modal-enter-active .modal-content {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active .modal-content {
  transition: transform 0.2s ease-in;
}

.modal-enter-from .modal-content {
  transform: scale(0.95) translateY(10px);
}
.modal-leave-to .modal-content {
  transform: scale(0.98);
}

/* --- Основные стили --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5); /* Глубокий темный фон */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px); /* Размытие заднего плана */
}

.modal-content {
  background: #ffffff;
  width: 95%;
  max-width: 550px;
  border-radius: 16px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* --- Шапка --- */
.modal-header {
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #0f172a;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.account-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  padding: 4px 10px 4px 6px;
  border-radius: 99px;
  border: 1px solid #e2e8f0;
}

.mini-icon {
  width: 22px !important;
  height: 22px !important;
  border-radius: 50%;
}

.account-name {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* --- Тело модалки --- */
.modal-body {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
  color: #334155;
  line-height: 1.5;
}

/* --- Футер --- */
.modal-footer {
  padding: 16px 24px;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #f1f5f9;
}

.save-loader {
  margin-right: auto;
  color: #64748b;
  font-size: 13px;
  font-style: italic;
}

.done-btn {
  background: #fff;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 9px 18px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.done-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.active-btn {
  background: #3b82f6; /* Или ваш oklch цвет */
  color: #fff;
  border: none;
  padding: 9px 22px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.active-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.active-btn:disabled,
.done-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Простой спиннер для кнопки */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
