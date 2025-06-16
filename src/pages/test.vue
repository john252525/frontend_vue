<template>
  <div class="midjourney-generator">
    <h2>Midjourney Image Generator</h2>

    <div class="input-section">
      <textarea
        v-model="prompt"
        placeholder="Введите описание изображения..."
        rows="5"
      ></textarea>

      <div class="options">
        <select v-model="selectedModel" class="model-select">
          <option
            v-for="model in availableModels"
            :value="model.value"
            :key="model.value"
          >
            {{ model.label }}
          </option>
        </select>

        <input
          v-model="width"
          type="number"
          placeholder="Ширина"
          class="size-input"
        />
        <input
          v-model="height"
          type="number"
          placeholder="Высота"
          class="size-input"
        />
      </div>

      <button @click="generateImage" :disabled="isLoading">
        {{ isLoading ? "Генерация..." : "Сгенерировать изображение" }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="result" class="result-section">
      <h3>Результат:</h3>
      <pre>{{ result }}</pre>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "MidjourneyGenerator",
  data() {
    return {
      prompt: "",
      isLoading: false,
      error: null,
      result: null,
      selectedModel: "midjourney", // Значение по умолчанию
      availableModels: [
        { value: "midjourney", label: "Midjourney" },
        { value: "stable-diffusion", label: "Stable Diffusion" },
        // Добавьте другие модели, если они поддерживаются API
      ],
      width: 1024,
      height: 1024,
      apiKey: "sk-K6j9wfoVqC6zMoQkRMidhoxDBd0vuKc2wswMo5e09fLGsZbPqzf85vX0Uxfv",
      apiEndpoint: "https://api.gen-api.ru/api/v1/networks/midjourney",
    };
  },
  methods: {
    async generateImage() {
      if (!this.prompt.trim()) {
        this.error = "Пожалуйста, введите описание изображения";
        return;
      }

      this.isLoading = true;
      this.error = null;
      this.result = null;

      try {
        const requestData = {
          model: "7.0",
          prompt: this.prompt,
          width: this.width,
          height: this.height,
          callback_url:
            "https://webhook.site/efc22831-76b5-4030-a3ef-2c15e9e59935",
        };

        const response = await axios.post(this.apiEndpoint, requestData, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        });

        this.result = response.data;
      } catch (err) {
        console.error("Ошибка при генерации изображения:", err);

        if (err.response) {
          if (err.response.status === 422) {
            this.error = "Ошибка валидации: ";
            if (err.response.data?.errors_validation) {
              for (const [field, messages] of Object.entries(
                err.response.data.errors_validation
              )) {
                this.error += `${field}: ${messages.join(", ")}. `;
              }
            } else {
              this.error += "Неверный формат запроса";
            }
          } else {
            this.error = `Ошибка сервера: ${err.response.status} - ${err.response.statusText}`;
          }
        } else {
          this.error = `Произошла ошибка: ${err.message}`;
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.midjourney-generator {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.input-section {
  margin-bottom: 20px;
}

textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}

.options {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.model-select,
.size-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.model-select {
  flex-grow: 1;
}

.size-input {
  width: 80px;
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

button:hover:not(:disabled) {
  background-color: #45a049;
}

.error-message {
  color: #d32f2f;
  margin: 10px 0;
  padding: 10px;
  background-color: #fde0e0;
  border-radius: 4px;
}

.result-section {
  margin-top: 20px;
}

pre {
  background: #f4f4f4;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
