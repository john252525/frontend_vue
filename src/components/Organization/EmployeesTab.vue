<template>
  <div class="employees-tab">
    <Teleport to="#organization-header-actions">
      <button v-if="canInvite" class="btn btn-primary" @click="openAddModal">
        + Добавить сотрудника
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
          <td>{{ employee.email || "—" }}</td>
          <td>{{ roleLabel(employee.role) }}</td>
          <td>{{ employee.position || "—" }}</td>
          <td>
            <div class="status-cell">
              <label class="switch" :title="employee.enabled === false ? 'Включить сотрудника' : 'Отключить сотрудника'">
                <input
                  type="checkbox"
                  :checked="employee.enabled !== false"
                  @click.prevent="openToggleConfirm(employee)"
                />
                <span class="slider round"></span>
              </label>
              <span :class="['status-badge', employee.enabled === false ? 'inactive' : 'active']">
                {{ employee.enabled === false ? "Отключён" : "Активен" }}
              </span>
            </div>
          </td>
          <td class="actions-cell">
            <button class="icon-btn" title="Редактировать" @click="openEditModal(employee)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Добавление сотрудника — двухшаговый процесс, обязательно в этом
         порядке: сначала создаём запись в БД (email/роль/имя/должность/
         офисы), и только затем шлём приглашение на ту же почту — метод
         sendInvitation не создаёт сотрудника сам, а лишь ищет уже
         существующую запись и шлёт ей одноразовую ссылку для входа. -->
    <ModalFrame
      v-if="showAddModal"
      :text="addModalText"
      :close="closeAddModal"
      :action="handleAddEmployee"
      :is-disabled="!canSubmitAdd"
      :is-loading="adding"
    >
      <div class="form-group">
        <label class="form-label">Email сотрудника</label>
        <input v-model.trim="addForm.email" type="email" class="form-input" placeholder="employee@example.com" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Имя</label>
          <input v-model.trim="addForm.first_name" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Фамилия</label>
          <input v-model.trim="addForm.last_name" type="text" class="form-input" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Отчество</label>
        <input v-model.trim="addForm.middle_name" type="text" class="form-input" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Роль</label>
          <select v-model="addForm.role" class="form-input">
            <option v-for="role in ROLES" :key="role.id" :value="role.id">{{ role.label }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Должность</label>
          <input v-model.trim="addForm.position" type="text" class="form-input" placeholder="Например, менеджер продаж" />
        </div>
      </div>

      <div v-if="offices.length > 0" class="form-group">
        <label class="form-label">Офисы</label>
        <div class="office-checklist">
          <label v-for="office in offices" :key="office.id" class="office-checkbox">
            <input type="checkbox" :value="office.id" v-model="addForm.office_ids" />
            {{ office.name }}
          </label>
        </div>
      </div>
    </ModalFrame>

    <!-- Редактирование уже добавленного сотрудника. Роль после создания не
         меняется этим методом (её нет в схеме employees/update), поэтому
         показываем её здесь только для справки. -->
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
          <input :value="roleLabel(form.role)" type="text" class="form-input" disabled />
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

    <!-- Подтверждение включения/отключения — доступ в кабинет пропадает/
         появляется сразу, поэтому не даём переключить в один клик. -->
    <ModalFrame
      v-if="showToggleConfirm"
      :text="toggleConfirmText"
      :close="closeToggleConfirm"
      :action="handleConfirmToggle"
      :is-loading="toggling"
    >
      <p class="confirm-text">
        <template v-if="confirmToggleEmployee?.enabled === false">
          Включить сотрудника «{{ fullName(confirmToggleEmployee) }}»? Он
          снова получит доступ в личный кабинет.
        </template>
        <template v-else>
          Отключить сотрудника «{{ fullName(confirmToggleEmployee) }}»? Он
          потеряет доступ в личный кабинет.
        </template>
      </p>
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
const {
  fetchEmployees,
  fetchOffices,
  addEmployee,
  sendEmployeeInvitation,
  updateEmployee,
  disableEmployee,
  enableEmployee,
} = useCompanyApi();
const { setLoadingStatus } = useStationLoading();
const { isOwner, can } = usePermissions();

const ROLES = [
  { id: "manager", label: "Менеджер" },
  { id: "senior_manager", label: "Старший менеджер" },
  { id: "admin", label: "Администратор" },
];

const loading = ref(true);
const saving = ref(false);
const adding = ref(false);
const showAddModal = ref(false);
const showEditModal = ref(false);
const editingEmployee = ref(null);

// Добавление сотрудников — тоже часть ролевой матрицы (owner может всегда,
// остальным нужно явно разрешённое право managers.add).
const canInvite = computed(() => isOwner.value || can("managers", "add"));

const addForm = reactive({
  email: "",
  role: "manager",
  first_name: "",
  last_name: "",
  middle_name: "",
  position: "",
  office_ids: [],
});

const form = reactive({
  role: "manager",
  first_name: "",
  last_name: "",
  middle_name: "",
  position: "",
  office_ids: [],
});

const canSubmitAdd = computed(
  () => !!addForm.email && !!addForm.first_name && !!addForm.last_name,
);

const employees = computed(() => companyStore.getEmployees);
const offices = computed(() => companyStore.getOffices);

const roleLabel = (roleId) => ROLES.find((r) => r.id === roleId)?.label || roleId || "—";

const fullName = (employee) =>
  [employee.last_name, employee.first_name, employee.middle_name].filter(Boolean).join(" ") ||
  employee.email ||
  "—";

const addModalText = { title: "Добавить сотрудника", close: "Отмена", action: "Добавить и пригласить" };
const editModalText = { title: "Редактировать сотрудника", close: "Отмена", action: "Сохранить" };

const openAddModal = () => {
  addForm.email = "";
  addForm.role = "manager";
  addForm.first_name = "";
  addForm.last_name = "";
  addForm.middle_name = "";
  addForm.position = "";
  addForm.office_ids = [];
  showAddModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
};

const openEditModal = (employee) => {
  editingEmployee.value = employee;
  form.role = employee.role || "manager";
  form.first_name = employee.first_name || "";
  form.last_name = employee.last_name || "";
  form.middle_name = employee.middle_name || "";
  form.position = employee.position || "";
  // Бэк отдаёт список офисов сотрудника в поле "offices" (не "office_ids" —
  // это имя только у поля записи в employees/add и employees/update).
  form.office_ids = employee.offices ? [...employee.offices] : [];
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingEmployee.value = null;
};

// Строго три шага по порядку: 1) создаём запись сотрудника — она создаётся
// с enabled=0, отключённой; 2) включаем её (employees/enable), иначе
// sendInvitation дальше вернёт 403 "Employee not found or disabled" — она
// не только ищет запись, но и требует, чтобы та была активна; 3) только
// после этого шлём приглашение на ту же почту. Если создание прошло, а
// включение/письмо не удались — сотрудник всё равно считается добавленным,
// сообщаем об этом отдельным тостом, а не полным провалом.
const handleAddEmployee = async () => {
  if (!canSubmitAdd.value) return;
  adding.value = true;
  try {
    const created = await addEmployee({
      email: addForm.email,
      role: addForm.role,
      first_name: addForm.first_name,
      last_name: addForm.last_name,
      middle_name: addForm.middle_name,
      position: addForm.position,
      office_ids: addForm.office_ids,
    });
    showAddModal.value = false;
    try {
      if (created?.employee_id) {
        await enableEmployee(created.employee_id);
      }
      await sendEmployeeInvitation(addForm.email);
      setLoadingStatus(true, "success", `Сотрудник добавлен, приглашение отправлено на ${addForm.email}`);
    } catch (inviteError) {
      console.error("Ошибка при включении/отправке приглашения:", inviteError);
      setLoadingStatus(
        true,
        "error",
        `Сотрудник добавлен, но приглашение отправить не удалось: ${
          inviteError.response?.data?.message || "неизвестная ошибка"
        }`,
      );
    }
  } catch (error) {
    console.error("Ошибка при добавлении сотрудника:", error);
    setLoadingStatus(true, "error", error.response?.data?.message || "Не удалось добавить сотрудника");
  } finally {
    adding.value = false;
  }
};

const handleSaveEdit = async () => {
  if (!editingEmployee.value) return;
  saving.value = true;
  try {
    await updateEmployee(editingEmployee.value.id, {
      first_name: form.first_name,
      last_name: form.last_name,
      middle_name: form.middle_name,
      position: form.position,
      office_ids: form.office_ids,
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

const showToggleConfirm = ref(false);
const confirmToggleEmployee = ref(null);
const toggling = ref(false);

const toggleConfirmText = computed(() => {
  const enabling = confirmToggleEmployee.value?.enabled === false;
  return {
    title: enabling ? "Включить сотрудника" : "Отключить сотрудника",
    close: "Отмена",
    action: enabling ? "Включить" : "Отключить",
  };
});

const openToggleConfirm = (employee) => {
  confirmToggleEmployee.value = employee;
  showToggleConfirm.value = true;
};

const closeToggleConfirm = () => {
  showToggleConfirm.value = false;
  confirmToggleEmployee.value = null;
};

const handleConfirmToggle = async () => {
  const employee = confirmToggleEmployee.value;
  if (!employee) return;
  const enabling = employee.enabled === false;
  toggling.value = true;
  try {
    if (enabling) {
      await enableEmployee(employee.id);
    } else {
      await disableEmployee(employee.id);
    }
    // disable/enable выше уже перезапрашивают список сам по себе, но бэк
    // иногда не успевает отразить новое enabled в getAll сразу — патчим
    // локально тем, что точно должно было произойти, поверх результата
    // рефетча, чтобы статус в таблице не "зависал" на старом значении.
    companyStore.upsertEmployee({ ...employee, enabled: enabling });
    setLoadingStatus(true, "success", enabling ? "Сотрудник включён" : "Сотрудник отключён");
    showToggleConfirm.value = false;
    confirmToggleEmployee.value = null;
  } catch (error) {
    console.error("Ошибка при изменении статуса сотрудника:", error);
    setLoadingStatus(
      true,
      "error",
      error.response?.data?.message ||
        (enabling ? "Не удалось включить сотрудника" : "Не удалось отключить сотрудника"),
    );
  } finally {
    toggling.value = false;
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

.status-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  flex-shrink: 0;
  cursor: pointer;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch .slider {
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

.switch .slider::before {
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

.confirm-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.5;
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

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
