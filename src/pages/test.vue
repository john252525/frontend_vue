<template>
  <div class="frontend-logger">
    <h1>Frontend Logger</h1>

    <label for="location">Location:</label>
    <input
      type="text"
      id="location"
      v-model="location"
      placeholder="Component Name"
    />

    <label for="method">Method:</label>
    <input
      type="text"
      id="method"
      v-model="method"
      placeholder="Function Name"
    />

    <label for="params">Params (JSON):</label>
    <textarea
      id="params"
      v-model="params"
      placeholder='{"key": "value"}'
    ></textarea>

    <label for="results">Results (JSON):</label>
    <textarea
      id="results"
      v-model="results"
      placeholder='{"success": true}'
    ></textarea>

    <label for="answer">Answer:</label>
    <input
      type="text"
      id="answer"
      v-model="answer"
      placeholder="User created successfully"
    />

    <button @click="handleSendLog" :disabled="isLoading">
      <span v-if="isLoading">Sending...</span>
      <span v-else>Send Log</span>
    </button>

    <div v-if="message" class="message">{{ message }}</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import useFrontendLogger from "@/composables/useFrontendLogger";

const location = ref("");
const method = ref("");
const params = ref("");
const results = ref("");
const answer = ref("");

const { message, error, isLoading, sendLog } = useFrontendLogger();

const handleSendLog = async () => {
  try {
    const parsedParams = params.value ? JSON.parse(params.value) : {};
    const parsedResults = results.value ? JSON.parse(results.value) : {};

    await sendLog(
      location.value,
      method.value,
      parsedParams,
      parsedResults,
      answer.value
    );
  } catch (err) {
    console.error("Ошибка при парсинге JSON:", err);
    // Optionally, update the error message ref
  }
};
</script>

<style scoped>
.frontend-logger {
  font-family: sans-serif;
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input,
textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.message {
  color: green;
  margin-top: 10px;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
