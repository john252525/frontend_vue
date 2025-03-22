<template>
  <!-- <div @click="openCameraStation" class="black-fon"></div> -->

  <section :style="cameraContainerStyle" class="camera-container">
    <section @click="openCameraStation" class="navigate">
      <h2 class="navigate-title">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m18 18l-6-6m0 0L6 6m6 6l6-6m-6 6l-6 6"
          />
        </svg>
        Сделать снимок
      </h2>
    </section>
    <video
      ref="videoElement"
      autoplay
      playsinline
      class="camera-preview"
    ></video>

    <div
      class="create-photo"
      @click="takePhoto"
      :disabled="!hasCameraPermission"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="svg-icon camera"
        viewBox="0 0 1024 1024"
      >
        <path
          d="M864 260H728l-32.4-90.8a32.07 32.07 0 0 0-30.2-21.2H358.6c-13.5 0-25.6 8.5-30.1 21.2L296 260H160c-44.2 0-80 35.8-80 80v456c0 44.2 35.8 80 80 80h704c44.2 0 80-35.8 80-80V340c0-44.2-35.8-80-80-80M512 716c-88.4 0-160-71.6-160-160s71.6-160 160-160s160 71.6 160 160s-71.6 160-160 160m-96-160a96 96 0 1 0 192 0a96 96 0 1 0-192 0"
        />
      </svg>
    </div>
  </section>
</template>

<script setup>
import { ref, inject, onMounted } from "vue";
import axios from "axios";

const props = defineProps({
  openCameraStation: {
    type: Function,
  },
  changeImgUrl: {
    type: Function,
  },
});
const cameraContainerStyle = inject("cameraContainerStyle");
const apiUrl = import.meta.env.VITE_API_URL;

const videoElement = ref(null);
const photoURL = ref(null);
const errorMessage = ref(null);
const hasCameraPermission = ref(false);

onMounted(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.value.srcObject = stream;
    hasCameraPermission.value = true;
  } catch (error) {
    console.error("Ошибка доступа к камере:", error);
    errorMessage.value = "Не удалось получить доступ к камере.";
    hasCameraPermission.value = false;
  }
});

const takePhoto = async () => {
  if (!hasCameraPermission.value) {
    errorMessage.value = "Нет доступа к камере.";
    return;
  }

  const video = videoElement.value;
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const photoDataURL = canvas.toDataURL("image/png");

  try {
    const formData = new FormData();
    formData.append("file", dataURLtoFile(photoDataURL, "photo.png"));

    const response = await axios.post(
      `https://hellychat.apitter.com/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    photoURL.value = response.data.fileUrl;
    props.changeImgUrl(photoURL, "image");
    props.openCameraStation();
    console.log("Фото успешно загружено:", photoURL.value);
  } catch (error) {
    console.error("Ошибка при загрузке фото:", error);
    errorMessage.value = "Ошибка при загрузке фото.";
  }
};

// Helper function to convert dataURL to File object
function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
</script>

<style scoped>
.camera-container {
  position: fixed; /* Важно */
  z-index: 10;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
  /* position: fixed больше не определяет положение, используем JS */
  top: 0; /* Избыточно */
  left: 0; /* Избыточно */
  right: 0; /* Избыточно */
  bottom: 0; /* Избыточно */
}

.camera-container .fade-enter-active,
.camera-container .fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.camera-container .fade-enter,
.camera-container .fade-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.camera-container {
  animation: fadeIn 0.5s forwards;
  transform-origin: bottom;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.navigate {
  width: 100%;
  height: 50px;
  position: fixed;
  top: 0;
  background-color: #4950ca;
  display: flex;
  align-items: center;
}

.navigate-title {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  color: white;
  cursor: pointer;
  gap: 4px;
  border-radius: 5px;
  margin-left: 20px;
}

.camera-preview {
  height: 340px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}

.photo-preview {
  max-width: 320px;
  max-height: 240px;
  margin-top: 10px;
}

.create-photo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 500px;
  background: oklch(0.541 0.198 267);
  margin-top: 26px;
  cursor: pointer;
}

.svg-icon {
  width: 40px; /* 24px */
  height: 40px; /* 24px */
  transition: all 75ms; /* Переход для всех свойств за 75 мс */
  fill: white;
}

@media (max-width: 650px) {
  .camera-preview {
    height: 240px;
  }
}

@media (max-width: 450px) {
  .camera-preview {
    height: 200px;
  }
}
</style>
