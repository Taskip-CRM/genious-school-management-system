---
title: School Setup
---

# School Setup & Configuration

The School Setup module provides the foundational data structures that all other modules depend on. It must be fully configured before students, staff, attendance, or timetable data can be created.

---

## Setup Order

Configure in this order to avoid foreign key conflicts:

1. Academic Year (establish the current year)
2. Classes (grade levels)
3. Sections (subdivisions per class)
4. Subjects (with class assignments)
5. Shifts (morning/afternoon/evening)
6. Holidays

---

## Academic Years

An academic year defines the operational calendar for a school. Each school has exactly **one current academic year** (`is_current = true`).

**Table:** `academic_years`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `name` | VARCHAR | Display name, e.g., `2024–2025` |
| `start_date` | DATE | Year start |
| `end_date` | DATE | Year end |
| `is_current` | BOOLEAN | Only one per school can be `true` |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

When a new academic year is set as current, the previous one's `is_current` is automatically set to `false` via the model's `saving` event.

---

## Classes

Classes represent grade levels (e.g., Grade 1, Class 10, Form 3). The `numeric_name` field enables correct numeric sorting so "Class 2" sorts before "Class 10".

**Table:** `school_classes`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `name` | VARCHAR | Display name, e.g., `Class 5` |
| `numeric_name` | INT | Numeric value for sorting (e.g., `5`) |
| `description` | TEXT | Optional description |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

> Always use `orderBy('numeric_name')` when fetching classes for display. Do not rely on alphabetical sort of `name`.

---

## Sections

Sections subdivide a class (e.g., Class 5-A, Class 5-B). A section belongs to exactly one class.

**Table:** `sections`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `class_id` | BIGINT | FK to `school_classes` |
| `name` | VARCHAR | Section name, e.g., `A`, `Blue`, `Morning` |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

**Relationships:**

```php
// SchoolClass model
public function sections(): HasMany
{
    return $this->hasMany(Section::class, 'class_id');
}

// Section model
public function schoolClass(): BelongsTo
{
    return $this->belongsTo(SchoolClass::class, 'class_id');
}
```

---

## Subjects

Subjects are assigned to specific classes. A subject taught in Class 5 is a distinct record from the same-named subject in Class 6.

**Table:** `subjects`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `class_id` | BIGINT | FK to `school_classes` |
| `name` | VARCHAR | Subject name, e.g., `Mathematics` |
| `code` | VARCHAR | Short code, e.g., `MATH5` |
| `description` | TEXT | Optional description |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## Shifts

Shifts define the school's daily operational periods (e.g., Morning, Afternoon, Evening). Students and staff can be assigned to a shift.

**Table:** `shifts`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `name` | VARCHAR | e.g., `Morning`, `Day`, `Evening` |
| `start_time` | TIME | Shift start time |
| `end_time` | TIME | Shift end time |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## Holidays

Holidays define non-working days for the school. They are used to skip days in attendance calculations and timetable scheduling.

**Table:** `holidays`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `title` | VARCHAR | Holiday name, e.g., `Eid al-Fitr` |
| `date` | DATE | Holiday date |
| `description` | TEXT | Optional description |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## UI Pages

| Page | Route | Roles |
|---|---|---|
| Academic Year Management | `/school/setup/academic-years` | school-admin |
| Class Management | `/school/setup/classes` | school-admin |
| Section Management | `/school/setup/sections` | school-admin |
| Subject Management | `/school/setup/subjects` | school-admin |
| Shift Management | `/school/setup/shifts` | school-admin |
| Holiday Management | `/school/setup/holidays` | school-admin, principal |
