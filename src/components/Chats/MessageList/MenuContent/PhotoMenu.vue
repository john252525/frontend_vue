<template>
  <div @click="changeMenuPhotoStation" class="black"></div>
  <div class="image-viewer">
    <div class="close-cont">
      <svg
        @click="changeMenuPhotoStation"
        class="close-img"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 1024 1024"
      >
        <path
          fill="#d5d2d2"
          fill-rule="evenodd"
          d="M799.855 166.312c.023.007.043.018.084.059l57.69 57.69c.041.041.052.06.059.084a.118.118 0 0 1 0 .069c-.007.023-.018.042-.059.083L569.926 512l287.703 287.703c.041.04.052.06.059.083a.118.118 0 0 1 0 .07c-.007.022-.018.042-.059.083l-57.69 57.69c-.041.041-.06.052-.084.059a.118.118 0 0 1-.069 0c-.023-.007-.042-.018-.083-.059L512 569.926L224.297 857.629c-.04.041-.06.052-.083.059a.118.118 0 0 1-.07 0c-.022-.007-.042-.018-.083-.059l-57.69-57.69c-.041-.041-.052-.06-.059-.084a.118.118 0 0 1 0-.069c.007-.023.018-.042.059-.083L454.073 512L166.371 224.297c-.041-.04-.052-.06-.059-.083a.118.118 0 0 1 0-.07c.007-.022.018-.042.059-.083l57.69-57.69c.041-.041.06-.052.084-.059a.118.118 0 0 1 .069 0c.023.007.042.018.083.059L512 454.073l287.703-287.702c.04-.041.06-.052.083-.059a.118.118 0 0 1 .07 0Z"
        />
      </svg>
    </div>
    <img :src="img" alt="Image" class="image" />
    <div class="buttons">
      <div class="copy-cont">
        <svg
          @click="copyImageUrl"
          class="copy-img"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="#d5d2d2"
            d="M14 8H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2V10c0-1.103-.897-2-2-2"
          />
          <path
            fill="#d5d2d2"
            d="M20 2H10a2 2 0 0 0-2 2v2h8a2 2 0 0 1 2 2v8h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2"
          />
        </svg>
      </div>
      <div class="download-cont">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="download-img"
          @click="downloadImage"
        >
          <path
            fill="none"
            stroke="#d5d2d2"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"
          />
        </svg>
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
