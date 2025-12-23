<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Редактировать группу</h2>
        <button @click="close" class="modal-close">
          <svg viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Имя группы</label>
          <input v-model="formData.name" type="text" class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">Порядок отправки сообщений</label>
          <p class="order-hint">
            Перетаскивайте элементы для изменения порядка
          </p>

          <div class="cascade-order-container">
            <div
              v-for="(item, index) in formData.cascade"
              :key="`${item}-${index}`"
              draggable="true"
              @dragstart="dragStart($event, index)"
              @dragover="dragOver($event)"
              @drop="dragDrop($event, index)"
              @dragend="dragEnd"
              :class="['order-item', { 'drag-over': dragOverIndex === index }]"
            >
              <div class="drag-handle">
                <svg viewBox="0 0 20 20" class="handle-icon">
                  <path
                    d="M8 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
                  ></path>
                </svg>
              </div>

              <span class="order-number">{{ index + 1 }}</span>

              <div class="messenger-info">
                <div class="messenger-badge" :class="`badge-${item}`"></div>
                <span class="messenger-name">{{
                  item === "telegram"
                    ? "Telegram"
                    : item === "whatsapp"
                    ? "WhatsApp"
                    : "Max"
                }}</span>
              </div>

              <button
                type="button"
                @click="toggleCascadeItem(item)"
                class="remove-btn"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Добавление нового канала -->
          <div class="add-cascade" v-if="hasAvailableItems">
            <p class="label-sm">Добавить канал:</p>
            <div class="cascade-options">
              <button
                v-if="!formData.cascade.includes('telegram')"
                type="button"
                @click="addCascadeItem('telegram')"
                id="telegram-button"
                class="cascade-btn cascade-btn-telegram"
              >
                <span class="btn-badge badge-telegram"></span>
                Telegram
              </button>
              <button
                v-if="!formData.cascade.includes('whatsapp')"
                id="whatsapp-button"
                type="button"
                @click="addCascadeItem('whatsapp')"
                class="cascade-btn cascade-btn-whatsapp"
              >
                <span class="btn-badge badge-whatsapp"></span>
                WhatsApp
              </button>
              <button
                v-if="!formData.cascade.includes('max')"
                id="max-button"
                type="button"
                @click="addCascadeItem('max')"
                class="cascade-btn cascade-btn-max"
              >
                <span class="btn-badge badge-max"></span>
                Max
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="close" class="button button-secondary">Отмена</button>
        <button
          @click="handleUpdate"
          :disabled="isLoading"
          class="button button-primary"
        >
          {{ isLoading ? "Загрузка..." : "Сохранить" }}
        </button>
      </div>
    </div>
  </div>
</template>

<!-- SCRIPT -->
<script setup>
import { ref, reactive, watch, computed } from "vue";
import { useVendorGroups } from "@/composables/useVendorGroups";
import { useAccountStore } from "@/stores/accountStore";

const props = defineProps({
  group: Object,
});

const emit = defineEmits(["close", "updated"]);

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const { updateGroup } = useVendorGroups(token);

const isLoading = ref(false);
const dragOverIndex = ref(null);
const draggedIndex = ref(null);

const formData = reactive({
  name: "",
  cascade: [],
});

// Вычисляем доступные элементы
const availableCascadeItems = computed(() => {
  const allItems = ["telegram", "whatsapp", "max"]; // ← добавить "max"
  return allItems.filter((item) => !formData.cascade.includes(item));
});

const hasAvailableItems = computed(
  () => availableCascadeItems.value.length > 0
);

watch(
  () => props.group,
  (newGroup) => {
    if (newGroup) {
      formData.name = newGroup.name;
      try {
        const settings =
          typeof newGroup.settings === "string"
            ? JSON.parse(newGroup.settings)
            : newGroup.settings;
        formData.cascade = settings?.cascade || [];
      } catch {
        formData.cascade = [];
      }
    }
  },
  { immediate: true }
);

const dragStart = (e, index) => {
  draggedIndex.value = index;
  e.dataTransfer.effectAllowed = "move";
};

const dragOver = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
};

const dragDrop = (e, index) => {
  e.preventDefault();

  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    const draggedItem = formData.cascade[draggedIndex.value];
    formData.cascade.splice(draggedIndex.value, 1);
    formData.cascade.splice(index, 0, draggedItem);
  }

  dragOverIndex.value = null;
  draggedIndex.value = null;
};

const dragEnd = () => {
  dragOverIndex.value = null;
  draggedIndex.value = null;
};

const close = () => {
  emit("close");
};

const addCascadeItem = (item) => {
  formData.cascade.push(item);
};

const toggleCascadeItem = (item) => {
  const index = formData.cascade.indexOf(item);
  if (index > -1) {
    formData.cascade.splice(index, 1);
  }
};

const handleUpdate = async () => {
  isLoading.value = true;
  try {
    const result = await updateGroup({
      uuid: props.group.uuid,
      name: formData.name,
      settings: {
        cascade: formData.cascade,
      },
    });

    if (result?.ok) {
      emit("updated");
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<!-- STYLES -->
<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-weight: 600;
  font-size: 18px;
  color: var(--text);
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.25s;
}

.modal-close:hover {
  background: #f3f4f6;
  color: var(--text);
}

.modal-close svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  box-sizing: border-box;
  display: block;
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
  margin-bottom: 8px;
}

.form-input {
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.25s;
}

.form-input:focus {
  outline: none;
  border-color: oklch(0.541 0.198 267);
  box-shadow: 0 0 0 3px rgba(85, 102, 200, 0.1);
}

.order-hint {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 12px 0;
  font-style: italic;
}

.cascade-order-container {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  transition: all 0.25s;
  cursor: grab;
  user-select: none;
}

.order-item:hover {
  border-color: #bfdbfe;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.order-item.drag-over {
  background: rgba(85, 102, 200, 0.1);
  border-color: oklch(0.541 0.198 267);
  transform: scale(1.02);
}

.order-item:active {
  cursor: grabbing;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.25s;
}

.order-item:hover .drag-handle {
  opacity: 1;
}

.handle-icon {
  width: 20px;
  height: 20px;
  fill: #6b7280;
}

.order-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: oklch(0.541 0.198 267);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}

.messenger-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.messenger-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
}

.badge-telegram {
  background: #0088cc;
}

.badge-whatsapp {
  background: #25d366;
}

.messenger-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  flex-shrink: 0;
  transition: all 0.25s;
}

.remove-btn:hover {
  background: #fca5a5;
}

.add-cascade {
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.label-sm {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 10px 0;
}

.cascade-options {
  display: flex;
  gap: 8px;
}

.cascade-btn {
  flex: 1;
  padding: 10px 12px;
  border: 2px solid #d1d5db;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.25s;
}

.badge-max {
  background: #5b4ef5; /* или любой другой цвет на твой выбор */
}

.cascade-btn-max:hover {
  background: rgba(91, 78, 245, 0.05);
  border-color: #c4b5fd;
}

.cascade-btn:hover {
  border-color: #bfdbfe;
  background: rgba(0, 136, 204, 0.05);
}

.cascade-btn-whatsapp:hover {
  background: rgba(37, 211, 102, 0.05);
  border-color: #86efac;
}

.btn-badge {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s;
}

.button-primary {
  background: oklch(0.541 0.198 267);
  color: white;
}

.button-primary:hover:not(:disabled) {
  background: #565cc8;
}

.button-primary:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.button-secondary {
  background: #f3f4f6;
  color: var(--text);
}

.button-secondary:hover {
  background: #e5e7eb;
}
</style>
