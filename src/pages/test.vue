<template>
  <div class="webhook-simulator">
    <h2>WhatsApp Webhook Simulator</h2>

    <div class="form-container">
      <div class="input-group">
        <label>Login:</label>
        <input
          v-model="login"
          type="text"
          placeholder="whatsapp_login_hellyxx"
        />
      </div>

      <div class="input-group">
        <label>Token:</label>
        <input
          v-model="token"
          type="text"
          placeholder="86e0fb94-8f1f-4bfc-9764-320214c1e2f0"
        />
      </div>

      <div class="input-group">
        <label>Source:</label>
        <select v-model="source">
          <option value="whatsapp">WhatsApp</option>
          <option value="telegram">Telegram</option>
        </select>
      </div>

      <div class="message-box">
        <label>Message Content:</label>
        <textarea
          v-model="message.text"
          placeholder="Type your message..."
        ></textarea>
      </div>

      <button @click="sendWebhook" class="send-btn">Send Webhook</button>
    </div>

    <div class="response-container" v-if="response">
      <h3>Response:</h3>
      <pre>{{ response }}</pre>
    </div>

    <div class="webhook-preview">
      <h3>Webhook Preview:</h3>
      <pre>{{ webhookPreview }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      login: "hellyxx",
      token: "86e0fb94-8f1f-4bfc-9764-320214c1e2f0",
      source: "whatsapp",
      message: {
        from: "79228556998",
        to: "79027631667",
        time: Date.now() * 1000, // microseconds
        text: "pyp",
        source: "whatsapp",
        thread: "79228556998@c.us",
        item: "3EB0288A7E193sB8s20s6Csыыыыsssыsыыыы33ыssssssssssssssssC0s8",
        outgoing: false,
        replyTo: null,
        content: [],
        hook_type: "message",
      },
      response: null,
    };
  },
  computed: {
    webhookPreview() {
      return JSON.stringify(
        {
          ...this.message,
          time: this.message.time,
          source: this.source,
          text: this.message.text || "test",
        },
        null,
        2
      );
    },
  },
  methods: {
    async sendWebhook() {
      try {
        // Добавляем query параметры
        const queryParams = new URLSearchParams({
          login: this.login,
          token: this.token,
          source: this.source,
        }).toString();

        const response = await fetch(
          `http://localhost:4000/api/webhook?${queryParams}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.message),
          }
        );

        this.response = await response.json();
      } catch (error) {
        this.response = { error: error.message };
      }
    },
  },
};
</script>

<style scoped>
.webhook-simulator {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.form-container {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.input-group input,
.input-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.message-box textarea {
  width: 100%;
  height: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.send-btn {
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.send-btn:hover {
  background-color: #45a049;
}

.response-container,
.webhook-preview {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  border: 1px solid #eee;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background: #fff;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>
