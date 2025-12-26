<template>
  <div class="modal-overlay" @click="changeStationMessage">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          Сообщения рассылки
          <span class="message-count" v-if="mailingLists.length > 0">
            ({{ mailingLists.length }})
          </span>
        </h2>
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

      <div class="modal-content">
        <div
          class="table-container"
          :class="{ 'empty-state': mailingLists.length === 0 }"
        >
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
            <p>В этой рассылке пока нет сообщений</p>
          </div>

          <!-- Десктопная таблица -->
          <template v-else>
            <table class="messages-table desktop-view">
              <thead class="table-header">
                <tr>
                  <th class="column-id">ID</th>
                  <th class="column-number">Номер</th>
                  <th class="column-text">Текст сообщения</th>
                  <th class="column-status">Статус</th>
                </tr>
              </thead>
              <tbody class="table-body">
                <tr
                  v-for="(item, index) in mailingLists"
                  :key="index"
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
                  <td class="cell-text" :title="item.text">
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

            <!-- Мобильные карточки -->
            <div class="mobile-cards mobile-view">
              <div
                v-for="(item, index) in mailingLists"
                :key="index"
                class="message-card"
              >
                <div class="card-header">
                  <span class="id-badge">#{{ item.id }}</span>
                  <span :class="['status-badge', `status-${item.state}`]">
                    {{ getStatusText(item.state) }}
                  </span>
                </div>
                <div class="card-content">
                  <div class="card-field">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      class="field-icon"
                    >
                      <path
                        fill="currentColor"
                        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24c1.12.37 2.33.57 3.57.57c.55 0 1 .45 1 1V20c0 .55-.45 1-1 1c-9.39 0-17-7.61-17-17c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02l-2.2 2.2z"
                      />
                    </svg>
                    <span class="field-value">{{ item.to }}</span>
                  </div>
                  <div class="card-field">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      class="field-icon"
                    >
                      <path
                        fill="currentColor"
                        d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
                      />
                    </svg>
                    <span class="field-value text-truncate">{{
                      item.text
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
</template>

<script setup>
import { ref, reactive, onMounted, computed, toRefs } from "vue";
import axios from "axios";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useRouter } from "vue-router";

import { useMailingVersion } from "@/stores/mailingVersion";
const mailingVersion = useMailingVersion();
const getVersion = computed(() => mailingVersion.getVersion);

const router = useRouter();
const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const props = defineProps({
  selectedItem: {
    type: Object,
  },
  changeInfoMailing: {
    type: Function,
  },
  changeStationMessage: {
    type: Function,
  },
});
const { selectedItem } = toRefs(props);

const mailingLists = ref([]);
const apiUrl = import.meta.env.VITE_WHATSAPI_URL;
const errorMessage = ref(false);
const loadingMessge = ref(true);

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const getStatusText = (state) => {
  const statusMap = {
    0: "Ожидание отправки",
    1: "Отправлено",
    2: "Ошибка отправки",
    3: "Доставлено",
    4: "Прочитано",
  };
  return statusMap[state] || "Неизвестный статус";
};

const getMessages = async () => {
  const apiUrlMethod = `${apiUrl}/view/${selectedItem.value.id}/`;
  loadingMessge.value = true;
  errorMessage.value = false;

  try {
    const response = await axios.get(apiUrlMethod, {
      params: {
        version: getVersion.value,
        limit: 50,
        offset: 0,
        sort: "asc",
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data.ok) {
      loadingMessge.value = false;
      mailingLists.value = response.data.result.items;
    } else if (response.status === 401) {
      loadingMessge.value = false;
      errorMessage.value = true;
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      console.error("error", response.data);
      loadingMessge.value = false;
      errorMessage.value = true;
    }
  } catch (error) {
    loadingMessge.value = false;
    errorMessage.value = true;
    console.error(
      "error",
      error.response ? error.response.data : error.message
    );
  }
};

onMounted(getMessages);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleIn 0.2s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-count {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background-color: #e5e7eb;
  color: #111827;
}

.modal-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.table-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.messages-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  background-color: #f9fafb;
}

.table-header th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  font-size: 0.8rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-body {
  background-color: #fff;
}

.table-row {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background-color: #f9fafb;
}

.table-row td {
  padding: 16px;
  font-size: 0.9rem;
  color: #111827;
}

.cell-id {
  width: 80px;
}

.id-badge {
  background-color: #f3f4f6;
  color: #4b5563;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.cell-number {
  width: 160px;
}

.number-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.phone-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

.cell-text {
  max-width: 0;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-status {
  width: 140px;
}

.status-badge {
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-block;
  text-align: center;
}

.status-0 {
  background-color: #fef3c7;
  color: #92400e;
}

.status-1 {
  background-color: #d1fae5;
  color: #065f46;
}

.status-2 {
  background-color: #fee2e2;
  color: #b91c1c;
}

.status-3 {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-4 {
  background-color: #e0e7ff;
  color: #3730a3;
}

/* Мобильные карточки */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.message-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-field {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.field-icon {
  color: #9ca3af;
  flex-shrink: 0;
  margin-top: 2px;
}

.field-value {
  font-size: 0.9rem;
  color: #374151;
  word-break: break-word;
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.error-icon,
.empty-icon {
  margin-bottom: 16px;
  color: #9ca3af;
}

.error-icon {
  color: #ef4444;
}

.loading-container p,
.error-container h3,
.empty-container h3 {
  margin: 0 0 8px 0;
  color: #111827;
  font-weight: 500;
}

.empty-container p {
  margin: 0;
  color: #6b7280;
  max-width: 300px;
}

.retry-button {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #2563eb;
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

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .modal-container {
    max-height: 95vh;
    margin: 0 10px;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-content {
    padding: 16px;
  }

  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: flex;
  }
}

@media (min-width: 769px) {
  .desktop-view {
    display: table;
  }

  .mobile-view {
    display: none;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .message-card {
    padding: 12px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .status-badge {
    align-self: flex-start;
  }
}
</style>
