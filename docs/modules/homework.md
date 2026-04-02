---
title: Homework & Learning
---

# Homework & Lesson Planning

The Homework & Learning module covers all aspects of academic content delivery outside the classroom — homework assignments, lesson planning, syllabus tracking, and online/video classes.

---

## Homework

**Table:** `homeworks`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `class_id` | BIGINT | FK to `school_classes` |
| `section_id` | BIGINT NULL | FK to `sections` (null = all sections) |
| `subject_id` | BIGINT | FK to `subjects` |
| `staff_id` | BIGINT | FK to `staff` — assigned teacher |
| `title` | VARCHAR | Homework title |
| `description` | TEXT | Detailed instructions |
| `due_date` | DATE | Submission deadline |
| `marks` | INT NULL | Maximum marks (if graded) |
| `attachment` | VARCHAR NULL | Storage path for attached file |
| `is_active` | BOOLEAN | Whether homework is currently visible to students |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

> The `is_active` flag controls visibility in the student portal. New homework defaults to `is_active = true`. Teachers can deactivate homework to hide it without deleting it.

---

## Lesson Plans

Lesson plans help teachers structure their teaching for each class period.

**Table:** `lesson_plans`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `class_id` | BIGINT | FK to `school_classes` |
| `section_id` | BIGINT NULL | FK to `sections` |
| `subject_id` | BIGINT | FK to `subjects` |
| `staff_id` | BIGINT | FK to `staff` |
| `title` | VARCHAR | Lesson plan title |
| `objectives` | TEXT | Learning objectives |
| `content` | TEXT | Main lesson content |
| `methodology` | TEXT NULL | Teaching methods/activities |
| `resources` | TEXT NULL | Materials/resources needed |
| `plan_date` | DATE | Date of the planned lesson |
| `duration_minutes` | INT NULL | Planned duration in minutes |
| `attachment` | VARCHAR NULL | Storage path for attached document |
| `status` | ENUM | `draft`, `approved`, `completed` |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## Syllabi

Syllabi track the planned curriculum topics and their completion status.

**Table:** `syllabi`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `class_id` | BIGINT | FK to `school_classes` |
| `subject_id` | BIGINT | FK to `subjects` |
| `staff_id` | BIGINT NULL | FK to `staff` |
| `academic_year_id` | BIGINT | FK to `academic_years` |
| `title` | VARCHAR | Topic/unit title |
| `description` | TEXT NULL | Detailed content description |
| `planned_date` | DATE NULL | Planned teaching date |
| `completed_date` | DATE NULL | Actual completion date |
| `is_completed` | BOOLEAN | Whether this topic has been covered |
| `order` | INT | Display order |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## Online Classes

Online classes link to video sessions (e.g., Zoom, Google Meet, YouTube Live, recorded videos).

**Table:** `online_classes`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `class_id` | BIGINT | FK to `school_classes` |
| `section_id` | BIGINT NULL | FK to `sections` |
| `subject_id` | BIGINT | FK to `subjects` |
| `staff_id` | BIGINT | FK to `staff` |
| `title` | VARCHAR | Class title |
| `description` | TEXT NULL | Class description |
| `platform` | VARCHAR | e.g., `Zoom`, `Google Meet`, `YouTube` |
| `meeting_url` | VARCHAR | Join/watch URL |
| `meeting_id` | VARCHAR NULL | Meeting ID (for Zoom, etc.) |
| `passcode` | VARCHAR NULL | Meeting passcode |
| `scheduled_at` | DATETIME | Scheduled date and time |
| `duration_minutes` | INT | Planned duration |
| `status` | ENUM | `upcoming`, `live`, `completed`, `cancelled` |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## Student Portal Views

| Content Type | Route | Description |
|---|---|---|
| Homework | `/school/student/homework` | Active homework assignments for student's class |
| Online Classes | `/school/student/online-classes` | Upcoming and past video classes |

Students only see homework with `is_active = true` and due dates in the future (or recent past for the last 7 days).

---

## UI Pages

| Page | Route | Roles |
|---|---|---|
| Homework List | `/school/homework` | school-admin, teacher |
| Create Homework | `/school/homework/create` | teacher |
| Edit Homework | `/school/homework/{id}/edit` | teacher |
| Lesson Plans | `/school/lesson-plans` | school-admin, teacher |
| Create Lesson Plan | `/school/lesson-plans/create` | teacher |
| Syllabi | `/school/syllabi` | school-admin, teacher |
| Online Classes | `/school/online-classes` | school-admin, teacher |
