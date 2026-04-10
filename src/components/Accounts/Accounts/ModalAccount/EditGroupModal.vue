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
                <span class="messenger-name">{{ getMessengerName(item) }}</span>
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

          <div
            v-if="channelLimit !== null && formData.cascade.length >= channelLimit"
            class="limit-hint"
          >
            Достигнут лимит каналов по подписке ({{ channelLimit }})
          </div>

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

              <button
                v-if="!formData.cascade.includes('sms')"
                id="sms-button"
                type="button"
                @click="addCascadeItem('sms')"
                class="cascade-btn cascade-btn-sms"
              >
                <span class="btn-badge badge-sms"></span>
                SMS
              </button>

              <button
                v-if="!formData.cascade.includes('email')"
                id="email-button"
                type="button"
                @click="addCascadeItem('email')"
                class="cascade-btn cascade-btn-email"
              >
                <span class="btn-badge badge-email"></span>
                Email
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

const channelLimit = computed(() => {
  return props.group?.subscription_limits?.channel_count ?? props.group?.settings?.channel_count ?? null;
});

// Вычисляем доступные элементы (Добавлен vk)
const availableCascadeItems = computed(() => {
  const allItems = ["telegram", "whatsapp", "max", "sms", "email"];
  return allItems.filter((item) => !formData.cascade.includes(item));
});

const hasAvailableItems = computed(() => {
  if (channelLimit.value !== null && formData.cascade.length >= channelLimit.value) {
    return false;
  }
  return availableCascadeItems.value.length > 0;
});

// Хелпер для отображения названия мессенджера
const getMessengerName = (item) => {
  switch (item) {
    case "telegram":
      return "Telegram";
    case "whatsapp":
      return "WhatsApp";

    case "max":
      return "Max";
    case "sms":
      return "SMS";
    case "email":
      return "Email";
    default:
      return item;
  }
};

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
  { immediate: true },
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

<style scoped>
/* Стили из исходника + добавление VK */
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
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}

.form-input {
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.order-hint {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 12px;
  font-style: italic;
}

.cascade-order-container {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
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
  cursor: grab;
}

.order-item.drag-over {
  background: rgba(85, 102, 200, 0.1);
  border-color: oklch(0.541 0.198 267);
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
}

.messenger-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.messenger-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.badge-telegram {
  background: #0088cc;
}
.badge-whatsapp {
  background: #25d366;
}
.badge-vk {
  background: #0077ff;
}
.badge-max {
  background: #5b4ef5;
}
.badge-sms {
  background: #7c3aed;
}
.badge-email {
  background: #f59e0b;
}

.messenger-name {
  font-weight: 600;
  font-size: 14px;
}

.remove-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 4px;
  cursor: pointer;
}

.limit-hint {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 6px;
  font-size: 12px;
  color: #92400e;
}

.add-cascade {
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.cascade-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cascade-btn {
  flex: 1;
  min-width: 100px;
  padding: 10px 12px;
  border: 2px solid #d1d5db;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cascade-btn-vk:hover {
  border-color: #0077ff;
  background: rgba(0, 119, 255, 0.05);
}
.cascade-btn-max:hover {
  border-color: #5b4ef5;
  background: rgba(91, 78, 245, 0.05);
}
.cascade-btn-sms:hover {
  border-color: #7c3aed;
  background: rgba(124, 58, 237, 0.05);
}
.cascade-btn-email:hover {
  border-color: #fcd34d;
  background: rgba(245, 158, 11, 0.05);
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
  cursor: pointer;
}
.button-primary {
  background: oklch(0.541 0.198 267);
  color: white;
}
.button-secondary {
  background: #f3f4f6;
}
</style>
