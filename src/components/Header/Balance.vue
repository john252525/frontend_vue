<template>
  <div @click="balanceStationOn" class="black-fon"></div>
  <section class="balance-user-section">
    <article class="balance-info">
      <h2 class="balance-text">Ваш баланс: 0 ₽</h2>
      <div class="line"></div>
    </article>
    <article class="top-balance-cont" @click="handleTopUp">
      <img src="/header/balance.svg" alt="Иконка пополнения баланса" />
      <h2 class="top-balance-title">Пополнить баланс</h2>
    </article>
  </section>
</template>

<script setup>
const props = defineProps({
  balanceStationOn: {
    type: Function,
  },
});

const handleTopUp = () => {
  console.log("Пополнение баланса");
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

.balance-user-section {
  position: absolute;
  z-index: 10;
  right: 71px;
  top: 65px;
  background: #fff;
  border-radius: 3px;
  width: 195px;
  height: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
}

.balance-text {
  font-weight: 700;
  font-size: 16px;
  color: #535353;
  text-align: center;
}

.line {
  width: 100%;
  height: 1px;
  background-color: #d9d9d9;
  margin: 8px 0 10px;
}

.top-balance-cont {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.top-balance-cont:hover {
  background-color: rgb(236, 236, 236);
  border-radius: 5px;
}

.top-balance-title {
  font-weight: 600;
  font-size: 14px;
  color: #535353;
  text-align: center;
}
</style>
