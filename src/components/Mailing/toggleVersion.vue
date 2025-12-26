<template>
  <div class="toggle-wrapper">
    <button
      @click="updateVersion(1)"
      id="togle-account"
      :class="['toggle-button', { active: getVersion === 1 }]"
    >
      <svg
        class="toggle-icon"
        width="14"
        height="13"
        viewBox="0 0 14 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.24 0.0613657C6.16641 0.0211029 6.08388 0 6 0C5.91612 0 5.83359 0.0211029 5.76 0.0613657L0.7 2.82137C0.268 3.05837 0 3.51037 0 4.00037V9.00037C0 9.5308 0.210714 10.0395 0.585786 10.4146C0.960859 10.7897 1.46957 11.0004 2 11.0004H10C10.5304 11.0004 11.0391 10.7897 11.4142 10.4146C11.7893 10.0395 12 9.5308 12 9.00037V4.00037C12.0001 3.75919 11.9352 3.52245 11.812 3.31512C11.6888 3.10779 11.5119 2.93755 11.3 2.82237L6.24 0.0613657ZM1.177 3.70037L6 1.07037L10.822 3.70037C10.8513 3.7157 10.8773 3.73503 10.9 3.75837L6 6.43037L1.1 3.75837C1.12267 3.73492 1.14802 3.71533 1.177 3.70037ZM6.24 7.43937L11 4.84237V9.00037C11 9.26558 10.8946 9.51994 10.7071 9.70747C10.5196 9.89501 10.2652 10.0004 10 10.0004H2C1.73478 10.0004 1.48043 9.89501 1.29289 9.70747C1.10536 9.51994 1 9.26558 1 9.00037V4.84237L5.76 7.44037C5.83359 7.48063 5.91612 7.50173 6 7.50173C6.08388 7.50173 6.16641 7.47963 6.24 7.43937ZM2.268 12.0004C2.44353 12.3044 2.696 12.5569 3.00003 12.7324C3.30406 12.9079 3.64894 13.0004 4 13.0004H10C11.0609 13.0004 12.0783 12.5789 12.8284 11.8288C13.5786 11.0786 14 10.0612 14 9.00037V5.00037C14 4.6493 13.9076 4.30442 13.732 4.00039C13.5565 3.69637 13.304 3.4439 13 3.26837V9.00037C13 9.79602 12.6839 10.5591 12.1213 11.1217C11.5587 11.6843 10.7956 12.0004 10 12.0004H2.268Z"
          :fill="getVersion === 1 ? 'oklch(0.541 0.198 267)' : '#656565'"
        />
      </svg>
      Версия 1
    </button>
    <button
      @click="updateVersion(2)"
      id="togle-group"
      :class="['toggle-button', { active: getVersion === 2 }]"
    >
      <svg
        class="toggle-icon"
        width="14"
        height="13"
        viewBox="0 0 14 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.24 0.0613657C6.16641 0.0211029 6.08388 0 6 0C5.91612 0 5.83359 0.0211029 5.76 0.0613657L0.7 2.82137C0.498 2.93137 0.333 3.08837 0.213 3.27437L6 6.43037L11.787 3.27437C11.6652 3.0852 11.4977 2.92976 11.3 2.82237L6.24 0.0613657ZM0 9.00037V4.29737L5.76 7.43937C5.83359 7.47963 5.91612 7.50073 6 7.50073C6.08388 7.50073 6.16641 7.47963 6.24 7.43937L12 4.29737V9.00037C12 9.5308 11.7893 10.0395 11.4142 10.4146C11.0391 10.7897 10.5304 11.0004 10 11.0004H2C1.46957 11.0004 0.960859 10.7897 0.585786 10.4146C0.210714 10.0395 0 9.5308 0 9.00037ZM2.268 12.0004C2.44353 12.3044 2.696 12.5569 3.00003 12.7324C3.30406 12.9079 3.64894 13.0004 4 13.0004H10C11.0609 13.0004 12.0783 12.5789 12.8284 11.8288C13.5786 11.0786 14 10.0612 14 9.00037V5.00037C14 4.6493 13.9076 4.30442 13.732 4.00039C13.5565 3.69637 13.304 3.4439 13 3.26837V9.00037C13 9.79602 12.6839 10.5591 12.1213 11.1217C11.5587 11.6843 10.7956 12.0004 10 12.0004H2.268Z"
          :fill="getVersion === 2 ? 'oklch(0.541 0.198 267)' : '#656565'"
        />
      </svg>
      Версия 2
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useMailingVersion } from "@/stores/mailingVersion";

const mailingVersion = useMailingVersion();
const getVersion = computed(() => mailingVersion.getVersion);
const isLoading = ref(false);

const updateVersion = async (version) => {
  if (version === getVersion.value) return;

  isLoading.value = true;
  try {
    await mailingVersion.updateVersion(version);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.toggle-wrapper {
  display: flex;
  gap: 8px;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 8px;
  width: fit-content;
}

.toggle-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
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
  width: 14px;
  height: 13px;
  transition: fill 0.25s ease;
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

@media (max-width: 500px) {
  .toggle-wrapper {
    display: flex;
    gap: 8px;
    background: #f5f5f5;
    padding: 3px;
    border-radius: 8px;
    width: fit-content;
  }

  .toggle-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border: none;
    background: transparent;
    color: #666;
    font-weight: 500;
    font-size: 10px;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.25s ease;
  }

  .toggle-icon {
    width: 12px;
    height: 11px;
  }
}
</style>
