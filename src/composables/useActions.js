import { computed } from "vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";
import { useStationLoading } from "@/composables/useStationLoading";

export function useActions() {
  const accountStore = useAccountStore();
  const token = computed(() => accountStore.getAccountToken);
  const { setLoadingStatus } = useStationLoading();

  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

  const createRequest = async (item, request) => {
    console.log(item);
    const { login, source, storage } = item;

    const params = { source, login, storage };

    try {
      const response = await axios.post(`${FRONTEND_URL}${request}`, params, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      });

      if (response.data.status === "ok") {
        setLoadingStatus(true, "success");
        if (request === "/forceStop") {
          return true;
        }
      } else {
        setLoadingStatus(true, "error");
      }
    } catch (error) {
      console.error(`Ошибка запроса:`, error);
      setLoadingStatus(true, "error");
    } finally {
      return true;
    }
  };

  return {
    createRequest,
  };
}
