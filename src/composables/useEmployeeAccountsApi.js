import axios from "axios";
import { computed } from "vue";
import { useAccountStore } from "@/stores/accountStore";
import { useBapi } from "@/composables/useBapi";

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

// Права сотрудника на аккаунты (vendors): employee-accounts/*.
// actions: { view, use, refresh } — неуказанные действия считаются запрещёнными.
export function useEmployeeAccountsApi() {
  const accountStore = useAccountStore();
  const token = computed(() => accountStore.getAccountToken);
  const { request } = useBapi();

  // Аккаунты, которые вообще можно выдать сотруднику, — все аккаунты
  // владельца (тот же запрос, что строит страницу «Аккаунты»).
  const fetchAvailableAccounts = async () => {
    const response = await axios.post(
      `${FRONTEND_URL}getInfoByToken`,
      {
        source: [
          "telegram",
          "whatsapp",
          "waba",
          "fbm",
          "max",
          "vk-bot",
          "max-bot",
          "instagram",
          "sms",
          "email",
        ],
        type: ["amocrm", "bitrix24", "uon", "bulk", "adapter", "touchapi"],
        group: ["messenger", "crm", "bulk"],
        add_deleted: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      },
    );
    return (response.data?.data?.instances || []).filter(
      (instance) => instance.uuid && instance.enable !== "0",
    );
  };

  const fetchEmployeeAccounts = async (employeeId) => {
    const res = await request("get", `employee-accounts/getAll/${employeeId}`);
    return res.data?.accounts || [];
  };

  // Полностью заменяет набор аккаунтов сотрудника: отсутствующие в запросе снимаются.
  const saveEmployeeAccounts = (employeeId, accounts) =>
    request("post", `employee-accounts/save/${employeeId}`, { body: { accounts } });

  return { fetchAvailableAccounts, fetchEmployeeAccounts, saveEmployeeAccounts };
}
