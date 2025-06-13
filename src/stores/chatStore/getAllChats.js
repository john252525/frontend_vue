import { defineStore } from "pinia";
import { getStoresByPrefix } from "@/utils/storeUtils";

export const useAnalyticsStore = defineStore("analytics", {
  actions: {
    analyzeChatStores() {
      const stores = getStoresByPrefix("chat_");

      const totalChats = stores.reduce((acc, store) => {
        return acc + (store.data.chats?.length || 0);
      }, 0);

      console.log(`Всего чатов во всех хранилищах: ${totalChats}`);
      return totalChats;
    },
  },
});
