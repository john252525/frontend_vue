<template>
  <div class="payment-container">
    <h1>Отправка платежных данных</h1>

    <div class="form-group">
      <label for="url">URL для отправки:</label>
      <input
        type="text"
        id="url"
        v-model="requestUrl"
        placeholder="Введите URL для отправки запроса"
      />
    </div>

    <div class="data-section">
      <h2>Данные для отправки:</h2>
      <pre>{{ formattedRequestData }}</pre>
    </div>

    <button @click="sendRequest" :disabled="isSending">
      {{ isSending ? "Отправка..." : "Отправить запрос" }}
    </button>

    <div v-if="response" class="response-section">
      <h2>Ответ сервера:</h2>
      <pre>{{ formattedResponse }}</pre>
    </div>

    <div v-if="error" class="error-message">Ошибка: {{ error }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      requestUrl: "http://localhost:4001/webhooks/yookassa",
      isSending: false,
      response: null,
      error: null,
      requestData: {
        id: "30194a30-000f-5000-b000-1ed4f5153896",
        status: "pending",
        amount: { value: "500.00", currency: "RUB" },
        description: "Пополнение баланса (maksim.birykov.2007@mail.ru)",
        recipient: { account_id: "1132198", gateway_id: "2497163" },
        created_at: "2025-07-28T08:36:00.950Z",
        confirmation: {
          type: "redirect",
          confirmation_url:
            "https://yoomoney.ru/checkout/payments/v2/contract?orderId=30194a30-000f-5000-b000-1ed4f5153896",
        },
        test: true,
        paid: false,
        refundable: false,
        metadata: {},
      },
      notificationData: {
        type: "notification",
        event: "payment.succeeded",
        object: {
          id: "30194a30-000f-5000-b000-1ed4f5153896",
          status: "succeeded",
          amount: { value: "500.00", currency: "RUB" },
          income_amount: { value: "482.50", currency: "RUB" },
          description: "Пополнение баланса (maksim.birykov.2007@mail.ru)",
          recipient: { account_id: "1132198", gateway_id: "2497163" },
          payment_method: {
            type: "yoo_money",
            id: "30194a30-000f-5000-b000-1ed4f5153896",
            saved: false,
            status: "inactive",
            title: "YooMoney wallet 410011758831136",
            account_number: "410011758831136",
          },
          captured_at: "2025-07-28T08:36:11.586Z",
          created_at: "2025-07-28T08:36:00.950Z",
          test: true,
          refunded_amount: { value: "0.00", currency: "RUB" },
          paid: true,
          refundable: true,
          metadata: {},
        },
      },
    };
  },
  computed: {
    formattedRequestData() {
      return JSON.stringify(this.requestData, null, 2);
    },
    formattedResponse() {
      return JSON.stringify(this.response, null, 2);
    },
  },
  methods: {
    async sendRequest() {
      if (!this.requestUrl) {
        this.error = "Пожалуйста, укажите URL для отправки";
        return;
      }

      this.isSending = true;
      this.error = null;
      this.response = null;

      try {
        const response = await fetch(this.requestUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.requestData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        this.response = await response.json();
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isSending = false;
      }
    },
  },
};
</script>

<style scoped>
.payment-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.form-group {
  margin-bottom: 20px;
}

input[type="text"] {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  box-sizing: border-box;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.data-section,
.response-section {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.error-message {
  color: #d32f2f;
  margin-top: 20px;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
}
</style>
