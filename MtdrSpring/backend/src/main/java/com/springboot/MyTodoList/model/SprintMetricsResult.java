package com.springboot.MyTodoList.model;

/*
 * ============================================================
 *  DTO: SprintMetricsResult
 * ============================================================
 *
 *  Plain data object that carries the output of SprintTTService.getSprintMetrics().
 *  It mirrors the two OUT parameters of the Oracle stored procedure:
 *
 *    CREATE OR REPLACE PROCEDURE get_sprint_metrics (
 *        p_spr_id      IN  NUMBER,
 *        p_total_points OUT NUMBER,   ← totalPoints
 *        p_task_count   OUT NUMBER    ← taskCount
 *    )
 *
 *  Using a dedicated result class (instead of a Map or array) makes
 *  the service method's return type self-documenting and strongly typed.
 *
 *  This is a DTO (Data Transfer Object) — it has no @Entity annotation
 *  and is never persisted to the database.
 */
public class SprintMetricsResult {

    /*
     * Sum of story_points for all tasks included in the sprint.
     * Equivalent to: SUM(t.story_points) in get_sprint_metrics.
     */
    private long totalPoints;

    /*
     * Number of tasks added to the sprint.
     * Equivalent to: COUNT(st.task_id) in get_sprint_metrics.
     */
    private long taskCount;

    /*
     * The sprint ID these metrics were computed for.
     * Included for context — useful when the result is serialized to JSON.
     */
    private long sprintId;

    // ─── Constructors ────────────────────────────────────────────────────

    public SprintMetricsResult() {}

    public SprintMetricsResult(long sprintId, long totalPoints, long taskCount) {
        this.sprintId    = sprintId;
        this.totalPoints = totalPoints;
        this.taskCount   = taskCount;
    }

    // ─── Getters & Setters ───────────────────────────────────────────────

    public long getTotalPoints()               { return totalPoints; }
    public void setTotalPoints(long total)     { this.totalPoints = total; }

    public long getTaskCount()                 { return taskCount; }
    public void setTaskCount(long count)       { this.taskCount = count; }

    public long getSprintId()                  { return sprintId; }
    public void setSprintId(long sprintId)     { this.sprintId = sprintId; }

    @Override
    public String toString() {
        return "SprintMetricsResult{" +
               "sprintId=" + sprintId +
               ", totalPoints=" + totalPoints +
               ", taskCount=" + taskCount +
               '}';
    }
}
