<template>
  <section class="send-message">
    <img class="file-img" src="/chats/file.svg" alt="" />
    <div class="img-cont">
      <article class="smile-img-cont">
        <input
          class="send-message-input"
          placeholder="Введите сообщение"
          type="text"
        />
        <img class="smile-img" src="/chats/smile.svg" alt="" />
      </article>
      <img class="send-img" src="/chats/send.svg" alt="" />
    </div>
  </section>
</template>

<script setup></script>

<style scoped>
.send-message {
  width: 100%;
  background-color: #f5f5f5;
  height: 7.8vh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 11px;
}

.img-cont {
  display: flex;
  align-items: center;
  gap: 14px;
}

.smile-img-cont {
  position: relative;
}

.file-img,
.smile-img,
.send-img {
  cursor: pointer;
}

.smile-img {
  position: absolute;
  top: 11px;
  right: 12px;
}

.send-message-input {
  border-radius: 233px;
  width: 1050px;
  height: 36px;
  /* background: #dfdfdf; */
  border: 1px solid #d4d4d4;
  padding-left: 10px;
}
</style>
