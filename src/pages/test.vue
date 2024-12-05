<template>
  <div class="container">
    <aside class="aside-menu">
      <!-- Содержимое вашего aside меню -->
    </aside>
    <div class="line"></div>
    <div class="account-list">
      <!-- Список аккаунтов с возможным скроллом -->
      <div>Аккаунт 1</div>
      <div>Аккаунт 2</div>
      <div>Аккаунт 3</div>
      <div>Аккаунт 4</div>
      <div>Аккаунт 5</div>
      <div>Аккаунт 6</div>
      <div>Аккаунт 7</div>
      <div>Аккаунт 8</div>
      <div>Аккаунт 9</div>
      <div>Аккаунт 10</div>
      <div>Аккаунт 1</div>
      <div>Аккаунт 2</div>
      <div>Аккаунт 3</div>
      <div>Аккаунт 4</div>
      <div>Аккаунт 5</div>
      <div>Аккаунт 6</div>
      <div>Аккаунт 7</div>
      <div>Аккаунт 8</div>
      <div>Аккаунт 9</div>
      <div>Аккаунт 10</div>
      <div>Аккаунт 1</div>
      <div>Аккаунт 2</div>
      <div>Аккаунт 3</div>
      <div>Аккаунт 4</div>
      <div>Аккаунт 5</div>
      <div>Аккаунт 6</div>
      <div>Аккаунт 7</div>
      <div>Аккаунт 8</div>
      <div>Аккаунт 9</div>
      <div>Аккаунт 10</div>
      <div>Аккаунт 1</div>
      <div>Аккаунт 2</div>
      <div>Аккаунт 3</div>
      <div>Аккаунт 4</div>
      <div>Аккаунт 5</div>
      <div>Аккаунт 6</div>
      <div>Аккаунт 7</div>
      <div>Аккаунт 8</div>
      <div>Аккаунт 9</div>
      <div>Аккаунт 10</div>
      <div>Аккаунт 1</div>
      <div>Аккаунт 2</div>
      <div>Аккаунт 3</div>
      <div>Аккаунт 4</div>
      <div>Аккаунт 5</div>
      <div>Аккаунт 6</div>
      <div>Аккаунт 7</div>
      <div>Аккаунт 8</div>
      <div>Аккаунт 9</div>
      <div>Аккаунт 10</div>
      <div>Аккаунт 1</div>
      <div>Аккаунт 2</div>
      <div>Аккаунт 3</div>
      <div>Аккаунт 4</div>
      <div>Аккаунт 5</div>
      <div>Аккаунт 6</div>
      <div>Аккаунт 7</div>
      <div>Аккаунт 8</div>
      <div>Аккаунт 9</div>
      <div>Аккаунт 10</div>
      <div>Аккаунт 1</div>
      <div>Аккаунт 2</div>
      <div>Аккаунт 3</div>
      <div>Аккаунт 4</div>
      <div>Аккаунт 5</div>
      <div>Аккаунт 6</div>
      <div>Аккаунт 7</div>
      <div>Аккаунт 8</div>
      <div>Аккаунт 9</div>
      <div>Аккаунт 10</div>
      <div>Аккаунт 1</div>
      <div>Аккаунт 2</div>
      <div>Аккаунт 3</div>
      <div>Аккаунт 4</div>
      <div>Аккаунт 5</div>
      <div>Аккаунт 6</div>
      <div>Аккаунт 7</div>
      <div>Аккаунт 8</div>
      <div>Аккаунт 9</div>
      <div>Аккаунт 10</div>
      <div>Аккаунт 1</div>
      <div>Аккаунт 2</div>
      <div>Аккаунт 3</div>
      <div>Аккаунт 4</div>
      <div>Аккаунт 5</div>
      <div>Аккаунт 6</div>
      <div>Аккаунт 7</div>
      <div>Аккаунт 8</div>
      <div>Аккаунт 9</div>
      <div>Аккаунт 10</div>
      <!-- Добавьте больше аккаунтов для тестирования скролла -->
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex; /* Убедитесь, что контейнер для aside и списка является flex-контейнером */
  height: 100vh; /* Устанавливаем высоту контейнера на весь экран */
  position: relative; /* Позволяет абсолютному позиционированию дочерних элементов */
}

.aside-menu {
  width: 260px; /* Ширина вашего aside меню */
  /* Другие стили для aside-menu */
}

.account-list {
  flex-grow: 1; /* Позволяет списку занимать оставшееся пространство */
  overflow-y: auto; /* Позволяет вертикальный скролл */
  padding: 20px; /* Добавьте отступы, если нужно */
}

.line {
  width: 0.5px;
  background-color: #d9d9d9;
  position: absolute;
  top: 72px; /* Высота вашего header */
  bottom: 0; /* Устанавливаем линию до самого низа */
  left: 260px; /* Позиционируем линию на нужном расстоянии от левой стороны */
}
</style>

<script></script>
