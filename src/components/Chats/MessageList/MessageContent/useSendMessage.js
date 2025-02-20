import { computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { SendMessage } from "./SendMessage"; // Предположим, что chatInfo определен в этом файле

export function useSendMessage(emit, errorBlock, messageText, urlImg) {
  const router = useRouter();
  const { chatInfo } = SendMessage();

  const sendMessage = async (content, contentText) => {
    console.log(content, contentText);
    const parsedChatInfo = computed(() => {
      try {
        return JSON.parse(chatInfo.value.data);
      } catch (error) {
        console.error("Ошибка при парсинге JSON:", error);
        return {}; // Возвращаем пустой объект в случае ошибки
      }
    });
    const apiUrl = import.meta.env.VITE_API_URL;
    console.log(22794591901);
    const message = {
      to: `${chatInfo.value.phone}`,
      text: contentText || null,
      content: contentText
        ? [
            {
              type: content,
              src: urlImg,
            },
          ]
        : [],
      time: Date.now() / 1000,
      outgoing: true,
    };
    console.log(message);

    try {
      const response = await axios.post(
        `${apiUrl}/sendMessage`,
        {
          source: "whatsapp",
          login: "helly",
          msg: message,
        },
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
          },
        }
      );
      if (response.data === 401) {
        errorBlock.value = true;
        setTimeout(() => {
          localStorage.removeItem("accountToken");
          router.push("/login");
        }, 2000);
      }
      console.log("Сообщение отправлено:", response.data);
      emit("updateMessages", message); // Обновляем список сообщений
      messageText.value = "";
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
      if (error.response) {
        console.error("Ошибка сервера:", error.response.data);
      }
    }
  };

  return { sendMessage };
}
