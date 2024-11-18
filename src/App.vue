<template>
  <Header />
  <main>
    <Navigation />
    <section>
      <Accounts />
    </section>
  </main>
</template>

<script setup>
import Header from "./components/Header/Header.vue";
import Navigation from "./components/Navigation/Navigation.vue";
import Accounts from "./components/Accounts/account.vue";
</script>

<style scoped>
main {
  display: flex;
}
</style>
