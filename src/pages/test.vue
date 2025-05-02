<template>
  <div>
    <button @click="updateNginxConfig">Обновить конфиг Nginx</button>
    <div v-if="loading">Обновление конфигурации...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">Конфигурация успешно обновлена!</div>
    <pre>Отправляемые данные:\n{{ JSON.stringify(configData, null, 2) }}</pre>
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";

export default {
  setup() {
    const configData = ref({
      app_type: "backend",
      server: "helly",
      domains: [
        "api22.developtech.ru",
        "api28.developtech.ru",
        "be-auth.developtech.ru",
      ],
      dirs: ["/var/www/be_pay", "/var/www/be_chat", "/var/www/be_auth back"],
      ports: [3000, 4000, 3001],
    });

    const loading = ref(false);
    const error = ref(null);
    const success = ref(false);

    const updateNginxConfig = async () => {
      loading.value = true;
      error.value = null;
      success.value = false;

      try {
        const response = await axios.put(
          "https://anservice.apitter.com/nginxconf",
          configData.value,
          {
            headers: {
              "X-Api-Key": "aaa",
              "Content-Type": "application/json",
            },
          }
        );

        success.value = true;
        console.log("Конфигурация обновлена:", response.data);
      } catch (err) {
        error.value = err.response?.data?.message || err.message;
      } finally {
        loading.value = false;
      }
    };

    return {
      updateNginxConfig,
      configData,
      loading,
      error,
      success,
    };
  },
};
</script>

<style scoped>
.error {
  color: red;
}
.success {
  color: green;
}
pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  margin-top: 10px;
}
button {
  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background: #3aa876;
}
</style>
