package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.ProjectTT;
import com.springboot.MyTodoList.service.ProjectTTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ProjectTTController {

    @Autowired
    private ProjectTTService projectTTService;

    @GetMapping(value = "/projects")
    public List<ProjectTT> getAllProjects() {
        return projectTTService.findAll();
    }

    @GetMapping(value = "/projects/open")
    public List<ProjectTT> getOpenProjects() {
        return projectTTService.getOpenProjects();
    }

    @GetMapping(value = "/projects/search")
    public List<ProjectTT> searchProjects(@RequestParam String keyword) {
        return projectTTService.searchByName(keyword);
    }

    @GetMapping(value = "/projects/{id}")
    public ResponseEntity<ProjectTT> getProjectById(@PathVariable long id) {
        try {
            return projectTTService.getProjectById(id);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping(value = "/projects")
    public ResponseEntity<ProjectTT> addProject(@RequestBody ProjectTT project) {
        ProjectTT saved = projectTTService.addProject(project);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @PutMapping(value = "/projects/{id}")
    public ResponseEntity<ProjectTT> updateProject(@RequestBody ProjectTT project, @PathVariable long id) {
        try {
            ProjectTT updated = projectTTService.updateProject(id, project);
            if (updated == null) {
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping(value = "/projects/{id}/close")
    public ResponseEntity<ProjectTT> closeProject(@PathVariable long id) {
        try {
            ProjectTT updated = projectTTService.closeProject(id);
            if (updated == null) {
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping(value = "/projects/{id}")
    public ResponseEntity<Boolean> deleteProject(@PathVariable long id) {
        Boolean flag = false;
        try {
            flag = projectTTService.deleteProject(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(flag, HttpStatus.NOT_FOUND);
        }
    }
}
