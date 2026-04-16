package com.springboot.MyTodoList.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardRow;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import com.springboot.MyTodoList.model.ProjectTT;
import com.springboot.MyTodoList.model.SprintTT;
import com.springboot.MyTodoList.model.TaskTT;
import com.springboot.MyTodoList.model.ToDoItem;
import com.springboot.MyTodoList.model.UserTT;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.ProjectTTService;
import com.springboot.MyTodoList.service.SprintTTService;
import com.springboot.MyTodoList.service.SprintTaskTTService;
import com.springboot.MyTodoList.service.TaskTTService;
import com.springboot.MyTodoList.service.ToDoItemService;
import com.springboot.MyTodoList.service.UserTTService;

public class BotActions {

    private static final Logger logger = LoggerFactory.getLogger(BotActions.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // Static maps survive across per-request BotActions instances
    private static final Map<Long, BotConversationState> chatStates = new ConcurrentHashMap<>();
    // Para el registro
    private static final Map<Long, BotRegistrationDraft> registrationDrafts = new ConcurrentHashMap<>();
    private static final Map<Long, BotTaskDraft> taskDrafts = new ConcurrentHashMap<>();
    private static final Map<Long, UserTT> authenticatedUsers = new ConcurrentHashMap<>();

    String requestText;
    long chatId;
    String telegramIdentity;
    TelegramClient telegramClient;
    boolean exit;

    ToDoItemService todoService;
    DeepSeekService deepSeekService;
    UserTTService userTTService;
    SprintTTService sprintTTService;
    ProjectTTService projectTTService;
    SprintTaskTTService sprintTaskTTService;
    TaskTTService taskTTService;

    public BotActions(TelegramClient tc, ToDoItemService ts, DeepSeekService ds,
                      UserTTService uts, SprintTTService stts,
                      ProjectTTService ptts, SprintTaskTTService sttts,
                      TaskTTService ttts) {
        telegramClient = tc;
        todoService = ts;
        deepSeekService = ds;
        userTTService = uts;
        sprintTTService = stts;
        projectTTService = ptts;
        sprintTaskTTService = sttts;
        taskTTService = ttts;
        exit = false;
    }

    public void setRequestText(String cmd) { requestText = cmd; }
    public void setChatId(long chId) { chatId = chId; }
    public void setTelegramIdentity(String id) { this.telegramIdentity = id; }
    public void setTelegramClient(TelegramClient tc) { telegramClient = tc; }
    public void setTodoService(ToDoItemService tsvc) { todoService = tsvc; }
    public ToDoItemService getTodoService() { return todoService; }
    public void setDeepSeekService(DeepSeekService dssvc) { deepSeekService = dssvc; }
    public DeepSeekService getDeepSeekService() { return deepSeekService; }
    public UserTTService getUserTTService() { return userTTService; }

    // ─── State helpers ───────────────────────────────────────────────────

    private BotConversationState getCurrentState() {
        return chatStates.getOrDefault(chatId, BotConversationState.NONE);
    }

    private void setCurrentState(BotConversationState state) {
        if (state == BotConversationState.NONE) {
            chatStates.remove(chatId);
        } else {
            chatStates.put(chatId, state);
        }
    }

    private void clearConversationState() {
        setCurrentState(BotConversationState.NONE);
        registrationDrafts.remove(chatId);
        taskDrafts.remove(chatId);
    }

    private boolean isValidEmail(String email) {
        return email != null && email.contains("@")
            && email.indexOf('@') > 0
            && email.lastIndexOf('.') > email.indexOf('@') + 1;
    }

    private LocalDate parseDate(String text) {
        try {
            return LocalDate.parse(text.trim(), DATE_FMT);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private boolean isUserAuthenticated(){
        return authenticatedUsers.containsKey(chatId);
    }

    private UserTT getAuthenticatedUser() {
        return authenticatedUsers.get(chatId);
    }

    // ─── Bot actions ─────────────────────────────────────────────────────

    public void fnStart() {
        if (exit) return;

        String trimmedText = requestText.trim();
        if (!trimmedText.equals(BotCommands.START_COMMAND.getCommand())
                && !trimmedText.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) {
            return;
        }

        clearConversationState();

        if (!isUserAuthenticated()) {
            InlineKeyboardMarkup teclado = InlineKeyboardMarkup.builder()
                .keyboardRow(new InlineKeyboardRow(
                    InlineKeyboardButton.builder()
                        .text("🔐 Login")
                        .callbackData(BotCommands.LOGIN_COMMAND.getCommand())
                        .build()
                ))
                .build();
            BotHelper.sendMessageToTelegramButtons(
                chatId, "👋 Welcome! Please log in.", telegramClient, teclado);
        } else {
            showMainMenu();
        }
        exit = true;
    }

    private void showMainMenu() {
        UserTT user = getAuthenticatedUser();
        InlineKeyboardMarkup teclado = InlineKeyboardMarkup.builder()
            .keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder()
                    .text("➕ Add Task")
                    .callbackData(BotCommands.ADD_ITEM.getCommand())
                    .build()
            ))
            .keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder()
                    .text("✅ Complete Task")
                    .callbackData(BotCommands.MARK_DONE.getCommand())
                    .build()
            ))
            .keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder()
                    .text("📋 My Tasks")
                    .callbackData(BotCommands.TODO_LIST.getCommand())
                    .build()
            ))
            .keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder()
                    .text("📊 Status")
                    .callbackData(BotCommands.STATUS.getCommand())
                    .build()
            ))
            .keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder()
                    .text("🚪 Logout")
                    .callbackData(BotCommands.HIDE_COMMAND.getCommand())
                    .build()
            ))
            .build();
        BotHelper.sendMessageToTelegramButtons(
            chatId, "👋 Hello " + user.getNameUser() + "! What would you like to do?", telegramClient, teclado);
    }

    public void fnDone() {
        if (exit) return;
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, "❌ You must log in first. Use /login", telegramClient, null);
            exit = true;
            return;
        }
        
        if (!requestText.contains(BotLabels.DONE.getLabel())) return;

        String done = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel()));
        Integer id = Integer.valueOf(done);
        try {
            ToDoItem item = todoService.getToDoItemById(id);
            item.setDone(true);
            todoService.updateToDoItem(id, item);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DONE.getMessage(), telegramClient);
            showMainMenu();  // ← Mostrar menú principal
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnUndo() {
        if (exit) return;
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, "❌ You must log in first. Use /login", telegramClient, null);
            exit = true;
            return;
        }
        
        if (!requestText.contains(BotLabels.UNDO.getLabel())) return;

        String undo = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel()));
        Integer id = Integer.valueOf(undo);
        try {
            ToDoItem item = todoService.getToDoItemById(id);
            item.setDone(false);
            todoService.updateToDoItem(id, item);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_UNDONE.getMessage(), telegramClient);
            showMainMenu();  // ← Mostrar menú principal
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnDelete() {
        if (exit) return;
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, "❌ You must log in first. Use /login", telegramClient, null);
            exit = true;
            return;
        }
        
        if (!requestText.contains(BotLabels.DELETE.getLabel())) return;

        String delete = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel()));
        Integer id = Integer.valueOf(delete);
        try {
            todoService.deleteToDoItem(id);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DELETED.getMessage(), telegramClient);
            showMainMenu();
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnHide() {
        if (exit) return;
        
        String trimmedText = requestText.trim();
        if (!trimmedText.equals(BotCommands.HIDE_COMMAND.getCommand())
                && !trimmedText.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel())) {
            return;
        }
        
        clearConversationState();
        authenticatedUsers.remove(chatId);  // Logout
        BotHelper.sendMessageToTelegram(chatId, BotMessages.BYE.getMessage(), telegramClient);
        exit = true;
    }

    public void fnLogin() {
        if (!requestText.trim().equals(BotCommands.LOGIN_COMMAND.getCommand()) || exit) return;

        if (userTTService == null) {
            BotHelper.sendMessageToTelegram(chatId, "The login service is not available.", telegramClient, null);
            exit = true;
            return;
        }

        logger.info("Login started for chatId: {} identity: {}", chatId, telegramIdentity);

        Optional<UserTT> userOp = userTTService.getUserByTelegram(telegramIdentity);
        if (!userOp.isPresent()) {
            BotHelper.sendMessageToTelegram(chatId,
                "⚠️ You are not yet registered in the system. Please contact your administrator to register you.",
                telegramClient, null);
            exit = true;
            return;
        }

        authenticatedUsers.put(chatId, userOp.get());
        showMainMenu();
        exit = true;
    }

    public void fnRegister() {
        if (exit) return;
        if (!requestText.trim().equals(BotCommands.REGISTER_COMMAND.getCommand())) return;

        if (userTTService == null) {
            BotHelper.sendMessageToTelegram(chatId, "The registration service is not available.", telegramClient, null);
            exit = true;
            return;
        }

        if (userTTService.getUserByTelegram(telegramIdentity).isPresent()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.REGISTER_ALREADY_EXISTS.getMessage(), telegramClient, null);
            exit = true;
            return;
        }

        registrationDrafts.put(chatId, new BotRegistrationDraft());
        setCurrentState(BotConversationState.WAITING_REGISTER_NAME);
        BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_REGISTER_NAME.getMessage(), telegramClient, null);
        exit = true;
    }

    public void fnPendingConversation() {
        if (exit) return;

        BotConversationState state = getCurrentState();
        if (state == BotConversationState.NONE) return;

        switch (state) {
            case WAITING_REGISTER_NAME:            handleRegisterName();           break;
            case WAITING_REGISTER_EMAIL:           handleRegisterEmail();          break;
            case WAITING_REGISTER_PASSWORD:        handleRegisterPassword();       break;
            case WAITING_REGISTER_PASSWORD_CONFIRM:handleRegisterPasswordConfirm();break;
            case WAITING_NEW_ITEM_NAME:            handleNewItemName();            break;
            case WAITING_NEW_ITEM_STORY_POINTS:    handleNewItemStoryPoints();     break;
            case WAITING_NEW_ITEM_PRIORITY:        handleNewItemPriority();        break;
            case WAITING_NEW_ITEM_SPRINT:          handleNewItemSprint();          break;
            default: break;
        }
    }

    // ─── handlers de registro  ───────────────────────────────────────────

    private void handleRegisterName() {
        BotRegistrationDraft draft = registrationDrafts.computeIfAbsent(chatId, k -> new BotRegistrationDraft());
        draft.setName(requestText.trim());
        setCurrentState(BotConversationState.WAITING_REGISTER_EMAIL);
        BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_REGISTER_EMAIL.getMessage(), telegramClient, null);
        exit = true;
    }

    private void handleRegisterEmail() {
        if (!isValidEmail(requestText)) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.INVALID_EMAIL.getMessage(), telegramClient, null);
            exit = true;
            return;
        }

        BotRegistrationDraft draft = registrationDrafts.get(chatId);
        if (draft == null || draft.getName() == null || draft.getName().trim().isEmpty()) {
            clearConversationState();
            setCurrentState(BotConversationState.WAITING_REGISTER_NAME);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_REGISTER_NAME.getMessage(), telegramClient, null);
            exit = true;
            return;
        }

        draft.setEmail(requestText.trim());
        setCurrentState(BotConversationState.WAITING_REGISTER_PASSWORD);
        BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_REGISTER_PASSWORD.getMessage(), telegramClient, null);
        exit = true;
    }

    private void handleRegisterPassword() {
        String password = requestText.trim();
        if (password.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_REGISTER_PASSWORD.getMessage(), telegramClient, null);
            exit = true;
            return;
        }
        BotRegistrationDraft draft = registrationDrafts.computeIfAbsent(chatId, k -> new BotRegistrationDraft());
        draft.setPassword(password);
        setCurrentState(BotConversationState.WAITING_REGISTER_PASSWORD_CONFIRM);
        BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_REGISTER_PASSWORD_CONFIRM.getMessage(), telegramClient, null);
        exit = true;
    }

    private void handleRegisterPasswordConfirm() {
        BotRegistrationDraft draft = registrationDrafts.get(chatId);
        if (draft == null) {
            clearConversationState();
            BotHelper.sendMessageToTelegram(chatId, "Error in registration. Use /register to start over.", telegramClient, null);
            exit = true;
            return;
        }

        if (!requestText.trim().equals(draft.getPassword())) {
            // Mismatch — clear password and ask again from the password step
            draft.setPassword(null);
            setCurrentState(BotConversationState.WAITING_REGISTER_PASSWORD);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.PASSWORD_MISMATCH.getMessage(), telegramClient, null);
            exit = true;
            return;
        }

        UserTT user = new UserTT();
        user.setNameUser(draft.getName());
        user.setMail(draft.getEmail());
        user.setPassword(draft.getPassword());
        user.setRole("developer");
        user.setIdTelegram(telegramIdentity);
        userTTService.addUser(user);

        clearConversationState();
        BotHelper.sendMessageToTelegram(chatId, BotMessages.REGISTER_COMPLETED.getMessage(), telegramClient, null);
        exit = true;
    }

    // ─── Task creation handlers ──────────────────────────────────────────

    private void handleNewItemName() {
        BotTaskDraft draft = taskDrafts.computeIfAbsent(chatId, k -> new BotTaskDraft());
        draft.setName(requestText.trim());
        setCurrentState(BotConversationState.WAITING_NEW_ITEM_STORY_POINTS);
        BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_NEW_ITEM_STORY_POINTS.getMessage(), telegramClient, null);
        exit = true;
    }

    private void handleNewItemStoryPoints() {
        try {
            int sp = Integer.parseInt(requestText.trim());
            BotTaskDraft draft = taskDrafts.computeIfAbsent(chatId, k -> new BotTaskDraft());
            draft.setStoryPoints(sp);
            setCurrentState(BotConversationState.WAITING_NEW_ITEM_PRIORITY);
            showPriorityButtons();
        } catch (NumberFormatException e) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.INVALID_STORY_POINTS.getMessage(), telegramClient, null);
        }
        exit = true;
    }

    private void showPriorityButtons() {
        InlineKeyboardMarkup keyboard = InlineKeyboardMarkup.builder()
            .keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder().text("🟢 Bajo").callbackData("PRIO:low").build(),
                InlineKeyboardButton.builder().text("🟡 Medio").callbackData("PRIO:medium").build(),
                InlineKeyboardButton.builder().text("🔴 Alto").callbackData("PRIO:high").build()
            ))
            .build();
        BotHelper.sendMessageToTelegramButtons(chatId, BotMessages.SELECT_PRIORITY.getMessage(), telegramClient, keyboard);
    }

    private void handleNewItemPriority() {
        if (!requestText.startsWith("PRIO:")) {
            showPriorityButtons();
            exit = true;
            return;
        }
        String priority = requestText.substring(5);
        if (!priority.equals("low") && !priority.equals("medium") && !priority.equals("high")) {
            showPriorityButtons();
            exit = true;
            return;
        }
        BotTaskDraft draft = taskDrafts.computeIfAbsent(chatId, k -> new BotTaskDraft());
        draft.setPriority(priority);
        setCurrentState(BotConversationState.WAITING_NEW_ITEM_SPRINT);
        showSprintSelection();
        exit = true;
    }

    private void showSprintSelection() {
        List<SprintTT> available = getAvailableSprints();

        if (available.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.NO_SPRINTS_CREATED.getMessage(), telegramClient, null);
            clearConversationState();
            return;
        }

        var builder = InlineKeyboardMarkup.builder();
        for (SprintTT sprint : available) {
            String label = sprint.getNameSprint()
                + " (" + sprint.getDateStartSpr() + " → " + sprint.getDateEndSpr() + ")";
            builder.keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder()
                    .text(label)
                    .callbackData("SPRINT:" + sprint.getSprId())
                    .build()
            ));
        }
        BotHelper.sendMessageToTelegramButtons(chatId, BotMessages.SELECT_SPRINT.getMessage(), telegramClient, builder.build());
    }

    /**
     * Returns sprints with state != 'done'.
     * Seeds the DB with 3 test sprints the first time this returns empty.
     */
    private List<SprintTT> getAvailableSprints() {
        List<SprintTT> available = sprintTTService.findAll().stream()
            .filter(s -> !"done".equals(s.getStateSprint()))
            .collect(Collectors.toList());

        if (available.isEmpty()) {
            seedSprints();
            available = sprintTTService.findAll().stream()
                .filter(s -> !"done".equals(s.getStateSprint()))
                .collect(Collectors.toList());
        }
        return available;
    }

    /** Creates a seed project + 3 active sprints when the DB is empty. */
    private void seedSprints() {
        logger.info("No active sprints found — seeding test data...");
        List<ProjectTT> projects = projectTTService.findAll();
        long pjId;
        if (projects.isEmpty()) {
            ProjectTT seed = new ProjectTT();
            seed.setNamePj("Demo Project");
            seed.setDateStartPj(LocalDate.now());
            seed.setDateEndSetPj(LocalDate.now().plusMonths(3));
            pjId = projectTTService.addProject(seed).getPjId();
        } else {
            pjId = projects.get(0).getPjId();
        }

        SprintTT s1 = new SprintTT();
        s1.setNameSprint("Sprint 1: Setup");
        s1.setDateStartSpr(LocalDate.now());
        s1.setDateEndSpr(LocalDate.now().plusWeeks(2));
        s1.setTaskGoal(20);
        s1.setStateSprint("active");
        s1.setPjId(pjId);
        sprintTTService.addSprint(s1);

        SprintTT s2 = new SprintTT();
        s2.setNameSprint("Sprint 2: Features");
        s2.setDateStartSpr(LocalDate.now().plusWeeks(2));
        s2.setDateEndSpr(LocalDate.now().plusWeeks(4));
        s2.setTaskGoal(25);
        s2.setStateSprint("active");
        s2.setPjId(pjId);
        sprintTTService.addSprint(s2);

        SprintTT s3 = new SprintTT();
        s3.setNameSprint("Sprint 3: Testing");
        s3.setDateStartSpr(LocalDate.now().plusWeeks(4));
        s3.setDateEndSpr(LocalDate.now().plusWeeks(6));
        s3.setTaskGoal(15);
        s3.setStateSprint("active");
        s3.setPjId(pjId);
        sprintTTService.addSprint(s3);

        logger.info("Seeded 3 sprints for pjId={}", pjId);
    }

    private void handleNewItemSprint() {
        if (!requestText.startsWith("SPRINT:")) {
            showSprintSelection();
            exit = true;
            return;
        }

        long sprintId;
        try {
            sprintId = Long.parseLong(requestText.substring(7));
        } catch (NumberFormatException e) {
            showSprintSelection();
            exit = true;
            return;
        }

        BotTaskDraft draft = taskDrafts.get(chatId);
        if (draft == null) {
            clearConversationState();
            BotHelper.sendMessageToTelegram(chatId, "Error creating task. Try again with /additem.", telegramClient, null);
            exit = true;
            return;
        }

        UserTT currentUser = getAuthenticatedUser();

        SprintTT sprint = sprintTTService.getSprintById(sprintId).getBody();
        if (sprint == null) {
            BotHelper.sendMessageToTelegram(chatId, "Sprint not found. Select another.", telegramClient, null);
            showSprintSelection();
            exit = true;
            return;
        }

        TaskTT task = new TaskTT();
        task.setNameTask(draft.getName());
        task.setStoryPoints(draft.getStoryPoints());
        task.setDateStartTask(sprint.getDateStartSpr());
        task.setDateEndSetTask(sprint.getDateEndSpr());
        task.setPriority(draft.getPriority());
        task.setUserId(currentUser.getUserId());
        task.setPjId(sprint.getPjId());

        try {
            TaskTT saved = taskTTService.addTask(task);
            sprintTaskTTService.addTaskToSprint(sprintId, saved.getTaskId());
        } catch (Exception e) {
            logger.error("Error saving task: {}", e.getMessage(), e);
            BotHelper.sendMessageToTelegram(chatId, "Error saving task. Try again.", telegramClient, null);
            exit = true;
            return;
        }

        clearConversationState();
        BotHelper.sendMessageToTelegram(chatId, BotMessages.TASK_ADDED.getMessage(), telegramClient, null);
        showMainMenu(); 
        exit = true;
    }

    // ─── Other actions ───────────────────────────────────────────────────

    public void fnListAll() {
        if (exit) return;
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, "❌ You must log in first. Use /login", telegramClient, null);
            exit = true;
            return;
        }

        if (!(requestText.equals(BotCommands.TODO_LIST.getCommand())
                || requestText.equals(BotLabels.LIST_ALL_ITEMS.getLabel())
                || requestText.equals(BotLabels.MY_TODO_LIST.getLabel())))
            return;

        UserTT user = getAuthenticatedUser();
        List<TaskTT> tasks = taskTTService.getTasksByUserInActiveSprint(user.getUserId());

        StringBuilder sb = new StringBuilder();
        sb.append("📋 MY TASKS - ACTIVE SPRINT\n\n");

        if (tasks.isEmpty()) {
            sb.append("You have no tasks in the active sprint.");
        } else {
            List<TaskTT> pending = tasks.stream()
                .filter(t -> t.getDateEndRealTask() == null).collect(Collectors.toList());
            List<TaskTT> done = tasks.stream()
                .filter(t -> t.getDateEndRealTask() != null).collect(Collectors.toList());

            if (!pending.isEmpty()) {
                sb.append("⏳ *PENDING TASKS*\n");
                String[] pHeaders = {"PRIO", "TASK", "SP", "DUE DATE"};
                List<String[]> pRows = new ArrayList<>();
                for (TaskTT t : pending) {
                    String prio = "high".equals(t.getPriority()) ? "HIGH"
                        : "medium".equals(t.getPriority()) ? "MED" : "LOW";
                    String name = wrap(t.getNameTask() != null ? t.getNameTask() : "-", 15);
                    String sp   = t.getStoryPoints() != null ? t.getStoryPoints() + " SP" : "-";
                    String date = t.getDateEndSetTask() != null
                        ? t.getDateEndSetTask().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "-";
                    pRows.add(new String[]{prio, name, sp, date});
                }
                sb.append(buildTable(pHeaders, pRows)).append("\n");
            }

            if (!done.isEmpty()) {
                sb.append("✅ *COMPLETED TASKS*\n");
                String[] dHeaders = {"TASK", "DELIVERED"};
                List<String[]> dRows = new ArrayList<>();
                for (TaskTT t : done) {
                    String name = wrap(t.getNameTask() != null ? t.getNameTask() : "-", 25);
                    String date = t.getDateEndRealTask() != null
                        ? t.getDateEndRealTask().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "-";
                    dRows.add(new String[]{name, date});
                }
                sb.append(buildTable(dHeaders, dRows));
            }
        }

        BotHelper.sendMessageToTelegram(chatId, sb.toString(), telegramClient, null);
        showMainMenu();
        exit = true;
    }

    public void fnAddItem() {
        if (exit) return;
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, "❌ You must log in first. Use /login", telegramClient, null);
            exit = true;
            return;
        }
        
        logger.info("Adding item");
        if (!(requestText.contains(BotCommands.ADD_ITEM.getCommand())
                || requestText.contains(BotLabels.ADD_NEW_ITEM.getLabel())))
            return;

        taskDrafts.put(chatId, new BotTaskDraft());
        setCurrentState(BotConversationState.WAITING_NEW_ITEM_NAME);
        BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_NEW_TODO_ITEM.getMessage(), telegramClient);
        exit = true;
    }

    public void fnElse() {
        if (exit) return;
        BotHelper.sendMessageToTelegram(
            chatId,
            "Select a valid option, use /additem to add a task or /register to register.",
            telegramClient,
            null
        );
        exit = true;
    }

    public void fnLLM() {
        logger.info("Calling LLM");
        if (!requestText.contains(BotCommands.LLM_REQ.getCommand()) || exit) return;

        if (deepSeekService == null) {
            BotHelper.sendMessageToTelegram(chatId, "The LLM function is disabled.", telegramClient, null);
            exit = true;
            return;
        }

        String out;
        try {
            out = deepSeekService.generateText("Give me the weather data in mty");
        } catch (Exception exc) {
            logger.error(exc.getLocalizedMessage(), exc);
            out = "Could not consult the LLM service.";
        }
        BotHelper.sendMessageToTelegram(chatId, "LLM: " + out, telegramClient, null);
        exit = true;
    }

    public void fnStatus() {
        if (exit) return;
        if (!requestText.trim().equals(BotCommands.STATUS.getCommand())) return;

        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, "❌ You must log in first. Use /login", telegramClient, null);
            exit = true;
            return;
        }

        UserTT user = getAuthenticatedUser();
        List<TaskTT> tasks = taskTTService.getTasksByUserInActiveSprint(user.getUserId());

        StringBuilder sb = new StringBuilder();
        sb.append("📊 PROGRESS - ACTIVE SPRINT\n\n");

        if (tasks.isEmpty()) {
            sb.append("You have no tasks in the active sprint.");
        } else {
            long done    = tasks.stream().filter(t -> t.getDateEndRealTask() != null).count();
            long pending = tasks.stream().filter(t -> t.getDateEndRealTask() == null).count();
            sb.append("✅ Completed: ").append(done).append("\n");
            sb.append("⏳ Pending:  ").append(pending).append("\n");
            sb.append("📦 Total:       ").append(tasks.size());
            if (pending == 0) sb.append("\n\n🎉 All your tasks are completed!");
        }

        BotHelper.sendMessageToTelegram(chatId, sb.toString(), telegramClient, null);
        showMainMenu();
        exit = true;
    }

    public void fnShowDonePicker() {
        if (exit) return;
        if (!requestText.trim().equals(BotCommands.MARK_DONE.getCommand())) return;

        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, "❌ You must log in first.", telegramClient, null);
            exit = true;
            return;
        }

        UserTT user = getAuthenticatedUser();
        List<TaskTT> pending = taskTTService.getTasksByUserInActiveSprint(user.getUserId()).stream()
            .filter(t -> t.getDateEndRealTask() == null)
            .collect(Collectors.toList());

        if (pending.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, "✅ You have no pending tasks.", telegramClient, null);
            showMainMenu();
            exit = true;
            return;
        }

        StringBuilder sb = new StringBuilder();
        sb.append("SELECT A TASK TO MARK AS DONE:\n\n");
        sb.append("```\n");
        for (int i = 0; i < pending.size(); i++) {
            TaskTT t = pending.get(i);
            String prioEmoji = "high".equals(t.getPriority()) ? "🔴 HIGH"
                : "medium".equals(t.getPriority()) ? "🟡 MED" : "🟢 LOW";
            String taskName = t.getNameTask();
            String sp = String.format("%2d", t.getStoryPoints());
            sb.append(prioEmoji).append(" | ").append(taskName).append(" | ")
              .append(sp).append(" SP\n");
        }
        sb.append("```\n");

        var builder = InlineKeyboardMarkup.builder();
        for (TaskTT t : pending) {
            String prioEmoji = "high".equals(t.getPriority()) ? "🔴"
                : "medium".equals(t.getPriority()) ? "🟡" : "🟢";
            builder.keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder()
                    .text(prioEmoji + " " + t.getNameTask() + " (" + t.getStoryPoints() + " SP)")
                    .callbackData("DONE_TASK:" + t.getTaskId())
                    .build()
            ));
        }
        BotHelper.sendMessageToTelegramButtons(chatId, sb.toString(), telegramClient, builder.build());
        exit = true;
    }

    public void fnMarkTaskDone() {
        if (exit) return;
        if (!requestText.startsWith("DONE_TASK:")) return;

        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, "❌ You must log in first.", telegramClient, null);
            exit = true;
            return;
        }

        long taskId;
        try {
            taskId = Long.parseLong(requestText.substring(10));
        } catch (NumberFormatException e) {
            BotHelper.sendMessageToTelegram(chatId, "Invalid task.", telegramClient, null);
            exit = true;
            return;
        }

        TaskTT task = taskTTService.getTaskById(taskId).getBody();
        if (task == null || task.getUserId() != getAuthenticatedUser().getUserId()) {
            BotHelper.sendMessageToTelegram(chatId, "❌ Task not found or does not belong to you.", telegramClient, null);
            exit = true;
            return;
        }

        task.setDateEndRealTask(LocalDate.now());
        taskTTService.updateTask(taskId, task);

        // Update SPRINT_TASK_TT.state_task from "active" → "done"
        sprintTaskTTService.getSprintsForTask(taskId).stream()
            .filter(st -> "active".equals(st.getStateTask()))
            .findFirst()
            .ifPresent(st -> sprintTaskTTService.updateTaskState(
                st.getId().getSprId(), taskId, "done"));

        boolean onTime = !LocalDate.now().isAfter(task.getDateEndSetTask());
        String resultado = onTime ? "⏱ delivered on time!" : "⚠️ delivered late.";
        BotHelper.sendMessageToTelegram(
            chatId, "✅ " + task.getNameTask() + " completed - " + resultado, telegramClient, null);

        showMainMenu();
        exit = true;
    }

    private String buildTable(String[] headers, List<String[]> rows) {
        int cols = headers.length;
        int[] widths = new int[cols];
        for (int i = 0; i < cols; i++) widths[i] = headers[i].length();
        for (String[] row : rows)
            for (int i = 0; i < cols; i++)
                for (String line : row[i].split("\n", -1))
                    widths[i] = Math.max(widths[i], line.length());

        StringBuilder t = new StringBuilder("```\n");
        for (int i = 0; i < cols; i++) {
            t.append(padRight(headers[i], widths[i]));
            if (i < cols - 1) t.append(" | ");
        }
        t.append("\n");
        for (int i = 0; i < cols; i++) {
            t.append("-".repeat(widths[i]));
            if (i < cols - 1) t.append("-+-");
        }
        t.append("\n");
        for (String[] row : rows) {
            String[][] cellLines = new String[cols][];
            int maxLines = 1;
            for (int i = 0; i < cols; i++) {
                cellLines[i] = row[i].split("\n", -1);
                maxLines = Math.max(maxLines, cellLines[i].length);
            }
            for (int l = 0; l < maxLines; l++) {
                for (int i = 0; i < cols; i++) {
                    String cell = l < cellLines[i].length ? cellLines[i][l] : "";
                    t.append(padRight(cell, widths[i]));
                    if (i < cols - 1) t.append(" | ");
                }
                t.append("\n");
            }
        }
        t.append("```\n");
        return t.toString();
    }

    private String padRight(String s, int n) {
        return String.format("%-" + n + "s", s);
    }

    private String wrap(String s, int max) {
        if (s.length() <= max) return s;
        StringBuilder sb = new StringBuilder();
        while (s.length() > max) {
            sb.append(s, 0, max).append("\n");
            s = s.substring(max);
        }
        sb.append(s);
        return sb.toString();
    }
}
