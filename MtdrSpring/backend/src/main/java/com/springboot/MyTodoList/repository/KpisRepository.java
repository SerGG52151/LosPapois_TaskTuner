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
        "       COUNT(st.TASK_ID) AS tareas_completadas " +
        "FROM SPRINT_TT s " +
        "JOIN SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID " +
        "WHERE st.STATE_TASK = 'done' " +
        "  AND s.PJ_ID = :pjId " +
        "GROUP BY s.SPR_ID, s.NAME_SPRINT " +
        "ORDER BY s.SPR_ID",
        nativeQuery = true)
    List<Object[]> getVelocityByProject(@Param("pjId") long pjId);

    @Query(value =
        "SELECT s.NAME_SPRINT AS sprint, " +
        "       COUNT(CASE WHEN st.STATE_TASK = 'delayed' THEN 1 END) AS arrastradas, " +
        "       COUNT(*) AS total, " +
        "       ROUND(COUNT(CASE WHEN st.STATE_TASK = 'delayed' THEN 1 END) * 100.0 / COUNT(*), 2) AS tasa " +
        "FROM SPRINT_TT s " +
        "JOIN SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID " +
        "WHERE s.PJ_ID = :pjId " +
        "GROUP BY s.SPR_ID, s.NAME_SPRINT " +
        "ORDER BY s.SPR_ID",
        nativeQuery = true)
    List<Object[]> getRetrabajoByProject(@Param("pjId") long pjId);

    @Query(value =
        "SELECT u.NAME_USER AS nombre, " +
        "       u.ROLE AS rol, " +
        "       COUNT(st.TASK_ID) AS tareas_activas " +
        "FROM USER_TT u " +
        "JOIN TASK_TT t ON t.USER_ID = u.USER_ID " +
        "JOIN SPRINT_TASK_TT st ON st.TASK_ID = t.TASK_ID " +
        "WHERE st.STATE_TASK = 'active' " +
        "  AND t.PJ_ID = :pjId " +
        "GROUP BY u.USER_ID, u.NAME_USER, u.ROLE " +
        "ORDER BY tareas_activas DESC",
        nativeQuery = true)
    List<Object[]> getCargaEquipoByProject(@Param("pjId") long pjId);

    @Query(value =
        "SELECT s.NAME_SPRINT AS sprint, " +
        "       COUNT(CASE WHEN st.STATE_TASK = 'done' THEN 1 END) AS completadas, " +
        "       COUNT(*) AS planeadas, " +
        "       ROUND(COUNT(CASE WHEN st.STATE_TASK = 'done' THEN 1 END) * 100.0 / COUNT(*), 2) AS pct " +
        "FROM SPRINT_TT s " +
        "JOIN SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID " +
        "WHERE s.PJ_ID = :pjId " +
        "GROUP BY s.SPR_ID, s.NAME_SPRINT " +
        "ORDER BY s.SPR_ID",
        nativeQuery = true)
    List<Object[]> getCompletitudByProject(@Param("pjId") long pjId);

    // ─── Por sprint específico ────────────────────────────────────────────────

    @Query(value =
        "SELECT s.NAME_SPRINT AS sprint, " +
        "       COUNT(st.TASK_ID) AS tareas_completadas " +
        "FROM SPRINT_TT s " +
        "JOIN SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID " +
        "WHERE st.STATE_TASK = 'done' " +
        "  AND s.PJ_ID = :pjId " +
        "  AND s.SPR_ID = :sprId " +
        "GROUP BY s.SPR_ID, s.NAME_SPRINT",
        nativeQuery = true)
    List<Object[]> getVelocityBySprint(@Param("pjId") long pjId, @Param("sprId") long sprId);

    @Query(value =
        "SELECT s.NAME_SPRINT AS sprint, " +
        "       COUNT(CASE WHEN st.STATE_TASK = 'delayed' THEN 1 END) AS arrastradas, " +
        "       COUNT(*) AS total, " +
        "       ROUND(COUNT(CASE WHEN st.STATE_TASK = 'delayed' THEN 1 END) * 100.0 / COUNT(*), 2) AS tasa " +
        "FROM SPRINT_TT s " +
        "JOIN SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID " +
        "WHERE s.PJ_ID = :pjId " +
        "  AND s.SPR_ID = :sprId " +
        "GROUP BY s.SPR_ID, s.NAME_SPRINT",
        nativeQuery = true)
    List<Object[]> getRetrabajoBySprint(@Param("pjId") long pjId, @Param("sprId") long sprId);

    @Query(value =
        "SELECT u.NAME_USER AS nombre, " +
        "       u.ROLE AS rol, " +
        "       COUNT(st.TASK_ID) AS tareas_activas " +
        "FROM USER_TT u " +
        "JOIN TASK_TT t ON t.USER_ID = u.USER_ID " +
        "JOIN SPRINT_TASK_TT st ON st.TASK_ID = t.TASK_ID " +
        "WHERE st.STATE_TASK = 'active' " +
        "  AND t.PJ_ID = :pjId " +
        "  AND st.SPR_ID = :sprId " +
        "GROUP BY u.USER_ID, u.NAME_USER, u.ROLE " +
        "ORDER BY tareas_activas DESC",
        nativeQuery = true)
    List<Object[]> getCargaEquipoBySprint(@Param("pjId") long pjId, @Param("sprId") long sprId);

    @Query(value =
        "SELECT s.NAME_SPRINT AS sprint, " +
        "       COUNT(CASE WHEN st.STATE_TASK = 'done' THEN 1 END) AS completadas, " +
        "       COUNT(*) AS planeadas, " +
        "       ROUND(COUNT(CASE WHEN st.STATE_TASK = 'done' THEN 1 END) * 100.0 / COUNT(*), 2) AS pct " +
        "FROM SPRINT_TT s " +
        "JOIN SPRINT_TASK_TT st ON st.SPR_ID = s.SPR_ID " +
        "WHERE s.PJ_ID = :pjId " +
        "  AND s.SPR_ID = :sprId " +
        "GROUP BY s.SPR_ID, s.NAME_SPRINT",
        nativeQuery = true)
    List<Object[]> getCompletitudBySprint(@Param("pjId") long pjId, @Param("sprId") long sprId);
}
