---
title: Examinations
---

# Examinations & Results

The Examinations module manages the full lifecycle of academic assessments — from scheduling exams to entering marks, calculating grades, and publishing results to the student portal.

---

## Exam Model

**Table:** `exams`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `name` | VARCHAR | e.g., `Mid-Term Exam 2024`, `Final Exam 2024` |
| `type` | ENUM | `midterm`, `final`, `quiz`, `assignment`, `test` |
| `class_id` | BIGINT | FK to `school_classes` |
| `academic_year_id` | BIGINT | FK to `academic_years` |
| `start_date` | DATE | Exam start date |
| `end_date` | DATE | Exam end date |
| `status` | ENUM | `scheduled`, `ongoing`, `completed`, `published` |
| `description` | TEXT NULL | Optional description or instructions |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

### Exam Status Workflow

```
scheduled  ──▶  ongoing  ──▶  completed  ──▶  published
```

| Status | Meaning |
|---|---|
| `scheduled` | Exam is upcoming, marks not yet entered |
| `ongoing` | Exam is currently being conducted |
| `completed` | Exam done, marks being entered, not yet visible to students |
| `published` | Results are visible in the student portal |

---

## Exam Schedule

Individual subject exams are scheduled within a parent exam:

**Table:** `exam_schedules`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `exam_id` | BIGINT | FK to `exams` |
| `subject_id` | BIGINT | FK to `subjects` |
| `section_id` | BIGINT NULL | FK to `sections` |
| `exam_date` | DATE | Date of this subject's exam |
| `start_time` | TIME | Start time |
| `end_time` | TIME | End time |
| `room` | VARCHAR NULL | Exam room/hall |
| `total_marks` | DECIMAL | Maximum marks for this subject exam |
| `pass_marks` | DECIMAL | Minimum marks to pass |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## Marks Model

**Table:** `exam_marks`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `exam_id` | BIGINT | FK to `exams` |
| `exam_schedule_id` | BIGINT | FK to `exam_schedules` |
| `student_id` | BIGINT | FK to `students` |
| `subject_id` | BIGINT | FK to `subjects` |
| `marks_obtained` | DECIMAL NULL | Marks scored (null if absent) |
| `total_marks` | DECIMAL | Total possible marks |
| `percentage` | DECIMAL NULL | Auto-calculated: `marks_obtained / total_marks * 100` |
| `grade` | VARCHAR NULL | Auto-assigned based on grade rules |
| `grade_point` | DECIMAL NULL | Grade point (e.g., 4.0, 3.5) |
| `is_absent` | BOOLEAN | Whether student was absent |
| `remarks` | TEXT NULL | Teacher remarks |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## Grade Auto-Calculation

Grades are automatically assigned based on the school's configured grade scale. Grade rules are stored in the `grade_rules` table:

**Table:** `grade_rules`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `grade_name` | VARCHAR | e.g., `A+`, `A`, `B+`, `B`, `C`, `F` |
| `min_percentage` | DECIMAL | Minimum percentage for this grade |
| `max_percentage` | DECIMAL | Maximum percentage for this grade |
| `grade_point` | DECIMAL | GPA point (e.g., 4.0, 3.5) |
| `remarks` | VARCHAR | e.g., `Excellent`, `Good`, `Satisfactory`, `Fail` |

**Grade calculation service:**

```php
// In GradeCalculationService
public function calculateGrade(float $marksObtained, float $totalMarks): array
{
    $percentage = ($marksObtained / $totalMarks) * 100;

    $rule = GradeRule::where('min_percentage', '<=', $percentage)
        ->where('max_percentage', '>=', $percentage)
        ->first();

    return [
        'percentage'  => round($percentage, 2),
        'grade'       => $rule?->grade_name ?? 'N/A',
        'grade_point' => $rule?->grade_point ?? 0,
        'remarks'     => $rule?->remarks ?? '',
    ];
}
```

---

## Entering Marks

Marks entry is done per subject per exam. Teachers or school admins open the marks entry form for a specific exam schedule:

**Route:** `GET /school/exams/{exam_id}/marks/{schedule_id}`

The form shows all students in the class with input fields for:
- Marks obtained (numeric input with max = total marks)
- Absent checkbox (disables marks input and sets `is_absent = true`)
- Remarks (optional per-student note)

On submission, grades and percentages are auto-calculated server-side.

---

## Result Sheet

A consolidated result sheet shows all subjects for all students in a class for a given exam:

**Route:** `GET /school/exams/{exam_id}/results`

The sheet can be exported as PDF (queued job) or Excel.

---

## Student Portal View

Students can view their own results at `/school/student/results`. Results are only shown for exams with `status = published`.

The results page shows:
- Exam name, type, and date
- Subject-wise marks, percentage, and grade
- Overall percentage and grade for the exam
- Pass/Fail status

---

## Parent Portal View

Parents can view results for all their linked children at `/school/parent/results`.
