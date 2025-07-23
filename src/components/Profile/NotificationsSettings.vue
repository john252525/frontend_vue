<template>
  <div class="profile-section notifications-section">
    <h2 class="section-title">
      <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.7 20a1.9 1.9 0 0 1-3.4 0"/>
      </svg>
      Уведомления
    </h2>
    <div class="notifications-settings">
      <label class="switch-item">
        <span>Email</span>
        <input type="checkbox" v-model="email" hidden>
        <span class="switch-toggle"></span>
      </label>
      <label class="switch-item">
        <span>SMS</span>
        <input type="checkbox" v-model="sms" hidden>
        <span class="switch-toggle"></span>
      </label>
      <label class="switch-item">
        <span>Push</span>
        <input type="checkbox" v-model="push" hidden>
        <span class="switch-toggle"></span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const email = ref(true)
const sms = ref(false)
const push = ref(true)

const emit = defineEmits(['updateNotifications'])

watch([email, sms, push], () => {
  emit('updateNotifications', {
    email: email.value,
    sms: sms.value,
    push: push.value
  })
})
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

.notifications-settings {
  display: grid;
  gap: 0.75rem;
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  cursor: pointer;
}

.switch-toggle {
  position: relative;
  width: 40px;
  height: 22px;
  background: #e2e8f0;
  border-radius: 11px;
  transition: all 0.2s;
}

.switch-toggle:after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: all 0.2s;
}

input:checked + .switch-toggle {
  background: #667eea;
}

input:checked + .switch-toggle:after {
  left: calc(100% - 20px);
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
  
  .notifications-settings {
    gap: 1rem;
  }
  
  .switch-item {
    font-size: 0.95rem;
  }
}
</style>