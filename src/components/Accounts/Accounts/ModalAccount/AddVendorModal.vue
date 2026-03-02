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
          Выберите аккаунты для добавления в группу (максимум по одному для
          каждого типа: WhatsApp, Telegram, VK, Max)
        </p>

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
                  'badge-max': acc.source === 'max',
                  'badge-vk': acc.source === 'vk' || acc.source === 'vk-bot',
                }"
              ></span>
              <span class="acc-type-text">{{ getSource(acc.source) }}</span>
              <span class="acc-name">{{ acc.name || acc.login }}</span>
              <span v-if="isAdded(acc)" class="acc-badge-in-group"
                >Уже в группе</span
              >
            </label>
          </div>
        </div>

        <div
          v-if="validationMessage"
          class="validation-error"
          style="margin-top: 15px"
        >
          {{ validationMessage }}
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
  try {
    if (
      !props.accountListRef ||
      typeof props.accountListRef.getAllAccounts !== "function"
    ) {
      console.error("❌ accountListRef ошибка");
      loadingAccounts.value = false;
      return;
    }

    const all = props.accountListRef.getAllAccounts();

    if (Array.isArray(all)) {
      // Добавлена поддержка 'vk' и 'vk-bot'
      const filtered = all.filter(
        (acc) =>
          acc.source === "whatsapp" ||
          acc.source === "telegram" ||
          acc.source === "max" ||
          acc.source === "vk" ||
          acc.source === "vk-bot",
      );
      availableAccounts.value = filtered;
    }

    selectedVendorUuids.value = [];
  } catch (err) {
    console.error("❌ Ошибка в onMounted:", err);
  } finally {
    loadingAccounts.value = false;
  }
});

function getSource(source) {
  switch (source) {
    case "telegram":
      return "Telegram";
    case "whatsapp":
      return "WhatsApp";
    case "max":
      return "Max";
    case "vk":
    case "vk-bot":
      return "VK";
    default:
      return source || "Неизвестно";
  }
}

// Нормализация сорса для сравнения (чтобы vk и vk-bot считались одним типом)
const normalizeSource = (source) => {
  const s = source?.toLowerCase();
  if (s === "vk-bot" || s === "vk") return "vk";
  return s;
};

// Подсчитать кол-во выбранных аккаунтов по источнику
const countSelectedBySource = (source) => {
  const target = normalizeSource(source);
  return selectedVendorUuids.value.filter((uuid) => {
    const account = availableAccounts.value.find((acc) => acc.uuid === uuid);
    return normalizeSource(account?.source) === target;
  }).length;
};

// Подсчитать уже добавленные аккаунты по источнику
const countAddedBySource = (source) => {
  const target = normalizeSource(source);
  const groupVendors = Array.isArray(props.group.vendors)
    ? props.group.vendors
    : Object.values(props.group.vendors || {});

  return (groupVendors || []).filter(
    (v) => normalizeSource(v.source) === target,
  ).length;
};

// Проверить, можно ли выбрать аккаунт
const canSelectAccount = (acc) => {
  if (isAdded(acc)) return false;

  const source = acc.source;
  const isSelected = selectedVendorUuids.value.includes(acc.uuid);

  if (isSelected) return true;

  // Лимит: 1 аккаунт каждого типа (TG, WA, VK, Max)
  const selectedCount = countSelectedBySource(source);
  const addedCount = countAddedBySource(source);

  return selectedCount + addedCount < 1;
};

const isAdded = (acc) => {
  const groupVendors = Array.isArray(props.group.vendors)
    ? props.group.vendors
    : Object.values(props.group.vendors || {});
  return (groupVendors || []).some((v) => v.uuid === acc.uuid);
};

// Сообщение о валидации
const validationMessage = computed(() => {
  const sources = ["telegram", "whatsapp", "max", "vk"];
  const errors = [];

  sources.forEach((s) => {
    if (countSelectedBySource(s) + countAddedBySource(s) > 1) {
      errors.push(`Максимум 1 ${getSource(s)}`);
    }
  });

  return errors.length > 0 ? errors.join(", ") : "";
});

const handleAddMany = async () => {
  if (selectedVendorUuids.value.length === 0) return;
  isLoading.value = true;
  try {
    await axios.post(
      "https://bapi88.developtech.ru/api/v1/groups/addVendors",
      {
        group_uuid: props.group.uuid,
        vendor_uuids: selectedVendorUuids.value,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      },
    );
    emit("added");
  } catch (err) {
    alert("Ошибка: " + (err?.response?.data?.message ?? err?.message));
  } finally {
    isLoading.value = false;
  }
};

const close = () => emit("close");
</script>

<style scoped>
/* Существующие стили без изменений, добавляем только VK */
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
  transition: all 0.2s;
  font-size: 14px;
  position: relative;
  cursor: pointer;
}

.account-checkbox:hover:not(.disabled) {
  border-color: #bfdbfe;
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
}

.badge-telegram {
  background: #0088cc;
}
.badge-whatsapp {
  background: #25d366;
}
.badge-max {
  background-color: #424ee9;
}
.badge-vk {
  background-color: #0077ff;
} /* Цвет VK */

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
  flex: 1;
  word-break: break-all;
}

.acc-badge-in-group {
  background: #f3f4f6;
  color: #888;
  font-size: 12px;
  border-radius: 4px;
  padding: 2px 8px;
}

input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #5666c8;
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
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-body {
  padding: 20px;
}

.validation-error {
  padding: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #991b1b;
  font-size: 13px;
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
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.button-primary {
  background: oklch(0.541 0.198 267);
  color: white;
  border: none;
}

.button-primary:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.button-secondary {
  background: #f3f4f6;
  border: none;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #5666c8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
</style>
