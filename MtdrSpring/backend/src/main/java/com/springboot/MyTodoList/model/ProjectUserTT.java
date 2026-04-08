package com.springboot.MyTodoList.model;

import jakarta.persistence.*;

/*
 * ============================================================
 *  Entity: ProjectUserTT
 *  Table:  PROJECT_USER_TT
 * ============================================================
 *
 *  Junction/bridge table that resolves the many-to-many relationship
 *  between projects and users. A row here means:
 *    "user X is a team member of project Y"
 *
 *  This membership check is the core guard inside the Oracle stored
 *  procedure safe_assign_task — a task can only be assigned to a user
 *  if a row exists here for (pj_id, user_id). That same rule is
 *  re-implemented in TaskTTService.safeAssignTask().
 *
 *  Oracle DDL:
 *    CREATE TABLE project_user_tt (
 *        pj_id   NUMBER,
 *        user_id NUMBER,
 *        CONSTRAINT pk_project_user PRIMARY KEY (pj_id, user_id),
 *        CONSTRAINT fk_pj_link  FOREIGN KEY (pj_id)   REFERENCES project_tt(pj_id)  ON DELETE CASCADE,
 *        CONSTRAINT fk_user_link FOREIGN KEY (user_id) REFERENCES user_tt(user_id)   ON DELETE CASCADE
 *    );
 */
@Entity
@Table(name = "PROJECT_USER_TT")
public class ProjectUserTT {

    /*
     * Composite primary key embedded from ProjectUserKey.
     * @EmbeddedId tells JPA to look inside ProjectUserKey for the
     * actual @Column mappings (pj_id and user_id).
     */
    @EmbeddedId
    private ProjectUserKey id;

    // ─── Constructors ────────────────────────────────────────────────────

    /** No-args constructor required by JPA. */
    public ProjectUserTT() {}

    /** Build from an already-constructed key object. */
    public ProjectUserTT(ProjectUserKey id) {
        this.id = id;
    }

    /** Build directly from raw IDs — creates the key internally. */
    public ProjectUserTT(long pjId, long userId) {
        this.id = new ProjectUserKey(pjId, userId);
    }

    // ─── Getters & Setters ───────────────────────────────────────────────

    public ProjectUserKey getId()          { return id; }
    public void setId(ProjectUserKey id)   { this.id = id; }

    /**
     * Convenience accessor — delegates to the embedded key.
     * Avoids callers needing to do entity.getId().getPjId().
     */
    public long getPjId()   { return id.getPjId(); }

    /**
     * Convenience accessor — delegates to the embedded key.
     */
    public long getUserId() { return id.getUserId(); }
}
