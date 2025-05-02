<template>
  <div class="error-container">
    <section class="result-section">
      <div class="circle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="#b73131"
            d="M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10s10-4.486 10-10S17.493 2 11.953 2M13 17h-2v-2h2zm0-4h-2V7h2z"
          />
        </svg>
      </div>
      <p class="error-message">
        {{ t("result.false.message.one") }} <br />
        {{ t("result.false.message.two") }}
      </p>
      <button @click="startFunc" class="reload-button">
        {{ t("result.false.button") }}
      </button>
    </section>
  </div>
</template>

<script setup>
import { ref, watch, inject } from "vue";
const { startFunc } = inject("accountItems");
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
  /* width: 400px; */
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

@media (max-width: 700px) {
  .result-section {
    width: 300px;
  }
}

@media (max-width: 400px) {
  .result-section {
    width: 250px;
  }

  .error-message {
    margin-top: 24px;
    font-size: 16px;
    font-weight: 500;
    color: #b73131;
    text-align: center;
    transition: opacity 0.5s ease;
  }
}
</style>
