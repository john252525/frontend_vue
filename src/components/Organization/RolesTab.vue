<template>
  <div class="roles-tab">
    <Teleport to="#organization-header-actions">
      <button v-if="!loading" class="btn btn-primary" :disabled="saving" @click="handleSave">
        {{ saving ? "Сохраняем..." : `Сохранить права роли «${activeRoleLabel}»` }}
      </button>
    </Teleport>

    <div class="tab-header">
      <h3 class="settings-title">Роли и права доступа</h3>
      <p class="settings-description">
        Три фиксированные роли — своих ролей создавать нельзя.
      </p>
    </div>

    <div v-if="loading" class="state-loading">
      <div class="spinner"></div>
      Загрузка...
    </div>

    <template v-else>
      <div class="role-switcher">
        <button
          v-for="role in ROLES"
          :key="role.id"
          @click="activeRole = role.id"
          :class="['role-button', { active: activeRole === role.id }]"
        >
          {{ role.label }}
        </button>
      </div>

      <div class="permission-groups">
        <div v-for="group in visiblePermissionGroups" :key="group.key" class="permission-group">
          <h4 class="group-title">{{ group.title }}</h4>
          <div class="permission-list">
            <label
              v-for="field in group.fields"
              :key="field.key"
              class="permission-row"
            >
              <span class="permission-label">{{ field.label }}</span>
              <span class="switch">
                <input
                  type="checkbox"
                  :checked="currentPermissions[group.key]?.[field.key] === true"
                  @change="setPermission(group.key, field.key, $event.target.checked)"
                />
                <span class="slider round"></span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useCompanyStore } from "@/stores/companyStore";
import { useCompanyApi } from "@/composables/useCompanyApi";
import { useStationLoading } from "@/composables/useStationLoading";

const companyStore = useCompanyStore();
const { fetchRolesAll, saveRolePermissions } = useCompanyApi();
const { setLoadingStatus } = useStationLoading();

const ROLES = [
  { id: "manager", label: "Менеджер" },
  { id: "senior_manager", label: "Старший менеджер" },
  { id: "admin", label: "Администратор" },
];

// allowedRoles — на какие роли настройка вообще может распространяться "по
// определению" (например, менеджер физически не может видеть все аккаунты
// или добавлять других менеджеров — это не дефолт, который можно включить,
// а ограничение самой роли). Такие поля просто не показываются в интерфейсе
// для ролей вне allowedRoles, а не просто выключены.
const PERMISSION_GROUPS = [
  {
    key: "accounts",
    title: "Аккаунты",
    fields: [
      { key: "view_all", label: "Видит все аккаунты (не только закреплённые за ним)", allowedRoles: ["senior_manager", "admin"] },
      { key: "add", label: "Может добавлять новые аккаунты", allowedRoles: ["admin"] },
      { key: "delete", label: "Может удалять аккаунты", allowedRoles: ["admin"] },
    ],
  },
  {
    key: "chats",
    title: "Чаты",
    fields: [
      { key: "view_all", label: "Видит все чаты (не только закреплённые)", allowedRoles: ["senior_manager", "admin"] },
      { key: "connect_any", label: "Может подключиться к любому чату", allowedRoles: ["senior_manager", "admin"] },
    ],
  },
  {
    key: "mailings",
    title: "Рассылки",
    fields: [
      { key: "view", label: "Видит раздел рассылок", allowedRoles: ["manager", "senior_manager", "admin"] },
      { key: "create", label: "Может создавать рассылки", allowedRoles: ["manager", "senior_manager", "admin"] },
    ],
  },
  {
    key: "managers",
    title: "Менеджеры",
    fields: [
      { key: "add", label: "Может добавлять менеджеров", allowedRoles: ["senior_manager", "admin"] },
      { key: "delete", label: "Может удалять менеджеров", allowedRoles: ["admin"] },
      { key: "attach_accounts", label: "Может закреплять аккаунты за менеджерами", allowedRoles: ["senior_manager", "admin"] },
      { key: "detach_accounts", label: "Может открепить аккаунт/чат от менеджера", allowedRoles: ["senior_manager", "admin"] },
    ],
  },
  {
    key: "subscriptions",
    title: "Подписки",
    fields: [{ key: "pay", label: "Может оплачивать подписки", allowedRoles: ["admin"] }],
  },
  {
    key: "profile",
    title: "Профиль",
    fields: [{ key: "edit_own", label: "Может редактировать свой профиль", allowedRoles: ["manager", "senior_manager", "admin"] }],
  },
  {
    key: "crm",
    title: "CRM",
    fields: [{ key: "write_from_crm", label: "Может писать клиенту напрямую из карточки сделки в CRM", allowedRoles: ["manager", "senior_manager", "admin"] }],
  },
];

// Значения по умолчанию — ровно то, что описано в требованиях (три роли),
// используются, пока бэкенд не прислал реально сохранённые права для
// компании (метод пока "не отлажен", ответ может быть пустым).
const DEFAULT_PERMISSIONS = {
  manager: {
    accounts: { view_all: false, add: false, delete: false },
    chats: { view_all: false, connect_any: false },
    mailings: { view: true, create: true },
    managers: { add: false, delete: false, attach_accounts: false, detach_accounts: false },
    subscriptions: { pay: false },
    profile: { edit_own: true },
    crm: { write_from_crm: false },
  },
  senior_manager: {
    accounts: { view_all: true, add: false, delete: false },
    chats: { view_all: true, connect_any: true },
    mailings: { view: true, create: true },
    // add — по умолчанию выключено, но, в отличие от manager, для этой роли
    // видно и можно включить (коллега подтвердил именно так).
    managers: { add: false, delete: false, attach_accounts: true, detach_accounts: true },
    subscriptions: { pay: false },
    profile: { edit_own: true },
    crm: { write_from_crm: false },
  },
  admin: {
    accounts: { view_all: true, add: true, delete: true },
    chats: { view_all: true, connect_any: true },
    mailings: { view: true, create: true },
    managers: { add: true, delete: true, attach_accounts: true, detach_accounts: true },
    subscriptions: { pay: true },
    profile: { edit_own: true },
    crm: { write_from_crm: true },
  },
};

const loading = ref(true);
const saving = ref(false);
const activeRole = ref("manager");
const localPermissions = reactive({});

const activeRoleLabel = computed(
  () => ROLES.find((r) => r.id === activeRole.value)?.label || "",
);

const currentPermissions = computed(() => localPermissions[activeRole.value] || {});

// Для активной роли показываем только те поля, которые ей вообще положены
// "по определению" — например, у менеджера нет и не может быть переключателя
// "видит все аккаунты" или "может добавлять менеджеров". Группа целиком
// скрывается, если из неё для этой роли не осталось ни одного поля.
const visiblePermissionGroups = computed(() =>
  PERMISSION_GROUPS.map((group) => ({
    ...group,
    fields: group.fields.filter((field) => field.allowedRoles.includes(activeRole.value)),
  })).filter((group) => group.fields.length > 0),
);

const setPermission = (group, field, value) => {
  const rolePerms = localPermissions[activeRole.value] || {};
  localPermissions[activeRole.value] = {
    ...rolePerms,
    [group]: { ...rolePerms[group], [field]: value },
  };
};

const handleSave = async () => {
  saving.value = true;
  try {
    await saveRolePermissions(activeRole.value, localPermissions[activeRole.value]);
    setLoadingStatus(true, "success", `Права роли «${activeRoleLabel.value}» сохранены`);
  } catch (error) {
    console.error("Ошибка при сохранении прав роли:", error);
    setLoadingStatus(true, "error", error.response?.data?.message || "Не удалось сохранить права роли");
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  const rolesFromApi = await fetchRolesAll();
  ROLES.forEach((role) => {
    localPermissions[role.id] = rolesFromApi?.[role.id] || DEFAULT_PERMISSIONS[role.id];
  });
  loading.value = false;
});
</script>

<style scoped>
.roles-tab {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

.role-switcher {
  display: flex;
  gap: 8px;
  width: fit-content;
  background: var(--tableAccountBg);
  padding: 4px;
  border-radius: 8px;
}

.role-button {
  padding: 8px 14px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--headerAccountText);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.role-button.active {
  background: var(--bg);
  color: var(--primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.permission-groups {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.permission-group {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 1rem 1.25rem;
}

.group-title {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--headerAccountText);
}

.permission-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.permission-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  cursor: pointer;
}

.permission-label {
  font-size: 0.875rem;
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


.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primaryHover);
}
</style>
