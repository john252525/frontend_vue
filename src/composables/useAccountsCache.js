// composables/useAccountsCache.js
import { ref } from "vue";

// Глобальное состояние (shared между всеми компонентами)
const accountsCache = ref([]);
const isLoading = ref(false);
const cacheVersion = ref(0); // Версия для инвалидации кеша

export function useAccountsCache() {
  const invalidateCache = () => {
    console.log("🔄 Кеш аккаунтов инвалидирован");
    cacheVersion.value++;
    accountsCache.value = [];
  };

  const setAccounts = (accounts) => {
    console.log("💾 Сохраняем аккаунты в кеш:", accounts?.length);
    accountsCache.value = accounts || [];
  };

  const getAccounts = () => {
    console.log("📦 Получаем из кеша:", accountsCache.value.length);
    return accountsCache.value;
  };

  const getCacheVersion = () => {
    return cacheVersion.value;
  };

  return {
    accountsCache,
    isLoading,
    cacheVersion,
    setAccounts,
    getAccounts,
    invalidateCache,
    getCacheVersion,
  };
}
