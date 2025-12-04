<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Удалить вендора</h2>
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
        <div class="warning-icon">⚠️</div>
        <p class="warning-title">Удалить аккаунт?</p>

        <div class="vendor-details">
          <div class="detail-row">
            <span class="detail-label">Тип:</span>
            <span class="detail-value">
              <span class="vendor-badge" :class="`vendor-${vendor.source}`">
                {{ vendor.source.toUpperCase() }}
              </span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Логин:</span>
            <span class="detail-value">{{ vendor.login }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Группа:</span>
            <span class="detail-value">{{ group.name }}</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="close" class="button button-secondary">Отмена</button>
        <button
          @click="handleRemove"
          :disabled="isLoading"
          class="button button-danger"
        >
          {{ isLoading ? "Загрузка..." : "Удалить" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useVendorGroups } from "@/composables/useVendorGroups";
import { useAccountStore } from "@/stores/accountStore";

const props = defineProps({
  group: Object,
  vendor: Object,
});

const emit = defineEmits(["close", "removed"]);

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const { deleteVendorFromGroup } = useVendorGroups(token);

const isLoading = ref(false);

const close = () => {
  emit("close");
};

const handleRemove = async () => {
  isLoading.value = true;
  try {
    const result = await deleteVendorFromGroup(
      props.group.uuid,
      props.vendor.uuid
    );
    if (result?.ok) {
      emit("removed");
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

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

.warning-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: 16px;
}

.warning-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--text);
  text-align: center;
  margin: 0 0 8px 0;
}

.warning-description {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  margin: 0 0 16px 0;
}

.vendor-details {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.detail-row:not(:last-child) {
  border-bottom: 1px solid #fee2e2;
  padding-bottom: 8px;
}

.detail-label {
  font-weight: 600;
  color: #991b1b;
}

.detail-value {
  color: #7f1d1d;
}

.vendor-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.vendor-whatsapp {
  background: #dcfce7;
  color: #166534;
}

.vendor-telegram {
  background: #dbeafe;
  color: #1e40af;
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

.button-danger {
  background: #ef4444;
  color: white;
}

.button-danger:hover:not(:disabled) {
  background: #dc2626;
}

.button-danger:disabled {
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
