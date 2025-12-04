import { toRefs } from 'vue';
<template>
  <div class="not-found">
    <div class="not-found__content">
      <svg class="not-found__icon" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      <h3 class="not-found__title">
        {{ getTitle(type) }}
      </h3>
      <p class="not-found__desc">
        {{ getSubTitle(type) }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: "accounts",
  },
});

const { type } = toRefs(props);

function getTitle(type) {
  switch (type) {
    case "accounts":
      return "Аккаунтов не найдено";
    case "mailing":
      return "Рассылок не найдено";
    case "chats":
      return "Чатов не найдено";
    default:
      return "Данных нет";
  }
}

function getSubTitle(type) {
  switch (type) {
    case "accounts":
      return "Измените параметры поиска или создайте аккаунт";
    case "mailing":
      return "Создайте новую рассылку";
    case "chats":
      return "Попробуйте включить аккаунт";
    default:
      return "Данных нет";
  }
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 1.5rem;
}

.not-found__content {
  text-align: center;
  max-width: 300px;
}

.not-found__icon {
  width: 48px;
  height: 48px;
  color: #94a3b8;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.not-found__title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #334155;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.not-found__desc {
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
}

/* Минимальная анимация */
.not-found__icon {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 0.7;
    transform: scale(1);
  }
}

@media (max-width: 640px) {
  .not-found {
    min-height: 150px;
    padding: 1rem;
  }

  .not-found__icon {
    width: 40px;
    height: 40px;
  }

  .not-found__title {
    font-size: 1rem;
  }

  .not-found__desc {
    font-size: 0.8125rem;
  }
}
</style>
