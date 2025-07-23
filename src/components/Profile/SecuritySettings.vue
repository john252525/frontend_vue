<template>
  <div class="profile-section security-section">
    <h2 class="section-title">
      <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
        <path d="M12 3a1 1 0 0 0-1 1v1h2V4a1 1 0 0 0-1-1z"/>
        <path d="M19 9h-1V7a7 7 0 0 0-12-4.9M5 7v2H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z"/>
      </svg>
      Безопасность
    </h2>
    <div class="password-form">
      <div class="form-group">
        <input 
          type="password" 
          v-model="currentPassword"
          placeholder="Текущий пароль"
        >
      </div>
      <div class="form-group">
        <input 
          type="password" 
          v-model="newPassword"
          placeholder="Новый пароль"
        >
      </div>
      <button class="change-password-btn" @click="handleChangePassword">
        Обновить пароль
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentPassword = ref('')
const newPassword = ref('')

const emit = defineEmits(['changePassword'])

const handleChangePassword = () => {
  if (!currentPassword.value || !newPassword.value) {
    alert('Заполните все поля')
    return
  }
  emit('changePassword', {
    current: currentPassword.value,
    new: newPassword.value
  })
  currentPassword.value = ''
  newPassword.value = ''
}
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

.form-group input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
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
  transition: background 0.2s;
  margin-top: 0.25rem;
}

.change-password-btn:hover {
  background: #5a67d8;
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