package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.SprintTaskKey;
import com.springboot.MyTodoList.model.SprintTaskTT;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.List;

/*
 * ============================================================
 *  Repository: SprintTaskTTRepository
 *  Entity:     SprintTaskTT  →  SPRINT_TASK_TT table
 * ============================================================
 *
 *  This is the most "read-heavy" repository in the app — it backs
 *  the Kanban board view and the sprint metrics calculations.
 *
 *  Like ProjectUserTTRepository, the ID type is a composite key
 *  (SprintTaskKey), so derived method names navigate into @EmbeddedId:
 *    "id.sprId"  → findByIdSprId(...)
 *    "id.taskId" → findByIdTaskId(...)
 */
@Repository
@Transactional
@EnableTransactionManagement
public interface SprintTaskTTRepository extends JpaRepository<SprintTaskTT, SprintTaskKey> {

    /*
     * All task entries for a given sprint (the sprint's full task list).
     *
     * Generated SQL:
     *   SELECT * FROM sprint_task_tt WHERE spr_id = ?
     *
     * Use case: load all tasks for the Kanban board of sprint X.
     */
    List<SprintTaskTT> findByIdSprId(long sprId);

    /*
     * All sprint entries for a given task (which sprints included this task).
     *
     * Generated SQL:
     *   SELECT * FROM sprint_task_tt WHERE task_id = ?
     *
     * Use case: task history — "this task was in Sprint 1 (done) and Sprint 2 (delayed)".
     */
    List<SprintTaskTT> findByIdTaskId(long taskId);

    /*
     * Deletes all sprint-task link rows for a given task.
     *
     * Generated SQL:
     *   DELETE FROM sprint_task_tt WHERE task_id = ?
     *
     * Used when a task is removed as part of member cleanup.
     */
    long deleteByIdTaskId(long taskId);

    /*
     * All tasks in a sprint filtered by their workflow state.
     *
     * Generated SQL:
     *   SELECT * FROM sprint_task_tt WHERE spr_id = ? AND state_task = ?
     *
     * Use case: populate each column of the Kanban board:
     *   findByIdSprIdAndStateTask(1L, "active")  → "In Progress" column
     *   findByIdSprIdAndStateTask(1L, "done")    → "Done" column
     *   findByIdSprIdAndStateTask(1L, "delayed") → "Delayed" column
     */
    List<SprintTaskTT> findByIdSprIdAndStateTask(long sprId, String stateTask);

    /*
     * Count of total tasks in a sprint.
     *
     * Generated SQL:
     *   SELECT COUNT(*) FROM sprint_task_tt WHERE spr_id = ?
     *
     * Implements the COUNT(st.task_id) part of get_sprint_metrics.
     * Used by SprintTTService.getSprintMetrics().
     */
    long countByIdSprId(long sprId);

    /*
     * Count of tasks in a sprint with a specific state.
     *
     * Generated SQL:
     *   SELECT COUNT(*) FROM sprint_task_tt WHERE spr_id = ? AND state_task = ?
     *
     * Use case: compute sprint completion percentage.
     * e.g., countByIdSprIdAndStateTask(1L, "done") / countByIdSprId(1L) * 100
     */
    long countByIdSprIdAndStateTask(long sprId, String stateTask);
}
