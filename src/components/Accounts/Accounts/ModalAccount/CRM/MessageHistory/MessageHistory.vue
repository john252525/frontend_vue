<template>
  <ModalFrame
    :text="modalText"
    :action="fetchHistory"
    :close="close"
    :item="item"
    :is-loading="loading"
  >
    <div class="filters-panel">
      <div class="filter-group">
        <label>ОТ:</label>
        <input
          type="date"
          v-model="filters.date_from"
          :max="today"
          :class="{ 'input-error': errors.date_from }"
        />
        <span v-if="errors.date_from" class="error-text">{{
          errors.date_from
        }}</span>
      </div>

      <div class="filter-group">
        <label>ДО:</label>
        <input
          type="date"
          v-model="filters.date_to"
          :min="filters.date_from"
          :class="{ 'input-error': errors.date_to }"
        />
        <span v-if="errors.date_to" class="error-text">{{
          errors.date_to
        }}</span>
      </div>

      <div class="filter-group per-page">
        <label>КОЛ-ВО СООБЩЕНИЙ:</label>
        <div class="select-wrapper">
          <select v-model="filters.per_page" @change="resetAndFetch">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Блок с историей -->
    <div class="history-body">
      <div v-if="historyData.length > 0" class="cards-container">
        <div v-for="msg in historyData" :key="msg.id" class="card">
          <!-- Заголовок карточки -->
          <div class="card-header">
            <span class="card-date">{{ formatDate(msg.dt_ins) }}</span>
            <span
              :class="['status-badge', msg.status]"
              :title="dictionaries.statuses[msg.status] || msg.status"
            >
              {{ dictionaries.statuses[msg.status] || msg.status }}
            </span>
          </div>

          <!-- Основные поля -->
          <div class="card-body">
            <div class="card-row">
              <span class="label">Мессенджер</span>
              <span class="value">
                {{ dictionaries.messengers[msg.messenger] || msg.messenger }}
              </span>
            </div>

            <div class="card-row">
              <span class="label">Получатель</span>
              <span class="value">{{ msg.number || msg.sent_to }}</span>
            </div>

            <div class="card-row">
              <span class="label">Текст</span>
              <span class="value content-cell" :title="msg.content">
                {{ msg.content || "-" }}
              </span>
            </div>
          </div>
        </div>

        <!-- Пагинация -->
        <div class="pagination-container">
          <button
            class="pag-nav"
            :disabled="filters.page === 1"
            @click="changePage(filters.page - 1)"
          >
            &larr; <span class="nav-text">Назад</span>
          </button>

          <div class="page-numbers">
            <template v-for="p in displayedPages" :key="p">
              <button
                v-if="p !== '...'"
                :class="['page-num', { active: filters.page === p }]"
                @click="changePage(p)"
              >
                {{ p }}
              </button>
              <span v-else class="dots">...</span>
            </template>
          </div>

          <button
            class="pag-nav"
            :disabled="filters.page >= totalPages"
            @click="changePage(filters.page + 1)"
          >
            <span class="nav-text">Вперед</span> &rarr;
          </button>
        </div>
      </div>

      <div v-else class="state-container">
        <div class="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3>Данных нет</h3>
        </div>
      </div>
    </div>
  </ModalFrame>
</template>

<script setup>
import { toRefs, onMounted, computed, ref, reactive } from "vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";

const props = defineProps({
  close: Function,
  item: Object,
});

const { item } = toRefs(props);
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const FRONTEND_URL = import.meta.env.VITE_BASE_URL;

const today = new Date().toISOString().split("T")[0];
const loading = ref(false);
const historyData = ref([]);
const totalPages = ref(1);
const modalText = {
  title: "История сообщений",
  close: "Закрыть",
  action: "Обновить",
};

const dictionaries = ref({
  statuses: {
    success: "Успешно",
    fail: "Ошибка",
    pending: "В ожидании",
  },
  messengers: {
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    vk: "VK",
  },
});

const filters = reactive({
  date_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  date_to: today,
  per_page: 10,
  page: 1,
});

const displayedPages = computed(() => {
  const total = totalPages.value;
  const current = filters.page;
  const pages = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    if (current < total - 2) pages.push("...");
    if (!pages.includes(total)) pages.push(total);
  }
  return pages;
});

const errors = computed(() => {
  const errs = {};
  const from = new Date(filters.date_from);
  const to = new Date(filters.date_to);
  if (from > to) errs.date_from = "Ошибка дат";
  return errs;
});

const hasErrors = computed(() => Object.keys(errors.value).length > 0);

const resetAndFetch = () => {
  filters.page = 1;
  fetchHistory();
};

const changePage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  filters.page = newPage;
  fetchHistory();
};

const fetchHistory = async () => {
  if (hasErrors.value) return;
  loading.value = true;
  try {
    const response = await axios.post(
      `${FRONTEND_URL}/uon-account/getHistory`,
      {
        uuid: item.value?.uuid,
        user_id: item.value?.user_id,
        ...filters,
      },
      {
        headers: { Authorization: `Bearer ${token.value}` },
      },
    );

    if (response.data.ok) {
      historyData.value = response.data.data.messages;
      totalPages.value =
        response.data.data.total_pages || Math.ceil(100 / filters.per_page);
      if (response.data.data.dictionaries)
        dictionaries.value = response.data.data.dictionaries;
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (iso) => {
  return iso.replace("T", " ").replace(/:\d{2}\.\d+$/, "");
};

onMounted(fetchHistory);
</script>

<style scoped>
/* --- БАЗОВЫЕ СТИЛИ --- */
.history-body {
  flex: 1;
  overflow-y: auto;
}

/* --- ФИЛЬТРЫ --- */
.filters-panel {
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  background: #f5f7fa;
  border-radius: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 140px;
}

.filter-group.per-page {
  flex: 0;
  min-width: 100px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 700;
  color: #6b778c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group input,
.select-wrapper select {
  padding: 10px 12px;
  border: 1px solid #dfe1e5;
  border-radius: 8px;
  font-size: 14px;
  background-color: #ffffff;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.filter-group input:focus,
.select-wrapper select:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}

.refresh-btn {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  height: 38px;
  transition: background 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.refresh-btn:disabled {
  background: #9aa0a6;
  cursor: not-allowed;
}

.refresh-btn:hover:not(:disabled) {
  background: #1967d2;
}

/* --- КАРТОЧКИ --- */
.cards-container {
  padding: 16px 0px;
}

.card {
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  padding: 14px 16px;
  background: #ffffff;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition:
    box-shadow 0.2s ease,
    transform 0.1s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.card-date {
  font-size: 12px;
  color: #6b778c;
  background-color: #f0f2f5;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-badge.fail {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 14px;
}

.card-row .label {
  font-weight: 600;
  color: #5e6c84;
  min-width: 100px;
  white-space: nowrap;
}

.card-row .value {
  color: #333;
  word-break: break-word;
  margin-left: 12px;
}

.content-cell {
  max-width: 180px;
  white-space: normal;
}

/* --- ПАГИНАЦИЯ --- */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  gap: 12px;
  flex-wrap: wrap;
}

.page-numbers {
  display: flex;
  gap: 6px;
  align-items: center;
}

.page-num {
  width: 36px;
  height: 36px;
  border: 1px solid #dfe1e5;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.page-num:hover:not(.active) {
  background: #f0f2f5;
  border-color: #dfe1e5;
}

.page-num.active {
  background: #1a73e8;
  color: white;
  border-color: #1a73e8;
}

.pag-nav {
  padding: 8px 16px;
  border: 1px solid #dfe1e5;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.pag-nav:hover:not(:disabled) {
  background: #f0f2f5;
  border-color: #c6c6c6;
}

.pag-nav:disabled {
  background: #f8f9fa;
  color: #9aa0a6;
  cursor: not-allowed;
}

.dots {
  color: #9aa0a6;
  padding: 0 6px;
}

.state-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  text-align: center;
}

.empty-state svg {
  color: #cbd5e0;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #475569;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 18px;
}

.empty-state p {
  color: #64748b;
  font-size: 14px;
}

/* --- АДАПТИВНОСТЬ --- */
@media (max-width: 768px) {
  .filters-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    width: 100%;
  }

  .refresh-btn {
    width: 100%;
  }

  .nav-text {
    display: none;
  }

  .card {
    padding: 12px 14px;
  }

  .card-row {
    flex-direction: column;
    gap: 4px;
  }

  .card-row .label {
    font-weight: 700;
  }

  .card-row .value {
    margin-left: 0;
    margin-top: 2px;
  }
}
</style>
