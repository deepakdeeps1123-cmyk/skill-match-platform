# EGB1201 / CGB1201 Java Programming Review 2
## Skill-Based Job Matching & Collaborative Project Management Platform for Gig & Blue-Collar Workers

### Authors:
- **DEEPAK.R** (Reg No: 927625BEC042)
- **DHAUSH.V** (Reg No: 927625BEC051)
- **DHARAN.M** (Reg No: 927625BEC054)
- **Department**: Electronics and Communication Engineering (ECE)
- **Academic Year**: 2026 – 2027 (Odd Semester), Semester II, Section A
- **Date of Review**: 21.09.2026

---

### How to Compile & Run the Java Project:

#### Prerequisites:
- Java SE Development Kit (JDK 8 or higher / JDK 17 / JDK 21)

#### Steps:
```bash
# 1. Navigate to the java_backend directory
cd java_backend

# 2. Compile all Java source files
javac model/*.java engine/*.java service/*.java Main.java

# 3. Execute the Main application
java Main
```

---

### Java OOP Concepts Demonstrated:
1. **Inheritance & Hierarchy**:
   - `UserAccount.java` (abstract base class) extended by `WorkerProfile.java` and `EmployerProfile.java`.
2. **Polymorphism & Method Overriding**:
   - `displayProfileSummary()` is overridden in `WorkerProfile` and `EmployerProfile`.
   - `CompatibilityScorer` interface allows dynamic swapping of scoring algorithms.
3. **Encapsulation**:
   - Private attributes with validated getter and setter accessors.
   - Unmodifiable collections via `Collections.unmodifiableList()`.
4. **Collections Framework**:
   - `List`, `ArrayList`, `LinkedList` for dynamic collections.
   - `PriorityQueue<ScoredCandidate>` (Min-Heap / Max-Heap) for candidate ranking in $O(N \log K)$ time.
5. **Exception Handling**:
   - `IllegalArgumentException` validation for null or empty domain objects.
6. **Multi-Criteria Mathematical Engine**:
   - Jaccard skill similarity.
   - Haversine great-circle distance algorithm ($R = 6371\text{ km}$).
   - Shift alignment and compensation matching.
