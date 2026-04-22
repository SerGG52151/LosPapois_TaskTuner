package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.UserTT;
import com.springboot.MyTodoList.service.UserTTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UserTTController {

    @Autowired
    private UserTTService userTTService;

    @GetMapping(value = "/users-tt/{id}")
    public ResponseEntity<?> getUserById(@PathVariable long id) {
        try {
            ResponseEntity<UserTT> user = userTTService.getUserById(id);
            return user;
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping(value = "/users-tt")
    public ResponseEntity<?> getAllUsers() {
        List<UserTT> users = userTTService.findAll();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping(value = "/users-tt/telegram/{idTelegram}")
    public ResponseEntity<?> getUserByTelegram(@PathVariable String idTelegram) {
        Optional<UserTT> user = userTTService.getUserByTelegram(idTelegram);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping(value = "/users-tt/role/{role}")
    public ResponseEntity<?> getUsersByRole(@PathVariable String role) {
        List<UserTT> users = userTTService.getUsersByRole(role);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @PutMapping(value = "/users-tt/{id}")
    public ResponseEntity<?> updateUser(@RequestBody UserTT user, @PathVariable long id) {
        try {
            UserTT updated = userTTService.updateUser(id, user);
            if (updated == null) {
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping(value = "/users-tt/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable long id) {
        try {
            Boolean flag = userTTService.deleteUser(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping(value = "/users-tt")
    public ResponseEntity<?> addUser(@RequestBody UserTT user) {
        UserTT saved = userTTService.addUser(user);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }
}
