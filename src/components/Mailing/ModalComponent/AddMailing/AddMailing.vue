<template>
  <div @click="changeAddMailing" class="black-fon"></div>
  <section class="add-mailing-section">
    <div class="button-cont">
      <button
        :class="{ active: station.file }"
        @click="remakeStation('file')"
        class="contact-button"
      >
        Файл
      </button>
      <button
        :class="{ active: station.text }"
        @click="remakeStation('text')"
        class="contact-button"
      >
        Текст
      </button>
    </div>
    <section class="component">
      <File :station="station" />
    </section>
  </section>
</template>
station
<script setup>
import File from "./Component/File.vue";
import Text from "./Component/Text.vue";
import { reactive, provide } from "vue";

const props = defineProps({
  changeAddMailing: {
    type: Function,
  },
});

const station = reactive({
  file: true,
  text: false,
});

const remakeStation = (value) => {
  if (value === "file") {
    station.file = true;
    station.text = false;
    console.log(station);
  } else {
    station.file = false;
    station.text = true;
    console.log(station);
  }
};

provide("station", station);
</script>

<style scoped>
.add-mailing-section {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  border-radius: 10px;
  width: 680px;
  height: 740px;
  background: #fff;
  display: flex;
  align-items: center;
  /* justify-content: center; */
  flex-direction: column;
}

.button-cont {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 50px;
  margin-top: 14px;
}

.contact-button {
  width: 270px;
  height: 31px;
  font-weight: 500;
  font-size: 16px;
  color: #000;
  border-bottom: 3px solid #e7e7e7;
  border-radius: 2px;
  background-color: transparent;
}

.contact-button.active {
  border-bottom: 3px solid #4950ca;
}

.component {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
