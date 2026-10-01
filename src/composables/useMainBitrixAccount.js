import { ref, computed } from "vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";

// На webest разрешено подключать только один CRM-тип — Bitrix24 (см.
// AddAccountV2.vue), и по сути это один основной аккаунт на весь личный
// кабинет, а не рядовая запись в общем списке. Composable отдельно
// подтягивает именно его — чтобы показать в шапке независимо от того,
// загружен ли где-то общий список аккаунтов.
export function useMainBitrixAccount() {
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
  const FRONTEND_URL_VENDORS = import.meta.env.VITE_FRONTEND_URL_VENDORS;

  const accountStore = useAccountStore();
  const token = computed(() => accountStore.getAccountToken);

  const account = ref(null);
  const loading = ref(false);
  const error = ref("");

  const authHeaders = () => ({
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token.value}`,
    },
  });

  const fetchAccount = async () => {
    loading.value = true;
    error.value = "";
    try {
      const response = await axios.post(
        `${FRONTEND_URL}getInfoByToken`,
        { type: ["bitrix24"], group: ["crm"], add_deleted: false },
        authHeaders(),
      );

      if (response.data.ok === true) {
        const instances = response.data.data?.instances || [];
        account.value = instances.find((i) => i.type === "bitrix24") || null;
      } else {
        account.value = null;
      }
    } catch (e) {
      console.error("Ошибка при загрузке основного аккаунта Bitrix24:", e);
      error.value = "Не удалось загрузить аккаунт Bitrix24";
      account.value = null;
    } finally {
      loading.value = false;
    }
  };

  // «Обновить аккаунт» — тот же вызов, что и в общем меню аккаунтов
  // (Modal.vue → updateAccountButton), просто без завязки на список.
  const updateAccount = async () => {
    if (!account.value) return { ok: false };
    const { source, login, type, storage } = account.value;
    try {
      const response = await axios.post(
        `${FRONTEND_URL_VENDORS}updateAccount`,
        { source, login, type, storage },
        authHeaders(),
      );
      return response.data;
    } catch (e) {
      console.error("Ошибка при обновлении аккаунта Bitrix24:", e);
      return { ok: false };
    }
  };

  return { account, loading, error, fetchAccount, updateAccount };
}
