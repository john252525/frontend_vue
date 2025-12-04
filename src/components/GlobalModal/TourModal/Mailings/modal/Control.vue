<template>
  <div class="controls-list">
    <!-- Включить/выключить -->
    <div class="control-item">
      <button
        class="control-btn control-toggle-btn"
        @click="toggleInfo('toggle')"
      >
        <span class="control-text">Включить/выключить</span>
        <span
          class="control-arrow"
          :class="{ rotated: activeItem === 'toggle' }"
          >▼</span
        >
      </button>
      <div class="control-info" :class="{ active: activeItem === 'toggle' }">
        <p>
          Изменение статуса рассылки - активация или приостановка отправки
          сообщений
        </p>
      </div>
    </div>

    <!-- Информация -->
    <div class="control-item">
      <button class="control-btn control-info-btn" @click="toggleInfo('info')">
        <span class="control-text">Информация</span>
        <span class="control-arrow" :class="{ rotated: activeItem === 'info' }"
          >▼</span
        >
      </button>
      <div class="control-info" :class="{ active: activeItem === 'info' }">
        <p>
          Просмотр детальной информации о рассылке: текущий статус, время
          запуска, задержки между сообщениями и другие параметры
        </p>
      </div>
    </div>

    <!-- Сообщения -->
    <div class="control-item">
      <button
        class="control-btn control-messages-btn"
        @click="toggleInfo('messages')"
      >
        <span class="control-text">Сообщения</span>
        <span
          class="control-arrow"
          :class="{ rotated: activeItem === 'messages' }"
          >▼</span
        >
      </button>
      <div class="control-info" :class="{ active: activeItem === 'messages' }">
        <p>
          Просмотр и управление текстами сообщений для разных сегментов
          пользователей, настройка персонализации контента
        </p>
      </div>
    </div>

    <!-- Редактировать -->
    <div class="control-item">
      <button class="control-btn control-edit-btn" @click="toggleInfo('edit')">
        <span class="control-text">Редактировать</span>
        <span class="control-arrow" :class="{ rotated: activeItem === 'edit' }"
          >▼</span
        >
      </button>
      <div class="control-info" :class="{ active: activeItem === 'edit' }">
        <p>
          Изменение параметров рассылки: дней недели, времени отправки,
          дополнительных настроек и условий фильтрации
        </p>
      </div>
    </div>

    <!-- Удалить -->
    <div class="control-item">
      <button
        class="control-btn control-delete-btn"
        @click="toggleInfo('delete')"
      >
        <span class="control-text">Удалить</span>
        <span
          class="control-arrow"
          :class="{ rotated: activeItem === 'delete' }"
          >▼</span
        >
      </button>
      <div class="control-info" :class="{ active: activeItem === 'delete' }">
        <p>
          Полное удаление рассылки из системы. Это действие невозможно отменить
        </p>
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
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: #f1f5f9;
  border-color: #d1d5db;
}

.control-info p {
  margin: 0 0 12px 0;
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
  animation: fadeIn 0.4s ease 0.1s both;
}

/* Единый цвет для всех кнопок кроме удаления */
.control-toggle-btn:hover,
.control-info-btn:hover,
.control-messages-btn:hover,
.control-edit-btn:hover {
  background: oklch(0.541 0.198 267);
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

/* Цвета стрелок и текста при наведении */
.control-toggle-btn:hover .control-text,
.control-toggle-btn:hover .control-arrow,
.control-info-btn:hover .control-text,
.control-info-btn:hover .control-arrow,
.control-messages-btn:hover .control-text,
.control-messages-btn:hover .control-arrow,
.control-edit-btn:hover .control-text,
.control-edit-btn:hover .control-arrow,
.control-delete-btn:hover .control-text,
.control-delete-btn:hover .control-arrow {
  color: white;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

  .back-button {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
}
</style>
