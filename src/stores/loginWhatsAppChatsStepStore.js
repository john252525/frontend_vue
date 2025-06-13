import { defineStore } from "pinia";

export const useLoginWhatsAppChatsStepStore = defineStore(
  "loginWhatsAppChatsStep",
  {
    state: () => ({
      loginWhatsAppChatsStep:
        JSON.parse(localStorage.getItem("loginWhatsAppChatsStep")) || [],
    }),
    actions: {
      // Инициализация хранилища
      async init() {
        try {
          const saved = localStorage.getItem("loginWhatsAppChatsStep");
          if (saved) {
            const parsed = JSON.parse(saved);
            this.loginWhatsAppChatsStep = Array.isArray(parsed) ? parsed : [];
          }
        } catch (e) {
          console.error("Ошибка загрузки из localStorage:", e);
          this.loginWhatsAppChatsStep = [];
        }
      },

      // Добавление/обновление аккаунта
      addOrUpdateChat(account) {
        try {
          if (!account?.login || !account?.source) {
            throw new Error("Невалидные данные аккаунта");
          }

          const index = this.loginWhatsAppChatsStep.findIndex(
            (a) => a.login === account.login && a.source === account.source
          );

          const newAccount = {
            login: String(account.login),
            source: String(account.source),
            storage: account.storage || "undefined",
            type: account.type || "undefined",
            updatedAt: Date.now(),
          };

          if (index >= 0) {
            this.loginWhatsAppChatsStep[index] = newAccount;
          } else {
            this.loginWhatsAppChatsStep.push(newAccount);
          }

          this.saveToLocalStorage();
          return true;
        } catch (e) {
          console.error("Ошибка сохранения аккаунта:", e);
          return false;
        }
      },

      removeChat(login, source) {
        try {
          const initialLength = this.loginWhatsAppChatsStep.length;

          this.loginWhatsAppChatsStep = this.loginWhatsAppChatsStep.filter(
            (account) => !(account.login === login && account.source === source)
          );

          if (this.loginWhatsAppChatsStep.length < initialLength) {
            this.saveToLocalStorage();
            console.log(`Аккаунт ${login} (${source}) успешно удален`);
            return true;
          }

          console.warn(`Аккаунт ${login} (${source}) не найден`);
          return false;
        } catch (e) {
          console.error("Ошибка при удалении аккаунта:", e);
          return false;
        }
      },
      // Сохранение в localStorage
      saveToLocalStorage() {
        localStorage.setItem(
          "loginWhatsAppChatsStep",
          JSON.stringify(this.loginWhatsAppChatsStep)
        );
      },
    },
    persist: false, // Отключаем встроенную персистенцию Pinia
  }
);
