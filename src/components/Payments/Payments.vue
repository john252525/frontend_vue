<template>
  <section class="container">
    <header>
      <h2 class="title">{{ t("depositPay.title") }}</h2>
      <button @click="changeCreatePayments" class="add-account-button">
        <svg
          class="svg-icon"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clip-rule="evenodd"
          ></path>
        </svg>
        {{ t("depositPay.button") }}
      </button>
    </header>
    <PaymentsList />
    <CreatePayments
      :changeCreatePayments="changeCreatePayments"
      v-if="createPayments || route.query.payment === 'create'"
    />
  </section>
</template>

<script setup>
import PaymentsList from "./Component/PaymentsList.vue";
import CreatePayments from "./Component/CreatePayments.vue";
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const createPayments = ref(false);
const route = useRoute();
const router = useRouter();

const changeCreatePayments = () => {
  createPayments.value = !createPayments.value;
  if (route.query.payment === "create") {
    router.push("/payments");
    createPayments.value = !createPayments.value;
  }
};
</script>

<style scoped>
.title {
  font-weight: 500;
  font-size: 22px;
  color: var(--text);
  flex: 1;
  margin-right: 8px;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 12px 18px 16px;
  box-sizing: border-box;
}

.add-account-button {
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: 0 0 auto;
}

.add-account-button {
  background: oklch(0.541 0.198 267);
  font-weight: 600;
  font-size: 12px;
  color: #fff;
  transition: all 0.25s;
  padding: 8px 12px;
}

.add-account-button:hover {
  background: #565cc8;
  transition: all 0.25s;
}

.add-account-button:active {
  background: #3e43ae;
  transition: all 0.25s;
}

.svg-icon {
  width: 1.25rem; /* 20px */
  height: 1.25rem; /* 20px */
  margin-right: 0.25rem; /* 4px */
  margin-left: -0.25rem; /* -4px */
  fill: currentColor; /* Заполнение текущим цветом */
}

@media (max-width: 768px) {
  header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
