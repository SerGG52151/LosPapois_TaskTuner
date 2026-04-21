package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.SubTaskTT;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.List;

/*
 * ============================================================
 *  Repository: SubTaskTTRepository
 *  Entity:     SubTaskTT  →  SUBTASK_TT table
 * ============================================================
 *
 *  Provides CRUD for SubTaskTT entities plus custom derived query methods.
 */
@Repository
@Transactional
@EnableTransactionManagement
public interface SubTaskTTRepository extends JpaRepository<SubTaskTT, Long> {

    /*
     * All subtasks for a specific main task.
     *
     * Generated SQL:
     *   SELECT * FROM subtask_tt WHERE task_id = ?
     */
    List<SubTaskTT> findByTaskId(long taskId);

    /*
     * Count total subtasks for a specific main task.
     *
     * Equivalent to:
     *   SELECT COUNT(*) FROM subtask_tt WHERE task_id = p_task_id;
     */
    long countByTaskId(long taskId);

    /*
     * Count subtasks for a specific main task by their state.
     *
     * Equivalent to:
     *   SELECT COUNT(*) FROM subtask_tt WHERE task_id = p_task_id AND state_sub = 'done';
     */
    long countByTaskIdAndStateSub(long taskId, String stateSub);
}
