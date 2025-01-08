<template>
  <div class="lds-facebook">
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<script setup></script>

<style scoped>
.lds-facebook,
.lds-facebook div {
  box-sizing: border-box;
}
.lds-facebook {
  display: inline-block;
  position: relative;
  width: 40px; /* Уменьшена ширина */
  height: 40px; /* Уменьшена высота */
}
.lds-facebook div {
  display: inline-block;
  position: absolute;
  left: 4px; /* Уменьшено расстояние слева */
  width: 8px; /* Уменьшена ширина каждого блока */
  background-color: #ebebeb;
  border-radius: 10px;
  animation: lds-facebook 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
}
.lds-facebook div:nth-child(1) {
  left: 4px;
  animation-delay: -0.24s;
}
.lds-facebook div:nth-child(2) {
  left: 16px; /* Уменьшено расстояние */
  animation-delay: -0.12s;
}
.lds-facebook div:nth-child(3) {
  left: 28px; /* Уменьшено расстояние */
  animation-delay: 0s;
}
@keyframes lds-facebook {
  0% {
    top: 4px; /* Уменьшено начальное положение */
    height: 32px; /* Уменьшена высота */
  }
  50%,
  100% {
    top: 12px; /* Уменьшено конечное положение */
    height: 16px; /* Уменьшена высота */
  }
}
</style>

Найти еще
