<template>
  <div class="profile-section tariff-section">
    <h2 class="section-title">
      <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
      Мой тариф
    </h2>
    <div class="tariff-badge" :class="subscription.level">
      {{ subscriptionTitle }}
    </div>
    <div class="tariff-status">
      <template v-if="subscription.active">
        <span>Действует до {{ subscription.expiresAt }}</span>
        <button class="text-btn" @click="handleCancel">Отменить</button>
      </template>
      <template v-else>
        <span>Не активен</span>
        <button class="primary-btn" @click="handleUpgrade">Выбрать</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  subscription: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['upgrade', 'cancel'])

const subscriptionTitle = computed(() => {
  return {
    'free': 'Бесплатный',
    'basic': 'Базовый',
    'premium': 'Премиум'
  }[props.subscription.level] || 'Тариф'
})

const handleUpgrade = () => {
  emit('upgrade')
}

const handleCancel = () => {
  if (confirm('Вы уверены, что хотите отменить подписку?')) {
    emit('cancel')
  }
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

.tariff-badge {
  display: inline-block;
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.tariff-badge.free {
  background: #edf2f7;
  color: #4a5568;
}

.tariff-badge.basic {
  background: #ebf8ff;
  color: #3182ce;
}

.tariff-badge.premium {
  background: #fff5f5;
  color: #e53e3e;
}

.tariff-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #718096;
}

.primary-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
}

.primary-btn:hover {
  background: #5a67d8;
}

.text-btn {
  background: none;
  color: #e53e3e;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
}

.text-btn:hover {
  background: rgba(229, 62, 62, 0.1);
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
  
  .tariff-badge {
    padding: 0.4rem 0.9rem;
    font-size: 0.95rem;
    margin-bottom: 1.25rem;
  }
  
  .tariff-status {
    font-size: 0.95rem;
  }
  
  .primary-btn,
  .text-btn {
    padding: 0.5rem 0.9rem;
    font-size: 0.95rem;
  }
}
</style>