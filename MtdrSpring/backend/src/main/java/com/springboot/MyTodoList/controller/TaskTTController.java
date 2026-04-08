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
public class TaskTTController {
    @Autowired
    private TaskTTService taskTTService;

    @GetMapping(value = "/tasks")
    public List<TaskTT> getAllTasks(){
        return taskTTService.findAll();
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
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(updated, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
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
