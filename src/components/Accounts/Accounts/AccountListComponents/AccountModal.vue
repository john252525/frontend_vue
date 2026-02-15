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
});

import { useActions } from "@/composables/useActions";

const { createRequest } = useActions();

const { accountData } = toRefs(props);
const loading = ref(false);

const emit = defineEmits(["close", "action"]);

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
    accountData.value.source === "max" ||
    accountData.value.source === "vk"
  );
});

const getAccessToAccount = computed(() => {
  return (
    accountData.value.source !== "whatsapp" &&
    accountData.value.source !== "telegram" &&
    accountData.value.source !== "max" &&
    accountData.value.source !== "vk"
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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
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
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
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
  border: 2px solid white;
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
  background: #3b82f6;
}

.account-title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
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
  background: #3b82f6;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.account-id {
  font-size: 12px;
  color: #64748b;
}

.close-button {
  background: #f1f5f9;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  color: #64748b;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-button:hover {
  background: #e2e8f0;
  color: #475569;
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
  color: #1e293b;
  margin: 0 0 16px 0;
}

.section-title svg {
  color: #64748b;
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
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
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
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-value,
.subscription-value,
.detail-value,
.connection-value,
.stat-value {
  font-size: 14px;
  color: #334155;
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
  color: #1d4ed8;
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

.action-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-button.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.action-button.primary:hover {
  background: #2563eb;
  border-color: #2563eb;
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
