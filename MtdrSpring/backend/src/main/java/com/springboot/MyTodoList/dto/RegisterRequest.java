package com.springboot.MyTodoList.dto;

public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String mail;
    private String password;
    private String idTelegram;

    public String getFirstName()                   { return firstName; }
    public void setFirstName(String firstName)     { this.firstName = firstName; }

    public String getLastName()                    { return lastName; }
    public void setLastName(String lastName)       { this.lastName = lastName; }

    public String getMail()                        { return mail; }
    public void setMail(String mail)               { this.mail = mail; }

    public String getPassword()                    { return password; }
    public void setPassword(String password)       { this.password = password; }

    public String getIdTelegram()                  { return idTelegram; }
    public void setIdTelegram(String idTelegram)   { this.idTelegram = idTelegram; }
}
