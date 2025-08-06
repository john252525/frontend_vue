<template>
  <div class="profile-section security-section">
    <h2 class="section-title">
      <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
        <path d="M12 3a1 1 0 0 0-1 1v1h2V4a1 1 0 0 0-1-1z" />
        <path
          d="M19 9h-1V7a7 7 0 0 0-12-4.9M5 7v2H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z"
        />
      </svg>
      Безопасность
    </h2>

    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <div class="password-form">
      <div class="form-group">
        <input
          type="password"
          v-model="currentPassword"
          placeholder="Текущий пароль"
          :class="{ 'input-error': errors.currentPassword }"
          @input="clearError('currentPassword')"
        />
        <span class="error-message" v-if="errors.currentPassword">
          {{ errors.currentPassword }}
        </span>
      </div>
      <div class="form-group">
        <input
          type="password"
          v-model="newPassword"
          placeholder="Новый пароль"
          :class="{ 'input-error': errors.newPassword }"
          @input="clearError('newPassword')"
        />
        <span class="error-message" v-if="errors.newPassword">
          {{ errors.newPassword }}
        </span>
      </div>
      <button
        class="change-password-btn"
        @click="handleChangePassword"
        :disabled="isLoading"
      >
        <span v-if="!isLoading">Обновить пароль</span>
        <span v-else>Обновление...</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const currentPassword = ref("");
const newPassword = ref("");
const isLoading = ref(false);
const successMessage = ref("");

const errors = ref({
  currentPassword: "",
  newPassword: "",
});

const clearError = (field) => {
  errors.value[field] = "";
  successMessage.value = "";
};

const validate = () => {
  let isValid = true;
  errors.value = { currentPassword: "", newPassword: "" };

  if (!currentPassword.value.trim()) {
    errors.value.currentPassword = "Введите текущий пароль";
    isValid = false;
  }

  if (!newPassword.value.trim()) {
    errors.value.newPassword = "Введите новый пароль";
    isValid = false;
  } else if (newPassword.value.length < 6) {
    errors.value.newPassword = "Пароль должен быть не менее 6 символов";
    isValid = false;
  }

  return isValid;
};

const handleChangePassword = async () => {
  if (!validate()) return;

  isLoading.value = true;

  try {
    const response = await axios.post(
      "https://bapi88.developtech.ru/api/v1/auth/resetPassword",
      {
        password: currentPassword.value,
        new_password: newPassword.value,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // если используется авторизация
        },
      }
    );

    if (response.data.ok) {
      successMessage.value = "Пароль успешно изменён!";
      currentPassword.value = "";
      newPassword.value = "";
    } else {
      throw new Error(response.data.message || "Ошибка при смене пароля");
    }
  } catch (error) {
    if (error.response) {
      // Обработка ошибок от сервера
      if (error.response.status === 401) {
        errors.value.currentPassword = "Неверный текущий пароль";
      } else if (error.response.data?.message) {
        errors.value.currentPassword = error.response.data.message;
      } else {
        errors.value.currentPassword = "Произошла ошибка при смене пароля";
      }
    } else {
      errors.value.currentPassword = "Ошибка сети. Проверьте соединение.";
    }
  } finally {
    isLoading.value = false;
  }
};
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

.password-form {
  display: grid;
  gap: 0.75rem;
}

.form-group {
  position: relative;
}

.form-group input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input.input-error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.form-group input.input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.error-message {
  display: block;
  margin-top: 0.25rem;
  color: #ef4444;
  font-size: 0.8rem;
}

.success-message {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #ecfdf5;
  color: #065f46;
  border-radius: 8px;
  font-size: 0.9rem;
}

.change-password-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.6rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.25rem;
}

.change-password-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.change-password-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
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

  .password-form {
    gap: 1rem;
  }

  .form-group input,
  .change-password-btn {
    font-size: 0.95rem;
    padding: 0.7rem 0.75rem;
  }
}
</style>
