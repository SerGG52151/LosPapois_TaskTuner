package com.springboot.MyTodoList.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;
import org.telegram.telegrambots.meta.generics.TelegramClient;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardRow;

public class BotHelper {

	private static final Logger logger = LoggerFactory.getLogger(BotHelper.class);

	public static void sendMessageToTelegram(Long chatId, String text, TelegramClient bot) {

		try {
			// prepare message
			SendMessage messageToTelegram =
					SendMessage
					.builder()
					.chatId(chatId)
					.text(text)
					.parseMode("Markdown")
					.replyMarkup(new ReplyKeyboardRemove(true))
					.build()
				;

			// send message
			bot.execute(messageToTelegram);

		} catch (Exception e) {
			logger.error(e.getLocalizedMessage(), e);
		}
	}

	public static void sendMessageToTelegram(Long chatId, String text,TelegramClient bot, ReplyKeyboardMarkup rk ) {

		try {
			// prepare message
			SendMessage messageToTelegram =
					SendMessage
					.builder()
					.chatId(chatId)
					.text(text)
					.parseMode("Markdown")
					.replyMarkup(rk)
					.build()
				;

			// send message
			bot.execute(messageToTelegram);

		} catch (Exception e) {
			logger.error(e.getLocalizedMessage(), e);
		}
	}

	// Para enviar mensajes de texto con botón Cancel inline
	public static void sendPromptWithCancel(Long chatId, String text, TelegramClient bot) {
		InlineKeyboardMarkup cancelKeyboard = InlineKeyboardMarkup.builder()
			.keyboardRow(new InlineKeyboardRow(
				InlineKeyboardButton.builder()
					.text("❌ Cancel")
					.callbackData("CANCEL")
					.build()
			))
			.build();
		sendMessageToTelegramButtons(chatId, text, bot, cancelKeyboard);
	}

	// Para enviar mensajes con botones
	public static void sendMessageToTelegramButtons(Long chatId, String text, TelegramClient bot, InlineKeyboardMarkup ik) {
    try {
        SendMessage messageToTelegram = SendMessage.builder()
            .chatId(chatId)
            .text(text)
            .parseMode("Markdown")
            .replyMarkup(ik)
            .build();
        bot.execute(messageToTelegram);
    } catch (Exception e) {
        logger.error(e.getLocalizedMessage(), e);
    }
	}

}
