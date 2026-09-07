<template>
  <div class="offices-tab">
    <Teleport to="#organization-header-actions">
      <button v-if="isOwner" class="btn btn-primary" @click="openCreateModal">
        + Добавить офис
      </button>
    </Teleport>

    <div class="tab-header">
      <div>
        <h3 class="settings-title">Офисы</h3>
        <p class="settings-description">
          Актуально, если у компании несколько филиалов. Сотрудника можно не привязывать ни к одному офису.
        </p>
      </div>
    </div>

    <div v-if="loading" class="state-loading">
      <div class="spinner"></div>
      Загрузка...
    </div>

    <div v-else-if="offices.length === 0" class="empty-state">
      Офисов пока нет
    </div>

    <table v-else class="table">
      <thead>
        <tr>
          <th>Название</th>
          <th>Адрес</th>
          <th>Статус</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="office in offices" :key="office.id">
          <td>{{ office.name }}</td>
          <td>{{ office.address || "—" }}</td>
          <td>
            <span :class="['status-badge', office.enabled === false ? 'inactive' : 'active']">
              {{ office.enabled === false ? "Выключен" : "Включён" }}
            </span>
          </td>
          <td class="actions-cell">
            <button class="icon-btn" title="Редактировать" @click="openEditModal(office)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <label class="switch">
              <input
                type="checkbox"
                :checked="office.enabled !== false"
                @change="handleToggleEnabled(office, $event)"
              />
              <span class="slider round"></span>
            </label>
          </td>
        </tr>
      </tbody>
    </table>

    <ModalFrame
      v-if="showModal"
      :text="modalText"
      :close="closeModal"
      :action="handleSave"
      :is-disabled="!form.name"
      :is-loading="saving"
    >
      <div class="form-group">
        <label class="form-label">Название</label>
        <input v-model.trim="form.name" type="text" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label">Адрес</label>
        <input v-model.trim="form.address" type="text" class="form-input" />
      </div>
    </ModalFrame>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";
import { useCompanyStore } from "@/stores/companyStore";
import { useCompanyApi } from "@/composables/useCompanyApi";
import { useStationLoading } from "@/composables/useStationLoading";
import { usePermissions } from "@/composables/usePermissions";

const companyStore = useCompanyStore();
const { fetchOffices, createOffice, updateOffice, toggleOfficeEnabled } = useCompanyApi();
const { setLoadingStatus } = useStationLoading();
const { isOwner } = usePermissions();

const loading = ref(true);
const saving = ref(false);
const showModal = ref(false);
const editingOffice = ref(null);
const form = reactive({ name: "", address: "" });

const offices = computed(() => companyStore.getOffices);

const modalText = computed(() => ({
  title: editingOffice.value ? "Редактировать офис" : "Добавить офис",
  close: "Отмена",
  action: saving.value ? "Сохраняем..." : "Сохранить",
}));

const openCreateModal = () => {
  editingOffice.value = null;
  form.name = "";
  form.address = "";
  showModal.value = true;
};

const openEditModal = (office) => {
  editingOffice.value = office;
  form.name = office.name || "";
  form.address = office.address || "";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleSave = async () => {
  if (!form.name) return;
  saving.value = true;
  try {
    if (editingOffice.value) {
      await updateOffice(editingOffice.value.id, { ...form, enabled: editingOffice.value.enabled !== false });
    } else {
      await createOffice({ ...form });
    }
    setLoadingStatus(true, "success", "Офис сохранён");
    showModal.value = false;
  } catch (error) {
    console.error("Ошибка при сохранении офиса:", error);
    setLoadingStatus(true, "error", error.response?.data?.message || "Не удалось сохранить офис");
  } finally {
    saving.value = false;
  }
};

const handleToggleEnabled = async (office, event) => {
  const nextValue = event.target.checked;
  try {
    await toggleOfficeEnabled(office.id, nextValue);
  } catch (error) {
    console.error("Ошибка при переключении офиса:", error);
    event.target.checked = !nextValue;
    setLoadingStatus(true, "error", "Не удалось изменить статус офиса");
  }
};

onMounted(async () => {
  loading.value = true;
  await fetchOffices();
  loading.value = false;
});
</script>

<style scoped>
.offices-tab {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.tab-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.settings-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text);
}

.settings-description {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--headerAccountText);
}

.btn {
  padding: 0.625rem 1.1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primaryHover);
}

.state-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  color: var(--headerAccountText);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--line);
  border-top: 2px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--headerAccountText);
  background: var(--tableAccountBg);
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
}

.table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--headerAccountText);
  background: var(--tableAccountBg);
  border-bottom: 1px solid var(--line);
}

.table td {
  padding: 12px 16px;
  font-size: 0.875rem;
  color: var(--text);
  border-bottom: 1px solid var(--line);
}

.table tr:last-child td {
  border-bottom: none;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.active {
  background: #dcfce7;
  color: #15803d;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.actions-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: flex-end;
}

.icon-btn {
  background: transparent;
  border: none;
  color: var(--headerAccountText);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
}

.icon-btn:hover {
  background: var(--tableAccountBg);
  color: var(--text);
}

.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  flex-shrink: 0;
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
  background: #cbd5e1;
  transition: all 0.3s ease;
  border-radius: 20px;
}

.slider::before {
  content: "";
  position: absolute;
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background: white;
  transition: all 0.3s ease;
  border-radius: 50%;
}

.switch input:checked + .slider {
  background: var(--primary);
}

.switch input:checked + .slider::before {
  transform: translateX(16px);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--headerAccountText);
}

.form-input {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 2px solid var(--line);
  border-radius: 0.5rem;
  font-size: 0.9rem;
  background: var(--input);
  color: var(--text);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}
</style>
