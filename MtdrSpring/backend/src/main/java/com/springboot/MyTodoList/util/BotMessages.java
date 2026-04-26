package com.springboot.MyTodoList.util;

public enum BotMessages {

	HELLO_MYTODO_BOT(
	"Hello! I'm MyTodoList Bot!\nType a new todo item below and press the send button (blue arrow), or select an option below:"),
	BOT_REGISTERED_STARTED("Bot registered and started successfully!"),
	ITEM_DONE("Item done! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	ITEM_UNDONE("Item undone! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	ITEM_DELETED("Item deleted! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	TYPE_NEW_TODO_ITEM("Write the task name."),
	NEW_ITEM_ADDED("New item added! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	TYPE_REGISTER_NAME("Write your name to complete registration."),
	TYPE_REGISTER_EMAIL("Now write your email address."),
	TYPE_REGISTER_PASSWORD("Write your password:"),
	TYPE_REGISTER_PASSWORD_CONFIRM("Repeat your password to confirm it:"),
	PASSWORD_MISMATCH("The passwords don't match. Please enter your password again:"),
	REGISTER_COMPLETED("Registration completed successfully."),
	REGISTER_ALREADY_EXISTS("A registration already exists for this Telegram user."),
	INVALID_EMAIL("The email address doesn't look valid. Try again."),
	TYPE_NEW_ITEM_STORY_POINTS("Write the story points (integer number):"),
	INVALID_STORY_POINTS("Invalid value. Enter an integer number for story points:"),
	TYPE_NEW_ITEM_DATE_START("Write the start date (DD/MM/YYYY):"),
	TYPE_NEW_ITEM_DATE_END("Write the end date (DD/MM/YYYY):"),
	INVALID_DATE("Invalid date. Use the DD/MM/YYYY format:"),
	INVALID_DATE_RANGE("Date out of range. Use a date between 2022 and 2040 (DD/MM/YYYY):"),
	SELECT_PRIORITY("Select the priority level:"),
	SELECT_SPRINT("Select the sprint this task belongs to:"),
	NO_SPRINTS_CREATED("No sprints were available. Test sprints were created — try selecting them."),
	TASK_ADDED("Task added successfully to the sprint!"),
	USER_NOT_REGISTERED("You must register first with /register to add tasks."),
	SELECT_FEATURE("Select the feature this task belongs to (or 'No feature' to skip):"),
	NO_FEATURES_FOR_SPRINT("No features found for this sprint. The task will be saved without a feature."),
	TYPE_NEW_FEATURE_NAME("Write the name of the new feature:"),
	SELECT_FEATURE_PRIORITY("Select the feature priority:"),
	SELECT_FEATURE_SPRINT("Select the sprint this feature belongs to:"),
	FEATURE_ADDED("Feature created successfully!"),
	BYE("Bye! Select /start to resume!"),
	ASK_AI_PROMPT("🤖 Ask me anything about your tasks, sprint, or project progress:"),
	ASK_AI_DISABLED("The AI assistant is currently unavailable."),
	ASK_AI_THINKING("🤔 Thinking..."),
	ASK_AI_EMPTY_QUESTION("Please type a project-related question.");

	private String message;

	BotMessages(String enumMessage) {
		this.message = enumMessage;
	}

	public String getMessage() {
		return message;
	}

}
