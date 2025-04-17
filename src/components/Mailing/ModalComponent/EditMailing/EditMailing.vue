<template>
  <div @click="changeisEditMailing" class="black-fon"></div>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <section class="file-section">
    <div class="cont" v-if="!load">
      <h2 class="main-title">{{ t("editMailing.title") }}</h2>
      <img
        @click="changeisEditMailing"
        class="close"
        src="/millingInfo/close.svg"
        alt=""
      />
      <section class="info-section">
        <article class="days-comp">
          <h2 class="title">{{ t("editMailing.weekDay") }}:</h2>
          <div class="checkbox-group">
            <div
              v-for="(day, index) in days"
              :key="index"
              class="checkbox-container"
            >
              <input
                type="checkbox"
                :id="'day-' + (index + 1)"
                :value="index + 1"
                v-model="items.options.days"
              />
              <label class="day-text" :for="'day-' + (index + 1)">
                <span class="custom-checkbox"></span>
                {{ day }}
              </label>
            </div>
          </div>
        </article>

        <article class="title-comp">
          <h2 class="title">{{ t("editMailing.time.title") }}:</h2>
          <div class="time-cont">
            <div class="time-selection">
              <label class="label-time" for="start-time">{{
                t("editMailing.time.c")
              }}</label>
              <input
                type="time"
                id="start-time"
                v-model="items.options.hours.max"
                @change="updateTimes"
              />
            </div>
            <div class="time-selection">
              <label class="label-time" for="end-time">{{
                t("editMailing.time.po")
              }}</label>
              <input
                type="time"
                id="end-time"
                v-model="items.options.hours.min"
                @change="updateTimes"
              />
            </div>
          </div>
        </article>
        <article class="title-comp">
          <h2 class="title-mess">{{ t("editMailing.timeout.title") }}:</h2>
          <div class="time-cont">
            <div class="time-selection">
              <label class="label-time" for="start-num">{{
                t("editMailing.timeout.ot")
              }}</label>
              <select
                class="time-select"
                id="start-num"
                v-model="items.options.delay.min"
              >
                <option v-for="minute in minutes" :key="minute" :value="minute">
                  {{ minute }}
                </option>
              </select>
            </div>
            <div class="time-selection">
              <label class="label-time" for="end-num">{{
                t("editMailing.timeout.do")
              }}</label>
              <select
                class="time-select"
                id="end-num"
                v-model="items.options.delay.max"
              >
                <option v-for="minute in minutes" :key="minute" :value="minute">
                  {{ minute }}
                </option>
              </select>
              <p class="min">{{ t("editMailing.timeout.min") }}.</p>
            </div>
          </div>
        </article>
      </section>
      <section class="settings-section">
        <article class="remove-duplicates-comp">
          <div class="checkbox-container">
            <input
              type="checkbox"
              id="remove-duplicates"
              v-model="items.options.exist"
            />
            <label class="settings-text" for="remove-duplicates">
              <span class="custom-checkbox"></span>
              {{ t("editMailing.checbox.one") }}
            </label>
          </div>

          <div class="checkbox-container">
            <input
              type="checkbox"
              id="existing-dialogs"
              v-model="items.options.uniq"
            />
            <label class="settings-text" for="existing-dialogs">
              <span class="custom-checkbox"></span>
              {{ t("editMailing.checbox.two") }}
            </label>
          </div>

          <div class="checkbox-container">
            <input
              type="checkbox"
              id="random-order"
              v-model="items.options.random"
            />
            <label class="settings-text" for="random-order">
              <span class="custom-checkbox"></span>
              {{ t("editMailing.checbox.three") }}
            </label>
          </div>
        </article>
      </section>
      <button @click="editWhatsAppBroadcast" class="create">
        {{ t("editMailing.button") }}
      </button>
    </div>
    <LoadModal :text="'Сохраняем данные'" v-else />
  </section>
</template>

<script setup>
import { ref, toRefs, watch, computed, inject } from "vue";
import axios from "axios";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import LoadModal from "../LoadModal/LoadModal.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const props = defineProps({
  selectedItem: {
    type: Object,
    required: true,
  },
  changeisEditMailing: {
    type: Function,
  },
});

const load = ref(false);

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const { selectedItem } = toRefs(props);

const days = ref(["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]);

const items = ref("");

const minutes = Array.from({ length: 1440 }, (_, index) => index + 1);
const apiUrl = import.meta.env.VITE_WHATSAPI_URL;

async function editWhatsAppBroadcast() {
  const url = `${apiUrl}/edit/${items.value.id}/`;

  const params = {
    token: "d7039fe337873da68d28945cd6e5c61d",
    days: items.value.options.days,
    time_from: items.value.options.hours.min,
    time_to: items.value.options.hours.max,
    delay_from: items.value.options.delay.min,
    delay_to: items.value.options.delay.max,
    uniq: items.value.options.uniq,
    exist: items.value.options.exist,
    random: items.value.options.random,
    cascade: "whatsapp",
  };
  load.value = true;
  try {
    const response = await axios.post(url, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (response.data.ok === true) {
      location.reload();
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      console.log("Ошибка:", response.data);
    }
  } catch (error) {
    console.error(
      "Ошибка при отправке запроса:",
      error.response ? error.response.data : error.message
    );
  }
}

if (selectedItem.value) {
  items.value = selectedItem.value;
  console.log(items.value);
  if (items.value.options.hours) {
    console.log(items.value.options.hours.min);
  }
}
</script>

<style scoped>
.file-section {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  gap: 30px;
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

.cont {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  gap: 30px;
}

.close {
  position: absolute;
  right: 42px;
  top: 32px;
  cursor: pointer;
}

.remove-duplicates-comp {
  display: flex;
  flex-direction: column;
}

.main-title {
  font-size: 22px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.name-mailing {
  font-size: 14px;
  font-weight: 500;
  color: #c0c0c0;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.days-comp {
  display: flex;
  align-items: center;
  gap: 14px;
}

.title {
  font-weight: 500;
  font-size: 16px;
  color: var(--modalColor);
}

.title-mess {
  font-weight: 500;
  font-size: 16px;
  color: var(--modalColor);
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox-container {
  display: flex;
  position: relative;
  margin: 10px 0;
}

input[type="checkbox"] {
  display: none; /* Скрываем стандартный чекбокс */
}

label {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding-left: 20px;
  position: relative;
}

.settings-text {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding-left: 20px;
  position: relative;
}

.label-time {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding-left: 20px;
  position: relative;
}

.custom-checkbox {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  border-radius: 4px; /* Скругление углов */
  background-color: #d9d9d9; /* Цвет фона */
  transition: background-color 0.2s, border-color 0.2s;
}

input[type="checkbox"]:checked + label .custom-checkbox {
  background: oklch(0.541 0.198 267);
}

input[type="checkbox"]:checked + label .custom-checkbox::after {
  content: "";
  position: absolute;
  left: 6px;
  top: 2.5px;
  width: 3px;
  height: 7px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.time-selection {
  display: flex;
  align-items: center;
}

.title-comp {
  display: flex;
  align-items: center;
}

.time-cont {
  display: flex;
  align-items: center;
}

input[type="time"] {
  padding: 4px;
  border: 1px solid #000;
  border-radius: 5px;
  outline: none;
  font-size: 12px;
  transition: border-color 0.3s;
  margin-left: 6px;
}

input[type="time"]:focus {
  border-color: #0056b3;
}

.time-select {
  padding: 4px;
  font-size: 14px;
  border: 1px solid #000;
  border-radius: 3px;
  outline: none;
  transition: border-color 0.3s;
  margin-left: 6px;
}

.min {
  margin-left: 6px;
}

.upload-file-comp {
  display: flex;
  align-items: center;
}

.image-preview {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
  margin-right: 10px;
}

.create {
  border-radius: 5px;
  width: 100%;
  height: 34px;
  background: oklch(0.541 0.198 267);
  font-weight: 600;
  font-size: 12px;
  color: #fff;
  transition: all 0.25s;
}

@media (max-width: 500px) {
  .title {
    font-size: 16px;
  }

  .title-mess {
    font-size: 16px;
  }

  .main-title {
    font-size: 18px;
  }

  .close {
    right: 40px;
  }

  input[type="time"] {
    font-size: 12px;
  }

  input[type="checkbox"]:checked + label .custom-checkbox::after {
    left: 5px;
    top: 2.5px;
    width: 3px;
    height: 6px;
  }

  .label-time {
    padding-left: 0px;
  }

  .title-comp {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .time-cont {
    align-items: flex-start;
    gap: 10px;
  }

  .days-comp {
    align-items: flex-start;
    flex-direction: column;
    gap: 2px;
  }

  .checkbox-group {
    width: 300px;
    overflow-x: auto;
  }
}

@media (max-width: 390px) {
  .title {
    font-size: 16px;
  }

  .title-mess {
    font-size: 16px;
  }

  .main-title {
    font-size: 18px;
  }

  .close {
    right: 40px;
  }

  input[type="time"] {
    font-size: 12px;
  }

  input[type="checkbox"]:checked + label .custom-checkbox::after {
    left: 5px;
    top: 2.5px;
    width: 3px;
    height: 6px;
  }

  .label-time {
    padding-left: 0px;
  }

  .title-comp {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .time-cont {
    align-items: flex-start;
    gap: 10px;
  }

  .days-comp {
    align-items: flex-start;
    flex-direction: column;
    gap: 2px;
  }

  .checkbox-group {
    width: 250px;
    overflow-x: auto;
  }
}
</style>
