<template>
  <div>
    <h2>QR-код:</h2>
    <qrcode-vue :value="currentQr" :size="128" v-if="currentQr" />
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, onBeforeUnmount } from "vue";
import QrcodeVue from "qrcode.vue";

const qrData = ref([]); // Массив QR-кодов
const currentIndex = ref(0); // Индекс текущего QR-кода
const currentQr = ref(""); // Текущий QR-код
let intervalId = null; // Идентификатор интервала

// Функция для обновления текущего QR-кода
const updateQrCode = () => {
  if (qrData.value.length > 0) {
    currentQr.value = qrData.value[currentIndex.value];
    currentIndex.value = (currentIndex.value + 1) % qrData.value.length;
  }
};

// Запускаем интервал при монтировании компонента
onMounted(() => {
  initData();
  intervalId = setInterval(updateQrCode, 5000); // Обновляем QR-код каждые 5 секунд

  // Останавливаем интервал через 1 минуту
  setTimeout(() => {
    clearInterval(intervalId);
  }, 60000); // 60000 миллисекунд = 1 минута
});

// Очищаем интервал при размонтировании компонента
onBeforeUnmount(() => {
  clearInterval(intervalId);
});
</script>

<style scoped>
.qr-container {
  margin: 20px;
}
</style>
