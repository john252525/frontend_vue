<template>
  <div v-if="isOpen" class="filter-container">
    <div @click="close" class="black-fon"></div>
    <transition name="slide-fade">
      <div class="filters-wrapper">
        <div class="filters-list" :class="{ loading: isLoading }">
          <!-- Индикатор загрузки -->
          <div v-if="isLoading" class="filters-loading-overlay">
            <div class="loading-spinner"></div>
            <span class="loading-text">Загрузка...</span>
          </div>

          <!-- Переключатель для удаленных аккаунтов -->
          <div class="deleted-accounts-toggle" :class="{ disabled: isLoading }">
            <input
              type="checkbox"
              id="showDeleted"
              v-model="showDeleted"
              @change="handleDeletedToggle"
              class="toggle-checkbox"
              :disabled="isLoading"
            />
            <label for="showDeleted" class="toggle-label">
              <span class="toggle-icon">
                <TrashIcon />
              </span>
              <span class="toggle-name">Удаленные</span>
            </label>
          </div>

          <div
            v-for="item in items"
            :key="item.id"
            class="filter-item"
            :class="{
              active: item.checked,
              disabled: isLoading,
            }"
          >
            <input
              type="checkbox"
              :id="item.id"
              v-model="item.checked"
              @change="handleCheckboxChange(item)"
              class="filter-checkbox"
              :disabled="isLoading"
            />
            <label :for="item.id" class="filter-label">
              <span class="filter-icon">
                <component :is="getIconComponent(item.id)" />
              </span>
              <span class="filter-name">{{ item.name }}</span>
            </label>

            <!-- Подфильтры CRM слева -->
            <transition name="subitem-slide">
              <div v-if="item.id === 'crm' && item.checked" class="sub-filters">
                <div
                  v-for="subItem in crmSubItems"
                  :key="subItem.id"
                  class="sub-filter-item"
                  :class="{ active: subItem.checked, disabled: isLoading }"
                >
                  <input
                    type="checkbox"
                    :id="subItem.id"
                    v-model="subItem.checked"
                    @change="handleCrmSubItemChange(subItem)"
                    class="sub-filter-checkbox"
                    :disabled="isLoading"
                  />
                  <label :for="subItem.id" class="sub-filter-label">
                    <span class="sub-filter-icon">
                      <component :is="getIconComponent(subItem.id)" />
                    </span>
                    <span class="sub-filter-name">{{ subItem.name }}</span>
                  </label>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useAccountStore } from "@/stores/accountStore";
import { useAccountsCache } from "@/composables/useAccountsCache";

const accountStore = useAccountStore();
const { invalidateCache: invalidateCacheComposable } = useAccountsCache();

const props = defineProps({
  isOpen: {
    type: Boolean,
  },
  close: {
    type: Function,
  },
  getAccounts: {
    type: Function,
  },
  invalidateCache: {
    type: Function,
  },
});

const isLoading = computed(() => {
  const loading = accountStore.isLoading;
  console.log("📊 Filters: computed isLoading =", loading);
  return loading;
});

watch(
  isLoading,
  (newVal, oldVal) => {
    console.log("🔍 Filters: isLoading изменился с", oldVal, "на", newVal);
  },
  { immediate: true }
);

onMounted(() => {
  console.log("🎯 Filters mounted, текущий isLoading:", isLoading.value);
});

// Инициализация состояний из store
const items = reactive([
  {
    id: "telegram",
    name: "Telegram",
    checked: accountStore.filterState.telegram,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    checked: accountStore.filterState.whatsapp,
  },
  {
    id: "bulk",
    name: "Рассылки",
    checked: accountStore.filterState.bulk,
  },
  { id: "crm", name: "CRM", checked: accountStore.filterState.crm },
]);

const crmSubItems = reactive([
  { id: "amocrm", name: "AmoCRM", checked: accountStore.filterState.amocrm },
  {
    id: "bitrix24",
    name: "Bitrix24",
    checked: accountStore.filterState.bitrix24,
  },
  {
    id: "uon",
    name: "U-ON",
    checked: accountStore.filterState.uon,
  },
]);

const showDeleted = ref(accountStore.getAddDeleted);

const result = reactive({
  source: [...accountStore.source],
  group: [...accountStore.group],
  type: [...accountStore.type],
});

// Методы
const getIconComponent = (id) => {
  switch (id) {
    case "telegram":
      return TelegramIcon;
    case "whatsapp":
      return WhatsAppIcon;
    case "crm":
      return CrmIcon;
    case "amocrm":
      return AmoCrmIcon;
    case "bitrix24":
      return Bitrix24Icon;
    case "uon":
      return UonIcon;
    default:
      return null;
  }
};

const handleCheckboxChange = (item) => {
  console.log("🎯 Filters: изменение чекбокса", item.id);
  updateSources();
  updateGroups();
  updateCrmTypes();
  updateFilterState();
  applyFilters();
};

const handleCrmSubItemChange = (subItem) => {
  console.log("🎯 Filters: изменение CRM подфильтра", subItem.id);
  updateCrmTypes();
  updateFilterState();
  applyFilters();
};

const handleDeletedToggle = () => {
  console.log(
    "🎯 Filters: переключение удаленных аккаунтов",
    showDeleted.value
  );
  accountStore.setAddDeleted(showDeleted.value);
  applyFilters();
};

const updateSources = () => {
  result.source = items.filter((item) => item.checked).map((item) => item.id);
  accountStore.setSource(result.source);
  console.log("🔄 Filters: источники обновлены", result.source);
};

const updateGroups = () => {
  const messengerSelected = items.some(
    (item) => (item.id === "telegram" || item.id === "whatsapp") && item.checked
  );
  const crmSelected = items.find((item) => item.id === "crm")?.checked || false;
  const bulkSelected =
    items.find((item) => item.id === "bulk")?.checked || false;

  result.group = [];
  if (messengerSelected) result.group.push("messenger");
  if (crmSelected) result.group.push("crm");
  if (bulkSelected) result.group.push("bulk");

  accountStore.setGroup(result.group);
  console.log("🔄 Filters: группы обновлены", result.group);
};

const updateCrmTypes = () => {
  result.type = crmSubItems
    .filter((subItem) => subItem.checked)
    .map((subItem) => subItem.id);
  accountStore.setType(result.type);
  console.log("🔄 Filters: типы CRM обновлены", result.type);
};

const updateFilterState = () => {
  const newFilterState = {
    telegram: items.find((i) => i.id === "telegram")?.checked || false,
    whatsapp: items.find((i) => i.id === "whatsapp")?.checked || false,
    crm: items.find((i) => i.id === "crm")?.checked || false,
    amocrm: crmSubItems.find((i) => i.id === "amocrm")?.checked || false,
    bitrix24: crmSubItems.find((i) => i.id === "bitrix24")?.checked || false,
    uon: crmSubItems.find((i) => i.id === "uon")?.checked || false,
    bulk: items.find((i) => i.id === "bulk")?.checked || false,
  };
  accountStore.setFilterState(newFilterState);
  console.log("🔄 Filters: состояние фильтров обновлено", newFilterState);
};

// ✅ КЛЮЧЕВОЙ МЕТОД - применение фильтров
const applyFilters = async () => {
  console.log("🔥 Filters: применение фильтров");

  // 1. Инвалидируем кеш (используем пропс, если передан, иначе composable)
  if (props.invalidateCache) {
    console.log("   - Инвалидация через props");
    props.invalidateCache();
  } else {
    console.log("   - Инвалидация через composable");
    invalidateCacheComposable();
  }

  // 2. Загружаем новые данные
  if (props.getAccounts) {
    console.log("   - Загрузка новых аккаунтов");
    await props.getAccounts();
  } else {
    console.error("❌ Filters: getAccounts не передан в props");
  }
};

// Иконки (ваши существующие)
const TrashIcon = {
  template: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
};

const TelegramIcon = {
  template: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.78 5.42-.9 6.8-.06.67-.36.89-.89.56-2.45-1.83-3.57-2.98-5.79-4.78-.54-.45-.92-.68-.89-1.07.03-.38.42-.55.98-.4 3.95 1.54 6.33 2.5 9.05 3.64.47.19.75.09.87-.5.33-1.64 1.11-5.2 1.4-6.67.06-.29-.08-.43-.47-.35-1.92.67-5.36 1.89-7.45 2.56-.58.19-.98.28-1.18.27-.3-.02-.83-.16-1.24-.29-.5-.16-.9-.24-.87-.51.02-.17.25-.34.7-.52z"/></svg>`,
};

const WhatsAppIcon = {
  template: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.47c.15 0 .36-.06.55.45l.69 1.87c.06.13.1.28.01.44l-.27.41-.39.42c-.12.12-.26.25-.12.5.12.26.62 1.09 1.32 1.78.91.88 1.71 1.17 1.95 1.3.24.14.39.12.54-.04l.81-.94c.19-.25.35-.19.58-.11l1.67.88M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65A9.969 9.969 0 0 1 2 12 10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.96A7.95 7.95 0 0 0 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8z"/></svg>`,
};

const CrmIcon = {
  template: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>`,
};

const AmoCrmIcon = {
  template: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`,
};

const Bitrix24Icon = {
  template: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
};

const UonIcon = {
  template: `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
                <circle cx="64" cy="64" r="60.846" fill="#ef496a"/>
                <path fill="#fff" d="m33.24 27.435h2.648v5.121q0 .762-.24 1.441-.234.674-.744 1.184-.504.504-1.06.709-.774.287-1.858.287-.627 0-1.371-.088-.738-.088-1.236-.346-.498-.264-.914-.744-.41-.48-.562-.99-.246-.82-.246-1.453v-5.121h2.648v5.244q0 .703.387 1.102.392.392 1.084.392.686 0 1.072-.387.393-.392.393-1.107z" transform="matrix(8.5147 0 0 8.5147 -205.84 -202.89)"/>
              </svg>`,
};
</script>

<style scoped>
.filter-container {
  font-size: 13px;
}

.filter-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #4f46e5;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  font-size: 13px;
}

.filter-trigger:hover {
  background-color: #4338ca;
}

.filter-trigger svg {
  transition: transform 0.2s ease;
}

.filters-wrapper {
  position: absolute;
  z-index: 10;
  top: 120px;
  right: 115px;
  z-index: 10;
}

.filters-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  width: 140px;
  position: relative;
}

/* Стили для состояния загрузки */
.filters-list {
  position: relative;
}

.filters-list.loading {
  opacity: 0.7;
  pointer-events: none;
}

.filters-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  z-index: 5;
  gap: 8px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 12px;
  color: #4f46e5;
  font-weight: 500;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.filter-item.disabled .filter-label {
  opacity: 0.6;
  cursor: not-allowed;
}

.deleted-accounts-toggle.disabled .toggle-label {
  opacity: 0.6;
  cursor: not-allowed;
}

.sub-filter-item.disabled .sub-filter-label {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ИЗМЕНЕННЫЕ СТИЛИ ДЛЯ ПЕРЕКЛЮЧАТЕЛЯ УДАЛЕННЫХ АККАУНТОВ */
.deleted-accounts-toggle {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  font-size: 13px;
  font-weight: 500;
}

.toggle-checkbox:checked + .toggle-label {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fecaca;
  color: #dc2626;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15);
}

.toggle-label:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  transition: all 0.3s ease;
}

.toggle-checkbox:checked + .toggle-label .toggle-icon {
  color: #dc2626;
  transform: scale(1.1);
}

.toggle-name {
  font-weight: 500;
  transition: all 0.3s ease;
}

.toggle-checkbox:checked + .toggle-label .toggle-name {
  color: #dc2626;
  font-weight: 600;
}

.toggle-checkbox {
  position: absolute;
  opacity: 0;
}

.filter-item {
  position: relative;
}

.filter-label {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 3px;
  background-color: #f9fafb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
  font-size: 13px;
}

.filter-item.active .filter-label {
  background-color: #eef2ff;
  border-color: #c7d2fe;
  color: #4f46e5;
}

.filter-icon {
  display: flex;
}

.filter-name {
  font-weight: 400;
}

.filter-checkbox {
  position: absolute;
  opacity: 0;
}

.sub-filters {
  position: absolute;
  right: 100%;
  top: 0;
  margin-right: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: white;
  padding: 6px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  z-index: 20;
  min-width: 10px;
}

.sub-filter-item {
  display: flex;
}

.sub-filter-label {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 6px;
  padding: 4px 8px;
  background-color: #f9fafb;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
  font-size: 14px;
}

.sub-filter-item.active .sub-filter-label {
  background-color: #eef2ff;
  border-color: #c7d2fe;
  color: #4f46e5;
}

.sub-filter-checkbox {
  position: absolute;
  opacity: 0;
}

/* Анимации */
.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.15s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-5px);
  opacity: 0;
}

.subitem-slide-enter-active {
  transition: all 0.2s ease;
}

.subitem-slide-leave-active {
  transition: all 0.15s ease;
}

.subitem-slide-enter-from,
.subitem-slide-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.debug-info {
  margin-top: 16px;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 12px;
}

pre {
  margin: 0;
  font-size: 11px;
}

.black-fon {
  position: absolute;
  z-index: 5;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@media (max-width: 768px) {
  .filters-wrapper {
    position: absolute;
    z-index: 10;
    top: 165px;
    left: 120px;
    z-index: 10;
  }

  .filters-list {
    width: 130px;
  }

  .sub-filters {
    margin-right: 12px;
  }
}

@media (max-width: 480px) {
  .filters-wrapper {
    top: 155px;
    left: 100px;
  }

  .filters-list {
    width: 120px;
    padding: 6px;
  }

  .toggle-label,
  .filter-label {
    font-size: 12px;
    padding: 6px 8px;
  }

  .sub-filter-label {
    font-size: 12px;
    padding: 3px 6px;
  }
}
</style>
