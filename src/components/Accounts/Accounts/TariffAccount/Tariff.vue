<template>
  <div class="modal-overlay" @click.self="closeModal">
    <SuccessfulPurchase
      :changeTariffStation="changeTariffStation"
      v-if="paymentsStation.success"
      :tariff="selectTariff"
    />
    <FailedPurchase
      v-if="paymentsStation.error"
      :error="paymentsStation.errorMessages"
      :tariff="selectTariff"
      :changeTariffStation="changeTariffStation"
    />
    <div
      v-if="!buySection && !paymentsStation.success && !paymentsStation.error"
      class="modal-container"
    >
      <div class="modal-header">
        <h2>Выберите тариф</h2>
        <button class="close-button" @click="closeModal">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>
      </div>

      <!-- <div v-if="loading" class="loading-container">
        <div class="loader"></div>
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
        <button @click="fetchTariffs" class="retry-button">
          Повторить попытку
        </button>
      </div> -->

      <div class="tariffs-wrapper">
        <div class="tariffs-container">
          <div
            class="tariff-card"
            v-for="(tariff, index) in paginatedTariffs"
            :key="tariff.id"
            @mouseenter="hoverIndex = currentPage * itemsPerPage + index"
            @mouseleave="hoverIndex = -1"
            :class="{
              hovered: hoverIndex === currentPage * itemsPerPage + index,
            }"
          >
            <div class="tariff-header">
              <div class="price-container">
                <div class="price">
                  <span class="amount">{{ formatPrice(tariff.price) }}</span>
                  <span class="currency">{{ tariff.currency }}</span>
                </div>
                <div class="period">/{{ getPeriodText(tariff.period) }}</div>
                <div v-if="showMonthlyPrice(tariff)" class="monthly-price">
                  {{ calculateMonthlyPrice(tariff) }} ₽/мес
                </div>
              </div>
            </div>

            <div class="tariff-features">
              <div class="feature" v-if="tariff.limits">
                <svg class="feature-icon" viewBox="0 0 24 24">
                  <path
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                  />
                </svg>
                <span>{{ tariff.limits || "Без ограничений" }}</span>
              </div>
              <div class="feature">
                <svg class="feature-icon" viewBox="0 0 24 24">
                  <path
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                  />
                </svg>
                <span>Доступ на {{ getPeriodText(tariff.period) }}</span>
              </div>
              <div class="feature">
                <svg class="feature-icon" viewBox="0 0 24 24">
                  <path
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                  />
                </svg>
                <span>Техническая поддержка 24/7</span>
              </div>
            </div>

            <button
              @click="clickSelectTariff(tariff)"
              class="select-button"
              :class="{
                hovered: hoverIndex === currentPage * itemsPerPage + index,
              }"
            >
              Выбрать тариф
            </button>
          </div>
        </div>

        <div v-if="totalPages > 1" class="pagination-controls">
          <button
            @click="prevPage"
            :disabled="currentPage === 0"
            class="pagination-button"
          >
            &larr;
          </button>
          <span class="page-indicator">
            Страница {{ currentPage + 1 }} из {{ totalPages }}
          </span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages - 1"
            class="pagination-button"
          >
            &rarr;
          </button>
        </div>
      </div>
    </div>
    <div
      class="modal-container"
      v-if="buySection && !paymentsStation.success && !paymentsStation.error"
    >
      <BuySection
        :changePaymentsStation="changePaymentsStation"
        :selectTariff="selectTariff"
        :close="changeStationTariff"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";

import FailedPurchase from "./Purchase/FailedPurchase.vue";
import SuccessfulPurchase from "./Purchase/SuccessfulPurchase.vue";
import BuySection from "./BuySection.vue";

const props = defineProps({
  changeTariffStation: {
    type: Function,
  },
  tariffStation: {
    type: Boolean,
  },
});

const emit = defineEmits(["close"]);

const buySection = ref(false);

const paymentsStation = reactive({
  error: false,
  success: false,
  errorMessages: "",
});

const changePaymentsStation = (isOpen, answer, error) => {
  if (answer === "error") {
    if (isOpen) {
      paymentsStation.errorMessages = error;
      paymentsStation.error = true;
    } else {
      paymentsStation.error = false;
    }
  }

  if (answer === "success") {
    if (isOpen) {
      paymentsStation.success = true;
    } else {
      paymentsStation.success = false;
    }
  }
};

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const hoverIndex = ref(-1);
const loading = ref(false);
const tariffsData = ref([
  {
    id: 3,
    brand_slug: "touchapi",
    code: "touchapi-whatsapp",
    period: "1m",
    limits: "",
    name: "Whatsapp",
    price: 1050,
    currency: "RUB",
    dt_ins: "2025-07-23 20:04:17",
    dt_upd: "2025-07-28 11:38:13",
    enable: 1,
  },
  {
    id: 9,
    brand_slug: "touchapi",
    code: "touchapi-whatsapp",
    period: "1y",
    limits: "",
    name: "Whatsapp 1 year",
    price: 9000,
    currency: "RUB",
    dt_ins: "2025-07-23 20:04:17",
    dt_upd: "2025-07-28 11:38:13",
    enable: 1,
  },
  {
    id: 7,
    brand_slug: "touchapi",
    code: "touchapi-whatsapp",
    period: "3m",
    limits: "",
    name: "Whatsapp 3 month",
    price: 2600,
    currency: "RUB",
    dt_ins: "2025-07-23 20:04:17",
    dt_upd: "2025-07-28 11:38:13",
    enable: 1,
  },
  {
    id: 8,
    brand_slug: "touchapi",
    code: "touchapi-whatsapp",
    period: "6m",
    limits: "",
    name: "Whatsapp 6 month",
    price: 5000,
    currency: "RUB",
    dt_ins: "2025-07-23 20:04:17",
    dt_upd: "2025-07-28 11:38:13",
    enable: 1,
  },
]);
const error = ref(null);
const currentPage = ref(0);
const itemsPerPage = 3;

const fetchTariffs = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await axios.post(
      "https://bapi88.developtech.ru/api/v1/tariffs/getByCode",
      { code: "touchapi-whatsapp" },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data.ok && response.data.data) {
      tariffsData.value = Array.isArray(response.data.data)
        ? response.data.data
        : [response.data.data];
    } else {
      throw new Error("Неверный формат ответа от сервера");
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Ошибка при загрузке тарифов";
    console.error("Error fetching tariffs:", err);
  } finally {
    loading.value = false;
  }
};

const selectTariff = ref({});

const changeStationTariff = () => {
  buySection.value = !buySection.value;
};

const clickSelectTariff = (tariff) => {
  changeStationTariff();
  selectTariff.value = tariff;
  console.log(selectTariff.value);
};

const sortedTariffs = computed(() => {
  const periodOrder = { "1m": 1, "3m": 2, "6m": 3, "12m": 4, "1y": 4 };
  return [...tariffsData.value]
    .filter((tariff) => tariff.enable)
    .sort((a, b) => periodOrder[a.period] - periodOrder[b.period]);
});

const totalPages = computed(() => {
  return Math.ceil(sortedTariffs.value.length / itemsPerPage);
});

const paginatedTariffs = computed(() => {
  const start = currentPage.value * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedTariffs.value.slice(start, end);
});

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("ru-RU").format(price);
};

const getPeriodText = (period) => {
  const periods = {
    "1m": "1 месяц",
    "3m": "3 месяца",
    "6m": "6 месяцев",
    "12m": "1 год",
    "1y": "1 год",
  };
  return periods[period] || period;
};

const calculateMonthlyPrice = (tariff) => {
  const months = {
    "1m": 1,
    "3m": 3,
    "6m": 6,
    "12m": 12,
    "1y": 12,
  };
  return Math.round(tariff.price / months[tariff.period]);
};

const calculateOriginalMonthly = (tariff) => {
  const monthlyTariff = sortedTariffs.value.find((t) => t.period === "1m");
  return monthlyTariff ? monthlyTariff.price : 1050;
};

const calculateSavings = (tariff) => {
  if (tariff.period !== "1y") return 0;
  const monthlyPrice = calculateMonthlyPrice(tariff);
  const originalMonthly = calculateOriginalMonthly(tariff);
  return Math.round((1 - monthlyPrice / originalMonthly) * 100);
};

const showMonthlyPrice = (tariff) => {
  return tariff.period !== "1m";
};

const getTariffName = (tariff) => {
  if (tariff.period === "1y") {
    return "Годовой тариф";
  }
  return tariff.name.replace("Whatsapp", "").trim();
};

const closeModal = () => {
  props.changeTariffStation();
};

onMounted(fetchTariffs);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  padding: 25px;
  position: relative;
  animation: slideUp 0.4s ease;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  margin: auto;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
  font-size: clamp(20px, 4vw, 24px);
  color: #333;
  margin: 0;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.close-button:hover {
  background: #f5f5f5;
}

.close-button svg {
  fill: #666;
  transition: fill 0.2s;
  width: 20px;
  height: 20px;
}

.tariffs-wrapper {
  width: 100%;
}

.tariffs-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  width: 100%;
  overflow-x: hidden;
}

.tariff-card {
  width: 280px; /* Фиксированная ширина */
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(101, 52, 255, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-width: 0;
  box-sizing: border-box; /* Чтобы padding не влиял на общую ширину */
}

.tariff-card.hovered {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.tariff-header {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.tariff-header h3 {
  font-size: clamp(16px, 3vw, 20px);
  color: #333;
  margin-bottom: 12px;
  font-weight: 600;
}

.price-container {
  margin-bottom: 5px;
}

.price {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 5px;
}

.amount {
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 700;
  color: #6732ff;
  line-height: 1;
}

.currency {
  font-size: clamp(14px, 3vw, 18px);
  margin-left: 3px;
  color: #666;
  align-self: flex-start;
  line-height: 1.5;
}

.period {
  font-size: clamp(12px, 2.5vw, 14px);
  color: #888;
  margin-bottom: 8px;
}

.monthly-price {
  font-size: clamp(12px, 2.5vw, 14px);
  color: #4caf50;
  font-weight: 500;
  margin-top: 5px;
}

.savings-text {
  font-size: clamp(12px, 2.5vw, 14px);
  color: #4caf50;
  font-weight: 500;
  margin-top: 5px;
}

.tariff-features {
  margin: 15px 0;
  flex-grow: 1;
}

.feature {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  font-size: clamp(13px, 2.5vw, 14px);
  color: #555;
  line-height: 1.4;
}

.feature-icon {
  width: 16px;
  height: 16px;
  fill: #6732ff;
  margin-right: 8px;
  flex-shrink: 0;
  margin-top: 2px;
}

.select-button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #6732ff;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: clamp(14px, 3vw, 15px);
  margin-top: auto;
}

.select-button:hover,
.select-button.hovered {
  background: #7a4aff;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loader {
  border: 4px solid rgba(101, 52, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #6732ff;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.error-message {
  text-align: center;
  padding: 20px;
  color: #ff5252;
  font-weight: 500;
  font-size: clamp(14px, 3vw, 16px);
}

.retry-button {
  margin-top: 15px;
  padding: 8px 16px;
  background: #6732ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: clamp(13px, 2.5vw, 14px);
}

.retry-button:hover {
  background: #7a4aff;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 15px;
}

.pagination-button {
  background: #6732ff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.pagination-button:hover:not(:disabled) {
  background: #7a4aff;
}

.page-indicator {
  font-size: 14px;
  color: #666;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .tariffs-container {
    flex-direction: column;
    align-items: center;
  }

  .tariff-card {
    width: 100%;
    max-width: 320px;
  }

  .pagination-controls {
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
    align-items: flex-start;
  }

  .modal-container {
    padding: 20px 15px;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .tariff-card {
    padding: 18px;
  }

  .feature {
    margin-bottom: 8px;
  }

  .select-button {
    padding: 10px;
  }
}

@supports (-webkit-touch-callout: none) {
  .modal-overlay {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
