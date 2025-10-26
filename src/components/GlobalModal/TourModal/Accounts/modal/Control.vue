<template>
  <div class="controls-list">
    <div class="control-item">
      <button
        class="control-btn control-settings-btn"
        @click="toggleInfo('settings')"
      >
        <span class="control-text">Настройки</span>
        <span
          class="control-arrow"
          :class="{ rotated: activeItem === 'settings' }"
          >▼</span
        >
      </button>
      <div class="control-info" :class="{ active: activeItem === 'settings' }">
        <p>
          Применение настроек к аккаунту, подключение вебхуков и настройка
          параметров работы
        </p>
      </div>
    </div>

    <div class="control-item">
      <button
        class="control-btn control-extend-btn"
        @click="toggleInfo('extend')"
      >
        <span class="control-text">Продлить</span>
        <span
          class="control-arrow"
          :class="{ rotated: activeItem === 'extend' }"
          >▼</span
        >
      </button>
      <div class="control-info" :class="{ active: activeItem === 'extend' }">
        <p>
          Продление текущего тарифного плана подписки для продолжения работы
          аккаунта
        </p>
      </div>
    </div>

    <div class="control-item">
      <button
        class="control-btn control-screenshot-btn"
        @click="toggleInfo('screenshot')"
      >
        <span class="control-text">Скриншот</span>
        <span
          class="control-arrow"
          :class="{ rotated: activeItem === 'screenshot' }"
          >▼</span
        >
      </button>
      <div
        class="control-info"
        :class="{ active: activeItem === 'screenshot' }"
      >
        <p>Получение текущего скриншота аккаунта для мониторинга состояния</p>
      </div>
    </div>

    <div class="control-item">
      <button
        class="control-btn control-name-btn"
        @click="toggleInfo('change_name')"
      >
        <span class="control-text">Сменить имя</span>
        <span
          class="control-arrow"
          :class="{ rotated: activeItem === 'change_name' }"
          >▼</span
        >
      </button>
      <div
        class="control-info"
        :class="{ active: activeItem === 'change_name' }"
      >
        <p>Изменение отображаемого имени аккаунта для удобства идентификации</p>
      </div>
    </div>

    <div class="control-item">
      <button
        class="control-btn control-enable-btn"
        @click="toggleInfo('enable')"
      >
        <span class="control-text">Включение</span>
        <span
          class="control-arrow"
          :class="{ rotated: activeItem === 'enable' }"
          >▼</span
        >
      </button>
      <div class="control-info" :class="{ active: activeItem === 'enable' }">
        <p>
          Подключение аккаунта через код авторизации или QR-код, активация для
          дальнейшей работы
        </p>
      </div>
    </div>

    <div class="control-item">
      <button
        class="control-btn control-disable-btn"
        @click="toggleInfo('disable')"
      >
        <span class="control-text">Выключение</span>
        <span
          class="control-arrow"
          :class="{ rotated: activeItem === 'disable' }"
          >▼</span
        >
      </button>
      <div class="control-info" :class="{ active: activeItem === 'disable' }">
        <p>
          Временная остановка работы аккаунта с сохранением всех текущих
          настроек
        </p>
      </div>
    </div>

    <div class="control-item">
      <button
        class="control-btn control-reset-btn"
        @click="toggleInfo('reset')"
      >
        <span class="control-text">Сбросить</span>
        <span class="control-arrow" :class="{ rotated: activeItem === 'reset' }"
          >▼</span
        >
      </button>
      <div class="control-info" :class="{ active: activeItem === 'reset' }">
        <p>Полный сброс всех настроек аккаунта к значениям по умолчанию</p>
      </div>
    </div>

    <div class="control-item">
      <button
        class="control-btn control-delete-btn"
        @click="toggleInfo('delete_account')"
      >
        <span class="control-text">Удаление аккаунта</span>
        <span
          class="control-arrow"
          :class="{ rotated: activeItem === 'delete_account' }"
          >▼</span
        >
      </button>
      <div
        class="control-info"
        :class="{ active: activeItem === 'delete_account' }"
      >
        <p>
          Удаление аккаунта из системы. Удаленные аккаунты можно просмотреть:
        </p>
        <div class="steps">
          <span class="step">1. Перейти в раздел "Фильтры"</span>
          <span class="step">2. Выбрать опцию "Удаленные аккаунты"</span>
        </div>
      </div>
    </div>
    <div class="divider"></div>
    <button @click="back" class="back-button">Назад</button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  back: {
    type: Function,
  },
});

const activeItem = ref(null);

const toggleInfo = (item) => {
  if (activeItem.value === item) {
    activeItem.value = null;
  } else {
    activeItem.value = item;
  }
};
</script>

<style scoped>
.controls-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  overflow: hidden;
}

.control-item {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.control-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.control-btn {
  background: #f8fafc;
  border: none;
  padding: 16px 20px;
  font-size: 1rem;
  font-weight: 500;
  color: #000;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  will-change: transform;
}

.control-btn:active {
  transform: scale(0.98);
}

.control-text {
  font-weight: 500;
  transition: color 0.3s ease;
}

.control-arrow {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 12px;
  color: #6b7280;
  will-change: transform;
}

.control-arrow.rotated {
  transform: rotate(180deg);
}

.divider {
  height: 1px;
  background-color: #e5e7eb;
  padding: 0;
  margin: 12px 0px 10px 0px;
}

.control-info {
  max-height: 0;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  transform-origin: top;
  will-change: max-height, transform;
}

.control-info.active {
  max-height: 200px;
  padding: 18px 20px;
  animation: slideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.control-info:not(.active) {
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes slideDown {
  0% {
    opacity: 0;
    transform: translateY(-10px) scaleY(0.8);
  }
  50% {
    opacity: 0.7;
    transform: translateY(2px) scaleY(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scaleY(1);
  }
}

@keyframes slideUp {
  0% {
    opacity: 1;
    transform: translateY(0) scaleY(1);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-5px) scaleY(0.95);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px) scaleY(0.8);
  }
}

.back-button {
  padding: 10px;
  border-radius: 6px;
  font-size: 16px;
  border: 1px solid #e5e7eb;
}

.control-info p {
  margin: 0 0 12px 0;
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
  animation: fadeIn 0.4s ease 0.1s both;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: fadeIn 0.4s ease 0.2s both;
}

.step {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.4;
  padding-left: 12px;
  position: relative;
  animation: slideInLeft 0.3s ease both;
}

.step:nth-child(1) {
  animation-delay: 0.25s;
}
.step:nth-child(2) {
  animation-delay: 0.35s;
}

.step:before {
  content: "•";
  position: absolute;
  left: 0;
  color: #94a3b8;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.control-settings-btn:hover,
.control-extend-btn:hover,
.control-screenshot-btn:hover,
.control-name-btn:hover,
.control-enable-btn:hover,
.control-disable-btn:hover,
.control-reset-btn:hover {
  background: oklch(0.541 0.198 267);
  color: white;
}

.control-settings-btn:hover .control-text,
.control-extend-btn:hover .control-text,
.control-screenshot-btn:hover .control-text,
.control-name-btn:hover .control-text,
.control-enable-btn:hover .control-text,
.control-disable-btn:hover .control-text,
.control-reset-btn:hover .control-text,
.control-settings-btn:hover .control-arrow,
.control-extend-btn:hover .control-arrow,
.control-screenshot-btn:hover .control-arrow,
.control-name-btn:hover .control-arrow,
.control-enable-btn:hover .control-arrow,
.control-disable-btn:hover .control-arrow,
.control-reset-btn:hover .control-arrow {
  color: white;
}

.control-delete-btn {
  background: #fef2f2;
  color: #dc2626;
}

.control-delete-btn:hover {
  background: #dc2626;
  color: white;
}

.control-delete-btn:hover .control-text,
.control-delete-btn:hover .control-arrow {
  color: white;
}

/* Убираем скролл и улучшаем производительность */
.controls-list {
  -webkit-overflow-scrolling: touch;
  backface-visibility: hidden;
  perspective: 1000;
}

.control-item {
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* Адаптивность */
@media (max-width: 480px) {
  .controls-list {
    padding: 12px;
    gap: 6px;
  }

  .control-btn {
    padding: 14px 16px;
    font-size: 0.9rem;
  }

  .control-info.active {
    padding: 14px 16px;
    max-height: 180px;
  }

  .control-info p {
    font-size: 0.8rem;
  }

  .step {
    font-size: 0.75rem;
  }
}
</style>
