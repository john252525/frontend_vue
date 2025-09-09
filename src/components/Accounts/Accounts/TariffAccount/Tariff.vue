<template>
  <div class="modal-overlay" @click.self="closeModal">
    <SuccessfulPurchase
      :changeTariffStation="changeTariffStation"
      v-if="paymentsStation.success && !createPaymentsStation"
      :tariff="selectTariff"
      :getAccounts="getAccounts"
      :selectedItem="selectedItem"
      :changePayDataForAccounts="changePayDataForAccounts"
    />
    <FailedPurchase
      v-if="paymentsStation.error && !createPaymentsStation"
      :error="paymentsStation.errorMessages"
      :tariff="selectTariff"
      :changeTariffStation="changeTariffStation"
      :changePayDataForAccounts="changePayDataForAccounts"
      :changePaymentsStation="changePaymentsStation"
      :changeCreatePayments="changePaymentsStationModal"
      :chaneMinimumAmount="chaneMinimumAmount"
    />
    <CreatePayments
      :minimumAmount="minimumAmount"
      v-if="createPaymentsStation"
      :changeCreatePayments="changePaymentsStationModal"
    />
    <div
      v-if="
        !buySection &&
        !paymentsStation.success &&
        !paymentsStation.error &&
        !createPaymentsStation
      "
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

      <div v-if="loading" class="loading-container">
        <div class="loader"></div>
      </div>

      <div v-else-if="error" class="error-message">
        <div v-if="nullTariff">
          <span>Тарифов нет</span>
        </div>
        <div v-else>
          {{ error }}
          <button @click="fetchTariffs" class="retry-button">
            Повторить попытку
          </button>
        </div>
      </div>

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

                <!-- Улучшенный расчет и отображение ежемесячной стоимости -->
                <div
                  v-if="shouldShowMonthlyPrice(tariff)"
                  class="monthly-price"
                >
                  {{ calculateMonthlyEquivalent(tariff) }} ₽/мес
                  <span
                    v-if="calculateSavings(tariff) > 0"
                    class="savings-text"
                  >
                    (Экономия {{ calculateSavings(tariff) }}%)
                  </span>
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
        :selectedItem="selectedItem"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, toRefs } from "vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";
import CreatePayments from "./CreatePayments.vue";

const FRONTEND_URL_TARIFFS = import.meta.env.VITE_FRONTEND_URL_TARIFFS;

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
  selectedItem: {
    type: Object,
  },
  getAccounts: {
    type: Function,
  },
  changePayDataForAccounts: {
    type: Function,
  },
});

const { selectedItem } = toRefs(props);

const emit = defineEmits(["close"]);

const buySection = ref(false);

const paymentsStation = reactive({
  error: false,
  success: false,
  errorMessages: "",
  nullTariff: false,
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

const minimumAmount = ref(null);
const createPaymentsStation = ref(false);
const hoverIndex = ref(-1);
const loading = ref(false);
const tariffsData = ref([]);
const error = ref(null);
const nullTariff = ref(false);
const currentPage = ref(0);
const itemsPerPage = 3;

const shouldShowMonthlyPrice = (tariff) => {
  // Не показываем для периодов меньше месяца
  if (tariff.period.endsWith("d") || tariff.period.endsWith("w")) {
    return false;
  }
  // Показываем для всех остальных периодов
  return true;
};

const calculateMonthlyEquivalent = (tariff) => {
  const period = tariff.period;
  const price = tariff.price;

  // Разбираем период на число и единицу измерения
  const match = period.match(/^(\d+)([dmyw])$/);
  if (!match) return price; // Если не распознано - возвращаем как есть

  const num = parseInt(match[1]);
  const unit = match[2];

  let monthsEquivalent = 1;

  switch (unit) {
    case "d": // дни
      monthsEquivalent = num / 30; // ~30 дней в месяце
      break;
    case "w": // недели
      monthsEquivalent = num / 4.345; // ~4.345 недели в месяце
      break;
    case "m": // месяцы
      monthsEquivalent = num;
      break;
    case "y": // годы
      monthsEquivalent = num * 12;
      break;
  }

  // Округляем до 2 знаков после запятой
  const monthlyPrice = price / monthsEquivalent;
  return monthlyPrice.toFixed(2);
};

const calculateSavings = (tariff) => {
  // Находим месячный тариф для сравнения
  const monthlyTariff = sortedTariffs.value.find(
    (t) => t.period === "1m" || t.period === "30d"
  );

  if (!monthlyTariff) return 0;

  const monthlyPrice = parseFloat(calculateMonthlyEquivalent(tariff));
  const baseMonthlyPrice = monthlyTariff.price;

  if (monthlyPrice >= baseMonthlyPrice) return 0;

  const savings = ((baseMonthlyPrice - monthlyPrice) / baseMonthlyPrice) * 100;
  return Math.round(savings);
};

const fetchTariffs = async () => {
  loading.value = true;
  error.value = null;

  let code;

  if (selectedItem.value.source !== "whatsapi") {
    code = `touchapi-${selectedItem.value.source}`;
  } else {
    code = "whatsapi-bulk";
  }

  try {
    const response = await axios.post(
      `${FRONTEND_URL_TARIFFS}getByCode`,
      { code: code },
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
    if (err.response.data.message === "No tariffs found") {
      nullTariff.value = true;
    }
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
  const periodMap = {
    // Дни
    "1d": "1 день",
    "2d": "2 дня",
    "3d": "3 дня",
    "4d": "4 дня",
    "5d": "5 дней",
    "6d": "6 дней",
    "7d": "7 дней",
    "14d": "14 дней",
    "21d": "21 день",
    "28d": "28 дней",
    "30d": "30 дней",

    // Месяцы
    "1m": "1 месяц",
    "2m": "2 месяца",
    "3m": "3 месяца",
    "4m": "4 месяца",
    "5m": "5 месяцев",
    "6m": "6 месяцев",
    "7m": "7 месяцев",
    "8m": "8 месяцев",
    "9m": "9 месяцев",
    "10m": "10 месяцев",
    "11m": "11 месяцев",
    "12m": "12 месяцев",
    "14m": "14 месяцев",
    "18m": "18 месяцев",
    "24m": "24 месяца",

    // Годы
    "1y": "1 год",
    "2y": "2 года",
    "3y": "3 года",
    "4y": "4 года",
    "5y": "5 лет",
    "6y": "6 лет",
    "7y": "7 лет",
    "8y": "8 лет",
    "9y": "9 лет",
    "10y": "10 лет",

    // Недели
    "1w": "1 неделя",
    "2w": "2 недели",
    "3w": "3 недели",
    "4w": "4 недели",
  };

  // Если период есть в мапе - возвращаем его
  if (periodMap[period]) {
    return periodMap[period];
  }

  // Если период в формате типа "30d" - пытаемся разобрать
  const match = period.match(/^(\d+)([dmyw])$/);
  if (match) {
    const num = parseInt(match[1]);
    const unit = match[2];

    let unitText;
    switch (unit) {
      case "d":
        unitText = "день";
        break;
      case "m":
        unitText = "месяц";
        break;
      case "y":
        unitText = "год";
        break;
      case "w":
        unitText = "неделя";
        break;
      default:
        unitText = "";
    }

    // Формируем правильное окончание
    if (unit === "d") {
      if (num % 10 === 1 && num % 100 !== 11) {
        unitText = "день";
      } else if (
        [2, 3, 4].includes(num % 10) &&
        ![12, 13, 14].includes(num % 100)
      ) {
        unitText = "дня";
      } else {
        unitText = "дней";
      }
    } else if (unit === "m") {
      if (num % 10 === 1 && num % 100 !== 11) {
        unitText = "месяц";
      } else if (
        [2, 3, 4].includes(num % 10) &&
        ![12, 13, 14].includes(num % 100)
      ) {
        unitText = "месяца";
      } else {
        unitText = "месяцев";
      }
    } else if (unit === "y") {
      if (num % 10 === 1 && num % 100 !== 11) {
        unitText = "год";
      } else if (
        [2, 3, 4].includes(num % 10) &&
        ![12, 13, 14].includes(num % 100)
      ) {
        unitText = "года";
      } else {
        unitText = "лет";
      }
    } else if (unit === "w") {
      if (num % 10 === 1 && num % 100 !== 11) {
        unitText = "неделя";
      } else if (
        [2, 3, 4].includes(num % 10) &&
        ![12, 13, 14].includes(num % 100)
      ) {
        unitText = "недели";
      } else {
        unitText = "недель";
      }
    }

    return `${num} ${unitText}`;
  }

  // Если не смогли разобрать - возвращаем как есть
  return period;
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

const changePaymentsStationModal = () => {
  createPaymentsStation.value = !createPaymentsStation.value;
};

const chaneMinimumAmount = (value) => {
  minimumAmount.value = value;
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

.savings-text {
  color: #4caf50;
  font-size: 0.85em;
  margin-left: 5px;
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
