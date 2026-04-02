---
title: Architecture
---

# Architecture

Genius SMS is built as a **Laravel monolith** with an **Inertia.js + React SPA** front end. This architecture gives the productivity of a traditional server-rendered application while delivering the user experience of a single-page application — without requiring a separate API server for the UI.

---

## Architecture Pattern

```
Browser  ──Inertia Request──▶  Laravel Routes
                                      │
                              Middleware Stack
                           (auth, role, school scope)
                                      │
                              Controller
                           (SchoolAdmin | SuperAdmin)
                                      │
                              Service Layer
                                      │
                              Eloquent Models
                           (auto-scoped by school_id)
                                      │
                                  MySQL 8
```

- **Page requests** travel through Inertia — the controller returns `Inertia::render('PageName', $props)` and the React component receives typed props directly
- **AJAX sub-requests** (live search, file uploads, status toggles) hit `/api/v1/` REST endpoints
- **Heavy operations** (PDF export, bulk import, email blasts) are dispatched to Redis queues managed by Laravel Horizon

---

## Directory Structure

```
genius-sms/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── SchoolAdmin/          # School-scoped controllers (all 19 modules)
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── StudentController.php
│   │   │   │   ├── AttendanceController.php
│   │   │   │   ├── ExamController.php
│   │   │   │   ├── FeeController.php
│   │   │   │   └── ...
│   │   │   ├── SuperAdmin/           # Platform-level controllers
│   │   │   │   ├── SchoolController.php
│   │   │   │   ├── PackageController.php
│   │   │   │   ├── SubscriptionController.php
│   │   │   │   └── PlatformSettingController.php
│   │   │   ├── Auth/                 # Authentication controllers
│   │   │   └── Api/                  # REST API controllers
│   │   │       └── V1/
│   │   ├── Middleware/
│   │   │   ├── EnsureSchoolAccess.php
│   │   │   └── SetSchoolContext.php
│   │   └── Requests/                 # Form request validation
│   ├── Models/
│   │   ├── School.php
│   │   ├── Student.php
│   │   ├── Staff.php
│   │   ├── Attendance.php            # Polymorphic (Student | Staff)
│   │   ├── Exam.php
│   │   ├── FeePayment.php
│   │   └── ...
│   ├── Services/                     # Business logic (not in controllers)
│   │   ├── AttendanceService.php
│   │   ├── FeeService.php
│   │   ├── GradeCalculationService.php
│   │   └── ...
│   ├── Jobs/                         # Queued jobs
│   │   ├── GeneratePdfReportJob.php
│   │   ├── SendEmailBlastJob.php
│   │   └── ProcessBulkImportJob.php
│   └── Traits/
│       └── BelongsToSchool.php       # Global school_id scope trait
├── resources/
│   └── js/
│       ├── Pages/
│       │   ├── Auth/                 # Login, password reset
│       │   ├── SchoolAdmin/          # School dashboard pages
│       │   │   ├── Dashboard/
│       │   │   ├── Students/
│       │   │   ├── Attendance/
│       │   │   ├── Exams/
│       │   │   ├── Fees/
│       │   │   └── ...
│       │   ├── SuperAdmin/           # Super admin pages
│       │   ├── Student/              # Student portal pages
│       │   └── Parent/               # Parent portal pages
│       ├── Components/               # Shared React components
│       │   ├── ui/                   # shadcn/ui base components
│       │   ├── DataTable.tsx
│       │   ├── PageHeader.tsx
│       │   └── ...
│       ├── Stores/                   # Zustand global state slices
│       │   ├── useAuthStore.ts
│       │   └── useNotificationStore.ts
│       ├── Types/                    # TypeScript type definitions
│       │   ├── student.ts
│       │   ├── attendance.ts
│       │   ├── exam.ts
│       │   └── ...
│       ├── Layouts/
│       │   ├── SchoolAdminLayout.tsx
│       │   ├── SuperAdminLayout.tsx
│       │   ├── StudentLayout.tsx
│       │   └── ParentLayout.tsx
│       └── app.tsx                   # Inertia root
├── routes/
│   ├── web.php                       # All Inertia page routes
│   ├── api.php                       # REST API routes (/api/v1/)
│   └── auth.php                      # Auth routes
├── database/
│   ├── migrations/                   # All schema migrations
│   └── seeders/                      # Demo data seeders
├── config/
│   └── horizon.php                   # Queue worker configuration
└── requirements/                     # SRS module specifications
    └── modules/
```

---

## Multi-Tenancy

Multi-tenancy is implemented at the **model scope level** — not at the database level. Every tenant (school) shares the same database but all data is isolated by `school_id`.

### How It Works

**1. Every major table has a `school_id` column:**

```sql
ALTER TABLE students ADD COLUMN school_id BIGINT UNSIGNED NOT NULL;
ALTER TABLE students ADD INDEX idx_students_school_id (school_id);
ALTER TABLE students ADD FOREIGN KEY (school_id) REFERENCES schools(id);
```

**2. The `BelongsToSchool` trait is applied to every school-scoped model:**

```php
// app/Traits/BelongsToSchool.php
trait BelongsToSchool
{
    protected static function bootBelongsToSchool(): void
    {
        static::addGlobalScope('school', function (Builder $builder) {
            if ($schoolId = static::getCurrentSchoolId()) {
                $builder->where(
                    (new static)->getTable() . '.school_id',
                    $schoolId
                );
            }
        });

        static::creating(function ($model) {
            if (!$model->school_id) {
                $model->school_id = static::getCurrentSchoolId();
            }
        });
    }

    protected static function getCurrentSchoolId(): ?int
    {
        return session('school_id') ?? auth()->user()?->school_id;
    }
}
```

**3. Every school-scoped model uses the trait:**

```php
class Student extends Model
{
    use SoftDeletes, BelongsToSchool;
    // ...
}
```

**4. The `SetSchoolContext` middleware resolves the school from the route and stores it in the session:**

```php
class SetSchoolContext
{
    public function handle($request, Closure $next)
    {
        // Resolve school from subdomain or path prefix
        $school = School::where('slug', $request->route('school'))->firstOrFail();
        session(['school_id' => $school->id]);
        return $next($request);
    }
}
```

---

## Authentication

Authentication is handled by **Laravel Sanctum** (session-based for the web UI, token-based for the REST API).

- Web sessions use encrypted cookies
- The `LoginController` authenticates the user then redirects to the appropriate dashboard based on their primary role
- Route access is controlled by Spatie's `role:rolename` middleware

```php
// Routes protected by role
Route::middleware(['auth', 'role:school-admin|principal'])->group(function () {
    Route::get('/school/staff', [StaffController::class, 'index']);
});
```

---

## Queue Architecture

All slow or asynchronous operations are dispatched to queues:

| Operation | Queue | Driver |
|---|---|---|
| PDF report generation | `reports` | Redis |
| Bulk CSV/Excel import | `imports` | Redis |
| Email blast to parents | `notifications` | Redis |
| SMS blast | `notifications` | Redis |
| Payroll calculation | `payroll` | Redis |

**Laravel Horizon** monitors and manages all queue workers with a web UI at `/horizon` (super admin access only).

```php
// Example: Dispatch a PDF generation job
GenerateStudentReportJob::dispatch($studentId, $reportType)
    ->onQueue('reports');
```

---

## File Storage

Files are stored using **Laravel Storage** with the `public` disk by default. S3/MinIO is supported for production.

| File Type | Disk | Path |
|---|---|---|
| Student photos | `public` | `students/photos/` |
| Staff photos | `public` | `staff/photos/` |
| Student documents | `public` | `students/documents/` |
| Fee receipts (PDF) | `public` | `fees/receipts/` |
| Platform logo | `public` | `platform/` |
| Platform favicon | `public` | `platform/` |
| Library book covers | `public` | `library/covers/` |

> Run `php artisan storage:link` to create the symlink from `public/storage` to `storage/app/public` so uploaded files are web-accessible.

---

## Frontend Architecture

### Inertia.js Bridge

Inertia.js eliminates the need for a separate REST API for page rendering. Controllers return Inertia responses:

```php
return Inertia::render('SchoolAdmin/Students/Index', [
    'students' => StudentResource::collection($students),
    'classes'  => ClassResource::collection($classes),
    'filters'  => $request->only(['search', 'class_id', 'status']),
]);
```

The React component receives `students`, `classes`, and `filters` as typed props:

```tsx
interface Props {
    students: PaginatedResponse<Student>;
    classes: SchoolClass[];
    filters: { search?: string; class_id?: number; status?: string };
}

export default function StudentsIndex({ students, classes, filters }: Props) {
    // ...
}
```

### State Management

| State Type | Where It Lives |
|---|---|
| Page data (students list, etc.) | Inertia props — not in Zustand |
| Current authenticated user | Zustand `useAuthStore` |
| Unread notification count | Zustand `useNotificationStore` |
| Local form state | React `useState` |
| Form data | `react-hook-form` |

### Component Library

All UI is built on **shadcn/ui** components (Radix UI primitives + Tailwind CSS). Custom components extend shadcn, never replace it.

```tsx
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { DataTable } from "@/Components/DataTable";
```
