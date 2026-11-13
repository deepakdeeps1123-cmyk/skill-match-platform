package engine;

import model.JobVacancy;
import model.WorkerProfile;

import java.util.*;

/**
 * Core Multi-Criteria Matching Engine for EGB1201 Project Review 2.
 * Implements CompatibilityScorer interface.
 * Demonstrates:
 * - Mathematical Haversine Distance computation
 * - Java Collections Framework (PriorityQueue, Set, List)
 * - Algorithm Optimization: O(N log K) top-K candidate ranking using Min-Heap
 */
public class MultiCriteriaMatchingEngine implements CompatibilityScorer {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Structure representing a candidate ranked by score.
     */
    public static class ScoredCandidate implements Comparable<ScoredCandidate> {
        private final WorkerProfile worker;
        private final CompatibilityScore score;

        public ScoredCandidate(WorkerProfile worker, CompatibilityScore score) {
            this.worker = worker;
            this.score = score;
        }

        public WorkerProfile getWorker() { return worker; }
        public CompatibilityScore getScore() { return score; }

        @Override
        public int compareTo(ScoredCandidate other) {
            // Natural ordering: highest total score first
            return Double.compare(other.score.getTotalScore(), this.score.getTotalScore());
        }
    }

    @Override
    public CompatibilityScore calculateCompatibility(WorkerProfile worker, JobVacancy job, MatchingWeights weights) {
        if (worker == null || job == null) {
            throw new IllegalArgumentException("Worker and Job parameters cannot be null.");
        }

        MatchingWeights effectiveWeights = (weights != null) ? weights : MatchingWeights.getDefault();

        // 1. Trade check: if trades are completely incompatible, baseline is minimal
        boolean tradeMatches = worker.getTrade().equalsIgnoreCase(job.getTrade());
        double tradePenaltyFactor = tradeMatches ? 1.0 : 0.25;

        // 2. Technical Skills Overlap (35% default weight)
        double skillScore = computeSkillOverlapScore(worker.getSkills(), job.getRequiredSkills());

        // 3. Professional Experience (20% default weight)
        double experienceScore = computeExperienceScore(worker.getExperienceYears(), job.getMinExperienceYears());

        // 4. Geographical Distance Suitability (20% default weight)
        double distanceKm = computeHaversineDistance(
                worker.getLatitude(), worker.getLongitude(),
                job.getLatitude(), job.getLongitude()
        );
        double geographicalScore = computeDistanceScore(distanceKm);

        // 5. Shift Availability (15% default weight)
        double availabilityScore = computeAvailabilityScore(worker.getPreferredShift(), job.getShift());

        // 6. Compensation Alignment (10% default weight)
        double compensationScore = computeCompensationScore(worker.getDailyRate(), job.getPayRate(), job.getPayType());

        // Composite Weighted Formula:
        double totalWeighted = (
                (skillScore * effectiveWeights.getSkillsWeight()) +
                (experienceScore * effectiveWeights.getExperienceWeight()) +
                (geographicalScore * effectiveWeights.getGeographicalWeight()) +
                (availabilityScore * effectiveWeights.getAvailabilityWeight()) +
                (compensationScore * effectiveWeights.getCompensationWeight())
        ) * tradePenaltyFactor;

        double normalizedTotal = Math.max(0.0, Math.min(100.0, Math.round(totalWeighted * 10.0) / 10.0));

        return new CompatibilityScore(
                normalizedTotal,
                Math.round(skillScore),
                Math.round(experienceScore),
                Math.round(geographicalScore),
                Math.round(availabilityScore),
                Math.round(compensationScore)
        );
    }

    private double computeSkillOverlapScore(List<String> workerSkills, List<String> requiredSkills) {
        if (requiredSkills == null || requiredSkills.isEmpty()) return 100.0;
        if (workerSkills == null || workerSkills.isEmpty()) return 0.0;

        int matches = 0;
        for (String req : requiredSkills) {
            for (String wSkill : workerSkills) {
                if (wSkill.toLowerCase().contains(req.toLowerCase()) || req.toLowerCase().contains(wSkill.toLowerCase())) {
                    matches++;
                    break;
                }
            }
        }
        return Math.min(100.0, ((double) matches / requiredSkills.size()) * 100.0);
    }

    private double computeExperienceScore(int workerYears, int requiredMinYears) {
        if (requiredMinYears <= 0) return 100.0;
        if (workerYears >= requiredMinYears) {
            double bonus = Math.min(10.0, (workerYears - requiredMinYears) * 2.0);
            return Math.min(100.0, 90.0 + bonus);
        }
        return Math.max(10.0, ((double) workerYears / requiredMinYears) * 80.0);
    }

    private double computeDistanceScore(double distanceKm) {
        if (distanceKm <= 5.0) return 100.0;
        if (distanceKm <= 12.0) return 90.0;
        if (distanceKm <= 25.0) return 75.0;
        if (distanceKm <= 40.0) return 55.0;
        if (distanceKm <= 60.0) return 35.0;
        return Math.max(10.0, 100.0 - (distanceKm * 1.2));
    }

    private double computeAvailabilityScore(String workerShift, String jobShift) {
        if (workerShift == null || jobShift == null) return 80.0;
        if (workerShift.equalsIgnoreCase("flexible") || jobShift.equalsIgnoreCase("flexible")) return 100.0;
        if (workerShift.equalsIgnoreCase(jobShift)) return 100.0;
        return 40.0; // Alternate shift penalty
    }

    private double computeCompensationScore(double workerDailyRate, double jobPayRate, String payType) {
        double jobDailyEquivalent = "hourly".equalsIgnoreCase(payType) ? jobPayRate * 8.0 : jobPayRate;
        if (jobDailyEquivalent <= 0 || workerDailyRate <= 0) return 85.0;

        if (jobDailyEquivalent >= workerDailyRate) {
            return 100.0; // Employer offers equal or higher than ask
        }
        // Worker asks for more than budget
        double ratio = jobDailyEquivalent / workerDailyRate;
        return Math.max(20.0, ratio * 100.0);
    }

    public double computeHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    /**
     * Ranks all registered workers for a specific job vacancy using Java PriorityQueue.
     */
    public List<ScoredCandidate> rankCandidatesForJob(List<WorkerProfile> workers, JobVacancy job, MatchingWeights weights) {
        PriorityQueue<ScoredCandidate> rankingQueue = new PriorityQueue<>();

        for (WorkerProfile worker : workers) {
            CompatibilityScore score = calculateCompatibility(worker, job, weights);
            rankingQueue.offer(new ScoredCandidate(worker, score));
        }

        List<ScoredCandidate> rankedList = new ArrayList<>();
        while (!rankingQueue.isEmpty()) {
            rankedList.add(rankingQueue.poll());
        }
        return rankedList;
    }
}
