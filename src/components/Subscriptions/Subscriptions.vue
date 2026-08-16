<template>
  <section class="subscriptions-page">
    <header class="subscriptions-header">
      <h2 class="title">Подписки</h2>
      <p class="subtitle">
        Сроки действия подписок по всем подключённым каналам
      </p>
    </header>

    <div v-if="loadDataStation" class="load-cont">
      <LoadAccount />
    </div>

    <div v-else-if="errorAccountBolean" class="load-cont">
      <errorAccount />
    </div>

    <div v-else-if="channelGroups.length === 0" class="none-account-cont">
      <NoData type="accounts" />
    </div>

    <div v-else class="channel-groups">
      <div
        class="channel-group"
        v-for="group in channelGroups"
        :key="group.key"
      >
        <button
          type="button"
          class="channel-header"
          @click="toggleGroup(group.key)"
        >
          <svg
            class="chevron"
            :class="{ 'chevron--open': isExpanded(group.key) }"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>

          <span class="channel-name">{{ group.label }}</span>
          <span class="channel-count">{{ group.profiles.length }}</span>

          <span v-if="group.attentionCount > 0" class="channel-alert">
            <span class="alert-dot"></span>
            {{ group.attentionCount }}
            {{ pluralAttention(group.attentionCount) }}
          </span>
        </button>

        <div class="channel-body" v-show="isExpanded(group.key)">
          <div
            class="profile-row"
            v-for="item in group.profiles"
            :key="item.uuid"
          >
            <div class="row-section section-identity">
              <div class="account-icon-wrapper">
                <AccountIcon :item="item" class="account-icon-large" />
              </div>
              <div class="identity-info">
                <span v-if="item.name" class="account-name">{{
                  item.name
                }}</span>
                <span v-else class="account-login">{{ item.login }}</span>
              </div>
            </div>

            <div class="vertical-divider"></div>

            <div class="row-section section-data">
              <span class="data-label">Статус</span>
              <span
                class="status-badge"
                :class="`status-badge--${profileStatus(item).variant}`"
              >
                {{ profileStatus(item).label }}
              </span>
            </div>

            <div class="row-section section-data">
              <span class="data-label">Окончание</span>
              <span class="data-value">{{
                formatDate(item.subscription_dt_to)
              }}</span>
            </div>

            <div
              class="row-section section-warning"
              v-if="profileStatus(item).variant === 'warning'"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53216 19 5.07183 19Z"
                />
              </svg>
              Осталось {{ profileStatus(item).daysLeft }}
              {{ pluralDays(profileStatus(item).daysLeft) }}
            </div>

            <div class="row-section section-actions">
              <button class="renew-button" @click="changeTariffStation(item)">
                Продлить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Tariff
      v-if="tariffStation"
      :selectedItem="selectedItem"
      :changeTariffStation="changeTariffStation"
      :getAccounts="getAccounts"
      :changePayDataForAccounts="changePayDataForAccounts"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAccountsList } from "@/composables/useAccountsList";
import { useInstancesStore } from "@/stores/instancesStore";
import AccountIcon from "../Accounts/AccountIcon.vue";
import Tariff from "../Accounts/Accounts/TariffAccount/Tariff.vue";
import LoadAccount from "../Accounts/Accounts/LoadAccount.vue";
import errorAccount from "@/components/Mailing/MailingList/errorAccount.vue";
import NoData from "@/components/GlobalModal/StationList/NoData.vue";

const instancesStore = useInstancesStore();

// Общая с AccountsListV2 логика получения аккаунтов и сохранения в instancesStore
const { loadDataStation, errorAccountBolean, getAccounts } = useAccountsList();

// Порог, после которого подписка считается "истекающей"
const WARNING_DAYS = 7;

const SUBSCRIPTION_EXEMPT_TYPES = ["amocrm", "bitrix24", "uon"];

const isSubscriptionExempt = (item) =>
  SUBSCRIPTION_EXEMPT_TYPES.includes(item.type);

const TYPE_NAMES = {
  bulk: "Аккаунт рассылки",
  telegram: "Telegram",
  sms: "SMS",
  whatsapp: "WhatsApp",
  max: "Max",
  "max-bot": "Max-Бот",
  instagram: "Instagram",
  "vk-bot": "Вконтакте",
  email: "Email",
};

const CHANNEL_ORDER = [
  "telegram",
  "whatsapp",
  "max",
  "max-bot",
  "instagram",
  "vk-bot",
  "sms",
  "email",
  "bulk",
];

const getChannelKey = (item) =>
  item.type === "adapter" || item.type === "undefined"
    ? item.source
    : item.type;

// Полный список аккаунтов, для которых актуальна подписка (без CRM-интеграций,
// которым продление не требуется), сгруппированный по каналу → профилям
const channelGroups = computed(() => {
  const groups = new Map();

  for (const item of instancesStore.allInstances) {
    if (isSubscriptionExempt(item)) continue;

    const key = getChannelKey(item);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: TYPE_NAMES[key] || key,
        profiles: [],
      });
    }
    groups.get(key).profiles.push(item);
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      attentionCount: group.profiles.filter(
        (item) => profileStatus(item).variant !== "active",
      ).length,
    }))
    .sort((a, b) => {
      const ai = CHANNEL_ORDER.indexOf(a.key);
      const bi = CHANNEL_ORDER.indexOf(b.key);
      if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
});

const collapsedKeys = ref(new Set());

const isExpanded = (key) => !collapsedKeys.value.has(key);

const toggleGroup = (key) => {
  if (collapsedKeys.value.has(key)) {
    collapsedKeys.value.delete(key);
  } else {
    collapsedKeys.value.add(key);
  }
};

const tariffStation = ref(false);
const selectedItem = ref(null);

const changeTariffStation = (item) => {
  if (item) {
    if (isSubscriptionExempt(item)) return;
    selectedItem.value = item;
  }
  tariffStation.value = !tariffStation.value;
};

const changePayDataForAccounts = (item) => {
  instancesStore.updateInstanceByUuid(item.uuid, { isPay: true });
  setTimeout(() => {
    instancesStore.updateInstanceByUuid(item.uuid, { isPay: false });
  }, 3000);
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("ru-RU");
  } catch (e) {
    return dateString;
  }
};

// Статус конкретного профиля: активна / истекает (<= WARNING_DAYS) / неактивна
function profileStatus(item) {
  if (!item.subscription_dt_to) {
    return { variant: "inactive", label: "Неактивна", daysLeft: null };
  }

  const daysLeft = Math.ceil(
    (new Date(item.subscription_dt_to).getTime() - Date.now()) / 86400000,
  );

  if (daysLeft < 0) {
    return { variant: "inactive", label: "Неактивна", daysLeft };
  }
  if (daysLeft <= WARNING_DAYS) {
    return { variant: "warning", label: "Истекает", daysLeft };
  }
  return { variant: "active", label: "Активна", daysLeft };
}

const pluralDays = (n) => {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return "дней";
  if (last > 1 && last < 5) return "дня";
  if (last === 1) return "день";
  return "дней";
};

const pluralAttention = (n) => {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return "требуют внимания";
  if (last === 1) return "требует внимания";
  return "требуют внимания";
};

onMounted(async () => {
  // Если в сторе уже есть свежие данные — переиспользуем их без нового запроса
  if (instancesStore.hasAllInstances && instancesStore.isCacheFresh) {
    return;
  }
  await getAccounts();
});
</script>

<style scoped>
.subscriptions-page {
  position: relative;
  margin: 18px 12px 18px 18px;
}

.subscriptions-header {
  margin-bottom: 20px;
}

.title {
  font-weight: 600;
  font-size: 22px;
  color: var(--text);
  margin: 0 0 4px;
  letter-spacing: -0.01em;
}

.subtitle {
  font-size: 13px;
  color: var(--headerAccountText);
  margin: 0;
}

.load-cont,
.none-account-cont {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

/* ==================== ГРУППЫ КАНАЛОВ (АККОРДЕОН) ==================== */
.channel-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.channel-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.channel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  text-align: left;
  color: var(--text);
  transition: background 0.15s ease;
}

.channel-header:hover {
  background: var(--tableAccountBg);
}

.chevron {
  flex-shrink: 0;
  color: var(--headerAccountText);
  transition: transform 0.2s ease;
}

.chevron--open {
  transform: rotate(90deg);
}

.channel-name {
  font-weight: 700;
  font-size: 15px;
}

.channel-count {
  flex-shrink: 0;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--tableAccountBg);
  color: var(--headerAccountText);
  font-size: 11px;
  font-weight: 700;
}

.channel-alert {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: #f59e0b;
}

.alert-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f59e0b;
}

.channel-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ==================== СТРОКА-КАРТОЧКА ПРОФИЛЯ ==================== */
/* Визуально повторяет .account-row из DesktopTableView.vue */
.profile-row {
  display: flex;
  align-items: center;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 12px 20px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  gap: 20px;
  border-left: 3px solid transparent;
}

.profile-row:hover {
  border-color: var(--headerAccountText);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.row-section {
  display: flex;
  align-items: center;
}

.section-identity {
  flex: 1.5;
  min-width: 160px;
  gap: 12px;
}

.account-icon-wrapper {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}

.identity-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.account-name,
.account-login {
  font-weight: 600;
  color: var(--text);
  font-size: 15px;
}

.vertical-divider {
  width: 1px;
  height: 32px;
  background: var(--line);
  flex-shrink: 0;
}

.section-data {
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  min-width: 110px;
}

.data-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--headerAccountText);
  letter-spacing: 0.05em;
}

.data-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.status-badge {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.status-badge--active {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-badge--warning {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-badge--inactive {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.section-warning {
  flex: 0 0 auto;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: #f59e0b;
  white-space: nowrap;
}

.section-actions {
  flex: 0 0 auto;
  justify-content: flex-end;
  margin-left: auto;
}

.renew-button {
  position: relative;
  z-index: 1;
  padding: 7px 14px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primaryHover) 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.renew-button:hover {
  opacity: 0.9;
}

@media (max-width: 900px) {
  .profile-row {
    flex-wrap: wrap;
    row-gap: 12px;
  }

  .section-data {
    flex: 1 1 40%;
  }

  .section-warning {
    flex: 1 1 100%;
  }

  .section-actions {
    flex: 1 1 100%;
    margin-left: 0;
  }

  .renew-button {
    width: 100%;
  }
}
</style>
