<template>
  <div @click="AccountMenuStationOn" class="black-fon"></div>
  <section class="account-menu-section">
    <h2 class="email-user">your.email@mail.ru</h2>
    <div class="line"></div>
    <h2 class="out-account-button">Выйти</h2>
  </section>
</template>

<script setup>
const props = defineProps({
  AccountMenuStationOn: {
    type: Function,
  },
});
</script>

<style scoped>
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

.account-menu-section {
  position: absolute;
  z-index: 10;
  right: 0px;
  top: 65px;
  border-radius: 5px 0 0 5px;
  width: 260px;
  height: 100px;
  background: #fff;
}

.line {
  background-color: #d9d9d9;
  width: 100%;
  height: 1px;
  margin-top: 12px;
  margin-bottom: 16px;
}

.email-user {
  font-weight: 600;
  font-size: 18px;
  color: #535353;
  text-align: center;
  margin-top: 12px;
}

.out-account-button {
  font-weight: 500;
  font-size: 18px;
  color: #000;
  margin-left: 35px;
  cursor: pointer;
  transition: all 0.15s;
}

.out-account-button:hover {
  width: 100%;
  color: #b64040;
  transition: all 0.15s;
}
</style>
