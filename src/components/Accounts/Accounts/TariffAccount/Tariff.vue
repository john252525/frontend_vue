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
              'tariff-card--hovered':
                hoverIndex === currentPage * itemsPerPage + index,
              'tariff-card--discount': hasDiscount(tariff),
            }"
          >
            <!-- Бейдж скидки -->
            <div v-if="hasDiscount(tariff)" class="discount-badge">
              <span class="discount-badge__text"
                >-{{ calculateDiscountPercent(tariff) }}%</span
              >
            </div>

            <div class="tariff-card__header">
              <div class="price-block">
                <div class="price-display">
                  <div v-if="hasDiscount(tariff)" class="price-with-discount">
                    <div class="original-price-wrapper">
                      <span class="original-price">{{
                        formatPrice(tariff.price)
                      }}</span>
                      <span class="original-currency">{{
                        tariff.currency
                      }}</span>
                    </div>
                    <div class="final-price-wrapper">
                      <span class="final-price">{{
                        formatPrice(tariff.final_price)
                      }}</span>
                      <span class="final-currency">{{ tariff.currency }}</span>
                    </div>
                  </div>
                  <div v-else class="price-without-discount">
                    <span class="regular-price">{{
                      formatPrice(tariff.price)
                    }}</span>
                    <span class="regular-currency">{{ tariff.currency }}</span>
                  </div>
                </div>

                <div class="period-text">
                  /{{ getPeriodText(tariff.period) }}
                </div>

                <!-- Ежемесячная стоимость -->
                <div
                  v-if="shouldShowMonthlyPrice(tariff)"
                  class="monthly-price-block"
                >
                  <div class="monthly-price">
                    {{ calculateMonthlyEquivalent(tariff) }} ₽/мес
                  </div>
                  <div
                    v-if="calculateSavings(tariff) > 0"
                    class="savings-badge"
                  >
                    Экономия {{ calculateSavings(tariff) }}%
                  </div>
                </div>
              </div>
            </div>

            <div class="tariff-card__features">
              <div class="feature-item" v-if="tariff.limits">
                <div class="feature-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                    />
                  </svg>
                </div>
                <span class="feature-text">{{
                  tariff.limits || "Без ограничений"
                }}</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                    />
                  </svg>
                </div>
                <span class="feature-text"
                  >Доступ на {{ getPeriodText(tariff.period) }}</span
                >
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                    />
                  </svg>
                </div>
                <span class="feature-text">Техническая поддержка 24/7</span>
              </div>
            </div>

            <button
              @click="clickSelectTariff(tariff)"
              class="select-button"
              :class="{
                'select-button--hovered':
                  hoverIndex === currentPage * itemsPerPage + index,
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

// Новые методы для работы со скидками
const hasDiscount = (tariff) => {
  return tariff.final_price && tariff.final_price != tariff.price;
};

const calculateDiscountPercent = (tariff) => {
  if (!hasDiscount(tariff)) return 0;

  const discount = ((tariff.price - tariff.final_price) / tariff.price) * 100;
  return Math.round(discount);
};

const shouldShowMonthlyPrice = (tariff) => {
  if (tariff.period.endsWith("d") || tariff.period.endsWith("w")) {
    return false;
  }
  return true;
};

const calculateMonthlyEquivalent = (tariff) => {
  const period = tariff.period;
  const price = hasDiscount(tariff) ? tariff.final_price : tariff.price;

  const match = period.match(/^(\d+)([dmyw])$/);
  if (!match) return price;

  const num = parseInt(match[1]);
  const unit = match[2];

  let monthsEquivalent = 1;

  switch (unit) {
    case "d": // дни
      monthsEquivalent = num / 30;
      break;
    case "w": // недели
      monthsEquivalent = num / 4.345;
      break;
    case "m": // месяцы
      monthsEquivalent = num;
      break;
    case "y": // годы
      monthsEquivalent = num * 12;
      break;
  }

  const monthlyPrice = price / monthsEquivalent;
  return monthlyPrice.toFixed(2);
};

const calculateSavings = (tariff) => {
  const monthlyTariff = sortedTariffs.value.find(
    (t) => t.period === "1m" || t.period === "30d"
  );

  if (!monthlyTariff) return 0;

  const monthlyPrice = parseFloat(calculateMonthlyEquivalent(tariff));
  const baseMonthlyPrice = hasDiscount(monthlyTariff)
    ? monthlyTariff.final_price
    : monthlyTariff.price;

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

// const paginatedTariffs = computed(() => {
//   const start = currentPage.value * itemsPerPage;
//   const end = start + itemsPerPage;
//   return [
//     {
//       id: "7",
//       code: "whatsapi-bulk",
//       period: "1m",
//       limits: "",
//       name: "Whatsapi 1 Month",
//       price: "2000",
//       currency: "RUB",
//       enable: "1",
//       final_price: 1000,
//     },
//   ];
// });

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
    "1w": "1 неделя",
    "2w": "2 недели",
    "3w": "3 недели",
    "4w": "4 недели",
  };

  if (periodMap[period]) {
    return periodMap[period];
  }

  const match = period.match(/^(\d+)([dmyw])$/);
  if (match) {
    const num = parseInt(match[1]);
    const unit = match[2];

    let unitText;
    switch (unit) {
      case "d":
        if (num % 10 === 1 && num % 100 !== 11) unitText = "день";
        else if (
          [2, 3, 4].includes(num % 10) &&
          ![12, 13, 14].includes(num % 100)
        )
          unitText = "дня";
        else unitText = "дней";
        break;
      case "m":
        if (num % 10 === 1 && num % 100 !== 11) unitText = "месяц";
        else if (
          [2, 3, 4].includes(num % 10) &&
          ![12, 13, 14].includes(num % 100)
        )
          unitText = "месяца";
        else unitText = "месяцев";
        break;
      case "y":
        if (num % 10 === 1 && num % 100 !== 11) unitText = "год";
        else if (
          [2, 3, 4].includes(num % 10) &&
          ![12, 13, 14].includes(num % 100)
        )
          unitText = "года";
        else unitText = "лет";
        break;
      case "w":
        if (num % 10 === 1 && num % 100 !== 11) unitText = "неделя";
        else if (
          [2, 3, 4].includes(num % 10) &&
          ![12, 13, 14].includes(num % 100)
        )
          unitText = "недели";
        else unitText = "недель";
        break;
      default:
        unitText = "";
    }

    return `${num} ${unitText}`;
  }

  return period;
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
  border-radius: 20px;
  width: 100%;
  max-width: 1000px;
  padding: 30px;
  position: relative;
  animation: slideUp 0.4s ease;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  margin: auto;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 25px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
  font-size: 28px;
  color: #1a1a1a;
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.close-button:hover {
  background: #f8f9ff;
  transform: rotate(90deg);
}

.close-button svg {
  fill: #666;
  transition: fill 0.3s ease;
  width: 22px;
  height: 22px;
}

.tariffs-wrapper {
  width: 100%;
}

.tariffs-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 25px;
  width: 100%;
}

.tariff-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 28px;
  border: 2px solid #f7f9fc;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.tariff-card--hovered {
  transform: translateY(-8px);
  border-color: #6732ff;
  box-shadow: 0 25px 50px rgba(103, 50, 255, 0.12);
}

.tariff-card--discount {
  border-color: #ffebee;
  background: linear-gradient(135deg, #fff 0%, #fffaf5 100%);
}

.discount-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #ff3b30 0%, #ff6b6b 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
}

.discount-badge__text {
  font-size: 13px;
  font-weight: 800;
}

.tariff-card__header {
  text-align: center;
  margin-bottom: 24px;
  position: relative;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.price-block {
  margin-bottom: 8px;
}

.price-display {
  margin-bottom: 12px;
}

.price-with-discount {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.original-price-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.original-price {
  font-size: 20px;
  text-decoration: line-through;
  color: #9e9e9e;
  font-weight: 500;
}

.original-currency {
  font-size: 16px;
  color: #9e9e9e;
}

.final-price-wrapper {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.final-price {
  font-size: 36px;
  font-weight: 800;
  color: #ff3b30;
  line-height: 1;
  letter-spacing: -1px;
}

.final-currency {
  font-size: 20px;
  color: #ff3b30;
  font-weight: 600;
}

.price-without-discount {
  display: flex;
  align-items: baseline;
  gap: 6px;
  justify-content: center;
}

.regular-price {
  font-size: 36px;
  font-weight: 800;
  color: #6732ff;
  line-height: 1;
  letter-spacing: -1px;
}

.regular-currency {
  font-size: 20px;
  color: #6732ff;
  font-weight: 600;
}

.period-text {
  font-size: 16px;
  color: #666;
  margin-bottom: 16px;
  font-weight: 500;
}

.monthly-price-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.monthly-price {
  font-size: 15px;
  color: #4caf50;
  font-weight: 600;
  background: #f0fff4;
  padding: 6px 12px;
  border-radius: 12px;
}

.savings-badge {
  font-size: 13px;
  color: #2e7d32;
  font-weight: 500;
  background: #e8f5e8;
  padding: 4px 10px;
  border-radius: 8px;
}

.tariff-card__features {
  margin: 20px 0;
  flex-grow: 1;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  font-size: 15px;
  color: #555;
  line-height: 1.5;
  gap: 12px;
}

.feature-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  background: #f0f4ff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.feature-icon svg {
  fill: #6732ff;
  width: 14px;
  height: 14px;
}

.feature-text {
  flex: 1;
  font-weight: 500;
}

.select-button {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6732ff 0%, #8a63ff 100%);
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  margin-top: auto;
  box-shadow: 0 4px 15px rgba(103, 50, 255, 0.3);
}

.select-button:hover,
.select-button--hovered {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(103, 50, 255, 0.4);
  background: linear-gradient(135deg, #7a4aff 0%, #9d7aff 100%);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loader {
  border: 4px solid rgba(101, 52, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #6732ff;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

.error-message {
  text-align: center;
  padding: 40px 20px;
  color: #ff5252;
  font-weight: 500;
  font-size: 16px;
}

.retry-button {
  margin-top: 20px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6732ff 0%, #8a63ff 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 600;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(103, 50, 255, 0.3);
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  gap: 20px;
}

.pagination-button {
  background: linear-gradient(135deg, #6732ff 0%, #8a63ff 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(103, 50, 255, 0.3);
}

.pagination-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.pagination-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(103, 50, 255, 0.4);
}

.page-indicator {
  font-size: 15px;
  color: #666;
  font-weight: 500;
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
    transform: translateY(40px);
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
  .modal-container {
    padding: 24px;
    margin: 20px;
  }

  .tariffs-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .tariff-card {
    padding: 24px;
  }

  .final-price,
  .regular-price {
    font-size: 32px;
  }

  .modal-header h2 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-container {
    padding: 20px;
    margin: 10px;
  }

  .tariff-card {
    padding: 20px;
  }

  .final-price,
  .regular-price {
    font-size: 28px;
  }

  .feature-item {
    font-size: 14px;
  }

  .select-button {
    padding: 14px;
    font-size: 15px;
  }

  .discount-badge {
    top: 15px;
    right: 15px;
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
