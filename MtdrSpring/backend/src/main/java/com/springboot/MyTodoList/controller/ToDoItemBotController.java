package com.springboot.MyTodoList.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.longpolling.BotSession;
import org.telegram.telegrambots.longpolling.interfaces.LongPollingUpdateConsumer;
import org.telegram.telegrambots.longpolling.starter.AfterBotRegistration;
import org.telegram.telegrambots.longpolling.starter.SpringLongPollingBot;
import org.telegram.telegrambots.longpolling.util.LongPollingSingleThreadUpdateConsumer;
import org.telegram.telegrambots.meta.api.methods.AnswerCallbackQuery;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import com.springboot.MyTodoList.config.BotProps;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.ProjectTTService;
import com.springboot.MyTodoList.service.SprintTaskTTService;
import com.springboot.MyTodoList.service.SprintTTService;
import com.springboot.MyTodoList.service.TaskTTService;
import com.springboot.MyTodoList.service.ToDoItemService;
import com.springboot.MyTodoList.service.UserTTService;
import com.springboot.MyTodoList.util.BotActions;

@Component
public class ToDoItemBotController implements SpringLongPollingBot, LongPollingSingleThreadUpdateConsumer {

    private static final Logger logger = LoggerFactory.getLogger(ToDoItemBotController.class);
    private final ToDoItemService toDoItemService;
    private final DeepSeekService deepSeekService;
    private final UserTTService userTTService;
    private final SprintTTService sprintTTService;
    private final ProjectTTService projectTTService;
    private final SprintTaskTTService sprintTaskTTService;
    private final TaskTTService taskTTService;
    private final TelegramClient telegramClient;
    private final BotProps botProps;

    @Override
    public String getBotToken() {
        return botProps.getToken();
    }

    public ToDoItemBotController(BotProps bp,
            ToDoItemService tsvc,
            @Autowired(required = false) DeepSeekService ds,
            UserTTService userTTService,
            SprintTTService sprintTTService,
            ProjectTTService projectTTService,
            SprintTaskTTService sprintTaskTTService,
            TaskTTService taskTTService,
            TelegramClient telegramClient) {
        this.botProps = bp;
        this.telegramClient = telegramClient;
        this.toDoItemService = tsvc;
        this.deepSeekService = ds;
        this.userTTService = userTTService;
        this.sprintTTService = sprintTTService;
        this.projectTTService = projectTTService;
        this.sprintTaskTTService = sprintTaskTTService;
        this.taskTTService = taskTTService;
    }

    @Override
    public LongPollingUpdateConsumer getUpdatesConsumer() {
        return this;
    }

    @Override
    public void consume(Update update) {

        String messageFromTelegram;
        long chatId;
        String username;

        if (update.hasMessage() && update.getMessage().hasText()) {
            messageFromTelegram = update.getMessage().getText();
            chatId = update.getMessage().getChatId();
            username = update.getMessage().getFrom() != null
                    ? update.getMessage().getFrom().getUserName()
                    : null;
        } else if (update.hasCallbackQuery()) {
            messageFromTelegram = update.getCallbackQuery().getData();
            chatId = update.getCallbackQuery().getMessage().getChatId();
            username = update.getCallbackQuery().getFrom().getUserName() != null
                    ? update.getCallbackQuery().getFrom().getUserName()
                    : null;

            try {
                telegramClient.execute(AnswerCallbackQuery.builder()
                        .callbackQueryId(update.getCallbackQuery().getId())
                        .build());
            } catch (TelegramApiException e) {
                logger.error(e.getLocalizedMessage(), e);
            }
        } else {
          return;
		    }

        String telegramIdentity = (username != null && !username.trim().isEmpty()) 
        ? "@" + username : String.valueOf(chatId);

        BotActions actions = new BotActions(telegramClient, toDoItemService, deepSeekService,
                userTTService, sprintTTService, projectTTService, sprintTaskTTService, taskTTService);
        actions.setRequestText(messageFromTelegram);
        actions.setChatId(chatId);
        actions.setTelegramIdentity(telegramIdentity);
        if (actions.getTodoService() == null) {
            logger.info("todosvc error");
            actions.setTodoService(toDoItemService);
        }

        actions.fnStart();
        actions.fnHide();
        actions.fnLogin();
        actions.fnRegister();
        actions.fnPendingConversation();
        actions.fnShowDonePicker();
        actions.fnMarkTaskDone();
        actions.fnStatus();
        actions.fnDone();
        actions.fnUndo();
        actions.fnDelete();
        actions.fnListAll();
        actions.fnAddItem();
        actions.fnLLM();
        actions.fnElse();

    }

    @AfterBotRegistration
    public void afterRegistration(BotSession botSession) {
        System.out.println("Registered bot running state is: " + botSession.isRunning());
    }

}
