<template>
  <table>
    <thead>
      <tr>
        <th class="table-login">Логин</th>
        <th class="table-step">Шаг</th>
        <th class="table-action">Действие</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in data" :key="index">
        <td class="table-text">{{ item.login }}</td>
        <td class="table-text">{{ item.step }}</td>
        <td class="table-action-text">
          <button class="action-table-button">
            <img src="/telegramAccount/menu_table_button.svg" alt="" />Действия
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  data() {
    return {
      data: [
        { login: "+7 (922) 855-69-98", step: "" },
        { login: "+7 (922) 855-69-98", step: "" },
      ],
    };
  },
};
</script>
<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

.table-login {
  text-align: left;
  padding: 8px;
  width: 200px;
}

.table-step {
  text-align: left;
  padding: 8px;
  width: 50px;
}

.table-action {
  text-align: right;
  padding: 8px;
}

.table-text {
  padding: 8px;
}

.table-action-text {
  padding: 8px;
  text-align: right;
}

.action-table-button {
  border-radius: 5px;
  padding: 9px 11px;
  background: rgba(73, 80, 202, 0.2);
  font-weight: 600;
  font-size: 16px;
  color: #4047ca;
}

.action-table-button img {
  margin-right: 10px;
}

th,
td {
  padding: 8px;
  font-weight: 500;
  font-size: 16px;
  color: #989898;
}

td {
  font-weight: 600;
  font-size: 16px;
  color: #000;
  text-align: left;
}

thead {
  border: 1px solid #d9d9d9;
  height: 60px;
  background: #efefef;
}
.text-right {
  text-align: right;
}
</style>
