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
public class UserTTController {

    @Autowired
    private UserTTService userTTService;

    @GetMapping(value = "/users-tt")
    public List<UserTT> getAllUsers() {
        return userTTService.findAll();
    }

    @GetMapping(value = "/users-tt/telegram/{idTelegram}")
    public ResponseEntity<UserTT> getUserByTelegram(@PathVariable String idTelegram) {
        Optional<UserTT> user = userTTService.getUserByTelegram(idTelegram);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping(value = "/users-tt/role/{role}")
    public List<UserTT> getUsersByRole(@PathVariable String role) {
        return userTTService.getUsersByRole(role);
    }

    @GetMapping(value = "/users-tt/{id}")
    public ResponseEntity<UserTT> getUserById(@PathVariable long id) {
        try {
            return userTTService.getUserById(id);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping(value = "/users-tt")
    public ResponseEntity<UserTT> addUser(@RequestBody UserTT user) {
        UserTT saved = userTTService.addUser(user);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @PutMapping(value = "/users-tt/{id}")
    public ResponseEntity<UserTT> updateUser(@RequestBody UserTT user, @PathVariable long id) {
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
    public ResponseEntity<Boolean> deleteUser(@PathVariable long id) {
        Boolean flag = false;
        try {
            flag = userTTService.deleteUser(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(flag, HttpStatus.NOT_FOUND);
        }
    }
}
