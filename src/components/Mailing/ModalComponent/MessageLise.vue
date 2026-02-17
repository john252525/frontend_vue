<template>
  <div class="modal-overlay" @click="changeStationMessage">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Сообщения рассылки</h2>
        <button
          class="close-button"
          @click="changeStationMessage"
          aria-label="Закрыть"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 32 32"
          >
            <path
              fill="currentColor"
              d="M17.414 16L24 9.414L22.586 8L16 14.586L9.414 8L8 9.414L14.586 16L8 22.586L9.414 24L16 17.414L22.586 24L24 22.586z"
            />
          </svg>
        </button>
      </div>
      ``
      <div class="modal-content">
        <div
          class="filters-bar"
          v-if="!loadingMessge && !errorMessage && mailingLists.length > 0"
        >
          <div class="search-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              class="search-icon"
            >
              <path
                fill="currentColor"
                d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
              />
            </svg>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Поиск по тексту или номеру..."
              class="filter-input"
            />
          </div>
        </div>

        <div class="scrollable-area">
          <div v-if="loadingMessge" class="loading-container">
            <div class="spinner"></div>
            <p>Загрузка сообщений...</p>
          </div>

          <div v-else-if="errorMessage" class="error-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              class="error-icon"
            >
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              />
            </svg>
            <h3>Ошибка загрузки данных</h3>
            <button class="retry-button" @click="getMessages">
              Попробовать снова
            </button>
          </div>

          <div v-else-if="mailingLists.length === 0" class="empty-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              class="empty-icon"
            >
              <path
                fill="currentColor"
                d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"
              />
            </svg>
            <h3>Сообщения отсутствуют</h3>
          </div>

          <div v-else-if="paginatedList.length === 0" class="empty-container">
            <h3>Ничего не найдено</h3>
          </div>

          <template v-else>
            <table class="messages-table desktop-view">
              <thead class="table-header">
                <tr>
                  <th class="column-id">ID</th>
                  <th class="column-number">Номер</th>
                  <th v-if="getVersion === 1" class="column-text">
                    Текст сообщения
                  </th>
                  <th class="column-status">Статус</th>
                </tr>
              </thead>
              <tbody class="table-body">
                <tr
                  v-for="item in paginatedList"
                  :key="item.id"
                  class="table-row"
                >
                  <td class="cell-id">
                    <span class="id-badge">#{{ item.id }}</span>
                  </td>
                  <td class="cell-number">
                    <div class="number-wrapper">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        class="phone-icon"
                      >
                        <path
                          fill="currentColor"
                          d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24c1.12.37 2.33.57 3.57.57c.55 0 1 .45 1 1V20c0 .55-.45 1-1 1c-9.39 0-17-7.61-17-17c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02l-2.2 2.2z"
                        />
                      </svg>
                      {{ item.to }}
                    </div>
                  </td>
                  <td
                    v-if="getVersion === 1"
                    class="cell-text"
                    :title="item.text"
                  >
                    <div class="text-truncate">{{ item.text }}</div>
                  </td>
                  <td class="cell-status">
                    <span :class="['status-badge', `status-${item.state}`]">
                      {{ getStatusText(item.state) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="mobile-cards mobile-view">
              <div
                v-for="item in paginatedList"
                :key="item.id"
                class="message-card"
              >
                <div class="card-header">
                  <span class="id-badge">#{{ item.id }}</span>
                  <span :class="['status-badge', `status-${item.state}`]">
                    {{ getStatusText(item.state) }}
                  </span>
                </div>
                <div class="card-content-inner">
                  <div class="card-field">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      class="phone-icon"
                    >
                      <path
                        fill="currentColor"
                        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24c1.12.37 2.33.57 3.57.57c.55 0 1 .45 1 1V20c0 .55-.45 1-1 1c-9.39 0-17-7.61-17-17c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02l-2.2 2.2z"
                      />
                    </svg>
                    <span class="card-label">Номер:</span>
                    <span class="card-value">{{ item.to }}</span>
                  </div>
                  <div v-if="getVersion === 1" class="card-field">
                    <span class="card-label">Текст:</span>
                    <span class="card-value card-text">{{ item.text }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="pagination-container" v-if="filteredList.length > 0">
          <div class="pagination-info">Всего: {{ filteredList.length }}</div>
          <div class="pagination-controls">
            <button
              class="page-btn"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
                />
              </svg>
            </button>
            <span class="page-current"
              >{{ currentPage }} / {{ totalPages }}</span
            >
            <button
              class="page-btn"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                />
              </svg>
            </button>
          </div>
          <select v-model="itemsPerPage" class="limit-select">
            <option :value="10">10 / стр.</option>
            <option :value="20">20 / стр.</option>
            <option :value="50">50 / стр.</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
</template>

<script setup>
import { ref, reactive, onMounted, computed, toRefs, watch } from "vue";
import axios from "axios";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";
import { useRouter } from "vue-router";
import { useMailingVersion } from "@/stores/mailingVersion";
import { useAccountStore } from "@/stores/accountStore";

const mailingVersion = useMailingVersion();
const accountStore = useAccountStore();
const router = useRouter();

const props = defineProps({
  selectedItem: Object,
  changeInfoMailing: Function,
  changeStationMessage: Function,
});

const { selectedItem } = toRefs(props);
const getVersion = computed(() => mailingVersion.getVersion);
const token = computed(() => accountStore.getAccountToken);

const mailingLists = ref([]);
const errorMessage = ref(false);
const loadingMessge = ref(true);
const errorBlock = ref(false);

const filters = reactive({ search: "" });
const currentPage = ref(1);
const itemsPerPage = ref(10);

const statusMap = {
  0: "Ожидание",
  1: "Отправлено",
  2: "Ошибка",
  3: "Доставлено",
  4: "Прочитано",
};

const getStatusText = (state) => statusMap[state] || "Неизвестно";

const filteredList = computed(() => {
  if (!filters.search) return mailingLists.value;
  const s = filters.search.toLowerCase();
  return mailingLists.value.filter(
    (i) => i.text.toLowerCase().includes(s) || String(i.to).includes(s),
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredList.value.length / itemsPerPage.value)),
);
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredList.value.slice(start, start + itemsPerPage.value);
});

watch([() => filters.search, itemsPerPage], () => (currentPage.value = 1));

const getMessages = async () => {
  const apiUrl = import.meta.env.VITE_WHATSAPI_URL;
  loadingMessge.value = true;
  errorMessage.value = false;
  try {
    const res = await axios.get(`${apiUrl}/view/${selectedItem.value.id}/`, {
      params: { version: getVersion.value, limit: 500, offset: 0 },
      headers: { Authorization: `Bearer ${token.value}` },
    });
    if (res.data.ok) {
      mailingLists.value = res.data.result.items;
    } else {
      errorMessage.value = true;
    }
  } catch (e) {
    errorMessage.value = true;
  } finally {
    loadingMessge.value = false;
  }
};

onMounted(getMessages);
const chaneErrorBlock = () => (errorBlock.value = !errorBlock.value);
</script>

<style scoped>
/* --- Основа модального окна --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background: #ffffff;
  border-radius: 12px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 1000px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleIn 0.2s ease;
}

/* --- Шапка --- */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  background: #ffffff;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.message-count {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: normal;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 12px;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: #9ca3af;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #111827;
}

/* --- Контентная область --- */
.modal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 24px;
  min-height: 0;
}

/* Фильтр (Поиск) */
.filters-bar {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

.filter-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* --- Зона скролла (Таблица) --- */
.scrollable-area {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  position: relative;
}

.messages-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.table-header th {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f9fafb;
  padding: 12px 16px;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
}

.table-row {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.1s;
}

.table-row:hover {
  background-color: #f9fafb;
}

.table-row td {
  padding: 14px 16px;
  font-size: 0.875rem;
  vertical-align: middle;
}

/* Колонки */
.column-id {
  width: 80px;
}

.column-number {
  width: 150px;
}

.column-status {
  width: 160px;
}

.id-badge {
  background: #f3f4f6;
  color: #374151;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.number-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;
}

.phone-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #4b5563;
}

/* Статусы */
.status-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-0 {
  background: #fef3c7;
  color: #92400e;
} /* Ожидание */
.status-1 {
  background: #dcfce7;
  color: #166534;
} /* Отправлено */
.status-2 {
  background: #fee2e2;
  color: #991b1b;
} /* Ошибка */
.status-3 {
  background: #dbeafe;
  color: #1e40af;
} /* Доставлено */
.status-4 {
  background: #e0e7ff;
  color: #3730a3;
} /* Прочитано */

/* --- Пагинация --- */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  flex-shrink: 0;
  gap: 12px;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-current {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  min-width: 60px;
  text-align: center;
}

.limit-select {
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

/* --- Состояния загрузки и ошибок --- */
.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

/* --- Адаптивность --- */
@media (max-width: 768px) {
  .modal-container {
    height: 95vh;
    border-radius: 14px;
  }

  .desktop-view {
    display: none;
  }
  .mobile-view {
    display: block;
  }

  .mobile-cards {
    padding: 8px 12px;
  }

  .message-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.875rem;
  }

  .card-content-inner {
    font-size: 0.875rem;
  }

  .card-field {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-bottom: 6px;
    flex-wrap: wrap;
  }

  .card-label {
    color: #6b7280;
    min-width: 56px;
  }

  .card-value {
    color: #111827;
  }

  .card-text {
    flex: 1;
    word-break: break-word;
    line-height: 1.4;
  }

  .phone-icon {
    margin-top: 2px;
  }

  .pagination-container {
    flex-direction: column;
    gap: 16px;
  }
}

@media (min-width: 769px) {
  .mobile-view {
    display: none;
  }
}

/* --- Анимации --- */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.98);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
