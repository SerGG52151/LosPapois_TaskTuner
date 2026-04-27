package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.SprintMetricsResult;
import com.springboot.MyTodoList.model.SprintTT;
import com.springboot.MyTodoList.repository.SprintTaskTTRepository;
import com.springboot.MyTodoList.repository.SprintTTRepository;
import com.springboot.MyTodoList.repository.TaskTTRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/*
 * ============================================================
 *  Service: SprintTTService
 *  Table:   SPRINT_TT  (also reads from SPRINT_TASK_TT / TASK_TT)
 * ============================================================
 *
 *  Business logic for sprint management.
 *
 *  The key method here is getSprintMetrics(), which is a Java
 *  reimplementation of the Oracle stored procedure:
 *
 *    CREATE OR REPLACE PROCEDURE get_sprint_metrics (
 *        p_spr_id      IN  NUMBER,
 *        p_total_points OUT NUMBER,
 *        p_task_count   OUT NUMBER
 *    ) AS
 *    BEGIN
 *        SELECT SUM(t.story_points), COUNT(st.task_id)
 *        INTO p_total_points, p_task_count
 *        FROM sprint_task_tt st
 *        JOIN task_tt t ON st.task_id = t.task_id
 *        WHERE st.spr_id = p_spr_id;
 *    END;
 *
 *  Three repositories are injected because getSprintMetrics() reads
 *  from SPRINT_TT (to validate the sprint exists), TASK_TT (story points),
 *  and SPRINT_TASK_TT (task count).
 */
@Service
public class SprintTTService {

    /** Repository for SPRINT_TT — primary data source for this service. */
    @Autowired
    private SprintTTRepository sprintTTRepository;

    /**
     * Repository for TASK_TT — used in getSprintMetrics() to sum story_points
     * via the custom @Query: sumStoryPointsBySprint(sprId).
     */
    @Autowired
    private TaskTTRepository taskTTRepository;

    /**
     * Repository for SPRINT_TASK_TT — used in getSprintMetrics() to count tasks
     * via countByIdSprId(sprId).
     */
    @Autowired
    private SprintTaskTTRepository sprintTaskTTRepository;

    // ─── Read Operations ─────────────────────────────────────────────────

    /**
     * Returns all sprints across all projects.
     */
    public List<SprintTT> findAll() {
        return sprintTTRepository.findAll();
    }

    /**
     * Returns a single sprint by its primary key.
     *
     * @param id  the spr_id to look up
     * @return 200 OK with sprint, or 404 NOT FOUND
     */
    public ResponseEntity<SprintTT> getSprintById(long id) {
        Optional<SprintTT> found = sprintTTRepository.findById(id);
        if (found.isPresent()) {
            return new ResponseEntity<>(found.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Returns all sprints for a given project (sprint history).
     *
     * @param pjId  the project whose sprint history to retrieve
     */
    public List<SprintTT> getSprintsByProject(long pjId) {
        return sprintTTRepository.findByPjId(pjId);
    }

    /**
     * Returns the currently active sprint for a project.
     * Wraps the Optional in ResponseEntity so the controller can
     * return 404 if no sprint is currently active.
     *
     * @param pjId  the project to query
     * @return 200 with the active sprint, or 404 if no active sprint
     */
    public ResponseEntity<SprintTT> getActiveSprintForProject(long pjId) {
        Optional<SprintTT> activeSprint = sprintTTRepository.findByPjIdAndStateSprint(pjId, "active");
        if (activeSprint.isPresent()) {
            return new ResponseEntity<>(activeSprint.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // ─── Write Operations ─────────────────────────────────────────────────

    /**
     * Creates a new sprint.
     *
     * @param newSprint  the SprintTT to insert (sprId should be 0 for new records)
     * @return the saved entity with the DB-assigned sprId
     */
    public SprintTT addSprint(SprintTT newSprint) {
        if (newSprint.getPjId() == 0) {
            throw new IllegalArgumentException("Sprint must belong to a project (pjId is required).");
        }
        return sprintTTRepository.save(newSprint);
    }

    /**
     * Updates an existing sprint's mutable fields.
     *
     * @param id             the spr_id to update
     * @param updatedSprint  object carrying the new values
     * @return the saved SprintTT, or null if not found
     */
    public SprintTT updateSprint(long id, SprintTT updatedSprint) {
        Optional<SprintTT> existing = sprintTTRepository.findById(id);
        if (existing.isPresent()) {
            SprintTT sprint = existing.get();
            sprint.setNameSprint(updatedSprint.getNameSprint());
            sprint.setDateStartSpr(updatedSprint.getDateStartSpr());
            sprint.setDateEndSpr(updatedSprint.getDateEndSpr());
            sprint.setTaskGoal(updatedSprint.getTaskGoal());
            sprint.setStateSprint(updatedSprint.getStateSprint());
            return sprintTTRepository.save(sprint);
        } else {
            return null;
        }
    }

    /**
     * Deletes a sprint by its primary key.
     * ON DELETE CASCADE on sprint_task_tt removes all linked task entries.
     *
     * @param id  the spr_id to delete
     * @return true if deleted, false on exception
     */
    public boolean deleteSprint(long id) {
        try {
            sprintTTRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // ─── Business Logic (Stored Procedure Equivalents) ───────────────────

    /**
     * Computes metrics for a sprint: total story points and task count.
     *
     * This method is a Java reimplementation of the Oracle stored procedure:
     *
     *   CREATE OR REPLACE PROCEDURE get_sprint_metrics (
     *       p_spr_id      IN  NUMBER,
     *       p_total_points OUT NUMBER,
     *       p_task_count   OUT NUMBER
     *   ) AS
     *   BEGIN
     *       SELECT SUM(t.story_points), COUNT(st.task_id)
     *       INTO p_total_points, p_task_count
     *       FROM sprint_task_tt st
     *       JOIN task_tt t ON st.task_id = t.task_id
     *       WHERE st.spr_id = p_spr_id;
     *
     *       DBMS_OUTPUT.PUT_LINE('Total Story Points: ' || p_total_points);
     *       DBMS_OUTPUT.PUT_LINE('Total Tasks: '        || p_task_count);
     *   END;
     *
     * Java equivalent:
     *   - totalPoints ← TaskTTRepository.sumStoryPointsBySprint(sprId)
     *                   (JPQL query with SUM + JOIN, same logic as the SP)
     *   - taskCount   ← SprintTaskTTRepository.countByIdSprId(sprId)
     *                   (COUNT(*) WHERE spr_id = ?)
     *
     * The result is packed into SprintMetricsResult instead of OUT parameters.
     *
     * @param sprId  the sprint ID to compute metrics for
     * @return SprintMetricsResult with totalPoints and taskCount populated
     * @throws IllegalArgumentException if no sprint with that ID exists
     */
    public SprintMetricsResult getSprintMetrics(long sprId) {

        // Validate that the sprint actually exists before querying metrics
        if (!sprintTTRepository.existsById(sprId)) {
            throw new IllegalArgumentException("Sprint not found with id: " + sprId);
        }

        // Step 1: Sum story points via JPQL @Query (mirrors SUM(t.story_points) in SP)
        Long totalPoints = taskTTRepository.sumStoryPointsBySprint(sprId);

        // Step 2: Count total tasks via derived query (mirrors COUNT(st.task_id) in SP)
        long taskCount = sprintTaskTTRepository.countByIdSprId(sprId);

        // Pack both values into the result DTO (mirrors the OUT parameters of the SP)
        return new SprintMetricsResult(sprId, totalPoints, taskCount);
    }
}
