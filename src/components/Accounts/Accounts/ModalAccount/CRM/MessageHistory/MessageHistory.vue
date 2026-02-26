<template>
  <ModalFrame
    :text="modalText"
    :close="close"
    :item="item"
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
          <div class="error-placeholder">
            <span v-if="dateErrors.from" class="error-text"
              >Проверьте дату</span
            >
          </div>
        </div>

        <div class="filter-group">
          <label>ДО:</label>
          <input
            type="date"
            v-model="filters.date_to"
            :max="today"
            :class="{ 'input-error': dateErrors.to }"
          />
          <div class="error-placeholder">
            <span v-if="dateErrors.to" class="error-text">Проверьте дату</span>
          </div>
        </div>

        <div class="filter-group per-page">
          <label>КОЛ-ВО:</label>
          <div class="select-wrapper">
            <select v-model="filters.per_page" @change="resetAndFetch">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>

        <button
          class="refresh-btn"
          @click="resetAndFetch"
          :disabled="loading || hasErrors"
        >
          Обновить
        </button>
      </div>

      <div class="history-body">
        <div v-if="historyData.length > 0" class="cards-container">
          <div v-for="msg in historyData" :key="msg.id" class="card">
            <div class="card-header">
              <span class="card-date">{{ formatDate(msg.dt_ins) }}</span>
              <span
                :class="['status-badge', msg.status]"
                :title="dictionaries.statuses[msg.status] || msg.status"
              >
                {{ dictionaries.statuses[msg.status] || msg.status }}
              </span>
            </div>

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

              <div class="card-row text-row">
                <span class="label">Текст</span>
                <span class="value content-cell">
                  <template v-if="msg.content">
                    {{ getPreviewText(msg.content) }}
                    <span
                      v-if="msg.content.length > 200"
                      class="show-more"
                      @click="openFullText(msg.content)"
                    >
                      Показать полностью
                    </span>
                  </template>
                  <template v-else>-</template>
                </span>
              </div>
            </div>
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

      <div
        v-if="totalPages > 1 && historyData.length > 0"
        class="pagination-container sticky-bottom"
      >
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

      <div
        v-if="fullTextMsg"
        class="full-text-overlay"
        @click.self="fullTextMsg = null"
      >
        <div class="full-text-modal">
          <div class="full-text-header">
            <h4>Полный текст сообщения</h4>
            <button @click="fullTextMsg = null" class="close-btn">
              &times;
            </button>
          </div>
          <div class="full-text-body">
            {{ fullTextMsg }}
          </div>
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
};

const fullTextMsg = ref(null);

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

const dateErrors = computed(() => {
  const errs = { from: false, to: false };
  if (!filters.date_from || !filters.date_to) return errs;

  const fromStr = filters.date_from;
  const toStr = filters.date_to;
  const from = new Date(fromStr);
  const to = new Date(toStr);

  if (fromStr > today) errs.from = true;
  if (toStr > today) errs.to = true;

  if (!errs.from && !errs.to && from > to) {
    errs.from = true;
    errs.to = true;
  }

  return errs;
});

const hasErrors = computed(() => dateErrors.value.from || dateErrors.value.to);

const resetAndFetch = () => {
  filters.page = 1;
  fetchHistory();
};

const changePage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  filters.page = newPage;
  fetchHistory();
};

const getPreviewText = (text) => {
  if (!text) return "";
  return text.length > 200 ? text.slice(0, 200) + "..." : text;
};

const openFullText = (text) => {
  fullTextMsg.value = text;
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
      historyData.value = response.data.data.messages || [];
      totalPages.value = response.data.data.total_pages || 1;
      if (response.data.data.dictionaries) {
        dictionaries.value = response.data.data.dictionaries;
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (iso) => {
  if (!iso) return "";
  return iso.replace("T", " ").replace(/:\d{2}\.\d+$/, "");
};

onMounted(fetchHistory);
</script>

<style scoped>
/* --- КОНТЕЙНЕР (Резиновый, без горизонтального скролла) --- */
.history-container {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%; /* Занимаем всю ширину родителя */
  max-width: 100%; /* Запрещаем расширяться больше родителя */
  height: 70vh; /* Ограничение высоты, чтобы работал внутренний скролл */
  box-sizing: border-box;
}

.history-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden; /* Жестко отключаем горизонтальный скролл */
  padding-right: 6px;
}

/* --- ФИЛЬТРЫ --- */
.filters-panel {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 12px;
  flex-wrap: wrap; /* Позволяет фильтрам переноситься на узких экранах */
  align-items: flex-start;
  margin-bottom: 12px;
  width: 100%;
  box-sizing: border-box;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 130px; /* Достаточный минимум для поля с датой */
}

.filter-group.per-page {
  flex: 0;
  min-width: 90px; /* Сузили до минимума */
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
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid #dfe1e5;
  border-radius: 8px;
  font-size: 14px;
  background-color: #ffffff;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.filter-group.per-page .select-wrapper select {
  padding: 10px 24px 10px 12px; /* Оставили место для стрелочки */
  appearance: auto;
}

.filter-group input:focus,
.select-wrapper select:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}

.input-error {
  border-color: #dc3545 !important;
  background-color: #fff8f8;
}

.error-placeholder {
  min-height: 14px;
  margin-top: 2px;
}

.error-text {
  color: #dc3545;
  font-size: 11px;
  line-height: 1.2;
  display: block;
}

.refresh-btn {
  margin-top: 23px;
  background: #1a73e8;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  height: 38px;
  transition: background 0.2s ease;
  white-space: nowrap; /* Чтобы кнопка не переносилась по словам */
}

.refresh-btn:disabled {
  background: #9aa0a6;
  cursor: not-allowed;
  opacity: 0.8;
}

.refresh-btn:hover:not(:disabled) {
  background: #1967d2;
}

/* --- КАРТОЧКИ --- */
.cards-container {
  padding-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
}

.card {
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  padding: 14px 16px;
  background: #ffffff;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  width: 100%;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
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
  white-space: nowrap;
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
  gap: 8px;
  width: 100%;
}

.card-row {
  display: flex;
  justify-content: flex-start;
  font-size: 14px;
  flex-wrap: wrap; /* Позволяет значению перенестись на узких экранах */
  gap: 8px;
}

.card-row .label {
  font-weight: 600;
  color: #5e6c84;
  width: 100px; /* Фиксированная небольшая ширина для аккуратности */
  flex-shrink: 0;
}

.card-row .value {
  color: #333;
  word-wrap: break-word;
  word-break: break-word; /* Жесткий перенос длинных ссылок/строк */
  flex: 1; /* Занимает оставшееся пространство */
  min-width: 0; /* Фикс для flex-контейнеров, чтобы текст переносился */
}

/* Блок Текста */
.text-row {
  flex-direction: column;
  align-items: flex-start;
  margin-top: 4px;
  gap: 4px;
}

.text-row .value {
  width: 100%;
  margin-top: 4px;
}

.content-cell {
  white-space: pre-wrap; /* Учитывает переносы из БД */
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.5;
  max-width: 100%;
}

.show-more {
  color: #1a73e8;
  cursor: pointer;
  font-size: 13px;
  margin-left: 6px;
  font-weight: 600;
  white-space: nowrap;
}
.show-more:hover {
  text-decoration: underline;
}

/* --- ОВЕРЛЕЙ ПОЛНОГО ТЕКСТА --- */
.full-text-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  border-radius: 8px;
}

.full-text-modal {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.full-text-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.full-text-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b778c;
}

.full-text-body {
  padding: 20px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.5;
}

/* --- ПАГИНАЦИЯ --- */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
  gap: 12px;
  flex-wrap: wrap; /* Чтобы на мобилках цифры не уходили вбок */
}

.sticky-bottom {
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #e4e7ed;
  margin-top: auto;
  z-index: 10;
}

.page-numbers {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
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
  text-align: center;
  padding: 48px 16px;
}

/* --- АДАПТИВНОСТЬ МИНИ-ЭКРАНЫ --- */
@media (max-width: 500px) {
  .refresh-btn {
    width: 100%;
    margin-top: 10px;
  }
  .nav-text {
    display: none;
  }
}
</style>
