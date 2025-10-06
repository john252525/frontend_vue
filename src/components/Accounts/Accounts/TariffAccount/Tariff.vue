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

      <div v-else class="tariffs-wrapper">
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

            <!-- Бейдж бонусов -->
            <div v-if="hasBonuses(tariff)" class="bonus-badge">
              <span class="bonus-badge__text">Бонус</span>
            </div>

            <div class="tariff-card__header">
              <h3 class="tariff-name">{{ tariff.name }}</h3>
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
              </div>
            </div>

            <div class="tariff-card__features">
              <!-- Лимиты тарифа -->
              <div class="feature-item" v-if="tariff.limits">
                <div class="feature-icon">
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                    />
                  </svg>
                </div>
                <span class="feature-text">
                  Диалогов: {{ formatLimit(tariff.limits.dialogs) }}
                </span>
              </div>

              <div class="feature-item" v-if="tariff.limits">
                <div class="feature-icon">
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                    />
                  </svg>
                </div>
                <span class="feature-text">
                  Сообщений: {{ formatLimit(tariff.limits.messages) }}
                </span>
              </div>

              <div class="feature-item" v-if="tariff.limits?.write_first">
                <div class="feature-icon">
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                    />
                  </svg>
                </div>
                <span class="feature-text">Первое сообщение</span>
              </div>

              <!-- Ежемесячная стоимость -->
              <div
                v-if="shouldShowMonthlyPrice(tariff)"
                class="feature-item monthly-price-item"
              >
                <div class="feature-icon">
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                </div>
                <span class="feature-text">
                  {{ calculateMonthlyEquivalent(tariff) }} ₽/мес
                  <span
                    v-if="calculateSavings(tariff) > 0"
                    class="savings-text"
                  >
                    (Экономия {{ calculateSavings(tariff) }}%)
                  </span>
                </span>
              </div>

              <!-- Бонусы -->
              <div 
                class="feature-item bonus-item" 
                v-for="bonus in getActiveBonuses(tariff)" 
                :key="bonus.mod_id"
              >
                <div class="feature-icon bonus-icon">
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                </div>
                <span class="feature-text">
                  {{ getBonusDescription(tariff, bonus) }}
                </span>
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
              Выбрать
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
            {{ currentPage + 1 }} / {{ totalPages }}
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
const itemsPerPage = 4; // Увеличили до 4 тарифов на странице

// Методы остаются без изменений
const formatLimit = (limit) => {
  if (limit === -1) return "безлимит";
  return new Intl.NumberFormat('ru-RU').format(limit);
};

const hasBonuses = (tariff) => {
  return tariff.bonuses && tariff.bonuses.length > 0;
};

const getActiveBonuses = (tariff) => {
  if (!tariff.bonuses) return [];
  return tariff.bonuses.filter(bonus => bonus.multiplier > 0);
};

const getAppliedMods = (tariff) => {
  if (!tariff.mods) return [];
  return tariff.mods.filter(mod => mod.is_applied);
};

const getBonusDescription = (tariff, bonus) => {
  if (bonus.multiplier === 0) return "Бонус недоступен";
  
  const periodText = getPeriodText(bonus.tariff_period || '1m');
  const multiplierText = bonus.multiplier > 1 ? `${bonus.multiplier} x ` : '';
  
  return `+ ${multiplierText}${bonus.tariff_code} на ${periodText}`;
};

const hasDiscount = (tariff) => {
  return tariff.final_price && tariff.final_price < tariff.price;
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
  return Math.round(monthlyPrice);
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
  nullTariff.value = false;

  let code;

  if (selectedItem.value.source !== "whatsapi") {
    code = `touchapi-${selectedItem.value.source}`;
  } else {
    code = "whatsapi-bulk";
  }

  try {
    const response = await axios.post(
      `${FRONTEND_URL_TARIFFS}getByCodeWithMods`,
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
        
      if (tariffsData.value.length === 0) {
        nullTariff.value = true;
        error.value = "Тарифы не найдены";
      }
    } else {
      throw new Error("Неверный формат ответа от сервера");
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Ошибка при загрузке тарифов";
    if (err.response?.data?.message === "No tariffs found") {
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
  console.log("Выбран тариф:", selectTariff.value);
};

const sortedTariffs = computed(() => {
  const periodOrder = { 
    "1d": 1, "7d": 2, "14d": 3, "30d": 4, 
    "1m": 5, "3m": 6, "6m": 7, "12m": 8, "1y": 9 
  };
  
  return [...tariffsData.value]
    .filter((tariff) => tariff.enable !== false)
    .sort((a, b) => {
      const orderA = periodOrder[a.period] || 99;
      const orderB = periodOrder[b.period] || 99;
      return orderA - orderB;
    });
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
    "1d": "1 день", "7d": "7 дней", "14d": "14 дней", "30d": "30 дней",
    "1m": "1 месяц", "3m": "3 месяца", "6m": "6 месяцев", "12m": "12 месяцев",
    "1y": "1 год"
  };
  return periodMap[period] || period;
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
  padding: 24px;
  position: relative;
  animation: slideUp 0.4s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  margin: auto;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
  font-size: 22px;
  color: #1a1a1a;
  margin: 0;
  font-weight: 700;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.close-button:hover {
  background: #f8f9ff;
}

.close-button svg {
  fill: #666;
  transition: fill 0.3s ease;
  width: 20px;
  height: 20px;
}

.tariffs-wrapper {
  width: 100%;
}

.tariffs-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  width: 100%;
}

.tariff-card {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #eaeaea;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 320px;
  box-sizing: border-box;
}

.tariff-card--hovered {
  transform: translateY(-4px);
  border-color: #6732ff;
  box-shadow: 0 8px 20px rgba(103, 50, 255, 0.15);
}

.tariff-card--discount {
  border-color: #ffcdd2;
  background: linear-gradient(135deg, #fff 0%, #fffaf5 100%);
}

.discount-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #ff3b30 0%, #ff6b6b 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  z-index: 2;
}

.bonus-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  z-index: 2;
}

.discount-badge__text,
.bonus-badge__text {
  font-size: 11px;
  font-weight: 700;
}

.tariff-card__header {
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.tariff-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
  line-height: 1.3;
}

.price-block {
  margin-bottom: 8px;
}

.price-display {
  margin-bottom: 8px;
}

.price-with-discount {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.original-price-wrapper {
  display: flex;
  align-items: center;
  gap: 2px;
}

.original-price {
  font-size: 14px;
  text-decoration: line-through;
  color: #9e9e9e;
  font-weight: 500;
}

.original-currency {
  font-size: 12px;
  color: #9e9e9e;
}

.final-price-wrapper {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.final-price {
  font-size: 24px;
  font-weight: 800;
  color: #ff3b30;
  line-height: 1;
}

.final-currency {
  font-size: 14px;
  color: #ff3b30;
  font-weight: 600;
}

.price-without-discount {
  display: flex;
  align-items: baseline;
  gap: 4px;
  justify-content: center;
}

.regular-price {
  font-size: 24px;
  font-weight: 800;
  color: #6732ff;
  line-height: 1;
}

.regular-currency {
  font-size: 14px;
  color: #6732ff;
  font-weight: 600;
}

.period-text {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.tariff-card__features {
  margin: 12px 0;
  flex-grow: 1;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  font-size: 13px;
  color: #555;
  line-height: 1.4;
  gap: 8px;
}

.feature-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  background: #f0f4ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

.feature-icon svg {
  fill: #6732ff;
  width: 12px;
  height: 12px;
}

.bonus-icon {
  background: #f0fff4;
}

.bonus-icon svg {
  fill: #4caf50;
}

.monthly-price-item .feature-icon {
  background: #fff3e0;
}

.monthly-price-item .feature-icon svg {
  fill: #ff9800;
}

.bonus-item .feature-text {
  color: #2e7d32;
  font-weight: 600;
}

.monthly-price-item .feature-text {
  color: #e65100;
  font-weight: 600;
}

.savings-text {
  color: #4caf50;
  font-size: 12px;
}

.feature-text {
  flex: 1;
  font-weight: 500;
}

.select-button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #6732ff 0%, #8a63ff 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  margin-top: auto;
}

.select-button:hover,
.select-button--hovered {
  transform: translateY(-1px);
  background: linear-gradient(135deg, #7a4aff 0%, #9d7aff 100%);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loader {
  border: 3px solid rgba(101, 52, 255, 0.1);
  border-radius: 50%;
  border-top: 3px solid #6732ff;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.error-message {
  text-align: center;
  padding: 30px 20px;
  color: #ff5252;
  font-weight: 500;
  font-size: 14px;
}

.retry-button {
  margin-top: 15px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #6732ff 0%, #8a63ff 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  font-weight: 600;
}

.retry-button:hover {
  transform: translateY(-1px);
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 15px;
}

.pagination-button {
  background: linear-gradient(135deg, #6732ff 0%, #8a63ff 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: 600;
}

.pagination-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.pagination-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.page-indicator {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .modal-container {
    padding: 20px;
    margin: 10px;
    max-width: 95%;
  }

  .tariffs-container {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 12px;
  }

  .tariff-card {
    padding: 16px;
    min-height: 280px;
  }

  .final-price,
  .regular-price {
    font-size: 20px;
  }

  .modal-header h2 {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }

  .tariffs-container {
    grid-template-columns: 1fr;
  }

  .tariff-card {
    min-height: auto;
  }

  .feature-item {
    font-size: 12px;
  }

  .select-button {
    padding: 10px;
    font-size: 13px;
  }

  .discount-badge,
  .bonus-badge {
    top: 8px;
    right: 8px;
    padding: 3px 8px;
    font-size: 10px;
  }
  
  .bonus-badge {
    left: 8px;
    right: auto;
  }
}
</style>
