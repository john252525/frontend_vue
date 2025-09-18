<template>
  <div class="modal-header">
    <h2>{{ selectTariff.name }} {{ getTariffValue(selectTariff.period) }}</h2>
    <button class="close-button" @click="close">Назад</button>
  </div>
  <Loading v-if="loadingPay" />
  <div v-else class="tariff-content">
    <div class="tariff-price">
      <div v-if="hasDiscount" class="price-with-discount">
        <div class="original-price-wrapper">
          <span class="original-price">{{
            formatPrice(selectTariff.price)
          }}</span>
          <span class="original-currency">{{ selectTariff.currency }}</span>
        </div>
        <div class="final-price-wrapper">
          <span class="final-price">{{ formatPrice(finalPrice) }}</span>
          <span class="final-currency">{{ selectTariff.currency }}</span>
        </div>
        <div class="discount-badge">-{{ discountPercent }}%</div>
      </div>
      <div v-else class="price-without-discount">
        <div class="price-amount">
          {{ formatPrice(finalPrice) }}
          <span class="currency">{{ selectTariff.currency }}</span>
        </div>
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

    <button class="buy-button" @click="buyTariff">
      Купить за {{ formatPrice(finalPrice) }} {{ selectTariff.currency }}
    </button>
  </div>
</template>

<script setup>
import { toRefs, computed } from "vue";
import { ref } from "vue";
import axios from "axios";
import Loading from "./Loading.vue";
import { useAccountStore } from "@/stores/accountStore";
import { useBalanceStore } from "@/stores/balanceStore";

const accountStore = useAccountStore();
const balanceStore = useBalanceStore();
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

// Вычисляемые свойства для работы со скидкой
const hasDiscount = computed(() => {
  return (
    selectTariff.value.final_price &&
    selectTariff.value.final_price != selectTariff.value.price
  );
});

const finalPrice = computed(() => {
  return hasDiscount.value
    ? selectTariff.value.final_price
    : selectTariff.value.price;
});

const discountPercent = computed(() => {
  if (!hasDiscount.value) return 0;
  const discount =
    ((selectTariff.value.price - selectTariff.value.final_price) /
      selectTariff.value.price) *
    100;
  return Math.round(discount);
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("ru-RU").format(price);
};

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
        break;
      case "m":
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
        break;
      case "y":
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
        break;
      case "w":
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
        break;
      default:
        unitText = "";
    }

    return `${num} ${unitText}`;
  }

  return period;
};

const getPeriodText = (tariff) => {
  return getTariffValue(tariff).toLowerCase();
};

const encodeTariff = (tariffCode, id) => {
  try {
    const prefix = "tariff_";
    const timestamp = Date.now();
    const randomSalt = Math.random().toString(36).substring(2, 8);
    const str = `${prefix}${tariffCode}|${id}|${timestamp}|${randomSalt}`;

    const firstPass = btoa(unescape(encodeURIComponent(str)));
    const secondPass = btoa(
      unescape(encodeURIComponent(firstPass.split("").reverse().join("")))
    );

    return secondPass;
  } catch (error) {
    console.error("Encoding error:", error);
    throw new Error("Failed to encode tariff code");
  }
};

const buyTariff = async () => {
  loadingPay.value = true;
  console.log(selectTariff.value);

  try {
    const encodedTariff = encodeTariff(
      selectTariff.value.code,
      selectTariff.value.id
    );

    const response = await axios.post(
      `${apiUrl}/buy`,
      {
        amount: finalPrice.value, // Используем finalPrice вместо selectTariff.value.price
        tariff_id: selectTariff.value.id,
        tariff: encodedTariff,
        currency: selectTariff.value.currency,
        domain: window.location.hostname,
        entity: "vendor",
        category: "tariff",
        entity_uuid: selectedItem.value.uuid,
        original_price: selectTariff.value.price, // Добавляем оригинальную цену для отслеживания
        discount_percent: discountPercent.value, // Добавляем процент скидки
      },
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data.success) {
      loadingPay.value = false;
      await balanceStore.refreshBalance();
      props.changePaymentsStation(true, "success");
    } else {
      console.log("Ошибка при покупке");
      props.changePaymentsStation(true, "error");
    }
  } catch (error) {
    console.error("error", error);
    loadingPay.value = false;
    props.changePaymentsStation(
      true,
      "error",
      error.response?.data?.message || "Ошибка при покупке"
    );
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

.tariff-content {
  /* padding: 25px; */
}

.tariff-price {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
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
  font-size: 24px;
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
  font-size: 48px;
  font-weight: 700;
  color: #ff3b30;
  line-height: 1;
}

.final-currency {
  font-size: 24px;
  color: #ff3b30;
  font-weight: 600;
}

.discount-badge {
  background: linear-gradient(135deg, #ff3b30 0%, #ff6b6b 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 700;
  margin-top: 5px;
}

.price-without-discount .price-amount {
  font-size: 48px;
  font-weight: 700;
  color: #4a6cf7;
  line-height: 1;
}

.price-without-discount .currency {
  font-size: 24px;
  font-weight: 500;
  color: #4a6cf7;
}

.price-period {
  font-size: 16px;
  color: #666;
  margin-top: 10px;
}

.tariff-features {
  margin-bottom: 30px;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
}

.feature-icon {
  fill: #4a6cf7;
  margin-right: 12px;
  flex-shrink: 0;
}

.buy-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #4a6cf7 0%, #6b8cff 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(74, 108, 247, 0.3);
}

.buy-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 108, 247, 0.4);
  background: linear-gradient(135deg, #3a5ce4 0%, #5b7cff 100%);
}

@media (max-width: 768px) {
  .final-price {
    font-size: 36px;
  }

  .price-without-discount .price-amount {
    font-size: 36px;
  }

  .original-price {
    font-size: 20px;
  }

  .buy-button {
    padding: 14px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .final-price {
    font-size: 32px;
  }

  .price-without-discount .price-amount {
    font-size: 32px;
  }

  .original-price {
    font-size: 18px;
  }

  .discount-badge {
    font-size: 12px;
    padding: 4px 10px;
  }
}
</style>
