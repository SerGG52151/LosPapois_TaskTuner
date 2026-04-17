package com.springboot.MyTodoList.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.springboot.MyTodoList.model.TaskTT;

@Repository
public interface KpisRepository extends JpaRepository<TaskTT, Long> {

    // ─── Por proyecto (todos los sprints) ────────────────────────────────────

    @Query(value =
        "SELECT s.NAME_SPRINT AS sprint, " +
        "       COUNT(st.TASK_ID) AS tareas_completadas, " +
        "       ROUND(SUM(t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY)), 2) AS puntos_ponderados " +
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
        "SELECT COUNT(DISTINCT s.SPR_ID) AS sprints_finalizados, " +
        "       ROUND( " +
        "           SUM( " +
        "               CASE WHEN (s.DATE_END_SPR - s.DATE_START_SPR) > 0 " +
        "               THEN (t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY)) " +
        "                    / (s.DATE_END_SPR - s.DATE_START_SPR) " +
        "               ELSE 0 END " +
        "           ) / NULLIF(COUNT(DISTINCT s.SPR_ID), 0), 2 " +
        "       ) AS velocidad_promedio " +
        "FROM LOSPAPOIS.SPRINT_TT s " +
        "JOIN LOSPAPOIS.SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID AND st.STATE_TASK = 'done' " +
        "JOIN LOSPAPOIS.TASK_TT t ON t.TASK_ID = st.TASK_ID " +
        "WHERE s.PJ_ID = :pjId " +
        "  AND s.STATE_SPRINT = 'done'",
        nativeQuery = true)
    Object[] getProjectVelocityMetric(@Param("pjId") long pjId);

    @Query(value =
        "SELECT s.NAME_SPRINT AS sprint, " +
        "       ROUND(SUM(CASE WHEN st.STATE_TASK = 'delayed' " +
        "                 THEN t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY) ELSE 0 END), 2) AS pts_arrastrados, " +
        "       ROUND(SUM(t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY)), 2) AS pts_total, " +
        "       ROUND( " +
        "           SUM(CASE WHEN st.STATE_TASK = 'delayed' " +
        "               THEN t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY) ELSE 0 END) * 100.0 " +
        "           / NULLIF(SUM(t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY)), 0), 2 " +
        "       ) AS tasa_ponderada " +
        "FROM SPRINT_TT s " +
        "JOIN SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID " +
        "JOIN TASK_TT t ON t.TASK_ID = st.TASK_ID " +
        "WHERE s.PJ_ID = :pjId " +
        "GROUP BY s.SPR_ID, s.NAME_SPRINT " +
        "ORDER BY s.SPR_ID",
        nativeQuery = true)
    List<Object[]> getRetrabajoByProject(@Param("pjId") long pjId);

    @Query(value =
        "SELECT u.NAME_USER AS nombre, " +
        "       u.ROLE AS rol, " +
        "       COUNT(st.TASK_ID) AS tareas_activas, " +
        "       ROUND(SUM(t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY)), 2) AS carga_ponderada " +
        "FROM USER_TT u " +
        "JOIN TASK_TT t ON t.USER_ID = u.USER_ID " +
        "JOIN SPRINT_TASK_TT st ON st.TASK_ID = t.TASK_ID " +
        "WHERE st.STATE_TASK = 'active' " +
        "  AND t.PJ_ID = :pjId " +
        "GROUP BY u.USER_ID, u.NAME_USER, u.ROLE " +
        "ORDER BY carga_ponderada DESC",
        nativeQuery = true)
    List<Object[]> getCargaEquipoByProject(@Param("pjId") long pjId);

    @Query(value =
        "SELECT s.NAME_SPRINT AS sprint, " +
        "       ROUND(SUM(CASE WHEN st.STATE_TASK = 'done' " +
        "                 THEN t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY) ELSE 0 END), 2) AS pts_completados, " +
        "       ROUND(SUM(t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY)), 2) AS pts_planeados, " +
        "       ROUND( " +
        "           SUM(CASE WHEN st.STATE_TASK = 'done' " +
        "               THEN t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY) ELSE 0 END) * 100.0 " +
        "           / NULLIF(SUM(t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY)), 0), 2 " +
        "       ) AS pct_ponderado " +
        "FROM SPRINT_TT s " +
        "JOIN SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID " +
        "JOIN TASK_TT t ON t.TASK_ID = st.TASK_ID " +
        "WHERE s.PJ_ID = :pjId " +
        "GROUP BY s.SPR_ID, s.NAME_SPRINT " +
        "ORDER BY s.SPR_ID",
        nativeQuery = true)
    List<Object[]> getCompletitudByProject(@Param("pjId") long pjId);

    // ─── Por sprint específico ────────────────────────────────────────────────

    @Query(value =
        "SELECT s.NAME_SPRINT AS sprint, " +
        "       COUNT(st.TASK_ID) AS tareas_completadas, " +
        "       ROUND(SUM(t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY)), 2) AS puntos_ponderados " +
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
        "                 THEN t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY) ELSE 0 END), 2) AS pts_arrastrados, " +
        "       ROUND(SUM(t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY)), 2) AS pts_total, " +
        "       ROUND( " +
        "           SUM(CASE WHEN st.STATE_TASK = 'delayed' " +
        "               THEN t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY) ELSE 0 END) * 100.0 " +
        "           / NULLIF(SUM(t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY)), 0), 2 " +
        "       ) AS tasa_ponderada " +
        "FROM SPRINT_TT s " +
        "JOIN SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID " +
        "JOIN TASK_TT t ON t.TASK_ID = st.TASK_ID " +
        "WHERE s.PJ_ID = :pjId " +
        "  AND s.SPR_ID = :sprId " +
        "GROUP BY s.SPR_ID, s.NAME_SPRINT",
        nativeQuery = true)
    List<Object[]> getRetrabajoBySprint(@Param("pjId") long pjId, @Param("sprId") long sprId);

    @Query(value =
        "SELECT u.NAME_USER AS nombre, " +
        "       u.ROLE AS rol, " +
        "       COUNT(st.TASK_ID) AS tareas_activas, " +
        "       ROUND(SUM(t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY)), 2) AS carga_ponderada " +
        "FROM USER_TT u " +
        "JOIN TASK_TT t ON t.USER_ID = u.USER_ID " +
        "JOIN SPRINT_TASK_TT st ON st.TASK_ID = t.TASK_ID " +
        "WHERE st.STATE_TASK = 'active' " +
        "  AND t.PJ_ID = :pjId " +
        "  AND st.SPR_ID = :sprId " +
        "GROUP BY u.USER_ID, u.NAME_USER, u.ROLE " +
        "ORDER BY carga_ponderada DESC",
        nativeQuery = true)
    List<Object[]> getCargaEquipoBySprint(@Param("pjId") long pjId, @Param("sprId") long sprId);

    @Query(value =
        "SELECT s.NAME_SPRINT AS sprint, " +
        "       ROUND(SUM(CASE WHEN st.STATE_TASK = 'done' " +
        "                 THEN t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY) ELSE 0 END), 2) AS pts_completados, " +
        "       ROUND(SUM(t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY)), 2) AS pts_planeados, " +
        "       ROUND( " +
        "           SUM(CASE WHEN st.STATE_TASK = 'done' " +
        "               THEN t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY) ELSE 0 END) * 100.0 " +
        "           / NULLIF(SUM(t.STORY_POINTS + LOSPAPOIS.get_priority_weight(t.PRIORITY)), 0), 2 " +
        "       ) AS pct_ponderado " +
        "FROM SPRINT_TT s " +
        "JOIN SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID " +
        "JOIN TASK_TT t ON t.TASK_ID = st.TASK_ID " +
        "WHERE s.PJ_ID = :pjId " +
        "  AND s.SPR_ID = :sprId " +
        "GROUP BY s.SPR_ID, s.NAME_SPRINT",
        nativeQuery = true)
    List<Object[]> getCompletitudBySprint(@Param("pjId") long pjId, @Param("sprId") long sprId);
}
