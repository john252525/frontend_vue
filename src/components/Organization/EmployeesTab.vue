<template>
  <div class="employees-tab">
    <Teleport to="#organization-header-actions">
      <button v-if="canInvite" class="btn btn-primary" @click="openInviteModal">
        + Отправить приглашение
      </button>
    </Teleport>

    <div class="tab-header">
      <div>
        <h3 class="settings-title">Сотрудники</h3>
        <p class="settings-description">
          Список сотрудников с доступом в личный кабинет и их роли.
        </p>
      </div>
    </div>

    <div v-if="loading" class="state-loading">
      <div class="spinner"></div>
      Загрузка...
    </div>

    <div v-else-if="employees.length === 0" class="empty-state">
      Сотрудников пока нет
    </div>

    <table v-else class="table">
      <thead>
        <tr>
          <th>Имя</th>
          <th>Email</th>
          <th>Роль</th>
          <th>Должность</th>
          <th>Статус</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="employee in employees" :key="employee.id">
          <td>{{ fullName(employee) }}</td>
          <td>{{ employee.email }}</td>
          <td>{{ roleLabel(employee.role) }}</td>
          <td>{{ employee.position || "—" }}</td>
          <td>
            <span :class="['status-badge', employee.enabled === false ? 'inactive' : 'active']">
              {{ employee.enabled === false ? "Отключён" : "Активен" }}
            </span>
          </td>
          <td class="actions-cell">
            <button class="icon-btn" title="Редактировать" @click="openEditModal(employee)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              v-if="employee.enabled !== false"
              class="icon-btn danger"
              title="Отключить сотрудника"
              @click="handleDisable(employee)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M4.9 4.9l14.2 14.2" />
              </svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Приглашение нового сотрудника — регистрацию и пароль сотрудник
         задаёт себе сам по ссылке из письма, как сейчас с верификацией
         почты; здесь только запускаем отправку. -->
    <ModalFrame
      v-if="showInviteModal"
      :text="inviteModalText"
      :close="closeInviteModal"
      :action="handleSendInvitation"
      :is-disabled="!inviteEmail"
      :is-loading="inviting"
    >
      <div class="form-group">
        <label class="form-label">Email сотрудника</label>
        <input v-model.trim="inviteEmail" type="email" class="form-input" placeholder="employee@example.com" />
      </div>
      <p class="pending-note">
        На почту придёт приглашение со ссылкой — по ней сотрудник сам
        зарегистрируется и задаст пароль. Роль и доступы можно будет
        настроить после того, как он завершит регистрацию.
      </p>
    </ModalFrame>

    <!-- Редактирование уже зарегистрированного сотрудника -->
    <ModalFrame
      v-if="showEditModal"
      :text="editModalText"
      :close="closeEditModal"
      :action="handleSaveEdit"
      :is-loading="saving"
    >
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Имя</label>
          <input v-model.trim="form.first_name" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Фамилия</label>
          <input v-model.trim="form.last_name" type="text" class="form-input" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Отчество</label>
        <input v-model.trim="form.middle_name" type="text" class="form-input" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Роль</label>
          <select v-model="form.role" class="form-input">
            <option v-for="role in ROLES" :key="role.id" :value="role.id">{{ role.label }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Должность</label>
          <input v-model.trim="form.position" type="text" class="form-input" placeholder="Например, менеджер продаж" />
        </div>
      </div>

      <div v-if="offices.length > 0" class="form-group">
        <label class="form-label">Офисы</label>
        <div class="office-checklist">
          <label v-for="office in offices" :key="office.id" class="office-checkbox">
            <input type="checkbox" :value="office.id" v-model="form.office_ids" />
            {{ office.name }}
          </label>
        </div>
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
const { fetchEmployees, fetchOffices, sendEmployeeInvitation, updateEmployee, disableEmployee } =
  useCompanyApi();
const { setLoadingStatus } = useStationLoading();
const { isOwner, can } = usePermissions();

const ROLES = [
  { id: "manager", label: "Менеджер" },
  { id: "senior_manager", label: "Старший менеджер" },
  { id: "admin", label: "Администратор" },
];

const loading = ref(true);
const saving = ref(false);
const inviting = ref(false);
const showInviteModal = ref(false);
const showEditModal = ref(false);
const editingEmployee = ref(null);
const inviteEmail = ref("");

// Добавление сотрудников — тоже часть ролевой матрицы (owner может всегда,
// остальным нужно явно разрешённое право managers.add).
const canInvite = computed(() => isOwner.value || can("managers", "add"));

const form = reactive({
  role: "manager",
  first_name: "",
  last_name: "",
  middle_name: "",
  position: "",
  office_ids: [],
});

const employees = computed(() => companyStore.getEmployees);
const offices = computed(() => companyStore.getOffices);

const roleLabel = (roleId) => ROLES.find((r) => r.id === roleId)?.label || roleId || "—";

const fullName = (employee) =>
  [employee.last_name, employee.first_name, employee.middle_name].filter(Boolean).join(" ") ||
  employee.email;

const inviteModalText = { title: "Пригласить сотрудника", close: "Отмена", action: "Отправить приглашение" };
const editModalText = { title: "Редактировать сотрудника", close: "Отмена", action: "Сохранить" };

const openInviteModal = () => {
  inviteEmail.value = "";
  showInviteModal.value = true;
};

const closeInviteModal = () => {
  showInviteModal.value = false;
};

const openEditModal = (employee) => {
  editingEmployee.value = employee;
  form.role = employee.role || "manager";
  form.first_name = employee.first_name || "";
  form.last_name = employee.last_name || "";
  form.middle_name = employee.middle_name || "";
  form.position = employee.position || "";
  form.office_ids = employee.office_ids ? [...employee.office_ids] : [];
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingEmployee.value = null;
};

const handleSendInvitation = async () => {
  if (!inviteEmail.value) return;
  inviting.value = true;
  try {
    await sendEmployeeInvitation(inviteEmail.value);
    setLoadingStatus(true, "success", `Приглашение отправлено на ${inviteEmail.value}`);
    showInviteModal.value = false;
  } catch (error) {
    console.error("Ошибка при отправке приглашения:", error);
    setLoadingStatus(true, "error", error.response?.data?.message || "Не удалось отправить приглашение");
  } finally {
    inviting.value = false;
  }
};

const handleSaveEdit = async () => {
  if (!editingEmployee.value) return;
  saving.value = true;
  try {
    await updateEmployee(editingEmployee.value.id, {
      role: form.role,
      first_name: form.first_name,
      last_name: form.last_name,
      middle_name: form.middle_name,
      position: form.position,
      office_ids: form.office_ids,
      enabled: editingEmployee.value.enabled !== false,
    });
    setLoadingStatus(true, "success", "Сотрудник сохранён");
    showEditModal.value = false;
  } catch (error) {
    console.error("Ошибка при сохранении сотрудника:", error);
    setLoadingStatus(true, "error", error.response?.data?.message || "Не удалось сохранить сотрудника");
  } finally {
    saving.value = false;
  }
};

const handleDisable = async (employee) => {
  try {
    await disableEmployee(employee.id);
    setLoadingStatus(true, "success", "Сотрудник отключён");
  } catch (error) {
    console.error("Ошибка при отключении сотрудника:", error);
    setLoadingStatus(true, "error", "Не удалось отключить сотрудника");
  }
};

onMounted(async () => {
  loading.value = true;
  await Promise.all([fetchEmployees(), fetchOffices()]);
  loading.value = false;
});
</script>

<style scoped>
.employees-tab {
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
  gap: 0.5rem;
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

.icon-btn.danger:hover {
  background: #fee2e2;
  color: #ef4444;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.form-input:disabled {
  background: var(--tableAccountBg);
  cursor: not-allowed;
}

.office-checklist {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 140px;
  overflow-y: auto;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
}

.office-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text);
  cursor: pointer;
}

.pending-note {
  margin: 1rem 0 0;
  padding: 0.65rem 0.75rem;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 0.5rem;
  font-size: 0.78rem;
  color: #78350f;
  line-height: 1.4;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
