package com.springboot.MyTodoList.util;

public enum BotCommands {

	REGISTER_COMMAND("/register"),
	LOGIN_COMMAND("/login"),
	START_COMMAND("/start"),
	HIDE_COMMAND("/hide"),
	TODO_LIST("/todolist"),
	ADD_ITEM("/addtask"),
	STATUS("/status"),
	MARK_DONE("/done"),
	MARK_REWORK("/rework"),
	MARK_UNDO("/undo"),
	EDIT_TASK("/edittask"),
	LLM_REQ("/llm"),
	ASK_COMMAND("/ask"),
	ADD_FEATURE("/addfeature"),
	EDIT_FEATURE("/editfeature"),
	AI_CREATE("/aicreate");

	private final String command;

	BotCommands(String enumCommand) {
		this.command = enumCommand;
	}

	public String getCommand() {
		return command;
	}
}
