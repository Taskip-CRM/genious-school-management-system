---
title: Student Portal
---

# Student Portal

The Student Portal is a self-service interface for enrolled students to view their own academic information. Students log in with their own credentials and can only access their own data.

---

## Route Structure

All student portal routes are grouped under `/school/student/*` with `role:student` middleware:

```php
Route::middleware(['auth', 'role:student'])->prefix('/school/student')->name('student.')->group(function () {
    Route::get('/dashboard', [StudentPortalController::class, 'dashboard'])->name('dashboard');
    Route::get('/timetable', [StudentPortalController::class, 'timetable'])->name('timetable');
    Route::get('/attendance', [StudentPortalController::class, 'attendance'])->name('attendance');
    Route::get('/results', [StudentPortalController::class, 'results'])->name('results');
    Route::get('/fees', [StudentPortalController::class, 'fees'])->name('fees');
    Route::get('/homework', [StudentPortalController::class, 'homework'])->name('homework');
    Route::get('/announcements', [StudentPortalController::class, 'announcements'])->name('announcements');
    Route::get('/online-classes', [StudentPortalController::class, 'onlineClasses'])->name('online-classes');
});
```

---

## Account Linking

The student portal requires the `students.user_id` column to be set. This links the authenticated `User` record to a `Student` record.

```php
// In StudentPortalController
$student = Student::where('user_id', auth()->id())->first();

if (!$student) {
    return Inertia::render('Student/NotLinked');
}
```

If `user_id` is `null` on the student's record, the portal shows an **"Account not linked"** screen with a message instructing the student to contact the school admin.

**To link a student to a user account:**

```php
// Via artisan tinker or a school admin UI action
Student::where('id', $studentId)->update(['user_id' => $userId]);
```

Or via the school admin: **Students → [student name] → Link User Account**

---

## Student Dashboard

**Route:** `GET /school/student/dashboard`

The dashboard shows a summary of the student's current status:

| Widget | Description |
|---|---|
| Today's Schedule | Current day's timetable slots |
| This Month's Attendance | Present/absent/late count for current month |
| Recent Results | Latest published exam results |
| Outstanding Fees | Unpaid or partial fee summary |
| Latest Announcements | Most recent 3 announcements (for students or all) |
| Active Homework | Homework due in the next 7 days |

---

## Timetable Page

**Route:** `GET /school/student/timetable`

Shows the student's weekly class schedule based on their `class_id` and `section_id`. The current day's schedule is highlighted.

Timetable slots are fetched using the student's class/section:

```php
$today = strtolower(now()->englishDayOfWeek);

$slots = TimetableSlot::with(['subject', 'staff'])
    ->where('class_id', $student->class_id)
    ->where('section_id', $student->section_id)
    ->where('day_of_week', $today)
    ->orderBy('start_time')
    ->get();
```

---

## Attendance Page

**Route:** `GET /school/student/attendance`

Displays the student's attendance history for the **last 6 months**.

The view includes:
- Monthly summary cards (present/absent/late/excused counts per month)
- Calendar view for the selected month (color-coded by status)
- Month navigation (go back up to 6 months)
- Overall attendance percentage

Query pattern (avoids accessing `school_id` via `class_id` on Attendance):

```php
$attendances = Attendance::where('attendable_type', Student::class)
    ->where('attendable_id', $student->id)
    ->where('date', '>=', now()->subMonths(6)->startOfMonth())
    ->orderBy('date')
    ->get();
```

---

## Results Page

**Route:** `GET /school/student/results`

Shows the student's exam results for all published exams. Only exams with `status = published` are shown.

Each result shows:
- Exam name, type, and date range
- Subject-wise marks, percentage, and grade
- Overall exam percentage and aggregate grade
- Pass/Fail status

---

## Fees Page

**Route:** `GET /school/student/fees`

Shows the student's complete fee history:

| Section | Description |
|---|---|
| Summary | Total due, total paid, outstanding balance |
| Monthly Breakdown | Table of all fee periods with status badges |
| Download Receipt | Button to download PDF receipt for paid months |

---

## Homework Page

**Route:** `GET /school/student/homework`

Lists all active homework (`is_active = true`) for the student's class and subjects. Sorted by due date (earliest first).

Each homework item shows:
- Title, subject, teacher name
- Due date with countdown ("Due in 2 days", "Overdue")
- Download attachment button (if file attached)
- Full instructions (expandable)

---

## Announcements Page

**Route:** `GET /school/student/announcements`

Shows all announcements where `audience IN ('all', 'students')` or where `audience = 'class'` and `class_id = $student->class_id`.

Pinned announcements appear at the top with amber highlighting.

---

## Online Classes Page

**Route:** `GET /school/student/online-classes`

Shows upcoming and recent online classes for the student's class and subjects. Includes join links for live sessions.
