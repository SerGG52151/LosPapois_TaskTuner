package com.springboot.MyTodoList.util;

public class BotFeatureDraft {
    private Long featureId;
    private String name;
    private String priority;
    private long sprintId;

    public Long getFeatureId() { return featureId; }
    public void setFeatureId(Long featureId) { this.featureId = featureId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public long getSprintId() { return sprintId; }
    public void setSprintId(long sprintId) { this.sprintId = sprintId; }
}
