<template>
  <div class="loading-overlay">
    <div class="loading-content">
      <div class="loading-spinner">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- SVG иконка -->
        </svg>
      </div>
      <div class="loading-text">{{ currentStatus }}</div>
      <div class="loading-progress">
        <div class="progress-bar"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

const props = defineProps({
  changeLoadChatMulti: {
    type: Function,
  },
});

const loading = ref({
  telegram: false,
  whatsapp: false,
});
const completed = ref(false);
const telegramCompleted = ref(false);
const whatsappCompleted = ref(false);
const currentStatus = ref("Загрузка общих чатов...");
const premiumAccounts = ref([]);

const progress = computed(() => {
  if (completed.value) return 100;
  if (loading.value.whatsapp) return 66;
  if (loading.value.telegram) return 33;
  return 0;
});

const getAccountInfo = async (source, login) => {
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getInfo",
      {
        source: source,
        login: login,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Ошибка при запросе ${login}:`, error);
    return null;
  }
};

const fetchAccounts = async (source) => {
  try {
    loading.value[source] = true;
    currentStatus.value = `Загрузка ${source} аккаунтов...`;

    const response = await axios.post(
      "https://b2288.apitter.com/instances/getInfoByToken",
      {
        source: source,
        skipDetails: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    return response.data.data.instances || [];
  } catch (error) {
    console.error(`Ошибка при получении ${source} аккаунтов:`, error);
    return [];
  } finally {
    loading.value[source] = false;
    if (source === "telegram") telegramCompleted.value = true;
    if (source === "whatsapp") whatsappCompleted.value = true;
  }
};

const saveToLocalStorage = (accounts) => {
  try {
    // Получаем текущие данные из localStorage
    const storedData = localStorage.getItem("loginWhatsAppChatsStep");
    let existingLogins = [];

    // Проверяем, есть ли данные и они являются валидным JSON
    if (storedData && storedData !== "[object Object]") {
      try {
        existingLogins = JSON.parse(storedData);
        // Дополнительная проверка, что это массив
        if (!Array.isArray(existingLogins)) {
          console.warn(
            "Данные в localStorage не являются массивом, создаем новый массив"
          );
          existingLogins = [];
        }
      } catch (e) {
        console.error("Ошибка парсинга данных из localStorage:", e);
        existingLogins = [];
      }
    }

    // Создаем Set для быстрой проверки уникальности
    const existingSet = new Set(
      existingLogins.map((item) => `${item.login}|${item.source}`)
    );

    // Добавляем только новые уникальные аккаунты
    const newAccounts = accounts.filter(
      (account) => !existingSet.has(`${account.login}|${account.source}`)
    );

    if (newAccounts.length > 0) {
      const updatedLogins = [...existingLogins, ...newAccounts];
      localStorage.setItem(
        "loginWhatsAppChatsStep",
        JSON.stringify(updatedLogins)
      );
      console.log("Данные успешно сохранены в localStorage");
    } else {
      console.log("Нет новых аккаунтов для сохранения");
      console.log(localStorage.getItem("loginWhatsAppChatsStep"));
    }

    props.changeLoadChatMulti();
  } catch (error) {
    console.error("Критическая ошибка при сохранении в localStorage:", error);
    // В случае критической ошибки сохраняем только новые аккаунты
    localStorage.setItem("loginWhatsAppChatsStep", JSON.stringify(accounts));
  }
};

const processAccounts = async (accounts, source) => {
  const resultAccounts = [];

  for (const account of accounts) {
    try {
      currentStatus.value = `Проверка ${source}: ${account.login}`;
      const info = await getAccountInfo(source, account.login);

      if (info?.data?.step?.value === 5) {
        resultAccounts.push({
          login: account.login,
          source: source,
        });
      }
    } catch (error) {
      console.error(`Ошибка при обработке аккаунта ${account.login}:`, error);
    }
  }

  return resultAccounts;
};

const processAllAccounts = async () => {
  try {
    // Сброс состояния
    completed.value = false;
    telegramCompleted.value = false;
    whatsappCompleted.value = false;
    premiumAccounts.value = [];
    currentStatus.value = "Загрузка общих чатов...";

    // Обработка Telegram
    const telegramAccounts = await fetchAccounts("telegram");
    const telegramPremium = await processAccounts(telegramAccounts, "telegram");

    // Обработка WhatsApp
    const whatsappAccounts = await fetchAccounts("whatsapp");
    const whatsappPremium = await processAccounts(whatsappAccounts, "whatsapp");

    // Объединяем результаты
    const resultAccounts = [...telegramPremium, ...whatsappPremium];
    premiumAccounts.value = resultAccounts;

    // Сохраняем результат
    if (resultAccounts.length > 0) {
      saveToLocalStorage(resultAccounts);
    } else {
      localStorage.removeItem("loginWhatsAppChatsStep");
    }

    completed.value = true;
    currentStatus.value = "Проверка завершена";
  } catch (error) {
    console.error("Ошибка в основном потоке:", error);
    currentStatus.value = "Ошибка при проверке";
  }
};

onMounted(() => {
  processAllAccounts();
});
</script>

<style scoped>
/* Стили остаются без изменений */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 220px;
  text-align: center;
}

.loading-spinner {
  animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.loading-progress {
  width: 100%;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  width: 30%;
  background-color: #25d366;
  border-radius: 2px;
  animation: loading 2s ease-in-out infinite;
}

@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(300%);
  }
}
</style>
