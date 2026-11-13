package service;

import model.ChecklistItem;
import model.ProjectTask;
import model.WorkerProfile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service managing collaborative tasks on the field board.
 * Demonstrates:
 * - Java Streams and Lambdas
 * - State management and exception handling
 */
public class TaskManagementService {

    private final List<ProjectTask> taskRepository;
    private final NotificationService notificationService;

    public TaskManagementService(NotificationService notificationService) {
        this.taskRepository = new ArrayList<>();
        this.notificationService = notificationService;
    }

    public void registerTask(ProjectTask task) {
        if (task == null) throw new IllegalArgumentException("Task cannot be null.");
        taskRepository.add(task);
        notificationService.dispatchNotification(
                "New Project Task Created",
                "Task '" + task.getTitle() + "' allocated under " + task.getProjectName(),
                "TASK"
        );
    }

    public void assignWorkerToTask(String taskId, WorkerProfile worker) {
        Optional<ProjectTask> found = taskRepository.stream().filter(t -> t.getId().equals(taskId)).findFirst();
        if (found.isPresent()) {
            ProjectTask task = found.get();
            notificationService.dispatchNotification(
                    "Worker Mobilized to Task",
                    worker.getName() + " assigned to field task: " + task.getTitle(),
                    "TASK"
            );
        }
    }

    public void updateTaskStatus(String taskId, String newStatus) {
        for (ProjectTask task : taskRepository) {
            if (task.getId().equals(taskId)) {
                task.setStatus(newStatus);
                if ("review".equalsIgnoreCase(newStatus)) {
                    notificationService.dispatchNotification(
                            "Safety Inspection Required",
                            "Milestones ready for safety audit: " + task.getTitle(),
                            "SAFETY"
                    );
                } else if ("completed".equalsIgnoreCase(newStatus)) {
                    notificationService.dispatchNotification(
                            "Task Verified Complete",
                            "All checklists verified for task: " + task.getTitle(),
                            "MILESTONE"
                    );
                }
                return;
            }
        }
    }

    public List<ProjectTask> getTasksByStatus(String status) {
        return taskRepository.stream()
                .filter(t -> t.getStatus().equalsIgnoreCase(status))
                .collect(Collectors.toList());
    }

    public List<ProjectTask> getAllTasks() {
        return taskRepository;
    }
}
