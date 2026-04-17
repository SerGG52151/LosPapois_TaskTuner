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

    // ─── Por proyecto ─────────────────────────────────────────────────────────

    public Map<String, Object> getProjectVelocityMetric(long pjId) {
        Object[] row = kpisRepository.getProjectVelocityMetric(pjId);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("sprints_finalizados", row[0]);
        result.put("velocidad_promedio",  row[1]);
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

    // ─── Por sprint ───────────────────────────────────────────────────────────

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

    // ─── Mappers privados ────────────────────────────────────────────────────

    private List<Map<String, Object>> mapVelocity(List<Object[]> rows) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("sprint",             row[0]);
            map.put("tareas_completadas", row[1]);
            map.put("puntos_ponderados",  row[2]);
            result.add(map);
        }
        return result;
    }

    private List<Map<String, Object>> mapRetrabajo(List<Object[]> rows) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("sprint",          row[0]);
            map.put("pts_arrastrados", row[1]);
            map.put("pts_total",       row[2]);
            map.put("tasa_ponderada",  row[3]);
            result.add(map);
        }
        return result;
    }

    private List<Map<String, Object>> mapCarga(List<Object[]> rows) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("nombre",          row[0]);
            map.put("rol",             row[1]);
            map.put("tareas_activas",  row[2]);
            map.put("carga_ponderada", row[3]);
            result.add(map);
        }
        return result;
    }

    private List<Map<String, Object>> mapCompletitud(List<Object[]> rows) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("sprint",          row[0]);
            map.put("pts_completados", row[1]);
            map.put("pts_planeados",   row[2]);
            map.put("pct_ponderado",   row[3]);
            result.add(map);
        }
        return result;
    }
}
