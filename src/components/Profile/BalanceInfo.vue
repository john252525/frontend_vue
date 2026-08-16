<template>
  <div class="profile-section balance-section">
    <h2 class="section-title">
      <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h4" />
      </svg>
      Баланс
    </h2>

    <div class="balance-content">
      <div v-if="balanceStore.balanceLoading" class="balance-loading">
        <div class="loading-spinner"></div>
        <span>Загрузка...</span>
      </div>

      <div v-else-if="balanceStore.balanceError" class="balance-error">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path
            fill="#e53e3e"
            d="M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10s10-4.486 10-10S17.493 2 11.953 2M13 17h-2v-2h2zm0-4h-2V7h2z"
          />
        </svg>
        <span>Не удалось загрузить баланс</span>
      </div>

      <div v-else class="balance-value">
        {{ balanceStore.formattedBalance || "0 ₽" }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useBalanceStore } from "@/stores/balanceStore";

const balanceStore = useBalanceStore();

onMounted(() => {
  if (!balanceStore.balance && !balanceStore.balanceLoading) {
    balanceStore.initBalance();
  }
});
</script>

<style scoped>
.profile-section {
  background: var(--bg);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--line);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--text);
}

.icon {
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.balance-content {
  display: flex;
  align-items: center;
}

.balance-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary);
}

.balance-loading,
.balance-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--headerAccountText);
  font-size: 0.9rem;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--line);
  border-top: 2px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (min-width: 1200px) {
  .profile-section {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .section-title {
    font-size: 1.15rem;
    margin-bottom: 1.25rem;
  }

  .balance-value {
    font-size: 2rem;
  }
}
</style>
