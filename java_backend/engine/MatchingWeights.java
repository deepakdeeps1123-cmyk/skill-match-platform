package engine;

/**
 * Encapsulates the multi-criteria compatibility weights.
 * Total normalized sum = 1.0 (100%)
 */
public class MatchingWeights {
    private double skillsWeight;        // Default 0.35 (35%)
    private double experienceWeight;    // Default 0.20 (20%)
    private double geographicalWeight;  // Default 0.20 (20%)
    private double availabilityWeight;  // Default 0.15 (15%)
    private double compensationWeight;  // Default 0.10 (10%)

    public MatchingWeights(double skillsWeight, double experienceWeight,
                           double geographicalWeight, double availabilityWeight,
                           double compensationWeight) {
        this.skillsWeight = skillsWeight;
        this.experienceWeight = experienceWeight;
        this.geographicalWeight = geographicalWeight;
        this.availabilityWeight = availabilityWeight;
        this.compensationWeight = compensationWeight;
    }

    public static MatchingWeights getDefault() {
        return new MatchingWeights(0.35, 0.20, 0.20, 0.15, 0.10);
    }

    public double getSkillsWeight() { return skillsWeight; }
    public double getExperienceWeight() { return experienceWeight; }
    public double getGeographicalWeight() { return geographicalWeight; }
    public double getAvailabilityWeight() { return availabilityWeight; }
    public double getCompensationWeight() { return compensationWeight; }
}
