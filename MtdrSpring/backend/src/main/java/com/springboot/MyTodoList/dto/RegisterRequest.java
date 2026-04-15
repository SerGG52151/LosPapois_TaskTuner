package com.springboot.MyTodoList.dto;

public class RegisterRequest {
    private String username;
    private String mail;
    private String password;
    private String idTelegram;

    public String getUsername()                    { return username; }
    public void setUsername(String username)       { this.username = username; }

    public String getMail()                        { return mail; }
    public void setMail(String mail)               { this.mail = mail; }

    public String getPassword()                    { return password; }
    public void setPassword(String password)       { this.password = password; }

    public String getIdTelegram()                  { return idTelegram; }
    public void setIdTelegram(String idTelegram)   { this.idTelegram = idTelegram; }
}
