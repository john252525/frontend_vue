<template>
  <div class="container">
    <div class="sidebar">
      <ul>
        <li><a href="#">Главная</a></li>
        <li><a href="#">Аккаунты</a></li>
      </ul>
    </div>
    <div class="main-content">
      <div class="account-header">
        <div class="account-type">Аккаунты</div>
        <div class="account-selector">
          <button>Telegram</button>
          <button>Добавить</button>
        </div>
      </div>
      <table class="account-table">
        <thead>
          <tr>
            <th>Логин</th>
            <th>Шаг</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>+7 (922) 855-69-98</td>
            <td></td>
            <td><button>Действия</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import Header from "./components/Header/Header.vue";
import Navigation from "./components/Navigation/Navigation.vue";
import Accounts from "./components/Accounts/Account.vue";
</script>

<style scoped>
main {
  display: flex;
}

.container {
  display: flex;
  height: 100vh; /* Optional: use if you want it to take full viewport height */
}

.sidebar {
  width: 200px;
  background-color: #f0f0f0;
  padding: 1rem;
  box-sizing: border-box;
}

.main-content {
  flex: 1;
  padding: 1rem;
  box-sizing: border-box;
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.account-table {
  width: 100%;
  border-collapse: collapse;
}

.account-table th,
.account-table td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: left;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  /* Adjust breakpoint as needed */
  .container {
    flex-direction: column; /* Stack sidebar and main content vertically */
  }

  .sidebar {
    width: 100%; /* Sidebar takes full width */
  }

  .account-header {
    flex-direction: column; /* Stack account type and selector vertically */
  }

  .account-selector {
    margin-top: 1rem;
  }
}
</style>
