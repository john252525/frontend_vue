<template>
  <div @click="openMessageContent" class="cont"></div>
  <section class="list-content-section">
    <ul>
      <li @click="openFileExplorer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="svg-icon file"
          viewBox="0 0 1024 1024"
        >
          <path
            d="M480 580H372a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h108v108a8 8 0 0 0 8 8h48a8 8 0 0 0 8-8V644h108a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8H544V472a8 8 0 0 0-8-8h-48a8 8 0 0 0-8 8zm374.6-291.3c6 6 9.4 14.1 9.4 22.6V928c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h424.7c8.5 0 16.7 3.4 22.7 9.4zM790.2 326L602 137.8V326z"
          />
        </svg>
        Документ
      </li>
      <li @click="openFileExplorer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="svg-icon img"
          viewBox="0 0 1024 1024"
        >
          <path
            d="M96 896a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h832a32 32 0 0 1 32 32v704a32 32 0 0 1-32 32zm315.52-228.48l-68.928-68.928a32 32 0 0 0-45.248 0L128 768.064h778.688l-242.112-290.56a32 32 0 0 0-49.216 0L458.752 665.408a32 32 0 0 1-47.232 2.112M256 384a96 96 0 1 0 192.064-.064A96 96 0 0 0 256 384"
          />
        </svg>
        Фото или видео
      </li>
      <li @click="openCameraStation">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="svg-icon camera"
          viewBox="0 0 1024 1024"
        >
          <path
            d="M864 260H728l-32.4-90.8a32.07 32.07 0 0 0-30.2-21.2H358.6c-13.5 0-25.6 8.5-30.1 21.2L296 260H160c-44.2 0-80 35.8-80 80v456c0 44.2 35.8 80 80 80h704c44.2 0 80-35.8 80-80V340c0-44.2-35.8-80-80-80M512 716c-88.4 0-160-71.6-160-160s71.6-160 160-160s160 71.6 160 160s-71.6 160-160 160m-96-160a96 96 0 1 0 192 0a96 96 0 1 0-192 0"
          />
        </svg>
        Камера
      </li>
    </ul>
    <input
      type="file"
      @change="handleFileChange"
      accept="image/*, video/*"
      style="display: none"
      ref="fileInput"
    />
    <input
      type="file"
      style="display: none"
      ref="fileInput"
      @change="handleFileChange"
      accept="*/*"
    />
  </section>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const props = defineProps({
  changeImgUrl: {
    type: Function,
  },
  openMessageContent: {
    type: Function,
  },
  openCameraStation: {
    type: Function,
  },
});

const fileInput = ref(null);
const fileURL = ref(null);
const fileType = ref(null);

const openFileExplorer = () => {
  fileInput.value.click();
};

const handleFileChange = async (event) => {
  console.log("handleFileChange called");

  const file = event.target.files[0];
  console.log("File:", file);

  if (file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://hellychat.apitter.com/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      props.openMessageContent();
      fileURL.value = response.data.fileUrl;

      // Determine if it's a video or an image
      if (file.type.startsWith("video/")) {
        props.changeImgUrl(fileURL.value, "video");
      } else if (file.type.startsWith("image/")) {
        props.changeImgUrl(fileURL.value, "image");
      } else {
        props.changeImgUrl(fileURL.value, "file");
      }

      // Pass fileURL and fileType to the parent
    } catch (error) {
      console.error("Ошибка при загрузке файла:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      alert("Ошибка при загрузке файла.");
    }
  } else {
    fileURL.value = null;
    fileType.value = null;
  }
};
</script>

<style scoped>
.list-content-section {
  border-radius: 5px;
  padding: 15px 17px;
  width: 175px;
  height: 120px;
  box-shadow: 4px 2px 8px 0 rgba(0, 0, 0, 0.06), 0 0 4px 0 rgba(0, 0, 0, 0.04);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;

  position: absolute;
  bottom: 60px;
  left: 20px;
}

li {
  font-size: 16px;
  font-weight: 400;
  display: flex;
  align-items: center;
  padding: 7px 10px;
  cursor: pointer;
  gap: 8px;
  border-radius: 5px;
}

li:hover {
  background-color: #eeeeee;
}

ul {
  display: flex;
  gap: 4px;
  flex-direction: column;
}

.svg-icon {
  width: 26px; /* 24px */
  height: 26px; /* 24px */
  transition: all 75ms; /* Переход для всех свойств за 75 мс */
}

.file {
  fill: #aa75db;
}

.img {
  fill: #4744ff;
}

.camera {
  fill: #f13333;
}

.cont {
  position: fixed;
  z-index: 0;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
}

.list-content-section.fade-enter-active,
.list-content-section.fade-leave-active {
  transition: opacity 0.5s ease;
}
.list-content-section.fade-enter,
.list-content-section.fade-leave-to {
  opacity: 0;
}

.list-content-section {
  animation: fadeIn 0.3s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
  }
}
</style>
