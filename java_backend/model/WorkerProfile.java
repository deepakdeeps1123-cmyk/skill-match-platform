package model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Represents a Blue-Collar Gig Worker profile.
 * Demonstrates:
 * - Inheritance (extends UserAccount)
 * - Polymorphism (@Override displayProfileSummary)
 * - Java Collections Framework (List<String> for technical skills and certifications)
 */
public class WorkerProfile extends UserAccount {
    private String trade; // e.g. "Electrical", "Welding & Fabrication"
    private List<String> skills;
    private int experienceYears;
    private double latitude;
    private double longitude;
    private String locationName;
    private String preferredShift; // "morning", "evening", "night", "flexible"
    private double dailyRate; // in INR
    private double rating;
    private boolean verified;
    private List<String> certifications;

    public WorkerProfile(String id, String name, String email, String phone,
                         String trade, int experienceYears,
                         double latitude, double longitude, String locationName,
                         String preferredShift, double dailyRate) {
        super(id, name, email, phone, "WORKER");
        this.trade = trade;
        this.experienceYears = experienceYears;
        this.latitude = latitude;
        this.longitude = longitude;
        this.locationName = locationName;
        this.preferredShift = preferredShift;
        this.dailyRate = dailyRate;
        this.skills = new ArrayList<>();
        this.certifications = new ArrayList<>();
        this.rating = 4.8;
        this.verified = true;
    }

    public void addSkill(String skill) {
        if (skill != null && !skills.contains(skill.trim())) {
            skills.add(skill.trim());
        }
    }

    public void addCertification(String cert) {
        if (cert != null && !certifications.contains(cert.trim())) {
            certifications.add(cert.trim());
        }
    }

    public String getTrade() {
        return trade;
    }

    public void setTrade(String trade) {
        this.trade = trade;
    }

    public List<String> getSkills() {
        return Collections.unmodifiableList(skills);
    }

    public int getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(int experienceYears) {
        this.experienceYears = experienceYears;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public String getLocationName() {
        return locationName;
    }

    public String getPreferredShift() {
        return preferredShift;
    }

    public void setPreferredShift(String preferredShift) {
        this.preferredShift = preferredShift;
    }

    public double getDailyRate() {
        return dailyRate;
    }

    public void setDailyRate(double dailyRate) {
        this.dailyRate = dailyRate;
    }

    public double getRating() {
        return rating;
    }

    public boolean isVerified() {
        return verified;
    }

    public List<String> getCertifications() {
        return Collections.unmodifiableList(certifications);
    }

    @Override
    public void displayProfileSummary() {
        System.out.println("==================================================");
        System.out.println("WORKER PROFILE: " + getName() + " [ID: " + getId() + "]");
        System.out.println("Trade: " + trade + " (" + experienceYears + " yrs experience)");
        System.out.println("Location: " + locationName + " (" + latitude + ", " + longitude + ")");
        System.out.println("Shift: " + preferredShift + " | Daily Rate: ₹" + dailyRate);
        System.out.println("Skills: " + String.join(", ", skills));
        System.out.println("Certifications: " + String.join(", ", certifications));
        System.out.println("Rating: " + rating + "/5.0 (Govt Certified: " + verified + ")");
        System.out.println("==================================================");
    }
}
