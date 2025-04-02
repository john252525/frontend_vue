<template>
  <div class="error-container">
    <section class="result-section">
      <div class="circle">
        <img src="/loadModal/close.svg" alt="" />
      </div>
      <p class="error-message">Сообщение не отправлено</p>
      <p class="error-message">{{ message }}</p>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed, defineProps, toRefs } from "vue";

const props = defineProps({
  message: {
    type: String,
  },
});

const { message } = toRefs(props);
</script>

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-section {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.circle {
  width: 50px;
  height: 50px;
  border: 1.9px solid #b73131;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: rotate 1s ease-in-out forwards;
}

.reload-button {
  border-radius: 5px;
  width: 100px;
  height: 30px;
  background: #b73131;
  font-weight: 600;
  font-size: 12px;
  color: #fff;
  margin-top: 24px;
  animation: opacity 0.5s ease-in-out forwards;
}

.reload-img {
  margin-top: 36px;
}

.plus {
  font-size: 30px;
  color: #ff0000; /* Цвет плюса */
}

@keyframes opacity {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes rotate {
  from {
    transform: rotate(350deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  margin-top: 24px;
  font-size: 18px;
  font-weight: 500;
  color: #b73131;
  text-align: center;
  transition: opacity 0.5s ease;
}

.error-message,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.error-message,
.fade-leave-to {
  opacity: 0;
}

.error-message {
  animation: fadeIn 1s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    /* transform: translate(0px, 20px); */
  }
  to {
    opacity: 1;
    /* transform: translate(0px, 0px); */
  }
}
</style>
