import engine.CompatibilityScore;
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
 *
 * Demonstrates:
 * 1. Object-Oriented Modeling (Inheritance, Polymorphism, Encapsulation)
 * 2. Multi-Criteria Compatibility Matching Engine (5 Weighted Dimensions)
 * 3. PriorityQueue Candidate Ranking
 * 4. Collaborative Field Task Execution and Safety Checklists
 * 5. Automated Notification Stream
 */
public class Main {

    public static void main(String[] args) {
        printBanner();

        // 1. Initialize Notification & Task Services
        NotificationService notificationService = new NotificationService();
        TaskManagementService taskService = new TaskManagementService(notificationService);
        MultiCriteriaMatchingEngine matchingEngine = new MultiCriteriaMatchingEngine();
        MatchingWeights weights = MatchingWeights.getDefault();

        // 2. Instantiate Blue-Collar Workers (Polymorphism & Inheritance from UserAccount)
        List<WorkerProfile> workers = new ArrayList<>();

        WorkerProfile w1 = new WorkerProfile(
                "w-101", "Murugan K.", "murugan.electric@example.com", "+91 98412 34567",
                "Electrical", 8, 13.0827, 80.2707, "Chennai Central",
                "morning", 2200.0
        );
        w1.addSkill("3-Phase Industrial Wiring");
        w1.addSkill("PLC Troubleshooting");
        w1.addSkill("High Voltage Substation Maintenance");
        w1.addCertification("Licensed 'B' Grade Wireman Certificate");
        workers.add(w1);

        WorkerProfile w2 = new WorkerProfile(
                "w-102", "Selvam R.", "selvam.welder@example.com", "+91 94441 87654",
                "Welding & Fabrication", 6, 13.0500, 80.2100, "Guindy Industrial Area",
                "flexible", 2000.0
        );
        w2.addSkill("TIG Welding");
        w2.addSkill("MIG Welding");
        w2.addSkill("Structural Steel Fabrication");
        w2.addCertification("ASME Section IX Pressure Vessel Qualified");
        workers.add(w2);

        WorkerProfile w3 = new WorkerProfile(
                "w-103", "Karthik P.", "karthik.hvac@example.com", "+91 91760 99881",
                "HVAC & Refrigeration", 5, 12.9800, 80.2200, "Velachery",
                "morning", 1800.0
        );
        w3.addSkill("VRF / VRV Multi-Split Installation");
        w3.addSkill("Chilled Water System Commissioning");
        workers.add(w3);

        System.out.println("\n[PHASE 1] Polymorphic User Account Initialization:");
        for (UserAccount user : workers) {
            user.displayProfileSummary(); // Demonstrates Polymorphism
        }

        // 3. Create Employer & Open Vacancies
        EmployerProfile employer = new EmployerProfile(
                "emp-201", "R. Sundaram", "contact@lt-infra.com", "+91 44 2835 0000",
                "Metro Rail Infrastructure Consortium", "Civil & Transport", "Chennai HQ"
        );

        JobVacancy job = new JobVacancy(
                "job-301",
                "Senior Industrial Electrician - Metro Concourse",
                employer.getCompanyName(),
                "Chennai Metro Phase II Concourse Power Package",
                "Electrical",
                5,
                13.0850, 80.2750, "Central Metro Station Box",
                "morning",
                2500.0, "daily",
                3
        );
        job.addRequiredSkill("3-Phase Industrial Wiring");
        job.addRequiredSkill("High Voltage Substation Maintenance");
        job.addRequiredSkill("Conduit Bending & Cable Tray Routing");
        employer.addJob(job);

        System.out.println("\n[PHASE 2] Employer Vacancy Published:");
        System.out.println("Job: " + job.getTitle() + " at " + job.getSiteAddress());
        System.out.println("Trade Required: " + job.getTrade() + " (Min Exp: " + job.getMinExperienceYears() + " yrs)");
        System.out.println("Budget: ₹" + job.getPayRate() + " (" + job.getPayType() + ")");

        // 4. Execute Multi-Criteria Compatibility Matching Engine
        System.out.println("\n[PHASE 3] Executing Multi-Criteria Matching Algorithm (Java PriorityQueue):");
        System.out.println("Formula: Score = 0.35*Skills + 0.20*Exp + 0.20*Geo + 0.15*Shift + 0.10*Compensation");
        System.out.println("--------------------------------------------------------------------------------------");
        System.out.printf("%-18s | %-12s | %-12s | %-15s | %-20s\n", "Candidate", "Total Score", "Tier", "Distance", "Recommendation");
        System.out.println("--------------------------------------------------------------------------------------");

        List<MultiCriteriaMatchingEngine.ScoredCandidate> rankedCandidates =
                matchingEngine.rankCandidatesForJob(workers, job, weights);

        for (MultiCriteriaMatchingEngine.ScoredCandidate sc : rankedCandidates) {
            double dist = matchingEngine.computeHaversineDistance(
                    sc.getWorker().getLatitude(), sc.getWorker().getLongitude(),
                    job.getLatitude(), job.getLongitude()
            );
            System.out.printf("%-18s | %-12.1f%% | %-12s | %-12.1f km | %-20s\n",
                    sc.getWorker().getName(),
                    sc.getScore().getTotalScore(),
                    sc.getScore().getTier(),
                    dist,
                    sc.getScore().getTotalScore() >= 80 ? "HIGH MATCH (HIRE)" : "BELOW THRESHOLD"
            );
        }
        System.out.println("--------------------------------------------------------------------------------------");

        // 5. Select Top Candidate & Deploy Collaborative Task
        MultiCriteriaMatchingEngine.ScoredCandidate topCandidate = rankedCandidates.get(0);
        System.out.println("\n[PHASE 4] Mobilizing Top Candidate: " + topCandidate.getWorker().getName());

        ProjectTask siteTask = new ProjectTask(
                "task-501",
                job.getId(),
                job.getProjectName(),
                "Installation of 400A Main Distribution Board & Conduits",
                "Pull feeder cables through underground utility trench, verify earthing resistance < 1 Ohm.",
                job.getTrade(),
                "urgent",
                topCandidate.getWorker().getId(),
                topCandidate.getWorker().getName(),
                "2026-09-25",
                24,
                job.getSiteAddress(),
                "Dielectric gloves, arc-flash suit, lockout-tagout (LOTO) key required"
        );

        siteTask.addChecklist(new ChecklistItem("chk-1", "Site safety briefing & LOTO de-energization", true));
        siteTask.addChecklist(new ChecklistItem("chk-2", "Install heavy-duty galvanized cable trays", true));
        siteTask.addChecklist(new ChecklistItem("chk-3", "Pull & terminate 3.5-core 185 sq.mm copper cables", false));
        siteTask.addChecklist(new ChecklistItem("chk-4", "Megger insulation resistance test & QA sign-off", false));

        taskService.registerTask(siteTask);
        taskService.assignWorkerToTask(siteTask.getId(), topCandidate.getWorker());

        System.out.println("\n[PHASE 5] Field Task Active on Collaborative Board:");
        System.out.println("Task: " + siteTask.getTitle());
        System.out.println("Assigned Specialist: " + siteTask.getAssignedWorkerName());
        System.out.println("Safety Mandate: " + siteTask.getSafetyRequirement());
        System.out.println("Current Checklist Progress: " + siteTask.getCompletionPercentage() + "% Complete");
        for (ChecklistItem item : siteTask.getChecklists()) {
            System.out.println("  " + item);
        }

        // Simulate checklist advancement
        System.out.println("\n[PHASE 6] Simulating Specialist Completing Checklist Item 3 & 4:");
        siteTask.getChecklists().get(2).setCompleted(true);
        siteTask.getChecklists().get(3).setCompleted(true);
        siteTask.addLoggedHours(18);
        taskService.updateTaskStatus(siteTask.getId(), "review");

        System.out.println("Task Status updated to: " + siteTask.getStatus().toUpperCase());
        System.out.println("New Checklist Progress: " + siteTask.getCompletionPercentage() + "% Complete");

        System.out.println("\n[PHASE 7] Reviewing Automated Notification Log:");
        for (NotificationService.NotificationItem n : notificationService.getAllNotifications()) {
            System.out.println("  • " + n);
        }

        System.out.println("\n>>> [EXECUTION SUCCESSFUL] All Java OOP concepts demonstrated for EGB1201 Review 2.");
    }

    private static void printBanner() {
        System.out.println("******************************************************************");
        System.out.println("*        CGB1201 / EGB1201 JAVA PROGRAMMING REVIEW 2             *");
        System.out.println("*  SkillMatch: Competency-Oriented Blue-Collar Gig Platform      *");
        System.out.println("*  DEEPAK.R (927625BEC042) | DHAUSH.V (927625BEC051)            *");
        System.out.println("*  DHARAN.M (927625BEC054) - Dept of ECE, Semester II, Sec A    *");
        System.out.println("******************************************************************");
    }
}
