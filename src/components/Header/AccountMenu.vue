<template>
  <div @click="AccountMenuStationOn" class="black-fon"></div>

  <section class="account-menu-section" :style="{ width: menuWidth }">
    <div class="user-header">
      <div class="user-avatar">{{ avatarLetter }}</div>
      <div class="user-info">
        <span class="user-label">Аккаунт</span>
        <h2 class="email-user">{{ email }}</h2>
      </div>
    </div>

    <div class="line"></div>

    <!-- <div class="menu-content">
      <div class="notifications-section">
        <h3 class="section-title">Уведомления</h3>

        <div class="notifications-list">
          <div
            v-for="item in notifications"
            :key="item.id"
            class="notification-card"
          >
            <div class="notification-dot" v-if="item.isNew"></div>
            <p>{{ item.text }}</p>
          </div>

          <p v-if="!notifications.length" class="empty-text">
            Новых уведомлений пока нет
          </p>
        </div>
      </div>
    </div> -->

    <div class="menu-footer">
      <div class="line"></div>
      <button class="out-account-button" @click="leaveAccount">
        {{ t("personalAccount.out") }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAccountStore } from "@/stores/accountStore";

const router = useRouter();
const { t } = useI18n();
const accountStore = useAccountStore();

const props = defineProps({
  AccountMenuStationOn: { type: Function },
});

// Данные пользователя
const storedData = computed(() => accountStore.getAccountData);
const email = computed(() => storedData.value || "guest@mail.com");

// Первая буква для аватара
const avatarLetter = computed(() => email.value.charAt(0).toUpperCase());

// Ширина (теперь чуть шире для боковой панели)
const menuWidth = ref("320px");

// Пример уведомлений
const notifications = ref([
  { id: 1, text: "Добавлена новая функция аналитики", isNew: true },
  { id: 2, text: "Обновление системы безопасности", isNew: false },
]);

const leaveAccount = () => {
  localStorage.clear(); // Очищаем всё разом для надежности
  location.reload();
  router.push("/login");
};
</script>

<style scoped>
.black-fon {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 99;
}

.account-menu-section {
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh; /* Полная высота */
  background: var(--bg, #fff);
  z-index: 100;
  display: flex;
  flex-direction: column; /* Вертикальный стек */
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
}

/* Шапка */
.user-header {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  background: var(--primary, #4a90e2);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: bold;
}

.user-label {
  font-size: 12px;
  color: #888;
  display: block;
}

.email-user {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text);
}

/* Контентная часть */
.menu-content {
  flex: 1; /* Занимает всё доступное пространство */
  padding: 10px 20px;
  overflow-y: auto; /* Скролл, если уведомлений много */
}

.section-title {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #999;
  margin-bottom: 15px;
}

.notification-card {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 10px;
  position: relative;
  font-size: 14px;
}

.notification-dot {
  width: 8px;
  height: 8px;
  background: #ff4d4f;
  border-radius: 50%;
  position: absolute;
  top: 8px;
  right: 8px;
}

/* Футер прижатый к низу */
.menu-footer {
  padding: 20px;
  margin-top: auto;
}

.out-account-button {
  width: 100%;
  padding: 12px;
  border: none;
  background: #fff0f0;
  color: #ff4d4f;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.out-account-button:hover {
  background: #ff4d4f;
  color: #fff;
}

.line {
  height: 1px;
  background: #eee;
  margin: 10px 0;
}

/* Анимация появления */
@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@media (max-width: 480px) {
  .account-menu-section {
    width: 100% !important;
  }
}
</style>
