<template>
  <div class="upload-container">
    <input type="file" @change="handleFileChange" accept="image/*, video/*" />
    <div v-if="fileURL">
      <img
        v-if="isVideo === false"
        :src="fileURL"
        alt="Uploaded File"
        class="uploaded-preview"
      />
      <video
        v-if="isVideo === true"
        :src="fileURL"
        controls
        class="uploaded-preview"
      ></video>
      <p>File Source: {{ fileURL }}</p>
    </div>
    <p v-else>No file selected yet.</p>
  </div>
</template>

<script setup>
import { ref } from "vue";

const fileURL = ref(null);
const isVideo = ref(false);

const handleFileChange = (event) => {
  const file = event.target.files[0];

  if (file) {
    fileURL.value = URL.createObjectURL(file);
    isVideo.value = file.type.startsWith("video/");
  } else {
    fileURL.value = null;
    isVideo.value = false;
  }
};
</script>

<style scoped>
.upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
}

input[type="file"] {
  margin-bottom: 10px;
}

.uploaded-preview {
  max-width: 400px;
  max-height: 300px;
  border: 1px solid #ccc;
}
</style>
