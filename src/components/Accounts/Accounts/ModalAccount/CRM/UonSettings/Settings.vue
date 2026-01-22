<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Настройки</h3>
        <button class="close-btn" @click="close">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Загрузка конфигурации...</p>
        </div>

        <div v-else-if="settinsOptions" class="settings-container">
          <div class="settings-section">
            <h4 class="section-title">Клиенты</h4>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Менеджер по умолчанию</span>
                <p class="setting-description">
                  Устанавливать ответственного менеджера при создании новых
                  клиентов
                </p>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="settinsOptions.clients.set_default_manager"
                  @change="handleUpdate"
                />
                <span class="slider round"></span>
              </label>
            </div>
          </div>

          <div class="settings-section">
            <h4 class="section-title">Обращения</h4>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Отключить обработку</span>
                <p class="setting-description">
                  Никакие касания не добавляются в обращения, только в историю
                  клиента
                </p>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="settinsOptions.requests.disable"
                  @change="handleUpdate"
                />
                <span class="slider round"></span>
              </label>
            </div>

            <div
              class="setting-item"
              :class="{ 'item-disabled': settinsOptions.requests.disable }"
            >
              <div class="setting-info">
                <span class="setting-label">Запретить создание новых</span>
                <p class="setting-description">
                  Если обращение уже есть — касание добавится, если нет — новое
                  создано не будет
                </p>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  :disabled="settinsOptions.requests.disable"
                  v-model="settinsOptions.requests.disable_creation"
                  @change="handleUpdate"
                />
                <span class="slider round"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Менеджер по умолчанию</span>
                <p class="setting-description">
                  Назначать первого активного менеджера для новых обращений
                </p>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="settinsOptions.requests.set_default_manager"
                  @change="handleUpdate"
                />
                <span class="slider round"></span>
              </label>
            </div>
          </div>

          <div class="settings-section">
            <h4 class="section-title">Касания</h4>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Полная блокировка</span>
                <p class="setting-description">
                  Заблокировать создание всех касаний из мессенджеров (вх. и
                  исх.)
                </p>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="settinsOptions.actions.block"
                  @change="handleUpdate"
                />
                <span class="slider round"></span>
              </label>
            </div>

            <div
              class="setting-item"
              :class="{ 'item-disabled': settinsOptions.actions.block }"
            >
              <div class="setting-info">
                <span class="setting-label">Блокировать входящие</span>
                <p class="setting-description">
                  Сообщения из мессенджера не пробрасываются в U-ON
                </p>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  :disabled="settinsOptions.actions.block"
                  v-model="settinsOptions.actions.block_incoming"
                  @change="handleUpdate"
                />
                <span class="slider round"></span>
              </label>
            </div>

            <div
              class="setting-item"
              :class="{ 'item-disabled': settinsOptions.actions.block }"
            >
              <div class="setting-info">
                <span class="setting-label">Блокировать исходящие</span>
                <p class="setting-description">
                  Сообщения, отправленные вручную из мессенджера, не попадут в
                  U-ON
                </p>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  :disabled="settinsOptions.actions.block"
                  v-model="settinsOptions.actions.block_outgoing"
                  @change="handleUpdate"
                />
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <span v-if="saveStatus === 'saving'" class="save-loader"
          >Сохранение...</span
        >
        <span v-if="saveStatus === 'saved'" class="save-success"
          >Изменения сохранены</span
        >
        <button
          class="done-btn"
          :disabled="saveStatus === 'saving'"
          @click="close"
        >
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRefs, onMounted, computed, ref } from "vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";

const props = defineProps({
  close: Function,
  item: Object,
});

const { item } = toRefs(props);
const FRONTEND_URL = import.meta.env.VITE_BASE_URL;

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const settinsOptions = ref(null);
const loading = ref(true);
const saveStatus = ref(""); // '', 'saving', 'saved', 'error'

// Загрузка настроек
const fetchSettings = async () => {
  const { uuid } = item.value;
  loading.value = true;
  try {
    const response = await axios.get(`${FRONTEND_URL}uon-account/getSettings`, {
      params: { uuid },
      headers: { Authorization: `Bearer ${token.value}` },
    });
    if (response.data.ok) {
      settinsOptions.value = response.data.data;
    }
  } catch (error) {
    console.error("Ошибка загрузки:", error);
  } finally {
    loading.value = false;
  }
};

// Сохранение настроек (вызывается при каждом переключении)
const handleUpdate = async () => {
  const { uuid } = item.value;
  saveStatus.value = "saving";

  try {
    const response = await axios.post(
      `${FRONTEND_URL}uon-account/saveSettings`,
      settinsOptions.value, // Тело запроса
      {
        params: { uuid }, // UUID в GET параметрах, как указано в описании
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      },
    );

    if (response.data.ok) {
      saveStatus.value = "saved";
      setTimeout(() => {
        saveStatus.value = "";
      }, 2000);
    }
  } catch (error) {
    console.error("Ошибка сохранения:", error);
    saveStatus.value = "error";
    alert("Ошибка при сохранении настроек");
  }
};

onMounted(fetchSettings);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(3px);
}

.modal-content {
  background: #fff;
  width: 95%;
  max-width: 550px;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  padding: 18px 24px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background-color: transparent;
}

.modal-header h3 {
  margin: 0;
  font-size: 17px;
  color: #0f172a;
  font-weight: 700;
}

.modal-body {
  padding: 20px 24px;
  max-height: 65vh;
  overflow-y: auto;
}

.settings-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 11px;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
  font-weight: 700;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  transition: opacity 0.3s;
}

.item-disabled {
  opacity: 0.4;
  pointer-events: none;
}

.setting-info {
  flex: 1;
  padding-right: 20px;
}

.setting-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 2px;
}

.setting-description {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

/* Switch Styles */
.switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 22px;
  margin-top: 4px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e2e8f0;
  transition: 0.3s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

input:checked + .slider {
  background-color: #3c61e0;
}
input:checked + .slider:before {
  transform: translateX(20px);
}

/* Footer */
.modal-footer {
  padding: 14px 24px;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
}

.save-success {
  color: #10b981;
  font-size: 13px;
  font-weight: 500;
}
.save-loader {
  color: #64748b;
  font-size: 13px;
  font-style: italic;
}

.done-btn {
  background: #334155;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.done-btn:disabled {
  opacity: 0.5;
}

/* Spinner */
.loading-state {
  text-align: center;
  padding: 40px 0;
  color: #64748b;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top-color: #3c61e0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
