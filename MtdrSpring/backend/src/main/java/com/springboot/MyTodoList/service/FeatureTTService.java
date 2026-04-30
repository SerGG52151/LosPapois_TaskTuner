package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.FeatureTT;
import com.springboot.MyTodoList.repository.FeatureTTRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FeatureTTService {

    @Autowired
    private FeatureTTRepository featureTTRepository;

    public List<FeatureTT> findAll() {
        return featureTTRepository.findAll();
    }

    public ResponseEntity<FeatureTT> getFeatureById(long id) {
        Optional<FeatureTT> found = featureTTRepository.findById(id);
        return found.map(f -> new ResponseEntity<>(f, HttpStatus.OK))
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public List<FeatureTT> getFeaturesBySprint(long sprId) {
        return featureTTRepository.findBySprId(sprId);
    }

    public List<FeatureTT> getFeaturesInActiveSprintForUser(long userId) {
        return featureTTRepository.findFeaturesInActiveSprintForUser(userId);
    }

    public Long getStoryPoints(long featureId) {
        return featureTTRepository.sumStoryPointsByFeature(featureId);
    }

    public FeatureTT addFeature(FeatureTT feature) {
        if (feature.getSprId() == 0) {
            throw new IllegalArgumentException("Feature must belong to a sprint (sprId is required).");
        }
        return featureTTRepository.save(feature);
    }

    public FeatureTT updateFeature(long id, FeatureTT updated) {
        Optional<FeatureTT> existing = featureTTRepository.findById(id);
        if (existing.isPresent()) {
            FeatureTT f = existing.get();
            f.setNameFeature(updated.getNameFeature());
            f.setPriorityFeature(updated.getPriorityFeature());
            f.setSprId(updated.getSprId());
            return featureTTRepository.save(f);
        }
        return null;
    }

    public boolean deleteFeature(long id) {
        try {
            featureTTRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
