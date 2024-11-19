<template>
  <header>
    <section>
      <article class="logo-header-cont">
        <img
          @click="phoneMenuOn"
          class="phone-menu"
          src="/header/menu_phone.svg"
          alt=""
        />
        <h2 class="logo-header">
          <img src="/header/logo.svg" alt="logo" />Name-<span>API</span>
        </h2>
      </article>
      <img src="/header/user_img.svg" alt="user" />
    </section>
    <div class="line"></div>
  </header>
</template>

<script setup>
const props = defineProps({
  phoneMenuOn: {
    type: Function,
  },
});
</script>

<style scoped>
section {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Distributes space between logo and profile */
  padding: 1rem;
  box-sizing: border-box;
}

.logo-header-cont {
  display: flex;
  align-items: center;
  gap: 20px;
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

.phone-menu {
  display: none;
}
@media (max-width: 1024px) {
  .phone-menu {
    display: block;
  }
}
</style>
