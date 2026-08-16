<template>
  <div class="profile-section links-section">
    <h2 class="section-title">
      <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
      Дополнительно
    </h2>

    <div class="links-list">
      <router-link :to="{ name: 'Mailing' }" class="link-item">
        <span class="link-icon">
          <svg viewBox="0 0 28 20" fill="none">
            <path d="M20.9 18.9V16.9c0-1.06-.42-2.08-1.17-2.83A4 4 0 0 0 16.9 12.9h-6c-1.06 0-2.08.42-2.83 1.17A4 4 0 0 0 6.9 16.9v2M20.9 1.03a4 4 0 0 1 2.16 1.42 4 4 0 0 1 0 4.9 4 4 0 0 1-2.16 1.42M26.9 18.9v-2a4 4 0 0 0-2.94-3.87" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.9 18.77v-2c0-1.06.42-2.08 1.17-2.83a4 4 0 0 1 2.83-1.17h6a4 4 0 0 1 2.83 1.17 4 4 0 0 1 1.17 2.83v2M6.9.9a4 4 0 0 0-3.16 3.87 4 4 0 0 0 3.16 3.87M.9 18.77v-2a4 4 0 0 1 3-3.87" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.9 8.9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="link-text">Рассылки</span>
        <svg class="chevron" viewBox="0 0 24 24" width="16" height="16">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </router-link>

      <router-link :to="{ name: 'Referrals' }" class="link-item">
        <span class="link-icon">
          <svg viewBox="0 0 20 21" fill="none">
            <path d="M1.75 9.75v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9.75 4.25a3 3 0 0 0-3-3 2.25 2.25 0 0 0 0 4.5h3m0-1.5v1.5m0-1.5a3 3 0 0 1 3-3 2.25 2.25 0 0 1 0 4.5h-3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M9.75 9.75v10M.75 5.75h18v4H.75v-4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="link-text">Рефералы</span>
        <svg class="chevron" viewBox="0 0 24 24" width="16" height="16">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </router-link>

      <router-link :to="{ name: 'payments' }" class="link-item">
        <span class="link-icon">
          <svg viewBox="0 0 22 18" fill="none">
            <path d="M.75 8.75c0-3.77 0-5.66 1.17-6.83S4.98.75 8.75.75h4c3.77 0 5.66 0 6.83 1.17s1.17 3.06 1.17 6.83-.83 4.66-1.17 6.83c-1.17 1.17-3.06 1.17-6.83 1.17h-4c-3.77 0-5.66 0-6.83-1.17S.75 12.52.75 8.75Z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8.75 12.75h-4m8 0h-1.5M.75 6.75h20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="link-text">Оплаты</span>
        <svg class="chevron" viewBox="0 0 24 24" width="16" height="16">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.profile-section {
  background: var(--bg);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--line);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--text);
}

.icon {
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--line);
  text-decoration: none;
  color: var(--text);
  transition: all 0.2s;
}

.link-item:hover {
  background: rgba(var(--primary-rgb), 0.05);
  border-color: rgba(var(--primary-rgb), 0.3);
}

.link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: var(--primary);
}

.link-icon svg {
  width: 18px;
  height: 18px;
}

.link-text {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 500;
}

.chevron {
  stroke: var(--headerAccountText);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  flex-shrink: 0;
}

@media (min-width: 1200px) {
  .profile-section {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .section-title {
    font-size: 1.15rem;
    margin-bottom: 1.25rem;
  }

  .link-item {
    padding: 0.875rem 1rem;
  }
}
</style>
