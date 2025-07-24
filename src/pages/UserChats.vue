<template>
  <div class="layout">
    <div class="content">
      <iframe :src="chatUrl" frameborder="0" class="chat-iframe"></iframe>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showChat: false,
      chatUrl:
        "https://chat.touch-api.com?satkn=bd7c925a-1ad6-48a2-ad53-d55f7148e62a",
    };
  },
  methods: {
    openChat() {
      this.showChat = true;
    },
  },
};
</script>

<style>
.layout {
  display: flex;
  height: 100vh;
}

.side-menu {
  width: 250px;
}

.content {
  flex-grow: 1;
}

.chat-iframe {
  width: 100%;
  height: 100%;
}
</style>
