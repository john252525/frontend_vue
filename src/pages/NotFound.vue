<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="title">404</h1>
      <p class="subtitle">Страница не найдена</p>
      <router-link :to="defaultRoute" class="back-link">На главную</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotFoundPage",
  computed: {
    defaultRoute() {
      const domain = window.location.hostname;
      const config = {
        "app1.developtech.ru": "/Accounts",
        "app2.developtech.ru": "/Accounts",
        "app4.developtech.ru": "/settings",
        localhost: "/Accounts",
      };
      return config[domain] || "/";
    },
  },
};
</script>

<style scoped>
.not-found-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.not-found-content {
  text-align: center;
  width: 100%;
  padding: 40px;
  border-radius: 12px;
}

.title {
  font-size: 100px;
  font-weight: 600;
  margin: 0;
  color: rgb(118, 133, 246);
}

.subtitle {
  font-size: 24px;
  margin: 10px 0 30px;
  color: var(--text-color);
}

.back-link {
  display: inline-block;
  padding: 8px 12px;
  color: rgb(255, 255, 255);
  background-color: rgb(118, 133, 246);
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background 0.3s ease;
}

.back-link:hover {
}

/* Адаптация для мобильных устройств */
@media (max-width: 768px) {
  .not-found-container {
    margin-left: 0;
    padding: 20px;
  }

  .title {
    font-size: 72px;
  }

  .subtitle {
    font-size: 20px;
  }
}
</style>
