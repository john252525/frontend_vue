<template>
  <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
    <div class="modal-container">
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

      <div class="tariffs-container">
        <div
          class="tariff-card"
          v-for="tariff in displayedTariffs"
          :key="tariff.id"
          @mouseenter="hoverIndex = tariff.id"
          @mouseleave="hoverIndex = -1"
          :style="cardStyle(tariff.id)"
        >
          <div class="tariff-header">
            <h3>{{ tariff.name }}</h3>
            <div class="price">
              <span class="amount">{{ tariff.price }}</span>
              <span class="currency">{{ tariff.currency }}</span>
              <span class="period">/{{ getPeriodText(tariff.period) }}</span>
            </div>
            <div v-if="isPopular(tariff)" class="popular-badge">Выгодно</div>
          </div>
          <div class="tariff-features">
            <div class="feature" v-if="tariff.limits">
              <svg class="feature-icon" viewBox="0 0 24 24">
                <path
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                />
              </svg>
              <span>{{ tariff.limits }}</span>
            </div>
            <div class="feature">
              <svg class="feature-icon" viewBox="0 0 24 24">
                <path
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                />
              </svg>
              <span>Доступ на {{ getPeriodText(tariff.period) }}</span>
            </div>
          </div>
          <button
            class="select-button"
            :class="{ 'hover-effect': hoverIndex === tariff.id }"
          >
            Выбрать тариф
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const showModal = ref(true);
const hoverIndex = ref(-1);
const props = defineProps({
  tariffsData: {
    type: Array,
    default: () => [],
  },
});

const displayedTariffs = computed(() => {
  return props.tariffsData.map((tariff) => ({
    ...tariff.data,
    id: tariff.data.id || Math.random().toString(36).substring(2, 9),
  }));
});

const getPeriodText = (period) => {
  const periods = {
    "1m": "1 месяц",
    "3m": "3 месяца",
    "6m": "6 месяцев",
    "12m": "1 год",
  };
  return periods[period] || period;
};

const isPopular = (tariff) => {
  // Помечаем как популярный тариф с самым длительным периодом
  const periodsOrder = ["1m", "3m", "6m", "12m"];
  const maxPeriod = Math.max(
    ...displayedTariffs.value.map((t) => periodsOrder.indexOf(t.period))
  );
  return periodsOrder.indexOf(tariff.period) === maxPeriod;
};

const cardStyle = (id) => {
  if (hoverIndex.value === id) {
    return {
      transform: "translateY(-5px)",
      boxShadow: "0 10px 20px oklch(0.65 0.22 267 / 0.16)",
    };
  }
  return {};
};

const closeModal = () => {
  showModal.value = false;
};

defineExpose({
  openModal: () => (showModal.value = true),
  closeModal,
});
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
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 25px;
  position: relative;
  animation: slideUp 0.4s ease;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  font-size: 24px;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-button:hover {
  background: #f5f5f5;
}

.close-button svg {
  fill: #666;
}

.tariffs-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.tariff-card {
  position: relative;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px oklch(0.65 0.22 267 / 0.08);
  transition: all 0.3s ease;
  border: 1px solid oklch(0.65 0.22 267 / 0.08);
}

.tariff-header {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
}

.tariff-header h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 12px;
  font-weight: 600;
}

.price {
  margin-bottom: 15px;
}

.amount {
  font-size: 28px;
  font-weight: 700;
  color: oklch(0.65 0.22 267);
}

.currency {
  font-size: 16px;
  margin-left: 3px;
  color: #666;
}

.period {
  display: block;
  font-size: 14px;
  color: #888;
  margin-top: 3px;
}

.popular-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: oklch(0.65 0.22 267);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tariff-features {
  margin: 20px 0;
}

.feature {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #555;
}

.feature-icon {
  width: 16px;
  height: 16px;
  fill: oklch(0.65 0.22 267);
  margin-right: 8px;
  flex-shrink: 0;
}

.select-button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: oklch(0.65 0.22 267);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-button.hover-effect {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px oklch(0.65 0.22 267 / 0.3);
}

.select-button:active {
  transform: translateY(1px);
}

/* Анимации */
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

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    padding: 15px;
  }

  .tariffs-container {
    grid-template-columns: 1fr;
  }

  .tariff-card {
    width: 100%;
  }
}
</style>
