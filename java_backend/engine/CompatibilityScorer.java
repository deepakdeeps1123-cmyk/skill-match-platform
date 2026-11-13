package engine;

import model.JobVacancy;
import model.WorkerProfile;

/**
 * Interface defining the contract for calculating job-worker compatibility.
 * Demonstrates:
 * - Interface-based Abstraction
 * - Strategy Design Pattern (allows substituting different algorithms without modifying callers)
 */
public interface CompatibilityScorer {
    CompatibilityScore calculateCompatibility(WorkerProfile worker, JobVacancy job, MatchingWeights weights);
}
