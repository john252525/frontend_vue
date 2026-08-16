<template>
  <ModalFrame
    :text="modalText"
    :close="closeModal"
    :item="selectedItem"
    :action="saveName"
    :is-loading="loading"
  >
    <div class="input-group">
      <label for="accountName" class="input-label">Новое имя аккаунта</label>
      <input
        id="accountName"
        v-model="newName"
        type="text"
        class="name-input"
        :class="{ error: error }"
        placeholder="Введите новое имя"
        maxlength="20"
        @keyup.enter="saveName"
        @input="validateInput"
      />
      <div class="character-counter">{{ newName.length }}/20</div>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </ModalFrame>
</template>

<script setup>
import { ref, computed, onMounted, toRefs, onUnmounted } from "vue";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";

const props = defineProps({
  currentName: {
    type: String,
    default: "",
  },
  selectedItem: {
    type: Object,
  },

  getAccounts: {
    type: Function,
  },

  close: {
    type: Function,
  },
});

const modalText = ref({
  title: "Изменение имени",
  close: "Отмена",
  action: "Сохранить",
});

import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

import { useInstancesStore } from "@/stores/instancesStore";
const instancesStore = useInstancesStore();

import axios from "axios";

const loading = ref(false);

const { selectedItem } = toRefs(props);

const emit = defineEmits(["close", "save"]);

const newName = ref(props.currentName);
const error = ref("");

const isFormValid = computed(() => {
  return (
    newName.value.trim() &&
    newName.value.trim() !== props.currentName &&
    !error.value
  );
});

const changeName = async () => {
  const { uuid } = selectedItem.value;

  loading.value = true;
  try {
    const response = await axios.post(
      `${FRONTEND_URL}updateInstanceName`,
      {
        name: newName.value,
        uuid: uuid,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      },
    );
    const data = typeof response.data === "string"
      ? JSON.parse(response.data)
      : response.data;

    if (data?.ok) {
      instancesStore.updateInstanceByUuid(uuid, { name: newName.value });
      setLoadingStatus(true, "success");
    } else {
      setLoadingStatus(true, "error");
    }
  } catch (error) {
    console.log("Огиька level1");
    console.error(`error`, error);
    setLoadingStatus(true, "error");
    if (error.response) {
      console.error("error", error.response.data);
      if (props.stateLoading) {
        props.stateLoading(false);
      }
    }
  } finally {
    loading.value = false;
  }
};

const validateInput = () => {
  error.value = "";

  if (!newName.value.trim()) {
    error.value = "Имя не может быть пустым";
    return false;
  }

  if (newName.value.trim().length < 4) {
    error.value = "Имя должно содержать минимум 4 символа";
    return false;
  }

  if (newName.value.trim().length > 20) {
    error.value = "Имя не может превышать 20 символов";
    return false;
  }

  return true;
};

const saveName = async () => {
  if (!validateInput()) return;

  await changeName();
  props.close();
};

const closeModal = () => {
  props.close();
};

const handleEscape = (event) => {
  if (event.key === "Escape") {
    props.close();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleEscape);
  document.body.style.overflow = "hidden";
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscape);
  document.body.style.overflow = "";
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--backgroundComponentModal);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
}

.modal-container {
  background: var(--modalBg, #ffffff);
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--line);
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--modalColor, #1a1a1a);
}

.close-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: var(--headerAccountText);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-button:hover {
  color: var(--modalColor, #1a1a1a);
  background-color: var(--tableAccountBg);
}

.modal-content {
  padding: 24px;
}

.input-group {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--modalColor, #1a1a1a);
  font-size: 14px;
}

.name-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--line);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.name-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.name-input.error {
  border-color: #ef4444;
}

.name-input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.character-counter {
  text-align: right;
  font-size: 12px;
  color: var(--headerAccountText);
  margin-top: 4px;
}

.error-message {
  margin: 8px 0 0;
  color: #ef4444;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-button,
.save-button {
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.cancel-button {
  background-color: var(--tableAccountBg);
  color: var(--modalColor, #1a1a1a);
}

.cancel-button:hover {
  background-color: var(--line);
}

.save-button {
  background-color: var(--primary);
  color: white;
}

.save-button:hover:not(.disabled) {
  background-color: var(--primaryHover);
}

.save-button.disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 16px;
  }

  .modal-container {
    max-width: 100%;
    border-radius: 8px;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-content {
    padding: 20px;
  }

  .modal-title {
    font-size: 18px;
  }

  .name-input {
    font-size: 16px; /* Предотвращает увеличение размера шрифта на iOS */
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .cancel-button,
  .save-button {
    width: 100%;
    padding: 14px 20px;
  }
}

@media (max-width: 480px) {
  .modal-header {
    padding: 16px;
  }

  .modal-content {
    padding: 16px;
  }

  .modal-title {
    font-size: 16px;
  }
}

/* Предотвращение zoom при фокусе на iOS */
@media (max-width: 768px) {
  .name-input {
    font-size: 16px;
  }
}
</style>
