export interface JavaFileSnippet {
  fileName: string;
  packagePath: string;
  description: string;
  oopConcept: string;
  code: string;
}

export const JAVA_FILES: JavaFileSnippet[] = [
  {
    fileName: 'Main.java',
    packagePath: 'java_backend/Main.java',
    description: 'Driver class that initializes Workers, Employer, Job Vacancy, executes the MultiCriteriaMatchingEngine, ranks candidates with PriorityQueue, assigns field tasks, and advances safety checklists.',
    oopConcept: 'Polymorphic execution, dynamic binding, Collections Framework',
    code: `import engine.CompatibilityScore;
import engine.MatchingWeights;
import engine.MultiCriteriaMatchingEngine;
import model.*;
import service.NotificationService;
import service.TaskManagementService;

import java.util.ArrayList;
import java.util.List;

/**
 * Main Entry Point for CGB1201 / EGB1201 Java Programming Review 2.
 * Project Title: Skill-Based Job Matching Platform for Gig and Blue-Collar Workers
 * Authors: DEEPAK.R (927625BEC042), DHAUSH.V (927625BEC051), DHARAN.M (927625BEC054)
 * Department: Electronics and Communication Engineering
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== CGB1201 / EGB1201 JAVA PROGRAMMING REVIEW 2 ===");
        
        NotificationService notificationService = new NotificationService();
        TaskManagementService taskService = new TaskManagementService(notificationService);
        MultiCriteriaMatchingEngine matchingEngine = new MultiCriteriaMatchingEngine();
        MatchingWeights weights = MatchingWeights.getDefault();

        // 1. Worker Profile with Inheritance & Polymorphism
        WorkerProfile w1 = new WorkerProfile(
            "w-101", "Murugan K.", "murugan.electric@example.com", "+91 98412 34567",
            "Electrical", 8, 13.0827, 80.2707, "Chennai Central", "morning", 2200.0
        );
        w1.addSkill("3-Phase Industrial Wiring");
        w1.addSkill("PLC Troubleshooting");
        w1.addSkill("High Voltage Substation Maintenance");
        w1.addCertification("Licensed Wireman 'B' Grade");

        // 2. Employer & Vacancy
        EmployerProfile employer = new EmployerProfile(
            "emp-201", "R. Sundaram", "contact@lt-infra.com", "+91 44 2835 0000",
            "Metro Rail Consortium", "Infrastructure", "Chennai HQ"
        );
        JobVacancy job = new JobVacancy(
            "job-301", "Senior Industrial Electrician", employer.getCompanyName(),
            "Chennai Metro Phase II Concourse Power Package", "Electrical", 5,
            13.0850, 80.2750, "Central Metro Station Box", "morning", 2500.0, "daily", 3
        );
        job.addRequiredSkill("3-Phase Industrial Wiring");
        job.addRequiredSkill("High Voltage Substation Maintenance");

        // 3. Multi-Criteria Matching Engine execution
        List<WorkerProfile> pool = List.of(w1);
        List<MultiCriteriaMatchingEngine.ScoredCandidate> ranked = matchingEngine.rankCandidatesForJob(pool, job, weights);

        System.out.println("Top Candidate: " + ranked.get(0).getWorker().getName() + " -> Score: " + ranked.get(0).getScore().getTotalScore() + "%");
    }
}`
  },
  {
    fileName: 'MultiCriteriaMatchingEngine.java',
    packagePath: 'java_backend/engine/MultiCriteriaMatchingEngine.java',
    description: 'Implements the 5-dimensional compatibility algorithm using Haversine distance and Java PriorityQueue for O(N log K) top candidate ranking.',
    oopConcept: 'Interface Implementation (Strategy Pattern), Min-Heap PriorityQueue, Mathematical Modeling',
    code: `package engine;

import model.JobVacancy;
import model.WorkerProfile;
import java.util.*;

public class MultiCriteriaMatchingEngine implements CompatibilityScorer {
    private static final double EARTH_RADIUS_KM = 6371.0;

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
            return Double.compare(other.score.getTotalScore(), this.score.getTotalScore());
        }
    }

    @Override
    public CompatibilityScore calculateCompatibility(WorkerProfile worker, JobVacancy job, MatchingWeights weights) {
        MatchingWeights effectiveWeights = (weights != null) ? weights : MatchingWeights.getDefault();

        boolean tradeMatches = worker.getTrade().equalsIgnoreCase(job.getTrade());
        double tradePenalty = tradeMatches ? 1.0 : 0.25;

        double skillScore = computeSkillOverlap(worker.getSkills(), job.getRequiredSkills());
        double expScore = computeExperienceScore(worker.getExperienceYears(), job.getMinExperienceYears());
        double distanceKm = computeHaversineDistance(worker.getLatitude(), worker.getLongitude(), job.getLatitude(), job.getLongitude());
        double geoScore = computeDistanceScore(distanceKm);
        double availScore = computeAvailabilityScore(worker.getPreferredShift(), job.getShift());
        double compScore = computeCompensationScore(worker.getDailyRate(), job.getPayRate(), job.getPayType());

        double total = (
            (skillScore * effectiveWeights.getSkillsWeight()) +
            (expScore * effectiveWeights.getExperienceWeight()) +
            (geoScore * effectiveWeights.getGeographicalWeight()) +
            (availScore * effectiveWeights.getAvailabilityWeight()) +
            (compScore * effectiveWeights.getCompensationWeight())
        ) * tradePenalty;

        return new CompatibilityScore(Math.round(total * 10.0) / 10.0, skillScore, expScore, geoScore, availScore, compScore);
    }

    public List<ScoredCandidate> rankCandidatesForJob(List<WorkerProfile> workers, JobVacancy job, MatchingWeights weights) {
        PriorityQueue<ScoredCandidate> pq = new PriorityQueue<>();
        for (WorkerProfile w : workers) {
            pq.offer(new ScoredCandidate(w, calculateCompatibility(w, job, weights)));
        }
        List<ScoredCandidate> result = new ArrayList<>();
        while (!pq.isEmpty()) {
            result.add(pq.poll());
        }
        return result;
    }
}`
  },
  {
    fileName: 'UserAccount.java',
    packagePath: 'java_backend/model/UserAccount.java',
    description: 'Abstract base class establishing the foundational identity for all participants.',
    oopConcept: 'Abstraction, Encapsulation, Base Class for Inheritance',
    code: `package model;

import java.time.LocalDateTime;

public abstract class UserAccount {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private LocalDateTime registrationDate;

    public UserAccount(String id, String name, String email, String phone, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.registrationDate = LocalDateTime.now();
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("User name cannot be empty.");
        }
        this.name = name;
    }
    public String getEmail() { return email; }
    public String getRole() { return role; }

    public abstract void displayProfileSummary();
}`
  },
  {
    fileName: 'WorkerProfile.java',
    packagePath: 'java_backend/model/WorkerProfile.java',
    description: 'Blue-collar tradesperson profile encapsulating trade category, skills list, GPS coordinates, and shift preferences.',
    oopConcept: 'Inheritance (extends UserAccount), Polymorphism (@Override), Encapsulation',
    code: `package model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class WorkerProfile extends UserAccount {
    private String trade;
    private List<String> skills;
    private int experienceYears;
    private double latitude;
    private double longitude;
    private String locationName;
    private String preferredShift;
    private double dailyRate;
    private double rating;
    private boolean verified;

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
        this.rating = 4.8;
        this.verified = true;
    }

    public void addSkill(String skill) {
        if (skill != null && !skills.contains(skill.trim())) {
            skills.add(skill.trim());
        }
    }

    public String getTrade() { return trade; }
    public List<String> getSkills() { return Collections.unmodifiableList(skills); }
    public int getExperienceYears() { return experienceYears; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public double getDailyRate() { return dailyRate; }
    public String getPreferredShift() { return preferredShift; }

    @Override
    public void displayProfileSummary() {
        System.out.println("WORKER: " + getName() + " | Trade: " + trade + " (" + experienceYears + " yrs)");
    }
}`
  },
  {
    fileName: 'ProjectTask.java',
    packagePath: 'java_backend/model/ProjectTask.java',
    description: 'Models field assignments on the real-time project task board with safety checklists and status transitions.',
    oopConcept: 'Object Composition, State Lifecycle Management, Encapsulation',
    code: `package model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ProjectTask {
    private String id;
    private String projectId;
    private String projectName;
    private String title;
    private String description;
    private String trade;
    private String status; // "backlog", "todo", "in_progress", "review", "completed"
    private String priority;
    private String assignedWorkerId;
    private String assignedWorkerName;
    private int estimatedHours;
    private int loggedHours;
    private List<ChecklistItem> checklists;
    private String safetyRequirement;

    public ProjectTask(String id, String projectId, String projectName, String title,
                       String description, String trade, String priority,
                       String assignedWorkerId, String assignedWorkerName,
                       String dueDate, int estimatedHours, String location, String safetyRequirement) {
        this.id = id;
        this.projectId = projectId;
        this.projectName = projectName;
        this.title = title;
        this.description = description;
        this.trade = trade;
        this.status = "todo";
        this.priority = priority;
        this.assignedWorkerId = assignedWorkerId;
        this.assignedWorkerName = assignedWorkerName;
        this.estimatedHours = estimatedHours;
        this.safetyRequirement = safetyRequirement;
        this.checklists = new ArrayList<>();
    }

    public void addChecklist(ChecklistItem item) {
        if (item != null) checklists.add(item);
    }

    public double getCompletionPercentage() {
        if (checklists.isEmpty()) return 0.0;
        long done = checklists.stream().filter(ChecklistItem::isCompleted).count();
        return ((double) done / checklists.size()) * 100.0;
    }
}`
  }
];
