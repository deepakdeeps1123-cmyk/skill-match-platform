package model;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents an Employer / Contractor profile.
 * Demonstrates:
 * - Inheritance (extends UserAccount)
 * - Polymorphism (@Override displayProfileSummary)
 * - Encapsulation of job posting management
 */
public class EmployerProfile extends UserAccount {
    private String companyName;
    private String industry;
    private String headquarterLocation;
    private List<JobVacancy> postedJobs;

    public EmployerProfile(String id, String name, String email, String phone,
                           String companyName, String industry, String headquarterLocation) {
        super(id, name, email, phone, "EMPLOYER");
        this.companyName = companyName;
        this.industry = industry;
        this.headquarterLocation = headquarterLocation;
        this.postedJobs = new ArrayList<>();
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getIndustry() {
        return industry;
    }

    public String getHeadquarterLocation() {
        return headquarterLocation;
    }

    public List<JobVacancy> getPostedJobs() {
        return postedJobs;
    }

    public void addJob(JobVacancy job) {
        if (job != null) {
            postedJobs.add(job);
        }
    }

    @Override
    public void displayProfileSummary() {
        System.out.println("==================================================");
        System.out.println("EMPLOYER: " + companyName + " (" + industry + ")");
        System.out.println("Contact: " + getName() + " | Email: " + getEmail());
        System.out.println("HQ: " + headquarterLocation);
        System.out.println("Active Job Postings: " + postedJobs.size());
        System.out.println("==================================================");
    }
}
