<template>
  <div v-if="isVisible" class="black-fon"></div>
  <div>
    <button @click="toggle">Toggle Block</button>
    <transition name="fade">
      <div v-if="isVisible" class="fade-in">
        <span class="action">Настройки</span>
        <span class="action">Настройки</span>
        <span class="action">Настройки</span>
        <span class="action">Настройки</span>
        <span class="action">Настройки</span>
        <span class="action">Настройки</span>
        <span class="action">Настройки</span>
        <span class="action">Настройки</span>
        <span class="action">Настройки</span>
        <span class="action">Настройки</span>

      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isVisible = ref(false);

const toggle = () => {
  isVisible.value = !isVisible.value;
};
</script>

<style>

.fade-in {
  border-radius: 10px;
    width: 170px;
    height: auto;
    background: #6b4b4b;
    position: absolute;
    z-index: 20;
    display: flex;
    justify-content: center;
    flex-direction: column;
    /* margin-left: -63px; */
    margin-top: 10px;
    padding: 10px 0px 10px 10px;
}
.black-fon {
    position: fixed;
    z-index: 5;
    width: 100%;
    height: 100vh;
    background: rgba(117, 117, 117, 0.3);
    top: 0;
    left: 0;
  }
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.fade-in {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px); /* Добавление эффекта смещения */
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
