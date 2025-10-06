<template>
  <div class="profile-section info-section">
    <h2 class="section-title">
      <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      Основное
    </h2>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Загрузка...</span>
    </div>

    <!-- Основной контент (скрывается при редактировании) -->
    <div v-else-if="!isEditingPhone && !isEditingChannels" class="info-grid">
      <div class="info-item">
        <span class="info-label">Email:</span>
        <span class="info-value">{{ email || "—" }}</span>
      </div>

      <div class="info-item">
        <span class="info-label">Телефон:</span>
        <div class="phone-section">
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
        <span class="info-label">Каналы связи:</span>
        <div class="channels-section">
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
      <h3 class="edit-title">Редактирование телефона</h3>
      <div class="edit-form">
        <div class="form-group">
          <label class="form-label">Телефон:</label>
          <input
            v-model="editedPhone"
            type="tel"
            class="phone-input"
            placeholder="Введите номер телефона"
            :disabled="saving"
          />
        </div>
        <div class="edit-actions">
          <button @click="savePhone" class="save-btn" :disabled="saving">
            <span v-if="saving" class="button-loading"></span>
            {{ saving ? "Сохранение..." : "Сохранить" }}
          </button>
          <button
            @click="cancelEditingPhone"
            class="cancel-btn"
            :disabled="saving"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>

    <!-- Редактирование каналов связи -->
    <div v-else-if="isEditingChannels" class="edit-mode">
      <h3 class="edit-title">Редактирование каналов связи</h3>
      <div class="edit-form">
        <div class="form-group">
          <label class="form-label">Предпочитаемые каналы:</label>
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
            {{ saving ? "Сохранение..." : "Сохранить" }}
          </button>
          <button
            @click="cancelEditingChannels"
            class="cancel-btn"
            :disabled="saving"
          >
            Отмена
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
import { useAccountStore } from "@/stores/accountStore";

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const props = defineProps({
  email: String,
  country: String,
});

// Состояния загрузки
const loading = ref(false);
const saving = ref(false);

// Данные пользователя
const userPhone = ref("");
const userChannels = ref([]);

// Состояния редактирования
const isEditingPhone = ref(false);
const isEditingChannels = ref(false);
const editedPhone = ref("");
const editedChannels = ref([]);

// Уведомления
const message = ref("");
const messageType = ref(""); // 'success' или 'error'

// Доступные каналы связи
const availableChannels = ref([
  { value: "call", label: "Звонок" },
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "viber", label: "Viber" },
  { value: "sms", label: "SMS" },
]);

// Форматированный телефон
const formattedPhone = computed(() => {
  if (!userPhone.value) return "";
  const phone = userPhone.value;
  return `+7 (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(
    7,
    9
  )}-${phone.slice(9)}`;
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
      showMessage("Токен авторизации не найден", "error");
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

    if (!response.ok) throw new Error("Ошибка загрузки контактов");

    const data = await response.json();

    if (data.ok && data.data) {
      userPhone.value = data.data.phone || "";
      userChannels.value = data.data.contact_preferred_channels || [];
    }
  } catch (error) {
    console.error("Ошибка загрузки контактной информации:", error);
    showMessage("Ошибка загрузки контактной информации", "error");
  } finally {
    loading.value = false;
  }
};

// Начало редактирования телефона
const startEditingPhone = () => {
  editedPhone.value = formattedPhone.value;
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
  editedPhone.value = "";
};

// Отмена редактирования каналов
const cancelEditingChannels = () => {
  isEditingChannels.value = false;
  editedChannels.value = [];
};

// Сохранение телефона
const savePhone = async () => {
  if (!editedPhone.value.trim()) {
    showMessage("Введите номер телефона", "error");
    return;
  }

  const currentToken = token.value;
  if (!currentToken) {
    showMessage("Токен авторизации не найден", "error");
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
          phone: editedPhone.value,
          contact_preferred_channels: userChannels.value,
        }),
      }
    );

    if (!response.ok) throw new Error("Ошибка сохранения телефона");

    const data = await response.json();

    if (data.ok) {
      await loadContactInfo();
      isEditingPhone.value = false;
      showMessage("Телефон успешно обновлен", "success");
    } else {
      throw new Error(data.message || "Ошибка сохранения");
    }
  } catch (error) {
    console.error("Ошибка сохранения телефона:", error);
    showMessage("Ошибка сохранения телефона", "error");
  } finally {
    saving.value = false;
  }
};

// Сохранение каналов связи
const saveChannels = async () => {
  const currentToken = token.value;
  if (!currentToken) {
    showMessage("Токен авторизации не найден", "error");
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

    if (!response.ok) throw new Error("Ошибка сохранения каналов");

    const data = await response.json();

    if (data.ok) {
      await loadContactInfo();
      isEditingChannels.value = false;
      showMessage("Каналы связи успешно обновлены", "success");
    } else {
      throw new Error(data.message || "Ошибка сохранения");
    }
  } catch (error) {
    console.error("Ошибка сохранения каналов:", error);
    showMessage("Ошибка сохранения каналов связи", "error");
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
  border-radius: 10px;
  padding: 1.25rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  height: 100%;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: #2d3748;
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
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 0.9rem;
}

.info-label {
  color: #718096;
  margin-right: 1rem;
  min-width: 120px;
}

.info-value {
  font-weight: 500;
  color: #4a5568;
  text-align: right;
}

.phone-section,
.channels-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.edit-btn {
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.4rem;
  cursor: pointer;
  color: #718096;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.edit-btn:hover:not(:disabled) {
  background: #f7fafc;
  color: #4a5568;
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
}

/* Режим редактирования */
.edit-mode {
  padding: 1rem 0;
}

.edit-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #2d3748;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.9rem;
}

.phone-input {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-sizing: border-box;
  padding: 0.75rem;
  font-size: 0.9rem;
  width: 100%;
  max-width: 300px;
  transition: border-color 0.2s;
}

.phone-input:focus {
  outline: none;
  border-color: #4299e1;
}

.phone-input:disabled {
  background-color: #f7fafc;
  opacity: 0.7;
}

.channels-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.channel-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.channel-option:hover:not(.disabled) {
  background: #f7fafc;
}

.channel-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.channel-checkbox {
  margin: 0;
}

.channel-checkbox:disabled {
  cursor: not-allowed;
}

.channel-label {
  font-size: 0.9rem;
  color: #4a5568;
}

.edit-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.save-btn,
.cancel-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 100px;
  justify-content: center;
}

.save-btn {
  background: #48bb78;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #38a169;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cancel-btn {
  background: #e2e8f0;
  color: #4a5568;
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
  gap: 0.75rem;
  padding: 2rem;
  color: #718096;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.button-loading {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
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

@media (min-width: 1200px) {
  .profile-section {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .section-title {
    font-size: 1.15rem;
    margin-bottom: 1.5rem;
  }

  .info-grid {
    gap: 1.25rem;
  }

  .info-item {
    font-size: 0.95rem;
  }
}
</style>
