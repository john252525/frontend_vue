// telegramBot.js
import axios from "axios";

// Конфигурация бота (лучше вынести в .env файл)
const TELEGRAM_BOT_TOKEN = "AAF7dg4E-R_goJsPFd-HekJMG6G2cbwsCfM"; // Получить у @BotFather
const CHAT_ID = "7538115955"; // Узнать у @userinfobot

/**
 * Отправляет ошибку в Telegram чат
 * @param {Error|string} error - Объект ошибки или текст сообщения
 * @param {object} [context] - Дополнительный контекст
 */
export async function sendErrorToTelegram(error, context = {}) {
  try {
    // Формируем сообщение
    let message = `🚨 *Ошибка в приложении* 🚨\n\n`;

    if (error instanceof Error) {
      message += `• *Ошибка*: ${error.message}\n`;
      message += `• *Тип*: ${error.name}\n`;
      message += `• *Stack*: \n\`\`\`\n${error.stack}\n\`\`\`\n`;
    } else {
      message += `• *Сообщение*: ${error}\n`;
    }

    // Добавляем контекст
    if (Object.keys(context).length > 0) {
      message += `• *Контекст*: \n\`\`\`json\n${JSON.stringify(
        context,
        null,
        2
      )}\n\`\`\`\n`;
    }

    message += `• *Время*: ${new Date().toLocaleString()}`;

    // Отправляем через API Telegram
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }
    );
  } catch (e) {
    console.error("Не удалось отправить ошибку в Telegram:", e);
  }
}
