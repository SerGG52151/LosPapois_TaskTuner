package com.springboot.MyTodoList.model;

import jakarta.persistence.*;

/*
 * ============================================================
 *  Entity: SprintTaskTT
 *  Table:  SPRINT_TASK_TT
 * ============================================================
 *
 *  Junction table linking sprints to tasks. Unlike PROJECT_USER_TT
 *  (which only has the two FK columns), this table has an additional
 *  column — state_task — which tracks the live workflow state of each
 *  task within its sprint. This is the "Kanban board" row.
 *
 *  state_task lifecycle:
 *    'active'  → task is currently being worked on in this sprint
 *    'done'    → developer marked the task complete
 *    'delayed' → sprint ended but the task wasn't finished
 *
 *  The Oracle stored procedure get_sprint_metrics reads this table
 *  (joined with task_tt) to compute:
 *    - Total story points in the sprint
 *    - Total number of tasks in the sprint
 *  Both are replicated in SprintTTService.getSprintMetrics().
 *
 *  Oracle DDL:
 *    CREATE TABLE sprint_task_tt (
 *        spr_id      NUMBER,
 *        task_id     NUMBER,
 *        state_task  VARCHAR2(30) CHECK (state_task IN ('done', 'delayed', 'active')),
 *        CONSTRAINT pk_sprint_task PRIMARY KEY (spr_id, task_id),
 *        CONSTRAINT fk_spr  FOREIGN KEY (spr_id)  REFERENCES sprint_tt(spr_id) ON DELETE CASCADE,
 *        CONSTRAINT task     FOREIGN KEY (task_id) REFERENCES task_tt(task_id)  ON DELETE CASCADE
 *    );
 */
@Entity
@Table(name = "SPRINT_TASK_TT")
public class SprintTaskTT {

    /*
     * Composite primary key (spr_id + task_id).
     * See SprintTaskKey for the @Embeddable definition.
     */
    @EmbeddedId
    private SprintTaskKey id;

    /*
     * Workflow state of this task within the sprint.
     * Updated by developers as they move tasks through the board.
     * Accepted values (Oracle CHECK constraint):
     *   'active'  — in progress
     *   'done'    — completed within this sprint
     *   'delayed' — not completed before sprint end
     */
    @Column(name = "STATE_TASK", length = 30)
    private String stateTask;

    // ─── Constructors ────────────────────────────────────────────────────

    /** Required no-args constructor for JPA. */
    public SprintTaskTT() {}

    /** Build from an already-constructed key object. */
    public SprintTaskTT(SprintTaskKey id, String stateTask) {
        this.id        = id;
        this.stateTask = stateTask;
    }

    /** Build directly from raw IDs — creates the embedded key internally. */
    public SprintTaskTT(long sprId, long taskId, String stateTask) {
        this.id        = new SprintTaskKey(sprId, taskId);
        this.stateTask = stateTask;
    }

    // ─── Getters & Setters ───────────────────────────────────────────────

    public SprintTaskKey getId()          { return id; }
    public void setId(SprintTaskKey id)   { this.id = id; }

    public String getStateTask()          { return stateTask; }
    public void setStateTask(String s)    { this.stateTask = s; }

    /**
     * Convenience accessor — avoids callers needing entity.getId().getSprId().
     */
    public long getSprId()  { return id.getSprId(); }

    /**
     * Convenience accessor — avoids callers needing entity.getId().getTaskId().
     */
    public long getTaskId() { return id.getTaskId(); }
}
