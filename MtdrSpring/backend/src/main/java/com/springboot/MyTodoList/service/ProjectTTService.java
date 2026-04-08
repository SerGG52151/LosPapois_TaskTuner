package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.ProjectTT;
import com.springboot.MyTodoList.repository.ProjectTTRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/*
 * ============================================================
 *  Service: ProjectTTService
 *  Table:   PROJECT_TT
 * ============================================================
 *
 *  Business logic for project management.
 *  Includes a dedicated "close project" operation that sets the
 *  real end date — mirroring what a manager would do in the UI.
 */
@Service
public class ProjectTTService {

    @Autowired
    private ProjectTTRepository projectTTRepository;

    // ─── Read Operations ─────────────────────────────────────────────────

    /**
     * Returns all projects in the system.
     * SELECT * FROM project_tt
     */
    public List<ProjectTT> findAll() {
        return projectTTRepository.findAll();
    }

    /**
     * Returns a single project by its primary key.
     *
     * @param id  the pj_id to look up
     * @return 200 OK with project, or 404 NOT FOUND
     */
    public ResponseEntity<ProjectTT> getProjectById(long id) {
        Optional<ProjectTT> found = projectTTRepository.findById(id);
        if (found.isPresent()) {
            return new ResponseEntity<>(found.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Returns all open projects (no real end date set yet).
     * These are the projects actively being worked on.
     */
    public List<ProjectTT> getOpenProjects() {
        return projectTTRepository.findByDateEndRealPjIsNull();
    }

    /**
     * Search projects by name keyword (case-insensitive).
     *
     * @param keyword  partial project name to search for
     */
    public List<ProjectTT> searchByName(String keyword) {
        return projectTTRepository.findByNamePjContainingIgnoreCase(keyword);
    }

    // ─── Write Operations ─────────────────────────────────────────────────

    /**
     * Creates a new project.
     *
     * @param newProject  the ProjectTT to insert (pjId should be 0 for new records)
     * @return the saved entity with the DB-assigned pjId populated
     */
    public ProjectTT addProject(ProjectTT newProject) {
        return projectTTRepository.save(newProject);
    }

    /**
     * Updates an existing project's mutable fields.
     *
     * @param id             the pj_id of the project to update
     * @param updatedProject object carrying the new field values
     * @return the saved ProjectTT, or null if not found
     */
    public ProjectTT updateProject(long id, ProjectTT updatedProject) {
        Optional<ProjectTT> existing = projectTTRepository.findById(id);
        if (existing.isPresent()) {
            ProjectTT project = existing.get();
            project.setNamePj(updatedProject.getNamePj());
            project.setDateStartPj(updatedProject.getDateStartPj());
            project.setDateEndSetPj(updatedProject.getDateEndSetPj());
            project.setDateEndRealPj(updatedProject.getDateEndRealPj());
            return projectTTRepository.save(project);
        } else {
            return null;
        }
    }

    /**
     * Closes a project by recording today as the real end date.
     *
     * This is a dedicated operation so controllers don't need to
     * fetch the full project just to set one field.
     *
     * @param id  the pj_id of the project to close
     * @return the updated project, or null if not found
     */
    public ProjectTT closeProject(long id) {
        Optional<ProjectTT> existing = projectTTRepository.findById(id);
        if (existing.isPresent()) {
            ProjectTT project = existing.get();
            // Record today's date as the actual project close date
            project.setDateEndRealPj(LocalDate.now());
            return projectTTRepository.save(project);
        } else {
            return null;
        }
    }

    /**
     * Deletes a project by its primary key.
     * Oracle's ON DELETE CASCADE removes linked sprints, tasks, and documents.
     *
     * @param id  the pj_id to delete
     * @return true if deleted, false if an exception occurred
     */
    public boolean deleteProject(long id) {
        try {
            projectTTRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
