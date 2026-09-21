<template>
  <ModalFrame
    :text="modalText"
    :close="props.close"
    :action="handleSave"
    :is-loading="loading || saving"
    :is-disabled="!!loadError"
  >
    <p v-if="loadError" class="error-text">{{ loadError }}</p>

    <template v-else>
      <p class="hint">
        Отметьте, какие аккаунты доступны сотруднику и что он может с ними делать.
        Аккаунты без отметок ему недоступны. Закрепить за аккаунтом можно только
        сотрудника, у которого есть к нему доступ.
      </p>

      <input
        v-if="accounts.length > 6"
        v-model.trim="search"
        type="text"
        class="search-input"
        placeholder="Поиск по названию или логину"
      />

      <div v-if="accounts.length === 0" class="empty">У вас пока нет аккаунтов</div>
      <div v-else-if="filteredAccounts.length === 0" class="empty">Ничего не найдено</div>

      <div v-else class="accounts-table">
        <div class="row head">
          <span class="cell-name">Аккаунт</span>
          <span class="cell-check" title="Просмотр аккаунта">Просмотр</span>
          <span class="cell-check" title="Использование аккаунта (отправка, работа)">Работа</span>
          <span class="cell-check" title="Обновление токенов и переавторизация">Обновл.</span>
        </div>

        <div v-for="account in filteredAccounts" :key="account.uuid" class="row">
          <div class="cell-name">
            <span class="account-name">{{ accountLabel(account) }}</span>
            <span class="account-meta">{{ accountMeta(account) }}</span>
          </div>
          <label v-for="action in ACTIONS" :key="action" class="cell-check">
            <input
              type="checkbox"
              :checked="perms[account.uuid][action]"
              @change="setAction(account.uuid, action, $event.target.checked)"
            />
          </label>
        </div>
      </div>
    </template>
  </ModalFrame>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";
import { useEmployeeAccountsApi } from "@/composables/useEmployeeAccountsApi";
import { getApiErrorText } from "@/composables/useBapi";
import { useStationLoading } from "@/composables/useStationLoading";
import { employeeFullName, accountLabel } from "@/utils/employee";

const ACTIONS = ["view", "use", "refresh"];

const props = defineProps({
  employee: { type: Object, required: true },
  close: { type: Function, required: true },
});

const { fetchAvailableAccounts, fetchEmployeeAccounts, saveEmployeeAccounts } =
  useEmployeeAccountsApi();
const { setLoadingStatus } = useStationLoading();

const loading = ref(true);
const saving = ref(false);
const loadError = ref("");
const search = ref("");
const accounts = ref([]);
const perms = reactive({});

const modalText = computed(() => ({
  title: `Доступ к аккаунтам · ${employeeFullName(props.employee)}`,
  close: "Отмена",
  action: "Сохранить",
}));

const filteredAccounts = computed(() => {
  const query = search.value.toLowerCase();
  if (!query) return accounts.value;
  return accounts.value.filter((account) =>
    [account.name, account.login, account.source].some((field) =>
      String(field || "").toLowerCase().includes(query),
    ),
  );
});

const accountMeta = (account) => {
  const parts = [];
  if (account.name && account.login && account.name !== account.login) parts.push(account.login);
  if (account.source) parts.push(account.source);
  return parts.join(" · ");
};

// use/refresh без просмотра не имеют смысла: включаем view автоматически, а
// снятие view снимает и остальное.
const setAction = (uuid, action, value) => {
  const permission = perms[uuid];
  permission[action] = value;
  if (value && action !== "view") permission.view = true;
  if (!value && action === "view") {
    permission.use = false;
    permission.refresh = false;
  }
};

const handleSave = async () => {
  saving.value = true;
  try {
    const payload = accounts.value
      .filter((account) => ACTIONS.some((action) => perms[account.uuid][action]))
      .map((account) => ({
        uuid: account.uuid,
        data: {
          actions: {
            view: !!perms[account.uuid].view,
            use: !!perms[account.uuid].use,
            refresh: !!perms[account.uuid].refresh,
          },
        },
      }));
    await saveEmployeeAccounts(props.employee.id, payload);
    setLoadingStatus(true, "success", "Доступ к аккаунтам сохранён");
    props.close();
  } catch (error) {
    console.error("Ошибка при сохранении доступа к аккаунтам:", error);
    setLoadingStatus(true, "error", getApiErrorText(error, "Не удалось сохранить доступ к аккаунтам"));
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  try {
    const [available, granted] = await Promise.all([
      fetchAvailableAccounts(),
      fetchEmployeeAccounts(props.employee.id),
    ]);
    accounts.value = available;
    available.forEach((account) => {
      // В спеке getAll отдаёт поле uuid, но реальный ответ бэка — vendor_uuid
      // (плюс id и owner_user_id); принимаем оба.
      const actions =
        granted.find((g) => (g.vendor_uuid || g.uuid) === account.uuid)?.data?.actions || {};
      perms[account.uuid] = {
        view: !!actions.view,
        use: !!actions.use,
        refresh: !!actions.refresh,
      };
    });
  } catch (error) {
    console.error("Ошибка при загрузке доступа к аккаунтам:", error);
    loadError.value = getApiErrorText(error, "Не удалось загрузить аккаунты");
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

.search-input {
  width: 100%;
  margin-bottom: 0.75rem;
  padding: 0.55rem 0.7rem;
  border: 2px solid var(--line);
  border-radius: 0.5rem;
  font-size: 0.85rem;
  background: var(--input);
  color: var(--text);
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
}

.accounts-table {
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  overflow: hidden;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid var(--line);
}

.row:last-child {
  border-bottom: none;
}

.row.head {
  background: var(--tableAccountBg);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--headerAccountText);
}

.cell-name {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.cell-check {
  flex: 0 0 62px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
}

.cell-check input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--primary);
}

.account-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-meta {
  font-size: 0.72rem;
  color: var(--headerAccountText);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
