<template>
  <div class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Техническая поддержка</h2>
        <button class="close-btn" @click="close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div class="divider"></div>

      <div class="modal-body">
        <!-- Состояние успешной отправки -->
        <div v-if="isSuccess" class="success-state">
          <div class="success-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#10B981" />
              <path
                d="M32 18L21 29L16 24"
                stroke="white"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <h3 class="success-title">Сообщение отправлено</h3>
          <p class="success-text">Мы ответим вам в ближайшее время</p>
          <button class="btn btn-primary" @click="close">Закрыть</button>
        </div>

        <!-- Форма отправки -->
        <div v-else class="form-container">
          <div class="topics-section">
            <h3 class="section-title">Выберите тему обращения</h3>
            <div class="topics-grid">
              <div
                v-for="topic in supportTopics"
                :key="topic.id"
                class="topic-card"
                :class="{ selected: selectedTopic?.id === topic.id }"
                @click="selectTopic(topic)"
              >
                <div class="topic-icon">
                  <component :is="topic.icon" />
                </div>
                <div class="topic-content">
                  <h4 class="topic-title">{{ topic.title }}</h4>
                  <p class="topic-description">{{ topic.description }}</p>
                </div>
                <div class="checkmark" v-if="selectedTopic?.id === topic.id">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="8" fill="var(--primary)" />
                    <path
                      d="M11 6L7 10L5 8"
                      stroke="white"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedTopic" class="form-section">
            <div class="form-group">
              <label for="user-phone" class="form-label">
                Номер телефона
              </label>
              <input
                id="user-phone"
                v-model="userPhone"
                type="tel"
                class="phone-input"
                placeholder="Введите ваш номер телефона"
              />
            </div>

            <div class="form-group">
              <label for="problem-description" class="form-label">
                Описание проблемы
              </label>
              <textarea
                id="problem-description"
                v-model="problemDescription"
                class="problem-textarea"
                placeholder="Опишите вашу проблему подробно..."
                maxlength="300"
                rows="4"
              ></textarea>
              <div class="char-counter">
                {{ problemDescription.length }}/300
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn btn-secondary" @click="close">Отмена</button>
              <button
                class="btn btn-primary"
                @click="sendToSupport"
                :disabled="!canSend"
                :class="{ loading: isSending }"
              >
                <span v-if="isSending">Отправка...</span>
                <span v-else>Отправить</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRefs } from "vue";

const props = defineProps({
  close: {
    type: Function,
  },
  selectedItem: {
    type: Object,
  },
});

const { selectedItem } = toRefs(props);

// SVG иконки для тем
const LockIcon = {
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
};

const TransferIcon = {
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M8 17L4 21M4 21L8 25M4 21H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 7L20 3M20 3L16 -1M20 3H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
};

const WarningIcon = {
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 9V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
};

const supportTopics = ref([
  {
    id: 1,
    title: "Восстановление аккаунта",
    description: "Не могу войти в аккаунт, забыл пароль",
    icon: LockIcon,
  },
  {
    id: 2,
    title: "Перенос подписки",
    description: "Хочу перенести подписку на другой аккаунт",
    icon: TransferIcon,
  },
  {
    id: 3,
    title: "Аккаунт не работает",
    description: "Проблемы с доступом или функционалом",
    icon: WarningIcon,
  },
]);

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const storedData = computed(() => accountStore.getAccountData);

const email = storedData.value;

const selectedTopic = ref(null);
const problemDescription = ref("");
const userPhone = ref("");
const isSending = ref(false);
const isSuccess = ref(false);

const selectTopic = (topic) => {
  selectedTopic.value = topic;
};

const canSend = computed(() => {
  return (
    problemDescription.value.trim().length > 0 &&
    userPhone.value.trim().length > 0 &&
    selectedTopic.value &&
    !isSending.value
  );
});

const sendToSupport = async () => {
  if (!canSend.value) return;

  isSending.value = true;

  try {
    const messageData = {
      selectedTopic: selectedTopic.value,
      problemDescription: problemDescription.value.trim(),
      userPhone: userPhone.value.trim(),
      user: selectedItem.value,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(
      `https://api.telegram.org/bot7205047106:AAE5suy-kIKxnxDTt9OvGG3in7rP9gcupCk/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: -1002431671559,
          text: formatMessage(messageData),
          parse_mode: "HTML",
        }),
      }
    );

    if (response.ok) {
      isSuccess.value = true;
    } else {
      throw new Error("Ошибка отправки");
    }
  } catch (error) {
    console.error("Error sending message:", error);
    alert("Произошла ошибка при отправке. Попробуйте еще раз.");
  } finally {
    isSending.value = false;
  }
};

const formatMessage = (data) => {
  return `
📧 <b>Новое обращение в техподдержку</b>

<b>Тема:</b> ${data.selectedTopic.title}
<b>Время:</b> ${new Date(data.timestamp).toLocaleString("ru-RU")}
<b>Телефон:</b> ${data.userPhone}
<b>Почта:</b> ${email}
<b>Приложение:</b> ${window.location.hostname}

<b>Описание проблемы:</b>
${data.problemDescription}

<b>Данные пользователя:</b>
<code>${JSON.stringify(data.user, null, 2)}</code>
  `;
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--backgroundComponentModal);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--modalBg, #ffffff);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  animation: modal-appear 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--modalColor, #1a1a1a);
}

.close-btn {
  background: var(--tableAccountBg);
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--headerAccountText);
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--line);
  color: var(--modalColor, #1a1a1a);
}

.divider {
  height: 1px;
  background: var(--line);
  margin: 0;
  flex-shrink: 0;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* Стили для скролла */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: var(--scrolBg);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: var(--scrolColor);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: min-content;
}

.section-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--modalColor, #1a1a1a);
  margin: 0 0 16px 0;
}

.topics-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.topic-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  box-sizing: border-box;
}

.topic-card:hover {
  background: var(--tableAccountBg);
  border-color: var(--line);
}

.topic-card.selected {
  background: #f8f7ff;
  border-color: var(--primary);
}

.topic-icon {
  color: var(--headerAccountText);
  margin-top: 2px;
  flex-shrink: 0;
}

.topic-card.selected .topic-icon {
  color: var(--primary);
}

.topic-content {
  flex: 1;
}

.topic-title {
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text);
}

.topic-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--headerAccountText);
  line-height: 1.4;
}

.checkmark {
  position: absolute;
  top: 12px;
  right: 12px;
}

.form-section {
  border-top: 1px solid var(--line);
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 500;
  color: var(--modalColor, #1a1a1a);
  font-size: 0.95rem;
}

.phone-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--input);
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.2s;
  color: var(--text);
  box-sizing: border-box;
}

.phone-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.phone-input::placeholder {
  color: #9ca3af;
}

.problem-textarea {
  width: 100%;
  padding: 12px 16px;
  background: var(--input);
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s;
  color: var(--text);
  box-sizing: border-box;
}

.problem-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.problem-textarea::placeholder {
  color: #9ca3af;
}

.char-counter {
  text-align: right;
  font-size: 0.875rem;
  color: var(--headerAccountText);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
  flex-shrink: 0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
  min-width: 80px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.btn-secondary {
  background: var(--tableAccountBg);
  color: var(--modalColor, #1a1a1a);
  border: 1px solid var(--line);
}

.btn-secondary:hover {
  background: var(--line);
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a2ae0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

.btn-primary.loading {
  opacity: 0.7;
  cursor: wait;
}

/* Success State */
.success-state {
  text-align: center;
  padding: 20px 0;
  flex-shrink: 0;
}

.success-icon {
  margin-bottom: 20px;
}

.success-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--modalColor, #1a1a1a);
  margin: 0 0 8px 0;
}

.success-text {
  color: var(--headerAccountText);
  margin: 0 0 24px 0;
  font-size: 0.95rem;
}

@media (max-width: 640px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-content {
    max-width: 100%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }

  .btn {
    width: 100%;
  }

  .form-section {
    gap: 16px;
  }

  .problem-textarea {
    min-height: 80px;
  }
}

/* Для очень маленьких экранов */
@media (max-height: 600px) {
  .modal-content {
    max-height: 98vh;
  }

  .modal-body {
    padding: 16px;
  }

  .form-container {
    gap: 16px;
  }

  .topics-grid {
    gap: 6px;
  }

  .topic-card {
    padding: 12px;
  }
}
</style>
