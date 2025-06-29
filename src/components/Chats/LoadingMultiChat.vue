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
        ></svg>
      </div>
      <div class="loading-text">Загрузка общих чатов</div>
      <div class="loading-progress">
        <div class="progress-bar"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();

import { useLoginWhatsAppChatsStepStore } from "@/stores/loginWhatsAppChatsStepStore"; // Путь к вашему файлу
import { storeToRefs } from "pinia";
const loginChatsStore = useLoginWhatsAppChatsStepStore();
const { loginWhatsAppChatsStep } = storeToRefs(loginChatsStore);

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const props = defineProps({
  changeLoadChatMulti: {
    type: Function,
  },
});

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("Ошибка при парсинге JSON:", err);
    // Optionally, update the error message ref
  }
};

const currentStatus = ref("Загрузка общих чатов...");
const progress = ref(0);
const completed = ref(false);

const getAccountInfo = async (source, login, storage, type) => {
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getInfo",
      {
        source,
        login,
        storage,
        type,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
    if (response.data) {
      await handleSendLog(
        "chats",
        "getInfo",
        { source, login },
        response.data.ok,
        response.data
      );
    }
    return response.data;
  } catch (error) {
    console.error(`Ошибка при запросе ${login}:`, error);
    setLoadingStatus(true, "error");
    return null;
  }
};

const fetchAccounts = async (source) => {
  try {
    currentStatus.value = `Загрузка ${source} аккаунтов...`;
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getInfoByToken",
      {
        skipDetails: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data) {
      await handleSendLog(
        "chats",
        "getInfoByToken",
        { source, skipDetails: true },
        response.data.ok,
        response.data
      );
    }

    return response.data.data.instances || [];
  } catch (error) {
    setLoadingStatus(true, "error");
    console.error(`Ошибка при получении ${source} аккаунтов:`, error);
    return [];
  }
};

const processAccounts = async (accounts, source) => {
  const BATCH_SIZE = 5; // Обрабатываем по 5 аккаунтов одновременно
  const resultAccounts = [];

  for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
    const batch = accounts.slice(i, i + BATCH_SIZE);
    currentStatus.value = `Проверка ${source} (${Math.min(
      i + BATCH_SIZE,
      accounts.length
    )}/${accounts.length})`;

    const batchPromises = batch.map((account) =>
      getAccountInfo(source, account.login, account.storage, account.type)
        .then((info) => {
          if (info.data.step != null) {
            if (info.data.step.value === 5) {
              resultAccounts.push({
                login: account.login,
                storage: account.storage,
                type: account.type,
                source,
              });
            }
          }
          return null;
        })
        .catch((error) => {
          console.error(
            `Ошибка при обработке аккаунта ${account.login}:`,
            error
          );
          return null;
        })
    );

    await Promise.all(batchPromises);
    progress.value =
      Math.floor(((i + BATCH_SIZE) / accounts.length) * 50) +
      (source === "telegram" ? 0 : 50);
  }

  return resultAccounts;
};

const saveToLocalStorage = (accounts) => {
  try {
    // Полностью заменяем содержимое localStorage новым списком аккаунтов
    loginChatsStore.addOrUpdateChat(JSON.stringify(accounts));
  } catch (error) {
    console.error("Ошибка при сохранении в localStorage:", error);
    // В случае ошибки все равно пытаемся сохранить
    loginChatsStore.addOrUpdateChat(JSON.stringify(accounts));
  }
};
const processAllAccounts = async () => {
  try {
    progress.value = 0;
    completed.value = false;

    const [telegramAccounts, whatsappAccounts] = await Promise.all([
      fetchAccounts("telegram"),
      fetchAccounts("whatsapp"),
    ]);

    const [telegramPremium, whatsappPremium] = await Promise.all([
      processAccounts(telegramAccounts, "telegram"),
      processAccounts(whatsappAccounts, "whatsapp"),
    ]);

    const resultAccounts = [...telegramPremium, ...whatsappPremium];

    // Всегда сохраняем полный актуальный список
    saveToLocalStorage(resultAccounts);

    completed.value = true;
    currentStatus.value = "Проверка завершена";
    progress.value = 100;
    props.changeLoadChatMulti?.();
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
