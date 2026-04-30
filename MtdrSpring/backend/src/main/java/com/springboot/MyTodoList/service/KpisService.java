package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.repository.KpisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class KpisService {

    @Autowired
    private KpisRepository kpisRepository;

    // ─── By project ───────────────────────────────────────────────────────────

    public Map<String, Object> getProjectVelocityMetric(long pjId) {
        Object[] row = kpisRepository.getProjectVelocityMetric(pjId);
        Map<String, Object> result = new LinkedHashMap<>();
        // The query aggregates over sprints with STATE_SPRINT='done'. When the
        // project has no completed sprints yet, the result is either null or
        // an array of nulls. 
        if (row == null || row.length < 2) {
            result.put("finished_sprints", 0);
            result.put("avg_velocity",     null);
        } else {
            result.put("finished_sprints", row[0] != null ? row[0] : 0);
            result.put("avg_velocity",     row[1]);
        }
        return result;
    }

    public List<Map<String, Object>> getVelocityByProject(long pjId) {
        return mapVelocity(kpisRepository.getVelocityByProject(pjId));
    }

    public List<Map<String, Object>> getRetrabajoByProject(long pjId) {
        return mapRetrabajo(kpisRepository.getRetrabajoByProject(pjId));
    }

    public List<Map<String, Object>> getCargaEquipoByProject(long pjId) {
        return mapCarga(kpisRepository.getCargaEquipoByProject(pjId));
    }

    public List<Map<String, Object>> getCompletitudByProject(long pjId) {
        return mapCompletitud(kpisRepository.getCompletitudByProject(pjId));
    }

    // ─── By sprint ────────────────────────────────────────────────────────────

    public List<Map<String, Object>> getVelocityBySprint(long pjId, long sprId) {
        return mapVelocity(kpisRepository.getVelocityBySprint(pjId, sprId));
    }

    public List<Map<String, Object>> getRetrabajoBySprint(long pjId, long sprId) {
        return mapRetrabajo(kpisRepository.getRetrabajoBySprint(pjId, sprId));
    }

    public List<Map<String, Object>> getCargaEquipoBySprint(long pjId, long sprId) {
        return mapCarga(kpisRepository.getCargaEquipoBySprint(pjId, sprId));
    }

    public List<Map<String, Object>> getCompletitudBySprint(long pjId, long sprId) {
        return mapCompletitud(kpisRepository.getCompletitudBySprint(pjId, sprId));
    }

    // ─── By feature ───────────────────────────────────────────────────────────

    public List<Map<String, Object>> getCompletitudByFeature(long featureId) {
        return mapCompletitudFeature(kpisRepository.getCompletitudByFeature(featureId));
    }

    public List<Map<String, Object>> getVelocityByFeature(long featureId) {
        return mapVelocityFeature(kpisRepository.getVelocityByFeature(featureId));
    }

    public List<Map<String, Object>> getCargaByFeature(long featureId) {
        return mapCargaFeature(kpisRepository.getCargaByFeature(featureId));
    }

    // ─── Mappers ──────────────────────────────────────────────────────────────

    private List<Map<String, Object>> mapVelocity(List<Object[]> rows) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("sprint",           row[0]);
            map.put("completed_tasks",  row[1]);
            map.put("weighted_points",  row[2]);
            result.add(map);
        }
        return result;
    }

    private List<Map<String, Object>> mapRetrabajo(List<Object[]> rows) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("sprint",         row[0]);
            map.put("carried_points", row[1]);
            map.put("total_points",   row[2]);
            map.put("rework_rate",    row[3]);
            result.add(map);
        }
        return result;
    }

    private List<Map<String, Object>> mapCarga(List<Object[]> rows) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("name",          row[0]);
            map.put("role",          row[1]);
            map.put("active_tasks",  row[2]);
            map.put("weighted_load", row[3]);
            result.add(map);
        }
        return result;
    }

    // Weighted completitud: high=3, medium=2, low=1 — high-impact tasks weigh more
    private List<Map<String, Object>> mapCompletitud(List<Object[]> rows) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("sprint",            row[0]);
            map.put("completed_weight",  row[1]);
            map.put("total_weight",      row[2]);
            map.put("pct_weighted",      row[3]);
            result.add(map);
        }
        return result;
    }

    // Weighted completitud at feature level (includes raw SP + weighted SP)
    private List<Map<String, Object>> mapCompletitudFeature(List<Object[]> rows) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("feature",          row[0]);
            map.put("feature_priority", row[1]);
            map.put("total_sp",         row[2]);
            map.put("completed_sp",     row[3]);
            map.put("total_weight",     row[4]);
            map.put("completed_weight", row[5]);
            map.put("pct_weighted",     row[6]);
            result.add(map);
        }
        return result;
    }

    private List<Map<String, Object>> mapVelocityFeature(List<Object[]> rows) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("feature",      row[0]);
            map.put("completed_sp", row[1]);
            map.put("total_sp",     row[2]);
            map.put("pct_sp",       row[3]);
            result.add(map);
        }
        return result;
    }

    private List<Map<String, Object>> mapCargaFeature(List<Object[]> rows) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("name",        row[0]);
            map.put("role",        row[1]);
            map.put("active_tasks", row[2]);
            map.put("assigned_sp", row[3]);
            result.add(map);
        }
        return result;
    }
}
