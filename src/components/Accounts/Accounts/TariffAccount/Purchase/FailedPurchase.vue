<template>
  <div class="purchase-card error-card">
    <div class="icon-wrapper">
      <svg class="error-icon" viewBox="0 0 52 52">
        <circle class="error-circle" cx="26" cy="26" r="25" />
        <path class="error-cross" fill="none" d="M16 16l20 20 M36 16L16 36" />
      </svg>
    </div>

    <h2 class="title">Оплата не прошла</h2>

    <div class="purchase-details">
      <div class="detail-item">
        <span class="detail-label">Тариф:</span>
        <span class="detail-value">{{ tariff.name }}</span>
      </div>
      <div class="detail-item error-message">
        <span class="detail-label">Ошибка:</span>
        <span class="detail-value">{{ sendError(error) }}</span>
      </div>
    </div>

    <div class="action-buttons">
      <button v-if="balanceError" class="retry-btn" @click="getBalance">
        <span>Пополнить баланс</span>
      </button>
      <button class="close-btn" @click="changeTariffStation">
        <span>Закрыть</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import { ref, computed, toRefs } from "vue";
import axios from "axios";
const apiUrl = import.meta.env.VITE_PAY_URL;

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const props = defineProps({
  tariff: {
    type: Object,
    required: true,
  },
  errorMessage: {
    type: String,
    default: "",
  },
  retry: {
    type: Function,
    required: true,
  },
  close: {
    type: Function,
    required: true,
  },
  error: {
    type: String,
  },
  changeTariffStation: {
    type: Function,
  },
  changeCreatePayments: {
    type: Function,
  },
  changePaymentsStation: {
    type: Function,
  },
  chaneMinimumAmount: {
    type: Function,
  },
});

const { tariff } = toRefs(props);

const paymentUrl = ref();
const userBalance = ref();
const balanceError = ref(false);

const sendError = (error) => {
  if (error === "Balance error") {
    balanceError.value = true;
    return "Недостаточно средств";
  } else {
    return "Ошибка сервера";
  }
};

const getBalance = async () => {
  console.log(tariff.value);
  try {
    const response = await axios.post(
      `${apiUrl}/getUserBalance`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
    console.log(response.data);
    userBalance.value = response.data.balance;

    if (response.data.success) {
      console.log(tariff.value.price - +response.data.balance);

      props.chaneMinimumAmount(tariff.value.price - +response.data.balance);
      props.changeCreatePayments();
    }
  } catch (err) {
    console.error("error", err.response ? err.response.data : err.message);
  }
};

const changePay = () => {
  // props.changePaymentsStation(false, "error");
  props.changeCreatePayments();
};

const createPayment = async (amount) => {
  try {
    const response = await axios.post(
      `${apiUrl}/create_payment`,
      {
        amount: amount,
        currency: "RUB",
        type: "+",
        domain: `https://${window.location.hostname}/Accounts`,
      },
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data.success) {
      paymentUrl.value = response.data.confirmation_url;
      window.location.href = paymentUrl.value;
    }
    console.log(paymentUrl.value);
  } catch (error) {
    console.error("error", error);
  }
};
</script>

<style scoped>
.purchase-card {
  max-width: 420px;
  margin: 0 auto;
  padding: 40px 30px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.error-card {
  border-top: 4px solid #f44336;
}

.icon-wrapper {
  margin: 0 auto 25px;
  width: 80px;
  height: 80px;
}

.error-icon {
  width: 100%;
  height: 100%;
}

.error-circle {
  stroke: #f44336;
  stroke-width: 2;
  fill: none;
  animation: circle-anim 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.error-cross {
  stroke: #f44336;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-miterlimit: 10;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: cross-anim 0.3s 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

@keyframes cross-anim {
  100% {
    stroke-dashoffset: 0;
  }
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #c62828;
  margin-bottom: 25px;
}

.purchase-details {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.error-message {
  color: #c62828;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: #6c757d;
  font-weight: 500;
}

.detail-value {
  color: #212529;
  font-weight: 600;
}

.help-message {
  color: #495057;
  line-height: 1.5;
  margin-bottom: 30px;
  padding: 0 10px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.retry-btn,
.close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn {
  background: #f44336;
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
}

.retry-btn:hover {
  background: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
}

.close-btn {
  background: white;
  color: #495057;
  border: 1px solid #dee2e6;
}

.close-btn:hover {
  background: #f8f9fa;
  border-color: #ced4da;
  transform: translateY(-2px);
}

.retry-btn:active,
.close-btn:active {
  transform: translateY(0);
}
</style>
