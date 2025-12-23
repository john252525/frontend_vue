<template>
  <div class="black-fon" @click="closeModal"></div>
  <div class="history-modal">
    <div class="modal-header">
      <h2>История уведомлений ({{ item.name }})</h2>
      <button class="close-btn" @click="closeModal">✕</button>
    </div>

    <!-- Фильтры -->
    <div class="filters-container">
      <div class="filters-grid">
        <div class="filter-group">
          <label>Дата от:</label>
          <div class="input-wrapper">
            <svg
              class="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <input
              v-model="filters.date_from"
              type="date"
              @change="resetPage"
            />
          </div>
        </div>

        <div class="filter-group">
          <label>Дата до:</label>
          <div class="input-wrapper">
            <svg
              class="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <input v-model="filters.date_to" type="date" @change="resetPage" />
          </div>
        </div>

        <div class="filter-group">
          <label>На странице:</label>
          <div class="input-wrapper">
            <svg
              class="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <select v-model.number="filters.per_page" @change="resetPage">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        <button class="btn-refresh" @click="fetchHistory">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2-8.83"></path>
          </svg>
          Обновить
        </button>
      </div>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Загрузка данных...</p>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="error-container">
      <div class="error-header">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div class="error-title">{{ error.message }}</div>
      </div>
      <ul v-if="error.errors && error.errors.length" class="error-list">
        <li v-for="(err, index) in error.errors" :key="index">{{ err }}</li>
      </ul>
    </div>

    <!-- ДЕСКТОП: Таблица -->
    <template v-else-if="historyData && historyData.length > 0">
      <div v-if="!isMobile" class="history-table">
        <table>
          <thead>
            <tr>
              <th>UUID</th>
              <th>Номер</th>
              <th>Текст сообщения</th>
              <th>Тип устройства</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="record in historyData"
              :key="record.uuid"
              :class="getRowClass(record)"
            >
              <td>
                <span
                  class="uuid-text"
                  :title="record.uuid"
                  @click="copyToClipboard(record.uuid)"
                >
                  {{ shortenUuid(record.uuid) }}
                </span>
              </td>
              <td>
                <span class="phone">{{ getPhone(record) }}</span>
              </td>
              <td class="text-column" :title="getText(record)">
                {{ getText(record) }}
              </td>
              <td>{{ getDeviceType(record) }}</td>
              <td>
                <span class="status-pill" :class="getStatusClass(record)">
                  {{ getStateText(record) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- МОБИЛКА: Карточки -->
      <div v-else class="history-cards">
        <div
          v-for="record in historyData"
          :key="record.uuid"
          class="history-card"
          :class="getCardClass(record)"
        >
          <div class="card-row">
            <span class="label">UUID</span>
            <span
              class="value uuid-value"
              :title="record.uuid"
              @click="copyToClipboard(record.uuid)"
            >
              {{ shortenUuid(record.uuid) }}
            </span>
          </div>

          <div class="card-row">
            <span class="label">Номер</span>
            <span class="value phone">{{ getPhone(record) }}</span>
          </div>

          <div class="card-row full-width">
            <span class="label">Текст</span>
            <span class="value text-message">{{ getText(record) }}</span>
          </div>

          <div class="card-row">
            <span class="label">Тип</span>
            <span class="value">{{ getDeviceType(record) }}</span>
          </div>

          <div class="card-row">
            <span class="label">Статус</span>
            <span class="value status-pill" :class="getStatusClass(record)">
              {{ getStateText(record) }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="no-data">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <p>Нет данных истории</p>
    </div>

    <!-- Пагинация -->
    <div v-if="historyData && historyData.length > 0" class="pagination">
      <button
        class="btn-page"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Назад
      </button>

      <span class="page-info">
        <span class="page-number">{{ currentPage }}</span>
        <span class="page-divider">/</span>
        <span class="page-total">{{ totalPages }}</span>
      </span>

      <button
        class="btn-page"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        Вперед
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { toRefs, computed, ref, onMounted, watch, onBeforeUnmount } from "vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const props = defineProps({
  changeStationGetHistory: {
    type: Function,
  },
  item: {
    type: Object,
    required: true,
  },
});

const BASE_URL = import.meta.env.VITE_BASE_URL;

const { item } = toRefs(props);

const historyData = ref([]);
const loading = ref(false);
const error = ref(null);
const noSend = ref(null);

const currentPage = ref(1);
const totalPages = ref(1);
const isMobile = ref(window.innerWidth <= 768);

const filters = ref({
  date_from: getDefaultDateFrom(),
  date_to: getDefaultDateTo(),
  per_page: 10,
});

function getDefaultDateFrom() {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().split("T")[0];
}

function getDefaultDateTo() {
  return new Date().toISOString().split("T")[0];
}

// Отслеживание изменения размера окна
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
};

// Парсинг данных
const parseData = (record) => {
  try {
    return typeof record.data === "string"
      ? JSON.parse(record.data)
      : record.data;
  } catch {
    return {};
  }
};

const parseResult = (record) => {
  try {
    return typeof record.result === "string"
      ? JSON.parse(record.result)
      : record.result;
  } catch {
    return {};
  }
};

// Сокращение UUID
const shortenUuid = (uuid) => {
  if (!uuid) return "N/A";
  return uuid.substring(0, 8) + "..." + uuid.substring(uuid.length - 8);
};

// Копирование в буфер обмена
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    console.log("UUID скопирован:", text);
  });
};

// Получение телефона
const getPhone = (record) => {
  const d = parseData(record);
  return d?.target?.value || "N/A";
};

// Получение текста сообщения (полного)
const getText = (record) => {
  const d = parseData(record);
  return d?.message?.text || "N/A";
};

// Получение типа устройства
const getDeviceType = (record) => {
  const r = parseResult(record);

  // Если есть final_source - это приоритетная отправка или обычная
  if (r?.final_source) {
    const source = r.final_source;
    const method = r.send_method || "phone";

    if (source === "whatsapp") return `WhatsApp (${method})`;
    if (source === "max") return `Max (${method})`;
    return `${source} (${method})`;
  }

  // Если это cascade (без final_source), показываем все источники
  if (r?.source_results) {
    const sources = Object.keys(r.source_results).map(
      (s) => s.charAt(0).toUpperCase() + s.slice(1)
    );
    return sources.join(", ") || "Неизвестно";
  }

  return "Неизвестно";
};

// Определение статуса на основе state и result
const getStatusType = (record) => {
  // State 0 - в очереди
  if (record.state == 0) return "wait";

  // State 1 - ошибка в процессе (нет результата)
  if (record.state == 1) return "error";

  if (record.state == -2) return "noSend";
  // State 2 - завершена
  if (record.state == 2) {
    // Если есть результат - проверяем success
    if (record.result) {
      try {
        const r = parseResult(record);
        return r.success === true ? "done" : "error";
      } catch {
        return "error";
      }
    }
    // Без результата - ошибка
    return "error";
  }

  return "wait";
};

// Получение класса статуса
const getStatusClass = (record) => {
  const statusType = getStatusType(record);
  return `status-${statusType}`;
};

// Класс для строки таблицы
const getRowClass = (record) => {
  const statusType = getStatusType(record);
  if (statusType === "done") return "row-success";
  if (statusType === "error") return "row-error";
  return "row-wait";
};

// Класс для карточки
const getCardClass = (record) => {
  const statusType = getStatusType(record);
  if (statusType === "done") return { success: true };
  if (statusType === "error") return { error: true };
  if (statusType === "noSend") return { error: true };
  return { wait: true };
};

// Получение текста статуса
const getStateText = (record) => {
  const statusType = getStatusType(record);
  const r = parseResult(record);

  if (statusType === "wait") {
    return "Ожидание отправки";
  }

  if (statusType === "noSend") {
    return "Не отправлено";
  }

  if (statusType === "error") {
    if (record.state == 1) {
      return "Ошибка обработки";
    }

    // State 2 but failed
    if (r?.final_source) {
      const source = r.final_source;
      if (source === "whatsapp") return "Ошибка WhatsApp";
      if (source === "max") return "Ошибка Max";
      return `Ошибка ${source}`;
    }

    // Cascade failed
    if (r?.source_results) {
      return "Ошибка всех каналов";
    }

    return "Ошибка отправки";
  }

  if (statusType === "done") {
    if (r?.final_source) {
      const source = r.final_source;
      if (source === "whatsapp") return "Отправлено в WhatsApp";
      if (source === "max") return "Отправлено в Max";
      return `Отправлено в ${source}`;
    }
    return "Отправлено";
  }

  return "Неизвестно";
};

// Загрузка истории
const fetchHistory = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await axios.get(`${BASE_URL}/queue/history`, {
      params: {
        type: "uon",
        date_from: filters.value.date_from,
        date_to: filters.value.date_to,
        page: currentPage.value,
        per_page: filters.value.per_page,
      },
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data.ok === false) {
      error.value = {
        message: response.data.message || "Ошибка при загрузке истории",
        errors: response.data.errors || [],
      };
      historyData.value = [];
      totalPages.value = 1;
      return;
    }

    const apiData = response.data.data;
    if (apiData && apiData.data) {
      historyData.value = apiData.data;
      totalPages.value = apiData.pagination?.pages || 1;
    } else {
      historyData.value = [];
      totalPages.value = 1;
    }
  } catch (err) {
    error.value = {
      message:
        err.response?.data?.message ||
        err.message ||
        "Ошибка при загрузке истории",
      errors: err.response?.data?.errors || [],
    };
    console.error("Error fetching history:", err);
  } finally {
    loading.value = false;
  }
};

const resetPage = () => {
  currentPage.value = 1;
  fetchHistory();
};

const closeModal = () => {
  if (props.changeStationGetHistory) {
    props.changeStationGetHistory();
  }
};

watch(currentPage, () => {
  fetchHistory();
});

onMounted(() => {
  fetchHistory();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.black-fon {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9;
  cursor: pointer;
}

.history-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  max-height: 85vh;
  width: 90%;
  max-width: 1200px;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #ccc;
  transition: color 0.3s, transform 0.2s;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #666;
  transform: scale(1.1);
}

/* Фильтры */
.filters-container {
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fb 0%, #f0f4f8 100%);
  border-radius: 10px;
  border: 1px solid #e8eef5;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .icon {
  position: absolute;
  left: 12px;
  width: 18px;
  height: 18px;
  color: #999;
  pointer-events: none;
  stroke-width: 2;
}

.filter-group input,
.filter-group select {
  padding: 10px 12px 10px 40px;
  border: 2px solid #e0e6f0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background-color: white;
  transition: all 0.3s;
  color: #333;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  background-color: #fbfcfd;
}

.filter-group input::placeholder {
  color: #999;
}

.btn-refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s;
  height: 38px;
}

.btn-refresh svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.btn-refresh:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.btn-refresh:active {
  transform: translateY(0);
}

/* Таблица для десктопа */
.history-table {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 20px;
  flex: 1;
  border-radius: 8px;
  border: 1px solid #e8eef5;
}

.history-table table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  padding: 14px 16px;
  text-align: left;
  font-size: 14px;
  border-bottom: 1px solid #f0f0f0;
}

.history-table th {
  font-weight: 700;
  color: #666;
  background-color: #f8f9fb;
  white-space: nowrap;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.history-table tr.row-success {
  background-color: #f1f8f4;
}

.history-table tr.row-error {
  background-color: #fdf6f6;
}

.history-table tr.row-wait {
  background-color: #fffbf0;
}

.history-table tr:hover {
  background-color: #f9f9f9;
}

.history-table tr.row-success:hover {
  background-color: #e8f5e9;
}

.history-table tr.row-error:hover {
  background-color: #ffebee;
}

.history-table tr.row-wait:hover {
  background-color: #fff8e1;
}

.uuid-text {
  cursor: pointer;
  font-family: "Monaco", "Courier New", monospace;
  font-size: 12px;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  display: inline-block;
  user-select: none;
}

.uuid-text:hover {
  background-color: #e3f2fd;
  font-weight: 500;
}

.text-column {
  max-width: 250px;
  word-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
  color: #333;
}

.phone {
  white-space: nowrap;
  font-weight: 500;
}

/* Статусные плашки */
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-wait {
  background-color: #fff4cf;
  color: #b76a00;
}

.status-noSend {
  background-color: #f3e5f5;
  color: #6a1b9a;
}

.status-done {
  background-color: #e6f6ec;
  color: #1b7a35;
}

.status-error {
  background-color: #fde7e7;
  color: #c62828;
}

/* Карточки для мобилы */
.history-cards {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.history-card {
  border-radius: 10px;
  border: 2px solid #e8eef5;
  padding: 16px;
  background: white;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.history-card.success {
  border-left-width: 5px;
  border-left-color: #4caf50;
  background-color: #f1f8f4;
}

.history-card.error {
  border-left-width: 5px;
  border-left-color: #f44336;
  background-color: #fdf6f6;
}

.history-card.wait {
  border-left-width: 5px;
  border-left-color: #ffc107;
  background-color: #fffbf0;
}

.history-card:active {
  transform: translateY(1px);
}

.card-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  align-items: flex-start;
}

.card-row.full-width {
  flex-wrap: wrap;
}

.card-row:last-child {
  margin-bottom: 0;
}

.card-row .label {
  font-size: 12px;
  color: #888;
  font-weight: 700;
  min-width: 70px;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.card-row .value {
  font-size: 14px;
  color: #222;
  text-align: right;
  flex: 1;
  word-break: break-word;
  overflow-wrap: break-word;
  font-weight: 500;
}

.card-row.full-width .value {
  flex-basis: 100%;
  text-align: left;
  margin-top: 6px;
}

.uuid-value {
  cursor: pointer;
  font-family: "Monaco", "Courier New", monospace;
  font-size: 12px;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  user-select: none;
  text-align: right !important;
}

.uuid-value:active {
  background-color: #e3f2fd;
}

.text-message {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
  color: #333;
}

/* Пагинация */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding-top: 20px;
  border-top: 2px solid #f0f0f0;
  margin-top: auto;
}

.btn-page {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 20px;
  background-color: #f5f7fb;
  border: 2px solid #e0e6f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 600;
  color: #555;
}

.btn-page svg {
  width: 16px;
  height: 16px;
  stroke-width: 2.5;
}

.btn-page:hover:not(:disabled) {
  background-color: #e8eef5;
  border-color: #1976d2;
  color: #1976d2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15);
}

.btn-page:active:not(:disabled) {
  transform: translateY(0);
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 15px;
  font-weight: 600;
  color: #555;
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-number {
  color: #1976d2;
  font-weight: 700;
}

.page-divider {
  color: #ccc;
}

.page-total {
  color: #999;
}

/* Статусы */
.loading {
  padding: 60px 30px;
  text-align: center;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #1976d2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading p {
  font-weight: 500;
}

.no-data {
  padding: 60px 30px;
  text-align: center;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.no-data svg {
  width: 60px;
  height: 60px;
  stroke-width: 1.5;
  opacity: 0.5;
}

.no-data p {
  font-size: 16px;
  font-weight: 500;
}

.error-container {
  padding: 24px;
  background: linear-gradient(135deg, #fdf6f6 0%, #ffebee 100%);
  border: 2px solid #ffcdd2;
  border-radius: 10px;
  margin-bottom: 20px;
}

.error-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.error-header svg {
  width: 24px;
  height: 24px;
  color: #d32f2f;
  flex-shrink: 0;
  margin-top: 2px;
}

.error-title {
  color: #d32f2f;
  font-weight: 700;
  font-size: 15px;
}

.error-list {
  list-style: none;
  padding: 0;
  margin: 0;
  padding-left: 36px;
}

.error-list li {
  color: #c62828;
  padding: 6px 0;
  font-size: 14px;
  font-weight: 500;
}

.error-list li:before {
  content: "•";
  margin-right: 8px;
  font-weight: 700;
}

/* Адаптивность */
@media (max-width: 768px) {
  .history-modal {
    padding: 20px;
    max-width: 95%;
    max-height: 90vh;
  }

  .modal-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
  }

  .modal-header h2 {
    font-size: 18px;
  }

  .filters-container {
    padding: 16px;
    margin-bottom: 20px;
  }

  .filters-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .filter-group input,
  .filter-group select {
    padding: 10px 12px 10px 40px;
    font-size: 14px;
  }

  .btn-refresh {
    padding: 10px 20px;
    font-size: 13px;
    width: 100%;
  }

  .history-table {
    display: none;
  }

  .history-cards {
    display: flex;
  }

  .card-row .label {
    min-width: 60px;
    font-size: 11px;
  }

  .card-row .value {
    font-size: 13px;
  }

  .pagination {
    gap: 12px;
    flex-wrap: wrap;
  }

  .btn-page {
    padding: 8px 16px;
    font-size: 13px;
    flex: 1;
    min-width: 80px;
  }
}

@media (min-width: 769px) {
  .history-cards {
    display: none !important;
  }
}
</style>
