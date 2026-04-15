package com.springboot.MyTodoList.util;

public enum BotConversationState {
    NONE,
    // Creación de tareas
    WAITING_NEW_ITEM_NAME,
    WAITING_NEW_ITEM_STORY_POINTS,
    WAITING_NEW_ITEM_DATE_START,
    WAITING_NEW_ITEM_DATE_END,
    WAITING_NEW_ITEM_PRIORITY,
    WAITING_NEW_ITEM_SPRINT,
    // Flujo de creación de cuenta
    WAITING_REGISTER_NAME,
    WAITING_REGISTER_EMAIL,
    WAITING_REGISTER_PASSWORD,
    WAITING_REGISTER_PASSWORD_CONFIRM,
    // Flujo de inicio de sesión
    WAITING_LOGIN_EMAIL,
    WAITING_LOGIN_PASSWORD

}
