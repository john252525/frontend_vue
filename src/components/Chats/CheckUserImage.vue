<template>
  <div @click="changeImageStation" class="black-fon"></div>
  <div class="cont">
    <img
      v-if="userImageUrl"
      class="user-image"
      :src="userImageUrl"
      alt="user-image"
    />
    <!-- icon666.com - MILLIONS OF FREE VECTOR ICONS --><svg
      viewBox="0 0 152 152"
      xmlns="http://www.w3.org/2000/svg"
      width="190"
      height="190"
      class="user-chat-icon-svg"
      v-else
    >
      <g id="Layer_2" data-name="Layer 2">
        <g id="_18.Avatar" data-name="18.Avatar">
          <path
            id="icon"
            d="m76 0a76 76 0 0 0 0 152h2a76 76 0 0 0 -2-152zm-15.89 37.35a20.94 20.94 0 0 1 15.32-6.35 5.43 5.43 0 0 1 .57 0 20.76 20.76 0 0 1 14.76 6.33 21 21 0 0 1 6.35 15.32 20.91 20.91 0 0 1 -6.35 15.35 20.76 20.76 0 0 1 -14.76 6.33 5.43 5.43 0 0 1 -.57 0 21.68 21.68 0 0 1 -21.67-21.66 21 21 0 0 1 6.35-15.32zm49 79.48c-2.92 2.78-6.76 4.17-11.44 4.17h-43.34c-4.68 0-8.52-1.39-11.44-4.17s-4.44-6.6-4.44-11.3c0-1.82.06-3.6.18-5.32a53.31 53.31 0 0 1 .74-5.69 43.4 43.4 0 0 1 1.39-5.71 28.71 28.71 0 0 1 2.35-5.34 20.32 20.32 0 0 1 3.54-4.63 15.66 15.66 0 0 1 5.11-3.19 17.27 17.27 0 0 1 6.49-1.17c.92 0 1.8.36 3.53 1.48 1.06.7 2.29 1.51 3.67 2.37a20.23 20.23 0 0 0 4.73 2.09 18.43 18.43 0 0 0 11.62 0 20.9 20.9 0 0 0 4.75-2.09c1.38-.88 2.63-1.67 3.67-2.37 1.73-1.12 2.61-1.48 3.53-1.48a17.27 17.27 0 0 1 6.49 1.17 15.66 15.66 0 0 1 5.11 3.19 20.32 20.32 0 0 1 3.54 4.63 28.71 28.71 0 0 1 2.35 5.34 43.4 43.4 0 0 1 1.39 5.71 53.31 53.31 0 0 1 .74 5.69c.11 1.7.18 3.5.18 5.32 0 4.7-1.55 8.47-4.44 11.3z"
          />
        </g>
      </g>
    </svg>
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

.user-chat-icon-svg path#icon {
  fill: #808080; /* Серый цвет для всей иконки */
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
