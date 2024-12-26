<template>
  <section class="add-mailing-section">
    <h2 class="title">
      <img
        @click="changeAddMailing"
        class="out"
        src="/millingInfo/out.svg"
        alt=""
      />
      Содание рассылки
    </h2>
    <section class="component">
      <File :changeAddMailing="changeAddMailing" />
    </section>
  </section>
</template>

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
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  margin-top: 24px;
  margin-left: 36px;
}

.title {
  font-size: 22px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.out {
  margin-top: 5px;
  transition: all 0.15s;
  cursor: pointer;
}

.out:hover {
  transition: all 0.15s;
  transform: translate(-5px);
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

@media (max-width: 768px) {
  .add-mailing-section {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    margin-top: 24px;
    margin-left: 16px;
  }
}
</style>
