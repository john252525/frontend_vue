<template>
  <div @click="AccountMenuStationOn" class="black-fon"></div>
  <section class="account-menu-section">
    <h2 class="email-user">your.email@mail.ru</h2>
    <div class="line"></div>
    <h2 class="out-account-button" @click="handleLogout">Выйти</h2>
  </section>
</template>

<script setup>
const props = defineProps({
  AccountMenuStationOn: {
    type: Function,
  },
});

const handleLogout = () => {
  console.log("Выход из аккаунта");
};
</script>

<style scoped>
.black-fon {
  position: fixed;
  z-index: 5;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 0;
  left: 0;
}

.account-menu-section {
  position: absolute;
  z-index: 10;
  right: 0;
  top: 65px;
  border-radius: 5px 0 0 5px;
  width: 260px;
  background: #fff;
  padding: 12px 0;
}

.line {
  background-color: #d9d9d9;
  height: 1px;
  margin: 12px 0 16px;
}

.email-user {
  font-weight: 600;
  font-size: 18px;
  color: #535353;
  text-align: center;
}

.out-account-button {
  font-weight: 500;
  font-size: 18px;
  color: #000;
  margin-left: 35px;
  cursor: pointer;
  transition: color 0.15s;
}

.out-account-button:hover {
  color: #b64040;
}
</style>
