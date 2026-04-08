package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.UserTT;
import com.springboot.MyTodoList.repository.UserTTRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/*
 * ============================================================
 *  Service: UserTTService
 *  Table:   USER_TT
 * ============================================================
 *
 *  Business logic layer for UserTT entities.
 *  Controllers call this service — they never touch the repository directly.
 *  This separation keeps controllers thin (routing only) and
 *  concentrates all data-access decisions here.
 *
 *  @Service marks this as a Spring-managed bean in the service layer.
 *  @Autowired injects the repository without needing to call "new".
 */
@Service
public class UserTTService {

    /*
     * Spring injects the UserTTRepository implementation at startup.
     * We never instantiate this manually — Spring's IoC container manages it.
     */
    @Autowired
    private UserTTRepository userTTRepository;

    // ─── Read Operations ─────────────────────────────────────────────────

    /**
     * Returns every user in the system.
     *
     * Internally calls JpaRepository.findAll() which executes:
     *   SELECT * FROM user_tt
     *
     * @return list of all UserTT entities (empty list if table is empty)
     */
    public List<UserTT> findAll() {
        return userTTRepository.findAll();
    }

    /**
     * Returns a single user by their primary key.
     *
     * Wraps the result in ResponseEntity so the caller (controller)
     * can directly return it as an HTTP response with the correct status code.
     *
     * @param id  the user_id to look up
     * @return 200 OK with the user body, or 404 NOT FOUND if no user exists with that ID
     */
    public ResponseEntity<UserTT> getUserById(long id) {
        Optional<UserTT> found = userTTRepository.findById(id);
        if (found.isPresent()) {
            return new ResponseEntity<>(found.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Finds a user by their Telegram handle.
     * Used by the bot to identify who sent a message.
     *
     * @param idTelegram  the Telegram username, e.g., "@alice_tg"
     * @return Optional — empty if no user is registered with that handle
     */
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

    // ─── Write Operations ─────────────────────────────────────────────────

    /**
     * Persists a new user to the database.
     *
     * JpaRepository.save() issues an INSERT when the entity has no ID,
     * or an UPDATE when it already has one. For new users the ID is 0 (default)
     * so Oracle's IDENTITY column assigns the real ID on INSERT.
     *
     * @param newUser  the UserTT to insert (userId should be 0 for new records)
     * @return the saved entity with the DB-assigned userId populated
     */
    public UserTT addUser(UserTT newUser) {
        return userTTRepository.save(newUser);
    }

    /**
     * Updates an existing user's mutable fields.
     *
     * Follows the "fetch → mutate → save" pattern:
     *   1. Load the current DB state by ID.
     *   2. Apply new values from the incoming object.
     *   3. Save — Hibernate detects the dirty fields and issues UPDATE.
     *
     * Returns null if no user with that ID exists (controller should return 404).
     *
     * @param id           the user_id of the user to update
     * @param updatedUser  object carrying the new field values
     * @return the saved UserTT entity, or null if not found
     */
    public UserTT updateUser(long id, UserTT updatedUser) {
        Optional<UserTT> existing = userTTRepository.findById(id);
        if (existing.isPresent()) {
            UserTT user = existing.get();
            // Only update fields the client is allowed to change:
            user.setNameUser(updatedUser.getNameUser());
            user.setPassword(updatedUser.getPassword());
            user.setIdTelegram(updatedUser.getIdTelegram());
            user.setMail(updatedUser.getMail());
            user.setRole(updatedUser.getRole());
            return userTTRepository.save(user);
        } else {
            return null;
        }
    }

    /**
     * Deletes a user by their primary key.
     *
     * Due to ON DELETE CASCADE on project_user_tt and task_tt,
     * deleting a user also removes their project memberships
     * and reassigns their tasks — this is handled at the DB level.
     *
     * @param id  the user_id to delete
     * @return true if deleted successfully, false if an exception occurred
     */
    public boolean deleteUser(long id) {
        try {
            userTTRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
