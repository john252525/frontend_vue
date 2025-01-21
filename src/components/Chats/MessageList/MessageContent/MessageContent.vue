<template>
  <div
    v-for="message in messages"
    :key="message.item"
    :class="['message', message.outgoing ? 'outgoing' : 'incoming']"
  >
    <img
      v-if="
        message.content &&
        message.content.length > 0 &&
        message.content[0].src &&
        message.content[0].type === 'sticker'
      "
      :src="message.content[0].src"
      alt="Sticker"
      class="sticker"
    />
    <img
      v-if="
        message.content &&
        message.content.length > 0 &&
        message.content[0].src &&
        message.content[0].type === 'image'
      "
      :src="message.content[0].src"
      alt="Image"
      class="img-message"
      @click="openPhotoMenu(message.content[0].src)"
    />
    <PhotoMenu
      :img="selectedImage"
      :changeMenuPhotoStation="changeMenuPhotoStation"
      v-if="station.photoMenu"
    />
    <video
      v-if="
        message.content &&
        message.content.length > 0 &&
        message.content[0].src &&
        message.content[0].type === 'video'
      "
      controls
      :src="message.content[0].src"
      class="video-message"
      @click="openVideoMenu(message.content[0].src)"
    >
      Ваш браузер не поддерживает видео.
    </video>
    <audio
      v-if="
        message.content &&
        message.content.length > 0 &&
        message.content[0].src &&
        message.content[0].type === 'audio'
      "
      controls
      :src="message.content[0].src"
      class="audio-message"
    >
      Ваш браузер не поддерживает аудио.
    </audio>
    <h2
      v-if="
        message.content &&
        message.content.length > 0 &&
        message.content[0].type === 'geo'
      "
    >
      error
    </h2>
  </div>
</template>

<script setup>
import PhotoMenu from "../MenuContent/PhotoMenu.vue";
import { toRefs, ref, reactive } from "vue";
const props = defineProps({
  messages: {
    type: Object,
  },
  changeMessageListStation: {
    type: Function,
  },
});

const station = reactive({
  photoMenu: false,
  videoMenu: false,
});

const { messages } = toRefs(props);
const selectedImage = ref(null);

const openPhotoMenu = (src) => {
  selectedImage.value = src;
  station.photoMenu = true;
};
</script>

<style scoped></style>
