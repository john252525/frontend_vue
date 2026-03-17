<template>
  <div class="accounts-wrapper">
    <div class="accounts-header">
      <div class="header-name">Аккаунт</div>
      <div class="header-status">Не использовать</div>
      <div class="header-input">Название источника</div>
    </div>

    <div class="accounts-list">
      <div
        v-for="item in filteredAccounts"
        :key="item.uuid"
        class="account-row"
      >
        <div class="account-info">
          <AccountIcon :item="item" />
          <span class="account-name" :title="item.name">{{ item.name }}</span>
        </div>

        <div class="account-checkbox">
          <input
            type="checkbox"
            :checked="localSources[item.uuid] === 'None'"
            @change="toggleNone(item.uuid, $event.target.checked)"
          />
        </div>

        <div class="account-input-field">
          <input
            v-model="localSources[item.uuid]"
            type="text"
            class="input-control"
            :class="{ 'is-disabled': localSources[item.uuid] === 'None' }"
            :placeholder="
              localSources[item.uuid] === 'None'
                ? 'Отключено'
                : 'Например: WhatsApp для отд'
            "
            :disabled="localSources[item.uuid] === 'None'"
            @input="onInput(item.uuid)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits, ref, watch } from "vue";
import AccountIcon from "@/components/Accounts/AccountIcon.vue";

const props = defineProps({
  accounts: { type: Array, required: true },
  customSources: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:source"]);

const filteredAccounts = computed(() =>
  props.accounts.filter((item) =>
    ["max", "telegram", "vk-bot", "whatsapp"].includes(item.source),
  ),
);

const localSources = ref({});

// Исправляем баг с перезаписью при вводе:
// Обновляем localSources только если проп пришел "снаружи" (например, загрузился с бэка)
watch(
  () => props.customSources,
  (newSources) => {
    // Глубокое сравнение или проверка на пустоту, чтобы не затирать текущий ввод пользователя
    if (
      Object.keys(localSources.value).length === 0 ||
      JSON.stringify(newSources) !== JSON.stringify(localSources.value)
    ) {
      localSources.value = { ...newSources };
    }
  },
  { immediate: true },
);

const onInput = (uuid) => {
  emit("update:source", uuid, localSources.value[uuid]);
};

const toggleNone = (uuid, isChecked) => {
  if (isChecked) {
    localSources.value[uuid] = "None";
  } else {
    localSources.value[uuid] = "";
  }
  emit("update:source", uuid, localSources.value[uuid]);
};
</script>

<style scoped>
.accounts-wrapper {
  width: 100%;
  overflow-x: hidden; /* Гарантируем отсутствие скролла */
}

/* Сетка: 160px для имени, 100px для чекбокса, остальное для инпута */
.accounts-header,
.account-row {
  display: grid;
  grid-template-columns: 160px 100px 1fr;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.accounts-header {
  border-bottom: 1px solid #eee;
  margin-bottom: 8px;
}

.header-name,
.header-status,
.header-input {
  font-size: 11px;
  color: #999;
  text-transform: uppercase;
  font-weight: 600;
}

.header-status {
  text-align: center;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0; /* Важно для обрезки текста */
}

.account-name {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Если имя слишком длинное, оно не раздвинет модалку */
}

.account-checkbox {
  display: flex;
  justify-content: center;
}

.account-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #1d4ed8;
}

.input-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 13px;
  box-sizing: border-box; /* Чтобы padding не увеличивал ширину */
}

.input-control.is-disabled {
  background-color: #f5f5f5;
  color: #bfbfbf;
  border-color: #d9d9d9;
  cursor: not-allowed;
}
</style>
