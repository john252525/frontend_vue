<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Настройка маршрутизации сообщений</h2>
        <button class="close-btn" @click="close">&times;</button>
      </div>

      <div class="modal-body">
        <p class="description">
          Установка менеджера по умолчанию для каналов. Поступающие в канал
          сообщения от новых клиентов будут направляться на выбранного
          менеджера.
        </p>

        <div v-if="loading" class="loading">Загрузка данных...</div>

        <div v-else-if="error" class="error">{{ error }}</div>

        <div v-else class="messenger-card">
          <div class="messenger-header">
            <h3>{{ item.name }}</h3>
            <span class="messenger-id">{{ item.source }}</span>
          </div>

          <!-- Офисы -->
          <div class="form-group">
            <label class="form-label">Выберите офис:</label>
            <div class="offices-list">
              <button
                v-for="office in offices"
                :key="office.id"
                @click="selectOffice(office.id)"
                :class="[
                  'office-item',
                  { active: selectedOffice == office.id },
                ]"
              >
                <div class="office-name">{{ office.name }}</div>
                <div class="office-city">{{ office.city }}</div>
                <div class="office-phones">{{ office.phones }}</div>
              </button>

              <button
                @click="selectOffice('')"
                :class="[
                  'office-item',
                  'without-office',
                  { active: selectedOffice === '' },
                ]"
              >
                <div class="office-name">Без офиса</div>
              </button>
            </div>
          </div>

          <!-- Менеджеры -->
          <div class="form-group">
            <label class="form-label">Выберите менеджера:</label>

            <!-- Менеджеры офиса -->
            <div
              v-if="selectedOffice && getManagersForOffice.length > 0"
              class="managers-section"
            >
              <h4 class="section-title">Менеджеры офиса</h4>
              <div class="managers-list">
                <button
                  v-for="manager in getManagersForOffice"
                  :key="manager.u_id"
                  @click="selectManager(manager.u_id)"
                  :class="[
                    'manager-item',
                    { active: selectedManager == manager.u_id },
                  ]"
                >
                  <div class="manager-avatar">
                    {{ getInitials(manager.u_name, manager.u_surname) }}
                  </div>
                  <div class="manager-info">
                    <div class="manager-name">
                      {{ manager.u_name }} {{ manager.u_surname }}
                    </div>
                    <div class="manager-email">{{ manager.u_email }}</div>
                  </div>
                  <div v-if="selectedManager == manager.u_id" class="checkmark">
                    ✓
                  </div>
                </button>
              </div>
            </div>

            <!-- Менеджеры без офиса -->
            <div
              v-if="!selectedOffice || selectedOffice === ''"
              class="managers-section"
            >
              <h4 class="section-title">Менеджеры без офиса</h4>
              <div class="managers-list">
                <button
                  v-for="manager in managersWithoutOffice"
                  :key="manager.u_id"
                  @click="selectManager(manager.u_id)"
                  :class="[
                    'manager-item',
                    { active: selectedManager == manager.u_id },
                  ]"
                >
                  <div class="manager-avatar">
                    {{ getInitials(manager.u_name, manager.u_surname) }}
                  </div>
                  <div class="manager-info">
                    <div class="manager-name">
                      {{ manager.u_name }} {{ manager.u_surname }}
                    </div>
                    <div class="manager-email">{{ manager.u_email }}</div>
                  </div>
                  <div v-if="selectedManager == manager.u_id" class="checkmark">
                    ✓
                  </div>
                </button>
              </div>
            </div>

            <div
              v-if="!getManagersForOffice.length && selectedOffice"
              class="empty-state"
            >
              В этом офисе нет менеджеров
            </div>
          </div>

          <button
            @click="saveMessengerRouting"
            :disabled="!selectedManager || isSaving"
            class="btn btn-success"
          >
            <span v-if="isSaving">Сохранение...</span>
            <span v-else>Сохранить</span>
          </button>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="close" class="btn btn-secondary">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  close: {
    type: Function,
  },
  item: {
    type: Object,
    required: true,
  },
});

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
const loading = ref(false);
const error = ref("");
const isSaving = ref(false);
const successMessage = ref("");

const offices = ref([]);
const managersByOffice = ref({});
const managersWithoutOffice = ref([]);

const selectedOffice = ref("");
const selectedManager = ref("");

const axiosInstance = computed(() => {
  return axios.create({
    headers: {
      Authorization: `Bearer ${token.value}`,
      "Content-Type": "application/json",
    },
  });
});

const getManagersForOffice = computed(() => {
  if (!selectedOffice.value) return [];
  return managersByOffice.value[selectedOffice.value] || [];
});

const getInitials = (firstName, lastName) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const close = () => {
  props.close();
};

const fetchOfficesAndManagers = async () => {
  loading.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    const { data } = await axiosInstance.value.get(
      `${VITE_BASE_URL}uon-account/getOfficesAndManagers?uuid=${props.item.uuid}`
    );

    if (data.ok) {
      offices.value = data.data.offices;
      managersByOffice.value = data.data.managers_by_office;
      managersWithoutOffice.value = data.data.managers_without_office;
    } else {
      error.value = data.message || "Ошибка при загрузке данных";
    }
  } catch (err) {
    error.value =
      err.response?.data?.message || err.message || "Ошибка загрузки данных";
    console.error("Error fetching offices and managers:", err);
  } finally {
    loading.value = false;
  }
};

const selectOffice = (officeId) => {
  selectedOffice.value = officeId;
  selectedManager.value = "";
};

const selectManager = (managerId) => {
  selectedManager.value = managerId;
};

const saveMessengerRouting = async () => {
  const officeId = selectedOffice.value || 0;
  const managerId = selectedManager.value;

  if (!managerId) {
    error.value = "Пожалуйста, выберите менеджера";
    return;
  }

  isSaving.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    const { data } = await axiosInstance.value.post(
      `${VITE_BASE_URL}uon-account/setAccountMessageRouting`,
      {
        uuid: props.item.uuid,
        messenger_vendor_uuid: props.item.uuid,
        office_id: parseInt(officeId),
        manager_id: parseInt(managerId),
      }
    );

    if (data.ok) {
      successMessage.value = "Маршрутизация успешно сохранена";
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    } else {
      error.value = data.message || "Ошибка при сохранении";
    }
  } catch (err) {
    error.value =
      err.response?.data?.message || err.message || "Ошибка сохранения";
    console.error("Error saving messenger routing:", err);
  } finally {
    isSaving.value = false;
  }
};

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      selectedOffice.value = "";
      selectedManager.value = "";
      error.value = "";
      successMessage.value = "";
      fetchOfficesAndManagers();
    }
  }
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  gap: 12px;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
  flex: 1;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.close-btn:hover {
  color: #1f2937;
}

.modal-body {
  padding: 20px;
}

.description {
  background-color: #f3f4f6;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #4b5563;
  border-left: 4px solid #3b82f6;
}

.loading,
.error {
  padding: 16px;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
}

.loading {
  background-color: #e0e7ff;
  color: #3730a3;
}

.error {
  background-color: #fee2e2;
  color: #991b1b;
  margin-bottom: 16px;
}

.success-message {
  background-color: #d1fae5;
  color: #065f46;
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
  border: 1px solid #a7f3d0;
}

.messenger-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background-color: #f9fafb;
}

.messenger-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.messenger-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
}

.messenger-id {
  font-size: 12px;
  color: #9ca3af;
  background-color: white;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  flex-shrink: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

/* Офисы список */
.offices-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.office-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  min-width: 0;
}

.office-item:hover {
  border-color: #3b82f6;
  background-color: #f0f9ff;
}

.office-item.active {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.office-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  word-break: break-word;
}

.office-city {
  font-size: 12px;
  color: #6b7280;
  word-break: break-word;
}

.office-phones {
  font-size: 11px;
  color: #9ca3af;
  word-break: break-word;
  line-height: 1.4;
}

.office-item.without-office {
  font-style: italic;
  color: #9ca3af;
}

/* Менеджеры список */
.managers-section {
  margin-bottom: 16px;
}

.section-title {
  margin: 12px 0 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  word-break: break-word;
}

.managers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.manager-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-width: 0;
}

.manager-item:hover {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.manager-item.active {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.manager-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  font-weight: 600;
  font-size: 12px;
  flex-shrink: 0;
}

.manager-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.manager-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  word-break: break-word;
}

.manager-email {
  font-size: 12px;
  color: #9ca3af;
  word-break: break-all;
}

.checkmark {
  color: #10b981;
  font-size: 18px;
  font-weight: bold;
  flex-shrink: 0;
}

.empty-state {
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  background-color: #f9fafb;
  border-radius: 6px;
}

/* Кнопки */
.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-success {
  background-color: #10b981;
  color: white;
  width: 100%;
  padding: 12px 16px;
}

.btn-success:hover {
  background-color: #059669;
}

.btn-success:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Мобильный адаптив */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 12px;
  }

  .modal-content {
    width: 100%;
    max-height: calc(100vh - 24px);
  }

  .modal-header {
    padding: 16px;
  }

  .modal-header h2 {
    font-size: 18px;
  }

  .close-btn {
    font-size: 24px;
  }

  .modal-body {
    padding: 16px;
  }

  .description {
    padding: 10px;
    font-size: 13px;
  }

  .office-item {
    padding: 10px;
  }

  .office-name {
    font-size: 13px;
  }

  .office-city {
    font-size: 11px;
  }

  .office-phones {
    font-size: 10px;
  }

  .manager-item {
    padding: 10px;
    gap: 10px;
  }

  .manager-avatar {
    width: 36px;
    height: 36px;
    font-size: 11px;
  }

  .manager-name {
    font-size: 13px;
  }

  .manager-email {
    font-size: 11px;
  }

  .form-label {
    font-size: 13px;
  }

  .section-title {
    font-size: 11px;
  }

  .btn {
    font-size: 13px;
    padding: 9px 12px;
  }

  .btn-success {
    padding: 10px 12px;
  }

  .modal-footer {
    padding: 12px 16px;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 8px;
  }

  .modal-content {
    max-height: calc(100vh - 16px);
  }

  .modal-header {
    padding: 12px;
  }

  .modal-header h2 {
    font-size: 16px;
  }

  .modal-body {
    padding: 12px;
  }

  .description {
    padding: 8px;
    font-size: 12px;
  }

  .messenger-card {
    padding: 12px;
  }

  .office-item,
  .manager-item {
    padding: 8px;
    gap: 8px;
  }

  .office-name,
  .manager-name {
    font-size: 12px;
  }

  .office-city,
  .manager-email {
    font-size: 10px;
  }

  .office-phones {
    font-size: 9px;
  }

  .manager-avatar {
    width: 32px;
    height: 32px;
    font-size: 10px;
  }

  .checkmark {
    font-size: 16px;
  }

  .form-label {
    font-size: 12px;
  }

  .section-title {
    font-size: 10px;
    margin: 8px 0 6px 0;
  }

  .btn {
    font-size: 12px;
    padding: 8px 12px;
  }

  .modal-footer {
    padding: 10px 12px;
  }

  .messenger-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .messenger-id {
    align-self: flex-start;
  }
}
</style>
