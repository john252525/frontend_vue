<template>
  <div class="error-container">
    <section class="result-section">
      <div class="circle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 1024 1024"
        >
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M799.855 166.312c.023.007.043.018.084.059l57.69 57.69c.041.041.052.06.059.084a.118.118 0 0 1 0 .069c-.007.023-.018.042-.059.083L569.926 512l287.703 287.703c.041.04.052.06.059.083a.118.118 0 0 1 0 .07c-.007.022-.018.042-.059.083l-57.69 57.69c-.041.041-.06.052-.084.059a.118.118 0 0 1-.069 0c-.023-.007-.042-.018-.083-.059L512 569.926L224.297 857.629c-.04.041-.06.052-.083.059a.118.118 0 0 1-.07 0c-.022-.007-.042-.018-.083-.059l-57.69-57.69c-.041-.041-.052-.06-.059-.084a.118.118 0 0 1 0-.069c.007-.023.018-.042.059-.083L454.073 512L166.371 224.297c-.041-.04-.052-.06-.059-.083a.118.118 0 0 1 0-.07c.007-.022.018-.042.059-.083l57.69-57.69c.041-.041.06-.052.084-.059a.118.118 0 0 1 .069 0c.023.007.042.018.083.059L512 454.073l287.703-287.702c.04-.041.06-.052.083-.059a.118.118 0 0 1 .07 0Z"
          />
        </svg>
      </div>
      <p class="error-message">
        Неизвестная ошибка, <br />
        пожалуйста, попробуйте еще раз
      </p>
    </section>
  </div>
</template>

<script setup>
import { ref, watch, inject } from "vue";
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
  width: 40px;
  height: 40px;
  border: 1.9px solid #b73131;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: rotate 1s ease-in-out forwards;
}

.circle img {
  width: 14px;
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
  font-size: 14px;
  color: #ff0000;
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
  font-size: 16px;
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
