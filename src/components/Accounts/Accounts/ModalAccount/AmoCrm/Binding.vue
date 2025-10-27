<template>
  <div class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Воронки аккаунта</h2>
        <button class="close-btn" @click="close">×</button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading">Загрузка...</div>

        <div v-else-if="error" class="error">Ошибка: {{ error }}</div>

        <div v-else-if="pipelines.length === 0" class="no-data">
          Нет данных о воронках
        </div>

        <div v-else class="pipelines-list">
          <h3>Найдено воронок: {{ pipelines.length }}</h3>
          <div
            v-for="pipeline in pipelines"
            :key="pipeline.id"
            class="pipeline-item"
          >
            <div class="pipeline-name">{{ pipeline.name }}</div>
            <div class="pipeline-id">ID: {{ pipeline.id }}</div>
            <div class="pipeline-vendors">
              Вендоры: {{ pipeline.vendors.length }}
              <span v-if="pipeline.vendors.length > 0">
                ({{ pipeline.vendors.join(", ") }})
              </span>
            </div>
          </div>
        </div>

        <button @click="getPipelines" :disabled="loading" class="refresh-btn">
          {{ loading ? "Загрузка..." : "Обновить данные" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAccountStore } from "@/stores/accountStore";

const props = defineProps({
  close: {
    type: Function,
  },
  selectedItem: {
    type: Object,
  },
  getAllAccounts: {
    type: Function,
  },
});

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const pipelines = ref([]);
const loading = ref(false);
const error = ref(null);

async function getPipelines() {
  if (!props.selectedItem?.uuid) {
    error.value = "Не выбран аккаунт (отсутствует UUID)";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(
      "https://bapi88.developtech.ru/api/v1/crm/getAmocrmPipelines",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
          // Если нужно передавать uuid в headers
          "X-Account-UUID": props.selectedItem.uuid,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.ok && result.data && Array.isArray(result.data[0])) {
      pipelines.value = result.data[0];
    } else {
      throw new Error(result.message || "Неверный формат данных");
    }
  } catch (err) {
    error.value = err.message;
    console.error("Ошибка при получении воронок:", err);
  } finally {
    loading.value = false;
  }
}

// Автоматически загружаем данные при открытии модального окна
onMounted(() => {
  getPipelines();
});
</script>

<style scoped>
.modal {
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
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f5f5f5;
  border-radius: 50%;
}

.modal-body {
  padding: 20px;
}

.loading,
.error,
.no-data {
  text-align: center;
  padding: 20px;
  font-size: 1.1rem;
}

.error {
  color: #d32f2f;
}

.no-data {
  color: #666;
}

.pipelines-list h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}

.pipeline-item {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 12px;
  background: #fafafa;
}

.pipeline-name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 4px;
  color: #1976d2;
}

.pipeline-id {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 4px;
}

.pipeline-vendors {
  font-size: 0.9rem;
  color: #555;
}

.refresh-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
}

.refresh-btn:hover:not(:disabled) {
  background: #1565c0;
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
