<template>
  <table>
    <thead>
      <tr>
        <th class="table-login">ЛОГИН</th>
        <th class="table-step">ШАГ</th>
        <th class="table-action">ДЕЙСТВИЕ</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in data" :key="index">
        <td class="table-text-number">{{ item.login }}</td>
        <td class="table-text">{{ item.step }}</td>
        <td class="table-action-text">
          <button class="action-table-button">
            <img src="/telegramAccount/menu_table_button.svg" alt="" />Действия
          </button>
          <!-- <div class="black-fon"></div>
          <ul class="action-list">
            <li class="action">Настройки</li>
            <li class="action">Скриншот</li>
            <li class="action">Включить</li>
            <li class="action">Выключить</li>
            <li class="action">Сменить прокси</li>
            <li class="action">Связать через QR</li>
            <li class="action">Связать через код</li>
            <li class="action">Проверить код</li>
            <li class="action">Удалить аккаунт</li>
          </ul> -->
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  data() {
    return {
      data: [{ login: "+7 (922) 855-69-98", step: "" }],
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
  padding: 8px 8px 8px 20px;
  width: 200px;
}

.table-step {
  text-align: left;
  padding: 8px;
  width: 200px;
}

.table-action {
  text-align: right;
  padding: 8px;
}

.table-text-number {
  padding: 20px;
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
  font-size: 14px;
  color: #4047ca;
}

.action-table-button img {
  margin-right: 10px;
}

th,
td {
  padding: 8px;
  font-weight: 500;
  font-size: 14px;
  color: #989898;
}

td {
  font-weight: 600;
  font-size: 14px;
  color: #000;
  text-align: left;
}

tbody {
  width: 300px;
  overflow-x: auto;
  white-space: nowrap;
}

thead {
  border: 1px solid #d9d9d9;
  height: 50px;
  background: #efefef;
}
.text-right {
  text-align: right;
}

.black-fon {
  position: absolute;
  z-index: 5;
  width: 100%;
  height: 100vh;
  opacity: 20%;
  background: rgba(3, 3, 3, 0.3);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.action-list {
  border-radius: 10px;
  width: 170px;
  height: 280px;
  background: #ffffff;
  position: absolute;
  z-index: 10;
  right: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  padding-left: 20px;
}

.action {
  font-weight: 500;
  font-size: 15px;
  color: #000;
  cursor: pointer;
}
</style>
