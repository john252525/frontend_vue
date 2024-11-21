<template>
  <Header :phoneMenuOn="phoneMenuOn" />
  <div class="page-container">
    <Navigation
      :phoneMenuStation="phoneMenuStation"
      :phoneMenuOn="phoneMenuOn"
      class="navigation"
    />
    <main>
      <section>
        <Accounts />
      </section>
    </main>
  </div>
</template>

<script setup>
import Header from "../components/Header/Header.vue";
import Navigation from "../components/Navigation/Navigation.vue";
import Accounts from "../components/Accounts/Account.vue";
import { reactive, ref } from "vue";

const phoneMenuStation = ref(false);

function phoneMenuOn() {
  phoneMenuStation.value = !phoneMenuStation.value;
}
</script>

<style scoped>
main {
  flex: 1;
  box-sizing: border-box;
}

.page-container {
  display: flex;
}

.navigation {
  width: 260px;
}
</style>
