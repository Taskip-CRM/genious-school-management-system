---
title: Timetable
---

# Timetable & Scheduling

The Timetable module allows school admins and principals to build weekly class schedules by assigning subjects, teachers, and rooms to specific time slots for each class and section.

---

## Timetable Slot Model

**Table:** `timetable_slots`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `class_id` | BIGINT | FK to `school_classes` |
| `section_id` | BIGINT | FK to `sections` |
| `subject_id` | BIGINT | FK to `subjects` |
| `staff_id` | BIGINT NULL | FK to `staff` — assigned teacher |
| `shift_id` | BIGINT NULL | FK to `shifts` |
| `day_of_week` | VARCHAR | Lowercase day name: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday` |
| `start_time` | TIME | Slot start time, e.g., `08:00:00` |
| `end_time` | TIME | Slot end time, e.g., `08:45:00` |
| `room` | VARCHAR NULL | Room number or name |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

> The `day_of_week` column always stores **lowercase** day names: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`. Always use lowercase when inserting or querying.

---

## Building a Timetable

The timetable builder is a drag-and-drop interface built with `react-dnd`. The grid shows:

- **Rows:** Time slots for the day
- **Columns:** Days of the week (Mon–Fri, or Mon–Sat for 6-day schools)

Drag a subject card from the sidebar into a grid cell to assign it. Each cell accepts:
- Subject
- Teacher (from staff assigned to that subject)
- Room (optional)

**Timetable builder route:** `/school/timetable/builder?class_id=3&section_id=5`

---

## Timetable Conflict Detection

Before saving a slot, the system checks for:

1. **Teacher conflict** — same teacher assigned to two different classes at the same day/time
2. **Room conflict** — same room assigned to two different classes at the same day/time
3. **Class conflict** — same class/section already has a slot at that day/time

Conflicts are returned as validation errors and the slot is not saved until resolved.

---

## Viewing the Timetable

### School Admin / Principal View

A full weekly grid for any class/section:

```
GET /school/timetable?class_id=3&section_id=5
```

### Teacher View

A personal timetable showing only the slots where the logged-in teacher is assigned:

```
GET /school/teacher/timetable
```

### Student Portal View

Students see today's schedule prominently on their dashboard and can navigate to a full weekly view:

```
GET /school/student/timetable
```

Today's schedule is determined by matching `day_of_week` to `strtolower(now()->englishDayOfWeek)`.

---

## API for Mobile/AJAX

```
GET /api/v1/timetable?class_id=3&section_id=5&day=monday
```

Returns all slots for the given class, section, and day, with subject and teacher details.

---

## Querying Today's Timetable

```php
$today = strtolower(now()->englishDayOfWeek); // e.g., "monday"

$slots = TimetableSlot::with(['subject', 'staff', 'schoolClass', 'section'])
    ->where('class_id', $student->class_id)
    ->where('section_id', $student->section_id)
    ->where('day_of_week', $today)
    ->orderBy('start_time')
    ->get();
```

---

## Print View

A printer-friendly weekly timetable grid is available at:

```
GET /school/timetable/print?class_id=3&section_id=5
```

This renders a PDF-ready layout that can be printed or saved as PDF from the browser.
