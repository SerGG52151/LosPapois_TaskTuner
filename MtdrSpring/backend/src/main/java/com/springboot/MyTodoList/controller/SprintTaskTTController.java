package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.SprintTaskTT;
import com.springboot.MyTodoList.service.SprintTaskTTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class SprintTaskTTController {

    @Autowired
    private SprintTaskTTService sprintTaskTTService;

    @GetMapping(value = "/sprint-tasks")
    public List<SprintTaskTT> getAllSprintTasks() {
        return sprintTaskTTService.findAll();
    }

    @GetMapping(value = "/sprint-tasks/sprint/{sprId}")
    public List<SprintTaskTT> getTasksInSprint(@PathVariable long sprId) {
        return sprintTaskTTService.getTasksInSprint(sprId);
    }

    @GetMapping(value = "/sprint-tasks/task/{taskId}")
    public List<SprintTaskTT> getSprintsForTask(@PathVariable long taskId) {
        return sprintTaskTTService.getSprintsForTask(taskId);
    }

    @GetMapping(value = "/sprint-tasks/sprint/{sprId}/state/{stateTask}")
    public List<SprintTaskTT> getTasksByState(@PathVariable long sprId, @PathVariable String stateTask) {
        return sprintTaskTTService.getTasksByState(sprId, stateTask);
    }

    @GetMapping(value = "/sprint-tasks/sprint/{sprId}/count")
    public ResponseEntity<Long> countTasksInSprint(@PathVariable long sprId) {
        return new ResponseEntity<>(sprintTaskTTService.countTasksInSprint(sprId), HttpStatus.OK);
    }

    @GetMapping(value = "/sprint-tasks/sprint/{sprId}/count/{stateTask}")
    public ResponseEntity<Long> countByState(@PathVariable long sprId, @PathVariable String stateTask) {
        return new ResponseEntity<>(sprintTaskTTService.countByState(sprId, stateTask), HttpStatus.OK);
    }

    @GetMapping(value = "/sprint-tasks/{sprId}/{taskId}")
    public ResponseEntity<SprintTaskTT> getEntry(@PathVariable long sprId, @PathVariable long taskId) {
        Optional<SprintTaskTT> entry = sprintTaskTTService.getEntry(sprId, taskId);
        return entry.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping(value = "/sprint-tasks")
    public ResponseEntity<SprintTaskTT> addTaskToSprint(@RequestParam long sprId, @RequestParam long taskId) {
        SprintTaskTT entry = sprintTaskTTService.addTaskToSprint(sprId, taskId);
        return new ResponseEntity<>(entry, HttpStatus.OK);
    }

    @PatchMapping(value = "/sprint-tasks/{sprId}/{taskId}/state/{newState}")
    public ResponseEntity<SprintTaskTT> updateTaskState(@PathVariable long sprId,
                                                        @PathVariable long taskId,
                                                        @PathVariable String newState) {
        try {
            SprintTaskTT updated = sprintTaskTTService.updateTaskState(sprId, taskId, newState);
            if (updated == null) {
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping(value = "/sprint-tasks/{sprId}/{taskId}")
    public ResponseEntity<Boolean> removeTaskFromSprint(@PathVariable long sprId, @PathVariable long taskId) {
        Boolean flag = false;
        try {
            flag = sprintTaskTTService.removeTaskFromSprint(sprId, taskId);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(flag, HttpStatus.NOT_FOUND);
        }
    }
}
