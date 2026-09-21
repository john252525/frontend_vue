<template>
  <div class="queues-tab">
    <Teleport to="#organization-header-actions">
      <button v-if="isOwner" class="btn btn-primary" @click="openCreateModal">
        + Добавить очередь
      </button>
    </Teleport>

    <div class="tab-header">
      <div>
        <h3 class="settings-title">Очереди сотрудников</h3>
        <p class="settings-description">
          Очередь распределяет новые обращения между сотрудниками. Очередь из
          одного сотрудника равносильна закреплению за конкретным сотрудником.
          Саму очередь назначают на аккаунт в его меню действий → «Маршрутизация».
        </p>
      </div>
    </div>

    <div v-if="loading" class="state-loading">
      <div class="spinner"></div>
      Загрузка...
    </div>

    <div v-else-if="loadError" class="empty-state error-state">{{ loadError }}</div>

    <div v-else-if="queues.length === 0" class="empty-state">Очередей пока нет</div>

    <table v-else class="table">
      <thead>
        <tr>
          <th>Название</th>
          <th>Режим</th>
          <th>Статус</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="queue in queues" :key="queue.id">
          <td>{{ queue.name }}</td>
          <td>{{ queueModeLabel(queue.mode) }}</td>
          <td>
            <span :class="['status-badge', Number(queue.enabled) === 1 ? 'active' : 'inactive']">
              {{ Number(queue.enabled) === 1 ? "Включена" : "Отключена" }}
            </span>
          </td>
          <td class="actions-cell">
            <button class="icon-btn" title="Участники очереди" @click="membersQueue = queue">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </button>
            <template v-if="isOwner">
              <button class="icon-btn" title="Редактировать" @click="openEditModal(queue)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button class="icon-btn danger" title="Удалить" @click="deleteTarget = queue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </template>
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
        <input v-model.trim="form.name" type="text" class="form-input" placeholder="Например, Отдел продаж" />
      </div>
      <div class="form-group">
        <label class="form-label">Режим распределения</label>
        <select v-model="form.mode" class="form-input">
          <option v-for="mode in QUEUE_MODES" :key="mode.id" :value="mode.id">{{ mode.label }}</option>
        </select>
        <span class="form-hint">{{ currentModeHint }}</span>
      </div>
    </ModalFrame>

    <ModalFrame
      v-if="deleteTarget"
      :text="{ title: 'Удалить очередь', close: 'Отмена', action: 'Удалить' }"
      :close="() => (deleteTarget = null)"
      :action="handleDelete"
      :is-loading="deleting"
    >
      <p class="confirm-text">
        Удалить очередь «{{ deleteTarget.name }}»? Аккаунты, за которыми она
        закреплена, останутся без маршрутизации на неё.
      </p>
    </ModalFrame>

    <QueueMembersModal v-if="membersQueue" :queue="membersQueue" :close="() => (membersQueue = null)" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";
import QueueMembersModal from "@/components/Organization/QueueMembersModal.vue";
import { useCompanyStore } from "@/stores/companyStore";
import { useEmployeeQueuesApi } from "@/composables/useEmployeeQueuesApi";
import { getApiErrorText } from "@/composables/useBapi";
import { useStationLoading } from "@/composables/useStationLoading";
import { usePermissions } from "@/composables/usePermissions";
import { QUEUE_MODES, queueModeLabel } from "@/config/queueModes";

const companyStore = useCompanyStore();
const { fetchQueues, createQueue, updateQueue, deleteQueue } = useEmployeeQueuesApi();
const { setLoadingStatus } = useStationLoading();
const { isOwner } = usePermissions();

const loading = ref(true);
const loadError = ref("");
const saving = ref(false);
const deleting = ref(false);
const showModal = ref(false);
const editingQueue = ref(null);
const deleteTarget = ref(null);
const membersQueue = ref(null);
const form = reactive({ name: "", mode: "round_robin" });

const queues = computed(() => companyStore.getQueues);
const currentModeHint = computed(() => QUEUE_MODES.find((m) => m.id === form.mode)?.hint || "");

const modalText = computed(() => ({
  title: editingQueue.value ? "Редактировать очередь" : "Добавить очередь",
  close: "Отмена",
  action: "Сохранить",
}));

const openCreateModal = () => {
  editingQueue.value = null;
  form.name = "";
  form.mode = "round_robin";
  showModal.value = true;
};

const openEditModal = (queue) => {
  editingQueue.value = queue;
  form.name = queue.name || "";
  form.mode = queue.mode || "round_robin";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleSave = async () => {
  if (!form.name) return;
  saving.value = true;
  try {
    if (editingQueue.value) {
      await updateQueue(editingQueue.value.id, { name: form.name, mode: form.mode });
    } else {
      await createQueue({ name: form.name, mode: form.mode });
    }
    setLoadingStatus(true, "success", "Очередь сохранена");
    showModal.value = false;
  } catch (error) {
    console.error("Ошибка при сохранении очереди:", error);
    setLoadingStatus(true, "error", getApiErrorText(error, "Не удалось сохранить очередь"));
  } finally {
    saving.value = false;
  }
};

const handleDelete = async () => {
  deleting.value = true;
  try {
    await deleteQueue(deleteTarget.value.id);
    setLoadingStatus(true, "success", "Очередь удалена");
    deleteTarget.value = null;
  } catch (error) {
    console.error("Ошибка при удалении очереди:", error);
    setLoadingStatus(true, "error", getApiErrorText(error, "Не удалось удалить очередь"));
  } finally {
    deleting.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    await fetchQueues();
  } catch (error) {
    console.error("Ошибка при загрузке очередей:", error);
    loadError.value = getApiErrorText(error, "Не удалось загрузить очереди");
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.queues-tab {
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
  max-width: 760px;
  line-height: 1.5;
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

.error-state {
  color: #ef4444;
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
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.confirm-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.5;
}
</style>
