<template>
  <div class="modal-overlay" @click.self="$emit('later')">
    <div class="warning-modal">
      <div class="modal-header">
        <div class="warning-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h2 class="modal-title">Подписка не активна</h2>
      </div>

      <div class="modal-content">
        <p class="warning-text">
          {{
            props.message ||
            "Ваша подписка на рассылки не активна. Для продолжения получения уведомлений необходимо продлить подписку."
          }}
        </p>

        <div class="consequences-card">
          <h3 class="consequences-title">Без подписки вы не можете:</h3>
          <div class="consequences-grid">
            <div class="consequence-item">
              <div class="consequence-icon">📧</div>
              <span>Создавать рассылки</span>
            </div>
            <div class="consequence-item">
              <div class="consequence-icon">🔔</div>
              <span>Отправлять уведомления</span>
            </div>
            <div class="consequence-item">
              <div class="consequence-icon">🎁</div>
              <span>Использовать массовые рассылки</span>
            </div>
            <div class="consequence-item">
              <div class="consequence-icon">📊</div>
              <span>Получать аналитику</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-secondary" @click="$emit('later')">
          Напомнить позже
        </button>
        <button class="btn btn-primary" @click="$emit('buySubscription')">
          Купить подписку
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(["buySubscription", "later"]);

const props = defineProps({
  message: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--backgroundComponentModal);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.warning-modal {
  background: var(--modalBg);
  border-radius: 16px;
  padding: 32px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--line);
}

.modal-header {
  text-align: center;
  margin-bottom: 24px;
}

.warning-icon {
  width: 64px;
  height: 64px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #ef4444;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--modalColor);
  margin: 0;
  line-height: 1.2;
}

.modal-content {
  margin-bottom: 32px;
}

.warning-text {
  color: var(--headerAccountText);
  line-height: 1.5;
  margin-bottom: 24px;
  text-align: center;
  font-size: 15px;
}

.consequences-card {
  background: var(--tableAccountBg);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--line);
}

.consequences-title {
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
}

.consequences-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.consequence-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--headerAccountText);
}

.consequence-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.btn-secondary {
  background: var(--tableAccountBg);
  color: var(--text);
}

.btn-secondary:hover {
  background: var(--line);
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primaryHover);
}

@media (max-width: 480px) {
  .warning-modal {
    padding: 24px;
    margin: 0;
  }

  .consequences-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-title {
    font-size: 20px;
  }
}
</style>
