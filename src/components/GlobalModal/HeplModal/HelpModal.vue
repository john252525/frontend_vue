<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal" :class="{ 'modal-enter': isVisible }">
      <!-- Хедер -->
      <div class="modal-header">
        <h2 class="modal-title">Помощь по сайту</h2>
        <button class="close-btn" @click="closeModal">
          <span class="close-icon">×</span>
        </button>
      </div>

      <!-- Разделительная линия -->
      <div class="divider"></div>

      <!-- Контент -->
      <div class="modal-content">
        <!-- Аккаунты -->
        <div class="section">
          <button class="section-btn" @click="toggleSection('accounts')">
            <span class="section-title">Аккаунты</span>
            <span class="section-arrow" :class="{ rotated: isAccountsOpen }"
              >▼</span
            >
          </button>
          <transition name="slide">
            <div v-if="isAccountsOpen" class="subsection">
              <button class="subsection-item" @click="handleClick('Интерфейс')">
                <span class="bullet">•</span>
                Интерфейс
              </button>
              <button
                class="subsection-item"
                @click="handleClick('Управление аккаунтов')"
              >
                <span class="bullet">•</span>
                Управление аккаунтов
              </button>
              <button
                class="subsection-item"
                @click="handleClick('Создание аккаунта')"
              >
                <span class="bullet">•</span>
                Создание аккаунта
              </button>
            </div>
          </transition>
        </div>

        <!-- Рассылки -->
        <div class="section">
          <button class="section-btn" @click="toggleSection('mailings')">
            <span class="section-title">Рассылки</span>
            <span class="section-arrow" :class="{ rotated: isMailingsOpen }"
              >▼</span
            >
          </button>
          <transition name="slide">
            <div v-if="isMailingsOpen" class="subsection">
              <button class="subsection-item" @click="handleClick('Интерфейс')">
                <span class="bullet">•</span>
                Интерфейс
              </button>
              <button
                class="subsection-item"
                @click="handleClick('Создание рассылки')"
              >
                <span class="bullet">•</span>
                Создание рассылки
              </button>
              <button
                class="subsection-item"
                @click="handleClick('Оплата рассылки')"
              >
                <span class="bullet">•</span>
                Оплата рассылки
              </button>
              <button
                class="subsection-item"
                @click="handleClick('Управление рассылкой')"
              >
                <span class="bullet">•</span>
                Управление рассылкой
              </button>
            </div>
          </transition>
        </div>

        <!-- Рефералы -->
        <div class="section">
          <button class="section-btn" @click="toggleSection('referrals')">
            <span class="section-title">Рефералы</span>
            <span class="section-arrow" :class="{ rotated: isReferralsOpen }"
              >▼</span
            >
          </button>
          <transition name="slide">
            <div v-if="isReferralsOpen" class="subsection">
              <button class="subsection-item" @click="handleClick('Интерфейс')">
                <span class="bullet">•</span>
                Интерфейс
              </button>
              <button
                class="subsection-item"
                @click="handleClick('Добавление реферала')"
              >
                <span class="bullet">•</span>
                Добавление реферала
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useHelpModalStore } from "@/stores/helpModalStore";

const store = useHelpModalStore();
const isVisible = ref(false);

// Получаем состояния из стора
const { isOpen, isAccountsOpen, isMailingsOpen, isReferralsOpen } = store;

// Отслеживаем открытие модалки для анимации
watch(isOpen, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      isVisible.value = true;
    }, 50);
  } else {
    isVisible.value = false;
  }
});

// Методы стора
const { closeModal, toggleSection, handleItemClick } = store;

const handleClick = (item) => {
  handleItemClick(item);
  // Здесь можно добавить дополнительную логику
};
</script>

<style scoped>
/* Стили остаются такими же как в предыдущем компоненте */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transform: scale(0.8) translateY(-20px);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px 12px 0 0;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.close-icon {
  font-size: 1.5rem;
  color: white;
  line-height: 1;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
  margin: 0 24px;
}

.modal-content {
  padding: 20px 24px;
}

.section {
  margin-bottom: 8px;
}

.section-btn {
  width: 100%;
  padding: 16px 20px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.section-btn:hover {
  background: #e9ecef;
  border-color: #667eea;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.section-title {
  font-weight: 500;
  color: #2d3748;
}

.section-arrow {
  transition: transform 0.3s ease;
  color: #667eea;
  font-size: 0.8rem;
}

.section-arrow.rotated {
  transform: rotate(180deg);
}

.subsection {
  background: #f8f9fa;
  border-radius: 6px;
  margin: 4px 0 12px 0;
  overflow: hidden;
}

.slide-enter-active {
  transition: all 0.3s ease-out;
}

.slide-leave-active {
  transition: all 0.2s ease-in;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px;
}

.subsection-item {
  width: 100%;
  padding: 14px 20px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.subsection-item:last-child {
  border-bottom: none;
}

.subsection-item:hover {
  background: #667eea;
  color: white;
  transform: translateX(4px);
}

.subsection-item:hover .bullet {
  color: white;
}

.bullet {
  color: #667eea;
  margin-right: 12px;
  font-size: 1.2rem;
  transition: color 0.2s ease;
}

.modal::-webkit-scrollbar {
  width: 6px;
}

.modal::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.modal::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.modal::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
