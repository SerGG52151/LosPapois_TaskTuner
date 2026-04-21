package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.FeatureTT;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeatureTTRepository extends JpaRepository<FeatureTT, Long> {

    List<FeatureTT> findBySprId(long sprId);

    /*
     * Dynamic story-point total: sum of all task story points whose feature_id
     * matches this feature. Returns 0 instead of NULL when no tasks exist.
     */
    @Query("SELECT COALESCE(SUM(t.storyPoints), 0) FROM TaskTT t WHERE t.featureId = :featureId")
    Long sumStoryPointsByFeature(@Param("featureId") long featureId);

    /*
     * All features in active sprints that the given user participates in.
     * Finds the sprints via the user's own tasks, then returns every feature
     * in those same sprints — giving team-wide feature visibility.
     */
    @Query("SELECT DISTINCT f FROM FeatureTT f " +
           "WHERE f.sprId IN (" +
           "  SELECT DISTINCT st.id.sprId FROM SprintTaskTT st " +
           "  JOIN TaskTT t ON t.taskId = st.id.taskId " +
           "  JOIN SprintTT s ON s.sprId = st.id.sprId " +
           "  WHERE t.userId = :userId AND s.stateSprint = 'active'" +
           ")")
    List<FeatureTT> findFeaturesInActiveSprintForUser(@Param("userId") long userId);
}
