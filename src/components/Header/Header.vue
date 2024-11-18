<template>
  <header>
    <section>
      <h2 class="logo-header">
        <img src="/header/logo.svg" alt="logo" />Name-<span>API</span>
      </h2>
      <img src="/header/user_img.svg" alt="user" />
    </section>
    <div class="line"></div>
  </header>
</template>

<script setup></script>

<style scoped>
section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1652px;
  margin-top: 15px;
  margin-bottom: 15px;
}

.logo-header {
  font-weight: 600;
  font-size: 26px;
  color: #000;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-header span {
  color: #4950ca;
}

.line {
  width: 100%;
  height: 0.5px;
  background-color: #d9d9d9;
}
</style>
