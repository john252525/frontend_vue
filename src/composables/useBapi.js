import axios from "axios";
import { computed } from "vue";
import { useAccountStore } from "@/stores/accountStore";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Бэк отвечает ошибками на английском ({ok:false, message, errors:[...]}) —
// самые частые переводим, чтобы в тостах/модалках было понятно, что делать.
const KNOWN_ERRORS = {
  "employee has no access to this account":
    "У сотрудника нет доступа к этому аккаунту. Сначала выдайте его: Организация → Сотрудники → «Доступ к аккаунтам».",
  "queue not found or disabled": "Очередь не найдена или отключена.",
  "company not found":
    "Компания не найдена — сначала подключите корпоративный доступ в разделе «Организация».",
  "access denied": "Недостаточно прав — действие доступно только владельцу аккаунта.",
};

export const getApiErrorText = (error, fallback = "Произошла ошибка") => {
  const data = error?.response?.data;
  const errors = Array.isArray(data?.errors) ? data.errors.filter(Boolean) : [];
  const raw = errors.length ? errors : [data?.message || error?.message || fallback];
  return raw.map((text) => KNOWN_ERRORS[String(text).toLowerCase()] || text).join(" ");
};

// Общий транспорт для новых методов bapi88 (очереди, права на аккаунты,
// CRM-пользователи, маршрутизация): Bearer + обязательный по спекам
// query-параметр referer (адрес ЛК, с которого идёт запрос).
export function useBapi() {
  const accountStore = useAccountStore();
  const token = computed(() => accountStore.getAccountToken);

  const request = async (method, path, { body, params } = {}) => {
    const response = await axios({
      method,
      url: `${BASE_URL}${path}`,
      data: body,
      params: { ...params, referer: window.location.origin },
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });
    return response.data;
  };

  return { request };
}
