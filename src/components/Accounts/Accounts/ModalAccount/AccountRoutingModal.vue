<template>
  <ModalFrame
    :text="modalText"
    :item="props.item"
    :close="props.close"
    :action="handleSave"
    :is-loading="loading || saving"
    :is-disabled="!!loadError || (!form.employee_id && !form.queue_id)"
  >
    <p v-if="loadError" class="error-text">{{ loadError }}</p>

    <template v-else>
      <p class="hint">
        Кому попадают новые обращения по этому аккаунту: конкретному сотруднику,
        очереди или обоим сразу. У сотрудника должен быть доступ к аккаунту
        (Организация → Сотрудники → «Доступ к аккаунтам»).
      </p>

      <div class="current" :class="{ 'current-empty': !hasRouting }">
        <template v-if="hasRouting">
          <span class="current-title">Сейчас</span>
          <span v-if="routing.employee_id">Сотрудник: <strong>{{ employeeName(routing.employee_id) }}</strong></span>
          <span v-if="routing.queue_id">Очередь: <strong>{{ queueName(routing.queue_id) }}</strong></span>
          <span v-if="crmUser" class="current-meta">
            Пользователь CRM: #{{ crmUser.crm_user_id }} ({{ crmUser.crm_type }})
          </span>
          <span v-else-if="routing.queue_id && !routing.employee_id" class="current-meta">
            CRM-пользователь определяется в момент распределения
          </span>
        </template>
        <span v-else>Маршрутизация не задана</span>
      </div>

      <div class="form-group">
        <label class="form-label">Сотрудник</label>
        <select v-model="form.employee_id" class="form-input">
          <option :value="null">— не закреплять —</option>
          <option v-for="employee in employeeOptions" :key="employee.id" :value="employee.id">
            {{ employeeFullName(employee) }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Очередь</label>
        <select v-model="form.queue_id" class="form-input">
          <option :value="null">— не закреплять —</option>
          <option v-for="queue in queueOptions" :key="queue.id" :value="queue.id">
            {{ queue.name }} · {{ queueModeLabel(queue.mode) }}
          </option>
        </select>
        <span v-if="queueOptions.length === 0" class="form-hint">
          Очередей пока нет — создайте их в Организация → Очереди.
        </span>
      </div>

      <button v-if="hasRouting" class="remove-routing" @click="confirmRemove = true">
        Снять маршрутизацию
      </button>
    </template>
  </ModalFrame>

  <ModalFrame
    v-if="confirmRemove"
    :text="{ title: 'Снять маршрутизацию', close: 'Отмена', action: 'Снять' }"
    :close="() => (confirmRemove = false)"
    :action="handleRemove"
    :is-loading="removing"
  >
    <p class="confirm-text">
      Снять маршрутизацию с аккаунта «{{ accountLabel(props.item) }}»? Новые
      обращения перестанут закрепляться за сотрудником или очередью.
    </p>
  </ModalFrame>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";
import { useCompanyStore } from "@/stores/companyStore";
import { useCompanyApi } from "@/composables/useCompanyApi";
import { useEmployeeQueuesApi } from "@/composables/useEmployeeQueuesApi";
import { useAccountRoutingApi } from "@/composables/useAccountRoutingApi";
import { getApiErrorText } from "@/composables/useBapi";
import { useStationLoading } from "@/composables/useStationLoading";
import { queueModeLabel } from "@/config/queueModes";
import { employeeFullName, accountLabel } from "@/utils/employee";

const props = defineProps({
  item: { type: Object, required: true },
  close: { type: Function, required: true },
});

const companyStore = useCompanyStore();
const { fetchEmployees } = useCompanyApi();
const { fetchQueues } = useEmployeeQueuesApi();
const { getRouting, getRoutingCrmUser, setRouting, deleteRouting } = useAccountRoutingApi();
const { setLoadingStatus } = useStationLoading();

const loading = ref(true);
const saving = ref(false);
const removing = ref(false);
const confirmRemove = ref(false);
const loadError = ref("");
const routing = ref({ employee_id: null, queue_id: null, enabled: false });
const crmUser = ref(null);
const form = reactive({ employee_id: null, queue_id: null });

const modalText = { title: "Маршрутизация обращений", close: "Отмена", action: "Сохранить" };

const employees = computed(() => companyStore.getEmployees);
const queues = computed(() => companyStore.getQueues);
const hasRouting = computed(() => !!(routing.value.employee_id || routing.value.queue_id));

// В списках оставляем только активных, но уже выбранные значения не теряем,
// даже если их потом отключили.
const employeeOptions = computed(() =>
  employees.value.filter((e) => e.enabled !== false || e.id === form.employee_id),
);
const queueOptions = computed(() =>
  queues.value.filter((q) => Number(q.enabled) === 1 || q.id === form.queue_id),
);

const employeeName = (id) => {
  const employee = employees.value.find((e) => e.id === id);
  return employee ? employeeFullName(employee) : `Сотрудник #${id}`;
};
const queueName = (id) => queues.value.find((q) => q.id === id)?.name || `Очередь #${id}`;

const loadRouting = async () => {
  const [current, user] = await Promise.all([
    getRouting(props.item.uuid),
    getRoutingCrmUser(props.item.uuid).catch(() => null),
  ]);
  routing.value = current;
  crmUser.value = user;
  form.employee_id = current.employee_id || null;
  form.queue_id = current.queue_id || null;
};

const handleSave = async () => {
  saving.value = true;
  try {
    await setRouting(props.item.uuid, { employee_id: form.employee_id, queue_id: form.queue_id });
    setLoadingStatus(true, "success", "Маршрутизация сохранена");
    props.close();
  } catch (error) {
    console.error("Ошибка при сохранении маршрутизации:", error);
    setLoadingStatus(true, "error", getApiErrorText(error, "Не удалось сохранить маршрутизацию"));
  } finally {
    saving.value = false;
  }
};

const handleRemove = async () => {
  removing.value = true;
  try {
    await deleteRouting(props.item.uuid);
    setLoadingStatus(true, "success", "Маршрутизация снята");
    confirmRemove.value = false;
    props.close();
  } catch (error) {
    console.error("Ошибка при снятии маршрутизации:", error);
    setLoadingStatus(true, "error", getApiErrorText(error, "Не удалось снять маршрутизацию"));
  } finally {
    removing.value = false;
  }
};

onMounted(async () => {
  try {
    await Promise.all([
      employees.value.length ? Promise.resolve() : fetchEmployees(),
      fetchQueues(),
    ]);
    await loadRouting();
  } catch (error) {
    console.error("Ошибка при загрузке маршрутизации:", error);
    loadError.value = getApiErrorText(error, "Не удалось загрузить маршрутизацию");
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

.current {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 0.9rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  background: rgba(var(--primary-rgb), 0.1);
  font-size: 0.85rem;
  color: var(--text);
}

.current-empty {
  background: var(--tableAccountBg);
  color: var(--headerAccountText);
}

.current-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--headerAccountText);
}

.current-meta {
  font-size: 0.78rem;
  color: var(--headerAccountText);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--headerAccountText);
}

.form-hint {
  font-size: 0.78rem;
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
}

.remove-routing {
  border: none;
  background: transparent;
  color: #ef4444;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.3rem 0;
}

.remove-routing:hover {
  text-decoration: underline;
}

.confirm-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.5;
}
</style>
