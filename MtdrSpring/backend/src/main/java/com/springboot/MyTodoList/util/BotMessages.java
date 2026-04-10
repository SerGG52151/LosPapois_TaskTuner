package com.springboot.MyTodoList.util;

public enum BotMessages {
	
	HELLO_MYTODO_BOT(
	"Hello! I'm MyTodoList Bot!\nType a new todo item below and press the send button (blue arrow), or select an option below:"),
	BOT_REGISTERED_STARTED("Bot registered and started succesfully!"),
	ITEM_DONE("Item done! Select /todolist to return to the list of todo items, or /start to go to the main screen."), 
	ITEM_UNDONE("Item undone! Select /todolist to return to the list of todo items, or /start to go to the main screen."), 
	ITEM_DELETED("Item deleted! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	TYPE_NEW_TODO_ITEM("Escribe el nombre de la informacion que quieres agregar."),
	NEW_ITEM_ADDED("New item added! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	TYPE_REGISTER_NAME("Escribe tu nombre para completar el registro."),
	TYPE_REGISTER_EMAIL("Ahora escribe tu correo electronico."),
	TYPE_REGISTER_PASSWORD("Escribe tu contrasena:"),
	TYPE_REGISTER_PASSWORD_CONFIRM("Repite tu contrasena para confirmarla:"),
	PASSWORD_MISMATCH("Las contrasenas no coinciden. Por favor ingresa tu contrasena nuevamente:"),
	REGISTER_COMPLETED("Registro completado correctamente."),
	REGISTER_ALREADY_EXISTS("Ya existe un registro para este usuario de Telegram."),
	INVALID_EMAIL("El correo no parece valido. Intenta de nuevo."),
	TYPE_NEW_ITEM_STORY_POINTS("Escribe los story points (numero entero):"),
	INVALID_STORY_POINTS("Valor invalido. Ingresa un numero entero para los story points:"),
	TYPE_NEW_ITEM_DATE_START("Escribe la fecha de inicio (DD/MM/AAAA):"),
	TYPE_NEW_ITEM_DATE_END("Escribe la fecha de fin (DD/MM/AAAA):"),
	INVALID_DATE("Fecha invalida. Usa el formato DD/MM/AAAA:"),
	SELECT_PRIORITY("Selecciona el nivel de urgencia:"),
	SELECT_SPRINT("Selecciona el sprint al que pertenece la tarea:"),
	NO_SPRINTS_CREATED("No habia sprints disponibles. Se crearon sprints de prueba, intenta seleccionarlos."),
	TASK_ADDED("Tarea agregada correctamente al sprint!"),
	USER_NOT_REGISTERED("Debes registrarte primero con /register para agregar tareas."),
	BYE("Bye! Select /start to resume!");

	private String message;

	BotMessages(String enumMessage) {
		this.message = enumMessage;
	}

	public String getMessage() {
		return message;
	}

}
