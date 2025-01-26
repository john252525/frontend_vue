<template>
  <section>
    <PaymentsList />
    <CreatePayments />
  </section>
</template>

<script setup>
import PaymentsList from "./Component/PaymentsList.vue";
import CreatePayments from "./Component/CreatePayments.vue";
</script>

<style scoped>
section {
  /* width: 100%; */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
