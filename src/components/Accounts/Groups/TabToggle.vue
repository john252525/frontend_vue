<template>
  <div class="toggle-wrapper">
    <button
      @click="switchTab('accounts')"
      :class="['toggle-button', { active: currentTab === 'accounts' }]"
    >
      <svg
        class="toggle-icon"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.39781 11.2001C4.1709 11.2001 4.79761 11.8268 4.79761 12.5999V14.5979C4.79761 15.371 4.1709 15.9977 3.39781 15.9977H1.3998C0.626711 15.9977 0 15.371 0 14.5979V12.5999C0 11.8268 0.626711 11.2001 1.3998 11.2001H3.39781ZM6.19758 12.7981H15.4001C15.7314 12.7981 16 13.0667 16 13.3981C16 13.7018 15.7743 13.9528 15.4815 13.9925L15.4001 13.998H6.19758C5.86625 13.998 5.59766 13.7294 5.59766 13.3981C5.59766 13.0943 5.82335 12.8433 6.11617 12.8036L6.19758 12.7981ZM3.39781 5.60004C4.1709 5.60004 4.79761 6.22675 4.79761 6.99984V8.99785C4.79761 9.77093 4.1709 10.3976 3.39781 10.3976H1.3998C0.626711 10.3976 0 9.77093 0 8.99785V6.99984C0 6.22675 0.626711 5.60004 1.3998 5.60004H3.39781ZM6.19758 7.19896H15.4001C15.7314 7.19896 16 7.46755 16 7.79887C16 8.10258 15.7743 8.35358 15.4815 8.39331L15.4001 8.39878H6.19758C5.86625 8.39878 5.59766 8.13019 5.59766 7.79887C5.59766 7.49516 5.82335 7.24416 6.11617 7.20443L6.19758 7.19896ZM3.39781 0C4.1709 0 4.79761 0.626711 4.79761 1.3998V3.39781C4.79761 4.17089 4.1709 4.79761 3.39781 4.79761H1.3998C0.626711 4.79761 0 4.17089 0 3.39781V1.3998C0 0.626711 0.626711 0 1.3998 0H3.39781ZM6.19758 1.59977H15.4001C15.7314 1.59977 16 1.86836 16 2.19968C16 2.50339 15.7743 2.75439 15.4815 2.79412L15.4001 2.79959H6.19758C5.86625 2.79959 5.59766 2.531 5.59766 2.19968C5.59766 1.89597 5.82335 1.64497 6.11617 1.60524L6.19758 1.59977Z"
          fill="#656565"
        />
      </svg>
      Аккаунты
    </button>
    <button
      @click="handleGroupsClick"
      :class="['toggle-button', { active: currentTab === 'groups' }]"
      :disabled="isLoading"
    >
      <svg
        v-if="!isLoading"
        class="toggle-icon"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.801079 7.99676L3.20108 8C3.64291 8.0006 4.0006 8.35925 4 8.80108C3.99945 9.21135 3.69016 9.54907 3.29222 9.59474L3.19892 9.6L1.6 9.5968V13.5992L3.2 13.6C3.61027 13.6 3.94841 13.9088 3.99462 14.3067L4 14.4C4 14.8103 3.69117 15.1484 3.2933 15.1946L3.2 15.2H0.8C0.389731 15.2 0.0515942 14.8912 0.00538216 14.4933L0 14.4V8.79676C0 8.3861 0.3094 8.04779 0.707689 8.00203L0.801079 7.99676ZM15.2 12C15.6418 12 16 12.3582 16 12.8C16 13.2103 15.6912 13.5484 15.2933 13.5946L15.2 13.6H5.6C5.15817 13.6 4.8 13.2418 4.8 12.8C4.8 12.3897 5.10883 12.0516 5.5067 12.0054L5.6 12H15.2ZM15.2 9.6C15.6418 9.6 16 9.95817 16 10.4C16 10.8103 15.6912 11.1484 15.2933 11.1946L15.2 11.2H5.6C5.15817 11.2 4.8 10.8418 4.8 10.4C4.8 9.98973 5.10883 9.65159 5.5067 9.60538L5.6 9.6H15.2ZM3.2 0C3.64183 0 4 0.358172 4 0.8C4 1.21027 3.69117 1.54841 3.2933 1.59462L3.2 1.6H1.6V5.596L3.2 5.59605C3.61027 5.59605 3.94841 5.90488 3.99462 6.30275L4 6.39605C4 6.80632 3.69117 7.14445 3.2933 7.19067L3.2 7.19605H0.8C0.389731 7.19605 0.0515942 6.88722 0.00538216 6.48934L0 6.39605V0.8C0 0.389731 0.308832 0.0515942 0.706703 0.00538216L0.8 0H3.2ZM15.2 4C15.6418 4 16 4.35817 16 4.8C16 5.21027 15.6912 5.54841 15.2933 5.59462L15.2 5.6H5.6C5.15817 5.6 4.8 5.24183 4.8 4.8C4.8 4.38973 5.10883 4.05159 5.5067 4.00538L5.6 4H15.2ZM15.2 1.6C15.6418 1.6 16 1.95817 16 2.4C16 2.81027 15.6912 3.14841 15.2933 3.19462L15.2 3.2H5.6C5.15817 3.2 4.8 2.84183 4.8 2.4C4.8 1.98973 5.10883 1.65159 5.5067 1.60538L5.6 1.6H15.2Z"
          fill="#656565"
        />
      </svg>
      <div v-else class="spinner"></div>
      Группы
    </button>

    <!-- Modal: No Accounts Available -->
    <NoAccountsModal
      v-if="showNoAccountsModal"
      @close="showNoAccountsModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAccountStore } from "@/stores/accountStore";
import NoAccountsModal from "./NoAccountsModal.vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "accounts",
  },
  availableAccounts: {
    type: Array,
    default: () => [],
  },
  getAccounts: {
    type: Function,
  },
});

const emit = defineEmits(["update:modelValue"]);

const accountStore = useAccountStore();
const currentTab = ref(props.modelValue);
const showNoAccountsModal = ref(false);

const filteredAccounts = computed(() => {
  return props.availableAccounts.filter((account) =>
    ["whatsapp", "telegram"].includes(account.source || account.type)
  );
});

const checkAccounts = () => {
  if (props.availableAccounts.value.length === 0) {
    console.log("аккаунтов не найдено в целом, идет загрузка");
    props.getAccounts();
  }
};

const hasAvailableAccounts = computed(() => {
  return filteredAccounts.value.length > 0;
});

const handleGroupsClick = () => {
  if (isLoading.value) return;

  // Если уже на вкладке групп, ничего не делаем
  if (currentTab.value === "groups") return;

  // Проверяем наличие аккаунтов
  if (!hasAvailableAccounts.value) {
    showNoAccountsModal.value = true;
    return;
  }

  // Переключаемся на вкладку групп
  switchTab("groups");
};

const switchTab = (tab) => {
  currentTab.value = tab;
  emit("update:modelValue", tab);
};

const isLoading = computed(() => {
  const loading = accountStore.isLoading;
  console.log("📊 TabToggle: computed isLoading =", loading);
  return loading;
});
</script>

<style scoped>
.toggle-wrapper {
  display: flex;
  gap: 8px;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 8px;
  width: fit-content;
}

.toggle-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #666;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.25s ease;
}

.toggle-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.toggle-button.active {
  background: white;
  color: oklch(0.541 0.198 267);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.toggle-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.toggle-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(102, 102, 102, 0.2);
  border-top-color: #666;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.toggle-button.active .spinner {
  border-color: rgba(97, 72, 221, 0.2);
  border-top-color: oklch(0.541 0.198 267);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
