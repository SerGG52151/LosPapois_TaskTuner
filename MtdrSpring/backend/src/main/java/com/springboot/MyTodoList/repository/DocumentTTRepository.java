package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.DocumentTT;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.List;

/*
 * ============================================================
 *  Repository: DocumentTTRepository
 *  Entity:     DocumentTT  →  DOCUMENT_TT table
 * ============================================================
 *
 *  Provides CRUD for DocumentTT entities.
 *  Key use case: the AI embedding pipeline queries this repository
 *  to find documents pending processing ('loading') and to determine
 *  which documents are ready for vector search ('loaded').
 */
@Repository
@Transactional
@EnableTransactionManagement
public interface DocumentTTRepository extends JpaRepository<DocumentTT, Long> {

    /*
     * All documents belonging to a given project.
     *
     * Generated SQL:
     *   SELECT * FROM document_tt WHERE pj_id = ?
     *
     * Use case: document management tab in the project view.
     */
    List<DocumentTT> findByPjId(long pjId);

    /*
     * All documents currently in a specific embedding state.
     *
     * Generated SQL:
     *   SELECT * FROM document_tt WHERE embed_status = ?
     *
     * Use cases:
     *   findByEmbedStatus("loading") → documents awaiting embedding
     *   findByEmbedStatus("loaded")  → searchable documents
     *
     * The embedding background job calls findByEmbedStatus("loading")
     * to pick up documents that need to be processed.
     */
    List<DocumentTT> findByEmbedStatus(String embedStatus);

    /*
     * All documents for a project that have finished embedding.
     *
     * Generated SQL:
     *   SELECT * FROM document_tt WHERE pj_id = ? AND embed_status = ?
     *
     * Use case: the AI query service fetches findByPjIdAndEmbedStatus(pjId, "loaded")
     * to know which documents can be included in the RAG context window.
     */
    List<DocumentTT> findByPjIdAndEmbedStatus(long pjId, String embedStatus);
}
