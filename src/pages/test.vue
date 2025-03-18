<template>
  <div class="voice-recorder">
    <button @click="startRecording" :disabled="isRecording">
      Начать запись
    </button>
    <button @click="stopRecording" :disabled="!isRecording">
      Остановить запись
    </button>
    <p v-if="transcript">Распознанный текст: {{ transcript }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isRecording: false,
      transcript: "",
      recognition: null,
    };
  },
  mounted() {
    // Проверяем поддержку Web Speech API
    if ("webkitSpeechRecognition" in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = false; // Останавливаем запись после первого результата
      this.recognition.interimResults = false; // Не показываем промежуточные результаты

      this.recognition.onresult = (event) => {
        this.transcript = event.results[0][0].transcript; // Получаем текст
        this.handleResponse(this.transcript); // Обрабатываем ответ
      };

      this.recognition.onerror = (event) => {
        console.error("Ошибка распознавания:", event.error);
      };
    } else {
      alert("Ваш браузер не поддерживает распознавание речи.");
    }
  },
  methods: {
    startRecording() {
      if (this.recognition) {
        this.isRecording = true;
        this.recognition.start(); // Запускаем распознавание
      }
    },
    stopRecording() {
      if (this.recognition) {
        this.isRecording = false;
        this.recognition.stop(); // Останавливаем распознавание
      }
    },
    handleResponse(transcript) {
      if (transcript.toLowerCase() === "привет") {
        this.speakResponse("Привет! Как дела?"); // Воспроизводим ответ
      }
      if (transcript.toLowerCase() === "все хорошо") {
        this.speakResponse("Я рада! Что ты делаешь"); // Воспроизводим ответ
      }
      if (transcript.toLowerCase() === "серега гей") {
        this.speakResponse("можно с тобой"); // Воспроизводим ответ
      }
    },
    speakResponse(text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.getVoice(); // Устанавливаем голос
      window.speechSynthesis.speak(utterance); // Воспроизводим текст
    },
    getVoice() {
      const voices = window.speechSynthesis.getVoices();
      // Выбираем другой голос (можно изменить индекс в зависимости от доступных голосов)
      return voices.length > 1 ? voices[1] : null; // Возвращаем второй доступный голос
    },
  },
};
</script>

<style scoped>
.voice-recorder {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
}

button {
  margin: 5px;
  padding: 10px 20px;
  font-size: 16px;
}

p {
  margin-top: 10px;
  font-size: 18px;
}
</style>

Найти еще
