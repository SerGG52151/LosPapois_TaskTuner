package com.springboot.MyTodoList.util;

import java.util.List;

public class BotImportDraft {

    public static class ParsedTask {
        public String name;
        public String description;
        public int storyPoints;
        public String priority;
    }

    private List<ParsedTask> tasks;
    private long sprintId;
    private long featureId;

    public List<ParsedTask> getTasks() { return tasks; }
    public void setTasks(List<ParsedTask> tasks) { this.tasks = tasks; }

    public long getSprintId() { return sprintId; }
    public void setSprintId(long sprintId) { this.sprintId = sprintId; }

    public long getFeatureId() { return featureId; }
    public void setFeatureId(long featureId) { this.featureId = featureId; }
}
