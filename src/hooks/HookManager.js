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
          uniq: eventData.item,
          id: eventData.item,
          reaction: null,
          timestamp: eventData.time,
        };
        store.addMessages(eventData.thread, [message]);
        this.showNotification(eventData);
        console.log("хук");
        break;

      case "message_status":
        // Находим сообщения для указанного thread
        const messages = store.messages[eventData.thread] || [];

        // Ищем сообщение с соответствующим uniq
        const messageIndex = messages.findIndex(
          (msg) => msg.uniq === eventData.item
        );

        if (messageIndex !== -1) {
          // Обновляем state сообщения
          messages[messageIndex].data.state =
            eventData.content[0]?.type || "delivered";
          // Обновляем массив сообщений в сторе
          store.messages[eventData.thread] = [...messages];
          console.log(
            `Статус сообщения ${eventData.item} обновлен на ${eventData.content[0]?.type}`
          );
        } else {
          console.warn(
            `Сообщение с uniq ${eventData.item} не найдено в thread ${eventData.thread}`
          );
        }
        break;

      // case "add_message_reaction":
      //   const threadMessages = store.messages[eventData.thread] || [];
      //   const reactionMessageIndex = threadMessages.findIndex(
      //     (msg) => msg.uniq === eventData.item
      //   );

      //   if (reactionMessageIndex !== -1) {
      //     const newReaction = eventData.content[0]?.reaction || "";
      //     threadMessages[reactionMessageIndex].data.reaction = newReaction;
      //     threadMessages[reactionMessageIndex].reaction = newReaction || null;
      //     store.messages[eventData.thread] = [...threadMessages];
      //     console.log(
      //       `Реакция на сообщение ${eventData.item} обновлена на ${newReaction}`
      //     );
      //   } else {
      //     console.warn(
      //       `Сообщение с uniq ${eventData.item} не найдено в thread ${eventData.thread}`
      //     );
      //   }
      //   break;

      default:
        console.warn("Unhandled hook type:", eventData);
    }
  }

  showNotification(eventData) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Новое сообщение в ${eventData.thread}`, {
        body: eventData.text || "Вложение",
        icon: "/notification-icon.png",
      });
    }
  }
}

export const hookManager = new HookManager();
