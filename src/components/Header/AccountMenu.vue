<template>
  <div @click="AccountMenuStationOn" class="black-fon"></div>
  <section class="account-menu-section">
    <h2 class="email-user">{{ storedData }}</h2>
    <div class="line"></div>
    <h2 class="out-account-button" @click="leaveAccount">
      {{ t("personalAccount.out") }}
    </h2>
  </section>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const props = defineProps({
  AccountMenuStationOn: {
    type: Function,
  },
});

const storedData = localStorage.getItem("accountData");

const leaveAccount = () => {
  localStorage.removeItem("accountToken");
  location.reload();
};
</script>

<style scoped>
.account-menu-section {
  position: absolute;
  z-index: 10;
  right: 0;
  top: 65px;
  border-radius: 5px 0 0 5px;
  width: 260px;
  background: var(--bg);
  padding: 12px 0;
}

.account-menu-section,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.account-menu-section,
.fade-leave-to {
  opacity: 0;
}

.account-menu-section {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.line {
  background-color: var(--line);
  height: 1px;
  margin: 12px 0 16px;
}

.email-user {
  font-weight: 600;
  font-size: 18px;
  color: var(--text);
  text-align: center;
}

.out-account-button {
  font-weight: 500;
  font-size: 18px;
  color: var(--text);
  margin-left: 35px;
  cursor: pointer;
  transition: color 0.15s;
}

.out-account-button:hover {
  color: #b64040;
}

@media (max-width: 1000px) {
  .account-menu-section {
    width: 200px;
    background: #fff;
    padding: 12px 0;
    border-radius: 10px 0 0 10px;
  }

  .email-user {
    font-size: 16px;
  }

  .out-account-button {
    font-size: 16px;
    margin-left: 20px;
  }
}
</style>
