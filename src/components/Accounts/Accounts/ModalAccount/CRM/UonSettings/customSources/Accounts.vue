<template>
  <div class="accounts-list">
    <div v-for="item in filteredAccounts" :key="item.uuid" class="account-item">
      <div class="account-item__info">
        <AccountIcon :item="item" />
        <span class="account-item__name">{{ item.name }}</span>
      </div>

      <div class="account-item__input-wrapper">
        <input
          v-model="localSources[item.uuid]"
          type="text"
          class="account-item__input"
          placeholder="Например: WhatsApp для отдела продаж"
          @input="onInput(item.uuid)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits, ref, watch } from "vue";
import AccountIcon from "@/components/Accounts/AccountIcon.vue";

const props = defineProps({
  accounts: {
    type: Array,
    required: true,
  },
  customSources: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:source"]);

const filteredAccounts = computed(() =>
  props.accounts.filter(
    (item) =>
      item.source === "max" ||
      item.source === "telegram" ||
      item.source === "vk" ||
      item.source === "whatsapp",
  ),
);

const localSources = ref({});

watch(
  () => props.customSources,
  (newSources) => {
    localSources.value = { ...newSources };
  },
  { immediate: true },
);

const onInput = (uuid) => {
  const newName = localSources.value[uuid];
  emit("update:source", uuid, newName);
};
</script>

<style scoped>
.accounts-list {
  margin-bottom: 20px;
}

.account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0px;
  transition: background-color 0.15s ease;
}

.account-item__info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.account-item__name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

.account-item__input-wrapper {
  flex: 1;
  margin-left: 16px;
}

.account-item__label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.account-item__input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  background-color: #fff;
  box-sizing: border-box;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.account-item__input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}
</style>
