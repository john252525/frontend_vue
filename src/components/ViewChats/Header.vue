<template>
  <header>
    <section class="account-section">
      <h2 class="title">Ваши чаты</h2>
    </section>
    <section class="account-section">
      <List />
    </section>
  </header>
</template>

<script setup>
import List from "./List.vue";
</script>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 18px 12px 18px 18px;
  box-sizing: border-box;
}

.account-section {
  display: flex;
  align-items: center;
}

.title {
  font-weight: 500;
  font-size: 22px;
  color: var(--text);
  flex: 1;
  margin-right: 8px;
}

.account {
  font-weight: 700;
  font-size: 18px;
  color: var(--headerAccountText);
  background: var(--headerAccount);
  border-radius: 5px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.account-list-button,
.add-account-button {
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: 0 0 auto;
}

.bi-view-list {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}

.account-list-button {
  background: oklch(0.65 0.22 267 / 0.16);
  font-weight: 600;
  font-size: 12px;
  padding: 10px 12px;
  color: var(--headerAccountButtonColor);
  margin-right: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.25s;
}

.account-list-button:hover {
  background: rgba(0, 13, 255, 0.2);
  transition: all 0.25s;
}

.account-list-button:active {
  background: rgba(17, 21, 93, 0.2);
  transition: all 0.25s;
}

.svg-icon {
  width: 1.25rem; /* 20px */
  height: 1.25rem; /* 20px */
  margin-right: 0.25rem; /* 4px */
  margin-left: -0.25rem; /* -4px */
  fill: currentColor; /* Заполнение текущим цветом */
}

.add-account-button {
  background: oklch(0.541 0.198 267);
  font-weight: 600;
  font-size: 12px;
  color: #fff;
  transition: all 0.25s;
  padding: 8px 12px;
}

.crm-platform-cont {
  font-weight: 700;
  font-size: 12px;
  color: var(--headerAccountText);
  background: var(--headerAccount);
  border-radius: 5px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.add-account-button:hover {
  background: #565cc8;
  transition: all 0.25s;
}

.add-account-button:active {
  background: #3e43ae;
  transition: all 0.25s;
}

.black-fon {
  position: absolute;
  z-index: 5;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.platform-list-telegram {
  position: absolute;
  z-index: 10;
  right: 122px;
  top: 120px;
  border-radius: 10px;
  width: 100px;
  height: 100px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
}

.crm-list {
  position: absolute;
  z-index: 10;
  left: 350px;
  top: 120px;
  border-radius: 10px;
  width: 108px;
  height: 100px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
}

.platform-list-whatsapp {
  position: absolute;
  z-index: 10;
  right: 122px;
  top: 120px;
  border-radius: 10px;
  width: 108px;
  height: 100px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
}

.platform-list-telegram .fade-enter-active,
.platform-list-telegram .fade-leave-active {
  transition: opacity 0.5s ease;
}
.platform-list-telegram .fade-enter,
.platform-list-telegram .fade-leave-to {
  opacity: 0;
}

.platform-list-telegram {
  animation: fadeIn 0.5s forwards;
}

.platform-list-whatsapp.fade-enter-active,
.platform-list-whatsapp.fade-leave-active {
  transition: opacity 0.5s ease;
}
.platform-list-whatsapp.fade-enter,
.platform-list-whatsapp.fade-leave-to {
  opacity: 0;
}

.platform-list-whatsapp {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    /* transform: translateY(5px); */
  }
  to {
    opacity: 1;
    /* transform: translateY(0); */
  }
}

.platform {
  padding: 4px;
  transition: all 0.1s;
  cursor: pointer;
  font-size: 14px;
}

.crm-platform {
  padding: 4px;
  transition: all 0.1s;
  cursor: pointer;
  font-size: 14px;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.crm-platform:hover {
  text-align: center;
  width: 80px;
  background-color: #eeeeee;
  border-radius: 5px;
  transition: all 0.2s;
}

.crm-platform.active {
  text-align: center;
  width: 80px;
  background-color: #eeeeee;
  border-radius: 5px;
  transition: all 0.2s;
}

.platform:hover {
  text-align: center;
  width: 80px;
  background-color: #eeeeee;
  border-radius: 5px;
  transition: all 0.2s;
}

.platform.active {
  text-align: center;
  width: 80px;
  background-color: #eeeeee;
  border-radius: 5px;
  transition: all 0.2s;
}

@media (max-width: 768px) {
  .crm-list {
    left: 120px;
    top: 120px;
  }
  .account {
    display: none;
  }

  header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .platform-list {
    left: 20px;
    top: 180px;
  }

  .platform-list-telegram {
    left: 17px;
    top: 160px;
  }

  .platform-list-whatsapp {
    left: 16px;
    top: 160px;
  }
}
</style>
