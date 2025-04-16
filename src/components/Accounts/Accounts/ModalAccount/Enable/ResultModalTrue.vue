<template>
  <div class="error-container">
    <section class="result-section">
      <div class="circle">
        <img src="/loadModal/checkmark.svg" alt="" />
      </div>
      <p class="error-message">{{ t("result.true") }}</p>
    </section>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
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
  border: 1.9px solid #1b632b;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: rotate 1s ease-in-out forwards;
}

.plus {
  font-size: 30px;
  color: #ff0000; /* Цвет плюса */
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
  color: #1b632b;
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
