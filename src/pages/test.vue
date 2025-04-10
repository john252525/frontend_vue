<template>
  <div class="webhook-sender">
    <h2>Отправить тестовый вебхук WhatsApp</h2>
    <div class="webhook-form">
      <div class="form-row">
        <div class="form-group">
          <label>Login:</label>
          <input v-model="queryParams.login" type="text" placeholder="helly" />
        </div>
        
        <div class="form-group">
          <label>Token:</label>
          <input v-model="queryParams.token" type="text" placeholder="563df5vs" />
        </div>

        <div class="form-group">
          <label>Source:</label>
          <input v-model="queryParams.source" type="text" placeholder="whatsapp" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>From:</label>
          <input v-model="webhookData.from" type="text" placeholder="79228556998" />
        </div>
        
        <div class="form-group">
          <label>To:</label>
          <input v-model="webhookData.to" type="text" placeholder="79198670001" />
        </div>
      </div>

   

      </div>

      <button @click="sendWebhook" class="send-button">
        Отправить вебхук
      </button>
    </div>

    <div class="response-log">
      <h3>Лог запросов и ответов:</h3>
      <div class="log-section">
        <h4>Параметры запроса (query):</h4>
        <pre>{{ queryParams }}</pre>
      </div>
      <div class="log-section">
        <h4>Тело запроса (body):</h4>
        <pre>{{ webhookData }}</pre>
      </div>
      <div class="log-section">
        <h4>Ответ сервера:</h4>
        <pre>{{ responseLog }}</pre>
      </div>
    </div>
  
</template>

<script setup>
import { ref } from 'vue';

const queryParams = ref({
  login: "helly",
  token: "9bddaafd-2c8d-4840-96d5-1c19c0bb4bd5",
  source: "whatsapp"
});

const webhookData = ref({
  from: "79228556998",
  to: "79198670001",
  time: Date.now() * 1000,
  text: 'Градучи',
  source: "whatsapp",
  thread: "79198670001@c.us",
  item: "TEST" + Math.random().toString(36).substring(2, 10).toUpperCase(),
  outgoing: true,
  replyTo: null,
  content: [
   
  ],
  hook_type: "message"
});

const responseLog = ref('Ожидание отправки запроса...');

const sendWebhook = async () => {
  // Обновляем данные перед отправкой
  webhookData.value.time = Date.now() * 1000;
  webhookData.value.item = "TEST" + Math.random().toString(36).substring(2, 10).toUpperCase();
  webhookData.value.thread = `${webhookData.value.to}@c.us`;
  
  // Формируем URL с query-параметрами
  const queryString = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams.value)) {
    queryString.append(key, value);
  }
  
  const url = `http://localhost:4000/api/webhook?${queryString}`;

  try {
    responseLog.value = 'Отправка запроса на: ' + url;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData.value)
    });

    const data = await response.json();
    
    responseLog.value = `Ответ сервера (${response.status} ${response.statusText}):\n` + 
      JSON.stringify(data, null, 2);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    responseLog.value = 'Ошибка при отправке запроса:\n' + error.message;
    console.error('Ошибка:', error);
  }
};
</script>

<style scoped>
.webhook-sender {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h2 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 20px;
}

.webhook-form {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 10px;
  margin-bottom: 25px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
}

.form-group.url-input {
  flex: 2;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #495057;
}

input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

input:focus, select:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

.send-button {
  background-color: #28a745;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 15px;
  width: 100%;
  transition: background-color 0.3s;
}

.send-button:hover {
  background-color: #218838;
}

.response-log {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.log-section {
  margin-bottom: 20px;
}

h3, h4 {
  color: #2c3e50;
  margin-top: 0;
}

pre {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  margin: 10px 0 0;
}
</style>