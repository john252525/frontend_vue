<template>
  <div class="close-page">
    <h1>Чат уже открыт в другой вкладке</h1>
    <p>
      Пожалуйста, закройте эту вкладку и продолжайте работу в основной вкладке с
      чатом.
    </p>
    <button @click="closeTab">Закрыть вкладку</button>
  </div>
</template>

<script setup>
const closeTab = () => {
  window.close();
};
</script>

<style scoped>
.close-page {
  text-align: center;
  padding: 2rem;
}
</style>
