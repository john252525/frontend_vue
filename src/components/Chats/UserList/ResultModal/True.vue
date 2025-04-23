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
            fill="none"
            stroke="#1b632b"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m4 12l6 6L20 6"
          />
        </svg>
      </div>
      <p class="error-message">Сообщение отправленно</p>
    </section>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
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
