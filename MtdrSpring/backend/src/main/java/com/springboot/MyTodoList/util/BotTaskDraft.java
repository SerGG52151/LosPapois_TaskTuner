package com.springboot.MyTodoList.util;

public class BotTaskDraft {
    private String name;
    private Integer storyPoints;
    private String priority;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
