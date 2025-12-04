<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Добавить аккаунт</h2>
        <button @click="close" class="modal-close">
          <svg viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <p class="info-text">
          Выберите аккаунты для добавления в группу (максимум 2: один WhatsApp и
          один Telegram)
        </p>

        <!-- Сообщение об ошибке валидации -->
        <div v-if="validationMessage" class="validation-error">
          ⚠️ {{ validationMessage }}
        </div>

        <div v-if="loadingAccounts" class="loading-spinner">
          <div class="spinner"></div>
          <p>Загрузка аккаунтов...</p>
        </div>
        <div v-else>
          <div v-if="availableAccounts.length === 0" class="no-accounts">
            ⚠️ Нет аккаунтов для добавления
          </div>
          <div v-else class="account-options-multiselect">
            <label
              v-for="acc in availableAccounts"
              :key="acc.uuid"
              :class="[
                'account-checkbox',
                `type-${acc.source?.toLowerCase()}`,
                { disabled: !canSelectAccount(acc) },
              ]"
            >
              <input
                type="checkbox"
                v-model="selectedVendorUuids"
                :value="acc.uuid"
                :disabled="!canSelectAccount(acc)"
              />
              <span
                class="type-badge"
                :class="{
                  'badge-telegram': acc.source === 'telegram',
                  'badge-whatsapp': acc.source === 'whatsapp',
                }"
              ></span>
              <span class="acc-type-text">{{
                acc.source === "telegram" ? "Telegram" : "WhatsApp"
              }}</span>
              <span class="acc-name">{{ acc.name || acc.login }}</span>
              <span v-if="isAdded(acc)" class="acc-badge-in-group"
                >Уже в группе</span
              >
            </label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="close" class="button button-secondary">Отмена</button>
        <button
          @click="handleAddMany"
          :disabled="isLoading || selectedVendorUuids.length === 0"
          class="button button-primary"
        >
          {{ isLoading ? "Загрузка..." : "Добавить выбранные" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

const GROUP_URL = import.meta.env.VITE_GROUP_URL;

const props = defineProps({
  group: Object,
  accountListRef: Object,
});

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const emit = defineEmits(["close", "added"]);

const isLoading = ref(false);
const loadingAccounts = ref(true);
const selectedVendorUuids = ref([]);
const availableAccounts = ref([]);

onMounted(async () => {
  loadingAccounts.value = true;
  console.log("🔍 AddVendorModal: accountListRef =", props.accountListRef);

  try {
    if (!props.accountListRef) {
      console.error("❌ accountListRef не передан в модалку!");
      loadingAccounts.value = false;
      return;
    }

    if (typeof props.accountListRef.getAllAccounts !== "function") {
      console.error("❌ getAllAccounts не функция!");
      loadingAccounts.value = false;
      return;
    }

    const all = props.accountListRef.getAllAccounts();
    console.log("📦 Все аккаунты:", all);

    if (Array.isArray(all) && all.length > 0) {
      const filtered = all.filter(
        (acc) => acc.source === "whatsapp" || acc.source === "telegram"
      );
      console.log("✅ Отфильтровано аккаунтов:", filtered.length, filtered);
      availableAccounts.value = filtered;
    } else {
      console.warn("⚠️ Аккаунты пустые или не массив");
    }

    selectedVendorUuids.value = [];
  } catch (err) {
    console.error("❌ Ошибка в onMounted:", err);
  } finally {
    loadingAccounts.value = false;
  }
});

// Подсчитать кол-во выбранных аккаунтов по источнику
const countSelectedBySource = (source) => {
  return selectedVendorUuids.value.filter((uuid) => {
    const account = availableAccounts.value.find((acc) => acc.uuid === uuid);
    return account?.source?.toLowerCase() === source.toLowerCase();
  }).length;
};

// Подсчитать уже добавленные аккаунты по источнику
const countAddedBySource = (source) => {
  const groupVendors = Array.isArray(props.group.vendors)
    ? props.group.vendors
    : Object.values(props.group.vendors || {});

  return (groupVendors || []).filter(
    (v) => v.source?.toLowerCase() === source.toLowerCase()
  ).length;
};

// Проверить, можно ли выбрать аккаунт
const canSelectAccount = (acc) => {
  // Уже добавлен в группу - нельзя выбрать
  if (isAdded(acc)) return false;

  const source = acc.source?.toLowerCase();
  const isSelected = selectedVendorUuids.value.includes(acc.uuid);

  // Если аккаунт уже выбран, можем его снять
  if (isSelected) return true;

  // Если не выбран, проверяем лимит: максимум 1 per source
  const selectedCount = countSelectedBySource(source);
  const addedCount = countAddedBySource(source);

  return selectedCount + addedCount < 1;
};

// Проверить, можно ли добавлять (максимум 2 аккаунта всего)
const isMaxAccountsSelected = computed(() => {
  return selectedVendorUuids.value.length >= 2;
});

// Получить сообщение об ошибке валидации
const validationMessage = computed(() => {
  const telegramCount =
    countSelectedBySource("telegram") + countAddedBySource("telegram");
  const whatsappCount =
    countSelectedBySource("whatsapp") + countAddedBySource("whatsapp");

  const errors = [];
  if (telegramCount > 1) errors.push("Максимум 1 Telegram аккаунт");
  if (whatsappCount > 1) errors.push("Максимум 1 WhatsApp аккаунт");

  return errors.length > 0 ? errors.join(", ") : "";
});

const isAdded = (acc) => {
  const groupVendors = Array.isArray(props.group.vendors)
    ? props.group.vendors
    : Object.values(props.group.vendors || {});
  return (groupVendors || []).some((v) => v.uuid === acc.uuid);
};

const handleAddMany = async () => {
  if (selectedVendorUuids.value.length === 0) return;
  isLoading.value = true;
  try {
    await axios.post(
      `${GROUP_URL}/addVendors`,
      {
        group_uuid: props.group.uuid,
        vendor_uuids: selectedVendorUuids.value,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
    emit("added");
  } catch (err) {
    alert(
      "Ошибка при добавлении вендоров: " +
        (err?.response?.data?.message ?? err?.message ?? err)
    );
  } finally {
    isLoading.value = false;
  }
};

const close = () => emit("close");
</script>

<style scoped>
.account-options-multiselect {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 8px;
}

.account-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  transition: box-shadow 0.2s, border 0.2s, background 0.2s;
  font-size: 14px;
  position: relative;
}

.account-checkbox:hover:not(.disabled) {
  border-color: #bfdbfe;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  background: #f9fafb;
}

.account-checkbox.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
}

.type-badge {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: inline-block;
  margin-right: 2px;
}

.badge-telegram {
  background: #0088cc;
}

.badge-whatsapp {
  background: #25d366;
}

.acc-type-text {
  min-width: 70px;
  font-weight: 600;
  color: #324b72;
  font-size: 13px;
}

.acc-name {
  font-size: 14px;
  color: #111827;
  font-weight: 500;
  margin-left: 10px;
  word-break: break-all;
  flex: 1;
}

.acc-badge-in-group {
  background: #f3f4f6;
  color: #888;
  font-size: 12px;
  border-radius: 4px;
  padding: 2px 8px;
  margin-left: 10px;
}

input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #5666c8;
  flex-shrink: 0;
}

input[type="checkbox"]:disabled {
  cursor: not-allowed;
}

.validation-error {
  padding: 12px;
  margin-bottom: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #991b1b;
  font-size: 13px;
}

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

.info-text {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px 0;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid oklch(0.541 0.198 267);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-accounts {
  padding: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #991b1b;
  text-align: center;
  font-size: 14px;
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
