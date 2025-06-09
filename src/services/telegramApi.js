// Telegram Bot API integration
const TELEGRAM_BOT_TOKEN = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
const EXPERT_CHAT_ID = process.env.REACT_APP_EXPERT_CHAT_ID;

class TelegramApiClient {
  constructor(botToken = TELEGRAM_BOT_TOKEN, expertChatId = EXPERT_CHAT_ID) {
    this.botToken = botToken;
    this.expertChatId = expertChatId;
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  async sendMessageToExpert(chatId, message, history) {
    try {
      // Format chat history for Telegram
      const formattedHistory = history.map(msg => {
        const sender = msg.role === 'user' ? '👤 Пользователь' : '🤖 Ассистент';
        return `${sender}: ${msg.content}`;
      }).join('\n\n');

      const text = `📝 <b>Новый запрос в экспертный режим</b>\n\n<b>ID чата:</b> ${chatId}\n\n<b>История чата:</b>\n${formattedHistory}\n\n<b>Последнее сообщение:</b>\n${message}`;

      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.expertChatId,
          text: text,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{
                text: 'Ответить',
                callback_data: `reply_${chatId}`
              }]
            ]
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message to expert:', error);
      throw error;
    }
  }

  async sendNewMessageToExpert(chatId, message) {
    try {
      const text = `📨 <b>Новое сообщение от пользователя</b>\n\n<b>ID чата:</b> ${chatId}\n\n<b>Сообщение:</b>\n${message}`;

      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.expertChatId,
          text: text,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{
                text: 'Ответить',
                callback_data: `reply_${chatId}`
              }]
            ]
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending new message to expert:', error);
      throw error;
    }
  }
}

export const telegramApi = new TelegramApiClient(); 