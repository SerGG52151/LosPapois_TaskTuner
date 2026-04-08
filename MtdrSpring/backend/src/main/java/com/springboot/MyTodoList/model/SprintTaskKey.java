package com.springboot.MyTodoList.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

/*
 * ============================================================
 *  Composite Key: SprintTaskKey
 *  Used by:       SprintTaskTT  →  SPRINT_TASK_TT
 * ============================================================
 *
 *  Composite key for the sprint-task junction table.
 *  Encodes the many-to-many link:
 *    one Sprint ↔ many Tasks,  one Task ↔ many Sprints
 *    (a task can be carried over across sprints if delayed)
 *
 *  Like all JPA composite keys:
 *    - @Embeddable  : signals that this class is a key component
 *    - Serializable : required by JPA spec for caching/transport
 *    - equals/hashCode : required for 1st-level cache identity checks
 */
@Embeddable
public class SprintTaskKey implements Serializable {

    /*
     * Foreign key pointing to SPRINT_TT.spr_id.
     */
    @Column(name = "SPR_ID")
    private long sprId;

    /*
     * Foreign key pointing to TASK_TT.task_id.
     */
    @Column(name = "TASK_ID")
    private long taskId;

    // ─── Constructors ────────────────────────────────────────────────────

    /** No-args constructor required by the @Embeddable contract. */
    public SprintTaskKey() {}

    /** Convenience constructor for building a key inline. */
    public SprintTaskKey(long sprId, long taskId) {
        this.sprId  = sprId;
        this.taskId = taskId;
    }

    // ─── Getters & Setters ───────────────────────────────────────────────

    public long getSprId()             { return sprId; }
    public void setSprId(long sprId)   { this.sprId = sprId; }

    public long getTaskId()            { return taskId; }
    public void setTaskId(long taskId) { this.taskId = taskId; }

    // ─── equals & hashCode ───────────────────────────────────────────────

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SprintTaskKey)) return false;
        SprintTaskKey that = (SprintTaskKey) o;
        return sprId == that.sprId && taskId == that.taskId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(sprId, taskId);
    }
}
