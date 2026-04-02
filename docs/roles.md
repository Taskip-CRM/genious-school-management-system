---
title: User Roles
---

# User Roles & Permissions

Genius SMS uses **Spatie laravel-permission** to implement role-based access control. There are **9 distinct roles**, each tailored to a specific function within the school or the platform.

---

## Role Overview

| Role | Scope | Primary Purpose |
|---|---|---|
| `super-admin` | Platform-wide | Manages all schools, subscriptions, and platform settings |
| `school-admin` | School | Full administrative control over a single school |
| `principal` | School | Academic leadership, staff and student oversight |
| `teacher` | School | Teaching activities, attendance, homework, grades |
| `accountant` | School | Financial operations, fee collection, payroll |
| `librarian` | School | Library book and issue management |
| `receptionist` | School | Admissions, inquiries, visitor management |
| `student` | School | Self-service portal (own data only) |
| `parent` | School | Children's academic and financial status |

---

## Super Admin

**Slug:** `super-admin`

The super admin is a platform-level role, not bound to any specific school. This role has access to all schools' data and all platform management features.

| Feature Area | Access |
|---|---|
| Schools Management | Create, view, edit, delete all schools |
| Subscription Packages | Create and manage pricing packages |
| School Subscriptions | Assign packages to schools, view billing history |
| Coupons | Create discount coupons for subscriptions |
| Module Manager | Enable or disable individual modules per school |
| Platform Settings | General settings, Stripe/payment config, SMTP, storage limits, localization |
| Platform Branding | Upload platform logo and favicon |
| Super Admin Dashboard | 12 KPI cards: total schools, active subscriptions, revenue, etc. |
| Audit Log | View all platform-level activity |
| Horizon Dashboard | Monitor queue workers |

**Dashboard URL:** `/super-admin/dashboard`

---

## School Admin

**Slug:** `school-admin`

The school admin has complete control over a single school's operations. They can manage staff, students, settings, and all academic and financial data for their school.

| Feature Area | Access |
|---|---|
| School Dashboard | KPI overview, charts |
| School Settings | General, branding (logo/favicon), academic year, notification templates |
| Staff Management | Full CRUD for all staff |
| Student Management | Full CRUD for all students, guardian linking |
| Attendance | View and edit all attendance records |
| Timetable | Create and manage timetable slots |
| Examinations | Create exams, enter marks, publish results |
| Fee Management | Fee categories, structures, record payments |
| Library | Books, book issues, fine management |
| Transport | Vehicles, routes, student assignments |
| Hostel | Blocks, rooms, student allocations |
| Homework | Assign and review homework |
| Communication | Announcements, messages, SMS/email blasts |
| Reports | All school-level reports |
| HR: Leaves | Approve or reject leave requests |
| HR: Payroll | Generate and manage payroll |

**Dashboard URL:** `/school/dashboard`

---

## Principal

**Slug:** `principal`

The principal focuses on academic leadership. They have broad read and write access to academic features but do not manage financial data (fees, payroll).

| Feature Area | Access |
|---|---|
| Academic Dashboard | KPI overview for academic performance |
| Staff Management | View all staff, approve leave requests |
| Student Management | View and update student records |
| Attendance | View and mark attendance for students and staff |
| Timetable | View and create timetable |
| Examinations | Create exams, enter marks, approve results |
| Homework | View all homework assignments |
| Communication | Post announcements, send messages |
| Reports | Attendance and academic reports |

**Dashboard URL:** `/school/dashboard`

---

## Teacher

**Slug:** `teacher`

Teachers interact with their assigned classes, subjects, and students. Their access is narrowed to the classes and subjects they teach.

| Feature Area | Access |
|---|---|
| Teacher Dashboard | Today's timetable, assigned classes |
| Attendance | Mark attendance for their assigned classes |
| Timetable | View their own teaching schedule |
| Examinations | Enter marks for their subjects |
| Homework | Create and manage homework for their subjects |
| Lesson Plans | Create and update lesson plans |
| Syllabus | Manage syllabus progress |
| Online Classes | Create and manage video class links |
| Students | Read-only view of students in their classes |
| Announcements | Read all, post to their class |

**Dashboard URL:** `/school/dashboard`

---

## Accountant

**Slug:** `accountant`

The accountant manages all financial operations of the school.

| Feature Area | Access |
|---|---|
| Finance Dashboard | Revenue overview, collection statistics |
| Fee Categories | Create and manage fee categories |
| Fee Structures | Assign fee structures to classes |
| Fee Payments | Record and manage student fee payments |
| Payroll | Generate monthly payroll, approve salary disbursements |
| Finance Reports | Revenue reports, outstanding fee reports |
| Students | Read-only (for fee lookup) |
| Staff | Read-only (for payroll) |

**Dashboard URL:** `/school/dashboard`

---

## Librarian

**Slug:** `librarian`

The librarian manages the school's book inventory and circulation.

| Feature Area | Access |
|---|---|
| Library Dashboard | Books available, overdue issues |
| Books | Full CRUD for book records (title, ISBN, author, category, copies) |
| Book Categories | Manage book categories |
| Book Issues | Issue books to students/staff, record returns |
| Fine Management | Calculate and collect overdue fines |
| Students | Read-only (for book issue lookup) |

**Dashboard URL:** `/school/dashboard`

---

## Receptionist

**Slug:** `receptionist`

The receptionist handles front-desk operations, including new admissions intake and visitor management.

| Feature Area | Access |
|---|---|
| Admission Inquiries | View, create, update inquiries; manage status workflow |
| Inquiry Followups | Log follow-up notes with timestamps |
| Visitor Logs | Record visitor check-in and check-out |
| Students | Read-only |

**Dashboard URL:** `/school/dashboard`

---

## Student

**Slug:** `student`

Students access their own self-service portal. They can only view data that belongs to them.

| Feature Area | Access |
|---|---|
| Student Dashboard | Upcoming schedule, recent attendance, fee summary |
| Timetable | Today's and weekly schedule |
| Attendance | Personal attendance history (last 6 months) |
| Examination Results | Results by exam, grade summaries |
| Fee Status | Outstanding and paid fees |
| Homework | Assigned homework for their class/subjects |
| Announcements | School announcements targeted at students or all |

**Dashboard URL:** `/school/student/dashboard`

**Linking Requirement:** The student's `user_id` column must be set to their user account ID. If it is `null`, the portal displays an "Account not linked" screen with instructions for the school admin.

---

## Parent

**Slug:** `parent`

Parents (guardians) access a portal to monitor their children's academic progress and fees. A single parent account can be linked to multiple children.

| Feature Area | Access |
|---|---|
| Parent Dashboard | Summary for all linked children |
| Attendance | Children's attendance for the last 3 months |
| Examination Results | Children's latest results |
| Fee Status | Outstanding fees for each child |
| Announcements | School announcements targeted at parents or all |

**Dashboard URL:** `/school/parent/dashboard`

**Linking Requirement:** The guardian's `user_id` column must be set to their user account ID. One `User` can be linked to one `Guardian` record, which may reference multiple students.

---

## Role Hierarchy Summary

```
super-admin
    └── (platform-wide — not in school hierarchy)

school-admin
    └── principal
            ├── teacher
            ├── accountant
            ├── librarian
            └── receptionist

student (self-service portal)
parent  (self-service portal)
```

---

## Applying Role Middleware

In `routes/web.php`, protect routes using Spatie's `role` middleware:

```php
// Single role
Route::middleware(['auth', 'role:school-admin'])->group(function () {
    Route::resource('/school/staff', StaffController::class);
});

// Multiple allowed roles (pipe-separated)
Route::middleware(['auth', 'role:school-admin|principal'])->group(function () {
    Route::get('/school/attendance', [AttendanceController::class, 'index']);
});

// Student portal
Route::middleware(['auth', 'role:student'])->prefix('/school/student')->group(function () {
    Route::get('/dashboard', [StudentPortalController::class, 'dashboard']);
});

// Parent portal
Route::middleware(['auth', 'role:parent'])->prefix('/school/parent')->group(function () {
    Route::get('/dashboard', [ParentPortalController::class, 'dashboard']);
});
```

> The base `Controller` class does **not** include the `AuthorizesRequests` trait. Use `abort_if($model->school_id !== $this->getSchoolId(), 403)` for manual authorization checks instead of `$this->authorize()`.
