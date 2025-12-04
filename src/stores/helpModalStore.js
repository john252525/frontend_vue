// src/stores/helpModalStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useHelpModalStore = defineStore("helpModal", () => {
  // State
  const isOpen = ref(false);
  const openSection = ref(null);
  const lastClickedItem = ref(null);

  // Getters
  const isAccountsOpen = computed(() => openSection.value === "accounts");
  const isMailingsOpen = computed(() => openSection.value === "mailings");
  const isReferralsOpen = computed(() => openSection.value === "referrals");

  // Actions
  const openModal = () => {
    console.log("helpModalStore: openModal called");
    isOpen.value = true;
    console.log("helpModalStore: isOpen is now", isOpen.value);
  };

  const closeModal = () => {
    isOpen.value = false;
    openSection.value = null;
  };

  const toggleSection = (section) => {
    openSection.value = openSection.value === section ? null : section;
  };

  const handleItemClick = (item) => {
    lastClickedItem.value = item;
    console.log(`Клик по: ${item}`);
  };

  const resetState = () => {
    isOpen.value = false;
    openSection.value = null;
    lastClickedItem.value = null;
  };

  return {
    // State
    isOpen,
    openSection,
    lastClickedItem,

    // Getters
    isAccountsOpen,
    isMailingsOpen,
    isReferralsOpen,

    // Actions
    openModal,
    closeModal,
    toggleSection,
    handleItemClick,
    resetState,
  };
});
