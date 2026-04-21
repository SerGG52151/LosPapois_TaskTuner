package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.TaskTT;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.List;

/*
 * ============================================================
 *  Repository: TaskTTRepository
 *  Entity:     TaskTT  →  TASK_TT table
 * ============================================================
 *
 *  Provides CRUD for TaskTT entities plus custom derived query methods
 *  and one explicit JPQL query that supports the sprint metrics feature.
 */
@Repository
@Transactional
@EnableTransactionManagement
public interface TaskTTRepository extends JpaRepository<TaskTT, Long> {

    /*
     * All tasks assigned to a specific user.
     *
     * Generated SQL:
     *   SELECT * FROM task_tt WHERE user_id = ?
     *
     * Use case: "my tasks" view for a logged-in developer.
     */
    List<TaskTT> findByUserId(long userId);

    /*
     * All tasks within a specific project.
     *
     * Generated SQL:
     *   SELECT * FROM task_tt WHERE pj_id = ?
     *
     * Use case: project backlog view.
     */
    List<TaskTT> findByPjId(long pjId);

    /*
     * All tasks assigned to a specific user within a specific project.
     *
     * Generated SQL:
     *   SELECT * FROM task_tt WHERE pj_id = ? AND user_id = ?
     *
     * Use case: "my tasks in project X" — common in the Telegram bot flow.
     */
    List<TaskTT> findByPjIdAndUserId(long pjId, long userId);

    /*
     * All tasks with a given priority within a project.
     *
     * Generated SQL:
     *   SELECT * FROM task_tt WHERE pj_id = ? AND priority = ?
     *
     * Use case: filtered backlog view, e.g., show only 'high' priority tasks.
     */
    List<TaskTT> findByPjIdAndPriority(long pjId, String priority);

    List<TaskTT> findByFeatureId(long featureId);

    /*
     * All tasks in a specific feature that belong to an active sprint.
     * Used for team-wide feature view — returns tasks from ALL users.
     */
    @Query("SELECT t FROM TaskTT t " +
           "JOIN SprintTaskTT st ON st.id.taskId = t.taskId " +
           "JOIN SprintTT s ON s.sprId = st.id.sprId " +
           "WHERE t.featureId = :featureId AND s.stateSprint = 'active'")
    List<TaskTT> findByFeatureIdInActiveSprint(@Param("featureId") long featureId);

    /*
     * JPQL query — computes total story points for all tasks in a sprint.
     *
     * This is the Java equivalent of the SUM part in the Oracle SP:
     *   SELECT SUM(t.story_points) INTO p_total_points
     *   FROM sprint_task_tt st
     *   JOIN task_tt t ON st.task_id = t.task_id
     *   WHERE st.spr_id = p_spr_id;
     *
     * JPQL notes:
     *   - Uses entity class names (TaskTT, SprintTaskTT) not table names.
     *   - Uses Java field names (storyPoints, id.taskId) not column names.
     *   - COALESCE(..., 0) returns 0 instead of NULL when sprint has no tasks.
     *   - The JOIN is manual (ON clause) because there is no @ManyToOne
     *     relationship defined — we stay consistent with the FK-as-long style.
     *
     * Used by SprintTTService.getSprintMetrics().
     */
    /*
     * Tasks assigned to a user that belong to an active sprint.
     *
     * Equivalent SQL:
     *   SELECT t.* FROM task_tt t
     *   JOIN sprint_task_tt st ON st.task_id = t.task_id
     *   JOIN sprint_tt s       ON s.spr_id   = st.spr_id
     *   WHERE t.user_id = ? AND s.state_sprint = 'active'
     *
     * Use case: bot "my tasks" view — shows only current sprint work.
     */
    @Query("SELECT t FROM TaskTT t " +
           "JOIN SprintTaskTT st ON st.id.taskId = t.taskId " +
           "JOIN SprintTT s ON s.sprId = st.id.sprId " +
           "WHERE t.userId = :userId AND s.stateSprint = 'active'")
    List<TaskTT> findByUserIdInActiveSprint(@Param("userId") long userId);

    @Query("SELECT COALESCE(SUM(t.storyPoints), 0) " +
           "FROM TaskTT t " +
           "JOIN SprintTaskTT st ON st.id.taskId = t.taskId " +
           "WHERE st.id.sprId = :sprId")
    Long sumStoryPointsBySprint(@Param("sprId") long sprId);
}
