package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.ProjectTT;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.List;

/*
 * ============================================================
 *  Repository: ProjectTTRepository
 *  Entity:     ProjectTT  →  PROJECT_TT table
 * ============================================================
 *
 *  Provides full CRUD for ProjectTT entities via JpaRepository
 *  plus custom derived query methods below.
 */
@Repository
@Transactional
@EnableTransactionManagement
public interface ProjectTTRepository extends JpaRepository<ProjectTT, Long> {

    /*
     * Find all projects that are still open (no real end date yet).
     *
     * Generated SQL:
     *   SELECT * FROM project_tt WHERE date_end_real_pj IS NULL
     *
     * Use case: dashboard view that lists only active/open projects.
     * "IsNull" is a Spring Data keyword that maps to IS NULL.
     */
    List<ProjectTT> findByDateEndRealPjIsNull();

    /*
     * Find projects whose name contains a keyword (case-insensitive search).
     *
     * Generated SQL (approximately):
     *   SELECT * FROM project_tt WHERE UPPER(name_pj) LIKE UPPER('%keyword%')
     *
     * Use case: project search bar in the frontend UI.
     * "ContainingIgnoreCase" is a Spring Data keyword combination.
     */
    List<ProjectTT> findByNamePjContainingIgnoreCase(String keyword);
}
