package com.springboot.MyTodoList.util;

public class BotTaskDraft {
    private String name;
    private Integer storyPoints;
    private String priority;
    private Long taskId;
    private long sprintId;
    private Long featureId;
    private java.time.LocalDate dateStart;
    private java.time.LocalDate dateEnd;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public long getSprintId() { return sprintId; }
    public void setSprintId(long sprintId) { this.sprintId = sprintId; }

    public Long getFeatureId() { return featureId; }
    public void setFeatureId(Long featureId) { this.featureId = featureId; }

    public java.time.LocalDate getDateStart() { return dateStart; }
    public void setDateStart(java.time.LocalDate dateStart) { this.dateStart = dateStart; }

    public java.time.LocalDate getDateEnd() { return dateEnd; }
    public void setDateEnd(java.time.LocalDate dateEnd) { this.dateEnd = dateEnd; }
}
