<template>
  <ModalFrame
    :text="{ title: 'Подключить Max Bot', close: 'Отмена', action: 'Сохранить' }"
    :item="props.item"
    :action="save"
    :close="props.close"
    :isDisabled="!apiKey.trim()"
    :isLoading="saving"
  >
    <div class="field">
      <label class="field-label">API ключ</label>
      <input
        v-model="apiKey"
        class="field-input"
        type="text"
        placeholder="Введите API ключ Max Bot"
        :disabled="saving"
      />
    </div>
  </ModalFrame>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";
import { useAccountStore } from "@/stores/accountStore";
import { useStationLoading } from "@/composables/useStationLoading";

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const { setLoadingStatus } = useStationLoading();

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const props = defineProps({
  item: { type: Object },
  close: { type: Function },
});

const apiKey = ref("");
const saving = ref(false);

const save = async () => {
  saving.value = true;
  try {
    const params = { ...props.item, api_key: apiKey.value };
    await axios.post(`${FRONTEND_URL}updateAccount`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });
  } catch (error) {
    console.error("error", error);
  } finally {
    saving.value = false;
    setLoadingStatus(true, "success");
    props.close();
  }
};
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.field-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9375rem;
  color: #1e293b;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.field-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.field-input:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}
</style>
