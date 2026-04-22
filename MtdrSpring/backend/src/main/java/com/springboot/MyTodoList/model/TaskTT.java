package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "TASK_TT")
public class TaskTT {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TASK_ID")
    private long taskId;

    @Column(name = "NAME_TASK", length = 300)
    private String nameTask;

    @Column(name = "STORY_POINTS")
    private Integer storyPoints;

    @Column(name = "DATE_START_TASK")
    private LocalDate dateStartTask;

    @Column(name = "DATE_END_SET_TASK")
    private LocalDate dateEndSetTask;

    @Column(name = "DATE_END_REAL_TASK")
    private LocalDate dateEndRealTask;

    @Column(name = "PRIORITY", length = 30)
    private String priority;

    @Column(name = "INFO_TASK", length = 2000)
    private String infoTask;

    @Column(name = "FEATURE_ID")
    private Long featureId;

    @Column(name = "USER_ID", nullable = false)
    private long userId;

    @Column(name = "PJ_ID", nullable = false)
    private long pjId;

    // ─── Constructors ────────────────────────────────────────────────────

    public TaskTT() {}

    public TaskTT(long taskId, String nameTask, Integer storyPoints,
                  LocalDate dateStartTask, LocalDate dateEndSetTask,
                  LocalDate dateEndRealTask, String priority, String infoTask,
                  Long featureId, long userId, long pjId) {
        this.taskId          = taskId;
        this.nameTask        = nameTask;
        this.storyPoints     = storyPoints;
        this.dateStartTask   = dateStartTask;
        this.dateEndSetTask  = dateEndSetTask;
        this.dateEndRealTask = dateEndRealTask;
        this.priority        = priority;
        this.infoTask        = infoTask;
        this.featureId       = featureId;
        this.userId          = userId;
        this.pjId            = pjId;
    }

    // ─── Getters & Setters ───────────────────────────────────────────────

    public long getTaskId()                          { return taskId; }
    public void setTaskId(long taskId)               { this.taskId = taskId; }

    public String getNameTask()                      { return nameTask; }
    public void setNameTask(String nameTask)         { this.nameTask = nameTask; }

    public Integer getStoryPoints()                  { return storyPoints; }
    public void setStoryPoints(Integer storyPoints)  { this.storyPoints = storyPoints; }

    public LocalDate getDateStartTask()              { return dateStartTask; }
    public void setDateStartTask(LocalDate d)        { this.dateStartTask = d; }

    public LocalDate getDateEndSetTask()             { return dateEndSetTask; }
    public void setDateEndSetTask(LocalDate d)       { this.dateEndSetTask = d; }

    public LocalDate getDateEndRealTask()            { return dateEndRealTask; }
    public void setDateEndRealTask(LocalDate d)      { this.dateEndRealTask = d; }

    public String getPriority()                      { return priority; }
    public void setPriority(String priority)         { this.priority = priority; }

    public String getInfoTask()                      { return infoTask; }
    public void setInfoTask(String infoTask)         { this.infoTask = infoTask; }

    public Long getFeatureId()                       { return featureId; }
    public void setFeatureId(Long featureId)         { this.featureId = featureId; }

    public long getUserId()                          { return userId; }
    public void setUserId(long userId)               { this.userId = userId; }

    public long getPjId()                            { return pjId; }
    public void setPjId(long pjId)                   { this.pjId = pjId; }
}
