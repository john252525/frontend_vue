<template>
  <div class="support-page">
    <header class="header">
      <h1>Поддержка</h1>
    </header>

    <div class="support-container">
      <!-- Форма обращения -->
      <div class="support-form" :class="{ 'form-submitted': isSubmitting }">
        <h2>Отправить запрос</h2>
        <form @submit.prevent="submitForm">
          <div class="form-group" v-for="field in formFields" :key="field.id">
            <label :for="field.id">{{ field.label }}</label>
            <component
              :is="field.component"
              :id="field.id"
              v-model="form[field.id]"
              :placeholder="field.placeholder"
              :required="field.required"
              :options="field.options"
            />
          </div>

          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            <span v-if="!isSubmitting">Отправить</span>
            <div v-else class="loader"></div>
          </button>
        </form>
      </div>

      <!-- FAQ раздел -->
      <div class="faq-section">
        <h2>Частые вопросы</h2>
        <div class="faq-list">
          <TransitionGroup name="faq">
            <div
              v-for="(faq, index) in faqs"
              :key="index"
              class="faq-item"
              @click="toggleFaq(index)"
            >
              <div class="faq-question">
                {{ faq.question }}
                <span class="faq-toggle">{{ faq.open ? "−" : "+" }}</span>
              </div>
              <CollapseTransition>
                <div v-if="faq.open" class="faq-answer">{{ faq.answer }}</div>
              </CollapseTransition>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>

    <!-- Уведомление -->
    <Transition name="slide-fade">
      <div
        v-if="showNotification"
        class="notification"
        :class="notificationType"
      >
        {{ notificationMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const form = ref({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const formFields = [
  {
    id: "name",
    label: "Ваше имя",
    component: "input",
    type: "text",
    placeholder: "Иван Иванов",
    required: true,
  },
  {
    id: "email",
    label: "Email",
    component: "input",
    type: "email",
    placeholder: "example@mail.com",
    required: true,
  },
  {
    id: "subject",
    label: "Тема",
    component: "select",
    options: [
      { value: "", text: "Выберите тему", disabled: true },
      { value: "technical", text: "Техническая проблема" },
      { value: "account", text: "Вопрос по аккаунту" },
      { value: "payment", text: "Платежи" },
      { value: "other", text: "Другое" },
    ],
    required: true,
  },
  {
    id: "message",
    label: "Сообщение",
    component: "textarea",
    placeholder: "Опишите вашу проблему...",
    required: true,
  },
];

const isSubmitting = ref(false);
const showNotification = ref(false);
const notificationType = ref("success");
const notificationMessage = ref("");

const faqs = ref([
  {
    question: "Как сбросить пароль?",
    answer:
      'Перейдите на страницу входа и нажмите "Забыли пароль". Вам на почту придет инструкция.',
    open: false,
  },
  {
    question: "Какие способы оплаты вы принимаете?",
    answer: "Мы принимаем Visa, Mastercard, Мир, а также переводы через СБП.",
    open: false,
  },
  {
    question: "Как долго ждать ответ от поддержки?",
    answer:
      "Обычно мы отвечаем в течение 1 рабочего дня, но чаще всего быстрее.",
    open: false,
  },
  {
    question: "Есть ли у вас мобильное приложение?",
    answer: "Да, наше приложение доступно в App Store и Google Play.",
    open: false,
  },
]);

const CollapseTransition = {
  name: "collapse",
  template: '<transition name="collapse"><slot/></transition>',
};

const toggleFaq = (index) => {
  faqs.value[index].open = !faqs.value[index].open;
};

const showNotificationMessage = (type, message) => {
  notificationType.value = type;
  notificationMessage.value = message;
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

const submitForm = () => {
  isSubmitting.value = true;

  setTimeout(() => {
    console.log("Форма отправлена:", form.value);
    isSubmitting.value = false;

    const isSuccess = Math.random() > 0.3;
    if (isSuccess) {
      showNotificationMessage(
        "success",
        "Сообщение отправлено! Мы ответим вам в ближайшее время."
      );
      form.value = { name: "", email: "", subject: "", message: "" };
    } else {
      showNotificationMessage(
        "error",
        "Ошибка отправки. Пожалуйста, попробуйте позже."
      );
    }
  }, 1500);
};
</script>

<style scoped>
.support-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  color: #333;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  animation: fadeInDown 0.6s ease-out;
}

.header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #222;
  margin: 0;
}

.support-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  animation: fadeIn 0.8s ease-out;
}

@media (max-width: 768px) {
  .support-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.support-form,
.faq-section {
  background: white;
  border-radius: 16px;
  padding: 1.8rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.support-form.form-submitted {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

h2 {
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  color: #222;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.3rem;
  animation: fadeIn 0.5s ease-out;
  animation-fill-mode: backwards;
}

.form-group:nth-child(1) {
  animation-delay: 0.1s;
}
.form-group:nth-child(2) {
  animation-delay: 0.2s;
}
.form-group:nth-child(3) {
  animation-delay: 0.3s;
}
.form-group:nth-child(4) {
  animation-delay: 0.4s;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #444;
  font-size: 0.95rem;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #f9f9f9;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #646cff;
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
  background: white;
}

textarea {
  resize: vertical;
  min-height: 120px;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.8rem center;
  background-size: 1rem;
}

.submit-btn {
  background-color: #646cff;
  color: white;
  border: none;
  padding: 0.9rem;
  font-size: 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  font-weight: 500;
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
}

.submit-btn:hover {
  background-color: #535bf2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(83, 91, 242, 0.2);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.faq-item {
  border-radius: 10px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.faq-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.faq-question {
  padding: 1rem;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.faq-question:hover {
  color: #646cff;
}

.faq-toggle {
  font-size: 1.2rem;
  color: #646cff;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.faq-item.open .faq-toggle {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 1rem 1rem;
  color: #666;
  line-height: 1.5;
  font-size: 0.95rem;
}

.notification {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 1.5rem;
  border-radius: 10px;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 90%;
  width: max-content;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notification.success {
  background-color: #10b981;
}

.notification.error {
  background-color: #ef4444;
}

/* Анимации */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.faq-move,
.faq-enter-active,
.faq-leave-active {
  transition: all 0.5s ease;
}

.faq-enter-from,
.faq-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.faq-leave-active {
  position: absolute;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: height 0.3s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  height: 0 !important;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-50%) translateY(20px);
  opacity: 0;
}
</style>
