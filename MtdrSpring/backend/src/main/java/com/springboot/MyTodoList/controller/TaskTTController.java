package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.TaskTT;
import com.springboot.MyTodoList.service.TaskTTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TaskTTController {
    @Autowired
    private TaskTTService taskTTService;

    @GetMapping(value = "/tasks")
    public List<TaskTT> getAllTasks(){
        return taskTTService.findAll();
    }

    @GetMapping(value = "/projects/{pjId}/tasks")
    public List<TaskTT> getTasksByProject(@PathVariable long pjId) {
        return taskTTService.getTasksByProject(pjId);
    }

    @GetMapping(value = "/tasks/{id}")
    public ResponseEntity<TaskTT> getTaskById(@PathVariable long id){
        try{
            return taskTTService.getTaskById(id);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping(value = "/tasks")
    public ResponseEntity<TaskTT> addTask(@RequestBody TaskTT task) throws Exception{
        TaskTT saved = taskTTService.addTask(task);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("location",""+saved.getTaskId());
        responseHeaders.set("Access-Control-Expose-Headers","location");
        return ResponseEntity.ok().headers(responseHeaders).build();
    }

    @PutMapping(value = "/tasks/{id}")
    public ResponseEntity<TaskTT> updateTask(@RequestBody TaskTT task, @PathVariable long id){
        try{
            TaskTT updated = taskTTService.updateTask(id, task);
            if (updated == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            return new ResponseEntity<>(updated, HttpStatus.OK);
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping(value = "/tasks/{id}")
    public ResponseEntity<Boolean> deleteTask(@PathVariable("id") long id){
        Boolean flag = false;
        try{
            flag = taskTTService.deleteTask(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(flag,HttpStatus.NOT_FOUND);
        }
    }
}
