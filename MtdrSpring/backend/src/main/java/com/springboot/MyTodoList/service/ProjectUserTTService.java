package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.ProjectUserKey;
import com.springboot.MyTodoList.model.ProjectUserTT;
import com.springboot.MyTodoList.repository.ProjectUserTTRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/*
 * ============================================================
 *  Service: ProjectUserTTService
 *  Table:   PROJECT_USER_TT
 * ============================================================
 *
 *  Manages project team membership.
 *  The primary operations are: adding a user to a project,
 *  removing them, and checking whether they belong to a project.
 *
 *  The membership check (isMember) is also used by TaskTTService
 *  as the guard inside safeAssignTask — this class does NOT duplicate
 *  that logic; instead, TaskTTService calls the repository directly
 *  to keep the chain clean.
 */
@Service
public class ProjectUserTTService {

    @Autowired
    private ProjectUserTTRepository projectUserTTRepository;

    // ─── Read Operations ─────────────────────────────────────────────────

    /**
     * Returns all project memberships in the system.
     * Rarely used directly — prefer the project/user-scoped methods below.
     */
    public List<ProjectUserTT> findAll() {
        return projectUserTTRepository.findAll();
    }

    /**
     * Returns all team members of a given project.
     *
     * @param pjId  the project to query
     * @return list of ProjectUserTT rows — each row = one member
     */
    public List<ProjectUserTT> getMembersOfProject(long pjId) {
        return projectUserTTRepository.findByIdPjId(pjId);
    }

    /**
     * Returns all projects a user belongs to.
     *
     * @param userId  the user to query
     * @return list of ProjectUserTT rows — each row = one project membership
     */
    public List<ProjectUserTT> getProjectsForUser(long userId) {
        return projectUserTTRepository.findByIdUserId(userId);
    }

    /**
     * Checks whether a user is currently a member of a project.
     *
     * Used as a guard before task assignment:
     *   if (!projectUserTTService.isMember(pjId, userId)) → reject
     *
     * @param pjId    the project ID
     * @param userId  the user ID
     * @return true if a membership row exists in PROJECT_USER_TT
     */
    public boolean isMember(long pjId, long userId) {
        return projectUserTTRepository.existsByIdPjIdAndIdUserId(pjId, userId);
    }

    // ─── Write Operations ─────────────────────────────────────────────────

    /**
     * Adds a user to a project (creates a membership row).
     *
     * If the row already exists, save() is idempotent — JPA will
     * try an INSERT that Oracle will reject as a PK conflict, so
     * callers should check isMember() first when in doubt.
     *
     * @param pjId    the project to add the user to
     * @param userId  the user to add
     * @return the saved ProjectUserTT entity
     */
    public ProjectUserTT addMember(long pjId, long userId) {
        ProjectUserTT membership = new ProjectUserTT(pjId, userId);
        return projectUserTTRepository.save(membership);
    }

    /**
     * Removes a user from a project (deletes the membership row).
     *
     * After this call, TaskTTService.safeAssignTask() will reject
     * any attempt to assign tasks in that project to this user.
     *
     * @param pjId    the project ID
     * @param userId  the user ID
     * @return true if removed successfully, false if an exception occurred
     */
    public boolean removeMember(long pjId, long userId) {
        try {
            ProjectUserKey key = new ProjectUserKey(pjId, userId);
            projectUserTTRepository.deleteById(key);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
