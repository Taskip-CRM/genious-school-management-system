---
title: Attendance
---

# Attendance Management

The Attendance module uses a **polymorphic design** to track attendance for both students and staff using a single unified table. This avoids duplicating attendance logic and makes reporting consistent.

---

## Polymorphic Design

The `attendances` table is polymorphic — the `attendable_type` and `attendable_id` columns can point to either a `Student` or a `Staff` model.

**Table:** `attendances`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `attendable_type` | VARCHAR | `App\Models\Student` or `App\Models\Staff` |
| `attendable_id` | BIGINT | ID of the student or staff member |
| `date` | DATE | Attendance date |
| `status` | ENUM | `present`, `absent`, `late`, `excused` |
| `note` | TEXT NULL | Optional note (reason for absence, etc.) |
| `marked_by` | BIGINT | FK to `users` — who marked this record |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

> There is **no `class_id` column** on the `attendances` table. Class information is obtained by accessing `$attendance->attendable->schoolClass` (i.e., the student's class). When querying attendance for a specific class, use `whereHasMorph`.

---

## Attendance Statuses

| Status | Display | Description |
|---|---|---|
| `present` | Green | Student/staff was present |
| `absent` | Red | Unexcused absence |
| `late` | Amber | Arrived after scheduled start |
| `excused` | Blue | Absence with valid reason |

---

## Marking Attendance

### Bulk Mark by Class/Section

The most common use case is a teacher marking attendance for their entire class at once.

**Route:** `POST /school/attendance/bulk`

**Request body:**

```json
{
  "date": "2024-11-15",
  "class_id": 3,
  "section_id": 5,
  "records": [
    { "student_id": 101, "status": "present" },
    { "student_id": 102, "status": "absent", "note": "Called in sick" },
    { "student_id": 103, "status": "late" }
  ]
}
```

The attendance page pre-populates the form with the full student list for the selected class and section, defaulting all to "present". The teacher can then change individual statuses.

### Individual Mark

Single attendance records can be created or updated via:

```
POST /school/attendance        — create
PUT  /school/attendance/{id}   — update
```

---

## Querying Attendance (Avoid N+1)

When loading attendance records with the attendable relationship:

```php
// Correct — eager load the polymorphic relation
$attendances = Attendance::with('attendable')
    ->whereDate('date', $date)
    ->get();

// To get class info from a student's attendance record
$className = $attendance->attendable->schoolClass->name;

// Filtering attendance for a specific class
$attendances = Attendance::with('attendable')
    ->whereHasMorph('attendable', [Student::class], function ($q) use ($classId) {
        $q->where('class_id', $classId);
    })
    ->whereDate('date', $date)
    ->get();
```

> Do not access `$attendance->student` — there is no `student` relationship on the `Attendance` model. Always use `$attendance->attendable` which resolves to either a `Student` or `Staff` instance.

---

## Staff Attendance

Staff attendance is marked in the same way but uses `App\Models\Staff` as the `attendable_type`:

**Route:** `POST /school/attendance/staff/bulk`

**Request body:**

```json
{
  "date": "2024-11-15",
  "records": [
    { "staff_id": 10, "status": "present" },
    { "staff_id": 11, "status": "absent" }
  ]
}
```

---

## Reports

### Monthly Calendar View

The monthly attendance view shows a calendar grid for each student with color-coded status cells for each day of the month.

- Holidays (from the `holidays` table) are highlighted in grey and not counted as absences
- Weekends are excluded based on the school's working day configuration

**Route:** `GET /school/attendance/report?class_id=3&section_id=5&month=2024-11`

### Attendance Summary

For each student, the summary shows:

| Metric | Description |
|---|---|
| Total working days | Days the school was open (excluding holidays and weekends) |
| Present | Days marked present |
| Absent | Days marked absent |
| Late | Days marked late |
| Excused | Days marked excused |
| Attendance % | `(present + late + excused) / total_working_days * 100` |

---

## Student Portal View

Students can view their own attendance history for the **last 6 months** at `/school/student/attendance`. The page shows:

- Monthly summary card (present/absent/late counts)
- Calendar view for the current month
- Month selector for navigating history

Only the student's own records are returned (scoped by `attendable_id = $student->id`).

---

## Parent Portal View

Parents can view attendance for each of their children for the **last 3 months** at `/school/parent/attendance`. Each child has a separate tab or accordion section.
