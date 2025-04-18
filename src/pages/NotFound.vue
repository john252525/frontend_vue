<template>
  <div class="not-found">
    <h1>404 - Доступ запрещен</h1>
    <p>Данный раздел недоступен для вашего домена.</p>
    <router-link :to="defaultRoute">На главную</router-link>
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
        "`localhost`": "/settings",
      };
      return config[domain] || "/";
    },
  },
};
</script>

<style scoped>
.not-found {
  text-align: center;
  padding: 2rem;
  margin-top: 50px;
}
</style>
