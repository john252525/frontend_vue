<template>
  <div class="tts-player">
    <h3>Inworld TTS Demo (streaming)</h3>
    <textarea
      v-model="text"
      placeholder="Введите текст для озвучки..."
      rows="4"
      style="width: 100%; max-width: 500px"
    />
    <div style="margin: 12px 0">
      <label>Голос: </label>
      <select v-model="voiceId">
        <option value="Ashley">Ashley (female, neutral)</option>
        <option value="Ethan">Ethan (male)</option>
        <option value="Sophia">Sophia</option>
        <option value="Dennis">Dennis</option>
        <!-- Добавляй другие из https://platform.inworld.ai/tts-playground или GET /tts/v1/voices -->
      </select>
    </div>
    <div style="margin: 8px 0">
      <label>Модель: </label>
      <select v-model="modelId">
        <option value="inworld-tts-1.5-mini">
          Mini (быстрее, ~120–150 ms)
        </option>
        <option value="inworld-tts-1.5-max">Max (лучше качество)</option>
      </select>
    </div>
    <button :disabled="isLoading || !text.trim()" @click="generateSpeech">
      {{ isLoading ? "Генерируется..." : "Озвучить" }}
    </button>
    <div v-if="error" style="color: red; margin-top: 12px">
      {{ error }}
    </div>
    <audio
      v-if="audioUrl"
      ref="audioRef"
      controls
      autoplay
      style="margin-top: 16px; width: 100%"
    >
      Ваш браузер не поддерживает audio
    </audio>
  </div>
</template>

<script setup>
import { ref } from "vue";

const text = ref("Привет! Это тестовый текст для проверки Inworld TTS API.");
const voiceId = ref("Ashley");
const modelId = ref("inworld-tts-1.5-mini");
const isLoading = ref(false);
const error = ref("");
const audioUrl = ref("");
const audioRef = ref(null);

// Твой Base64-ключ (из Inworld dashboard → API Keys → Basic credential)
const API_KEY =
  "SzJiUFFrQ3pWSU5LV2N6MktIbVdFdmROSnBUcnNzejI6MmlxUkJmS3RxQ3dkcGpvaXpZeFl6aDlhc3EwbXR6aWRYbFpwYmVNWGtmOW5VMEc0M21qTm00TEtSSUZYazFzag==";

const API_BASE = "https://api.inworld.ai/tts/v1";

const generateSpeech = async () => {
  if (!text.value.trim()) return;

  isLoading.value = true;
  error.value = "";
  audioUrl.value = "";

  try {
    const response = await fetch(`${API_BASE}/voice/stream`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text.value,
        voiceId: voiceId.value,
        modelId: modelId.value,
        audioConfig: {
          audioEncoding: "LINEAR16",
          sampleRateHertz: 24000, // 22050 или 24000 — оба работают
        },
        temperature: 1.0,
        applyTextNormalization: "ON",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Сервер ответил ${response.status}: ${errText}`);
    }

    if (!response.body) throw new Error("Нет потока в ответе");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let audioBase64Chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.indexOf("\n");
      while (boundary !== -1) {
        const line = buffer.slice(0, boundary).trim();
        buffer = buffer.slice(boundary + 1);

        if (line) {
          try {
            const json = JSON.parse(line);
            if (json.result && json.result.audioContent) {
              audioBase64Chunks.push(json.result.audioContent);
            }
          } catch (e) {
            console.warn("Не JSON строка:", line);
          }
        }

        boundary = buffer.indexOf("\n");
      }
    }

    // Обработка остатка буфера
    if (buffer.trim()) {
      try {
        const json = JSON.parse(buffer.trim());
        if (json.result && json.result.audioContent) {
          audioBase64Chunks.push(json.result.audioContent);
        }
      } catch {}
    }

    if (audioBase64Chunks.length === 0) {
      throw new Error("Аудио-чанк не найден в ответе");
    }

    // Склеиваем base64
    const fullBase64 = audioBase64Chunks.join("");
    const binary = atob(fullBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Создаём WAV (Inworld добавляет WAV-заголовок в первый чанк → просто конкатенация обычно работает)
    const blob = new Blob([bytes], { type: "audio/wav" });
    audioUrl.value = URL.createObjectURL(blob);

    // Автозапуск (может блокироваться без жеста пользователя)
    setTimeout(() => {
      audioRef.value
        ?.play()
        .catch((e) => console.warn("Автозапуск заблокирован:", e));
    }, 100);
  } catch (err) {
    console.error(err);
    error.value = err.message || "Ошибка генерации речи. Проверь консоль.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.tts-player {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}
button {
  padding: 10px 24px;
  font-size: 16px;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
