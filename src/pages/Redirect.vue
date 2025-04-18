<template>
  <div class="redirect-container">
    <p>Перенаправление...</p>
  </div>
</template>

<script>
export default {
  name: "RedirectPage",
  created() {
    const domain = window.location.hostname;
    const routes = {
      "app1.developtech.ru": "/Accounts",
      "app2.developtech.ru": "/Accounts",
      "`localhost`": "/settings",
    };
    this.$router.replace(routes[domain] || "/Accounts");
  },
};
</script>

<style scoped>
.redirect-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
