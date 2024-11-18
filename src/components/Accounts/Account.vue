<template>
  <header>
    <section class="account-section">
      <h2 class="title">Аккаунты</h2>
      <h2 class="account">Telegram</h2>
    </section>
    <section class="account-section">
      <button class="account-list-button">
        <img src="/account/down-arrow.svg" alt="" />Telegram
      </button>
      <button class="add-account-button">+ Добавить</button>
    </section>
  </header>
  <TelegramAccount />
</template>

<script setup>
import TelegramAccount from "./TelegramAccount/TelegramAccount.vue";
</script>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20px;
  margin-top: 20px;
  margin-bottom: 20px;
  gap: 1086px;
}

.account-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title {
  font-weight: 600;
  font-size: 24px;
  color: #000;
}

.account {
  font-weight: 600;
  font-size: 20px;
  color: #464646;
  padding: 6px 11px;
  background: #f9f9f9;
  border-radius: 5px;
}

.account-list-button {
  border-radius: 5px;
  padding: 12px 13px;
  background: rgba(73, 80, 202, 0.2);
  font-weight: 600;
  font-size: 16px;
  color: #4047ca;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.add-account-button {
  border-radius: 5px;
  padding: 12px 13px;
  background: #4950ca;
  font-weight: 600;
  font-size: 16px;
  color: #fff;
}
</style>
