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
	LLM_REQ("/llm");

	private final String command;

	BotCommands(String enumCommand) {
		this.command = enumCommand;
	}

	public String getCommand() {
		return command;
	}
}
