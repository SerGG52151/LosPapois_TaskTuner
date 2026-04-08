package com.springboot.MyTodoList.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

/*
 * ============================================================
 *  Composite Key: ProjectUserKey
 *  Used by:       ProjectUserTT  →  PROJECT_USER_TT
 * ============================================================
 *
 *  JPA specification requires composite primary keys to live in a
 *  dedicated class that satisfies three rules:
 *    1. Must be annotated @Embeddable (or used with @IdClass).
 *    2. Must implement Serializable — JPA caches and serializes keys.
 *    3. Must override equals() and hashCode() — the 1st-level entity
 *       cache uses these to compare identity, so without them two
 *       objects with the same IDs would appear to be different rows.
 *
 *  This key encodes the many-to-many link:
 *    one Project ↔ many Users,  one User ↔ many Projects
 */
@Embeddable
public class ProjectUserKey implements Serializable {

    /*
     * Foreign key component pointing to PROJECT_TT.pj_id.
     * Combined with userId, uniquely identifies a membership row.
     */
    @Column(name = "PJ_ID")
    private long pjId;

    /*
     * Foreign key component pointing to USER_TT.user_id.
     */
    @Column(name = "USER_ID")
    private long userId;

    // ─── Constructors ────────────────────────────────────────────────────

    /** No-args constructor required by the JPA @Embeddable contract. */
    public ProjectUserKey() {}

    /** Convenience constructor for building a key inline. */
    public ProjectUserKey(long pjId, long userId) {
        this.pjId   = pjId;
        this.userId = userId;
    }

    // ─── Getters & Setters ───────────────────────────────────────────────

    public long getPjId()              { return pjId; }
    public void setPjId(long pjId)     { this.pjId = pjId; }

    public long getUserId()            { return userId; }
    public void setUserId(long userId) { this.userId = userId; }

    // ─── equals & hashCode ───────────────────────────────────────────────
    //
    //  These are MANDATORY for composite keys.
    //  If omitted, Hibernate cannot correctly identify whether two
    //  in-memory key objects refer to the same database row.

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProjectUserKey)) return false;
        ProjectUserKey that = (ProjectUserKey) o;
        return pjId == that.pjId && userId == that.userId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(pjId, userId);
    }
}
