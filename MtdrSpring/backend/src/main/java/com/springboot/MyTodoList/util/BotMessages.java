package com.springboot.MyTodoList.util;

public enum BotMessages {
	
	HELLO_MYTODO_BOT(
	"Hello! I'm MyTodoList Bot!\nType a new todo item below and press the send button (blue arrow), or select an option below:"),
	BOT_REGISTERED_STARTED("Bot registered and started succesfully!"),
	ITEM_DONE("Item done! Select /todolist to return to the list of todo items, or /start to go to the main screen."), 
	ITEM_UNDONE("Item undone! Select /todolist to return to the list of todo items, or /start to go to the main screen."), 
	ITEM_DELETED("Item deleted! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	TYPE_NEW_TODO_ITEM("Write the task name."),
	NEW_ITEM_ADDED("New item added! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	TYPE_REGISTER_NAME("Write your name to complete the registration."),
	TYPE_REGISTER_EMAIL("Now write your email."),
	TYPE_REGISTER_PASSWORD("Write your password:"),
	TYPE_REGISTER_PASSWORD_CONFIRM("Repeat your password to confirm it:"),
	PASSWORD_MISMATCH("The passwords don't match. Please enter your password again:"),
	REGISTER_COMPLETED("Registration completed successfully."),
	REGISTER_ALREADY_EXISTS("There is already a registration for this Telegram user."),
	INVALID_EMAIL("The email doesn't seem valid. Try again."),
	TYPE_NEW_ITEM_STORY_POINTS("Write the story points (integer number):"),
	INVALID_STORY_POINTS("Invalid value. Enter an integer number for story points:"),
	TYPE_NEW_ITEM_DATE_START("Write the start date (DD/MM/YYYY):"),
	TYPE_NEW_ITEM_DATE_END("Write the end date (DD/MM/YYYY):"),
	INVALID_DATE("Invalid date. Use the DD/MM/YYYY format:"),
	SELECT_PRIORITY("Select the urgency level:"),
	SELECT_SPRINT("Select the sprint to which the task belongs:"),
	NO_SPRINTS_CREATED("There were no available sprints. Test sprints were created, try selecting them."),
	TASK_ADDED("Task added successfully to the sprint!"),
	USER_NOT_REGISTERED("You must register first with /register to add tasks."),
	BYE("Bye! Select /start to resume!");

	private String message;

	BotMessages(String enumMessage) {
		this.message = enumMessage;
	}

	public String getMessage() {
		return message;
	}

}
