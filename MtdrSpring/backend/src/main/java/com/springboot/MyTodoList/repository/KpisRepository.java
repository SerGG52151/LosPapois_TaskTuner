package com.springboot.MyTodoList.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.springboot.MyTodoList.model.TaskTT;

@Repository
public interface KpisRepository extends JpaRepository<TaskTT, Long> {

    // ─── By project (all sprints) ─────────────────────────────────────────

    @Query(value =
        "SELECT s.NAME_SPRINT AS sprint, " +
        "       COUNT(st.TASK_ID) AS completed_tasks, " +
        "       ROUND(SUM(t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END), 2) AS weighted_points " +
        "FROM SPRINT_TT s " +
        "JOIN SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID " +
        "JOIN TASK_TT t ON t.TASK_ID = st.TASK_ID " +
        "WHERE st.STATE_TASK = 'done' " +
        "  AND s.PJ_ID = :pjId " +
        "GROUP BY s.SPR_ID, s.NAME_SPRINT " +
        "ORDER BY s.SPR_ID",
        nativeQuery = true)
    List<Object[]> getVelocityByProject(@Param("pjId") long pjId);

    @Query(value =
        "SELECT COUNT(DISTINCT s.SPR_ID) AS finished_sprints, " +
        "       ROUND( " +
        "           SUM( " +
        "               CASE WHEN (s.DATE_END_SPR - s.DATE_START_SPR) > 0 " +
        "               THEN (t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END) " +
        "                    / (s.DATE_END_SPR - s.DATE_START_SPR) " +
        "               ELSE 0 END " +
        "           ) / NULLIF(COUNT(DISTINCT s.SPR_ID), 0), 2 " +
        "       ) AS avg_velocity " +
        "FROM SPRINT_TT s " +
        "JOIN SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID AND st.STATE_TASK = 'done' " +
        "JOIN TASK_TT t ON t.TASK_ID = st.TASK_ID " +
        "WHERE s.PJ_ID = :pjId " +
        "  AND s.STATE_SPRINT = 'done'",
        nativeQuery = true)
    Object[] getProjectVelocityMetric(@Param("pjId") long pjId);

    @Query(value =
        "SELECT s.NAME_SPRINT AS sprint, " +
        "       ROUND(SUM(CASE WHEN st.STATE_TASK = 'delayed' " +
        "                 THEN t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END ELSE 0 END), 2) AS carried_points, " +
        "       ROUND(SUM(t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END), 2) AS total_points, " +
        "       ROUND( " +
        "           SUM(CASE WHEN st.STATE_TASK = 'delayed' " +
        "               THEN t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END ELSE 0 END) * 100.0 " +
        "           / NULLIF(SUM(t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END), 0), 2 " +
        "       ) AS rework_rate " +
        "FROM SPRINT_TT s " +
        "JOIN SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID " +
        "JOIN TASK_TT t ON t.TASK_ID = st.TASK_ID " +
        "WHERE s.PJ_ID = :pjId " +
        "GROUP BY s.SPR_ID, s.NAME_SPRINT " +
        "ORDER BY s.SPR_ID",
        nativeQuery = true)
    List<Object[]> getRetrabajoByProject(@Param("pjId") long pjId);

    @Query(value =
        "SELECT u.NAME_USER AS name, " +
        "       u.ROLE AS role, " +
        "       COUNT(st.TASK_ID) AS active_tasks, " +
        "       ROUND(SUM(t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END), 2) AS weighted_load " +
        "FROM USER_TT u " +
        "JOIN TASK_TT t ON t.USER_ID = u.USER_ID " +
        "JOIN SPRINT_TASK_TT st ON st.TASK_ID = t.TASK_ID " +
        "WHERE st.STATE_TASK = 'active' " +
        "  AND t.PJ_ID = :pjId " +
        "GROUP BY u.USER_ID, u.NAME_USER, u.ROLE " +
        "ORDER BY weighted_load DESC",
        nativeQuery = true)
    List<Object[]> getCargaEquipoByProject(@Param("pjId") long pjId);

    // Weighted completitud by SP × priority (project)
    @Query(value =
        "SELECT s.NAME_SPRINT AS sprint, " +
        "       SUM(CASE WHEN st.STATE_TASK = 'done' " +
        "           THEN t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END " +
        "           ELSE 0 END) AS completed_weight, " +
        "       SUM(t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END) AS total_weight, " +
        "       ROUND(SUM(CASE WHEN st.STATE_TASK = 'done' " +
        "           THEN t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END " +
        "           ELSE 0 END) * 100.0 / " +
        "           NULLIF(SUM(t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END), 0)" +
        "       , 2) AS pct_weighted " +
        "FROM SPRINT_TT s " +
        "JOIN SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID " +
        "JOIN TASK_TT t ON t.TASK_ID = st.TASK_ID " +
        "WHERE s.PJ_ID = :pjId " +
        "GROUP BY s.SPR_ID, s.NAME_SPRINT " +
        "ORDER BY s.SPR_ID",
        nativeQuery = true)
    List<Object[]> getCompletitudByProject(@Param("pjId") long pjId);

    // ─── By specific sprint ───────────────────────────────────────────────

    @Query(value =
        "SELECT s.NAME_SPRINT AS sprint, " +
        "       COUNT(st.TASK_ID) AS completed_tasks, " +
        "       ROUND(SUM(t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END), 2) AS weighted_points " +
        "FROM SPRINT_TT s " +
        "JOIN SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID " +
        "JOIN TASK_TT t ON t.TASK_ID = st.TASK_ID " +
        "WHERE st.STATE_TASK = 'done' " +
        "  AND s.PJ_ID = :pjId " +
        "  AND s.SPR_ID = :sprId " +
        "GROUP BY s.SPR_ID, s.NAME_SPRINT",
        nativeQuery = true)
    List<Object[]> getVelocityBySprint(@Param("pjId") long pjId, @Param("sprId") long sprId);

    @Query(value =
        "SELECT s.NAME_SPRINT AS sprint, " +
        "       ROUND(SUM(CASE WHEN st.STATE_TASK = 'delayed' " +
        "                 THEN t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END ELSE 0 END), 2) AS carried_points, " +
        "       ROUND(SUM(t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END), 2) AS total_points, " +
        "       ROUND( " +
        "           SUM(CASE WHEN st.STATE_TASK = 'delayed' " +
        "               THEN t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END ELSE 0 END) * 100.0 " +
        "           / NULLIF(SUM(t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END), 0), 2 " +
        "       ) AS rework_rate " +
        "FROM SPRINT_TT s " +
        "JOIN SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID " +
        "JOIN TASK_TT t ON t.TASK_ID = st.TASK_ID " +
        "WHERE s.PJ_ID = :pjId " +
        "  AND s.SPR_ID = :sprId " +
        "GROUP BY s.SPR_ID, s.NAME_SPRINT",
        nativeQuery = true)
    List<Object[]> getRetrabajoBySprint(@Param("pjId") long pjId, @Param("sprId") long sprId);

    @Query(value =
        "SELECT u.NAME_USER AS name, " +
        "       u.ROLE AS role, " +
        "       COUNT(st.TASK_ID) AS active_tasks, " +
        "       ROUND(SUM(t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END), 2) AS weighted_load " +
        "FROM USER_TT u " +
        "JOIN TASK_TT t ON t.USER_ID = u.USER_ID " +
        "JOIN SPRINT_TASK_TT st ON st.TASK_ID = t.TASK_ID " +
        "WHERE st.STATE_TASK = 'active' " +
        "  AND t.PJ_ID = :pjId " +
        "  AND st.SPR_ID = :sprId " +
        "GROUP BY u.USER_ID, u.NAME_USER, u.ROLE " +
        "ORDER BY weighted_load DESC",
        nativeQuery = true)
    List<Object[]> getCargaEquipoBySprint(@Param("pjId") long pjId, @Param("sprId") long sprId);

    // Weighted completitud by SP × priority (sprint)
    @Query(value =
        "SELECT s.NAME_SPRINT AS sprint, " +
        "       SUM(CASE WHEN st.STATE_TASK = 'done' " +
        "           THEN t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END " +
        "           ELSE 0 END) AS completed_weight, " +
        "       SUM(t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END) AS total_weight, " +
        "       ROUND(SUM(CASE WHEN st.STATE_TASK = 'done' " +
        "           THEN t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END " +
        "           ELSE 0 END) * 100.0 / " +
        "           NULLIF(SUM(t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END), 0)" +
        "       , 2) AS pct_weighted " +
        "FROM SPRINT_TT s " +
        "JOIN SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID " +
        "JOIN TASK_TT t ON t.TASK_ID = st.TASK_ID " +
        "WHERE s.PJ_ID = :pjId " +
        "  AND s.SPR_ID = :sprId " +
        "GROUP BY s.SPR_ID, s.NAME_SPRINT",
        nativeQuery = true)
    List<Object[]> getCompletitudBySprint(@Param("pjId") long pjId, @Param("sprId") long sprId);

    // ─── By feature ───────────────────────────────────────────────────────

    @Query(value =
        "SELECT f.NAME_FEATURE AS feature, " +
        "       f.PRIORITY_FEATURE AS feature_priority, " +
        "       SUM(t.STORY_POINTS) AS total_sp, " +
        "       SUM(CASE WHEN st.STATE_TASK = 'done' THEN t.STORY_POINTS ELSE 0 END) AS completed_sp, " +
        "       SUM(t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END) AS total_weight, " +
        "       SUM(CASE WHEN st.STATE_TASK = 'done' " +
        "           THEN t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END " +
        "           ELSE 0 END) AS completed_weight, " +
        "       ROUND(SUM(CASE WHEN st.STATE_TASK = 'done' " +
        "           THEN t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END " +
        "           ELSE 0 END) * 100.0 / " +
        "           NULLIF(SUM(t.STORY_POINTS * CASE t.PRIORITY WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END), 0)" +
        "       , 2) AS pct_weighted " +
        "FROM FEATURE_TT f " +
        "JOIN TASK_TT t ON t.FEATURE_ID = f.FEATURE_ID " +
        "JOIN SPRINT_TASK_TT st ON st.TASK_ID = t.TASK_ID " +
        "WHERE f.FEATURE_ID = :featureId " +
        "GROUP BY f.FEATURE_ID, f.NAME_FEATURE, f.PRIORITY_FEATURE",
        nativeQuery = true)
    List<Object[]> getCompletitudByFeature(@Param("featureId") long featureId);

    @Query(value =
        "SELECT f.NAME_FEATURE AS feature, " +
        "       SUM(CASE WHEN st.STATE_TASK = 'done' THEN t.STORY_POINTS ELSE 0 END) AS completed_sp, " +
        "       SUM(t.STORY_POINTS) AS total_sp, " +
        "       ROUND(SUM(CASE WHEN st.STATE_TASK = 'done' THEN t.STORY_POINTS ELSE 0 END) * 100.0 / " +
        "           NULLIF(SUM(t.STORY_POINTS), 0), 2) AS pct_sp " +
        "FROM FEATURE_TT f " +
        "JOIN TASK_TT t ON t.FEATURE_ID = f.FEATURE_ID " +
        "JOIN SPRINT_TASK_TT st ON st.TASK_ID = t.TASK_ID " +
        "WHERE f.FEATURE_ID = :featureId " +
        "GROUP BY f.FEATURE_ID, f.NAME_FEATURE",
        nativeQuery = true)
    List<Object[]> getVelocityByFeature(@Param("featureId") long featureId);

    @Query(value =
        "SELECT u.NAME_USER AS name, " +
        "       u.ROLE AS role, " +
        "       COUNT(t.TASK_ID) AS active_tasks, " +
        "       SUM(t.STORY_POINTS) AS assigned_sp " +
        "FROM USER_TT u " +
        "JOIN TASK_TT t ON t.USER_ID = u.USER_ID " +
        "JOIN SPRINT_TASK_TT st ON st.TASK_ID = t.TASK_ID " +
        "WHERE st.STATE_TASK = 'active' " +
        "  AND t.FEATURE_ID = :featureId " +
        "GROUP BY u.USER_ID, u.NAME_USER, u.ROLE " +
        "ORDER BY assigned_sp DESC",
        nativeQuery = true)
    List<Object[]> getCargaByFeature(@Param("featureId") long featureId);
}
