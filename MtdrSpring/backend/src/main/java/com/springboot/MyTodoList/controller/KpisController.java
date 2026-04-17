package com.springboot.MyTodoList.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.springboot.MyTodoList.service.KpisService;

/*
 *  Nivel proyecto (todos los sprints):
 *    GET /projects/{pjId}/kpis/velocity
 *    GET /projects/{pjId}/kpis/retrabajo
 *    GET /projects/{pjId}/kpis/carga-equipo
 *    GET /projects/{pjId}/kpis/completitud
 *
 *  Nivel sprint (un sprint específico):
 *    GET /projects/{pjId}/sprints/{sprId}/kpis/velocity
 *    GET /projects/{pjId}/sprints/{sprId}/kpis/retrabajo
 *    GET /projects/{pjId}/sprints/{sprId}/kpis/carga-equipo
 *    GET /projects/{pjId}/sprints/{sprId}/kpis/completitud
 */
@RestController
public class KpisController {

    @Autowired
    private KpisService kpisService;

    // ─── Nivel proyecto ───────────────────────────────────────────────────────

    @GetMapping("/projects/{pjId}/kpis/project-velocity")
    public ResponseEntity<Map<String, Object>> getProjectVelocityMetric(@PathVariable long pjId) {
        return ResponseEntity.ok(kpisService.getProjectVelocityMetric(pjId));
    }

    @GetMapping("/projects/{pjId}/kpis/velocity")
    public ResponseEntity<List<Map<String, Object>>> getVelocityByProject(@PathVariable long pjId) {
        return ResponseEntity.ok(kpisService.getVelocityByProject(pjId));
    }

    @GetMapping("/projects/{pjId}/kpis/retrabajo")
    public ResponseEntity<List<Map<String, Object>>> getRetrabajoByProject(@PathVariable long pjId) {
        return ResponseEntity.ok(kpisService.getRetrabajoByProject(pjId));
    }

    @GetMapping("/projects/{pjId}/kpis/carga-equipo")
    public ResponseEntity<List<Map<String, Object>>> getCargaEquipoByProject(@PathVariable long pjId) {
        return ResponseEntity.ok(kpisService.getCargaEquipoByProject(pjId));
    }

    @GetMapping("/projects/{pjId}/kpis/completitud")
    public ResponseEntity<List<Map<String, Object>>> getCompletitudByProject(@PathVariable long pjId) {
        return ResponseEntity.ok(kpisService.getCompletitudByProject(pjId));
    }

    // ─── Nivel sprint ─────────────────────────────────────────────────────────

    @GetMapping("/projects/{pjId}/sprints/{sprId}/kpis/velocity")
    public ResponseEntity<List<Map<String, Object>>> getVelocityBySprint(
            @PathVariable long pjId, @PathVariable long sprId) {
        return ResponseEntity.ok(kpisService.getVelocityBySprint(pjId, sprId));
    }

    @GetMapping("/projects/{pjId}/sprints/{sprId}/kpis/retrabajo")
    public ResponseEntity<List<Map<String, Object>>> getRetrabajoBySprint(
            @PathVariable long pjId, @PathVariable long sprId) {
        return ResponseEntity.ok(kpisService.getRetrabajoBySprint(pjId, sprId));
    }

    @GetMapping("/projects/{pjId}/sprints/{sprId}/kpis/carga-equipo")
    public ResponseEntity<List<Map<String, Object>>> getCargaEquipoBySprint(
            @PathVariable long pjId, @PathVariable long sprId) {
        return ResponseEntity.ok(kpisService.getCargaEquipoBySprint(pjId, sprId));
    }

    @GetMapping("/projects/{pjId}/sprints/{sprId}/kpis/completitud")
    public ResponseEntity<List<Map<String, Object>>> getCompletitudBySprint(
            @PathVariable long pjId, @PathVariable long sprId) {
        return ResponseEntity.ok(kpisService.getCompletitudBySprint(pjId, sprId));
    }
}
