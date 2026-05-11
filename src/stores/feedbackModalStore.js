import { defineStore } from "pinia";
import { ref } from "vue";

export const useFeedbackModalStore = defineStore("feedbackModal", () => {
  const isOpen = ref(false);

  const openModal = () => {
    isOpen.value = true;
  };

  const closeModal = () => {
    isOpen.value = false;
  };

  return { isOpen, openModal, closeModal };
});
