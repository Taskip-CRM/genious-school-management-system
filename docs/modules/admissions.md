---
title: Admissions
---

# Admission Inquiry & Visitor Management

The Admissions module handles pre-enrollment inquiries from prospective students, manages the inquiry follow-up workflow, and logs all visitor traffic to the school.

---

## Admission Inquiries

**Table:** `admission_inquiries`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `inquiry_number` | VARCHAR | Auto-generated unique reference |
| `student_name` | VARCHAR | Prospective student's name |
| `date_of_birth` | DATE NULL | Student's date of birth |
| `gender` | ENUM | `male`, `female`, `other` |
| `applying_for_class` | BIGINT NULL | FK to `school_classes` |
| `guardian_name` | VARCHAR | Parent/guardian name |
| `guardian_phone` | VARCHAR | Primary contact number |
| `guardian_email` | VARCHAR NULL | Contact email |
| `address` | TEXT NULL | Home address |
| `source` | VARCHAR NULL | How they heard about the school |
| `notes` | TEXT NULL | Initial notes from receptionist |
| `status` | ENUM | `new`, `contacted`, `scheduled`, `admitted`, `rejected` |
| `created_by` | BIGINT NULL | FK to `users` — staff who created record |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## Inquiry Status Workflow

```
new ──▶ contacted ──▶ scheduled ──▶ admitted
  │           │              │
  └─────────────────────────┴──▶ rejected
```

| Status | Meaning | Action |
|---|---|---|
| `new` | Just submitted (via form or receptionist) | Awaiting first contact |
| `contacted` | Initial phone/email contact made | Following up |
| `scheduled` | Interview or visit scheduled | Awaiting appointment |
| `admitted` | Student formally enrolled | Convert to student record |
| `rejected` | Inquiry declined | No further action |

### Status Update API

```
PUT /school/admissions/inquiries/{id}/status

{
  "status": "contacted",
  "note": "Called guardian, scheduled a visit for Monday."
}
```

---

## Inquiry Followups

Each inquiry can have multiple followup notes added by staff, creating an audit trail of communications.

**Table:** `inquiry_followups`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `inquiry_id` | BIGINT | FK to `admission_inquiries` |
| `staff_id` | BIGINT NULL | FK to `staff` — who made the followup |
| `user_id` | BIGINT | FK to `users` |
| `note` | TEXT | Followup note |
| `contact_method` | VARCHAR NULL | e.g., `Phone`, `Email`, `In-person` |
| `next_followup_date` | DATE NULL | Scheduled next contact date |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

**Add followup endpoint:**

```
POST /school/admissions/inquiries/{id}/followups

{
  "note": "Met with the guardian. They are interested in admission for January.",
  "contact_method": "In-person",
  "next_followup_date": "2024-12-01"
}
```

---

## Public Admission Form

Prospective students can submit inquiries directly through a public-facing form without logging in:

**URL:** `/apply/{school-slug}`

This is a standard Inertia page rendered without authentication middleware. The form collects:
- Student name, date of birth, gender
- Class applying for (dropdown from the school's class list)
- Guardian name, phone, email
- Home address
- Message/notes

On submission:
1. An `AdmissionInquiry` record is created with `status = new`
2. An optional confirmation email is sent to the guardian (if email provided)
3. The receptionist/admin is notified of the new inquiry

---

## Converting to Student

When an inquiry reaches `status = admitted`, the receptionist or admin can convert it to a full student enrollment record:

```
POST /school/admissions/inquiries/{id}/convert-to-student
```

This pre-fills the student creation form with data from the inquiry (name, DOB, gender, class, guardian info), allowing the admin to complete the enrollment without re-entering data.

---

## Visitor Logs

The visitor log tracks all visitors entering and exiting the school premises.

**Table:** `visitor_logs`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `visitor_name` | VARCHAR | Visitor's full name |
| `visitor_phone` | VARCHAR NULL | Contact number |
| `id_type` | VARCHAR NULL | Type of ID: `NID`, `Passport`, `Driver License` |
| `id_number` | VARCHAR NULL | ID document number |
| `purpose` | VARCHAR | Reason for visit |
| `person_to_meet` | VARCHAR NULL | Staff member/department they are visiting |
| `student_id` | BIGINT NULL | FK to `students` (if visiting a student) |
| `check_in_time` | DATETIME | Arrival time |
| `check_out_time` | DATETIME NULL | Departure time (null if still in premises) |
| `badge_number` | VARCHAR NULL | Visitor badge issued |
| `notes` | TEXT NULL | Additional notes |
| `created_by` | BIGINT | FK to `users` — receptionist |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## UI Pages

| Page | Route | Roles |
|---|---|---|
| Inquiries List | `/school/admissions/inquiries` | school-admin, receptionist |
| Inquiry Detail | `/school/admissions/inquiries/{id}` | school-admin, receptionist |
| Create Inquiry | `/school/admissions/inquiries/create` | school-admin, receptionist |
| Visitor Log | `/school/admissions/visitors` | school-admin, receptionist |
| Check In Visitor | `/school/admissions/visitors/create` | receptionist |
| Public Admission Form | `/apply/{school-slug}` | Public (no auth) |
