<template>
  <div class="referrals-container">
    <header>
      <section class="account-section">
        <h2 class="title">{{ t("referrals.title") }}</h2>
      </section>

      <!-- Блоки статистики сверху -->
      <section class="stats-section">
        <div class="stats-row">
          <!-- Блок доступно (баланс) -->
          <div class="stat-block stat-balance">
            <span class="stat-title">Доступно</span>
            <span class="stat-value">{{
              formatCurrency(statistics.balance || 0)
            }}</span>
          </div>

<<<<<<< HEAD
    <section class="account-section">
      <div class="link-section">
        <span class="link-title">Ваша ссылка для привлечения клиентов</span>
        <button @click="openHelpModal" class="start-earning-button">
          Начать зарабатывать
        </button>
      </div>
      <button @click="copyReferralLink" class="add-account-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <g
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          >
            <path
              d="M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.602-1.43L16.083 2.57A2 2 0 0 0 14.685 2H10a2 2 0 0 0-2 2"
            />
            <path
              d="M16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2"
            />
          </g>
        </svg>
        {{ textButton }}
      </button>
    </section>
  </header>

  <ReferralsList :changeUsersCount="changeUsersCount" />

  <!-- Модальное окно -->
  <HelpModal v-if="showHelpModal" @close="closeHelpModal" />
=======
          <div class="stat-block">
            <span class="stat-title">Привлечено пользователей</span>
            <span class="stat-value">{{ statistics.count || 0 }}</span>
          </div>

          <!-- Реферальная ссылка красивая -->
          <!-- Реферальная ссылка красивая -->
          <div class="stat-block referral-block">
            <div class="referral-content">
              <div class="referral-icon-container">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                  />
                  <path
                    d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                  />
                </svg>
              </div>
              <div class="referral-text">
                <h3 class="referral-title">Приглась друзей</h3>
                <p class="referral-subtitle">
                  Получайте комиссию от каждого пополнения
                </p>
                <button @click="copyReferralLink" class="copy-button-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.602-1.43L16.083 2.57A2 2 0 0 0 14.685 2H10a2 2 0 0 0-2 2"
                    />
                    <path
                      d="M16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2"
                    />
                  </svg>
                  {{ copyButtonText }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- График под блоками -->
      <section class="chart-section">
        <div class="chart-container">
          <h3 class="chart-title">Операции по дням</h3>
          <div class="chart-wrapper">
            <canvas ref="chartCanvas" width="400" height="2000"></canvas>
          </div>
          <div class="chart-legend">
            <label class="legend-item">
              <span class="legend-dot"></span>
              <span class="legend-label">Количество операций</span>
            </label>
          </div>
        </div>
      </section>
    </header>

    <ReferralsList :changeUsersCount="changeUsersCount" />
    <HelpModal v-if="showHelpModal" @close="closeHelpModal" />
  </div>
>>>>>>> dev
</template>

<script setup>
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
import ReferralsList from "./ReferralsList.vue";
import HelpModal from "./HelpModal.vue";
<<<<<<< HEAD
import { ref, onMounted } from "vue";
=======
import { ref, onMounted, nextTick } from "vue";
>>>>>>> dev
import axios from "axios";
import { useI18n } from "vue-i18n";
import Chart from "chart.js/auto";

const { t } = useI18n();

const usersCount = ref(0);
const showHelpModal = ref(false);
<<<<<<< HEAD

const changeUsersCount = (item) => (usersCount.value = item);

const FRONTEND_URL_USERS = import.meta.env.VITE_FRONTEND_URL_USERS;

const textButton = ref(`https://${window.location.hostname}/Registration...`);

// Функции для управления модальным окном
const openHelpModal = () => {
  showHelpModal.value = true;
};

const closeHelpModal = () => {
  showHelpModal.value = false;
};

function decodeJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT token format");
    }

    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    console.log(payload);
    return payload.vendor_id;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}
=======
const statistics = ref({
  balance: 0,
  count: 0,
  chartData: null,
  summary: {},
});
const chartCanvas = ref(null);
let chartInstance = null;
const isLoadingChart = ref(false);
const copyButtonText = ref("Скопировать");

const FRONTEND_URL_USERS = import.meta.env.VITE_FRONTEND_URL_USERS;
const API_URL = "https://api22.developtech.ru/api";
>>>>>>> dev

const refId = ref("");
const refLink = ref(`https://${window.location.hostname}/Registration...`);

const openHelpModal = () => {
  showHelpModal.value = true;
};

const closeHelpModal = () => {
  showHelpModal.value = false;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
  }).format(value);
};

const initChart = () => {
  console.log("🎯 Инициализация графика");

  if (!chartCanvas.value) {
    console.error("❌ Canvas не найден!");
    return;
  }

  if (!statistics.value.chartData) {
    console.error("❌ Нет данных графика!");
    return;
  }

  const data = statistics.value.chartData;

  if (!data.labels || data.labels.length === 0) {
    console.warn("⚠️ Нет меток графика");
    return;
  }

  try {
<<<<<<< HEAD
    const response = await axios.get(`${FRONTEND_URL_USERS}getRefId`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accountStore.accountToken}`,
      },
    });
=======
    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = chartCanvas.value.getContext("2d");

    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Количество операций",
            data: data.datasets[0].data,
            borderColor: "#4f46e5",
            backgroundColor: "rgba(79, 70, 229, 0.08)",
            borderWidth: 2.5,
            tension: 0.3,
            fill: true,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: "#4f46e5",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 10,
            titleFont: { size: 12 },
            bodyFont: { size: 12 },
            borderColor: "#ddd",
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                return "Операций: " + Math.round(context.parsed.y);
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: "#999",
              font: { size: 11 },
              stepSize: 1,
              callback: function (value) {
                if (Number.isInteger(value)) {
                  return value;
                }
                return "";
              },
            },
            grid: {
              color: "rgba(0, 0, 0, 0.04)",
              drawBorder: false,
            },
          },
          x: {
            ticks: {
              color: "#999",
              font: { size: 11 },
            },
            grid: {
              color: "rgba(0, 0, 0, 0.04)",
              drawBorder: false,
            },
          },
        },
      },
    });

    console.log("✅ График инициализирован успешно");
  } catch (error) {
    console.error("❌ Ошибка при инициализации графика:", error);
  }
};

const fetchStatistics = async () => {
  if (isLoadingChart.value) return;

  try {
    isLoadingChart.value = true;
    console.log("📡 Загрузка статистики...");

    const response = await axios.get(
      `${API_URL}/referrals/statistics?days=30`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accountStore.accountToken}`,
        },
      }
    );
>>>>>>> dev

    if (response.data.success) {
      statistics.value = response.data.statistics;
      console.log("✅ Статистика обновлена");

      await nextTick();

      setTimeout(() => {
        initChart();
      }, 500);
    }
  } catch (error) {
    console.error("❌ Ошибка загрузки статистики:", error);
  } finally {
    isLoadingChart.value = false;
  }
};

const getRefId = async () => {
  try {
    const response = await axios.get(`${FRONTEND_URL_USERS}getRefId`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accountStore.accountToken}`,
      },
    });

    if (response.data.ok) {
      refId.value = response.data.data.ref_id;
      refLink.value = `https://${window.location.hostname}/Registration?ref=${refId.value}`;
      console.log("✅ Реферальная ссылка получена");
    }
  } catch (error) {
    console.error("❌ Error getting ref ID:", error);
  }
};

const copyReferralLink = async () => {
  try {
<<<<<<< HEAD
    await navigator.clipboard.writeText(referralLink);
    console.log("Ссылка скопирована в буфер обмена:", referralLink);
    textButton.value = t("referrals.link");
=======
    await navigator.clipboard.writeText(refLink.value);
    copyButtonText.value = "Скопировано!";
    console.log("✅ Ссылка скопирована");

>>>>>>> dev
    setTimeout(() => {
      copyButtonText.value = "Скопировать";
    }, 2000);
  } catch (err) {
<<<<<<< HEAD
    console.error("Не удалось скопировать ссылку:", err);
    const textArea = document.createElement("textarea");
    textArea.value = referralLink;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      console.log("Ссылка скопирована (старый метод)");
    } catch (err) {
      console.error("Не удалось скопировать ссылку (старый метод):", err);
    }
    document.body.removeChild(textArea);
=======
    console.error("❌ Ошибка копирования:", err);
>>>>>>> dev
  }
};

const changeUsersCount = (item) => (usersCount.value = item);

onMounted(() => {
  console.log("🚀 Компонент загружен");
  getRefId();
  fetchStatistics();
});
</script>

<style scoped>
.referrals-container {
  width: 100%;
  min-height: 100vh;
}

header {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  box-sizing: border-box;
}

.account-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
<<<<<<< HEAD
  width: 100%;
}

.link-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 6px;
}

/* Стили для кнопки "Начать зарабатывать" */
.start-earning-button {
  background: transparent;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  padding: 6px 12px;
  color: #3b82f6;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  margin-left: 12px;
}

.start-earning-button:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
}

.start-earning-button:active {
  transform: translateY(0);
}

/* Стили для секции статистики */
.stats-section {
  display: flex;
  gap: 16px;
=======
>>>>>>> dev
  width: 100%;
}

.title {
  font-weight: 500;
  font-size: 22px;
  color: var(--text);
  margin: 0;
}

<<<<<<< HEAD
.link-title {
  font-size: 16px;
  color: #585858;
}

.account {
  font-weight: 700;
  font-size: 18px;
  color: var(--headerAccountText);
  background: var(--headerAccount);
  border-radius: 5px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.account-list-button,
.add-account-button {
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: 0 0 auto;
}

.bi-view-list {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}

.account-list-button {
  background: oklch(0.65 0.22 267 / 0.16);
  font-weight: 600;
  font-size: 12px;
  padding: 10px 12px;
  color: var(--headerAccountButtonColor);
  margin-right: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.25s;
}

.account-list-button:hover {
  background: rgba(0, 13, 255, 0.2);
  transition: all 0.25s;
}

.account-list-button:active {
  background: rgba(17, 21, 93, 0.2);
  transition: all 0.25s;
}

.svg-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.25rem;
  margin-left: -0.25rem;
  fill: currentColor;
}

.add-account-button {
  background: var(--textNavHover);
  font-weight: 400;
  font-size: 14px;
  color: #585858;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  width: 100%;
  justify-content: flex-start;
}

.add-account-button:hover {
  background: #dfdfdf;
  transition: all 0.25s;
}

.add-account-button:active {
  background: rgb(201, 201, 201);
  transition: all 0.25s;
}

.black-fon {
  position: absolute;
  z-index: 5;
=======
.stats-section {
>>>>>>> dev
  width: 100%;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  width: 100%;
}

.stat-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.stat-block.stat-balance {
  background: linear-gradient(135deg, #a8d5ba 0%, #81c7a8 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-block.stat-balance .stat-title {
  color: rgba(255, 255, 255, 0.95);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-block.stat-balance .stat-value {
  color: white;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.1;
}

.stat-block.referral-block {
  background: linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%);
  border: 2px solid #bfdbfe;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.stat-title {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.stat-value {
  font-size: 28px;
  color: var(--text);
  font-weight: 700;
  line-height: 1.1;
  margin: 0;
}

.withdraw-button {
  background: white;
  border: none;
  color: #10b981;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
  margin-top: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.withdraw-button:hover {
  background: #f0fdf4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Реферальная ссылка красивая */
.referral-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
}

.referral-icon-container {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0369a1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-top: 4px;
}

.referral-icon-container svg {
  width: 28px;
  height: 28px;
}

.referral-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.referral-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e40af;
  margin: 0;
  line-height: 1.2;
}

.referral-subtitle {
  font-size: 13px;
  color: #0369a1;
  margin: 0;
  line-height: 1.3;
}

.copy-button-primary {
  background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%);
  border: none;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  align-self: flex-start;
  box-shadow: 0 4px 12px rgba(3, 105, 161, 0.2);
}

.copy-button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(3, 105, 161, 0.3);
}

.copy-button-primary:active {
  transform: translateY(0);
}

/* График под блоками - полная ширина */
.chart-section {
  width: 100%;
  margin-top: 12px;
}

.chart-container {
  background: white;
  border-radius: 14px;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.chart-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 24px 0;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 360px;
  margin-bottom: 24px;
}

.chart-wrapper canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

<<<<<<< HEAD
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.platform {
  padding: 4px;
  transition: all 0.1s;
=======
.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
>>>>>>> dev
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  user-select: none;
  font-weight: 500;
}

.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background-color: #4f46e5;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
}

/* Адаптив */
@media (max-width: 1200px) {
  header {
    padding: 20px;
    gap: 16px;
  }

  .title {
    font-size: 28px;
  }

  .stats-row {
    gap: 14px;
  }

  .stat-block {
    padding: 20px;
  }

  .chart-wrapper {
    height: 320px;
  }

  .chart-container {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  header {
    padding: 16px;
    gap: 14px;
  }

  .title {
    font-size: 24px;
  }

  .stats-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-block {
    padding: 16px;
  }

  .stat-value {
    font-size: 22px;
  }

  .stat-block.stat-balance .stat-value {
    font-size: 24px;
  }

  .referral-content {
    flex-wrap: wrap;
    align-items: stretch;
    gap: 12px;
  }

  .referral-icon-container {
    width: 48px;
    height: 48px;
  }

  .copy-button {
    width: 100%;
    justify-content: center;
    order: 3;
    padding: 12px 16px;
  }

  .chart-wrapper {
    height: 280px;
  }

  .chart-container {
    padding: 16px;
  }

  .chart-title {
    font-size: 18px;
    margin-bottom: 16px;
  }
}

@media (max-width: 480px) {
  header {
    padding: 12px;
    gap: 12px;
  }

  .title {
    font-size: 20px;
  }

  .stats-row {
    gap: 10px;
  }

  .stat-block {
    padding: 14px;
  }

  .stat-title {
    font-size: 11px;
  }

  .stat-value {
    font-size: 18px;
  }

  .withdraw-button {
    padding: 8px 12px;
    font-size: 12px;
  }

  .referral-content {
    gap: 10px;
  }

  .referral-icon-container {
    width: 44px;
    height: 44px;
  }

  .referral-icon-container svg {
    width: 24px;
    height: 24px;
  }

  .referral-title {
    font-size: 14px;
  }

  .referral-subtitle {
    font-size: 12px;
  }

  .copy-button {
    padding: 8px 12px;
    font-size: 11px;
  }

  .chart-wrapper {
    height: 220px;
  }

  .chart-container {
    padding: 12px;
  }

  .chart-title {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .chart-legend {
    gap: 16px;
    padding-top: 12px;
  }

  .link-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .start-earning-button {
    margin-left: 0;
    align-self: flex-start;
  }
}
</style>
