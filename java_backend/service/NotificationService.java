package service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedList;
import java.util.List;

/**
 * Automated Notification Service demonstrating Java Queue collection and Observer behavior.
 */
public class NotificationService {

    public static class NotificationItem {
        private String id;
        private String title;
        private String message;
        private String type; // "MATCH", "APPLICATION", "TASK", "SAFETY"
        private String timestamp;
        private boolean read;

        public NotificationItem(String id, String title, String message, String type) {
            this.id = id;
            this.title = title;
            this.message = message;
            this.type = type;
            this.timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            this.read = false;
        }

        public String getTitle() { return title; }
        public String getMessage() { return message; }
        public String getType() { return type; }
        public String getTimestamp() { return timestamp; }
        public boolean isRead() { return read; }
        public void markRead() { this.read = true; }

        @Override
        public String toString() {
            return String.format("[%s] %s: %s (at %s)", type, title, message, timestamp);
        }
    }

    private final LinkedList<NotificationItem> notificationQueue;

    public NotificationService() {
        this.notificationQueue = new LinkedList<>();
    }

    public synchronized void dispatchNotification(String title, String message, String type) {
        String id = "notif-" + System.currentTimeMillis();
        NotificationItem item = new NotificationItem(id, title, message, type);
        notificationQueue.addFirst(item);
        System.out.println(">>> [AUTOMATED NOTIFICATION DISPATCHED] " + item);
    }

    public List<NotificationItem> getAllNotifications() {
        return notificationQueue;
    }
}
