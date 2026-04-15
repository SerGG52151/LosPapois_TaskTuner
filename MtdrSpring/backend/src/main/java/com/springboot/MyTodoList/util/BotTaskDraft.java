package com.springboot.MyTodoList.util;

import java.time.LocalDate;

public class BotTaskDraft {
    private String name;
    private Integer storyPoints;
    private LocalDate dateStart;
    private LocalDate dateEnd;
    private String priority;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }

    public LocalDate getDateStart() { return dateStart; }
    public void setDateStart(LocalDate dateStart) { this.dateStart = dateStart; }

    public LocalDate getDateEnd() { return dateEnd; }
    public void setDateEnd(LocalDate dateEnd) { this.dateEnd = dateEnd; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
