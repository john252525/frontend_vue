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
          менеджера. Можно выбрать компанию, компанию-офис или
          компанию-офис-менеджера.
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

            <!-- Выбор компании -->
            <div class="form-group">
              <label class="form-label">
                <span class="step-badge">1</span>
                Выберите компанию:
              </label>
              <div class="options-list">
                <button
                  v-for="company in companies"
                  :key="company.id"
                  @click="selectCompany(company.id)"
                  :class="[
                    'option-item',
                    { active: selectedCompany == company.id },
                  ]"
                >
                  <div class="option-text">
                    <div class="option-title">{{ company.name_rus }}</div>
                    <div class="option-meta">
                      {{ company.phones || "Телефон не указан" }}
                    </div>
                  </div>
                  <div
                    v-if="selectedCompany == company.id"
                    class="option-check"
                  >
                    ✓
                  </div>
                </button>

                <button
                  @click="selectCompany('')"
                  :class="[
                    'option-item',
                    'option-alt',
                    { active: selectedCompany === '' },
                  ]"
                >
                  <div class="option-text">
                    <div class="option-title">Без компании</div>
                    <div class="option-meta">
                      Выберите только менеджера без привязки к компании
                    </div>
                  </div>
                  <div v-if="selectedCompany === ''" class="option-check">
                    ✓
                  </div>
                </button>
              </div>
            </div>

            <!-- Выбор офиса (только если выбрана компания) -->
            <div v-if="selectedCompany" class="form-group">
              <label class="form-label">
                <span class="step-badge">2</span>
                Выберите офис (необязательно):
              </label>
              <div v-if="filteredOffices.length > 0" class="options-list">
                <button
                  v-for="office in filteredOffices"
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
                      {{ office.city || "Город не указан" }} •
                      {{ office.phones || "Телефон не указан" }}
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
                    <div class="option-meta">
                      Выбрать только компанию без привязки к офису
                    </div>
                  </div>
                  <div v-if="selectedOffice === ''" class="option-check">✓</div>
                </button>
              </div>
              <div v-else class="empty-state">
                У выбранной компании нет офисов
              </div>
            </div>

            <!-- Выбор менеджера -->
            <div class="form-group">
              <label class="form-label">
                <span class="step-badge">{{
                  selectedCompany ? "3" : "2"
                }}</span>
                Выберите менеджера (необязательно):
              </label>

              <!-- Менеджеры по фильтрам -->
              <template v-if="filteredManagers.length > 0">
                <div class="section-label">Доступные менеджеры</div>
                <div class="options-list">
                  <button
                    v-for="manager in filteredManagers"
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
                      <div class="option-meta">
                        {{ manager.u_email }}
                        <span v-if="manager.office_id">
                          • Офис ID: {{ manager.office_id }}
                        </span>
                      </div>
                    </div>
                    <div
                      v-if="selectedManager == manager.u_id"
                      class="option-check"
                    >
                      ✓
                    </div>
                  </button>
                </div>
              </template>

              <!-- Вариант без менеджера -->
              <div class="options-list">
                <button
                  @click="selectManager('')"
                  :class="[
                    'option-item',
                    'option-alt',
                    { active: selectedManager === '' },
                  ]"
                >
                  <div class="option-text">
                    <div class="option-title">Без менеджера</div>
                    <div class="option-meta">
                      Настроить только компанию и/или офис
                    </div>
                  </div>
                  <div v-if="selectedManager === ''" class="option-check">
                    ✓
                  </div>
                </button>
              </div>

              <div
                v-if="
                  !filteredManagers.length &&
                  (selectedCompany || selectedOffice)
                "
                class="empty-state"
              >
                Нет доступных менеджеров по выбранным критериям
              </div>
            </div>

            <!-- Информация о текущем выборе -->
            <div
              v-if="selectedCompany || selectedOffice || selectedManager"
              class="selection-summary"
            >
              <div class="summary-title">Вы выбрали:</div>
              <div class="summary-items">
                <div v-if="selectedCompany" class="summary-item">
                  <strong>Компания:</strong>
                  {{ getCompanyName(selectedCompany) }}
                </div>
                <div v-if="selectedOffice" class="summary-item">
                  <strong>Офис:</strong> {{ getOfficeName(selectedOffice) }}
                </div>
                <div v-if="selectedManager" class="summary-item">
                  <strong>Менеджер:</strong>
                  {{ getManagerName(selectedManager) }}
                </div>
                <div
                  v-if="!selectedCompany && !selectedOffice && !selectedManager"
                  class="summary-item"
                >
                  <em>Ничего не выбрано</em>
                </div>
              </div>
            </div>

            <!-- Кнопки -->
            <div class="form-actions">
              <button
                @click="saveMessengerRouting"
                :disabled="isSaving"
                class="btn btn-primary"
              >
                <span v-if="isSaving">Сохранение...</span>
                <span v-else>Сохранить настройки</span>
              </button>
            </div>

            <div v-if="successMessage" class="success-message">
              {{ successMessage }}
            </div>
            <div v-if="saveError" class="error-banner">
              {{ saveError }}
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
const saveError = ref("");

const companies = ref([]);
const officesByCompany = ref({});
const managersByOffice = ref({});
const managersWithoutOffice = ref([]);

const currentSettings = ref(null);

const selectedVendor = ref("");
const selectedCompany = ref("");
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

// computed для отфильтрованных данных
const filteredOffices = computed(() => {
  if (!selectedCompany.value) return [];
  return officesByCompany.value[selectedCompany.value] || [];
});

const filteredManagers = computed(() => {
  let managers = [];

  if (selectedOffice.value) {
    managers = managersByOffice.value[selectedOffice.value] || [];
  } else if (selectedCompany.value && !selectedOffice.value) {
    managers = managersWithoutOffice.value.filter(
      (m) => !m.office_id || m.office_id === 0,
    );
  } else if (!selectedCompany.value) {
    managers = managersWithoutOffice.value;
  }

  return managers;
});

// Хелперы для отображения названий
const getCompanyName = (companyId) => {
  const company = companies.value.find((c) => c.id == companyId);
  return company ? company.name_rus : "Неизвестная компания";
};

const getOfficeName = (officeId) => {
  const office = Object.values(officesByCompany.value)
    .flat()
    .find((o) => o.id == officeId);
  return office ? office.name : "Неизвестный офис";
};

const getManagerName = (managerId) => {
  const allManagers = [
    ...Object.values(managersByOffice.value).flat(),
    ...managersWithoutOffice.value,
  ];
  const manager = allManagers.find((m) => m.u_id == managerId);
  return manager
    ? `${manager.u_name} ${manager.u_surname}`
    : "Неизвестный менеджер";
};

const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
};

// Закрытие модалки
const close = () => {
  props.close();
};

// Загрузка справочников (компании, офисы, менеджеры)
const fetchOfficesAndManagers = async () => {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await axiosInstance.value.get(
      `${VITE_BASE_URL}uon-account/getOfficesAndManagers?uuid=${props.item.uuid}`,
    );

    if (data.ok) {
      companies.value = data.data.companies || [];
      officesByCompany.value = data.data.offices_by_company || {};
      managersByOffice.value = data.data.managers_by_office || {};
      managersWithoutOffice.value = data.data.managers_without_office || [];
    } else {
      error.value = data.message || "Ошибка при загрузке справочников";
    }
  } catch (err) {
    error.value =
      err.response?.data?.message || err.message || "Ошибка загрузки данных";
    console.error("fetchOfficesAndManagers error:", err);
  } finally {
    loading.value = false;
  }
};

// Загрузка текущих сохранённых настроек маршрутизации
const fetchCurrentSettings = async () => {
  if (!props.item?.uuid) return;

  try {
    const { data } = await axiosInstance.value.get(
      `${VITE_BASE_URL}uon-account/getAccountMessageRouting?uuid=${props.item.uuid}`,
    );

    if (data.ok && data.data) {
      currentSettings.value = data.data;

      // Явно приводим к строкам и устанавливаем
      selectedCompany.value = data.data.company_id
        ? String(data.data.company_id)
        : "";
      selectedOffice.value = data.data.office_id
        ? String(data.data.office_id)
        : "";
      selectedManager.value = data.data.manager_id
        ? String(data.data.manager_id)
        : "";

      console.debug(`Настройки загружены для ${props.item.uuid}:`, {
        company: selectedCompany.value,
        office: selectedOffice.value,
        manager: selectedManager.value,
      });
    } else {
      // Нет настроек — оставляем пустыми (нормальная ситуация)
      selectedCompany.value = "";
      selectedOffice.value = "";
      selectedManager.value = "";
    }
  } catch (err) {
    console.error("Ошибка загрузки текущих настроек:", err);
    // Не сбрасываем значения при ошибке — оставляем то, что было
  }
};

// Выборы
const selectCompany = (companyId) => {
  selectedCompany.value = companyId;
  selectedOffice.value = ""; // сбрасываем офис при смене компании
  selectedManager.value = ""; // и менеджера
};

const selectOffice = (officeId) => {
  selectedOffice.value = officeId;
  selectedManager.value = ""; // сбрасываем менеджера при смене офиса
};

const selectManager = (managerId) => {
  selectedManager.value = managerId;
};

// Сохранение
const saveMessengerRouting = async () => {
  isSaving.value = true;
  saveError.value = "";
  successMessage.value = "";

  try {
    const payload = {
      uuid: props.item.uuid,
      messenger_vendor_uuid: selectedVendor.value,
      company_id: selectedCompany.value ? parseInt(selectedCompany.value) : 0,
      office_id: selectedOffice.value ? parseInt(selectedOffice.value) : 0,
      manager_id: selectedManager.value ? parseInt(selectedManager.value) : 0,
    };

    console.log("Сохранение маршрутизации:", payload);

    const { data } = await axiosInstance.value.post(
      `${VITE_BASE_URL}uon-account/setAccountMessageRouting`,
      payload,
    );

    if (data.ok) {
      successMessage.value = "Настройки успешно сохранены";
      // Перезагружаем текущие настройки для подтверждения
      await fetchCurrentSettings();
      setTimeout(() => (successMessage.value = ""), 3000);
    } else {
      saveError.value = data.message || "Ошибка при сохранении";
    }
  } catch (err) {
    saveError.value =
      err.response?.data?.message || err.message || "Ошибка сохранения";
    console.error("saveMessengerRouting error:", err);
  } finally {
    isSaving.value = false;
  }
};

// ────────────────────────────────────────────────
// Реакции на изменения
// ────────────────────────────────────────────────

// При открытии модалки — загружаем справочники
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      error.value = "";
      saveError.value = "";
      successMessage.value = "";
      fetchOfficesAndManagers();
    }
  },
);

// Главная логика: реагируем на смену канала / item.uuid
watch(
  () => props.item?.uuid,
  async (newUuid, oldUuid) => {
    if (!newUuid || newUuid === oldUuid) return;

    // Сбрасываем выборы при переключении на другой канал
    selectedVendor.value = newUuid; // или props.item.uuid — в зависимости от логики VendorList
    selectedCompany.value = "";
    selectedOffice.value = "";
    selectedManager.value = "";

    // 1. Загружаем справочники для нового uuid
    await fetchOfficesAndManagers();

    // 2. Загружаем сохранённые настройки именно этого канала
    await fetchCurrentSettings();
  },
  { immediate: true }, // срабатывает сразу при монтировании
);

// Если выбрали офис — автоматически подставляем компанию (если ещё не выбрана)
watch(
  () => selectedOffice.value,
  (newOfficeId) => {
    if (newOfficeId && !selectedCompany.value) {
      for (const [companyId, offices] of Object.entries(
        officesByCompany.value,
      )) {
        if (offices.some((o) => o.id == newOfficeId)) {
          selectedCompany.value = companyId;
          break;
        }
      }
    }
  },
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
  max-width: 700px;
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
  border-style: dashed;
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

/* === SELECTION SUMMARY === */
.selection-summary {
  padding: 10px;
  border-radius: 5px;
  background-color: #f0f7ff;
  border: 1px solid #dbeafe;
  margin-bottom: 14px;
}

.summary-title {
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 6px;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item {
  font-size: 11px;
  color: #333;
  line-height: 1.4;
}

.summary-item strong {
  color: #2563eb;
  font-weight: 600;
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
