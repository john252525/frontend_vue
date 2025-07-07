<template>
  <div class="redirect-container">
    <p>Перенаправление...</p>
  </div>
</template>

<script>
export default {
  name: "RedirectPage",
  created() {
    try {
      console.log("[Redirect.vue] Компонент создан");
      const domain = window.location.hostname;
      const currentRoute = this.$route.name;
      const queryParams = this.$route.query;
      const fullPath = this.$route.fullPath;

      console.log("[Redirect.vue] Домен:", domain);
      console.log("[Redirect.vue] Текущий маршрут:", currentRoute);
      console.log("[Redirect.vue] Query параметры:", queryParams);
      console.log("[Redirect.vue] Полный путь:", fullPath);

      // Пропускаем VerifyEmail и ResetPassword
      if (["VerifyEmail", "ResetPassword"].includes(currentRoute)) {
        console.log(`[Redirect.vue] Остаемся на ${currentRoute}`);
        return;
      }

      // Маршруты для перенаправления по доменам
      const routes = {
        "app1.developtech.ru": "/Accounts",
        "app2.developtech.ru": "/Accounts",
        localhost: "/settings",
      };

      // Перенаправляем на маршрут, соответствующему домену, или на /Accounts
      const redirectRoute = routes[domain] || "/Accounts";
      console.log(`[Redirect.vue] Перенаправляем на: ${redirectRoute}`);
      this.$router.replace(redirectRoute);
    } catch (error) {
      console.error("[Redirect.vue] Ошибка:", error);
    }
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
