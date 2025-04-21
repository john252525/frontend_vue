<template>
  <div>
    <button @click="sendWebhook">Отправить вебхук</button>
    <div v-if="response">
      <h3>Ответ сервера:</h3>
      <pre>{{ response }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      response: null,
    };
  },
  methods: {
    async sendWebhook() {
      const webhookData = {
        outgoing: false,
        text: "₽",
        from: "user_id-953111621",
        to: "79228933680",
        content: [],
        item: 10165,
        thread: "user_id-953111621",
        time: 1745239909000000,
        source: "telegram",
        replyTo: null,
        hook_type: "message",
      };

      const queryParams = new URLSearchParams({
        source: "telegram",
        token: "9bddaafd-2c8d-4840-96d5-1c19c0bb4bd5",
        login: "79228933680",
      }).toString();

      try {
        const res = await fetch(
          `http://localhost:4000/api/webhook?${queryParams}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(webhookData),
          }
        );

        this.response = await res.json();
        console.log("Вебхук успешно отправлен:", this.response);
      } catch (error) {
        console.error("Ошибка при отправке вебхука:", error);
        this.response = { error: error.message };
      }
    },
  },
};
</script>
