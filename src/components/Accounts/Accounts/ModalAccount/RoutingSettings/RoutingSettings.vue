<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <h2>Менеджеры по умолчанию</h2>
        </div>
        <button class="close-btn" @click="close">&times;</button>
      </div>

      <div class="modal-body">
        <p class="description">
          Установка менеджера по умолчанию для каналов. Поступающие в канал
          сообщения от новых клиентов будут направляться на выбранного
          менеджера.
        </p>

        <div v-if="loading" class="loading">
          <span class="spinner"></span>
          Загрузка данных...
        </div>

        <div v-else-if="error" class="error-banner">
          {{ error }}
        </div>

        <template v-else>
          <!-- Выбор канала -->
          <VendorList v-model="selectedVendor" :vendors="vendors" />

          <!-- Основная форма -->
          <div class="form-card">
            <div class="form-header">
              <h3>{{ item.name }}</h3>
              <span class="form-id">{{ item.source }}</span>
            </div>

            <!-- Выбор офиса -->
            <div class="form-group">
              <label class="form-label">
                <span class="step-badge">2</span>
                Выберите офис:
              </label>
              <div class="options-list">
                <button
                  v-for="office in offices"
                  :key="office.id"
                  @click="selectOffice(office.id)"
                  :class="[
                    'option-item',
                    { active: selectedOffice == office.id },
                  ]"
                >
                  <div class="option-text">
                    <div class="option-title">{{ office.name }}</div>
                    <div class="option-meta">
                      {{ office.city }} • {{ office.phones }}
                    </div>
                  </div>
                  <div v-if="selectedOffice == office.id" class="option-check">
                    ✓
                  </div>
                </button>

                <button
                  @click="selectOffice('')"
                  :class="[
                    'option-item',
                    'option-alt',
                    { active: selectedOffice === '' },
                  ]"
                >
                  <div class="option-text">
                    <div class="option-title">Без офиса</div>
                  </div>
                  <div v-if="selectedOffice === ''" class="option-check">✓</div>
                </button>
              </div>
            </div>

            <!-- Выбор менеджера -->
            <div class="form-group">
              <label class="form-label">
                <span class="step-badge">3</span>
                Выберите менеджера:
              </label>

              <!-- Менеджеры офиса -->
              <div v-if="selectedOffice && getManagersForOffice.length > 0">
                <div class="section-label">Менеджеры офиса</div>
                <div class="options-list">
                  <button
                    v-for="manager in getManagersForOffice"
                    :key="manager.u_id"
                    @click="selectManager(manager.u_id)"
                    :class="[
                      'option-item',
                      { active: selectedManager == manager.u_id },
                    ]"
                  >
                    <div class="manager-avatar">
                      {{ getInitials(manager.u_name, manager.u_surname) }}
                    </div>
                    <div class="option-text">
                      <div class="option-title">
                        {{ manager.u_name }} {{ manager.u_surname }}
                      </div>
                      <div class="option-meta">{{ manager.u_email }}</div>
                    </div>
                    <div
                      v-if="selectedManager == manager.u_id"
                      class="option-check"
                    >
                      ✓
                    </div>
                  </button>
                </div>
              </div>

              <!-- Менеджеры без офиса -->
              <div v-if="!selectedOffice || selectedOffice === ''">
                <div class="section-label">Менеджеры без офиса</div>
                <div
                  v-if="managersWithoutOffice.length > 0"
                  class="options-list"
                >
                  <button
                    v-for="manager in managersWithoutOffice"
                    :key="manager.u_id"
                    @click="selectManager(manager.u_id)"
                    :class="[
                      'option-item',
                      { active: selectedManager == manager.u_id },
                    ]"
                  >
                    <div class="manager-avatar">
                      {{ getInitials(manager.u_name, manager.u_surname) }}
                    </div>
                    <div class="option-text">
                      <div class="option-title">
                        {{ manager.u_name }} {{ manager.u_surname }}
                      </div>
                      <div class="option-meta">{{ manager.u_email }}</div>
                    </div>
                    <div
                      v-if="selectedManager == manager.u_id"
                      class="option-check"
                    >
                      ✓
                    </div>
                  </button>
                </div>
                <div v-else class="empty-state">Нет менеджеров без офиса</div>
              </div>

              <div
                v-if="!getManagersForOffice.length && selectedOffice"
                class="empty-state"
              >
                В этом офисе нет менеджеров
              </div>
            </div>

            <!-- Кнопки -->
            <div class="form-actions">
              <button
                @click="saveMessengerRouting"
                :disabled="!selectedManager || isSaving"
                class="btn btn-primary"
              >
                <span v-if="isSaving">Сохранение...</span>
                <span v-else>Сохранить</span>
              </button>
            </div>

            <div v-if="successMessage" class="success-message">
              {{ successMessage }}
            </div>
          </div>
        </template>
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
import VendorList from "./VendorList.vue";

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
  vendors: {
    type: Object,
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

const selectedVendor = ref("");
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
    const payload = {
      uuid: selectedVendor.value,
      messenger_vendor_uuid: props.item.uuid,
      office_id: parseInt(officeId),
      manager_id: parseInt(managerId),
    };

    console.log(payload);

    const { data } = await axiosInstance.value.post(
      `${VITE_BASE_URL}uon-account/setAccountMessageRouting`,
      payload
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
/* === MODAL === */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  max-width: 650px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

/* === HEADER === */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e5e5;
  gap: 12px;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
  flex: 1;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

/* === BODY === */
.modal-body {
  padding: 16px;
}

.description {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 14px;
  font-size: 13px;
  color: #555;
  border-left: 3px solid #2563eb;
  line-height: 1.4;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  border-radius: 5px;
  background-color: #f0f7ff;
  color: #1e40af;
  font-size: 13px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #dbeafe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-banner {
  padding: 10px;
  border-radius: 5px;
  background-color: #fee2e2;
  color: #991b1b;
  margin-bottom: 14px;
  font-size: 13px;
  border-left: 3px solid #dc2626;
}

/* === STEP BADGE === */
.step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  background-color: #2563eb;
  color: white;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

/* === FORM CARD === */
.form-card {
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 14px;
  background-color: #fafafa;
  margin-bottom: 14px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e5e5;
}

.form-header h3 {
  margin: 0;
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

.form-id {
  font-size: 11px;
  color: white;
  background-color: #2563eb;
  padding: 3px 8px;
  border-radius: 3px;
  text-transform: uppercase;
  font-weight: 600;
  flex-shrink: 0;
}

/* === FORM GROUPS === */
.form-group {
  margin-bottom: 14px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  margin-top: 10px;
}

.section-label:first-child {
  margin-top: 0;
}

/* === OPTIONS LIST === */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border: 1px solid #d5d5d5;
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  position: relative;
  min-height: 44px;
}

.option-item:hover {
  border-color: #2563eb;
  background-color: #f9f9f9;
}

.option-item.active {
  border-color: #2563eb;
  background-color: #f0f7ff;
}

.option-item.option-alt {
  color: #777;
  font-style: italic;
}

.option-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.option-title {
  font-weight: 500;
  color: #333;
  font-size: 12px;
  word-break: break-word;
}

.option-meta {
  font-size: 11px;
  color: #999;
  word-break: break-word;
}

.option-alt .option-title {
  color: #777;
}

.manager-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #2563eb;
  color: white;
  font-weight: 600;
  font-size: 11px;
  flex-shrink: 0;
}

.option-check {
  color: #10b981;
  font-size: 16px;
  font-weight: bold;
  flex-shrink: 0;
}

.empty-state {
  padding: 12px;
  text-align: center;
  color: #999;
  font-size: 12px;
  background-color: white;
  border-radius: 5px;
  border: 1px dashed #d5d5d5;
}

/* === FORM ACTIONS === */
.form-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.btn {
  padding: 10px 14px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: #10b981;
  color: white;
  width: 100%;
  min-height: 40px;
}

.btn-primary:hover:not(:disabled) {
  background-color: #059669;
}

.btn-primary:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.success-message {
  padding: 10px;
  border-radius: 5px;
  background-color: #d1fae5;
  color: #065f46;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #a7f3d0;
  text-align: center;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

/* === FOOTER === */
.modal-footer {
  padding: 12px 16px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  background-color: #fafafa;
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 12px;
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
    margin-bottom: 12px;
  }

  .form-card {
    padding: 12px;
    margin-bottom: 12px;
  }

  .form-header h3 {
    font-size: 13px;
  }

  .form-label {
    font-size: 12px;
    margin-bottom: 7px;
  }

  .option-item {
    padding: 7px;
    min-height: 40px;
    gap: 8px;
  }

  .option-title {
    font-size: 11px;
  }

  .option-meta {
    font-size: 10px;
  }

  .manager-avatar {
    width: 32px;
    height: 32px;
    font-size: 10px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .modal-footer {
    padding: 10px 12px;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 8px;
  }

  .modal-header {
    padding: 10px;
  }

  .modal-header h2 {
    font-size: 15px;
  }

  .close-btn {
    width: 24px;
    height: 24px;
    font-size: 20px;
  }

  .modal-body {
    padding: 10px;
  }

  .description {
    padding: 8px;
    font-size: 11px;
    margin-bottom: 10px;
  }

  .form-card {
    padding: 10px;
    margin-bottom: 10px;
  }

  .form-header {
    margin-bottom: 10px;
    padding-bottom: 8px;
  }

  .form-header h3 {
    font-size: 12px;
  }

  .form-id {
    font-size: 10px;
    padding: 2px 6px;
  }

  .form-label {
    font-size: 11px;
    gap: 6px;
    margin-bottom: 6px;
  }

  .section-label {
    font-size: 10px;
    margin-bottom: 5px;
    margin-top: 8px;
  }

  .option-item {
    padding: 6px;
    gap: 6px;
    min-height: 36px;
  }

  .option-title {
    font-size: 10px;
  }

  .option-meta {
    font-size: 9px;
  }

  .manager-avatar {
    width: 30px;
    height: 30px;
    font-size: 9px;
  }

  .option-check {
    font-size: 14px;
  }

  .btn {
    font-size: 12px;
    padding: 8px 12px;
    min-height: 36px;
  }

  .form-group {
    margin-bottom: 10px;
  }

  .modal-footer {
    padding: 8px 10px;
  }

  .success-message {
    padding: 8px;
    font-size: 11px;
  }
}
</style>
