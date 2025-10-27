<template>
  <button @click="getAllAccount">Аккаунты</button>
  <span>{{ account }}</span>
</template>

<script setup>
import { computed, ref } from "vue";
import { useAccountStore } from "@/stores/accountStore";

const props = defineProps({
  close: {
    type: Function,
  },
  selectedItem: {
    type: Object,
  },
  getAllAccounts: {
    type: Function,
  },
});

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const account = ref("");

function getAllAccount() {
  account.value = props.getAllAccounts();
}
</script>

<style scoped></style>
