<template>
  <ModalFrame
    :item="item"
    :close="close"
    :text="textModal"
    :is-loading="initialLoading"
    :action="activeTab === 'settings' ? saveSettings : undefined"
    :is-disabled="activeTab === 'settings' && (!isFormValid || saving)"
  >
    <!-- Вкладки -->

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Вкладка: Информация -->
    <div v-if="activeTab === 'info'" class="tab-content">
      <div class="info-block">
        <div class="info-row">
          <span class="info-label">Имя аккаунта</span>
          <span class="info-value">{{ item?.name || "—" }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">UUID</span>
          <span class="info-value uuid-val">{{ item?.uuid || "—" }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Статус</span>
          <span class="info-value">
            <span
              class="badge"
              :class="item?.active ? 'badge-green' : 'badge-gray'"
            >
              {{ item?.active ? "Активен" : "Неактивен" }}
            </span>
          </span>
        </div>
        <div class="info-row" v-if="item?.login || item?.email">
          <span class="info-label">Email</span>
          <span class="info-value">{{
            item?.email || item?.login || "—"
          }}</span>
        </div>
      </div>
    </div>

    <!-- Вкладка: Вебхуки -->
    <div v-if="activeTab === 'webhooks'" class="tab-content">
      <p class="section-desc">
        Добавьте URL-адреса для получения уведомлений о входящих письмах.
      </p>
      <div class="webhooks-list">
        <div
          v-for="(url, index) in webhookUrls"
          :key="index"
          class="webhook-item"
        >
          <svg
            class="wh-icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
            />
            <path
              d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
            />
          </svg>
          <span class="wh-url">{{ url }}</span>
          <button
            class="icon-btn delete"
            @click="removeWebhook(index)"
            :disabled="saving"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
        <div class="webhook-item add-row">
          <svg
            class="wh-icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <input
            v-model="newWebhookUrl"
            type="text"
            placeholder="Введите URL вебхука"
            class="wh-input"
            :disabled="saving"
            @keypress.enter="addWebhook"
          />
          <button
            class="icon-btn add"
            @click="addWebhook"
            :disabled="saving || !newWebhookUrl.trim()"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Вкладка: Настройки (SMTP) -->
    <div v-if="activeTab === 'settings'" class="tab-content">
      <p class="section-desc">
        Настройки SMTP для отправки писем через этот аккаунт.
      </p>

      <div class="form-grid">
        <!-- Email -->
        <div class="field" :class="{ 'field-error': errors.email }">
          <label class="field-label"
            >Email <span class="required">*</span></label
          >
          <input
            v-model="form.email"
            type="email"
            class="field-input"
            placeholder="sender@example.com"
            @blur="validateEmail"
            @input="errors.email = ''"
          />
          <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
        </div>

        <!-- Username -->
        <div class="field">
          <label class="field-label"
            >Имя пользователя
            <span class="optional">(необязательно)</span></label
          >
          <input
            v-model="form.username"
            type="text"
            class="field-input"
            placeholder="Если отличается от email"
          />
        </div>

        <!-- Password -->
        <div class="field" :class="{ 'field-error': errors.password }">
          <label class="field-label"
            >Пароль приложения
            <span class="optional">(оставьте пустым, чтобы не менять)</span></label
          >
          <div class="password-wrapper">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="field-input"
              placeholder="Пароль для внешнего приложения"
              @input="errors.password = ''"
            />
            <button
              class="toggle-pass"
              type="button"
              @click="showPassword = !showPassword"
            >
              <svg
                v-if="!showPassword"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg
                v-else
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                />
                <path
                  d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
          <span v-if="errors.password" class="error-msg">{{
            errors.password
          }}</span>
        </div>

        <!-- Provider -->
        <div class="field">
          <label class="field-label"
            >Провайдер <span class="optional">(необязательно)</span></label
          >
          <select
            v-model="form.provider"
            class="field-input"
            @change="onProviderChange"
          >
            <option value="">— Не выбран —</option>
            <option value="yandex">Яндекс Почта</option>
            <option value="mailru">Mail.ru</option>
            <option value="google">Google (Gmail)</option>
            <option value="other">Другой</option>
          </select>
        </div>

        <!-- SMTP Server -->
        <div class="field">
          <label class="field-label">
            SMTP сервер
            <span class="optional">(необязательно)</span>
            <span v-if="isKnownProvider" class="badge-auto">авто</span>
          </label>
          <input
            v-model="form.smtp_server"
            type="text"
            class="field-input"
            placeholder="smtp.example.com"
            :disabled="isKnownProvider"
            :class="{ 'field-disabled': isKnownProvider }"
          />
        </div>

        <!-- SMTP Port -->
        <div class="field">
          <label class="field-label">
            SMTP порт
            <span class="optional">(необязательно)</span>
            <span v-if="isKnownProvider" class="badge-auto">авто</span>
          </label>
          <input
            v-model.number="form.smtp_port"
            type="number"
            class="field-input"
            placeholder="587"
            :disabled="isKnownProvider"
            :class="{ 'field-disabled': isKnownProvider }"
          />
        </div>
      </div>

      <!-- Ошибка дубля -->
      <div v-if="duplicateError" class="alert-error">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {{ duplicateError }}
      </div>

      <!-- Статус сохранения -->
      <div v-if="saveSuccess" class="alert-success">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Настройки успешно сохранены
      </div>
    </div>
  </ModalFrame>
</template>

<script setup>
import { ref, computed, onMounted, toRefs } from "vue";
import axios from "axios";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";
import { useAccountStore } from "@/stores/accountStore";

const props = defineProps({
  item: { type: Object },
  close: { type: Function },
});

const { item } = toRefs(props);

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const BASE_URL = import.meta.env.VITE_BASE_URL;
const REFERER = window.location.origin;

const textModal = computed(() => ({
  title: "Настройки Email",
  close: "Закрыть",
  action:
    activeTab.value === "settings"
      ? saving.value
        ? "Сохранение..."
        : "Сохранить"
      : undefined,
}));

// Вкладки
const tabs = [
  { key: "info", label: "Информация" },
  { key: "webhooks", label: "Вебхуки" },
  { key: "settings", label: "Настройки" },
];
const activeTab = ref("info");

// Состояния загрузки
const initialLoading = ref(false);
const saving = ref(false);

// Вебхуки
const webhookUrls = ref([]);
const newWebhookUrl = ref("");

// Настройки SMTP
const form = ref({
  email: "",
  username: "",
  password: "",
  provider: "",
  smtp_server: "",
  smtp_port: 587,
});

const errors = ref({ email: "", password: "" });
const showPassword = ref(false);
const duplicateError = ref("");
const saveSuccess = ref(false);

// SMTP пресеты провайдеров
const PROVIDER_PRESETS = {
  yandex: { smtp_server: "smtp.yandex.ru", smtp_port: 465 },
  mailru: { smtp_server: "smtp.mail.ru", smtp_port: 465 },
  google: { smtp_server: "smtp.gmail.com", smtp_port: 587 },
};

const isKnownProvider = computed(() =>
  ["yandex", "mailru", "google"].includes(form.value.provider),
);

const isFormValid = computed(() => {
  const emailOk =
    form.value.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email);
  return !!emailOk;
});

// Применяем пресет при смене провайдера
const onProviderChange = () => {
  duplicateError.value = "";
  const preset = PROVIDER_PRESETS[form.value.provider];
  if (preset) {
    form.value.smtp_server = preset.smtp_server;
    form.value.smtp_port = preset.smtp_port;
  } else {
    form.value.smtp_server = "";
    form.value.smtp_port = 587;
  }
};

// Валидация email
const validateEmail = () => {
  const val = form.value.email;
  if (!val) {
    errors.value.email = "Email обязателен";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    errors.value.email = "Некорректный формат email";
  } else {
    errors.value.email = "";
  }
};

// Управление вебхуками
const addWebhook = () => {
  const url = newWebhookUrl.value.trim();
  if (url && !webhookUrls.value.includes(url)) {
    webhookUrls.value.push(url);
    newWebhookUrl.value = "";
  }
};

const removeWebhook = (index) => {
  webhookUrls.value.splice(index, 1);
};

// Загрузка конфига текущего аккаунта по uuid
const fetchConfigs = async () => {
  if (!item.value?.uuid) return;
  initialLoading.value = true;
  try {
    const response = await axios.get(`${BASE_URL}email-sender/config`, {
      params: { uuid: item.value.uuid },
      headers: {
        Authorization: `Bearer ${token.value}`,
        Referer: REFERER,
      },
    });

    const current = response.data?.data || null;
    if (current && typeof current === "object" && !Array.isArray(current)) {
      form.value.email = current.email || "";
      form.value.username = current.username || "";
      form.value.password = "";
      form.value.provider = current.provider || "";
      form.value.smtp_server = current.smtp_server || "";
      form.value.smtp_port = current.smtp_port ?? 587;
      webhookUrls.value = Array.isArray(current.webhookUrls)
        ? [...current.webhookUrls]
        : [];
    }
  } catch (error) {
    console.error("Ошибка загрузки конфигов:", error);
  } finally {
    initialLoading.value = false;
  }
};

// Сохранение настроек SMTP
const saveSettings = async () => {
  validateEmail();
  if (errors.value.email) return;

  duplicateError.value = "";
  saveSuccess.value = false;
  saving.value = true;
  try {
    const payload = {
      uuid: item.value.uuid,
      email: form.value.email,
      ...(form.value.username && { username: form.value.username }),
      ...(form.value.password && { password: form.value.password }),
      ...(form.value.provider && { provider: form.value.provider }),
      ...(form.value.smtp_server && { smtp_server: form.value.smtp_server }),
      ...(form.value.smtp_port && { smtp_port: form.value.smtp_port }),
      ...(webhookUrls.value.length && { webhookUrls: webhookUrls.value }),
    };

    await axios.post(`${BASE_URL}email-sender/updateConfig`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
        Referer: REFERER,
      },
    });

    // Перезагружаем актуальные настройки с сервера
    await fetchConfigs();

    saveSuccess.value = true;
    setTimeout(() => (saveSuccess.value = false), 3000);
  } catch (error) {
    console.error("Ошибка сохранения:", error);
    duplicateError.value = "Ошибка при сохранении. Попробуйте ещё раз.";
  } finally {
    saving.value = false;
  }
};

onMounted(fetchConfigs);
</script>

<style scoped>
/* Вкладки */
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  border-radius: 6px 6px 0 0;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #334155;
  background: #f8fafc;
}

.tab-btn.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  background: none;
}

.tab-content {
  padding-top: 4px;
}

/* Информация */
.info-block {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.info-value {
  font-size: 13px;
  color: #334155;
}

.uuid-val {
  font-family: monospace;
  font-size: 11px;
  color: #94a3b8;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.badge-green {
  background: #dcfce7;
  color: #16a34a;
}

.badge-gray {
  background: #f1f5f9;
  color: #64748b;
}

/* Вебхуки */
.section-desc {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 14px;
}

.webhooks-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.webhook-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.webhook-item.add-row {
  background: #f8fafc;
  border-style: dashed;
}

.wh-icon {
  color: #94a3b8;
  flex-shrink: 0;
}

.wh-url {
  flex: 1;
  font-size: 13px;
  color: #334155;
  word-break: break-all;
}

.wh-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 13px;
  color: #334155;
}

.wh-input::placeholder {
  color: #94a3b8;
}

.icon-btn {
  border: none;
  background: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  color: #94a3b8;
  transition: all 0.2s;
  flex-shrink: 0;
}

.icon-btn.delete:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
}

.icon-btn.add:hover:not(:disabled) {
  background: #dcfce7;
  color: #16a34a;
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Форма настроек SMTP */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #ef4444;
}

.optional {
  font-weight: 400;
  color: #94a3b8;
  font-size: 11px;
}

.badge-auto {
  font-size: 10px;
  background: #dbeafe;
  color: #2563eb;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 700;
}

.field-input {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #1e293b;
  outline: none;
  transition: border-color 0.2s;
  background: #fff;
  width: 100%;
  box-sizing: border-box;
}

.field-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.field-input.field-disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.field-error .field-input {
  border-color: #ef4444;
}

select.field-input {
  cursor: pointer;
}

.password-wrapper {
  position: relative;
}

.password-wrapper .field-input {
  padding-right: 40px;
}

.toggle-pass {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 4px;
  display: flex;
  align-items: center;
}

.toggle-pass:hover {
  color: #475569;
}

.error-msg {
  font-size: 11px;
  color: #ef4444;
  font-weight: 500;
}

/* Алерты */
.alert-error,
.alert-success {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  margin-top: 14px;
}

.alert-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.alert-success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}
</style>
