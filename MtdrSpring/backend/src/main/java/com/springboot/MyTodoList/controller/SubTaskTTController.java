package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.SubTaskTT;
import com.springboot.MyTodoList.service.SubTaskTTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class SubTaskTTController {

    @Autowired
    private SubTaskTTService subTaskTTService;

    @GetMapping(value = "/subtasks")
    public List<SubTaskTT> getAllSubTasks() {
        return subTaskTTService.findAll();
    }

    @GetMapping(value = "/subtasks/{id}")
    public ResponseEntity<SubTaskTT> getSubTaskById(@PathVariable long id) {
        try {
            return subTaskTTService.getSubTaskById(id);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping(value = "/tasks/{taskId}/subtasks")
    public List<SubTaskTT> getSubTasksByTask(@PathVariable long taskId) {
        return subTaskTTService.getSubTasksByTask(taskId);
    }

    @GetMapping(value = "/tasks/{taskId}/progress")
    public ResponseEntity<Map<String, Object>> getTaskProgress(@PathVariable long taskId) {
        try {
            Map<String, Object> progress = subTaskTTService.getTaskProgress(taskId);
            return new ResponseEntity<>(progress, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/subtasks")
    public ResponseEntity<SubTaskTT> addSubTask(@RequestBody SubTaskTT subTask) throws Exception {
        SubTaskTT saved = subTaskTTService.addSubTask(subTask);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("location", "" + saved.getSubId());
        responseHeaders.set("Access-Control-Expose-Headers", "location");
        return ResponseEntity.ok().headers(responseHeaders).build();
    }

    @PostMapping(value = "/tasks/{taskId}/subtasks/quick")
    public ResponseEntity<SubTaskTT> addQuickSubTask(@PathVariable long taskId, @RequestParam String name) {
        try {
            SubTaskTT saved = subTaskTTService.addQuickSubTask(taskId, name);
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.set("location", "" + saved.getSubId());
            responseHeaders.set("Access-Control-Expose-Headers", "location");
            return ResponseEntity.ok().headers(responseHeaders).build();
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/subtasks/{id}")
    public ResponseEntity<SubTaskTT> updateSubTask(@RequestBody SubTaskTT subTask, @PathVariable long id) {
        try {
            SubTaskTT updated = subTaskTTService.updateSubTask(id, subTask);
            if (updated == null) {
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping(value = "/subtasks/{id}")
    public ResponseEntity<Boolean> deleteSubTask(@PathVariable("id") long id) {
        Boolean flag = false;
        try {
            flag = subTaskTTService.deleteSubTask(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(flag, HttpStatus.NOT_FOUND);
        }
    }
}