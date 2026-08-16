<template>
  <ModalFrame
    :isLoading="loading"
    :text="textModal"
    :close="closeModal"
    :item="accountData"
  >
    <div class="loading-test"></div>
    <div v-if="!loading" class="modal-body">
      <div class="info-sections">
        <div v-if="getAccessToStatus" class="info-section">
          <Subscription :account-data="accountData" />
        </div>

        <div v-if="getAccessToStatus" class="info-section">
          <Status
            :openResetAccountModal="openResetAccountModal"
            :changeEditNameModal="changeEditNameModal"
            :createRequest="actionClik"
            :account-data="accountData"
            :changeForceStopItemData="changeForceStopItemData"
            :deleteAccount="deleteAccount"
            :openSmsAuthModal="openSmsAuthModal"
            :setLoading="setLoading"
            :openEmailSettings="openEmailSettings"
          />
        </div>

        <div v-if="getAccessToAccount" class="info-section">
          <Account
            :changeRoutingSettings="changeRoutingSettings"
            :openMessageHistory="openMessageHistory"
            :uonSettings="uonSettings"
            :blacklistModal="blacklistModal"
            :changeStationGetHistory="changeStationGetHistory"
            :account-data="accountData"
            :customSources="customSources"
            @close="closeModal"
          />
        </div>
      </div>
    </div>
    <div v-else class="loading-box">
      <BoxLoading />
    </div>
  </ModalFrame>
</template>

<script setup>
import { ref, computed, toRefs } from "vue";
import Status from "./accountInfoComponents/Status.vue";
import Subscription from "./accountInfoComponents/Subscription.vue";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";
import Account from "./accountInfoComponents/Account.vue";
import BoxLoading from "@/components/GlobalModal/loading/BoxLoading.vue";

const props = defineProps({
  accountData: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  isVisible: {
    type: Boolean,
    required: true,
  },
  changeEditNameModal: {
    type: Function,
  },
  changeForceStopItemData: {
    type: Function,
  },
  openResetAccountModal: {
    type: Function,
  },
  deleteAccount: {
    type: Function,
  },
  customSources: {
    type: Function,
  },
  changeRoutingSettings: {
    type: Function,
  },

  openMessageHistory: {
    type: Function,
  },

  uonSettings: {
    type: Function,
  },

  blacklistModal: {
    type: Function,
  },
  changeStationGetHistory: {
    type: Function,
  },
  openEmailSettings: {
    type: Function,
  },
});

import { useActions } from "@/composables/useActions";

const { createRequest } = useActions();

const { accountData } = toRefs(props);
const loading = ref(false);

const setLoading = (val) => {
  loading.value = val;
};

const emit = defineEmits(["close", "action", "sms-auth"]);

const openSmsAuthModal = (authCode) => {
  closeModal();
  emit("sms-auth", authCode);
};

const textModal = ref({
  title: "Информация об аккаунте",
  close: "Закрыть",
});

const actionClik = async (item, req) => {
  loading.value = true;
  const result = await createRequest(item, req);

  if (result === true) {
    loading.value = false;
    return true;
  }
};

const closeModal = () => {
  emit("close");
};

const getAccessToStatus = computed(() => {
  return (
    accountData.value.source === "whatsapp" ||
    accountData.value.source === "telegram" ||
    accountData.value.source === "instagram" ||
    accountData.value.source === "max" ||
    accountData.value.source === "vk" ||
    accountData.value.source === "sms" ||
    accountData.value.source === "email"
  );
});

const getAccessToAccount = computed(() => {
  return (
    accountData.value.source !== "whatsapp" &&
    accountData.value.source !== "instagram" &&
    accountData.value.source !== "telegram" &&
    accountData.value.source !== "max" &&
    accountData.value.source !== "vk" &&
    accountData.value.source !== "sms" &&
    accountData.value.source !== "email"
  );
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--backgroundComponentModal);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--modalBg);
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.loading-box {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid var(--line);
  background: linear-gradient(135deg, var(--tableAccountBg) 0%, var(--bg) 100%);
  border-radius: 16px 16px 0 0;
}

.account-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.account-avatar {
  position: relative;
}

.account-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border: 2px solid var(--bg);
  border-radius: 50%;
}

.account-status.status-online {
  background: #22c55e;
}
.account-status.status-offline {
  background: #94a3b8;
}
.account-status.status-error {
  background: #ef4444;
}
.account-status.status-loading {
  background: var(--primary);
}

.account-title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.3;
}

.account-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.account-type {
  font-size: 13px;
  color: white;
  background: var(--primary);
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.account-id {
  font-size: 12px;
  color: var(--headerAccountText);
}

.close-button {
  background: var(--tableAccountBg);
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  color: var(--headerAccountText);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-button:hover {
  background: var(--line);
  color: var(--headerAccountText);
}

.modal-body {
  padding: 0;
}

.info-sections {
  padding: 24px;
}

.info-section {
  margin-bottom: 24px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 16px 0;
}

.section-title svg {
  color: var(--headerAccountText);
}

.status-grid,
.subscription-info,
.account-details,
.connection-info,
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  padding: 16px;
  background: var(--tableAccountBg);
  border-radius: 12px;
  border: 1px solid var(--line);
}

.status-item,
.subscription-item,
.detail-item,
.connection-item,
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-label,
.subscription-label,
.detail-label,
.connection-label,
.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--headerAccountText);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-value,
.subscription-value,
.detail-value,
.connection-value,
.stat-value {
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
}

.status-value {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  width: fit-content;
}

.status-value-message {
  font-size: 12px;
  font-weight: 500;
}

.status-online {
  background: #dcfce7;
  color: #166534;
}
.status-offline {
  background: #f1f5f9;
  color: #64748b;
}
.status-error {
  background: #fee2e2;
  color: #b91c1c;
}
.status-loading {
  background: #dbeafe;
  color: var(--primaryHover);
}

.status-on {
  color: #22c55e;
  font-weight: 600;
}
.status-off {
  color: #ef4444;
  font-weight: 600;
}

.subscription-active {
  color: #166534;
  font-weight: 600;
}
.subscription-expired {
  color: #dc2626;
  font-weight: 600;
}

.days-many {
  color: #166534;
}
.days-few {
  color: #ca8a04;
}
.days-critical {
  color: #dc2626;
  font-weight: 600;
}

.action-section {
  padding: 20px 0px;
}

.action-buttons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 10px;
  color: var(--headerAccountText);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.action-button:hover {
  background: var(--tableAccountBg);
  border-color: var(--line);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-button.primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.action-button.primary:hover {
  background: var(--primaryHover);
  border-color: var(--primaryHover);
}

.action-button.success {
  background: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

.action-button.success:hover {
  background: #bbf7d0;
}

.action-button.warning {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.action-button.warning:hover {
  background: #fde68a;
}

.action-button.danger {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.action-button.danger:hover {
  background: #fecaca;
}

.action-button svg {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-width: none;
  }

  .modal-header {
    padding: 20px;
    flex-direction: column;
    gap: 16px;
  }

  .info-sections {
    padding: 20px;
  }

  .action-section {
    padding: 20px;
  }

  .status-grid,
  .subscription-info,
  .account-details,
  .connection-info,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons-grid {
    grid-template-columns: 1fr;
  }

  .account-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-content {
    margin: 0;
    border-radius: 12px;
  }

  .modal-header {
    padding: 16px;
  }

  .info-sections {
    padding: 16px;
  }

  .action-section {
    padding: 16px;
  }
}
</style>
