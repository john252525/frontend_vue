<template>
  <div @click="changeInfoMailing" class="black-fon"></div>
  <section class="info-mailing-section">
    <h2 class="title">
      Информация
      <img @click="changeInfoMailing" src="/millingInfo/close.svg" alt="" />
    </h2>
    <section>
      <h3>
        Название: <span>{{ selectedItem.name }}</span>
      </h3>
      <h3>
        Дни недели: <span> {{ weekDaysList.join(", ") }}</span>
      </h3>
      <h3>
        Время:
        <span
          >{{ selectedItem.options.hours.min }}-{{
            selectedItem.options.hours.max
          }}</span
        >
      </h3>

      <h3>
        Задержка:
        <span>{{ delayInMinutes.min }} - {{ delayInMinutes.max }} мин</span>
      </h3>
      <h3>
        Сообщения: <span> {{ selectedItem.recipients }}</span>
      </h3>
    </section>
    <button class="edit-maling">Редактировать</button>
  </section>
</template>

<script setup>
import { inject, reactive, ref, toRefs, watch } from "vue";
const props = defineProps({
  selectedItem: {
    type: Object,
  },
  changeInfoMailing: {
    type: Function,
  },
});
const { selectedItem } = toRefs(props);

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
  background: #ffffff;
  z-index: 10;
}

.title {
  font-weight: 600;
  font-size: 24px;
  color: #000;
  margin-bottom: 34px;
  display: flex;
  align-items: center;
}

h3 {
  font-weight: 500;
  font-size: 20px;
  color: #000;
  margin-right: 8px;
  margin-top: 16px;
}

span {
  font-weight: 600;
  font-size: 20px;
  color: #626262;
}

.edit-maling {
  border-radius: 5px;
  width: 430px;
  height: 33px;
  background: #4950ca;
  font-weight: 600;
  font-size: 18px;
  color: #fff;
  margin-top: 34px;
}

img {
  position: absolute;
  right: 45px;
}
</style>
