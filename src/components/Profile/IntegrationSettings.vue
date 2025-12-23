<template>
  <div class="integration-settings">
    <div class="settings-header">
      <h3 class="settings-title">{{ t("integrationSettings.title") }}</h3>
      <p class="settings-description">
        {{ t("integrationSettings.description") }}
      </p>
    </div>

    <div class="settings-list">
      <div class="setting-item">
        <div class="setting-info">
          <label class="setting-label">
            {{ t("integrationSettings.disableMessengerOutgoing") }}
          </label>
          <p class="setting-hint">
            {{ t("integrationSettings.disableMessengerOutgoingHint") }}
          </p>
        </div>
        <div class="setting-control">
          <label class="toggle-switch">
            <input
              type="checkbox"
              v-model="localSettings.disable_messenger_outgoing"
              @change="onSettingChange"
              :disabled="isSaving"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>

    <div v-if="message" :class="['alert', `alert-${message.type}`]">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";

const { t } = useI18n();
const accountStore = useAccountStore();
const VITE_FRONTEND_URL_USERS = import.meta.env.VITE_FRONTEND_URL_USERS;

const localSettings = ref({
  disable_messenger_outgoing: false,
});

const isSaving = ref(false);
const message = ref(null);

// Создаём axios instance с базовой конфигурацией
const apiClient = axios.create({
  baseURL: VITE_FRONTEND_URL_USERS,
});

// Добавляем интерцептор для добавления токена ко всем запросам
apiClient.interceptors.request.use((config) => {
  const token = accountStore.getAccountToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const fetchSettings = async () => {
  try {
    const response = await apiClient.get("getSettings");

    if (response.data.ok && response.data.data?.settings) {
      localSettings.value = { ...response.data.data.settings };
    } else {
      // Если настроек нет, используем значения по умолчанию
      localSettings.value = { disable_messenger_outgoing: false };
    }
  } catch (error) {
    console.error("Ошибка при загрузке настроек:", error);
    showMessage(t("integrationSettings.errors.loadFailed"), "error");
  }
};

const saveSettings = async () => {
  isSaving.value = true;
  message.value = null;

  try {
    const response = await apiClient.post("saveSettings", {
      settings: localSettings.value,
    });

    if (response.data.ok) {
      showMessage(t("integrationSettings.messages.saved"), "success");
    } else {
      showMessage(
        response.data.message || t("integrationSettings.errors.saveFailed"),
        "error"
      );
      // Откатываем значение если ошибка
      localSettings.value.disable_messenger_outgoing =
        !localSettings.value.disable_messenger_outgoing;
    }
  } catch (error) {
    console.error("Ошибка при сохранении настроек:", error);
    showMessage(t("integrationSettings.errors.saveFailed"), "error");
    // Откатываем значение если ошибка
    localSettings.value.disable_messenger_outgoing =
      !localSettings.value.disable_messenger_outgoing;
  } finally {
    isSaving.value = false;
  }
};

const onSettingChange = () => {
  saveSettings();
};

const showMessage = (text, type) => {
  message.value = { text, type };
  if (type === "success") {
    setTimeout(() => {
      message.value = null;
    }, 3000);
  }
};

onMounted(() => {
  fetchSettings();
});
</script>

<style scoped>
.integration-settings {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.settings-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
}

.settings-description {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 0.375rem;
  border: 1px solid #e5e5e5;
  transition: all 0.2s ease;
}

.setting-item:hover {
  background: #fcfcfc;
  border-color: #d9d9d9;
}

.setting-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1a1a1a;
  cursor: pointer;
  margin: 0;
}

.setting-hint {
  margin: 0;
  font-size: 0.8125rem;
  color: #999;
}

.setting-control {
  display: flex;
  align-items: center;
  margin-left: 1.5rem;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-flex;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.toggle-switch input {
  display: none;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d9d9d9;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.toggle-slider::before {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #3b82f6;
}

.toggle-switch input:checked + .toggle-slider::before {
  left: 22px;
}

.toggle-switch input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Alert Messages */
.alert {
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-success {
  background-color: #d1fae5;
  border: 1px solid #6ee7b7;
  color: #065f46;
}

.alert-error {
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}

/* Responsive */
@media (max-width: 640px) {
  .setting-item {
    flex-direction: column;
    gap: 1rem;
  }

  .setting-control {
    width: 100%;
    justify-content: space-between;
    margin-left: 0;
  }
}
</style>
