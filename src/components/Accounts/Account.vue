<template>
  <AddTelegramAccount
    :openAddAccountStation="openAddAccount"
    v-if="openAddAccountStation"
  />
  <header>
    <section class="account-section">
      <h2 class="title">Аккаунты</h2>
      <h2 class="account">{{ platformStationText }}</h2>
    </section>
    <section class="account-section">
      <button @click="openPlatformChoice" class="account-list-button">
        <img src="/account/down-arrow.svg" alt="" />{{ platformStationText }}
      </button>
      <article v-if="platformStation">
        <div @click="openPlatformChoice" class="black-fon"></div>
        <ul class="platform-list">
          <li @click="choiceTelegram" class="platform">Telegram</li>
          <li @click="choiceWhatsApp" class="platform">WhatsApp</li>
        </ul>
      </article>
      <button @click="openAddAccount" class="add-account-button">
        + Добавить
      </button>
    </section>
  </header>
  <AccountList :platformStationTextValue="platformStationTextValue" />
</template>

<script setup>
import AddTelegramAccount from "./TelegramAccount/AddAccount.vue";
import AccountList from "./Accounts/AccountsList.vue";
import { ref } from "vue";
// localStorage.setItem("accountStationText", "Telegram");
// localStorage.setItem("accountStation", "telegram");g
const platformStationTextValue = ref("telegram");
const openAddAccountStation = ref(false);
const platformStationText = localStorage.getItem("accountStationText");
const platformStation = ref(false);

function openPlatformChoice() {
  platformStation.value = !platformStation.value;
}

function choiceTelegram() {
  location.reload();
  localStorage.setItem("accountStation", "telegram");
  localStorage.setItem("accountStationText", "Telegram");
  platformStation.value = !platformStation.value;
}

function choiceWhatsApp() {
  location.reload();
  localStorage.setItem("accountStation", "whatsapp");
  localStorage.setItem("accountStationText", "WhatsApp");
  platformStation.value = !platformStation.value;
}

function openAddAccount() {
  openAddAccountStation.value = !openAddAccountStation.value;
}
</script>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px;
  box-sizing: border-box;
}

.account-section {
  display: flex;
  align-items: center;
}

.title {
  font-weight: 600;
  font-size: 22px;
  color: #000;
  flex: 1; /* Title takes available space */
  margin-right: 20px; /* Add space between title and buttons */
}

.account {
  font-weight: 700;
  font-size: 18px;
  color: #464646;
  background: #f9f9f9;
  border-radius: 5px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto; /* Don't let the account box expand */
}

.account-list-button,
.add-account-button {
  border-radius: 5px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: 0 0 auto;
}

.account-list-button {
  background: rgba(73, 80, 202, 0.2);
  font-weight: 600;
  font-size: 14px;
  color: #4047ca;
  margin-right: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.25s;
}

.account-list-button:hover {
  background: rgba(0, 13, 255, 0.2);
  transition: all 0.25s;
}

.account-list-button:active {
  background: rgba(17, 21, 93, 0.2);
  transition: all 0.25s;
}

.add-account-button {
  background: #4950ca;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  transition: all 0.25s;
}

.add-account-button:hover {
  background: #565cc8;
  transition: all 0.25s;
}

.add-account-button:active {
  background: #3e43ae;
  transition: all 0.25s;
}

.black-fon {
  position: absolute;
  z-index: 5;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.platform-list {
  position: absolute;
  z-index: 10;
  right: 137px;
  top: 150px;
  border-radius: 10px;
  width: 120px;
  height: 70px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
}
.platform-list.fade-enter-active,
.platform-list.fade-leave-active {
  transition: opacity 0.5s ease;
}
.platform-list.fade-enter,
.platform-list.fade-leave-to {
  opacity: 0;
}

.platform-list {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.platform {
  padding: 4px;
  transition: all 0.1s;
  cursor: pointer;
}

.platform:hover {
  text-align: center;
  width: 100px;
  background-color: #eeeeee;
  border-radius: 5px;
  transition: all 0.2s;
}

@media (max-width: 768px) {
  .account {
    display: none;
  }

  header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .platform-list {
    left: 20px;
    top: 180px;
  }
}
</style>
