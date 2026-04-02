---
title: Student Management
---

# Student Management

The Student Management module handles the full lifecycle of a student at the school — from initial enrollment through active attendance to alumni status.

---

## Core Concepts

- Each student record belongs to a **school** (multi-tenancy via `school_id`)
- Students are optionally linked to a **User** account for the student portal (via `user_id`)
- Students are linked to one or more **Guardians** (parents/legal guardians)
- Admission numbers are auto-generated in a standardized format
- All major student data is soft-deleted to preserve historical records

---

## Student Model

**Table:** `students`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `user_id` | BIGINT NULL | FK to `users` — links student to login account for portal |
| `admission_number` | VARCHAR | Auto-generated, unique per school |
| `first_name` | VARCHAR | |
| `last_name` | VARCHAR | |
| `date_of_birth` | DATE | |
| `gender` | ENUM | `male`, `female`, `other` |
| `blood_group` | VARCHAR | Optional |
| `religion` | VARCHAR | Optional |
| `nationality` | VARCHAR | Optional |
| `photo` | VARCHAR | Path relative to storage disk |
| `class_id` | BIGINT | FK to `school_classes` |
| `section_id` | BIGINT | FK to `sections` |
| `shift_id` | BIGINT NULL | FK to `shifts` |
| `academic_year_id` | BIGINT | FK to `academic_years` |
| `roll_number` | VARCHAR | Student roll number within class/section |
| `admission_date` | DATE | Date of enrollment |
| `status` | ENUM | `active`, `inactive`, `alumni` |
| `address` | TEXT | Home address |
| `phone` | VARCHAR | Student's personal phone (optional) |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## Admission Number Format

Admission numbers are auto-generated when a new student is enrolled:

```
ADM-{YEAR}-{NNNN}
```

Examples:
- `ADM-2024-0001` — first student enrolled in 2024
- `ADM-2024-0247` — 247th student enrolled in 2024

The sequence resets per school per year. Generation logic:

```php
// In StudentService
public function generateAdmissionNumber(int $schoolId): string
{
    $year = now()->year;
    $lastStudent = Student::withoutGlobalScopes()
        ->where('school_id', $schoolId)
        ->where('admission_number', 'like', "ADM-{$year}-%")
        ->orderByDesc('admission_number')
        ->first();

    $sequence = $lastStudent
        ? (int) substr($lastStudent->admission_number, -4) + 1
        : 1;

    return sprintf('ADM-%d-%04d', $year, $sequence);
}
```

---

## Student Status Workflow

```
active  ──▶  inactive  ──▶  alumni
  │                              ▲
  └──────────────────────────────┘
          (direct to alumni for graduated students)
```

| Status | Meaning |
|---|---|
| `active` | Currently enrolled and attending |
| `inactive` | Temporarily suspended or on leave |
| `alumni` | Graduated or left the school |

---

## Guardian (Parent) Linking

Each student can have one or more guardians. The `guardians` table stores guardian information with an optional `user_id` link for the parent portal.

**Table:** `guardians`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `user_id` | BIGINT NULL | FK to `users` — links guardian to parent portal |
| `first_name` | VARCHAR | |
| `last_name` | VARCHAR | |
| `relationship` | VARCHAR | `father`, `mother`, `guardian` |
| `phone` | VARCHAR | Primary contact number |
| `email` | VARCHAR | Email address |
| `occupation` | VARCHAR | Optional |
| `address` | TEXT | Optional |
| `photo` | VARCHAR | Optional |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

**Pivot table:** `guardian_student`

| Column | Type | Description |
|---|---|---|
| `guardian_id` | BIGINT | FK to `guardians` |
| `student_id` | BIGINT | FK to `students` |
| `is_primary` | BOOLEAN | Whether this is the primary guardian |

---

## Photo Upload

Student photos are uploaded via a file input and stored using Laravel Storage:

- **Disk:** `public`
- **Path:** `students/photos/{school_id}/{filename}`
- **Accepted formats:** JPEG, PNG, WebP
- **Max file size:** 2 MB
- **Validation:** MIME type verified server-side (not just extension)

```php
// In StoreStudentRequest
'photo' => 'nullable|image|mimes:jpeg,png,webp|max:2048',
```

---

## Student Documents

Students can have multiple documents uploaded (birth certificate, previous report cards, medical certificates, etc.).

**Table:** `student_documents`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `student_id` | BIGINT | FK to `students` |
| `title` | VARCHAR | Document name |
| `file_path` | VARCHAR | Storage path |
| `file_type` | VARCHAR | MIME type |
| `uploaded_at` | TIMESTAMP | |

---

## Bulk Import

Students can be imported in bulk via an Excel/CSV file using `maatwebsite/laravel-excel`. The import is dispatched as a queued job to avoid timeouts:

```php
StudentImport::dispatch($uploadedFile, $schoolId)
    ->onQueue('imports');
```

A sample import template is available for download from the Students index page.

**Required columns in import file:**

| Column | Required | Notes |
|---|---|---|
| `first_name` | Yes | |
| `last_name` | Yes | |
| `date_of_birth` | Yes | Format: `YYYY-MM-DD` |
| `gender` | Yes | `male`, `female`, `other` |
| `class_name` | Yes | Must match existing class name |
| `section_name` | Yes | Must match existing section name |
| `roll_number` | No | Auto-assigned if blank |
| `guardian_name` | No | |
| `guardian_phone` | No | |

---

## Export

The Students index page includes an **Export to Excel** button. The export uses `maatwebsite/laravel-excel` and generates a downloadable `.xlsx` file with all visible student records (respecting current filters).

---

## UI Pages

| Page | Route | Description |
|---|---|---|
| Student List | `/school/students` | Paginated table with search, class, section, status filters |
| Create Student | `/school/students/create` | Multi-step form with photo upload |
| Edit Student | `/school/students/{id}/edit` | Edit all student details |
| Student Profile | `/school/students/{id}` | Full profile with attendance, results, fee history tabs |
| Import Students | `/school/students/import` | Upload Excel file for bulk import |
