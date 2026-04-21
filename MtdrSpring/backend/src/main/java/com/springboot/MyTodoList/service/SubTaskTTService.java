package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.SubTaskTT;
import com.springboot.MyTodoList.repository.SubTaskTTRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/*
 * ============================================================
 *  Service: SubTaskTTService
 *  Table:   SUBTASK_TT
 * ============================================================
 *
 *  Business logic for subtask management.
 *
 *  Includes methods for calculating progress and adding quick
 *  subtasks, effectively replicating Oracle stored procedures like
 *  `get_task_progress`, `check_subtask_completion`, and `add_quick_subtask`.
 */
@Service
public class SubTaskTTService {

    @Autowired
    private SubTaskTTRepository subTaskTTRepository;

    // ─── Read Operations ─────────────────────────────────────────────────

    /**
     * Returns every subtask across all tasks.
     * SELECT * FROM subtask_tt
     */
    public List<SubTaskTT> findAll() {
        return subTaskTTRepository.findAll();
    }

    /**
     * Returns a single subtask by its primary key.
     *
     * @param id  the sub_id to look up
     * @return 200 OK with subtask body, or 404 NOT FOUND
     */
    public ResponseEntity<SubTaskTT> getSubTaskById(long id) {
        Optional<SubTaskTT> found = subTaskTTRepository.findById(id);
        if (found.isPresent()) {
            return new ResponseEntity<>(found.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Returns all subtasks under a specific task.
     *
     * @param taskId  the task to retrieve subtasks for
     */
    public List<SubTaskTT> getSubTasksByTask(long taskId) {
        return subTaskTTRepository.findByTaskId(taskId);
    }

    // ─── Write Operations ─────────────────────────────────────────────────

    /**
     * Creates a new subtask in the database.
     *
     * @param newSubTask  the SubTaskTT to insert
     * @return the saved entity with the DB-assigned subId
     */
    public SubTaskTT addSubTask(SubTaskTT newSubTask) {
        return subTaskTTRepository.save(newSubTask);
    }

    /**
     * Updates an existing subtask's mutable fields.
     *
     * @param id              the sub_id to update
     * @param updatedSubTask  object carrying the new field values
     * @return the saved SubTaskTT, or null if not found
     */
    public SubTaskTT updateSubTask(long id, SubTaskTT updatedSubTask) {
        Optional<SubTaskTT> existing = subTaskTTRepository.findById(id);
        if (existing.isPresent()) {
            SubTaskTT subTask = existing.get();
            subTask.setNameSub(updatedSubTask.getNameSub());
            subTask.setStoryPointsSub(updatedSubTask.getStoryPointsSub());
            subTask.setDateStartSub(updatedSubTask.getDateStartSub());
            subTask.setDateEndSetSub(updatedSubTask.getDateEndSetSub());
            subTask.setDateEndRealSub(updatedSubTask.getDateEndRealSub());
            subTask.setPrioritySub(updatedSubTask.getPrioritySub());
            subTask.setStateSub(updatedSubTask.getStateSub());
            subTask.setInfoSub(updatedSubTask.getInfoSub());
            subTask.setTaskId(updatedSubTask.getTaskId());
            return subTaskTTRepository.save(subTask);
        } else {
            return null;
        }
    }

    /**
     * Deletes a subtask by its primary key.
     *
     * @param id  the sub_id to delete
     * @return true if deleted, false on exception
     */
    public boolean deleteSubTask(long id) {
        try {
            subTaskTTRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // ─── Business Logic (Stored Procedure Equivalents) ───────────────────

    /**
     * Calculates the progress of a given task based on its subtasks.
     * Replicates the get_task_progress Oracle SP.
     *
     * @param taskId  the ID of the main task
     * @return map with completed, total, and percent values
     */
    public Map<String, Object> getTaskProgress(long taskId) {
        long totalSubs = subTaskTTRepository.countByTaskId(taskId);
        long completedSubs = subTaskTTRepository.countByTaskIdAndStateSub(taskId, "done");

        double progressPercent = 0.0;
        if (totalSubs > 0) {
            progressPercent = ((double) completedSubs / totalSubs) * 100.0;
        }

        Map<String, Object> progressData = new HashMap<>();
        progressData.put("taskId", taskId);
        progressData.put("completedSubs", completedSubs);
        progressData.put("totalSubs", totalSubs);
        progressData.put("progressPercent", progressPercent);

        return progressData;
    }

    /**
     * Checks if all subtasks of a given task are completed.
     * Replicates the check_subtask_completion Oracle SP.
     *
     * @param taskId  the ID of the main task
     * @return true if there are no pending subtasks, false otherwise
     */
    public boolean checkSubTaskCompletion(long taskId) {
        long totalSubs = subTaskTTRepository.countByTaskId(taskId);
        long completedSubs = subTaskTTRepository.countByTaskIdAndStateSub(taskId, "done");
        
        // If they matching, there are no pending subtasks
        return totalSubs > 0 && totalSubs == completedSubs;
    }

    /**
     * Adds a quick subtask with minimal required information.
     * Replicates the add_quick_subtask Oracle SP.
     *
     * @param taskId  the ID of the main task
     * @param name    the name of the subtask
     * @return the created SubTaskTT
     */
    public SubTaskTT addQuickSubTask(long taskId, String name) {
        SubTaskTT quickSubTask = new SubTaskTT();
        quickSubTask.setNameSub(name);
        quickSubTask.setTaskId(taskId);
        quickSubTask.setStateSub("active");
        quickSubTask.setPrioritySub("medium");
        quickSubTask.setDateStartSub(LocalDate.now());

        return subTaskTTRepository.save(quickSubTask);
    }
}
