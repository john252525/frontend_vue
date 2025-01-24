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
  display: flex;
  align-items: center;
}
</style>
