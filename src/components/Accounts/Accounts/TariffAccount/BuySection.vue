<template>
  <div class="buy-section">
    <div class="modal-header">
      <button class="back-button" @click="close">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
        Назад к тарифам
      </button>
      <h2>Оформление подписки</h2>
    </div>

    <Loading v-if="loadingPay" />

    <div v-else class="modal-body-scroll">
      <div class="tariff-content">
        <div class="tariff-card">
          <div class="tariff-header">
            <div class="tariff-badges">
              <span class="tariff-name">{{ selectTariff.name }}</span>
              <div v-if="appliedPromo || hasDiscount" class="discount-badge">
                -{{ discountDisplay }}%
              </div>
            </div>
            <div class="tariff-period">
              на {{ getPeriodText(selectTariff.period) }}
            </div>
          </div>

          <!-- Блок промокода -->
          <div class="promo-section">
            <div class="promo-input-group">
              <input
                v-model="promoCodeInput"
                type="text"
                placeholder="Введите промокод"
                class="promo-input"
                :disabled="promoApplied"
                @keyup.enter="applyPromo"
              />
              <button
                class="promo-apply-btn"
                :disabled="
                  !promoCodeInput.trim() || promoLoading || promoApplied
                "
                @click="applyPromo"
              >
                {{
                  promoApplied
                    ? "Применён"
                    : promoLoading
                      ? "Проверка..."
                      : "Применить"
                }}
              </button>
            </div>

            <div v-if="promoError" class="promo-error">
              {{ promoError }}
            </div>
            <div v-if="promoSuccessMessage" class="promo-success">
              {{ promoSuccessMessage }}
            </div>
          </div>

          <div class="price-section">
            <div class="price-with-discount" v-if="appliedPromo || hasDiscount">
              <div class="original-price">
                {{ formatPrice(originalPrice) }} {{ selectTariff.currency }}
              </div>
              <div class="final-price">
                {{ formatPrice(finalPrice) }} {{ selectTariff.currency }}
              </div>
            </div>
            <div v-else class="price-regular">
              {{ formatPrice(finalPrice) }} {{ selectTariff.currency }}
            </div>
          </div>

          <div class="limits-section" v-if="selectTariff.limits">
            <h4>Что включено:</h4>
            <div class="limits-grid">
              <div class="limit-item">
                <div class="limit-icon">💬</div>
                <div class="limit-info">
                  <span class="limit-value">{{
                    formatLimit(selectTariff.limits.dialogs)
                  }}</span>
                  <span class="limit-label">диалогов</span>
                </div>
              </div>
              <div class="limit-item">
                <div class="limit-icon">📨</div>
                <div class="limit-info">
                  <span class="limit-value">{{
                    formatLimit(selectTariff.limits.messages)
                  }}</span>
                  <span class="limit-label">сообщений</span>
                </div>
              </div>
              <div class="limit-item" v-if="selectTariff.limits.write_first">
                <div class="limit-icon">👆</div>
                <div class="limit-info">
                  <span class="limit-value">Да</span>
                  <span class="limit-label">первое сообщение</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bonuses-section" v-if="hasBonuses">
            <h4>🎁 Ваши бонусы:</h4>
            <div class="bonuses-list">
              <div
                v-for="bonus in activeBonuses"
                :key="bonus.mod_id"
                class="bonus-item"
              >
                <div class="bonus-icon">+</div>
                <div class="bonus-text">
                  {{ getBonusDescription(bonus) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loadingPay" class="purchase-section">
      <div class="total-price">
        <span class="total-label">К оплате:</span>
        <span class="total-amount">
          {{ formatPrice(finalPrice) }} {{ selectTariff.currency }}
        </span>
      </div>

      <button class="buy-button" @click="buyTariff" :disabled="loadingPay">
        <span class="button-text">Оплатить подписку</span>
        <span class="button-price">
          {{ formatPrice(finalPrice) }} {{ selectTariff.currency }}
        </span>
      </button>

      <div class="security-notice">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path
            d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"
          />
        </svg>
        <span>Платежи защищены SSL-шифрованием</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRefs } from "vue";
import axios from "axios";
import Loading from "./Loading.vue";
import { useAccountStore } from "@/stores/accountStore";
import { useBalanceStore } from "@/stores/balanceStore";

const accountStore = useAccountStore();
const balanceStore = useBalanceStore();

const token = computed(() => accountStore.getAccountToken);
const apiUrl = import.meta.env.VITE_PAY_URL; // или ваш URL для промокодов

const props = defineProps({
  selectTariff: { type: Object, required: true },
  close: { type: Function, required: true },
  changePaymentsStation: { type: Function },
  selectedItem: { type: Object },
});

const { selectTariff, selectedItem } = toRefs(props);

const loadingPay = ref(false);
const promoCodeInput = ref("");
const promoApplied = ref(false);
const promoLoading = ref(false);
const promoError = ref("");
const promoSuccessMessage = ref("");
const appliedPromo = ref(null); // объект с данными промокода {discount, type, ...}

// ─── Вычисляемые цены ──────────────────────────────────────
const originalPrice = computed(() => {
  return selectTariff.value.final_price &&
    selectTariff.value.final_price < selectTariff.value.price
    ? selectTariff.value.price
    : selectTariff.value.price;
});

const baseFinalPrice = computed(() => {
  return selectTariff.value.final_price ?? selectTariff.value.price;
});

const promoDiscount = computed(() => appliedPromo.value?.discount || 0);

const finalPrice = computed(() => {
  return Math.max(0, baseFinalPrice.value - promoDiscount.value);
});

const totalDiscount = computed(() => {
  const baseDiscount = originalPrice.value - baseFinalPrice.value;
  return baseDiscount + promoDiscount.value;
});

const discountPercent = computed(() => {
  if (originalPrice.value <= 0) return 0;
  return Math.round((totalDiscount.value / originalPrice.value) * 100);
});

const discountDisplay = computed(() => {
  return discountPercent.value > 0 ? discountPercent.value : "";
});

const hasDiscount = computed(() => discountPercent.value > 0);

const hasBonuses = computed(() => {
  return selectTariff.value.bonuses && selectTariff.value.bonuses.length > 0;
});

const activeBonuses = computed(() => {
  if (!selectTariff.value.bonuses) return [];
  return selectTariff.value.bonuses.filter((b) => b.multiplier > 0);
});

// ─── Функции форматирования ────────────────────────────────
const formatPrice = (price) =>
  new Intl.NumberFormat("ru-RU").format(Math.round(price));
const formatLimit = (limit) =>
  limit === -1 ? "∞" : new Intl.NumberFormat("ru-RU").format(limit);

const getPeriodText = (period) => {
  const map = {
    "1d": "1 день",
    "7d": "7 дней",
    "14d": "14 дней",
    "30d": "30 дней",
    "1m": "1 месяц",
    "3m": "3 месяца",
    "6m": "6 месяцев",
    "12m": "12 месяцев",
    "1y": "1 год",
  };
  return map[period] || period;
};

const getBonusDescription = (bonus) => {
  if (bonus.multiplier === 0) return "Бонус недоступен";
  const period = getPeriodText(bonus.tariff_period || "1m");
  const mult = bonus.multiplier > 1 ? `${bonus.multiplier} × ` : "";
  return `${mult}${bonus.tariff_code} на ${period}`;
};

const applyPromo = async () => {
  const code = promoCodeInput.value.trim().toUpperCase();
  if (!code) return;

  promoLoading.value = true;
  promoError.value = "";
  promoSuccessMessage.value = "";

  try {
    const res = await axios.post(
      `https://api22.developtech.ru/validate`, // ← ваш эндпоинт валидации промокода
      { code, amount: baseFinalPrice.value },
      { headers: { Authorization: `Bearer ${token.value}` } },
    );

    if (res.data.valid) {
      appliedPromo.value = {
        code,
        discount: res.data.discount,
        type: res.data.discount_type,
      };
      promoApplied.value = true;
      promoSuccessMessage.value = `Промокод применён! Скидка ${formatPrice(res.data.discount)} ${selectTariff.value.currency}`;
      promoCodeInput.value = code; // оставляем код в поле
    } else {
      promoError.value = res.data.message || "Промокод не действителен";
      appliedPromo.value = null;
      promoApplied.value = false;
    }
  } catch (err) {
    promoError.value =
      err.response?.data?.message || "Ошибка проверки промокода";
    console.error(err);
  } finally {
    promoLoading.value = false;
  }
};

// ─── Покупка тарифа ────────────────────────────────────────
const buyTariff = async () => {
  loadingPay.value = true;

  try {
    const encodedTariff = encodeTariff(
      selectTariff.value.code,
      selectTariff.value.id,
    );

    const payload = {
      amount: baseFinalPrice.value, // оригинальная сумма тарифа
      tariff_id: selectTariff.value.id,
      tariff: encodedTariff,
      currency: selectTariff.value.currency,
      domain: window.location.hostname,
      entity: "vendor",
      category: "tariff",
      entity_uuid: selectedItem.value.uuid,
      original_price: originalPrice.value,
      discount_percent: discountPercent.value,
      promo_code: appliedPromo.value?.code || null, // ← передаём промокод
    };

    const response = await axios.post(`${apiUrl}/buy`, payload, {
      headers: { Authorization: `Bearer ${token.value}` },
    });

    if (response.data.success) {
      await balanceStore.refreshBalance();
      props.changePaymentsStation(true, "success");
    } else {
      props.changePaymentsStation(true, "error");
    }
  } catch (error) {
    console.error("Ошибка покупки:", error);
    props.changePaymentsStation(
      true,
      "error",
      error.response?.data?.message || "Ошибка при покупке тарифа",
    );
  } finally {
    loadingPay.value = false;
  }
};

const encodeTariff = (code, id) => {
  try {
    const prefix = "tariff_";
    const ts = Date.now();
    const salt = Math.random().toString(36).slice(2, 8);
    const str = `${prefix}${code}|${id}|${ts}|${salt}`;
    const step1 = btoa(unescape(encodeURIComponent(str)));
    return btoa(
      unescape(encodeURIComponent(step1.split("").reverse().join(""))),
    );
  } catch (e) {
    console.error("Encode error:", e);
    throw new Error("Не удалось закодировать тариф");
  }
};
</script>

<style scoped>
/* ОСНОВНОЙ КОНТЕЙНЕР: Растягиваем на всю высоту и запрещаем внешний скролл */
.buy-section {
  height: 100%;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Это убирает основной скролл */
  background: white;
}

/* ШАПКА: Фиксирована сверху */
.modal-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

/* ТЕЛО: Только эта часть будет скроллиться, если контента много */
.modal-body-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  /* Плавный скролл для мобилок */
  -webkit-overflow-scrolling: touch;
}

/* Кастомизация скроллбара для красоты */
.modal-body-scroll::-webkit-scrollbar {
  width: 6px;
}
.modal-body-scroll::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 10px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.back-button:hover {
  background: #f5f5f5;
  color: #333;
}

.back-button svg {
  fill: currentColor;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.tariff-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tariff-card {
  background: white;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tariff-header {
  margin-bottom: 20px;
}

.tariff-badges {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.tariff-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.discount-badge {
  background: linear-gradient(135deg, #ff3b30 0%, #ff6b6b 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

.tariff-period {
  font-size: 14px;
  color: #666;
}

.price-section {
  text-align: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9ff;
  border-radius: 8px;
}

.price-with-discount {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.original-price {
  font-size: 16px;
  text-decoration: line-through;
  color: #9e9e9e;
  font-weight: 500;
}

.final-price {
  font-size: 32px;
  font-weight: 700;
  color: #ff3b30;
  line-height: 1;
}

.price-regular {
  font-size: 32px;
  font-weight: 700;
  color: #6732ff;
  line-height: 1;
}

.limits-section h4,
.bonuses-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.limits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.limit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
}

.limit-icon {
  font-size: 16px;
}

.limit-info {
  display: flex;
  flex-direction: column;
}

.limit-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.limit-label {
  font-size: 11px;
  color: #666;
}

.bonuses-section {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.bonuses-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bonus-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f0fff4;
  border-radius: 6px;
  border: 1px solid #e8f5e8;
}

.bonus-icon {
  color: #4caf50;
  font-weight: 700;
  font-size: 14px;
}

.bonus-text {
  font-size: 13px;
  color: #2e7d32;
  font-weight: 500;
}

.promo-section {
  margin: 16px 0;
  padding: 16px;
  background: #f8f9ff;
  border-radius: 12px;
  border: 1px solid #e0e0ff;
}

.promo-input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.promo-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d0d0d0;
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.promo-input:focus {
  border-color: #6732ff;
  box-shadow: 0 0 0 3px rgba(103, 50, 255, 0.1);
}

.promo-apply-btn {
  padding: 0 20px;
  background: #6732ff;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.promo-apply-btn:hover:not(:disabled) {
  background: #8a63ff;
  transform: translateY(-1px);
}

.promo-apply-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.promo-error {
  color: #d32f2f;
  font-size: 13px;
  margin-top: 8px;
}

.promo-success {
  color: #2e7d32;
  font-size: 13px;
  margin-top: 8px;
  font-weight: 500;
}

/* ФУТЕР: Фиксирован снизу */
.purchase-section {
  flex-shrink: 0;
  margin-top: auto;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #eaeaea;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.03);
}

.total-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.total-label {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.total-amount {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
}

.buy-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #6732ff 0%, #8a63ff 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(103, 50, 255, 0.3);
}

.buy-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(103, 50, 255, 0.4);
}

.button-text {
  font-size: 15px;
}

.button-price {
  font-size: 15px;
  font-weight: 700;
}

.security-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  font-size: 12px;
  color: #666;
}

.security-notice svg {
  fill: #4caf50;
}

@media (max-width: 768px) {
  .modal-header {
    flex-direction: row; /* Оставил в ряд, чтобы не съедало высоту */
    justify-content: space-between;
  }

  .modal-body-scroll {
    padding: 16px;
  }

  .tariff-card {
    padding: 16px;
  }

  .final-price,
  .price-regular {
    font-size: 28px;
  }

  .limits-grid {
    grid-template-columns: 1fr;
  }

  .buy-button {
    padding: 14px;
  }
}
</style>
