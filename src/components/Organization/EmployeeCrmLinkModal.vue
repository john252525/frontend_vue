<template>
  <ModalFrame
    :text="modalText"
    :close="props.close"
    :action="handleLink"
    :is-loading="loading || linking"
    :is-disabled="!canLink"
  >
    <p v-if="loadError" class="error-text">{{ loadError }}</p>

    <template v-else>
      <p class="hint">
        Bitrix24 не отдаёт email сотрудников, поэтому связать сотрудника с
        пользователем CRM нужно вручную.
      </p>

      <div v-if="employeeLinks.length" class="links-block">
        <h4 class="block-title">Текущая связь</h4>
        <div v-for="link in employeeLinks" :key="`${link.crm_id}-${link.crm_user_id}`" class="link-row">
          <div class="link-info">
            <span class="link-user">{{ linkUserName(link) }}</span>
            <span class="link-meta">{{ linkPortalLabel(link) }}</span>
          </div>
          <button class="unlink-btn" title="Удалить связь" @click="unlinkTarget = link">Удалить</button>
        </div>
      </div>

      <div v-if="bitrixAccounts.length === 0" class="empty">
        Нет подключённых аккаунтов Bitrix24 — сначала подключите CRM.
      </div>

      <div v-else class="add-block">
        <h4 class="block-title">{{ employeeLinks.length ? "Изменить связь" : "Связать с пользователем CRM" }}</h4>

        <div class="form-group">
          <label class="form-label">Портал Bitrix24</label>
          <select v-model="selectedAccountUuid" class="form-input" @change="loadUsers">
            <option value="" disabled>Выберите аккаунт Bitrix24</option>
            <option v-for="account in bitrixAccounts" :key="account.uuid" :value="account.uuid">
              {{ accountLabel(account) }}
            </option>
          </select>
        </div>

        <div v-if="usersLoading" class="empty">Загружаем пользователей CRM...</div>
        <p v-else-if="usersError" class="error-text">{{ usersError }}</p>

        <template v-else-if="selectedAccountUuid">
          <input
            v-model.trim="userSearch"
            type="text"
            class="form-input"
            placeholder="Поиск по имени"
          />
          <div v-if="filteredUsers.length === 0" class="empty">Пользователи не найдены</div>
          <ul v-else class="user-list">
            <li
              v-for="user in filteredUsers"
              :key="user.crm_user_id"
              :class="['user-row', { selected: selectedUserId === user.crm_user_id }]"
              @click="selectedUserId = user.crm_user_id"
            >
              <span class="user-name">{{ crmUserName(user) }}</span>
              <span v-if="linkedElsewhere(user)" class="user-note">
                уже связан: {{ linkedElsewhere(user) }}
              </span>
              <span v-else class="user-note">#{{ user.crm_user_id }}</span>
            </li>
          </ul>
        </template>
      </div>
    </template>
  </ModalFrame>

  <ModalFrame
    v-if="unlinkTarget"
    :text="{ title: 'Удалить связь', close: 'Отмена', action: 'Удалить' }"
    :close="() => (unlinkTarget = null)"
    :action="handleUnlink"
    :is-loading="unlinking"
  >
    <p class="confirm-text">
      Удалить связь сотрудника «{{ employeeFullName(props.employee) }}» с пользователем CRM
      «{{ linkUserName(unlinkTarget) }}»?
    </p>
  </ModalFrame>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";
import { useCompanyStore } from "@/stores/companyStore";
import { useCrmUsersApi } from "@/composables/useCrmUsersApi";
import { useEmployeeAccountsApi } from "@/composables/useEmployeeAccountsApi";
import { getApiErrorText } from "@/composables/useBapi";
import { useStationLoading } from "@/composables/useStationLoading";
import { employeeFullName, accountLabel, crmUserName } from "@/utils/employee";

const CRM_TYPE = "bitrix24";

const props = defineProps({
  employee: { type: Object, required: true },
  close: { type: Function, required: true },
});

const companyStore = useCompanyStore();
const { fetchCrmUsers, fetchCrmLinks, linkCrmUser, deleteCrmLink } = useCrmUsersApi();
const { fetchAvailableAccounts } = useEmployeeAccountsApi();
const { setLoadingStatus } = useStationLoading();

const loading = ref(true);
const linking = ref(false);
const unlinking = ref(false);
const loadError = ref("");
const bitrixAccounts = ref([]);
const allLinks = ref([]);
const usersByAccount = ref({}); // uuid аккаунта -> пользователи CRM

const selectedAccountUuid = ref("");
const usersLoading = ref(false);
const usersError = ref("");
const userSearch = ref("");
const selectedUserId = ref("");
const unlinkTarget = ref(null);

const companyId = computed(() => companyStore.getCompany?.id);

const modalText = computed(() => ({
  title: `Связь с CRM · ${employeeFullName(props.employee)}`,
  close: "Закрыть",
  action: "Связать",
}));

const employeeLinks = computed(() =>
  allLinks.value.filter(
    (link) => link.employee_id === props.employee.id && link.crm_type === CRM_TYPE,
  ),
);

const selectedAccount = computed(() =>
  bitrixAccounts.value.find((account) => account.uuid === selectedAccountUuid.value),
);

const currentUsers = computed(() => usersByAccount.value[selectedAccountUuid.value] || []);

const filteredUsers = computed(() => {
  const query = userSearch.value.toLowerCase();
  if (!query) return currentUsers.value;
  return currentUsers.value.filter((user) => crmUserName(user).toLowerCase().includes(query));
});

const canLink = computed(
  () => !loadError.value && !!selectedAccount.value && !!selectedUserId.value && !linking.value,
);

const accountByPortal = (crmId) => bitrixAccounts.value.find((account) => account.login === crmId);

const linkPortalLabel = (link) => {
  const account = accountByPortal(link.crm_id);
  return account ? accountLabel(account) : `Портал ${link.crm_id}`;
};

const linkUserName = (link) => {
  const account = accountByPortal(link.crm_id);
  const user = account ? usersByAccount.value[account.uuid]?.find((u) => u.crm_user_id === link.crm_user_id) : null;
  return user ? crmUserName(user) : `Пользователь CRM #${link.crm_user_id}`;
};

// Пользователь CRM уже привязан к другому сотруднику этой компании?
const linkedElsewhere = (user) => {
  const link = allLinks.value.find(
    (l) =>
      l.crm_type === CRM_TYPE &&
      l.crm_id === selectedAccount.value?.login &&
      l.crm_user_id === user.crm_user_id &&
      l.employee_id !== props.employee.id,
  );
  if (!link) return "";
  const employee = companyStore.getEmployees.find((e) => e.id === link.employee_id);
  return employee ? employeeFullName(employee) : `сотрудник #${link.employee_id}`;
};

const loadUsersFor = async (account) => {
  if (usersByAccount.value[account.uuid]) return;
  usersByAccount.value = {
    ...usersByAccount.value,
    [account.uuid]: await fetchCrmUsers(account.uuid),
  };
};

const loadUsers = async () => {
  selectedUserId.value = "";
  userSearch.value = "";
  usersError.value = "";
  if (!selectedAccount.value) return;
  usersLoading.value = true;
  try {
    await loadUsersFor(selectedAccount.value);
  } catch (error) {
    console.error("Ошибка при загрузке пользователей CRM:", error);
    usersError.value = getApiErrorText(error, "Не удалось загрузить пользователей CRM");
  } finally {
    usersLoading.value = false;
  }
};

const reloadLinks = async () => {
  allLinks.value = await fetchCrmLinks(companyId.value);
};

const handleLink = async () => {
  if (!props.employee.user_id) {
    setLoadingStatus(true, "error", "У сотрудника нет user_id — связать его с CRM пока нельзя");
    return;
  }
  linking.value = true;
  try {
    await linkCrmUser({
      company_id: companyId.value,
      employee_id: props.employee.id,
      user_id: props.employee.user_id,
      crm_type: CRM_TYPE,
      crm_id: selectedAccount.value.login,
      crm_user_id: selectedUserId.value,
    });
    await reloadLinks();
    selectedUserId.value = "";
    setLoadingStatus(true, "success", "Сотрудник связан с пользователем CRM");
  } catch (error) {
    console.error("Ошибка при связывании с пользователем CRM:", error);
    setLoadingStatus(true, "error", getApiErrorText(error, "Не удалось связать сотрудника с CRM"));
  } finally {
    linking.value = false;
  }
};

const handleUnlink = async () => {
  unlinking.value = true;
  try {
    await deleteCrmLink({
      company_id: companyId.value,
      employee_id: props.employee.id,
      crm_type: unlinkTarget.value.crm_type,
      crm_id: unlinkTarget.value.crm_id,
    });
    unlinkTarget.value = null;
    await reloadLinks();
    setLoadingStatus(true, "success", "Связь удалена");
  } catch (error) {
    console.error("Ошибка при удалении связи с CRM:", error);
    setLoadingStatus(true, "error", getApiErrorText(error, "Не удалось удалить связь"));
  } finally {
    unlinking.value = false;
  }
};

onMounted(async () => {
  try {
    if (!companyId.value) throw new Error("Компания не найдена — сначала подключите корпоративный доступ");
    const [accounts, links] = await Promise.all([
      fetchAvailableAccounts(),
      fetchCrmLinks(companyId.value),
    ]);
    bitrixAccounts.value = accounts.filter((account) => account.type === CRM_TYPE);
    allLinks.value = links;

    // Подтягиваем имена пользователей CRM для уже существующих связей —
    // бэк отдаёт только crm_user_id.
    const portals = employeeLinks.value
      .map((link) => accountByPortal(link.crm_id))
      .filter(Boolean);
    await Promise.all(portals.map((account) => loadUsersFor(account).catch(() => {})));

    if (bitrixAccounts.value.length === 1) {
      selectedAccountUuid.value = bitrixAccounts.value[0].uuid;
      await loadUsers();
    }
  } catch (error) {
    console.error("Ошибка при загрузке связей с CRM:", error);
    loadError.value = getApiErrorText(error, "Не удалось загрузить данные CRM");
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.hint {
  margin: 0 0 1rem;
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--headerAccountText);
}

.error-text {
  margin: 0;
  color: #ef4444;
  font-size: 0.9rem;
}

.empty {
  padding: 1rem;
  text-align: center;
  color: var(--headerAccountText);
  background: var(--tableAccountBg);
  border-radius: 0.5rem;
  font-size: 0.85rem;
}

.block-title {
  margin: 0 0 0.6rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text);
}

.links-block {
  margin-bottom: 1.25rem;
}

.link-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  margin-bottom: 0.4rem;
}

.link-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.link-user {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

.link-meta {
  font-size: 0.75rem;
  color: var(--headerAccountText);
}

.unlink-btn {
  border: none;
  background: transparent;
  color: #ef4444;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  border-radius: 0.4rem;
}

.unlink-btn:hover {
  background: #fee2e2;
}

.add-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--headerAccountText);
}

.form-input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 2px solid var(--line);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: var(--input);
  color: var(--text);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
}

.user-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
}

.user-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid var(--line);
}

.user-row:last-child {
  border-bottom: none;
}

.user-row:hover {
  background: var(--tableAccountBg);
}

.user-row.selected {
  background: rgba(var(--primary-rgb), 0.12);
  box-shadow: inset 3px 0 0 var(--primary);
}

.user-name {
  font-size: 0.875rem;
  color: var(--text);
}

.user-note {
  font-size: 0.72rem;
  color: var(--headerAccountText);
  white-space: nowrap;
}

.confirm-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.5;
}
</style>
