<template>
  <div class="modal-header">
    <h2>{{ selectTariff.name }} {{ getTariffValue(selectTariff.period) }}</h2>
    <button class="close-button" @click="close">Назад</button>
  </div>
  <Loading v-if="loadingPay" />
  <div v-else class="tariff-content">
    <div class="tariff-price">
      <div class="price-amount">
        {{ selectTariff.price }}
        <span class="currency">{{ selectTariff.currency }}</span>
      </div>
      <div class="price-period">
        за {{ getPeriodText(selectTariff.period) }}
      </div>
    </div>

    <div class="tariff-features">
      <div class="feature-item">
        <svg class="feature-icon" viewBox="0 0 24 24" width="20" height="20">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
        <span>Полный доступ к функционалу</span>
      </div>
      <div class="feature-item">
        <svg class="feature-icon" viewBox="0 0 24 24" width="20" height="20">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
        <span>Техническая поддержка 24/7</span>
      </div>
    </div>

    <button class="buy-button" @click="buyTariff">Купить тариф</button>
  </div>
</template>

<script setup>
import { toRefs } from "vue";
import { ref, computed } from "vue";
import axios from "axios";
import Loading from "./Loading.vue";
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const apiUrl = import.meta.env.VITE_PAY_URL;

const props = defineProps({
  selectTariff: {
    type: Object,
    required: true,
  },
  close: {
    type: Function,
    required: true,
  },
  changePaymentsStation: {
    type: Function,
  },
  selectedItem: {
    type: Object,
  },
});

const loadingPay = ref(false);
const { selectTariff, selectedItem } = toRefs(props);

const emit = defineEmits(["buy"]);

const getTariffValue = (period) => {
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

const getPeriodText = (tariff) => {
  return getTariffValue(tariff).toLowerCase();
};

const buyTariff = async () => {
  loadingPay.value = true;
  console.log(selectTariff.value);
  try {
    const response = await axios.post(
      `${apiUrl}/buy`,
      {
        amount: selectTariff.value.price,
        tariff_id: selectTariff.value.id,
        currency: selectTariff.value.currency,
        entity: "vendor",
        category: "tariff",
        entity_uuid: "3ed9f920-f6ed-419f-afda-118dc4f32881",
      },
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data.success) {
      loadingPay.value = false;
      props.changePaymentsStation(true, "success");
    } else {
      console.log("jib,r");
      props.changePaymentsStation(true, "error");
    }
  } catch (error) {
    console.error("error", error);
    console.log(error.response.data);
    loadingPay.value = false;
    props.changePaymentsStation(true, "error", error.response.data.message);
  }
};
</script>

<style scoped>
.tariff-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0px;
  margin-bottom: 20px;
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
  border-radius: 6px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 500;
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

.tariff-content {
  /* padding: 25px; */
}

.tariff-price {
  text-align: center;
  margin-bottom: 30px;
}

.price-amount {
  font-size: 48px;
  font-weight: 700;
  color: #4a6cf7;
  line-height: 1;
}

.price-amount .currency {
  font-size: 24px;
  font-weight: 500;
}

.price-period {
  font-size: 16px;
  color: #666;
  margin-top: 5px;
}

.tariff-features {
  margin-bottom: 30px;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  /* border-bottom: 1px solid #f5f5f5; */
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-icon {
  fill: #4a6cf7;
  margin-right: 12px;
  flex-shrink: 0;
}

.buy-button {
  width: 100%;
  padding: 11px;
  background: #4a6cf7;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 25px;
}

.buy-button:hover {
  background: #3a5ce4;
}

.tariff-meta {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.meta-item:last-child {
  margin-bottom: 0;
}

.meta-label {
  color: #666;
}

.meta-value {
  font-weight: 500;
}
</style>
