package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.ProjectUserKey;
import com.springboot.MyTodoList.model.ProjectUserTT;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.List;

/*
 * ============================================================
 *  Repository: ProjectUserTTRepository
 *  Entity:     ProjectUserTT  →  PROJECT_USER_TT table
 * ============================================================
 *
 *  The ID type is ProjectUserKey (composite key) not a single Long.
 *  JpaRepository<ProjectUserTT, ProjectUserKey> gives us:
 *    findById(ProjectUserKey) → SELECT WHERE pj_id=? AND user_id=?
 *    save(entity)             → INSERT membership row
 *    deleteById(key)          → DELETE membership row
 *
 *  NOTE: The method names below use "ById" prefixes that navigate
 *  INTO the @EmbeddedId field. Spring Data resolves the path:
 *    "id" (the @EmbeddedId field name in ProjectUserTT)
 *      → "pjId" (field inside ProjectUserKey)
 *  Result: findByIdPjId(...) queries WHERE pj_id = ?
 *
 *  This repository is CRITICAL for the safe_assign_task business rule:
 *    before assigning a task, TaskTTService calls existsByIdPjIdAndIdUserId()
 *    to check if the target user is actually in the task's project.
 */
@Repository
@Transactional
@EnableTransactionManagement
public interface ProjectUserTTRepository extends JpaRepository<ProjectUserTT, ProjectUserKey> {

    /*
     * Find all membership rows for a given project (its full team roster).
     *
     * Generated SQL:
     *   SELECT * FROM project_user_tt WHERE pj_id = ?
     *
     * Use case: "show all team members for project X"
     */
    List<ProjectUserTT> findByIdPjId(long pjId);

    /*
     * Find all project memberships for a given user.
     *
     * Generated SQL:
     *   SELECT * FROM project_user_tt WHERE user_id = ?
     *
     * Use case: "show all projects user X belongs to"
     */
    List<ProjectUserTT> findByIdUserId(long userId);

    /*
     * Check whether a user is a member of a specific project.
     *
     * Generated SQL:
     *   SELECT COUNT(*) > 0 FROM project_user_tt WHERE pj_id = ? AND user_id = ?
     *
     * Returns true if a membership row exists, false otherwise.
     *
     * This is the Java equivalent of the check inside the Oracle SP:
     *   SELECT COUNT(*) INTO v_is_member
     *   FROM project_user_tt WHERE pj_id = v_pj_id AND user_id = p_user_id;
     *   IF v_is_member > 0 THEN ...
     *
     * Used by TaskTTService.safeAssignTask() before updating task.user_id.
     */
    boolean existsByIdPjIdAndIdUserId(long pjId, long userId);
}
