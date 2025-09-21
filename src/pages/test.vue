<template>
  <StartModal :item="selectedItem" />
</template>

<script setup>
import StartModal from "@/components/Accounts/Accounts/ModalAccount/EnableAccount/StartModal.vue";

const selectedItem = ref({
  storage: "local",
  type: "undefined",
  login: "mizxoyjnmvsdcnq",
  source: "whatsapp",
  id: "3",
  step: { value: 5 },
  uuid: "20964f74-641c-4869-9ecf-eef76902ebe3",
  domain: "",
  subscription_dt_to: "2026-03-14 23:55:24",
  name: "политех",
});
</script>
