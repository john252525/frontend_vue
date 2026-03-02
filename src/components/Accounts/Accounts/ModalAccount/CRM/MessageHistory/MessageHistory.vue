<template>
  <ModalFrame
    :text="modalText"
    :close="close"
    :item="item"
    :action="resetAndFetch"
    :is-loading="loading"
  >
    <div class="history-container">
      <div class="filters-panel">
        <div class="filter-group">
          <label>ОТ:</label>
          <input
            type="date"
            v-model="filters.date_from"
            :max="today"
            :class="{ 'input-error': dateErrors.from }"
          />
        </div>
        <div class="filter-group">
          <label>ДО:</label>
          <input
            type="date"
            v-model="filters.date_to"
            :max="today"
            :class="{ 'input-error': dateErrors.to }"
          />
        </div>
        <div class="filter-group per-page">
          <label>НА СТРАНИЦЕ:</label>
          <div class="select-wrapper">
            <select v-model="filters.per_page" @change="resetAndFetch">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="historyData.length > 0" class="info-bar">
        <span
          >Всего страниц: <b>{{ totalPages }}</b></span
        >
        <span v-if="totalCount"
          >Сообщений: <b>{{ totalCount }}</b></span
        >
      </div>

      <div class="history-body">
        <div v-if="historyData.length > 0" class="cards-container">
          <div v-for="msg in historyData" :key="msg.id" class="card">
            <div class="card-header">
              <span class="card-date">{{ formatDate(msg.dt_ins) }}</span>
              <span :class="['status-badge', msg.status]">
                {{ dictionaries.statuses[msg.status] || msg.status }}
              </span>
            </div>
            <div class="card-body">
              <div class="card-row">
                <span class="label">Мессенджер</span>
                <span class="value">{{
                  dictionaries.messengers[msg.messenger] || msg.messenger
                }}</span>
              </div>
              <div class="card-row">
                <span class="label">Получатель</span>
                <span class="value">{{ msg.number || msg.sent_to }}</span>
              </div>
              <div class="card-row text-row">
                <span class="label">Текст</span>
                <span class="value content-cell">
                  {{ getPreviewText(msg.content) }}
                  <span
                    v-if="msg.content?.length > 200"
                    class="show-more"
                    @click="openFullText(msg.content)"
                  >
                    Показать полностью
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="!loading" class="state-container">
          <div class="empty-state">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ccc"
              stroke-width="1.5"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3>История пуста</h3>
            <p>За выбранный период ничего не найдено</p>
          </div>
        </div>
      </div>

      <!-- ПАГИНАЦИЯ -->
      <div
        v-if="totalPages > 1 && historyData.length > 0"
        class="pagination-container sticky-bottom"
      >
        <button
          class="pag-nav"
          :disabled="filters.page === 1 || loading"
          @click="changePage(filters.page - 1)"
        >
          ← <span class="nav-text">Назад</span>
        </button>

        <div class="page-numbers">
          <template v-for="(p, idx) in displayedPages" :key="idx">
            <button
              v-if="p !== '...'"
              :class="['page-num', { active: filters.page === p }]"
              :disabled="loading"
              @click="changePage(p)"
            >
              {{ p }}
            </button>
            <span v-else class="dots">...</span>
          </template>
        </div>

        <button
          class="pag-nav"
          :disabled="filters.page >= totalPages || loading"
          @click="changePage(filters.page + 1)"
        >
          <span class="nav-text">Вперед</span> →
        </button>
      </div>

      <!-- Полный текст -->
      <div
        v-if="fullTextMsg"
        class="full-text-overlay"
        @click.self="fullTextMsg = null"
      >
        <div class="full-text-modal">
          <div class="full-text-header">
            <h4>Полный текст сообщения</h4>
            <button @click="fullTextMsg = null" class="close-btn">×</button>
          </div>
          <div class="full-text-body">{{ fullTextMsg }}</div>
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
const totalCount = ref(0);
const fullTextMsg = ref(null);

const modalText = {
  title: "История сообщений",
  close: "Закрыть",
  action: "Обновить",
};

const filters = reactive({
  date_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  date_to: today,
  per_page: 10,
  page: 1,
});

const dictionaries = ref({
  statuses: { success: "Успешно", fail: "Ошибка", pending: "В ожидании" },
  messengers: { whatsapp: "WhatsApp", telegram: "Telegram", vk: "VK" },
});

// ─── ПАГИНАЦИЯ ────────────────────────────────────────────────
const displayedPages = computed(() => {
  const total = totalPages.value;
  const current = filters.page;
  if (total <= 1) return [1];

  const pages = [];
  const maxVisible = 7;

  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  const left = current - 2;
  const right = current + 2;

  if (left > 2) pages.push("...");

  for (let i = Math.max(2, left); i <= Math.min(total - 1, right); i++) {
    pages.push(i);
  }

  if (right < total - 1) pages.push("...");

  if (pages[pages.length - 1] !== total) pages.push(total);

  return pages;
});

const changePage = (newPage) => {
  const pageNum = Number(newPage);
  if (
    isNaN(pageNum) ||
    pageNum < 1 ||
    pageNum > totalPages.value ||
    pageNum === filters.page
  )
    return;

  filters.page = pageNum;
  fetchHistory();
};

const resetAndFetch = () => {
  filters.page = 1;
  fetchHistory();
};

// ─── API ───────────────────────────────────────────────────────
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
      const resData = response.data.data;

      historyData.value = resData.messages || [];

      // Важно: берём значения именно из pagination
      const pag = resData.pagination || {};
      totalPages.value = Number(pag.total_pages) || 1;
      totalCount.value = Number(pag.total) || 0;

      // Можно обновить per_page и page из ответа (на всякий случай)
      filters.per_page = Number(pag.per_page) || filters.per_page;
      filters.page = Number(pag.current_page) || filters.page;

      if (resData.dictionaries) {
        dictionaries.value = {
          ...dictionaries.value,
          ...resData.dictionaries,
        };
      }
    }
  } catch (error) {
    console.error("Ошибка при получении истории:", error);
  } finally {
    loading.value = false;
  }
};

// ─── ВАЛИДАЦИЯ ДАТ ─────────────────────────────────────────────
const dateErrors = computed(() => {
  const from = new Date(filters.date_from);
  const to = new Date(filters.date_to);
  const errs = { from: false, to: false };

  if (filters.date_from && filters.date_from > today) errs.from = true;
  if (filters.date_to && filters.date_to > today) errs.to = true;
  if (filters.date_from && filters.date_to && from > to) {
    errs.from = true;
    errs.to = true;
  }

  return errs;
});

const hasErrors = computed(() => dateErrors.value.from || dateErrors.value.to);

// ─── ХЕЛПЕРЫ ──────────────────────────────────────────────────
const getPreviewText = (text) =>
  text && text.length > 200 ? text.slice(0, 200) + "..." : text || "";

const openFullText = (text) => {
  fullTextMsg.value = text;
};

const formatDate = (iso) =>
  iso ? iso.replace("T", " ").split(".")[0].slice(0, 16) : "";

onMounted(fetchHistory);
</script>

<style scoped>
/* --- ГЛАВНЫЙ КОНТЕЙНЕР (На всю ширину родителя) --- */
.history-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  /* height: 75vh; */
  box-sizing: border-box;
  overflow: hidden; /* Чтобы скроллилось только тело */
  position: relative;
}

/* Фильтры: резиновые, переносятся на новую строку */
.filters-panel {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 140px;
}

.filter-group.per-page {
  flex: 0;
  min-width: 110px;
}

.filter-group label {
  font-size: 11px;
  font-weight: bold;
  color: #888;
  text-transform: uppercase;
}

.filter-group input {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}

.select-wrapper select {
  height: 38px;
  padding: 20px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}

.refresh-btn {
  align-self: flex-end;
  margin-bottom: 2px;
  padding: 9px 20px;
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.info-bar {
  display: flex;
  justify-content: space-between;
  padding: 6px 16px;
  background: #fff;
  font-size: 12px;
  color: #777;
  border-bottom: 1px solid #f0f0f0;
}

/* ТЕЛО: скроллится только здесь */
.history-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden; /* ЗАПРЕТ горизонтального скролла */
  padding: 16px;
}

.card {
  border: 1px solid #eef0f2;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  width: 100%;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 8px;
}

.card-date {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.status-badge {
  font-size: 10px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
}
.status-badge.success {
  background: #e6f4ea;
  color: #1e8e3e;
}
.status-badge.fail {
  background: #fce8e6;
  color: #d93025;
}
.status-badge.pending {
  background: #fef7e0;
  color: #f9ab00;
}

.card-row {
  display: flex;
  gap: 10px;
  margin-bottom: 6px;
  font-size: 13px;
  width: 100%;
}

.card-row .label {
  color: #888;
  width: 90px;
  flex-shrink: 0;
}
.card-row .value {
  color: #333;
  word-break: break-word; /* ПЕРЕНОС длинных слов/ссылок */
  flex: 1;
  min-width: 0;
}

.text-row {
  flex-direction: column;
  margin-top: 4px;
}
.text-row .label {
  width: 100%;
  margin-bottom: 4px;
}

.content-cell {
  line-height: 1.5;
  white-space: pre-wrap;
}

.show-more {
  color: #1a73e8;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  margin-left: 4px;
}

/* ПАГИНАЦИЯ (Sticky внизу) */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-top: 1px solid #eee;
  z-index: 10;
}

.sticky-bottom {
  position: sticky;
  bottom: 0;
}

.page-numbers {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.page-num {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-num.active {
  background: #1a73e8;
  color: #fff;
  border-color: #1a73e8;
}
.page-num:hover:not(.active):not(:disabled) {
  border-color: #1a73e8;
  color: #1a73e8;
}

.pag-nav {
  padding: 6px 14px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.pag-nav:disabled,
.page-num:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* OVERLAY */
.full-text-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 20px;
}
.full-text-modal {
  background: #fff;
  width: 100%;
  max-width: 500px;
  max-height: 80%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}
.full-text-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.full-text-body {
  padding: 20px;
  overflow-y: auto;
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.6;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #aaa;
}

.state-container {
  padding: 60px 20px;
  text-align: center;
  color: #999;
}
.input-error {
  border-color: #d93025 !important;
  background: #fff8f7;
}

@media (max-width: 480px) {
  .nav-text {
    display: none;
  } /* Скрываем текст "Назад/Вперед" на мобилках */
  .filter-group {
    min-width: 100%;
  }
}
</style>
