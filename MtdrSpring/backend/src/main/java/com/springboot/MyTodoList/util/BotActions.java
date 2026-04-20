package com.springboot.MyTodoList.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
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

import com.springboot.MyTodoList.model.FeatureTT;
import com.springboot.MyTodoList.model.ProjectTT;
import com.springboot.MyTodoList.model.SprintTT;
import com.springboot.MyTodoList.model.TaskTT;
import com.springboot.MyTodoList.model.ToDoItem;
import com.springboot.MyTodoList.model.UserTT;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.FeatureTTService;
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
    private static final Map<Long, BotRegistrationDraft> registrationDrafts = new ConcurrentHashMap<>();
    private static final Map<Long, BotTaskDraft> taskDrafts = new ConcurrentHashMap<>();
    private static final Map<Long, BotFeatureDraft> featureDrafts = new ConcurrentHashMap<>();
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
    FeatureTTService featureTTService;

    public BotActions(TelegramClient tc, ToDoItemService ts, DeepSeekService ds,
                      UserTTService uts, SprintTTService stts,
                      ProjectTTService ptts, SprintTaskTTService sttts,
                      TaskTTService ttts, FeatureTTService ftts) {
        telegramClient = tc;
        todoService = ts;
        deepSeekService = ds;
        userTTService = uts;
        sprintTTService = stts;
        projectTTService = ptts;
        sprintTaskTTService = sttts;
        taskTTService = ttts;
        featureTTService = ftts;
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
        featureDrafts.remove(chatId);
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
                    .text("🗂 Add Feature")
                    .callbackData(BotCommands.ADD_FEATURE.getCommand())
                    .build()
            ))
            .keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder()
                    .text("✅ Complete Task")
                    .callbackData(BotCommands.MARK_DONE.getCommand())
                    .build(),
                InlineKeyboardButton.builder()
                    .text("↩️ Reopen Task")
                    .callbackData(BotCommands.MARK_UNDO.getCommand())
                    .build()
            ))
            .keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder()
                    .text("✏️ Edit Task")
                    .callbackData(BotCommands.EDIT_TASK.getCommand())
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
        // Handled by fnMarkTaskDone() via DONE_TASK:{id} callback — this method is a no-op.
    }

    public void fnUndo() {
        if (exit) return;
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, "❌ You must log in first. Use /login", telegramClient, null);
            exit = true;
            return;
        }

        String cmd = requestText.trim();
        if (!cmd.equals(BotCommands.MARK_UNDO.getCommand())
                && !cmd.equals(BotCommands.MARK_REWORK.getCommand())) return;

        UserTT user = getAuthenticatedUser();
        List<TaskTT> completed = taskTTService.getTasksByUserInActiveSprint(user.getUserId()).stream()
            .filter(t -> t.getDateEndRealTask() != null)
            .collect(Collectors.toList());

        if (completed.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, "↩️ You have no completed tasks to reopen.", telegramClient, null);
            showMainMenu();
            exit = true;
            return;
        }

        var builder = InlineKeyboardMarkup.builder();
        for (TaskTT t : completed) {
            String label = prioEmoji(t.getPriority()) + " " + t.getNameTask()
                + " (" + t.getStoryPoints() + " SP)";
            builder.keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder()
                    .text(label)
                    .callbackData("UNDO_TASK:" + t.getTaskId())
                    .build()
            ));
        }
        BotHelper.sendMessageToTelegramButtons(
            chatId, "↩️ Select a task to reopen:", telegramClient, builder.build());
        exit = true;
    }

    public void fnMarkTaskUndo() {
        if (exit) return;
        if (!requestText.startsWith("UNDO_TASK:")) return;

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
            BotHelper.sendMessageToTelegram(
                chatId, "❌ Task not found or does not belong to you.", telegramClient, null);
            exit = true;
            return;
        }

        task.setDateEndRealTask(null);
        taskTTService.updateTask(taskId, task);

        sprintTaskTTService.getSprintsForTask(taskId).stream()
            .filter(st -> "done".equals(st.getStateTask()))
            .findFirst()
            .ifPresent(st -> sprintTaskTTService.updateTaskState(
                st.getId().getSprId(), taskId, "active"));

        BotHelper.sendMessageToTelegram(
            chatId, "↩️ " + task.getNameTask() + " reopened successfully!", telegramClient, null);
        showMainMenu();
        exit = true;
    }

    public void fnDelete() {
        // fnDelete used the legacy ToDoItem model — no longer supported.
    }

    public void fnHide() {
        if (exit) return;

        String trimmedText = requestText.trim();
        if (!trimmedText.equals(BotCommands.HIDE_COMMAND.getCommand())
                && !trimmedText.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel())) {
            return;
        }

        clearConversationState();
        authenticatedUsers.remove(chatId);
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
            case WAITING_REGISTER_NAME:             handleRegisterName();            break;
            case WAITING_REGISTER_EMAIL:            handleRegisterEmail();           break;
            case WAITING_REGISTER_PASSWORD:         handleRegisterPassword();        break;
            case WAITING_REGISTER_PASSWORD_CONFIRM: handleRegisterPasswordConfirm(); break;
            case WAITING_NEW_ITEM_NAME:             handleNewItemName();             break;
            case WAITING_NEW_ITEM_STORY_POINTS:     handleNewItemStoryPoints();      break;
            case WAITING_NEW_ITEM_PRIORITY:         handleNewItemPriority();         break;
            case WAITING_NEW_ITEM_SPRINT:           handleNewItemSprint();           break;
            case WAITING_NEW_ITEM_FEATURE:          handleNewItemFeature();          break;
            case WAITING_NEW_FEATURE_NAME:          handleNewFeatureName();          break;
            case WAITING_NEW_FEATURE_PRIORITY:      handleNewFeaturePriority();      break;
            case WAITING_NEW_FEATURE_SPRINT:        handleNewFeatureSprint();        break;
            case WAITING_EDIT_TASK_FIELD:           handleEditTaskField();           break;
            case WAITING_EDIT_TASK_NEW_NAME:        handleEditTaskNewName();         break;
            case WAITING_EDIT_TASK_NEW_SP:          handleEditTaskNewSP();           break;
            case WAITING_EDIT_TASK_NEW_PRIORITY:    handleEditTaskNewPriority();     break;
            case WAITING_EDIT_TASK_NEW_SPRINT:      handleEditTaskNewSprint();       break;
            default: break;
        }
    }

    // ─── Registration handlers ───────────────────────────────────────────

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
                InlineKeyboardButton.builder().text("🟢 Low").callbackData("PRIO:low").build(),
                InlineKeyboardButton.builder().text("🟡 Medium").callbackData("PRIO:medium").build(),
                InlineKeyboardButton.builder().text("🔴 High").callbackData("PRIO:high").build()
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
            String stateTag = "inactive".equals(sprint.getStateSprint()) ? " 🕐" : " ✅";
            String label = sprint.getNameSprint()
                + stateTag
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
        s2.setStateSprint("inactive");  // future sprint — activated by process_sprint_transitions
        s2.setPjId(pjId);
        sprintTTService.addSprint(s2);

        SprintTT s3 = new SprintTT();
        s3.setNameSprint("Sprint 3: Testing");
        s3.setDateStartSpr(LocalDate.now().plusWeeks(4));
        s3.setDateEndSpr(LocalDate.now().plusWeeks(6));
        s3.setTaskGoal(15);
        s3.setStateSprint("inactive");  // future sprint — activated by process_sprint_transitions
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

        BotTaskDraft draft = taskDrafts.computeIfAbsent(chatId, k -> new BotTaskDraft());
        draft.setSprintId(sprintId);

        // Advance to feature selection filtered by the chosen sprint
        setCurrentState(BotConversationState.WAITING_NEW_ITEM_FEATURE);
        showFeatureSelectionForSprint(sprintId);
        exit = true;
    }

    private void showFeatureSelectionForSprint(long sprintId) {
        List<FeatureTT> features = featureTTService.getFeaturesBySprint(sprintId);

        var builder = InlineKeyboardMarkup.builder();

        if (features.isEmpty()) {
            builder.keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder()
                    .text("— No feature —")
                    .callbackData("FEATURE:none")
                    .build()
            ));
            BotHelper.sendMessageToTelegramButtons(
                chatId,
                "⚠️ " + BotMessages.NO_FEATURES_FOR_SPRINT.getMessage(),
                telegramClient, builder.build());
            return;
        }

        for (FeatureTT f : features) {
            builder.keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder()
                    .text("🗂 " + f.getNameFeature())
                    .callbackData("FEATURE:" + f.getFeatureId())
                    .build()
            ));
        }
        builder.keyboardRow(new InlineKeyboardRow(
            InlineKeyboardButton.builder()
                .text("— No feature —")
                .callbackData("FEATURE:none")
                .build()
        ));

        BotHelper.sendMessageToTelegramButtons(
            chatId, BotMessages.SELECT_FEATURE.getMessage(), telegramClient, builder.build());
    }

    private void handleNewItemFeature() {
        if (!requestText.startsWith("FEATURE:")) {
            BotTaskDraft draft = taskDrafts.get(chatId);
            long sprintId = draft != null ? draft.getSprintId() : 0;
            showFeatureSelectionForSprint(sprintId);
            exit = true;
            return;
        }

        BotTaskDraft draft = taskDrafts.get(chatId);
        if (draft == null) {
            clearConversationState();
            BotHelper.sendMessageToTelegram(chatId, "Error creating task. Try again with /addtask.", telegramClient, null);
            exit = true;
            return;
        }

        String featureToken = requestText.substring(8);
        if (!"none".equals(featureToken)) {
            try {
                draft.setFeatureId(Long.parseLong(featureToken));
            } catch (NumberFormatException e) {
                draft.setFeatureId(null);
            }
        }

        saveTaskFromDraft(draft);
        exit = true;
    }

    private void saveTaskFromDraft(BotTaskDraft draft) {
        long sprintId = draft.getSprintId();
        SprintTT sprint = sprintTTService.getSprintById(sprintId).getBody();
        if (sprint == null) {
            BotHelper.sendMessageToTelegram(chatId, "Sprint not found. Select another.", telegramClient, null);
            clearConversationState();
            return;
        }

        UserTT currentUser = getAuthenticatedUser();

        TaskTT task = new TaskTT();
        task.setNameTask(draft.getName());
        task.setStoryPoints(draft.getStoryPoints());
        task.setDateStartTask(sprint.getDateStartSpr());
        task.setDateEndSetTask(sprint.getDateEndSpr());
        task.setPriority(draft.getPriority());
        task.setFeatureId(draft.getFeatureId());
        task.setUserId(currentUser.getUserId());
        task.setPjId(sprint.getPjId());

        try {
            TaskTT saved = taskTTService.addTask(task);
            sprintTaskTTService.addTaskToSprint(sprintId, saved.getTaskId());
        } catch (Exception e) {
            logger.error("Error saving task: {}", e.getMessage(), e);
            BotHelper.sendMessageToTelegram(chatId, "Error saving task. Try again.", telegramClient, null);
            return;
        }

        clearConversationState();
        BotHelper.sendMessageToTelegram(chatId, BotMessages.TASK_ADDED.getMessage(), telegramClient, null);
        showMainMenu();
    }

    // ─── Feature creation handlers ───────────────────────────────────────

    public void fnAddFeature() {
        if (exit) return;
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, "❌ You must log in first. Use /login", telegramClient, null);
            exit = true;
            return;
        }

        if (!requestText.contains(BotCommands.ADD_FEATURE.getCommand())) return;

        featureDrafts.put(chatId, new BotFeatureDraft());
        setCurrentState(BotConversationState.WAITING_NEW_FEATURE_NAME);
        BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_NEW_FEATURE_NAME.getMessage(), telegramClient, null);
        exit = true;
    }

    private void handleNewFeatureName() {
        BotFeatureDraft draft = featureDrafts.computeIfAbsent(chatId, k -> new BotFeatureDraft());
        draft.setName(requestText.trim());
        draft.setPriority("medium");  // default — priority not asked to the user
        setCurrentState(BotConversationState.WAITING_NEW_FEATURE_SPRINT);
        showFeatureSprintSelection();
        exit = true;
    }

    private void showFeaturePriorityButtons() {
        InlineKeyboardMarkup keyboard = InlineKeyboardMarkup.builder()
            .keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder().text("🟢 Low").callbackData("FPRIO:low").build(),
                InlineKeyboardButton.builder().text("🟡 Medium").callbackData("FPRIO:medium").build(),
                InlineKeyboardButton.builder().text("🔴 High").callbackData("FPRIO:high").build()
            ))
            .build();
        BotHelper.sendMessageToTelegramButtons(chatId, BotMessages.SELECT_FEATURE_PRIORITY.getMessage(), telegramClient, keyboard);
    }

    private void handleNewFeaturePriority() {
        if (!requestText.startsWith("FPRIO:")) {
            showFeaturePriorityButtons();
            exit = true;
            return;
        }
        String priority = requestText.substring(6);
        if (!priority.equals("low") && !priority.equals("medium") && !priority.equals("high")) {
            showFeaturePriorityButtons();
            exit = true;
            return;
        }
        BotFeatureDraft draft = featureDrafts.computeIfAbsent(chatId, k -> new BotFeatureDraft());
        draft.setPriority(priority);
        setCurrentState(BotConversationState.WAITING_NEW_FEATURE_SPRINT);
        showFeatureSprintSelection();
        exit = true;
    }

    private void showFeatureSprintSelection() {
        List<SprintTT> available = getAvailableSprints();

        if (available.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.NO_SPRINTS_CREATED.getMessage(), telegramClient, null);
            clearConversationState();
            return;
        }

        var builder = InlineKeyboardMarkup.builder();
        for (SprintTT sprint : available) {
            String stateTag = "inactive".equals(sprint.getStateSprint()) ? " 🕐" : " ✅";
            String label = sprint.getNameSprint()
                + stateTag
                + " (" + sprint.getDateStartSpr() + " → " + sprint.getDateEndSpr() + ")";
            builder.keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder()
                    .text(label)
                    .callbackData("FSPRINT:" + sprint.getSprId())
                    .build()
            ));
        }
        BotHelper.sendMessageToTelegramButtons(
            chatId, BotMessages.SELECT_FEATURE_SPRINT.getMessage(), telegramClient, builder.build());
    }

    private void handleNewFeatureSprint() {
        if (!requestText.startsWith("FSPRINT:")) {
            showFeatureSprintSelection();
            exit = true;
            return;
        }

        long sprintId;
        try {
            sprintId = Long.parseLong(requestText.substring(8));
        } catch (NumberFormatException e) {
            showFeatureSprintSelection();
            exit = true;
            return;
        }

        BotFeatureDraft draft = featureDrafts.get(chatId);
        if (draft == null) {
            clearConversationState();
            BotHelper.sendMessageToTelegram(chatId, "Error creating feature. Try again with /addfeature.", telegramClient, null);
            exit = true;
            return;
        }

        draft.setSprintId(sprintId);

        FeatureTT feature = new FeatureTT();
        feature.setNameFeature(draft.getName());
        feature.setPriorityFeature(draft.getPriority());
        feature.setSprId(sprintId);

        try {
            featureTTService.addFeature(feature);
        } catch (Exception e) {
            logger.error("Error saving feature: {}", e.getMessage(), e);
            BotHelper.sendMessageToTelegram(chatId, "Error saving feature. Try again.", telegramClient, null);
            exit = true;
            return;
        }

        clearConversationState();
        BotHelper.sendMessageToTelegram(chatId, BotMessages.FEATURE_ADDED.getMessage(), telegramClient, null);
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

        UserTT me = getAuthenticatedUser();

        // Only my tasks in the active sprint
        List<TaskTT> myTasks = taskTTService.getTasksByUserInActiveSprint(me.getUserId());

        List<TaskTT> myPending = myTasks.stream()
            .filter(t -> t.getDateEndRealTask() == null).collect(Collectors.toList());
        List<TaskTT> myDone = myTasks.stream()
            .filter(t -> t.getDateEndRealTask() != null).collect(Collectors.toList());

        // Group pending tasks by featureId — only features I have tasks in
        Map<Long, List<TaskTT>> byFeature = myPending.stream()
            .filter(t -> t.getFeatureId() != null)
            .collect(Collectors.groupingBy(TaskTT::getFeatureId));

        List<TaskTT> noFeaturePending = myPending.stream()
            .filter(t -> t.getFeatureId() == null)
            .collect(Collectors.toList());

        StringBuilder sb = new StringBuilder();
        sb.append("📋 *My Tasks — Active Sprint*\n\n");

        if (myTasks.isEmpty()) {
            sb.append("You have no tasks in the active sprint.");
            BotHelper.sendMessageToTelegram(chatId, sb.toString(), telegramClient, null);
            showMainMenu();
            exit = true;
            return;
        }

        // ── Features where I have tasks ───────────────────────────────────────
        if (!byFeature.isEmpty()) {
            // Sort features by priority
            List<Long> sortedFeatureIds = byFeature.keySet().stream()
                .sorted(Comparator.comparingInt(fid -> {
                    FeatureTT f = featureTTService.getFeatureById(fid).getBody();
                    return f != null ? priorityOrder(f.getPriorityFeature()) : 99;
                }))
                .collect(Collectors.toList());

            for (Long featureId : sortedFeatureIds) {
                FeatureTT feature = featureTTService.getFeatureById(featureId).getBody();
                if (feature == null) continue;

                sb.append("🗂 *").append(feature.getNameFeature()).append("*\n");

                for (TaskTT t : byFeature.get(featureId)) {
                    sb.append("  ").append(prioEmoji(t.getPriority()))
                      .append(" ").append(t.getNameTask())
                      .append(" — ").append(t.getStoryPoints()).append(" SP")
                      .append(" | Due: ").append(t.getDateEndSetTask()).append("\n");
                }
                sb.append("\n");
            }
        }

        // ── No feature ────────────────────────────────────────────────────────
        if (!noFeaturePending.isEmpty()) {
            sb.append("🔹 *No feature*\n");
            for (TaskTT t : noFeaturePending) {
                sb.append("  ").append(prioEmoji(t.getPriority()))
                  .append(" ").append(t.getNameTask())
                  .append(" — ").append(t.getStoryPoints()).append(" SP")
                  .append(" | Due: ").append(t.getDateEndSetTask()).append("\n");
            }
            sb.append("\n");
        }

        // ── Completed ─────────────────────────────────────────────────────────
        if (!myDone.isEmpty()) {
            sb.append("✅ *Completed*\n");
            for (TaskTT t : myDone) {
                sb.append("• ").append(t.getNameTask())
                  .append(" — delivered: ").append(t.getDateEndRealTask()).append("\n");
            }
        }

        BotHelper.sendMessageToTelegram(chatId, sb.toString(), telegramClient, null);
        showMainMenu();
        exit = true;
    }

    // ─── Task edit flow ──────────────────────────────────────────────────

    public void fnShowEditPicker() {
        if (exit) return;
        if (!isUserAuthenticated()) {
            BotHelper.sendMessageToTelegram(chatId, "❌ You must log in first.", telegramClient, null);
            exit = true;
            return;
        }
        if (!requestText.trim().equals(BotCommands.EDIT_TASK.getCommand())) return;

        UserTT user = getAuthenticatedUser();
        List<TaskTT> pending = taskTTService.getTasksByUserInActiveSprint(user.getUserId()).stream()
            .filter(t -> t.getDateEndRealTask() == null)
            .collect(Collectors.toList());

        if (pending.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, "You have no pending tasks to edit.", telegramClient, null);
            showMainMenu();
            exit = true;
            return;
        }

        var builder = InlineKeyboardMarkup.builder();
        for (TaskTT t : pending) {
            String label = prioEmoji(t.getPriority()) + " " + t.getNameTask()
                + " (" + t.getStoryPoints() + " SP)";
            builder.keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder()
                    .text(label)
                    .callbackData("EDIT_PICK:" + t.getTaskId())
                    .build()
            ));
        }
        BotHelper.sendMessageToTelegramButtons(
            chatId, "✏️ Select a task to edit:", telegramClient, builder.build());
        exit = true;
    }

    public void fnEditPickTask() {
        if (exit) return;
        if (!requestText.startsWith("EDIT_PICK:")) return;
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

        BotTaskDraft draft = new BotTaskDraft();
        draft.setTaskId(taskId);
        taskDrafts.put(chatId, draft);
        setCurrentState(BotConversationState.WAITING_EDIT_TASK_FIELD);

        InlineKeyboardMarkup keyboard = InlineKeyboardMarkup.builder()
            .keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder().text("📝 Name").callbackData("EDIT_FIELD:name").build(),
                InlineKeyboardButton.builder().text("🔢 Story Points").callbackData("EDIT_FIELD:sp").build()
            ))
            .keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder().text("🎯 Priority").callbackData("EDIT_FIELD:priority").build(),
                InlineKeyboardButton.builder().text("🔄 Sprint").callbackData("EDIT_FIELD:sprint").build()
            ))
            .build();
        BotHelper.sendMessageToTelegramButtons(
            chatId, "What would you like to edit?", telegramClient, keyboard);
        exit = true;
    }

    private void handleEditTaskField() {
        if (!requestText.startsWith("EDIT_FIELD:")) {
            showEditFieldButtons();
            exit = true;
            return;
        }
        String field = requestText.substring(11);
        switch (field) {
            case "name":
                setCurrentState(BotConversationState.WAITING_EDIT_TASK_NEW_NAME);
                BotHelper.sendMessageToTelegram(chatId, "📝 Enter the new task name:", telegramClient, null);
                break;
            case "sp":
                setCurrentState(BotConversationState.WAITING_EDIT_TASK_NEW_SP);
                BotHelper.sendMessageToTelegram(chatId, "🔢 Enter the new story point value:", telegramClient, null);
                break;
            case "priority":
                setCurrentState(BotConversationState.WAITING_EDIT_TASK_NEW_PRIORITY);
                showPriorityButtons();
                break;
            case "sprint":
                setCurrentState(BotConversationState.WAITING_EDIT_TASK_NEW_SPRINT);
                showSprintSelection();
                break;
            default:
                BotHelper.sendMessageToTelegram(chatId, "Invalid option.", telegramClient, null);
        }
        exit = true;
    }

    private void showEditFieldButtons() {
        InlineKeyboardMarkup keyboard = InlineKeyboardMarkup.builder()
            .keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder().text("📝 Name").callbackData("EDIT_FIELD:name").build(),
                InlineKeyboardButton.builder().text("🔢 Story Points").callbackData("EDIT_FIELD:sp").build()
            ))
            .keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder().text("🎯 Priority").callbackData("EDIT_FIELD:priority").build(),
                InlineKeyboardButton.builder().text("🔄 Sprint").callbackData("EDIT_FIELD:sprint").build()
            ))
            .build();
        BotHelper.sendMessageToTelegramButtons(chatId, "Please select what to edit:", telegramClient, keyboard);
    }

    private void handleEditTaskNewName() {
        BotTaskDraft draft = taskDrafts.get(chatId);
        if (draft == null || draft.getTaskId() == null) {
            clearConversationState();
            BotHelper.sendMessageToTelegram(chatId, "Error. Please try again with /edittask.", telegramClient, null);
            exit = true;
            return;
        }
        TaskTT task = taskTTService.getTaskById(draft.getTaskId()).getBody();
        if (task == null) {
            clearConversationState();
            BotHelper.sendMessageToTelegram(chatId, "Task not found.", telegramClient, null);
            exit = true;
            return;
        }
        task.setNameTask(requestText.trim());
        taskTTService.updateTask(task.getTaskId(), task);
        clearConversationState();
        BotHelper.sendMessageToTelegram(chatId, "✅ Task name updated!", telegramClient, null);
        showMainMenu();
        exit = true;
    }

    private void handleEditTaskNewSP() {
        BotTaskDraft draft = taskDrafts.get(chatId);
        if (draft == null || draft.getTaskId() == null) {
            clearConversationState();
            BotHelper.sendMessageToTelegram(chatId, "Error. Please try again with /edittask.", telegramClient, null);
            exit = true;
            return;
        }
        try {
            int sp = Integer.parseInt(requestText.trim());
            TaskTT task = taskTTService.getTaskById(draft.getTaskId()).getBody();
            if (task == null) {
                clearConversationState();
                BotHelper.sendMessageToTelegram(chatId, "Task not found.", telegramClient, null);
                exit = true;
                return;
            }
            task.setStoryPoints(sp);
            taskTTService.updateTask(task.getTaskId(), task);
            clearConversationState();
            BotHelper.sendMessageToTelegram(chatId, "✅ Story points updated!", telegramClient, null);
            showMainMenu();
        } catch (NumberFormatException e) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.INVALID_STORY_POINTS.getMessage(), telegramClient, null);
        }
        exit = true;
    }

    private void handleEditTaskNewPriority() {
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
        BotTaskDraft draft = taskDrafts.get(chatId);
        if (draft == null || draft.getTaskId() == null) {
            clearConversationState();
            BotHelper.sendMessageToTelegram(chatId, "Error. Please try again with /edittask.", telegramClient, null);
            exit = true;
            return;
        }
        TaskTT task = taskTTService.getTaskById(draft.getTaskId()).getBody();
        if (task == null) {
            clearConversationState();
            BotHelper.sendMessageToTelegram(chatId, "Task not found.", telegramClient, null);
            exit = true;
            return;
        }
        task.setPriority(priority);
        taskTTService.updateTask(task.getTaskId(), task);
        clearConversationState();
        BotHelper.sendMessageToTelegram(chatId, "✅ Priority updated to " + prioEmoji(priority) + "!", telegramClient, null);
        showMainMenu();
        exit = true;
    }

    private void handleEditTaskNewSprint() {
        if (!requestText.startsWith("SPRINT:")) {
            showSprintSelection();
            exit = true;
            return;
        }

        long newSprintId;
        try {
            newSprintId = Long.parseLong(requestText.substring(7));
        } catch (NumberFormatException e) {
            showSprintSelection();
            exit = true;
            return;
        }

        BotTaskDraft draft = taskDrafts.get(chatId);
        if (draft == null || draft.getTaskId() == null) {
            clearConversationState();
            BotHelper.sendMessageToTelegram(chatId, "Error. Please try again with /edittask.", telegramClient, null);
            exit = true;
            return;
        }

        TaskTT task = taskTTService.getTaskById(draft.getTaskId()).getBody();
        SprintTT newSprint = sprintTTService.getSprintById(newSprintId).getBody();
        if (task == null || newSprint == null) {
            clearConversationState();
            BotHelper.sendMessageToTelegram(chatId, "Task or sprint not found.", telegramClient, null);
            exit = true;
            return;
        }

        List<com.springboot.MyTodoList.model.SprintTaskTT> currentSprints =
            sprintTaskTTService.getSprintsForTask(task.getTaskId());

        try {
            for (com.springboot.MyTodoList.model.SprintTaskTT st : currentSprints) {
                sprintTaskTTService.removeTaskFromSprint(st.getId().getSprId(), task.getTaskId());
            }
            sprintTaskTTService.addTaskToSprint(newSprintId, task.getTaskId());
        } catch (Exception e) {
            logger.error("Error moving task to sprint: {}", e.getMessage(), e);
            BotHelper.sendMessageToTelegram(chatId, "Error moving task to sprint. Try again.", telegramClient, null);
            exit = true;
            return;
        }

        // Sync task dates with the new sprint to keep KPI calculations consistent
        task.setDateStartTask(newSprint.getDateStartSpr());
        task.setDateEndSetTask(newSprint.getDateEndSpr());
        taskTTService.updateTask(task.getTaskId(), task);

        clearConversationState();
        BotHelper.sendMessageToTelegram(
            chatId, "🔄 Task moved to *" + newSprint.getNameSprint() + "* successfully!", telegramClient, null);
        showMainMenu();
        exit = true;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────

    private int priorityWeight(String priority) {
        if ("high".equals(priority))   return 3;
        if ("medium".equals(priority)) return 2;
        return 1;
    }

    private int safeInt(Integer value) {
        return value != null ? value : 0;
    }

    private String progressBar(int pct) {
        int filled = pct / 10;
        return "▓".repeat(filled) + "░".repeat(10 - filled);
    }

    private int priorityOrder(String priority) {
        if ("high".equals(priority))   return 0;
        if ("medium".equals(priority)) return 1;
        return 2;
    }

    private String prioEmoji(String priority) {
        if ("high".equals(priority))   return "🔴";
        if ("medium".equals(priority)) return "🟡";
        return "🟢";
    }

    private String resolveUserName(long userId) {
        UserTT u = userTTService.getUserById(userId).getBody();
        return u != null ? u.getNameUser() : "User #" + userId;
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
            "Select a valid option, use /addtask to add a task, /addfeature to create a feature, or /register to sign up.",
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
        sb.append("📊 *My Progress — Active Sprint*\n\n");

        if (tasks.isEmpty()) {
            sb.append("You have no tasks in the active sprint.");
            BotHelper.sendMessageToTelegram(chatId, sb.toString(), telegramClient, null);
            showMainMenu();
            exit = true;
            return;
        }

        // Group by featureId
        Map<Long, List<TaskTT>> byFeature = tasks.stream()
            .filter(t -> t.getFeatureId() != null)
            .collect(Collectors.groupingBy(TaskTT::getFeatureId));

        List<TaskTT> noFeature = tasks.stream()
            .filter(t -> t.getFeatureId() == null)
            .collect(Collectors.toList());

        // ── Per feature: weighted progress (SP × priority) ───────────────────
        for (Map.Entry<Long, List<TaskTT>> entry : byFeature.entrySet()) {
            FeatureTT feature = featureTTService.getFeatureById(entry.getKey()).getBody();
            String featureName = feature != null ? feature.getNameFeature() : "Feature #" + entry.getKey();
            List<TaskTT> ft = entry.getValue();

            int totalWeight = ft.stream()
                .mapToInt(t -> safeInt(t.getStoryPoints()) * priorityWeight(t.getPriority()))
                .sum();
            int doneWeight = ft.stream()
                .filter(t -> t.getDateEndRealTask() != null)
                .mapToInt(t -> safeInt(t.getStoryPoints()) * priorityWeight(t.getPriority()))
                .sum();

            int pct   = totalWeight > 0 ? doneWeight * 100 / totalWeight : 0;
            long done  = ft.stream().filter(t -> t.getDateEndRealTask() != null).count();
            int  total = ft.size();

            sb.append("🗂 *").append(featureName).append("*\n");
            sb.append("  ").append(progressBar(pct)).append(" *").append(pct).append("%*");
            sb.append("  (").append(done).append("/").append(total).append(" tasks)\n\n");
        }

        // ── No feature ────────────────────────────────────────────────────────
        if (!noFeature.isEmpty()) {
            long done  = noFeature.stream().filter(t -> t.getDateEndRealTask() != null).count();
            int  total = noFeature.size();
            int  pct   = total > 0 ? (int)(done * 100 / total) : 0;
            sb.append("🔹 *No feature*\n");
            sb.append("  ").append(progressBar(pct)).append(" *").append(pct).append("%*");
            sb.append("  (").append(done).append("/").append(total).append(" tasks)\n");
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

        sprintTaskTTService.getSprintsForTask(taskId).stream()
            .filter(st -> "active".equals(st.getStateTask()))
            .findFirst()
            .ifPresent(st -> sprintTaskTTService.updateTaskState(
                st.getId().getSprId(), taskId, "done"));

        boolean onTime = !LocalDate.now().isAfter(task.getDateEndSetTask());
        String resultado = onTime ? "⏱ delivered on time!" : "⚠️ delivered late.";
        BotHelper.sendMessageToTelegram(
            chatId, "✅ " + task.getNameTask() + " completed — " + resultado, telegramClient, null);

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
