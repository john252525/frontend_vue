<template>
  <section class="add-mailing-section">
    <h2 class="title">
      <svg
        @click="changeAddMailing"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 1024 1024"
        class="out"
      >
        <path
          fill="gray"
          d="M872 474H286.9l350.2-304c5.6-4.9 2.2-14-5.2-14h-88.5c-3.9 0-7.6 1.4-10.5 3.9L155 487.8a31.96 31.96 0 0 0 0 48.3L535.1 866c1.5 1.3 3.3 2 5.2 2h91.5c7.4 0 10.8-9.2 5.2-14L286.9 550H872c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8"
        />
      </svg>
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
  } else {
    station.file = false;
    station.text = true;
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
