import { createChatStore } from "@/stores/chatStore/chatStoreFactory";
import { union } from "lodash";

class HookManager {
  constructor() {
    this.stores = new Map();
    this.setupEventSource();
  }

  getStore(token) {
    if (!this.stores.has(token)) {
      this.stores.set(token, createChatStore(token));
    }
    return this.stores.get(token);
  }

  setupEventSource() {
    this.eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/events`
    );

    this.eventSource.onmessage = (event) => {
      const eventData = JSON.parse(event.data);
      this.processHook(eventData);
    };

    this.eventSource.onerror = (error) => {
      console.error("Hook connection error:", error);
      this.reconnect();
    };
  }

  reconnect() {
    setTimeout(() => {
      console.log("Reconnecting to hooks...");
      this.setupEventSource();
    }, 5000);
  }

  processHook(eventData) {
    const storeToken = `${eventData.login}_${eventData.source}_${eventData.token}`;
    const store = this.getStore(storeToken);

    switch (eventData.hook_type) {
      case "new_chat":
        store.loadChats({ [eventData.chat.id]: eventData.chat });
        break;

      case "message":
        const message = {
          data: {
            content: eventData.content,
            item: eventData.item,
            outgoing: eventData.outgoing,
            reaction: "",
            replyTo: eventData.replyTo,
            send: "",
            source: eventData.source,
            state: "delivered",
            text: eventData.text,
            thread: eventData.thread,
            time: eventData.time,
            to: eventData.to,
          },
          delete: false,
          id: eventData.item,
          reaction: null,
          timestamp: eventData.time,
          uniq: eventData.uniq,
        };
        store.addMessages(eventData.thread, [message]);
        this.showNotification(eventData);
        console.log("хук");
        break;

      case "message_update":
        store.loadMessages(eventData.thread, eventData.messages);
        break;

      default:
        console.warn("Unhandled hook type:", eventData);
    }
  }

  showNotification(eventData) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Новое сообщение в ${eventData.thread}`, {
        body: eventData.message.text || "Вложение",
        icon: "/notification-icon.png",
      });
    }
  }
}

export const hookManager = new HookManager();
