package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.FeatureTT;
import com.springboot.MyTodoList.service.FeatureTTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class FeatureTTController {

    @Autowired
    private FeatureTTService featureTTService;

    @GetMapping("/features")
    public List<FeatureTT> getAllFeatures() {
        return featureTTService.findAll();
    }

    @GetMapping("/features/{id}")
    public ResponseEntity<FeatureTT> getFeatureById(@PathVariable long id) {
        return featureTTService.getFeatureById(id);
    }

    @GetMapping("/features/sprint/{sprId}")
    public List<FeatureTT> getFeaturesBySprint(@PathVariable long sprId) {
        return featureTTService.getFeaturesBySprint(sprId);
    }

    @GetMapping("/features/{id}/story-points")
    public ResponseEntity<Long> getStoryPoints(@PathVariable long id) {
        return ResponseEntity.ok(featureTTService.getStoryPoints(id));
    }

    @PostMapping("/features")
    public ResponseEntity<FeatureTT> addFeature(@RequestBody FeatureTT feature) {
        FeatureTT saved = featureTTService.addFeature(feature);
        HttpHeaders headers = new HttpHeaders();
        headers.set("location", "" + saved.getFeatureId());
        headers.set("Access-Control-Expose-Headers", "location");
        return ResponseEntity.ok().headers(headers).build();
    }

    @PutMapping("/features/{id}")
    public ResponseEntity<FeatureTT> updateFeature(@RequestBody FeatureTT feature, @PathVariable long id) {
        try {
            FeatureTT updated = featureTTService.updateFeature(id, feature);
            if (updated == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/features/{id}")
    public ResponseEntity<Boolean> deleteFeature(@PathVariable long id) {
        boolean deleted = featureTTService.deleteFeature(id);
        return new ResponseEntity<>(deleted, deleted ? HttpStatus.OK : HttpStatus.NOT_FOUND);
    }
}
