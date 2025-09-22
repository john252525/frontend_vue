<template>
  <SuccessEnableModal v-if="success" />
  <ErrorEnableModal :typeError="typeError" v-if="error" />
</template>

<script setup>
import SuccessEnableModal from "./Components/SuccessEnableModal.vue";
import ErrorEnableModal from "./Components/ErrorEnableModal.vue";

const props = defineProps({
  error: {
    type: Boolean,
  },
  success: {
    type: Boolean,
  },
  typeError: {
    type: String,
  },
});
</script>

<style scoped></style>
