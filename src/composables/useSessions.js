import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";
import { useDomain } from "@/composables/getDomain";
import { decodeJwtPayload } from "@/utils/jwt";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export function useSessions() {
  const accountStore = useAccountStore();
  const { stationDomain } = useDomain();

  // brand_slug лежит прямо в JWT (его выдаёт бэк при логине) — это
  // авторитетный источник; домен используем только как запасной вариант.
  const getBrandSlug = () =>
    decodeJwtPayload(accountStore.getAccountToken)?.brand_slug ||
    stationDomain.navigate?.value ||
    "";

  // POST sessions/getId — возвращает id сессии, с которым внешние сервисы
  // (например, Bitrix24-коннекторы во iframe) идентифицируют пользователя.
  const getSessionId = async () => {
    const brandSlug = getBrandSlug();
    const response = await axios.post(
      `${BASE_URL}sessions/getId`,
      { brand_slug: brandSlug },
      {
        params: { referer: window.location.origin },
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${accountStore.getAccountToken}`,
        },
      },
    );

    const sessionId = response.data?.data?.session_id;
    if (response.data?.ok !== true || !sessionId) {
      throw new Error(response.data?.message || "Не удалось получить сессию");
    }
    return { sessionId, brandSlug };
  };

  return { getBrandSlug, getSessionId };
}
