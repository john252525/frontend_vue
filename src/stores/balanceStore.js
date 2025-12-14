import { ref, computed } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import { useAccountStore } from "./accountStore";
import useFrontendLogger from "@/composables/useFrontendLogger";

export const useBalanceStore = defineStore("balance", () => {
  const balance = ref("");
  const balanceError = ref(false);
  const balanceLoading = ref(false);
  const referrerId = ref(null);

  const apiUrl = import.meta.env.VITE_PAY_URL;
  const { sendLog } = useFrontendLogger();

  const accountStore = useAccountStore();
  const token = computed(() => accountStore.getAccountToken);

  const handleSendLog = async (location, method, params, results, answer) => {
    try {
      await sendLog(location, method, params, results, answer);
    } catch (err) {
      console.error("error", err);
    }
  };

  const removeDecimalZeros = (value) => {
    return value.toString().replace(/\.00$/, "");
  };

  const formattedBalance = computed(() => {
    return balance.value ? `${removeDecimalZeros(balance.value)} ₽` : "";
  });

  const getReferrer = async () => {
    try {
      balanceLoading.value = true;
      balanceError.value = false;

      const response = await axios.post(
        `https://bapi88.developtech.ru/api/v1/users/getReferrer`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.value}`,
          },
        }
      );

      if (response.data) {
        await handleSendLog(
          "balance",
          "get-referrer",
          null,
          response.data,
          response.data
        );
      }

      // Сохраняем referrer_user_id из ответа
      referrerId.value = response.data?.data?.referrer_user_id || null;
      console.log(referrerId.value);
      return referrerId.value;
    } catch (err) {
      balanceError.value = true;
      console.error(
        "getReferrer error:",
        err.response ? err.response.data : err.message
      );
      throw err;
    } finally {
      balanceLoading.value = false;
    }
  };

  const getBalance = async (refId = null) => {
    try {
      balanceLoading.value = true;
      balanceError.value = false;

      // Используем переданный refId или сохранённый в стате
      const idToUse = refId !== null ? refId : referrerId.value;

      console.log("getBalance called with refId:", refId);
      console.log("idToUse:", idToUse);
      console.log("URL:", `${apiUrl}/balance/getBalance`);
      console.log("token:", token.value);

      const response = await axios.get(`${apiUrl}/balance/getBalance`, {
        params: {
          referrer_user_id: idToUse,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      });

      console.log("Response:", response.data);

      if (response.data) {
        await handleSendLog(
          "balance",
          "get-payment-sum",
          { referrer_user_id: idToUse },
          response.data,
          response.data
        );
      }

      balance.value = response.data.balance;
      balanceError.value = false;
    } catch (err) {
      balanceError.value = true;
      console.error("getBalance error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      throw err;
    } finally {
      balanceLoading.value = false;
    }
  };

  const initBalance = async () => {
    try {
      console.log("Token:", token.value); // Есть ли токен?
      const refId = await getReferrer();
      console.log("RefId obtained:", refId); // Получили ли рефер?
      await getBalance(refId);
    } catch (err) {
      balanceError.value = true;
      console.error("initBalance error:", err);
    }
  };

  // Функция для принудительного обновления баланса
  const refreshBalance = async () => {
    await getBalance();
  };

  return {
    balance,
    balanceError,
    balanceLoading,
    referrerId,
    formattedBalance,
    getReferrer,
    getBalance,
    initBalance,
    refreshBalance,
  };
});
