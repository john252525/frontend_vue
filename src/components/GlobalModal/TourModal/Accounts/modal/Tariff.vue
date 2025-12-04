<template>
  <div class="tariff-help-modal">
    <div class="modal-content">
      <!-- Секция оплаты тарифа -->
      <div class="help-section">
        <h3 class="section-title">Оплатить тариф</h3>
        <div class="steps-list">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <span class="step-text">Выберите аккаунт</span>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <span class="step-text">Нажмите на кнопку "Продлить"</span>
              <span class="step-note">CRM аккаунта не требуется тариф</span>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <span class="step-text">Выберите и оплатите тариф</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Разделитель -->
      <div class="section-divider"></div>

      <!-- Секция продления тарифа -->
      <div class="help-section">
        <h3 class="section-title">Продлить тариф</h3>
        <div class="steps-list">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <span class="step-text">Выберите аккаунт</span>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <span class="step-text">Нажмите на кнопку "Действие"</span>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <span class="step-text">Выберите пункт "Продлить"</span>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">4</div>
            <div class="step-content">
              <span class="step-text">Выберите и оплатите тариф</span>
            </div>
          </div>
        </div>
      </div>
      <div class="divider"></div>
      <button @click="back" class="back-button">Назад</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  back: {
    type: Function,
  },
});
</script>

<style scoped>
.tariff-help-modal {
  /* border-radius: 12px; */
  max-width: 400px;
  width: 100%;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-content {
  background-color: transparent;
  padding: 24px;
}

.help-section {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
  padding: 0;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.step-number {
  background: oklch(0.541 0.198 267);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.step-text {
  font-size: 0.9rem;
  color: #374151;
  line-height: 1.4;
}

.step-note {
  font-size: 0.8rem;
  color: #6b7280;
  font-style: italic;
  line-height: 1.3;
}

.section-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 20px 0;
}

.divider {
  height: 1px;
  background-color: #e5e7eb;
  padding: 0;
  margin: 20px 0px 20px 0px;
}

.back-button {
  padding: 10px;
  border-radius: 6px;
  width: 100%;
  font-size: 16px;
  border: 1px solid #e5e7eb;
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

/* Адаптивность */
@media (max-width: 480px) {
  .tariff-help-modal {
    max-width: 100%;
    margin: 20px;
  }

  .modal-content {
    padding: 20px;
  }

  .section-title {
    font-size: 1rem;
    margin-bottom: 14px;
  }

  .step-text {
    font-size: 0.85rem;
  }

  .step-note {
    font-size: 0.75rem;
  }
}
</style>
