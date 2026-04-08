package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.DocumentTT;
import com.springboot.MyTodoList.repository.DocumentTTRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/*
 * ============================================================
 *  Service: DocumentTTService
 *  Table:   DOCUMENT_TT
 * ============================================================
 *
 *  Manages project documents and their embedding pipeline lifecycle.
 *
 *  The key business flow:
 *    1. User uploads a file → controller calls uploadDocument()
 *       which saves a row with embed_status = 'loading'.
 *    2. Background embedding job calls getDocumentsPendingEmbedding()
 *       to pick up 'loading' documents.
 *    3. After embedding completes, the job calls markAsLoaded()
 *       to flip embed_status to 'loaded'.
 *    4. AI query layer calls getLoadedDocumentsForProject(pjId)
 *       to find documents available for RAG (Retrieval-Augmented Generation).
 */
@Service
public class DocumentTTService {

    @Autowired
    private DocumentTTRepository documentTTRepository;

    // ─── Read Operations ─────────────────────────────────────────────────

    /**
     * Returns all documents across all projects.
     */
    public List<DocumentTT> findAll() {
        return documentTTRepository.findAll();
    }

    /**
     * Returns a single document by its primary key.
     *
     * @param id  the doc_id to look up
     * @return 200 OK with document, or 404 NOT FOUND
     */
    public ResponseEntity<DocumentTT> getDocumentById(long id) {
        Optional<DocumentTT> found = documentTTRepository.findById(id);
        if (found.isPresent()) {
            return new ResponseEntity<>(found.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Returns all documents belonging to a project.
     * Includes both 'loading' and 'loaded' documents.
     *
     * @param pjId  the project whose documents to retrieve
     */
    public List<DocumentTT> getDocumentsForProject(long pjId) {
        return documentTTRepository.findByPjId(pjId);
    }

    /**
     * Returns all documents awaiting embedding processing.
     *
     * Called by the background embedding job to find work:
     *   SELECT * FROM document_tt WHERE embed_status = 'loading'
     */
    public List<DocumentTT> getDocumentsPendingEmbedding() {
        return documentTTRepository.findByEmbedStatus("loading");
    }

    /**
     * Returns all fully embedded documents for a project.
     * These are the documents the AI query layer can search through.
     *
     * @param pjId  the project to query
     * @return documents with embed_status = 'loaded' for that project
     */
    public List<DocumentTT> getLoadedDocumentsForProject(long pjId) {
        return documentTTRepository.findByPjIdAndEmbedStatus(pjId, "loaded");
    }

    // ─── Write Operations ─────────────────────────────────────────────────

    /**
     * Records a new document upload.
     *
     * Automatically sets:
     *   - dateUpload = now (timestamp of upload)
     *   - embedStatus = 'loading' (enters the embedding pipeline)
     *
     * The caller only needs to provide: namePjDoc, urlObjStore, pjId.
     *
     * @param newDoc  the DocumentTT to save
     * @return the saved entity with DB-assigned docId and current timestamp
     */
    public DocumentTT uploadDocument(DocumentTT newDoc) {
        // Stamp the upload time and set initial embedding status
        newDoc.setDateUpload(LocalDateTime.now());
        newDoc.setEmbedStatus("loading");
        return documentTTRepository.save(newDoc);
    }

    /**
     * Marks a document as fully embedded ('loaded').
     *
     * Called by the embedding pipeline service after successfully
     * generating and storing the vector embeddings for a document.
     *
     * @param id  the doc_id to mark as loaded
     * @return the updated DocumentTT, or null if not found
     */
    public DocumentTT markAsLoaded(long id) {
        Optional<DocumentTT> existing = documentTTRepository.findById(id);
        if (existing.isPresent()) {
            DocumentTT doc = existing.get();
            doc.setEmbedStatus("loaded");
            return documentTTRepository.save(doc);
        } else {
            return null;
        }
    }

    /**
     * Updates the metadata of an existing document.
     * Does NOT change embed_status — use markAsLoaded() for that.
     *
     * @param id         the doc_id to update
     * @param updatedDoc object carrying the new field values
     * @return the saved DocumentTT, or null if not found
     */
    public DocumentTT updateDocument(long id, DocumentTT updatedDoc) {
        Optional<DocumentTT> existing = documentTTRepository.findById(id);
        if (existing.isPresent()) {
            DocumentTT doc = existing.get();
            doc.setNamePjDoc(updatedDoc.getNamePjDoc());
            doc.setUrlObjStore(updatedDoc.getUrlObjStore());
            return documentTTRepository.save(doc);
        } else {
            return null;
        }
    }

    /**
     * Deletes a document by its primary key.
     * The physical file in OCI Object Storage must be deleted separately
     * via the OCI SDK — this only removes the DB row.
     *
     * @param id  the doc_id to delete
     * @return true if deleted, false on exception
     */
    public boolean deleteDocument(long id) {
        try {
            documentTTRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
