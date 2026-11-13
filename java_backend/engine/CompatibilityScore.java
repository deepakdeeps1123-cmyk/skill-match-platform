package engine;

/**
 * Encapsulates the multi-criteria compatibility outcome between a Worker and a Job Vacancy.
 */
public class CompatibilityScore implements Comparable<CompatibilityScore> {
    private double totalScore;
    private double skillScore;
    private double experienceScore;
    private double geographicalScore;
    private double availabilityScore;
    private double compensationScore;
    private String tier; // "High Match", "Moderate Match", "Low Match"

    public CompatibilityScore(double totalScore, double skillScore, double experienceScore,
                              double geographicalScore, double availabilityScore, double compensationScore) {
        this.totalScore = totalScore;
        this.skillScore = skillScore;
        this.experienceScore = experienceScore;
        this.geographicalScore = geographicalScore;
        this.availabilityScore = availabilityScore;
        this.compensationScore = compensationScore;

        if (totalScore >= 80.0) {
            this.tier = "High Match";
        } else if (totalScore >= 60.0) {
            this.tier = "Moderate Match";
        } else {
            this.tier = "Low Match";
        }
    }

    public double getTotalScore() { return totalScore; }
    public double getSkillScore() { return skillScore; }
    public double getExperienceScore() { return experienceScore; }
    public double getGeographicalScore() { return geographicalScore; }
    public double getAvailabilityScore() { return availabilityScore; }
    public double getCompensationScore() { return compensationScore; }
    public String getTier() { return tier; }

    @Override
    public int compareTo(CompatibilityScore other) {
        // Descending order for sorting highest scores first
        return Double.compare(other.totalScore, this.totalScore);
    }

    @Override
    public String toString() {
        return String.format("%.1f%% [%s] (Skill: %.0f%%, Exp: %.0f%%, Geo: %.0f%%, Shift: %.0f%%, Pay: %.0f%%)",
                totalScore, tier, skillScore, experienceScore, geographicalScore, availabilityScore, compensationScore);
    }
}
