package model;

import java.time.LocalDateTime;

/**
 * Abstract base class representing a generic user account in the SkillMatch platform.
 * Demonstrates:
 * - Abstraction
 * - Encapsulation (private fields with validated public getters/setters)
 * - Base class for Inheritance (extended by WorkerProfile and EmployerProfile)
 */
public abstract class UserAccount {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String role; // "WORKER" or "EMPLOYER"
    private LocalDateTime registrationDate;

    public UserAccount(String id, String name, String email, String phone, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.registrationDate = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("User name cannot be empty.");
        }
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    /**
     * Polymorphic method to display summary profile information.
     */
    public abstract void displayProfileSummary();
}
