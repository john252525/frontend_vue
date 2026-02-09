<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>История уведомлений (U-ON Travel)</h3>
        <button class="close-btn" @click="close">×</button>
      </div>

      <div class="filters-panel">
        <div class="filter-group">
          <label>ДАТА ОТ:</label>
          <input type="date" v-model="filters.date_from" />
        </div>
        <div class="filter-group">
          <label>ДАТА ДО:</label>
          <input type="date" v-model="filters.date_to" />
        </div>
        <div class="filter-group">
          <label>НА СТРАНИЦЕ:</label>
          <select v-model="filters.per_page">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
        <button class="refresh-btn" @click="fetchHistory" :disabled="loading">
          <span v-if="loading">⏳</span>
          <span v-else>🔄 Обновить</span>
        </button>
      </div>

      <div class="history-body">
        <div v-if="loading" class="empty-state">Загрузка данных...</div>

        <div v-else-if="historyData.length > 0" class="table-wrapper">
          <table class="history-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Мессенджер</th>
                <th>Получатель</th>
                <th>Статус</th>
                <th>Текст</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="msg in historyData" :key="msg.id">
                <td>{{ msg.dt_ins }}</td>
                <td>
                  {{ dictionaries.messengers[msg.messenger] || msg.messenger }}
                </td>
                <td>{{ msg.number }}</td>
                <td>
                  <span :class="['status-badge', msg.status]">
                    {{ dictionaries.statuses[msg.status] || msg.status }}
                  </span>
                </td>
                <td class="content-cell" :title="msg.content">
                  {{ msg.content }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state">
          <div class="search-icon">🔍</div>
          <p>Нет данных истории</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRefs, onMounted, computed, ref, reactive } from "vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";

const props = defineProps({
  close: Function,
  item: Object, // Предполагаем, что здесь лежит uuid и user_id
});

const { item } = toRefs(props);
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const FRONTEND_URL = import.meta.env.VITE_BASE_URL;

// Состояние
const loading = ref(false);
const historyData = ref([]);
const dictionaries = ref({
  statuses: {},
  messengers: {},
});

const filters = reactive({
  date_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .substr(0, 10), // -7 дней
  date_to: new Date().toISOString().substr(0, 10),
  per_page: 10,
  page: 1,
});

// Запрос к API
const fetchHistory = async () => {
  loading.value = true;
  try {
    const response = await axios.post(
      `${FRONTEND_URL}/uon-account/getHistory`,
      {
        uuid: item.value?.uuid,
        user_id: item.value?.user_id,
        date_from: filters.date_from,
        date_to: filters.date_to,
        per_page: filters.per_page,
        page: filters.page,
        filter_by_vendor: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      },
    );

    if (response.data.ok) {
      historyData.value = response.data.data.messages;
      dictionaries.value = response.data.data.dictionaries;
    }
  } catch (error) {
    console.error("Ошибка при получении истории:", error);
    alert("Не удалось загрузить историю");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchHistory();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 1000px;
  max-height: 80vh;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.filters-panel {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f8f9fc;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-size: 11px;
  font-weight: bold;
  color: #666;
}

.filter-group input,
.filter-group select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.refresh-btn {
  background-color: #1a73e8;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.refresh-btn:hover {
  background-color: #1557b0;
}

.history-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 300px;
}

.table-wrapper {
  width: 100%;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.history-table th {
  text-align: left;
  background: #f4f4f4;
  padding: 10px;
  border-bottom: 2px solid #ddd;
}

.history-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status-badge.success {
  background: #e6fffa;
  color: #2d3748;
  border: 1px solid #b2f5ea;
}
.status-badge.fail {
  background: #fff5f5;
  color: #c53030;
  border: 1px solid #feb2b2;
}
.status-badge.pending {
  background: #fffaf0;
  color: #975a16;
  border: 1px solid #fbd38d;
}

.content-cell {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  margin-top: 50px;
}

.search-icon {
  font-size: 48px;
  margin-bottom: 10px;
}
</style>
