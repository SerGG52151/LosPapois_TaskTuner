package com.springboot.MyTodoList.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.dto.LoginRequest;
import com.springboot.MyTodoList.dto.RegisterRequest;
import com.springboot.MyTodoList.model.UserTT;
import com.springboot.MyTodoList.repository.UserTTRepository;

@Service
public class UserTTService {

    /*
     * Spring injects the UserTTRepository implementation at startup.
     * We never instantiate this manually — Spring's IoC container manages it.
     */
    @Autowired
    private UserTTRepository userTTRepository;

    /*
     * BCryptPasswordEncoder for hashing passwords securely.
     * BCrypt includes salt generation and multiple iterations to prevent rainbow table attacks.
     */
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public List<UserTT> findAll() {
        return userTTRepository.findAll();
    }

    public ResponseEntity<UserTT> getUserById(long id) {
        Optional<UserTT> found = userTTRepository.findById(id);
        if (found.isPresent()) {
            return new ResponseEntity<>(found.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public Optional<UserTT> getUserByTelegram(String idTelegram) {
        return userTTRepository.findByIdTelegram(idTelegram);
    }

    /**
     * Returns all users with a specific role.
     *
     * @param role  'manager' or 'developer'
     * @return list of matching users
     */
    public List<UserTT> getUsersByRole(String role) {
        return userTTRepository.findByRole(role);
    }

    public Optional<UserTT> getUserByEmail(String email){
        return userTTRepository.findByMail(email);
    }

    public Optional<UserTT> login(LoginRequest req) {
        return userTTRepository.findByMail(req.getMail())
                .filter(u -> u.getPassword() != null && passwordEncoder.matches(req.getPassword(), u.getPassword()));
    }


    public UserTT register(RegisterRequest req) {
        if (userTTRepository.findByMail(req.getMail()).isPresent()) {
            throw new IllegalArgumentException("El correo ya está registrado.");
        }
        if (userTTRepository.findByIdTelegram(req.getIdTelegram()).isPresent()) {
            throw new IllegalArgumentException("El ID de Telegram ya está registrado.");
        }

        UserTT user = new UserTT();
        user.setNameUser(req.getUsername().trim());
        user.setMail(req.getMail());
        // Hash the password using BCrypt before storing
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setIdTelegram(req.getIdTelegram());
        user.setRole("developer");
        return userTTRepository.save(user);
    }

    public UserTT addUser(UserTT newUser) {
        return userTTRepository.save(newUser);
    }

    public UserTT updateUser(long id, UserTT updatedUser) {
        Optional<UserTT> existing = userTTRepository.findById(id);
        if (existing.isPresent()) {
            UserTT user = existing.get();
            // Only update fields the client is allowed to change:
            user.setNameUser(updatedUser.getNameUser());
            // Hash the password if it's being updated
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
            user.setIdTelegram(updatedUser.getIdTelegram());
            user.setMail(updatedUser.getMail());
            user.setRole(updatedUser.getRole());
            return userTTRepository.save(user);
        } else {
            return null;
        }
    }

    public boolean deleteUser(long id) {
        try {
            userTTRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    
}
