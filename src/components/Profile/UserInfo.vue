<template>
  <div class="profile-section info-section">
    <h2 class="section-title">
      <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
      Основное
    </h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Email:</span>
        <span class="info-value">{{ email || '—' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Страна:</span>
        <span class="info-value">{{ country || '—' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Телефон:</span>
        <span class="info-value">{{ phone || '—' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  email: String,
  country: String,
  phone: String
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

.info-grid {
  display: grid;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.info-label {
  color: #718096;
  margin-right: 1rem;
}

.info-value {
  font-weight: 500;
  color: #4a5568;
  text-align: right;
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
    gap: 1rem;
  }
  
  .info-item {
    font-size: 0.95rem;
  }
}
</style>