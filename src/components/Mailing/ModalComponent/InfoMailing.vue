<template>
  <div @click="changeInfoMailing" class="black-fon"></div>
  <section class="info-mailing-section">
    <div v-if="!station.message">
      <h2 class="title">
        {{ t("information.title") }}
        <img @click="changeInfoMailing" src="/millingInfo/close.svg" alt="" />
      </h2>
      <section>
        <h3>
          {{ t("information.status.title") }}
          <span class="active" v-if="selectedItem.state === 1">
            {{ t("information.status.active") }}</span
          >
          <span class="no-active" v-else>{{
            t("information.status.noActive")
          }}</span>
        </h3>
        <h3>
          {{ t("information.name") }} <span>{{ selectedItem.name }}</span>
        </h3>
        <h3>
          {{ t("information.weekDay") }}
          <span> {{ weekDaysList.join(", ") }}</span>
        </h3>
        <h3>
          {{ t("information.time") }}
          <span
            >{{ selectedItem.options.hours.min }}-{{
              selectedItem.options.hours.max
            }}</span
          >
        </h3>

        <h3>
          {{ t("information.timeout.title") }}
          <span
            >{{ delayInMinutes.min }} - {{ delayInMinutes.max }}
            {{ t("information.timeout.min") }}</span
          >
        </h3>
        <h3>
          {{ t("information.message") }}
          <span class="message-text" @click="changeStationMessage">
            {{ selectedItem.recipients }}</span
          >
        </h3>
      </section>
      <button class="edit-maling" @click="changeisEditMailing">
        {{ t("information.button") }}
      </button>
    </div>
    <MessageLise
      :changeStationMessage="changeStationMessage"
      :selectedItem="selectedItem"
      v-if="station.message"
    />
  </section>
</template>

<script setup>
import { inject, reactive, ref, toRefs, watch } from "vue";
import MessageLise from "./MessageLise.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const props = defineProps({
  selectedItem: {
    type: Object,
  },
  changeInfoMailing: {
    type: Function,
  },
  changeisEditMailing: {
    type: Function,
  },
});
const { selectedItem } = toRefs(props);

const station = reactive({
  message: false,
});

const changeStationMessage = () => {
  station.message = !station.message;
};

const delayInMinutes = ref({
  min: null,
  max: null,
});

const weekDays = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

const weekDaysList = ref([]);

watch(
  selectedItem,
  (newValue) => {
    if (newValue && newValue.options && newValue.options.days) {
      // Получаем дни недели, соответствующие числам
      weekDaysList.value = newValue.options.days
        .map((day) => weekDays[day - 1])
        .filter(Boolean);
    } else {
      console.error("selectedItem или его свойства не определены");
      weekDaysList.value = []; // Сбросить, если данные недоступны
    }
  },
  { immediate: true }
);

watch(
  selectedItem,
  (newValue) => {
    if (newValue && newValue.options && newValue.options.delay) {
      const { min, max } = newValue.options.delay;
      delayInMinutes.value.min = (min / 60).toFixed(0);
      delayInMinutes.value.max = (max / 60).toFixed(0);
    } else {
      console.error("selectedItem или его свойства не определены");
      delayInMinutes.value.min = null;
      delayInMinutes.value.max = null;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.info-mailing-section {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 10px;
  padding: 25px 40px;
  background: var(--modalBg);
  border: 0.5px solid rgb(144, 144, 144);
  z-index: 10;
}

.title {
  font-weight: 500;
  font-size: 24px;
  color: var(--modalColor);
  margin-bottom: 34px;
  display: flex;
  align-items: center;
}

.message-text {
  text-decoration: underline;
  cursor: pointer;
}

.no-active {
  color: red;
}

.active {
  color: green;
}

h3 {
  font-weight: 500;
  font-size: 20px;
  color: var(--modalColor);
  margin-right: 8px;
  margin-top: 16px;
}

span {
  font-weight: 400;
  font-size: 20px;
  color: #626262;
}

.edit-maling {
  border-radius: 5px;
  width: 430px;
  height: 33px;
  background: oklch(0.541 0.198 267);
  font-weight: 600;
  font-size: 18px;
  color: #fff;
  margin-top: 34px;
}

img {
  position: absolute;
  right: 45px;
}

@media (max-width: 600px) {
  .info-mailing-section {
    padding: 25px 40px;
    background: #ffffff;
    z-index: 10;
  }

  .edit-maling {
    width: 300px;
    height: 33px;
    font-size: 16px;
    margin-top: 34px;
  }
}

@media (max-width: 400px) {
  .info-mailing-section {
    padding: 25px 20px;
    background: #ffffff;
    z-index: 10;
  }

  .edit-maling {
    width: 300px;
    height: 33px;
    font-size: 16px;
    margin-top: 34px;
  }
}
</style>
