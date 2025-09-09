<template>
  <div class="modal-overlay" @click="changeisEditMailing"></div>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  
  <section class="info-modal">
    <div v-if="!load" class="modal-content">
      <!-- Заголовок с кнопкой закрытия -->
      <div class="modal-header">
        <h2 class="modal-title">
          {{ t("editMailing.title") }}
        </h2>
        <button class="close-btn" @click="changeisEditMailing" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Дни недели -->
      <div class="edit-section">
        <h3 class="edit-label">{{ t("editMailing.weekDay") }}:</h3>
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
              v-model="selectedDays"
            />
            <label class="day-text" :for="'day-' + (index + 1)">
              <span class="custom-checkbox"></span>
              {{ day }}
            </label>
          </div>
        </div>
      </div>

      <!-- Время рассылки -->
      <div class="edit-section">
        <h3 class="edit-label">{{ t("editMailing.time.title") }}:</h3>
        <div class="time-grid">
          <div class="time-input-group">
            <label for="end-time">{{ t("editMailing.time.c") }}</label>
            <input
              type="time"
              id="end-time"
              v-model="items.options.hours.min"
              @change="updateTimes"
            />
          </div>
          <div class="time-input-group">
            <label for="start-time">{{ t("editMailing.time.po") }}</label>
            <input
              type="time"
              id="start-time"
              v-model="items.options.hours.max"
              @change="updateTimes"
            />
          </div>
        </div>
      </div>

      <!-- Таймаут -->
      <div class="edit-section">
        <h3 class="edit-label">{{ t("editMailing.timeout.title") }}:</h3>
        <div class="timeout-grid">
          <div class="timeout-input-group">
            <label for="start-num">{{ t("editMailing.timeout.ot") }}</label>
            <select
              id="start-num"
              v-model="items.options.delay.min"
            >
              <option v-for="minute in minutes" :key="minute" :value="minute">
                {{ minute }}
              </option>
            </select>
          </div>
          <div class="timeout-input-group">
            <label for="end-num">{{ t("editMailing.timeout.do") }}</label>
            <select
              id="end-num"
              v-model="items.options.delay.max"
            >
              <option v-for="minute in minutes" :key="minute" :value="minute">
                {{ minute }}
              </option>
            </select>
            <span class="min-text">{{ t("editMailing.timeout.min") }}.</span>
          </div>
        </div>
      </div>

      <!-- Настройки -->
      <div class="edit-section">
        <h3 class="edit-label">Дополнительные Настройки</h3>
        <div class="settings-grid">
          <div class="checkbox-container setting-item">
            <input
              type="checkbox"
              id="remove-duplicates"
              v-model="items.options.exist"
            />
            <label for="remove-duplicates">
              <span class="custom-checkbox"></span>
              {{ t("editMailing.checbox.one") }}
            </label>
          </div>

          <div class="checkbox-container setting-item">
            <input
              type="checkbox"
              id="existing-dialogs"
              v-model="items.options.uniq"
            />
            <label for="existing-dialogs">
              <span class="custom-checkbox"></span>
              {{ t("editMailing.checbox.two") }}
            </label>
          </div>

          <div class="checkbox-container setting-item">
            <input
              type="checkbox"
              id="random-order"
              v-model="items.options.random"
            />
            <label for="random-order">
              <span class="custom-checkbox"></span>
              {{ t("editMailing.checbox.three") }}
            </label>
          </div>
        </div>
      </div>

      <!-- Кнопка сохранения -->
      <button @click="editWhatsAppBroadcast" class="edit-btn">
        {{ t("editMailing.button") }}
      </button>
    </div>
    
    <LoadModal v-else :text="'Сохраняем данные'" />
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
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const router = useRouter();
const props = defineProps({
  selectedItem: {
    type: Object,
    required: true,
  },
  changeisEditMailing: {
    type: Function,
  },
  changeResultModal: {
    type: Function,
  },
});

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
  }
};

const load = ref(false);

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const { selectedItem } = toRefs(props);

const days = ref(["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]);
const selectedDays = ref([]);

const items = ref("");

const minutes = Array.from({ length: 1440 }, (_, index) => index + 1);
const apiUrl = import.meta.env.VITE_WHATSAPI_URL;

async function editWhatsAppBroadcast() {
  const url = `${apiUrl}/edit/${items.value.id}/`;
  const daysObject = {};
  selectedDays.value.forEach((day, index) => {
    daysObject[day] = day;
  });
  const params = {
    days: daysObject,
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
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      await handleSendLog(
        "mailing",
        "edit",
        params,
        response.data.ok,
        response.data
      );
    }

    if (response.data.ok === true) {
      setLoadingStatus(true, "success");
      props.changeisEditMailing();
      load.value = false;
      setTimeout(() => {
        location.reload();
      }, 2000);
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      load.value = false;
      setLoadingStatus(true, "error");
    }
  } catch (error) {
    console.error(
      "error",
      error.response ? error.response.data : error.message
    );
  }
}

if (selectedItem.value) {
  items.value = selectedItem.value;
}

watch(
  selectedItem,
  (newVal) => {
    if (newVal && newVal.options && newVal.options.days) {
      if (
        typeof newVal.options.days === "object" &&
        !Array.isArray(newVal.options.days)
      ) {
        selectedDays.value = Object.keys(newVal.options.days).map(Number);
      }
      else if (Array.isArray(newVal.options.days)) {
        selectedDays.value = [...newVal.options.days];
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
}

.info-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--modalBg, #ffffff);
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 101;
  width: 90%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content {
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color, #e8e8e8);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--modalColor, #1a1a1a);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 6px;
  color: var(--text-secondary, #666);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--bg-hover, #f5f5f5);
  color: var(--text-primary, #1a1a1a);
}

.edit-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color, #f0f0f0);
}

.edit-section:last-of-type {
  border-bottom: none;
  margin-bottom: 15px;
}

.edit-label {
  font-weight: 500;
  color: var(--text-secondary, #666);
  font-size: 14px;
  margin-bottom: 12px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  position: relative;
}

input[type="checkbox"] {
  display: none;
}

label {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding-left: 24px;
  position: relative;
  font-size: 14px;
  color: var(--text-primary, #1a1a1a);
}

.custom-checkbox {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background-color: var(--bg-secondary, #f0f0f0);
  transition: all 0.2s ease;
}

input[type="checkbox"]:checked + label .custom-checkbox {
  background: oklch(0.541 0.198 267);
}

input[type="checkbox"]:checked + label .custom-checkbox::after {
  content: "";
  position: absolute;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.time-grid, .timeout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.time-input-group, .timeout-input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.time-input-group label, .timeout-input-group label {
  font-size: 13px;
  color: var(--text-secondary, #666);
  padding-left: 0;
}

.time-input-group input, .timeout-input-group select {
  padding: 8px 10px;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #1a1a1a);
}

.timeout-input-group {
  position: relative;
}

.min-text {
  position: absolute;
  right: 10px;
  bottom: 8px;
  font-size: 12px;
  color: var(--text-secondary, #666);
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-item {
  margin: 0;
}

.edit-btn {
  width: 100%;
  padding: 12px 20px;
  background: oklch(0.541 0.198 267);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .info-modal {
    width: 95%;
    max-width: none;
    border-radius: 10px;
  }
  
  .modal-content {
    padding: 16px;
  }
  
  .modal-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }
  
  .modal-title {
    font-size: 16px;
  }
  
  .checkbox-group {
    gap: 10px;
  }
  
  .time-grid, .timeout-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .edit-btn {
    padding: 10px 16px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .info-modal {
    width: 100%;
    height: 100%;
    max-height: none;
    border-radius: 0;
    top: 0;
    left: 0;
    transform: none;
  }
  
  .modal-content {
    padding: 20px 16px;
  }
  
  .edit-label {
    font-size: 13px;
  }
  
  label {
    font-size: 13px;
  }
  
  .time-input-group input, .timeout-input-group select {
    font-size: 13px;
    padding: 7px 10px;
  }
  
  .min-text {
    font-size: 11px;
    bottom: 7px;
  }
}

/* Для очень маленьких экранов */
@media (max-width: 320px) {
  .modal-content {
    padding: 16px 12px;
  }
  
  .modal-title {
    font-size: 15px;
  }
  
  .checkbox-group {
    gap: 8px;
  }
  
  label {
    font-size: 12px;
    padding-left: 22px;
  }
  
  .custom-checkbox {
    width: 16px;
    height: 16px;
  }
  
  input[type="checkbox"]:checked + label .custom-checkbox::after {
    left: 5px;
    top: 1px;
    width: 4px;
    height: 8px;
  }
}
</style>