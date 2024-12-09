<template>
  <div v-if="qrModalStation">
    <div @click="changeStationQrModal" class="black-fon"></div>
    <section class="qr-section">
      <qrcode-vue :value="currentQr" :size="256" v-if="currentQr" />
      <button @click="changeStationQrModal" class="close-button">
        Закрыть
      </button>
    </section>
  </div>
</template>

<script setup>
import { ref, toRefs, onMounted, onBeforeUnmount } from "vue";
import QrcodeVue from "qrcode.vue";
const props = defineProps({
  changeStationQrModal: {
    type: Function,
  },
  qrModalStation: {
    type: Boolean,
  },
  qrCodeData: {
    type: Object,
  },
});

const { qrCodeData } = toRefs(props);

const currentIndex = ref(0);
const currentQr = ref("");
let intervalId = null;

const updateQrCode = () => {
  if (qrCodeData.value.length > 0) {
    currentQr.value = qrCodeData.value[currentIndex.value];
    currentIndex.value = (currentIndex.value + 1) % qrCodeData.value.length;
  }
};

onMounted(() => {
  intervalId = setInterval(updateQrCode, 5000);
  setTimeout(() => {
    clearInterval(intervalId);
    props.changeStationQrModal();
  }, 60000);
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
});
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

.qr-section {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  background-color: white;
  padding: 25px 30px;
  border-radius: 10px;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}

.close-button {
  width: 100%;
  height: 35px;
  border-radius: 5px;
  background-color: #4950ca;
  font-size: 14px;
  color: rgb(255, 255, 255);
  font-weight: 600;
  margin-top: 20px;
}
</style>
