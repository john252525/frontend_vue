<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <button class="back-button" @click="closeModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <h2 class="modal-title">Возможные причины</h2>
        <div class="placeholder"></div>
      </div>

      <div class="modal-body">
        <div class="reasons-list">
          <div class="reason-item">
            <div class="reason-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 15V9M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <div class="reason-content">
              <h3 class="reason-title">Исчерпан лимит авторизации</h3>
              <p class="reason-description">
                Превышено максимальное количество попыток ввода кода. Попробуйте
                через 10-15 минут
              </p>
            </div>
          </div>

          <div class="reason-item">
            <div class="reason-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M17 8L21 12M21 12L17 16M21 12H3M13 3C13 2.44772 12.5523 2 12 2C11.4477 2 11 2.44772 11 3H13ZM11 21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21H11Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="reason-content">
              <h3 class="reason-title">Пришел на другой аккаунт</h3>
              <p class="reason-description">
                Проверьте другие ваши Telegram аккаунты или устройства
              </p>
            </div>
          </div>

          <div class="reason-item">
            <div class="reason-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8V12L14 14M12 3C13.1819 3 14.3522 3.23279 15.4442 3.68508C16.5361 4.13738 17.5282 4.80031 18.364 5.63604C19.1997 6.47177 19.8626 7.46392 20.3149 8.55585C20.7672 9.64778 21 10.8181 21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <div class="reason-content">
              <h3 class="reason-title">Попробуйте позже</h3>
              <p class="reason-description">
                Серверы Telegram могут быть временно перегружены
              </p>
            </div>
          </div>

          <div class="reason-item">
            <div class="reason-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12Z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M7 4V2.5M17 4V2.5M2.5 9H21.5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <div class="reason-content">
              <h3 class="reason-title">Неверный номер телефона</h3>
              <p class="reason-description">
                Убедитесь, что введен правильный номер телефона, привязанный к
                аккаунту
              </p>
            </div>
          </div>

          <div class="reason-item">
            <div class="reason-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <div class="reason-content">
              <h3 class="reason-title">Проблемы с сетью</h3>
              <p class="reason-description">
                Проверьте подключение к интернету и стабильность сети
              </p>
            </div>
          </div>

          <div class="reason-item">
            <div class="reason-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14.8284 14.8285L9.17157 9.17163M9.17157 14.8285L14.8284 9.17163M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <div class="reason-content">
              <h3 class="reason-title">Блокировка оператора</h3>
              <p class="reason-description">
                Некоторые операторы блокируют SMS от Telegram. Попробуйте
                получить код через звонок
              </p>
            </div>
          </div>
        </div>

        <div class="solutions-section">
          <h3 class="solutions-title">Что можно сделать:</h3>
          <ul class="solutions-list">
            <li>Подождите 1-2 минуты - SMS могут приходить с задержкой</li>
            <li>Проверьте папку "Спам" в сообщениях</li>
            <li>Перезагрузите телефон</li>
            <li>Убедитесь, что номер правильно введен в настройках Telegram</li>
            <li>Попробуйте войти через QR-код</li>
          </ul>
        </div>
      </div>

      <div class="modal-footer">
        <button class="try-again-button" @click="closeModal">Понятно</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const closeModal = () => {
  emit("close");
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.back-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-button:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  text-align: center;
  flex: 1;
}

.placeholder {
  width: 40px;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px;
}

.reasons-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 20px 0;
}

.reason-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.reason-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4950ca;
  margin-top: 2px;
}

.reason-content {
  flex: 1;
}

.reason-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.reason-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin: 0;
}

.solutions-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin: 24px 0;
}

.solutions-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.solutions-list {
  margin: 0;
  padding-left: 16px;
  color: #666;
}

.solutions-list li {
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 6px;
}

.solutions-list li:last-child {
  margin-bottom: 0;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  background: white;
}

.try-again-button {
  width: 100%;
  background: #4950ca;
  border: none;
  padding: 14px 24px;
  border-radius: 12px;
  cursor: pointer;
  color: white;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.try-again-button:hover {
  background: #3a40a0;
  transform: translateY(-1px);
}

.try-again-button:active {
  transform: translateY(0);
}

/* Анимации */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Скроллбар */
.modal-body::-webkit-scrollbar {
  width: 4px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Мобильная адаптация */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 16px;
  }

  .modal-content {
    border-radius: 12px;
  }

  .modal-header {
    padding: 16px 20px 12px;
  }

  .modal-body {
    padding: 0 20px;
  }

  .modal-footer {
    padding: 16px 20px;
  }

  .modal-title {
    font-size: 16px;
  }

  .reason-title {
    font-size: 13px;
  }

  .reason-description {
    font-size: 12px;
  }

  .solutions-list li {
    font-size: 12px;
  }
}
</style>
