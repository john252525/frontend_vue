<template>
  <header>
    <section class="account-section">
      <h2 class="title">Новости WhatsApi</h2>
    </section>
  </header>

  <div class="content-wrapper">
    <ArticleList />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import ArticleList from "./ArticleList.vue";
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
  gap: 12px;
}

.title {
  font-weight: 500;
  font-size: 22px;
  color: var(--text);
  flex: 1;
  margin-right: 8px;
  margin: 0;
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
  border: none;
}

.account-list-button:hover {
  background: rgba(0, 13, 255, 0.2);
}

.svg-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.25rem;
  margin-left: -0.25rem;
  fill: currentColor;
}

.add-account-button {
  background: oklch(0.541 0.198 267);
  font-weight: 600;
  font-size: 12px;
  color: #fff;
  transition: all 0.25s;
  padding: 8px 12px;
  border: none;
}

.add-account-button:hover {
  background: #565cc8;
}

.add-account-button:active {
  background: #3e43ae;
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
  background-color: #eeeeee;
  border-radius: 5px;
}

.crm-platform.active {
  background-color: #eeeeee;
  border-radius: 5px;
}

.content-wrapper {
  /* margin: 18px 12px 18px 18px; */
}

@media (max-width: 768px) {
  .crm-list {
    left: 120px;
    top: 120px;
  }

  header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .account-section {
    width: 100%;
    flex-wrap: wrap;
  }

  .account-section:first-child {
    flex-direction: column;
    align-items: flex-start;
  }

  .title {
    width: 100%;
  }

  .account-section:last-child {
    width: 100%;
  }
}
</style>
