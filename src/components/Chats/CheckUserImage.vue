<template>
  <div @click="changeImageStation" class="black-fon"></div>
  <div class="cont">
    <img
      v-if="userImageUrl"
      class="user-image"
      :src="userImageUrl"
      alt="user-image"
    />
    <img v-else class="user-chat-icon" src="/chats/user-chat-icon.svg" alt="" />
  </div>
</template>

<script setup>
import { defineProps, toRefs } from "vue";

const props = defineProps({
  changeImageStation: {
    type: Function,
  },
  userImageUrl: {},
});

const { userImageUrl } = toRefs(props);
</script>

<style scoped>
.black-fon {
  /* Этот элемент не влияет на центровку картинки */
}

.cont {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  display: flex; /* Используем flexbox для центровки */
  justify-content: center; /* Центрируем по горизонтали */
  align-items: center; /* Центрируем по вертикали */
  width: 500px; /* задайте ширину контейнера */
  height: 500px; /* задайте высоту контейнера */
}

.user-image {
  border-radius: 5px;
  /* width: auto; 
  /* height: auto; */
}

.user-chat-icon {
  width: 100%;
}
@media (max-width: 800px) {
  .user-image {
    width: 80%;
  }
}
@media (max-width: 768px) {
  .user-chat-icon {
    width: 70%;
  }
}
@media (max-width: 500px) {
  .user-chat-icon {
    width: 50%;
  }
  .user-image {
    width: 50%;
  }
}
</style>
