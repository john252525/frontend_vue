<template>
  <div @click="changeMenuPhotoStation" class="black"></div>
  <div class="image-viewer">
    <div class="close-cont">
      <img
        @click="changeMenuPhotoStation"
        class="close-img"
        src="/photo/close.svg"
        alt=""
      />
    </div>
    <img :src="img" alt="Image" class="image" />
    <div class="buttons">
      <div class="copy-cont">
        <img
          @click="copyImageUrl"
          class="copy-img"
          src="/photo/copy.svg"
          alt=""
        />
      </div>
      <div class="download-cont">
        <img
          @click="downloadImage"
          class="download-img"
          src="/photo/download.svg"
          alt=""
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs } from "vue";

const props = defineProps({
  img: {
    type: Object,
  },
  changeMenuPhotoStation: {
    type: Function,
  },
});

const { img } = toRefs(props);

const imageUrl = ref(
  "https://touchapi-whats.s3.amazonaws.com/79228556998-22794591901-3AFC80188777E69823D4.jpeg"
);

const downloadImage = () => {
  const link = document.createElement("a");
  link.href = img.value;
  link.download = "image.jpg"; // Имя файла для скачивания
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const copyImageUrl = () => {
  navigator.clipboard
    .writeText(img.value)
    .then(() => {
      alert("Ссылка скопирована в буфер обмена!");
    })
    .catch((err) => {
      console.error("Ошибка при копировании ссылки: ", err);
    });
};
</script>

<style scoped>
.black {
  position: fixed;
  z-index: 5;
  width: 100%;
  height: 100vh;
  background: black;
  opacity: 10%;
  top: 0;
  left: 0;
}

.image {
  max-width: 80%;
  max-height: 100%;
  position: fixed;
  z-index: 10;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.buttons {
  position: fixed;
  z-index: 10;
  right: 20px;
  bottom: 10px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.close-img {
  position: fixed;
  right: 20px;
  top: 20px;
  z-index: 10;
  cursor: pointer;
}

.download-img,
.close-img,
.copy-img {
  cursor: pointer;
}

@media (max-width: 700px) {
  .image {
    max-height: 90%;
  }

  .buttons {
    flex-direction: column;
  }
}
</style>
