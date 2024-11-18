<template>
  <aside>
    <nav>
      <ul>
        <li>
          <img src="/navigation/home.svg" alt="home" />
          <p class="page">Главная</p>
        </li>
        <li>
          <img src="/navigation/accaunts.svg" alt="accaunts" />
          <p class="page">Аккаунты</p>
        </li>
      </ul>
    </nav>
    <div class="line"></div>
  </aside>
</template>

<script setup></script>

<style scoped>
aside {
  display: flex;
  width: 260px;
}

nav {
  margin-top: 20px;
  margin-left: 8px;
}

.line {
  width: 0.5px;
  height: 100vh;
  background-color: #d9d9d9;
  margin-left: 260px;
  position: absolute;
}

li {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  padding: 10px 0px 10px 10px;
  cursor: pointer;
}

.page {
  font-weight: 400;
  font-size: 20px;
  color: #000;
}

li:hover {
  background-color: #eeeeee;
  border-radius: 10px;
  width: 233px;
}
</style>
