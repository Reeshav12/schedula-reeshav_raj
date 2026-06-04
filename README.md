# Schedula - Doctor Appointment Scheduler

A NestJS-based backend for managing doctor-patient appointments.

## Tech Stack
- **Backend:** NestJS + TypeScript
- **Database:** PostgreSQL
- **Version Control:** Git & GitHub

## ER Diagram

```mermaid
erDiagram
    USER {
        int id PK
        string name
        string email
        string password
        string phone
        string role
        timestamp createdAt
    }
    DOCTOR {
        int id PK
        int userId FK
        string specialization
        string qualification
        int experienceYears
        string bio
    }
    PATIENT {
        int id PK
        int userId FK
        date dateOfBirth
        string gender
        string address
        string medicalHistory
    }
    SLOT {
        int id PK
        int doctorId FK
        date date
        time startTime
        time endTime
        string status
    }
    APPOINTMENT {
        int id PK
        int patientId FK
        int doctorId FK
        int slotId FK
        string status
        string reason
        timestamp createdAt
    }
    APPOINTMENT_HISTORY {
        int id PK
        int appointmentId FK
        string action
        string description
        timestamp changedAt
    }
    NOTIFICATION {
        int id PK
        int userId FK
        string message
        boolean isRead
        timestamp createdAt
    }

    USER ||--o| DOCTOR : "is a"
    USER ||--o| PATIENT : "is a"
    DOCTOR ||--o{ SLOT : "has"
    PATIENT ||--o{ APPOINTMENT : "books"
    DOCTOR ||--o{ APPOINTMENT : "receives"
    SLOT ||--o| APPOINTMENT : "used in"
    APPOINTMENT ||--o{ APPOINTMENT_HISTORY : "tracked by"
    USER ||--o{ NOTIFICATION : "receives"
```