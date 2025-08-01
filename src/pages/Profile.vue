<template>
  <div class="profile-page">
    <div class="profile-container">
      <ProfileHeader />

      <div class="profile-grid">
        <UserInfo
          :email="user.email"
          :country="user.country"
          :phone="user.phone"
          class="grid-item"
        />

        <!-- <SecuritySettings @changePassword="changePassword" class="grid-item" />

        <NotificationsSettings
          @updateNotifications="updateNotifications"
          class="grid-item"
        />

        <TariffInfo
          :subscription="user.subscription"
          @upgrade="upgradeSubscription"
          @cancel="cancelSubscription"
          class="grid-item"
        /> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import ProfileHeader from "@/components/Profile/ProfileHeader.vue";
import UserInfo from "@/components/Profile/UserInfo.vue";
import SecuritySettings from "@/components/Profile/SecuritySettings.vue";
import NotificationsSettings from "@/components/Profile/NotificationsSettings.vue";
import TariffInfo from "@/components/Profile/TariffInfo.vue";

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();

const user = ref({
  email: accountStore.getAccountData,
  country: "Россия",
  phone: "+7 (999) 123-45-67",
  subscription: {
    level: "premium",
    active: true,
    expiresAt: "31.12.2023",
  },
});

const changePassword = (passwords) => {
  console.log("Changing password:", passwords);
  alert("Пароль успешно изменен");
};

const updateNotifications = (settings) => {
  console.log("Updated notifications:", settings);
};

const upgradeSubscription = () => {
  user.value.subscription = {
    level: "basic",
    active: true,
    expiresAt: "31.12.2023",
  };
};

const cancelSubscription = () => {
  user.value.subscription.active = false;
};
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  min-height: 80vh;
}

.profile-container {
  max-width: 1230px;
  width: 100%;
  margin: 0 auto;
  padding: 20px 1.5rem;
  box-sizing: border-box;
  flex: 1; /* Занимает все доступное пространство */
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  align-content: start; /* Выравниваем элементы по верху */
}

.grid-item {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: auto; /* Убрал фиксированную высоту */
  min-height: 180px; /* Уменьшил минимальную высоту */
}

@media (max-width: 767px) {
  .profile-container {
    padding: 15px;
  }

  .profile-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .grid-item {
    padding: 1rem;
    min-height: 150px; /* Еще меньше на мобильных */
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .profile-grid {
    grid-template-columns: repeat(2, minmax(280px, 1fr));
  }
}

@media (min-width: 1024px) {
  .profile-grid {
    grid-template-columns: repeat(2, minmax(350px, 1fr));
    gap: 25px;
  }

  .grid-item {
    min-height: 200px; /* Немного увеличил для десктопа */
  }
}
</style>
