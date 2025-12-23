<template>
  <div class="profile-section info-section">
    <h2 class="section-title">
      <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      {{ t("profileSection.main") }}
    </h2>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>{{ t("profileSection.loading") }}</span>
    </div>

    <!-- Основной контент (скрывается при редактировании) -->
    <div v-else-if="!isEditingPhone && !isEditingChannels" class="info-grid">
      <div class="info-item">
        <span class="info-label">{{ t("profileSection.email") }}:</span>
        <div class="value-container">
          <span class="info-value">{{ email || "—" }}</span>
        </div>
      </div>

      <div class="info-item">
        <span class="info-label">{{ t("profileSection.phone") }}:</span>
        <div class="value-container">
          <span class="info-value">{{ formattedPhone || "—" }}</span>
          <button
            @click="startEditingPhone"
            class="edit-btn"
            :disabled="saving"
          >
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="info-item">
        <span class="info-label">{{ t("profileSection.channelsTitle") }}:</span>
        <div class="value-container">
          <span class="info-value">
            {{ formattedChannels || "—" }}
          </span>
          <button
            @click="startEditingChannels"
            class="edit-btn"
            :disabled="saving"
          >
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Редактирование телефона -->
    <div v-else-if="isEditingPhone" class="edit-mode">
      <h3 class="edit-title">{{ t("profileSection.editPhone") }}</h3>
      <div class="edit-form">
        <div class="form-group">
          <label class="form-label">{{ t("profileSection.phone") }}:</label>
          <input
            :class="
              phoneFormatter.state.errorPhone
                ? 'form-input form-input-error'
                : 'form-input'
            "
            :placeholder="
              phoneFormatter.state.showMask
                ? '+7 (___) ___-__-__'
                : t('profileSection.enterPhone')
            "
            @input="phoneFormatter.formatPhone"
            @keydown.delete="phoneFormatter.handleBackspace"
            v-model="phoneFormatter.state.phoneNumber"
            :ref="(el) => (phoneFormatter.phoneInput.value = el)"
            :disabled="saving"
          />
          <div v-if="phoneFormatter.state.errorPhone" class="error-text">
            {{ t("profileSection.invalidPhone") }}
          </div>
        </div>
        <div class="edit-actions">
          <button @click="savePhone" class="save-btn" :disabled="saving">
            <span v-if="saving" class="button-loading"></span>
            {{ saving ? t("profileSection.saving") : t("profileSection.save") }}
          </button>
          <button
            @click="cancelEditingPhone"
            class="cancel-btn"
            :disabled="saving"
          >
            {{ t("profileSection.cancel") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Редактирование каналов связи -->
    <div v-else-if="isEditingChannels" class="edit-mode">
      <h3 class="edit-title">{{ t("profileSection.editChannels") }}</h3>
      <div class="edit-form">
        <div class="form-group">
          <label class="form-label"
            >{{ t("profileSection.preferredChannels") }}:</label
          >
          <div class="channels-options">
            <label
              v-for="channel in availableChannels"
              :key="channel.value"
              class="channel-option"
              :class="{ disabled: saving }"
            >
              <input
                type="checkbox"
                :value="channel.value"
                v-model="editedChannels"
                class="channel-checkbox"
                :disabled="saving"
              />
              <span class="channel-label">{{ channel.label }}</span>
            </label>
          </div>
        </div>
        <div class="edit-actions">
          <button @click="saveChannels" class="save-btn" :disabled="saving">
            <span v-if="saving" class="button-loading"></span>
            {{ saving ? t("profileSection.saving") : t("profileSection.save") }}
          </button>
          <button
            @click="cancelEditingChannels"
            class="cancel-btn"
            :disabled="saving"
          >
            {{ t("profileSection.cancel") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Уведомления -->
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAccountStore } from "@/stores/accountStore";
import { usePhoneFormatter } from "@/composables/usePhoneFormatter";

const { t } = useI18n();
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const props = defineProps({
  email: String,
  country: String,
});

// Инициализируем утилиту форматирования телефона
const phoneFormatter = usePhoneFormatter();

// Состояния загрузки
const loading = ref(false);
const saving = ref(false);

// Данные пользователя
const userPhone = ref("");
const userChannels = ref([]);

// Состояния редактирования
const isEditingPhone = ref(false);
const isEditingChannels = ref(false);
const editedChannels = ref([]);

// Уведомления
const message = ref("");
const messageType = ref(""); // 'success' или 'error'

// Доступные каналы связи
const availableChannels = ref([
  { value: "call", label: t("profileSection.channels.call") },
  { value: "telegram", label: t("profileSection.channels.telegram") },
  { value: "whatsapp", label: t("profileSection.channels.whatsapp") },
  { value: "viber", label: t("profileSection.channels.viber") },
  { value: "sms", label: t("profileSection.channels.sms") },
]);

// Форматированный телефон
const formattedPhone = computed(() => {
  if (!userPhone.value) return "";
  const phone = userPhone.value;
  // Проверяем, что номер в правильном формате для форматирования
  if (phone.length >= 11) {
    return `+7 (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(
      7,
      9
    )}-${phone.slice(9)}`;
  }
  return phone;
});

// Форматированные каналы связи
const formattedChannels = computed(() => {
  if (!userChannels.value.length) return "—";
  return userChannels.value
    .map((channel) => {
      const found = availableChannels.value.find((c) => c.value === channel);
      return found ? found.label : channel;
    })
    .join(", ");
});

// Загрузка контактной информации
const loadContactInfo = async () => {
  loading.value = true;
  try {
    const currentToken = token.value;
    if (!currentToken) {
      showMessage(t("profileSection.errors.noToken"), "error");
      return;
    }

    const response = await fetch(
      `${import.meta.env.VITE_FRONTEND_URL_USERS}/getContact`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error(t("profileSection.errors.loadFailed"));

    const data = await response.json();

    if (data.ok && data.data) {
      userPhone.value = data.data.phone || "";
      userChannels.value = data.data.contact_preferred_channels || [];
    }
  } catch (error) {
    console.error("Ошибка загрузки контактной информации:", error);
    showMessage(t("profileSection.errors.loadFailed"), "error");
  } finally {
    loading.value = false;
  }
};

// Начало редактирования телефона
const startEditingPhone = () => {
  // Очищаем форму и устанавливаем текущий номер
  phoneFormatter.clearPhone();
  phoneFormatter.state.phoneNumber = userPhone.value;
  isEditingPhone.value = true;
  isEditingChannels.value = false;
};

// Начало редактирования каналов
const startEditingChannels = () => {
  editedChannels.value = [...userChannels.value];
  isEditingChannels.value = true;
  isEditingPhone.value = false;
};

// Отмена редактирования телефона
const cancelEditingPhone = () => {
  isEditingPhone.value = false;
  phoneFormatter.clearPhone();
};

// Отмена редактирования каналов
const cancelEditingChannels = () => {
  isEditingChannels.value = false;
  editedChannels.value = [];
};

// Сохранение телефона
const savePhone = async () => {
  if (!phoneFormatter.validatePhone()) {
    return;
  }

  const currentToken = token.value;
  if (!currentToken) {
    showMessage(t("profileSection.errors.noToken"), "error");
    return;
  }

  const internationalPhone = phoneFormatter.getInternationalFormat();

  saving.value = true;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_FRONTEND_URL_USERS}/saveContact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          phone: internationalPhone,
          contact_preferred_channels: userChannels.value,
        }),
      }
    );

    if (!response.ok) throw new Error(t("profileSection.errors.saveFailed"));

    const data = await response.json();

    if (data.ok) {
      await loadContactInfo();
      isEditingPhone.value = false;
      phoneFormatter.clearPhone();
      showMessage(t("profileSection.messages.phoneSaved"), "success");
    } else {
      throw new Error(data.message || t("profileSection.errors.saveFailed"));
    }
  } catch (error) {
    console.error("Ошибка сохранения телефона:", error);
    showMessage(t("profileSection.errors.phoneSaveFailed"), "error");
  } finally {
    saving.value = false;
  }
};

// Сохранение каналов связи
const saveChannels = async () => {
  const currentToken = token.value;
  if (!currentToken) {
    showMessage(t("profileSection.errors.noToken"), "error");
    return;
  }

  saving.value = true;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_FRONTEND_URL_USERS}/saveContact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          phone: userPhone.value,
          contact_preferred_channels: editedChannels.value,
        }),
      }
    );

    if (!response.ok) throw new Error(t("profileSection.errors.saveFailed"));

    const data = await response.json();

    if (data.ok) {
      await loadContactInfo();
      isEditingChannels.value = false;
      showMessage(t("profileSection.messages.channelsSaved"), "success");
    } else {
      throw new Error(data.message || t("profileSection.errors.saveFailed"));
    }
  } catch (error) {
    console.error("Ошибка сохранения каналов:", error);
    showMessage(t("profileSection.errors.channelsSaveFailed"), "error");
  } finally {
    saving.value = false;
  }
};

// Показать сообщение
const showMessage = (text, type) => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = "";
    messageType.value = "";
  }, 3000);
};

// Загрузка данных при монтировании
onMounted(() => {
  loadContactInfo();
});
</script>

<style scoped>
.profile-section {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #2d3748;
  width: 100%;
}

.icon {
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.info-grid {
  display: grid;
  gap: 0.5rem;
  width: 100%;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
  width: 100%;
  box-sizing: border-box;
}

.info-label {
  color: #718096;
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 110px;
  text-align: left;
  flex-shrink: 0;
  margin: 0;
}

.value-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  min-width: 0;
}

.info-value {
  font-weight: 500;
  color: #4a5568;
  word-break: break-word;
  flex: 1;
  min-width: 0;
  overflow-wrap: break-word;
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
  font-family: inherit;
}

.edit-btn {
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.375rem;
  cursor: pointer;
  color: #718096;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  min-width: 28px;
  height: 28px;
  margin: 0;
}

.edit-btn:hover:not(:disabled) {
  background: #f7fafc;
  color: #4a5568;
  border-color: #cbd5e0;
}

.edit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-btn svg {
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  width: 12px;
  height: 12px;
}

/* Режим редактирования */
.edit-mode {
  padding: 0;
  width: 100%;
}

.edit-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #2d3748;
  width: 100%;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.form-label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.875rem;
  margin: 0;
}

.form-input {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-sizing: border-box;
  padding: 0.625rem;
  font-size: 0.875rem;
  width: 100%;
  max-width: 100%;
  transition: border-color 0.2s;
  background: white;
  margin: 0;
}

.form-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-input:disabled {
  background-color: #f7fafc;
  opacity: 0.7;
  cursor: not-allowed;
}

.form-input-error {
  border-color: #f56565;
  background-color: #fef5f5;
}

.form-input-error:focus {
  border-color: #f56565;
  box-shadow: 0 0 0 3px rgba(245, 101, 101, 0.1);
}

.error-text {
  color: #c53030;
  font-size: 0.75rem;
  margin: 0.25rem 0 0 0;
  font-weight: 500;
}

.channels-options {
  display: grid;
  gap: 0.5rem;
  width: 100%;
}

.channel-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  background: white;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
}

.channel-option:hover:not(.disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.channel-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f7fafc;
}

.channel-checkbox {
  margin: 0;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.channel-checkbox:disabled {
  cursor: not-allowed;
}

.channel-label {
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 500;
  margin: 0;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  margin: 0.75rem 0 0 0;
  flex-wrap: wrap;
  width: 100%;
}

.save-btn,
.cancel-btn {
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 100px;
  justify-content: center;
  font-weight: 500;
  flex-shrink: 0;
  margin: 0;
}

.save-btn {
  background: oklch(0.541 0.198 267);
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #3e43ae;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cancel-btn {
  background: #e2e8f0;
  color: #4a5568;
  border: 1px solid #cbd5e0;
}

.cancel-btn:hover:not(:disabled) {
  background: #cbd5e0;
}

.cancel-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Состояния загрузки */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  color: #718096;
  width: 100%;
  margin: 0;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}

.button-loading {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid white;
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

/* Уведомления */
.message {
  margin: 0.75rem 0 0 0;
  padding: 0.625rem;
  border-radius: 6px;
  font-size: 0.875rem;
  text-align: center;
  font-weight: 500;
  width: 100%;
  box-sizing: border-box;
}

.message.success {
  background: #f0fff4;
  color: #2d7d46;
  border: 1px solid #9ae6b4;
}

.message.error {
  background: #fed7d7;
  color: #c53030;
  border: 1px solid #fc8181;
}

/* Адаптивные стили */
@media (min-width: 640px) {
  .profile-section {
    padding: 1.25rem;
  }

  .info-grid {
    gap: 0.75rem;
  }

  .info-item {
    padding: 0.625rem 0;
  }

  .channels-options {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.75rem;
  }
}

@media (min-width: 768px) {
  .section-title {
    font-size: 1.15rem;
    margin-bottom: 1.25rem;
  }

  .info-item {
    font-size: 0.95rem;
  }

  .form-input {
    max-width: 280px;
  }

  .info-label {
    min-width: 120px;
  }
}

@media (min-width: 1024px) {
  .profile-section {
    border-radius: 10px;
    padding: 1.5rem;
  }

  .info-grid {
    gap: 1rem;
  }
}

@media (max-width: 380px) {
  .info-value {
    font-size: 0.8rem;
  }

  .info-value:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px;
  }
}
</style>
