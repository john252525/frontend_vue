<template>
  <ModalFrame
    v-if="isOpen"
    :text="{ title: 'Остались вопросы?', close: 'Отмена', action: 'Отправить' }"
    :action="handleSubmit"
    :close="close"
    :isLoading="loading"
    :isDisabled="!form.name || !form.phone || !!emailError"
  >
    <div class="feedback-body">
      <p class="subtitle">Оставьте заявку и мы свяжемся с вами</p>

      <div v-if="successMessage" class="success-msg">{{ successMessage }}</div>
      <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>

      <div class="fields">
        <input
          type="text"
          v-model="form.name"
          placeholder="Ваше имя"
          class="input-field"
          :disabled="loading"
        />
        <input
          type="tel"
          v-model="form.phone"
          placeholder="Номер телефона"
          class="input-field"
          :disabled="loading"
        />
        <div class="email-field-wrap">
          <input
            type="email"
            v-model="form.email"
            placeholder="Email (необязательно)"
            class="input-field"
            :class="{ 'input-error': emailError }"
            :disabled="loading"
            @blur="validateEmail"
            @input="emailError = ''"
          />
          <p v-if="emailError" class="email-error">{{ emailError }}</p>
        </div>
        <textarea
          v-model="form.question"
          placeholder="Ваш вопрос"
          class="textarea-field"
          :disabled="loading"
        ></textarea>
      </div>
    </div>
  </ModalFrame>
</template>

<script setup>
import { reactive, ref } from "vue";
import axios from "axios";
import { storeToRefs } from "pinia";
import { useFeedbackModalStore } from "@/stores/feedbackModalStore";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";

const feedbackModalStore = useFeedbackModalStore();
const { isOpen } = storeToRefs(feedbackModalStore);

const API_URL = `${import.meta.env.VITE_BASE_URL}`;

const loading = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const form = reactive({ name: "", phone: "", email: "", question: "" });
const emailError = ref("");

const validateEmail = () => {
  if (!form.email) { emailError.value = ""; return; }
  emailError.value = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ? ""
    : "Введите корректный email";
};

const close = () => feedbackModalStore.closeModal();

const handleSubmit = async () => {
  loading.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  try {
    await axios.post(`${API_URL}/support/sendInquiry`, {
      name: form.name,
      phone: form.phone,
      email: form.email || undefined,
      message: form.question,
      inquiry_source: "lc",
      submitted_from: "modal",
    });

    successMessage.value = "Заявка отправлена!";
    form.name = "";
    form.phone = "";
    form.email = "";
    form.question = "";
    emailError.value = "";
    setTimeout(() => {
      successMessage.value = "";
      close();
    }, 2000);
  } catch {
    errorMessage.value = "Не удалось отправить. Попробуйте позже.";
    setTimeout(() => (errorMessage.value = ""), 5000);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.feedback-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-field,
.textarea-field {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.input-field:focus,
.textarea-field:focus {
  border-color: #2563eb;
}

.textarea-field {
  min-height: 100px;
  resize: none;
}

.email-field-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-field.input-error {
  border-color: #ef4444;
}

.input-field.input-error:focus {
  border-color: #ef4444;
}

.email-error {
  margin: 0;
  font-size: 12px;
  color: #ef4444;
  padding-left: 4px;
}

.success-msg {
  background: #d1fae5;
  color: #065f46;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 14px;
  text-align: center;
}

.error-msg {
  background: #fee2e2;
  color: #dc2626;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 14px;
  text-align: center;
}
</style>
