<template>
  <button
    @click="showConfirm = true"
    :disabled="isLoading"
    class="action-button telegram"
  >
    <div class="btn-content">
      <svg
        v-if="!isLoading"
        class="tg-icon"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.19 15.51 15.98C15.37 16.73 15.09 16.98 14.83 17.01C14.25 17.06 13.81 16.63 13.25 16.26C12.37 15.68 11.87 15.32 11.01 14.76C10.02 14.11 10.66 13.75 11.23 13.16C11.37 13.01 13.9 10.71 13.95 10.5C13.96 10.47 13.96 10.37 13.9 10.32C13.84 10.27 13.76 10.28 13.7 10.3C13.62 10.31 12.32 11.17 9.8 12.87C9.43 13.12 9.09 13.25 8.79 13.24C8.46 13.23 7.81 13.05 7.33 12.89C6.73 12.7 6.26 12.6 6.3 12.27C6.32 12.1 6.55 11.93 6.99 11.75C9.72 10.56 11.55 9.77 12.49 9.38C15.17 8.26 15.73 8.07 16.09 8.07C16.17 8.07 16.35 8.09 16.47 8.19C16.57 8.27 16.6 8.4 16.61 8.49C16.62 8.58 16.63 8.7 16.64 8.8Z"
          fill="currentColor"
        />
      </svg>
      <span v-else class="loader"></span>
      <span>Подключить Telegram</span>
    </div>
  </button>

  <ConnectTelegram v-if="showConfirm" :close="closeModal" :get-link="getLink" />
</template>

<script setup>
import axios from "axios";
import { ref, computed } from "vue";
import { useAccountStore } from "@/stores/accountStore";
import ConnectTelegram from "@/components/GlobalModal/disclaimerModal/ConnectTelegram.vue";

const FRONTEND_URL = import.meta.env.VITE_BASE_URL;
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const isLoading = ref(false);
const showConfirm = ref(false);

const closeModal = () => {
  showConfirm.value = false;
};

const getLink = async () => {
  showConfirm.value = false;
  isLoading.value = true;

  try {
    const response = await axios.get(
      `${FRONTEND_URL}users/getWbotRegisterLink`,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      },
    );

    if (response.data.ok && response.data.data?.register_link) {
      window.location.href = response.data.data.register_link;
    }
  } catch (error) {
    console.error("Ошибка:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.action-button.telegram {
  background: #f0f9ff;
  color: #0088cc;
  border: 1px solid #b3e5fc;
  transition: all 0.2s ease;
}

.action-button.telegram:hover {
  background: #e1f5fe;
  border-color: #0088cc;
  box-shadow: 0 2px 8px rgba(0, 136, 204, 0.15);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tg-icon {
  width: 20px;
  height: 20px;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
