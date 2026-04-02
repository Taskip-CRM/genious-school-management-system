---
title: Parent Portal
---

# Parent Portal

The Parent Portal gives parents (guardians) a window into their children's academic life. Parents can monitor attendance, view results, check fee status, and read school announcements.

---

## Route Structure

All parent portal routes are grouped under `/school/parent/*` with `role:parent` middleware:

```php
Route::middleware(['auth', 'role:parent'])->prefix('/school/parent')->name('parent.')->group(function () {
    Route::get('/dashboard', [ParentPortalController::class, 'dashboard'])->name('dashboard');
    Route::get('/attendance', [ParentPortalController::class, 'attendance'])->name('attendance');
    Route::get('/results', [ParentPortalController::class, 'results'])->name('results');
    Route::get('/fees', [ParentPortalController::class, 'fees'])->name('fees');
    Route::get('/announcements', [ParentPortalController::class, 'announcements'])->name('announcements');
});
```

---

## Account Linking

The parent portal requires the `guardians.user_id` column to be set. This links the authenticated `User` record to a `Guardian` record.

```php
// In ParentPortalController
$guardian = Guardian::where('user_id', auth()->id())
    ->with('students')
    ->first();

if (!$guardian) {
    return Inertia::render('Parent/NotLinked');
}

$children = $guardian->students; // Multiple students possible
```

If `user_id` is `null`, the portal shows a **"Account not linked"** screen.

**To link a guardian to a user account:**

```php
Guardian::where('id', $guardianId)->update(['user_id' => $userId]);
```

---

## Multiple Children Support

A single parent account can be linked to one `Guardian` record, which in turn can be associated with multiple students via the `guardian_student` pivot table.

All portal pages support multiple children:

```php
// Get all children for the logged-in parent
$children = $guardian->students()
    ->with(['schoolClass', 'section'])
    ->where('status', 'active')
    ->get();
```

Pages use a **child selector** (tab or dropdown) to switch between children when more than one is linked.

---

## Parent Dashboard

**Route:** `GET /school/parent/dashboard`

The dashboard shows an overview card for each linked child:

| Widget | Per Child |
|---|---|
| Class & Section | Current enrollment details |
| Attendance (This Month) | Quick present/absent summary |
| Latest Result | Most recent published exam result |
| Fee Status | Outstanding balance |
| Attendance Alert | Warning if attendance drops below threshold |

---

## Attendance Page

**Route:** `GET /school/parent/attendance`

Shows each child's attendance history for the **last 3 months**.

For each child:
- Monthly summary (present/absent/late counts)
- Calendar view for the selected month
- Attendance percentage indicator

```php
foreach ($children as $child) {
    $attendances = Attendance::where('attendable_type', Student::class)
        ->where('attendable_id', $child->id)
        ->where('date', '>=', now()->subMonths(3)->startOfMonth())
        ->orderBy('date')
        ->get();
}
```

---

## Results Page

**Route:** `GET /school/parent/results`

Shows exam results for each linked child (published exams only).

For each child, displays:
- List of published exams with subject-wise marks
- Grade summary per exam
- Overall performance trend

---

## Fee Status Page

**Route:** `GET /school/parent/fees`

Shows the fee payment status for each child:

| Column | Description |
|---|---|
| Period | `month_year` displayed as `November 2024` |
| Fee Type | Category name |
| Amount Due | Total amount owed |
| Amount Paid | Amount received |
| Outstanding | `amount_due - amount_paid` |
| Status | `paid` / `partial` / `unpaid` / `overdue` badge |
| Due Date | Payment deadline |

Parents can download payment receipts for paid fee records.

---

## Announcements Page

**Route:** `GET /school/parent/announcements`

Shows all announcements where `audience IN ('all', 'parents')`.

Pinned announcements appear at the top with amber highlighting.

---

## Security Constraints

- Parents can only view data for children linked to their guardian record
- Cross-child data access is prevented by always scoping queries to `$guardian->students()->pluck('id')`
- Parents cannot edit any data — all views are read-only
- The parent role has no write permissions in the permission seeder
