<template>
  <ModalFrame :text="modalText" :close="props.close" :is-loading="loading">
    <p v-if="loadError" class="error-text">{{ loadError }}</p>

    <template v-else>
      <p class="mode-line">Режим распределения: <strong>{{ queueModeLabel(props.queue.mode) }}</strong></p>

      <div v-if="members.length === 0" class="empty-members">В очереди пока нет сотрудников</div>

      <ul v-else class="member-list">
        <li v-for="member in members" :key="member.employee_id" class="member-row">
          <div class="member-info">
            <span class="member-name">{{ memberName(member.employee_id) }}</span>
            <span class="member-meta">Приоритет: {{ member.priority ?? 0 }}</span>
          </div>
          <label
            class="switch"
            :title="isOn(member) ? 'Выключить в очереди (например, отпуск)' : 'Включить в очереди'"
          >
            <input type="checkbox" :checked="isOn(member)" @click.prevent="handleToggle(member)" />
            <span class="slider round"></span>
          </label>
          <button class="remove-btn" title="Убрать из очереди" @click="removeTarget = member">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </li>
      </ul>

      <div v-if="isOwner" class="add-block">
        <h4 class="add-title">Добавить сотрудника</h4>
        <div v-if="availableEmployees.length === 0" class="empty-members">
          Некого добавлять — все активные сотрудники уже в очереди.
        </div>
        <div v-else class="add-row">
          <select v-model="addForm.employee_id" class="form-input">
            <option value="" disabled>Выберите сотрудника</option>
            <option v-for="employee in availableEmployees" :key="employee.id" :value="employee.id">
              {{ employeeFullName(employee) }}
            </option>
          </select>
          <input
            v-model.number="addForm.priority"
            type="number"
            min="0"
            class="form-input priority-input"
            title="Приоритет: чем больше, тем выше"
            placeholder="Приоритет"
          />
          <button class="add-btn" :disabled="!addForm.employee_id || adding" @click="handleAdd">
            {{ adding ? "..." : "Добавить" }}
          </button>
        </div>
      </div>
    </template>
  </ModalFrame>

  <ModalFrame
    v-if="removeTarget"
    :text="{ title: 'Убрать из очереди', close: 'Отмена', action: 'Убрать' }"
    :close="() => (removeTarget = null)"
    :action="handleRemove"
    :is-loading="removing"
  >
    <p class="confirm-text">
      Убрать «{{ memberName(removeTarget.employee_id) }}» из очереди «{{ props.queue.name }}»?
    </p>
  </ModalFrame>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";
import { useCompanyStore } from "@/stores/companyStore";
import { useCompanyApi } from "@/composables/useCompanyApi";
import { useEmployeeQueuesApi } from "@/composables/useEmployeeQueuesApi";
import { getApiErrorText } from "@/composables/useBapi";
import { useStationLoading } from "@/composables/useStationLoading";
import { usePermissions } from "@/composables/usePermissions";
import { queueModeLabel } from "@/config/queueModes";
import { employeeFullName } from "@/utils/employee";

const props = defineProps({
  queue: { type: Object, required: true },
  close: { type: Function, required: true },
});

const companyStore = useCompanyStore();
const { fetchEmployees } = useCompanyApi();
const { fetchQueueMembers, addQueueMember, removeQueueMember, toggleQueueMember } =
  useEmployeeQueuesApi();
const { setLoadingStatus } = useStationLoading();
const { isOwner } = usePermissions();

const loading = ref(true);
const loadError = ref("");
const members = ref([]);
const adding = ref(false);
const removing = ref(false);
const removeTarget = ref(null);
const addForm = reactive({ employee_id: "", priority: 0 });

const modalText = computed(() => ({
  title: `Участники очереди «${props.queue.name}»`,
  close: "Закрыть",
  action: "",
}));

const employees = computed(() => companyStore.getEmployees);

const availableEmployees = computed(() =>
  employees.value.filter(
    (employee) =>
      employee.enabled !== false &&
      !members.value.some((member) => member.employee_id === employee.id),
  ),
);

const memberName = (employeeId) => {
  const employee = employees.value.find((e) => e.id === employeeId);
  return employee ? employeeFullName(employee) : `Сотрудник #${employeeId}`;
};

const isOn = (member) => Number(member.enabled_in_queue) === 1;

const sortMembers = (list) => [...list].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

const loadMembers = async () => {
  members.value = sortMembers(await fetchQueueMembers(props.queue.id));
};

const handleToggle = async (member) => {
  const next = !isOn(member);
  try {
    await toggleQueueMember(props.queue.id, member.employee_id, next);
    member.enabled_in_queue = next ? 1 : 0;
  } catch (error) {
    console.error("Ошибка при переключении участника очереди:", error);
    setLoadingStatus(true, "error", getApiErrorText(error, "Не удалось изменить статус сотрудника в очереди"));
  }
};

const handleAdd = async () => {
  adding.value = true;
  try {
    await addQueueMember(props.queue.id, {
      employee_id: addForm.employee_id,
      priority: Number(addForm.priority) || 0,
    });
    addForm.employee_id = "";
    addForm.priority = 0;
    await loadMembers();
    setLoadingStatus(true, "success", "Сотрудник добавлен в очередь");
  } catch (error) {
    console.error("Ошибка при добавлении участника очереди:", error);
    setLoadingStatus(true, "error", getApiErrorText(error, "Не удалось добавить сотрудника в очередь"));
  } finally {
    adding.value = false;
  }
};

const handleRemove = async () => {
  removing.value = true;
  try {
    await removeQueueMember(props.queue.id, removeTarget.value.employee_id);
    removeTarget.value = null;
    await loadMembers();
    setLoadingStatus(true, "success", "Сотрудник убран из очереди");
  } catch (error) {
    console.error("Ошибка при удалении участника очереди:", error);
    setLoadingStatus(true, "error", getApiErrorText(error, "Не удалось убрать сотрудника из очереди"));
  } finally {
    removing.value = false;
  }
};

onMounted(async () => {
  try {
    if (employees.value.length === 0) await fetchEmployees();
    await loadMembers();
  } catch (error) {
    console.error("Ошибка при загрузке участников очереди:", error);
    loadError.value = getApiErrorText(error, "Не удалось загрузить участников очереди");
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.mode-line {
  margin: 0 0 1rem;
  font-size: 0.85rem;
  color: var(--headerAccountText);
}

.mode-line strong {
  color: var(--text);
}

.error-text {
  margin: 0;
  color: #ef4444;
  font-size: 0.9rem;
}

.empty-members {
  padding: 1rem;
  text-align: center;
  color: var(--headerAccountText);
  background: var(--tableAccountBg);
  border-radius: 0.5rem;
  font-size: 0.85rem;
}

.member-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.member-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.member-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-meta {
  font-size: 0.75rem;
  color: var(--headerAccountText);
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

.slider {
  position: absolute;
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

.remove-btn {
  background: transparent;
  border: none;
  color: var(--headerAccountText);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
}

.remove-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.add-block {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
}

.add-title {
  margin: 0 0 0.6rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text);
}

.add-row {
  display: flex;
  gap: 0.5rem;
}

.form-input {
  flex: 1;
  min-width: 0;
  padding: 0.55rem 0.7rem;
  border: 2px solid var(--line);
  border-radius: 0.5rem;
  font-size: 0.85rem;
  background: var(--input);
  color: var(--text);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
}

.priority-input {
  flex: 0 0 96px;
}

.add-btn {
  padding: 0 1rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--primary);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.5;
}
</style>
