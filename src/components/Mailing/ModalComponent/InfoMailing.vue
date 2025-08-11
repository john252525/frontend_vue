<template>
  <div @click="changeInfoMailing" class="black-fon"></div>
  <section class="info-mailing-section">
    <div v-if="!station.message">
      <h2 class="title">
        {{ t("information.title") }}

        <svg
          class="close"
          @click="changeInfoMailing"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 32 32"
        >
          <path
            fill="currentColor"
            d="M17.414 16L24 9.414L22.586 8L16 14.586L9.414 8L8 9.414L14.586 16L8 22.586L9.414 24L16 17.414L22.586 24L24 22.586z"
          />
        </svg>
      </h2>
      <section>
        <h3>
          {{ t("information.status.title") }}
          <span class="active" v-if="selectedItem.state === 1">
            {{ t("information.status.active") }}</span
          >
          <span class="active" v-if="selectedItem.state === 2">
            {{ t("mailingList.status.completed") }}</span
          >
          <span class="no-active" v-if="selectedItem.state === 0">{{
            t("information.status.noActive")
          }}</span>
        </h3>
        <h3>
          {{ t("information.name") }} <span>{{ selectedItem.name }}</span>
        </h3>
        <h3>
          {{ t("information.weekDay") }}
          <span> {{ formattedWeekDays }}</span>
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
          <span> {{ min }} - {{ max }} {{ t("information.timeout.min") }}</span>
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
import { inject, reactive, ref, toRefs, watch, computed } from "vue";
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

const { min, max } = selectedItem.value.options.delay;

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

const weekDaysMap = {
  1: "пн",
  2: "вт",
  3: "ср",
  4: "чт",
  5: "пт",
  6: "сб",
  7: "вс",
};

// Форматированные дни недели в правильном порядке
const formattedWeekDays = computed(() => {
  if (!selectedItem.value?.options?.days) return "";

  const daysObj = selectedItem.value.options.days;
  // Получаем и сортируем дни по их номеру
  const sortedDays = Object.keys(daysObj)
    .map(Number)
    .sort((a, b) => a - b)
    .map((day) => weekDaysMap[day]);

  return sortedDays.join(", ");
});

const formattedDelayInterval = computed(() => {
  if (!selectedItem.value?.options?.delay) return "";

  const { min, max } = selectedItem.value.options.delay;
  // Преобразуем секунды в минуты
  const minMinutes = Math.round(min / 60);
  const maxMinutes = Math.round(max / 60);

  return `${minMinutes} - ${maxMinutes}`;
});

watch(
  selectedItem,
  (newValue) => {
    if (newValue && newValue.options && newValue.options.delay) {
      const { min, max } = newValue.options.delay;
      delayInMinutes.value.min = (min / 60).toFixed(0);
      delayInMinutes.value.max = (max / 60).toFixed(0);
    } else {
      console.error("error");
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

.close {
  position: absolute;
  right: 44px;
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
