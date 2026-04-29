package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.UserTT;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.List;
import java.util.Optional;

/*
 * ============================================================
 *  Repository: UserTTRepository
 *  Entity:     UserTT  →  USER_TT table
 * ============================================================
 *
 *  Extends JpaRepository<UserTT, Long> which auto-provides:
 *    findAll()       → SELECT * FROM user_tt
 *    findById(id)    → SELECT * FROM user_tt WHERE user_id = ?
 *    save(entity)    → INSERT or UPDATE (upsert by ID)
 *    deleteById(id)  → DELETE FROM user_tt WHERE user_id = ?
 *    count()         → SELECT COUNT(*) FROM user_tt
 *    existsById(id)  → SELECT COUNT(*) > 0 WHERE user_id = ?
 *
 *  The custom methods below are generated automatically by Spring
 *  Data using "Derived Query" (method name parsing). No SQL needed.
 *
 *  @Transactional  — wraps each repository call in a transaction.
 *  @EnableTransactionManagement — activates Spring's TX proxy on this bean.
 */
@Repository
@Transactional
@EnableTransactionManagement
public interface UserTTRepository extends JpaRepository<UserTT, Long> {

    /*
     * Find a user by their Telegram handle (e.g., "@alice_tg").
     *
     * Generated SQL:
     *   SELECT * FROM user_tt WHERE id_telegram = ?
     *
     * Primary use case: the Telegram bot identifies which UserTT
     * sent a message so it can look up their role and projects.
     */
    Optional<UserTT> findByIdTelegram(String idTelegram);

    /*
     * Find all users with a given role.
     *
     * Generated SQL:
     *   SELECT * FROM user_tt WHERE role = ?
     *
     * Use cases:
     *   - findByRole("manager")   → list all project managers
     *   - findByRole("developer") → list all developers
     */
    List<UserTT> findByRole(String role);

    /*
     * Find a user by their email address.
     *
     * Generated SQL:
     *   SELECT * FROM user_tt WHERE mail = ?
     *
     * Use case: account lookup for login or password reset flows.
     */
    Optional<UserTT> findByMail(String mail);

    boolean existsByMailIgnoreCase(String mail);

    boolean existsByIdTelegramIgnoreCase(String idTelegram);
}
