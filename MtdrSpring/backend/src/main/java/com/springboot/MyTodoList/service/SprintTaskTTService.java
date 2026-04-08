package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.SprintTaskKey;
import com.springboot.MyTodoList.model.SprintTaskTT;
import com.springboot.MyTodoList.repository.SprintTaskTTRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/*
 * ============================================================
 *  Service: SprintTaskTTService
 *  Table:   SPRINT_TASK_TT
 * ============================================================
 *
 *  Manages the many-to-many relationship between sprints and tasks.
 *  The primary operations are:
 *    - Adding a task to a sprint (addTaskToSprint)
 *    - Updating a task's workflow state on the Kanban board (updateTaskState)
 *    - Removing a task from a sprint
 *    - Querying the board columns (getTasksByState)
 *
 *  Most methods work with SprintTaskKey (composite key) rather than
 *  a single Long ID — callers must provide both sprId and taskId.
 */
@Service
public class SprintTaskTTService {

    @Autowired
    private SprintTaskTTRepository sprintTaskTTRepository;

    // ─── Read Operations ─────────────────────────────────────────────────

    /**
     * Returns all sprint-task entries in the system.
     */
    public List<SprintTaskTT> findAll() {
        return sprintTaskTTRepository.findAll();
    }

    /**
     * Returns a single sprint-task entry by its composite key.
     *
     * @param sprId   the sprint ID
     * @param taskId  the task ID
     * @return Optional — empty if the task is not in that sprint
     */
    public Optional<SprintTaskTT> getEntry(long sprId, long taskId) {
        SprintTaskKey key = new SprintTaskKey(sprId, taskId);
        return sprintTaskTTRepository.findById(key);
    }

    /**
     * Returns all task entries for a given sprint (the sprint's task board).
     *
     * @param sprId  the sprint whose tasks to retrieve
     */
    public List<SprintTaskTT> getTasksInSprint(long sprId) {
        return sprintTaskTTRepository.findByIdSprId(sprId);
    }

    /**
     * Returns all sprint entries for a given task (its sprint history).
     *
     * @param taskId  the task to look up
     */
    public List<SprintTaskTT> getSprintsForTask(long taskId) {
        return sprintTaskTTRepository.findByIdTaskId(taskId);
    }

    /**
     * Returns all tasks in a sprint filtered by workflow state.
     * Used to populate individual Kanban board columns.
     *
     * @param sprId      the sprint
     * @param stateTask  'active', 'done', or 'delayed'
     * @return tasks matching the given state in the sprint
     */
    public List<SprintTaskTT> getTasksByState(long sprId, String stateTask) {
        return sprintTaskTTRepository.findByIdSprIdAndStateTask(sprId, stateTask);
    }

    /**
     * Counts how many tasks are in a sprint.
     * Used together with getSprintMetrics() for completion reporting.
     *
     * @param sprId  the sprint to count tasks for
     */
    public long countTasksInSprint(long sprId) {
        return sprintTaskTTRepository.countByIdSprId(sprId);
    }

    /**
     * Counts tasks in a sprint with a specific state.
     * e.g., countByState(1L, "done") / countTasksInSprint(1L) = completion %
     *
     * @param sprId      the sprint
     * @param stateTask  'active', 'done', or 'delayed'
     */
    public long countByState(long sprId, String stateTask) {
        return sprintTaskTTRepository.countByIdSprIdAndStateTask(sprId, stateTask);
    }

    // ─── Write Operations ─────────────────────────────────────────────────

    /**
     * Adds a task to a sprint with an initial state of 'active'.
     *
     * Mirrors the INSERT in the test data:
     *   INSERT INTO sprint_task_tt (spr_id, task_id, state_task) VALUES (1, 1, 'active');
     *
     * @param sprId   the sprint to add the task to
     * @param taskId  the task to add
     * @return the saved SprintTaskTT entry
     */
    public SprintTaskTT addTaskToSprint(long sprId, long taskId) {
        // New sprint tasks start as 'active' — the developer hasn't touched them yet
        SprintTaskTT entry = new SprintTaskTT(sprId, taskId, "active");
        return sprintTaskTTRepository.save(entry);
    }

    /**
     * Updates the workflow state of a task within a sprint.
     * This is what moves cards across the Kanban board.
     *
     * Valid transitions:
     *   active → done     (developer marks it complete)
     *   active → delayed  (sprint ends before task is finished)
     *   delayed → active  (task carried over to next sprint)
     *
     * @param sprId      the sprint containing the task
     * @param taskId     the task to update
     * @param newState   the new state: 'active', 'done', or 'delayed'
     * @return the updated entry, or null if the task isn't in that sprint
     */
    public SprintTaskTT updateTaskState(long sprId, long taskId, String newState) {
        SprintTaskKey key = new SprintTaskKey(sprId, taskId);
        Optional<SprintTaskTT> existing = sprintTaskTTRepository.findById(key);
        if (existing.isPresent()) {
            SprintTaskTT entry = existing.get();
            entry.setStateTask(newState);
            return sprintTaskTTRepository.save(entry);
        } else {
            return null;
        }
    }

    /**
     * Removes a task from a sprint (deletes the junction row).
     *
     * @param sprId   the sprint
     * @param taskId  the task to remove
     * @return true if removed, false on exception
     */
    public boolean removeTaskFromSprint(long sprId, long taskId) {
        try {
            SprintTaskKey key = new SprintTaskKey(sprId, taskId);
            sprintTaskTTRepository.deleteById(key);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
