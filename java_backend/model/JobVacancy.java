package model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Represents a job opening or infrastructure subcontract work package.
 * Demonstrates:
 * - Encapsulation of vacancy requirements
 * - Collections Framework (List<String> required skills)
 */
public class JobVacancy {
    private String id;
    private String title;
    private String companyName;
    private String projectName;
    private String trade;
    private List<String> requiredSkills;
    private int minExperienceYears;
    private double latitude;
    private double longitude;
    private String siteAddress;
    private String shift; // "morning", "evening", "night", "flexible"
    private double payRate; // INR
    private String payType; // "hourly" or "daily"
    private int openings;
    private int filledCount;
    private String status; // "open", "filled", "closed"

    public JobVacancy(String id, String title, String companyName, String projectName,
                      String trade, int minExperienceYears,
                      double latitude, double longitude, String siteAddress,
                      String shift, double payRate, String payType, int openings) {
        this.id = id;
        this.title = title;
        this.companyName = companyName;
        this.projectName = projectName;
        this.trade = trade;
        this.minExperienceYears = minExperienceYears;
        this.latitude = latitude;
        this.longitude = longitude;
        this.siteAddress = siteAddress;
        this.shift = shift;
        this.payRate = payRate;
        this.payType = payType;
        this.openings = openings;
        this.filledCount = 0;
        this.status = "open";
        this.requiredSkills = new ArrayList<>();
    }

    public void addRequiredSkill(String skill) {
        if (skill != null && !requiredSkills.contains(skill.trim())) {
            requiredSkills.add(skill.trim());
        }
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getCompanyName() { return companyName; }
    public String getProjectName() { return projectName; }
    public String getTrade() { return trade; }
    public List<String> getRequiredSkills() { return Collections.unmodifiableList(requiredSkills); }
    public int getMinExperienceYears() { return minExperienceYears; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public String getSiteAddress() { return siteAddress; }
    public String getShift() { return shift; }
    public double getPayRate() { return payRate; }
    public String getPayType() { return payType; }
    public int getOpenings() { return openings; }
    public int getFilledCount() { return filledCount; }
    public String getStatus() { return status; }

    public void incrementFilledCount() {
        if (filledCount < openings) {
            filledCount++;
            if (filledCount == openings) {
                status = "filled";
            }
        }
    }
}
