<template>
  <div v-if="isOpen" class="filter-container">
    <div @click="close" class="black-fon"></div>
    <transition name="slide-fade">
      <div class="filters-wrapper">
        <div class="filters-list">
          <!-- Переключатель для удаленных аккаунтов - ИЗМЕНЕННЫЙ -->
          <div class="deleted-accounts-toggle">
            <input
              type="checkbox"
              id="showDeleted"
              v-model="showDeleted"
              @change="handleDeletedToggle"
              class="toggle-checkbox"
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
            :class="{ active: item.checked }"
          >
            <input
              type="checkbox"
              :id="item.id"
              v-model="item.checked"
              @change="handleCheckboxChange(item)"
              class="filter-checkbox"
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
                  :class="{ active: subItem.checked }"
                >
                  <input
                    type="checkbox"
                    :id="subItem.id"
                    v-model="subItem.checked"
                    @change="handleCrmSubItemChange(subItem)"
                    class="sub-filter-checkbox"
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
import { ref, reactive, watch } from "vue";
import { useAccountStore } from "@/stores/accountStore";

const accountStore = useAccountStore();

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
]);

// Флаг для показа удаленных аккаунтов
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
    default:
      return null;
  }
};

const handleCheckboxChange = (item) => {
  updateSources();
  updateGroups();
  updateCrmTypes();
  updateFilterState();
  handleSomeAction();
};

const handleCrmSubItemChange = (subItem) => {
  updateCrmTypes();
  updateFilterState();
  handleSomeAction();
};

// Обработчик переключения показа удаленных аккаунтов
const handleDeletedToggle = () => {
  accountStore.setAddDeleted(showDeleted.value);
  handleSomeAction();
};

const updateSources = () => {
  result.source = items.filter((item) => item.checked).map((item) => item.id);
  accountStore.setSource(result.source);
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
};

const updateCrmTypes = () => {
  result.type = crmSubItems
    .filter((subItem) => subItem.checked)
    .map((subItem) => subItem.id);
  accountStore.setType(result.type);
};

const updateFilterState = () => {
  const newFilterState = {
    telegram: items.find((i) => i.id === "telegram")?.checked || false,
    whatsapp: items.find((i) => i.id === "whatsapp")?.checked || false,
    crm: items.find((i) => i.id === "crm")?.checked || false,
    amocrm: crmSubItems.find((i) => i.id === "amocrm")?.checked || false,
    bitrix24: crmSubItems.find((i) => i.id === "bitrix24")?.checked || false,
    bulk: items.find((i) => i.id === "bulk")?.checked || false,
  };
  accountStore.setFilterState(newFilterState);
};

const handleSomeAction = () => {
  if (props.getAccounts) {
    props.getAccounts();
  }
};

// Новая SVG иконка для корзины
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

// Остальные иконки (остаются без изменений)
const TelegramIcon = {
  /* ... */
};
const WhatsAppIcon = {
  /* ... */
};
const CrmIcon = {
  /* ... */
};
const AmoCrmIcon = {
  /* ... */
};
const Bitrix24Icon = {
  /* ... */
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
  width: 140px; /* Немного увеличили ширину */
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

@media (max-width: 768px) {
  .filters-wrapper {
    position: absolute;
    z-index: 10;
    top: 165px;
    left: 120px;
    z-index: 10;
  }
}
</style>
