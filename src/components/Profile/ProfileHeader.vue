<template>
  <h1 class="profile-title">
    <svg class="icon" viewBox="0 0 24 24" width="18" height="18">
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM5 22v-2a7 7 0 1 1 14 0v2"/>
    </svg>
    Мой профиль
  </h1>
</template>

<script setup>
</script>

<style scoped>
.profile-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  text-align: left;
}

.icon {
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

@media (min-width: 1200px) {
  .profile-title {
    font-size: 1.7rem;
    margin-bottom: 2rem;
  }
}
</style>