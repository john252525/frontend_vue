<template>
  <div class="alert-manager">
    <SubscriptionWarningModal
      v-if="showWarning && !subscriptionStatus.active"
      @buy-subscription="changeShowGuide"
      @later="closeWarning"
      :message="subscriptionStatus.message"
    />

    <SubscriptionGuide v-if="showGuide" @close="showGuide = false" />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import SubscriptionWarningModal from "./Components/SubscriptionWarningModal.vue";
import SubscriptionGuide from "./Components/SubscriptionGuide.vue";

const props = defineProps({
  subscriptionStatus: {
    type: Object,
    default: () => ({
      active: false,
      message: "",
    }),
  },
});

const changeShowGuide = () => {
  showGuide.value = !showGuide.value;
  showWarning.value = false;
};

const showWarning = ref(false);
const showGuide = ref(false);

// Отслеживаем изменения статуса подписки
watch(
  () => props.subscriptionStatus,
  (newStatus) => {
    if (!newStatus.active && newStatus.message) {
      showWarning.value = true;
    }
  },
  { immediate: true }
);

const closeWarning = () => {
  showWarning.value = false;
};
</script>

<style scoped>
.alert-manager {
  position: relative;
}
</style>
