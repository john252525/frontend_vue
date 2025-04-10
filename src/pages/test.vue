<template>
  <div class="register-form">
    <h2>Тест регистрации</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">Логин:</label>
        <input
          v-model="form.username"
          type="text"
          id="username"
          required
          placeholder="Придумайте логин"
        />
      </div>

      <div class="form-group">
        <label for="password">Пароль:</label>
        <input
          v-model="form.password"
          type="password"
          id="password"
          required
          placeholder="Не менее 6 символов"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? "Отправка..." : "Зарегистрироваться" }}
      </button>

      <div v-if="message" :class="['message', isError ? 'error' : 'success']">
        {{ message }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";

const form = ref({
  username: "",
  password: "",
});

const loading = ref(false);
const message = ref("");
const isError = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  message.value = "";
  isError.value = false;

  try {
    const response = await fetch("http://be-auth.developtech.ru/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form.value),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Ошибка регистрации");
    }

    message.value = data.message || "Успешная регистрация!";
    form.value = { username: "", password: "" }; // Очищаем форму
  } catch (err) {
    isError.value = true;
    message.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-form {
  max-width: 400px;
  margin: 2rem auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  background-color: #42b983;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.message {
  margin-top: 1rem;
  padding: 10px;
  border-radius: 4px;
}

.error {
  background-color: #ffebee;
  color: #f44336;
}

.success {
  background-color: #e8f5e9;
  color: #4caf50;
}
</style>
