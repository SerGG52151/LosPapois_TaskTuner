package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.DocumentTT;
import com.springboot.MyTodoList.service.DocumentTTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class DocumentTTController {

    @Autowired
    private DocumentTTService documentTTService;

    @GetMapping(value = "/documents")
    public List<DocumentTT> getAllDocuments() {
        return documentTTService.findAll();
    }

    @GetMapping(value = "/documents/pending-embedding")
    public List<DocumentTT> getDocumentsPendingEmbedding() {
        return documentTTService.getDocumentsPendingEmbedding();
    }

    @GetMapping(value = "/documents/project/{pjId}")
    public List<DocumentTT> getDocumentsForProject(@PathVariable long pjId) {
        return documentTTService.getDocumentsForProject(pjId);
    }

    @GetMapping(value = "/documents/project/{pjId}/loaded")
    public List<DocumentTT> getLoadedDocumentsForProject(@PathVariable long pjId) {
        return documentTTService.getLoadedDocumentsForProject(pjId);
    }

    @GetMapping(value = "/documents/{id}")
    public ResponseEntity<DocumentTT> getDocumentById(@PathVariable long id) {
        try {
            return documentTTService.getDocumentById(id);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping(value = "/documents")
    public ResponseEntity<DocumentTT> uploadDocument(@RequestBody DocumentTT document) {
        DocumentTT saved = documentTTService.uploadDocument(document);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @PutMapping(value = "/documents/{id}")
    public ResponseEntity<DocumentTT> updateDocument(@RequestBody DocumentTT document, @PathVariable long id) {
        try {
            DocumentTT updated = documentTTService.updateDocument(id, document);
            if (updated == null) {
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping(value = "/documents/{id}/loaded")
    public ResponseEntity<DocumentTT> markDocumentAsLoaded(@PathVariable long id) {
        try {
            DocumentTT updated = documentTTService.markAsLoaded(id);
            if (updated == null) {
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping(value = "/documents/{id}")
    public ResponseEntity<Boolean> deleteDocument(@PathVariable long id) {
        Boolean flag = false;
        try {
            flag = documentTTService.deleteDocument(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(flag, HttpStatus.NOT_FOUND);
        }
    }
}
