<template>
  <div v-if="modalQr">
    <div @click="forceStop" class="black-fon"></div>
    <section class="qr-section">
      <section v-if="!qrModalStation">
        <section class="loading">
          <div class="spinner"></div>
        </section>
      </section>
      <section v-if="qrModalStation">
        <qrcode-vue :value="currentQr" :size="256" v-if="currentQr" />
        <button @click="forceStop" class="close-button">Закрыть</button>
      </section>
    </section>
  </div>
</template>
<script setup>
import { ref, toRefs, onMounted, onBeforeUnmount, watch } from "vue";
import QrcodeVue from "qrcode.vue";
const props = defineProps({
  changeStationQrModal: { type: Function },
  qrModalStation: { type: Boolean },
  qrCodeData: { type: Object },
  changeStationQrModalOn: { type: Function },
});
const forceStop = () => {
  props.changeStationQrModal();
  location.reload();
};
const modalQr = ref(false);
const { qrCodeData, qrModalStation } = toRefs(props);
const currentIndex = ref(0);
const currentQr = ref("");
const dataQr = ref([]);
let intervalId = null;

const updateQrCode = () => {
  if (qrCodeData.value.length > 0) {
    currentQr.value = qrCodeData.value[currentIndex.value];
    currentIndex.value = (currentIndex.value + 1) % qrCodeData.value.length;
  }
};

watch(qrCodeData, (newValue) => {
  if (newValue.length > 0) {
    modalQr.value = true;
    console.log("qrCodeData");
    intervalId = setInterval(updateQrCode, 5000);
    setTimeout(() => {
      clearInterval(intervalId);
      if (qrModalStation.value === true) {
        modalQr.value = false;
        console.log("err");
      } else {
        return;
      }
    }, 60000);
  }
});
watch(currentQr, (newValue) => {
  if (newValue.length > 0) {
    props.changeStationQrModalOn();
    console.log("currentQr");
  }
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
  padding: 20px;
  width: 256px;
  height: 320px;
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
  margin-top: 25px;
}

.loading {
  border-radius: 20px;
  background: #ffffff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  padding: 15px;
}

.spinner {
  border: 8px solid rgba(255, 255, 255, 0.3);
  border-top: 8px solid #3498db; /* Цвет спиннера */
  border-radius: 50%;
  width: 50px; /* Ширина спиннера */
  height: 50px; /* Высота спиннера */
  animation: spin 1s linear infinite; /* Анимация вращения */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
