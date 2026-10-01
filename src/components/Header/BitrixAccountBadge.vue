<template>
  <div v-if="account" class="bitrix-wrap" ref="wrapRef">
    <button class="bitrix-btn" @click="toggleDropdown" :class="{ active: open }">
      <AccountIcon :item="account" class="bitrix-icon" />
      <span class="bitrix-domain">{{ account.source }}</span>
      <span
        class="bitrix-dot"
        :class="{ 'bitrix-dot-off': account.enable === '0' }"
      ></span>
    </button>

    <div v-if="open" class="bitrix-dropdown">
      <div class="bitrix-header">
        <AccountIcon :item="account" class="bitrix-icon-lg" />
        <div class="bitrix-header-text">
          <span class="bitrix-title">{{ account.name || "Bitrix24" }}</span>
          <span class="bitrix-sub">{{ account.source }}</span>
        </div>
        <StatusBadge :status="account.enable" type="crm" />
      </div>

      <div class="bitrix-actions">
        <button class="bitrix-action" @click="handleUpdate" :disabled="updating">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
          {{ updating ? "Обновляем..." : "Обновить аккаунт" }}
        </button>

        <button class="bitrix-action" @click="openConnectors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="6" cy="6" r="2" /><circle cx="6" cy="18" r="2" />
            <circle cx="18" cy="12" r="2" /><path d="M6 8v8" />
            <path d="M8 6h4a4 4 0 0 1 4 4" /><path d="M8 18h4a4 4 0 0 0 4-4" />
          </svg>
          Коннекторы
        </button>

        <button v-if="isOwner" class="bitrix-action" @click="openRouting">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v12a2 2 0 0 0 2 2h14" /><path d="M7 7h12v8" />
            <path d="M15 11l4 4-4 4" />
          </svg>
          Маршрутизация
        </button>
      </div>
    </div>
  </div>

  <Bitrix24ConnectorsModal
    v-if="connectorsOpen"
    :item="account"
    :close="closeConnectors"
  />
  <AccountRoutingModal
    v-if="routingOpen"
    :item="account"
    :close="closeRouting"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import AccountIcon from "@/components/Accounts/AccountIcon.vue";
import StatusBadge from "@/components/Accounts/Accounts/StatusBadge.vue";
import Bitrix24ConnectorsModal from "@/components/Accounts/Accounts/ModalAccount/CRM/Bitrix24ConnectorsModal.vue";
import AccountRoutingModal from "@/components/Accounts/Accounts/ModalAccount/AccountRoutingModal.vue";
import { useMainBitrixAccount } from "@/composables/useMainBitrixAccount";
import { useStationLoading } from "@/composables/useStationLoading";
import { usePermissions } from "@/composables/usePermissions";

const { account, fetchAccount, updateAccount } = useMainBitrixAccount();
const { setLoadingStatus } = useStationLoading();
const { isOwner } = usePermissions();

const open = ref(false);
const updating = ref(false);
const connectorsOpen = ref(false);
const routingOpen = ref(false);
const wrapRef = ref(null);

const toggleDropdown = () => {
  open.value = !open.value;
};

const handleUpdate = async () => {
  updating.value = true;
  const result = await updateAccount();
  updating.value = false;
  setLoadingStatus(true, result?.ok ? "success" : "error");
  if (result?.ok) await fetchAccount();
};

const openConnectors = () => {
  open.value = false;
  connectorsOpen.value = true;
};
const closeConnectors = () => {
  connectorsOpen.value = false;
};

const openRouting = () => {
  open.value = false;
  routingOpen.value = true;
};
const closeRouting = () => {
  routingOpen.value = false;
};

const onClickOutside = (e) => {
  if (wrapRef.value && !wrapRef.value.contains(e.target)) {
    open.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  fetchAccount();
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
});
</script>

<style scoped>
.bitrix-wrap {
  position: relative;
  flex-shrink: 0;
}

.bitrix-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(1, 140, 206, 0.08);
  border: 1px solid rgba(1, 140, 206, 0.18);
  border-radius: 999px;
  padding: 6px 12px 6px 8px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  max-width: 220px;
}

.bitrix-btn:hover,
.bitrix-btn.active {
  background: rgba(1, 140, 206, 0.14);
  border-color: rgba(1, 140, 206, 0.32);
}

.bitrix-icon {
  width: 18px !important;
  height: 18px !important;
  flex-shrink: 0;
}

.bitrix-domain {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bitrix-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
}

.bitrix-dot-off {
  background: #9ca3af;
}

.bitrix-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 280px;
  background: var(--bg, #fff);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 200;
  overflow: hidden;
  animation: bitrixFadeDown 0.15s ease-out;
}

@keyframes bitrixFadeDown {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.bitrix-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
}

.bitrix-icon-lg {
  width: 28px !important;
  height: 28px !important;
  flex-shrink: 0;
}

.bitrix-header-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.bitrix-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bitrix-sub {
  font-size: 0.75rem;
  color: var(--headerAccountText);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bitrix-actions {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bitrix-action {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  padding: 9px 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--text);
  cursor: pointer;
  transition: background 0.15s;
}

.bitrix-action svg {
  color: #018cce;
  flex-shrink: 0;
}

.bitrix-action:hover:not(:disabled) {
  background: var(--tableHover);
}

.bitrix-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .bitrix-domain {
    display: none;
  }
  .bitrix-btn {
    padding: 7px;
    border-radius: 50%;
  }
}

@media (max-width: 400px) {
  .bitrix-dropdown {
    width: calc(100vw - 24px);
    right: -40px;
  }
}
</style>
