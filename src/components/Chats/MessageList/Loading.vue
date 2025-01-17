<template>
  <div class="messages">
    <div class="message outgoing">
      <div class="message-content">
        <p class="message-text-und"></p>
      </div>
    </div>
    <div class="message outgoing">
      <div class="message-content">
        <p class="message-text-und two-mess"></p>
      </div>
    </div>
    <div class="message incoming">
      <div class="message-content">
        <p class="message-text-und"></p>
      </div>
    </div>
    <div class="message incoming">
      <div class="message-content">
        <p class="message-text-und three-mess"></p>
      </div>
    </div>
    <div class="message incoming">
      <div class="message-content">
        <p class="message-text-und three-four"></p>
      </div>
    </div>
    <div class="message outgoing">
      <div class="message-content">
        <p class="message-text-und three-mess"></p>
      </div>
    </div>
    <div class="message outgoing">
      <div class="message-content">
        <p class="message-text-und"></p>
      </div>
    </div>
    <div class="message incoming">
      <div class="message-content">
        <p class="message-text-und"></p>
      </div>
    </div>
    <div class="message incoming">
      <div class="message-content">
        <p class="message-text-und five-mess"></p>
      </div>
    </div>
    <div class="message incoming">
      <div class="message-content">
        <p class="message-text-und six-mess"></p>
      </div>
    </div>
    <div class="message outgoing">
      <div class="message-content">
        <p class="message-text-und three-mess"></p>
      </div>
    </div>
    <div class="message outgoing">
      <div class="message-content">
        <p class="message-text-und six-mess"></p>
      </div>
    </div>
    <div class="message incoming">
      <div class="message-content">
        <p class="message-text-und"></p>
      </div>
    </div>
    <div class="message outgoing">
      <div class="message-content">
        <p class="message-text-und"></p>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.messages {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 81vh;
}

.message {
  margin: 5px 15px;
  max-width: 70%; /* Максимальная ширина сообщения */
  border-radius: 10px; /* Закругление углов */
  padding: 10px;
  position: relative; /* Для абсолютного позиционирования времени */
  animation: loading 1.5s infinite;
}

.outgoing {
  align-self: flex-end; /* Выравнивание вправо для исходящих сообщений */
  background-color: #e1ffc7; /* Цвет фона для исходящих сообщений */
}

.message-text-und {
  width: 200px;
  height: 15px;
}

.two-mess {
  width: 350px;
  height: 30px;
}

.three-mess {
  width: 300px;
}

.four-mess {
  width: 250px;
}

.five-mess {
  width: 250px;
}

.six-mess {
  width: 290px;
}

.incoming {
  align-self: flex-start; /* Выравнивание влево для входящих сообщений */
  background-color: #f1f1f1; /* Цвет фона для входящих сообщений */
}

.message-content {
  display: flex;
  flex-direction: column;
}

@keyframes loading {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
