package model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Represents a collaborative field task on the real-time project task board.
 * Demonstrates:
 * - Domain object modeling
 * - State lifecycle transitions (backlog -> todo -> in_progress -> review -> completed)
 * - Encapsulation of safety checklists
 */
public class ProjectTask {
    private String id;
    private String projectId;
    private String projectName;
    private String title;
    private String description;
    private String trade;
    private String status; // "backlog", "todo", "in_progress", "review", "completed"
    private String priority; // "low", "medium", "high", "urgent"
    private String assignedWorkerId;
    private String assignedWorkerName;
    private String dueDate;
    private int estimatedHours;
    private int loggedHours;
    private List<ChecklistItem> checklists;
    private String location;
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
        this.dueDate = dueDate;
        this.estimatedHours = estimatedHours;
        this.loggedHours = 0;
        this.location = location;
        this.safetyRequirement = safetyRequirement;
        this.checklists = new ArrayList<>();
    }

    public void addChecklist(ChecklistItem item) {
        if (item != null) {
            checklists.add(item);
        }
    }

    public String getId() { return id; }
    public String getProjectId() { return projectId; }
    public String getProjectName() { return projectName; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getTrade() { return trade; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPriority() { return priority; }
    public String getAssignedWorkerId() { return assignedWorkerId; }
    public String getAssignedWorkerName() { return assignedWorkerName; }
    public String getDueDate() { return dueDate; }
    public int getEstimatedHours() { return estimatedHours; }
    public int getLoggedHours() { return loggedHours; }
    public void addLoggedHours(int hours) { this.loggedHours += hours; }
    public List<ChecklistItem> getChecklists() { return Collections.unmodifiableList(checklists); }
    public String getLocation() { return location; }
    public String getSafetyRequirement() { return safetyRequirement; }

    public double getCompletionPercentage() {
        if (checklists.isEmpty()) return 0.0;
        long done = checklists.stream().filter(ChecklistItem::isCompleted).count();
        return ((double) done / checklists.size()) * 100.0;
    }
}
