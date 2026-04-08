package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.TaskTT;
import com.springboot.MyTodoList.repository.ProjectUserTTRepository;
import com.springboot.MyTodoList.repository.TaskTTRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/*
 * ============================================================
 *  Service: TaskTTService
 *  Table:   TASK_TT
 * ============================================================
 *
 *  Business logic for task management.
 *
 *  The most important method here is safeAssignTask(), which is a
 *  Java reimplementation of the Oracle stored procedure:
 *
 *    CREATE OR REPLACE PROCEDURE safe_assign_task (
 *        p_task_id IN NUMBER,
 *        p_user_id IN NUMBER
 *    ) AS ...
 *
 *  The procedure checked that the user is in the task's project before
 *  reassigning. We replicate that exact guard using ProjectUserTTRepository.
 *
 *  Two repositories are injected here (TaskTTRepository + ProjectUserTTRepository)
 *  because safeAssignTask needs to cross-check two tables.
 */
@Service
public class TaskTTService {

    /*
     * Repository for TASK_TT — main data source for this service.
     */
    @Autowired
    private TaskTTRepository taskTTRepository;

    /*
     * Repository for PROJECT_USER_TT — used ONLY in safeAssignTask()
     * to verify project membership before updating user_id on a task.
     */
    @Autowired
    private ProjectUserTTRepository projectUserTTRepository;

    // ─── Read Operations ─────────────────────────────────────────────────

    /**
     * Returns every task across all projects.
     * SELECT * FROM task_tt
     */
    public List<TaskTT> findAll() {
        return taskTTRepository.findAll();
    }

    /**
     * Returns a single task by its primary key.
     *
     * @param id  the task_id to look up
     * @return 200 OK with task body, or 404 NOT FOUND
     */
    public ResponseEntity<TaskTT> getTaskById(long id) {
        Optional<TaskTT> found = taskTTRepository.findById(id);
        if (found.isPresent()) {
            return new ResponseEntity<>(found.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Returns all tasks assigned to a specific user.
     * Used for the "my tasks" view in the Telegram bot.
     *
     * @param userId  the user whose tasks to retrieve
     */
    public List<TaskTT> getTasksByUser(long userId) {
        return taskTTRepository.findByUserId(userId);
    }

    /**
     * Returns all tasks within a specific project (the project backlog).
     *
     * @param pjId  the project whose backlog to load
     */
    public List<TaskTT> getTasksByProject(long pjId) {
        return taskTTRepository.findByPjId(pjId);
    }

    /**
     * Returns tasks for a specific user within a specific project.
     *
     * @param pjId    the project
     * @param userId  the assignee
     */
    public List<TaskTT> getTasksByProjectAndUser(long pjId, long userId) {
        return taskTTRepository.findByPjIdAndUserId(pjId, userId);
    }

    /**
     * Returns tasks filtered by priority within a project.
     *
     * @param pjId      the project
     * @param priority  'high', 'medium', or 'low'
     */
    public List<TaskTT> getTasksByPriority(long pjId, String priority) {
        return taskTTRepository.findByPjIdAndPriority(pjId, priority);
    }

    // ─── Write Operations ─────────────────────────────────────────────────

    /**
     * Creates a new task in the database.
     *
     * @param newTask  the TaskTT to insert (taskId should be 0 for new records)
     * @return the saved entity with the DB-assigned taskId
     */
    public TaskTT addTask(TaskTT newTask) {
        return taskTTRepository.save(newTask);
    }

    /**
     * Updates an existing task's mutable fields.
     *
     * @param id          the task_id to update
     * @param updatedTask object carrying the new field values
     * @return the saved TaskTT, or null if not found
     */
    public TaskTT updateTask(long id, TaskTT updatedTask) {
        Optional<TaskTT> existing = taskTTRepository.findById(id);
        if (existing.isPresent()) {
            TaskTT task = existing.get();
            task.setNameTask(updatedTask.getNameTask());
            task.setStoryPoints(updatedTask.getStoryPoints());
            task.setDateStartTask(updatedTask.getDateStartTask());
            task.setDateEndSetTask(updatedTask.getDateEndSetTask());
            task.setDateEndRealTask(updatedTask.getDateEndRealTask());
            task.setPriority(updatedTask.getPriority());
            task.setUserId(updatedTask.getUserId());
            return taskTTRepository.save(task);
        } else {
            return null;
        }
    }

    /**
     * Deletes a task by its primary key.
     * ON DELETE CASCADE on sprint_task_tt removes linked sprint rows too.
     *
     * @param id  the task_id to delete
     * @return true if deleted, false on exception
     */
    public boolean deleteTask(long id) {
        try {
            taskTTRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // ─── Business Logic (Stored Procedure Equivalents) ───────────────────

    /**
     * Safely assigns a task to a user, validating project membership first.
     *
     * This method is a Java reimplementation of the Oracle stored procedure:
     *
     *   CREATE OR REPLACE PROCEDURE safe_assign_task (
     *       p_task_id IN NUMBER,
     *       p_user_id IN NUMBER
     *   ) AS
     *       v_is_member NUMBER;
     *       v_pj_id NUMBER;
     *   BEGIN
     *       -- 1. Find which project the task belongs to
     *       SELECT pj_id INTO v_pj_id FROM task_tt WHERE task_id = p_task_id;
     *
     *       -- 2. Check if user is in that project
     *       SELECT COUNT(*) INTO v_is_member
     *       FROM project_user_tt WHERE pj_id = v_pj_id AND user_id = p_user_id;
     *
     *       IF v_is_member > 0 THEN
     *           UPDATE task_tt SET user_id = p_user_id WHERE task_id = p_task_id;
     *           COMMIT;
     *       ELSE
     *           RAISE_APPLICATION_ERROR(-20001, 'User is not assigned to this project!');
     *       END IF;
     *   END;
     *
     * Java equivalent steps:
     *   1. Load the task — get pjId.
     *   2. Call existsByIdPjIdAndIdUserId(pjId, userId) on ProjectUserTTRepository.
     *   3a. If the user IS a member → update task.userId and save.
     *   3b. If the user is NOT a member → throw IllegalArgumentException.
     *
     * @param taskId  the ID of the task to reassign
     * @param userId  the ID of the user to assign to
     * @return the updated TaskTT entity
     * @throws IllegalArgumentException if the task doesn't exist or the user
     *                                  is not a member of the task's project
     */
    public TaskTT safeAssignTask(long taskId, long userId) {

        // Step 1: Load the task — we need its pjId to run the membership check
        Optional<TaskTT> taskOpt = taskTTRepository.findById(taskId);
        if (!taskOpt.isPresent()) {
            throw new IllegalArgumentException(
                "Task not found with id: " + taskId
            );
        }
        TaskTT task = taskOpt.get();
        long pjId = task.getPjId();

        // Step 2: Check if the target user is a member of the task's project
        //   Mirrors: SELECT COUNT(*) INTO v_is_member FROM project_user_tt
        //            WHERE pj_id = v_pj_id AND user_id = p_user_id
        boolean isMember = projectUserTTRepository.existsByIdPjIdAndIdUserId(pjId, userId);

        if (!isMember) {
            // Step 3b: Mirrors: RAISE_APPLICATION_ERROR(-20001, ...)
            throw new IllegalArgumentException(
                "User " + userId + " is not a member of project " + pjId +
                ". Cannot assign task " + taskId + "."
            );
        }

        // Step 3a: User is a valid member — perform the reassignment
        //   Mirrors: UPDATE task_tt SET user_id = p_user_id WHERE task_id = p_task_id
        task.setUserId(userId);
        return taskTTRepository.save(task);
    }
}
