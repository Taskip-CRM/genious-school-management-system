---
title: Modules
---

# Modules

Genius SMS is composed of **19 integrated modules**, each covering a specific operational area of school management. All modules are built into the core application and controlled per-school via the **Module Manager** in the Super Admin panel.

---

## Module Status

| # | Module | Status | Sprint |
|---|---|---|---|
| 01 | [Authentication & Access Control](authentication.md) | Done | Sprint 1–2 |
| 02 | [School Setup & Configuration](school-setup.md) | Done | Sprint 3 |
| 03 | [Student Management](students.md) | Done | Sprint 4 |
| 04 | [Staff & HR Management](staff-hr.md) | Done | Sprint 5, 11 |
| 05 | [Attendance Management](attendance.md) | Done | Sprint 6 |
| 06 | [Timetable & Scheduling](timetable.md) | Done | Sprint 7 |
| 07 | [Examination & Results](examinations.md) | Done | Sprint 8 |
| 08 | [Fee Management](fees.md) | Done | Sprint 9–10 |
| 09 | [Library Management](library.md) | Done | Sprint 12 |
| 10 | [Transport Management](transport.md) | Done | Sprint 13 |
| 11 | [Hostel Management](hostel.md) | Done | Sprint 13B |
| 12 | [Homework & Lesson Planning](homework.md) | Done | Sprint 14 |
| 13 | [Communication](communication.md) | Done | Sprint 15 |
| 14 | [Reports & Analytics](reports.md) | Done | Sprint 16 |
| 15 | [System Administration](system-admin.md) | Done | Sprint 17 |
| 16 | [Admission Inquiry & Visitors](admissions.md) | Done | Sprint 4B |
| 17 | [Hostel Management](hostel.md) | Done | Sprint 13B |
| 18 | Inventory & Asset Management | Done | Sprint 12B |
| 19 | [Subscription & Package Management](subscriptions.md) | Done | Sprint 17B |

---

## Module Architecture

Every module follows a consistent structure:

```
app/Http/Controllers/SchoolAdmin/
    ├── {Module}Controller.php       # Inertia page responses
    └── Api/V1/{Module}Controller.php  # REST API (optional)

app/Models/
    └── {Model}.php                  # Eloquent model with BelongsToSchool trait

app/Services/
    └── {Module}Service.php          # Business logic

app/Http/Requests/
    └── {Module}/
        ├── Store{Module}Request.php
        └── Update{Module}Request.php

resources/js/Pages/SchoolAdmin/{Module}/
    ├── Index.tsx                    # List/table page
    ├── Create.tsx                   # Create form page
    ├── Edit.tsx                     # Edit form page
    └── Show.tsx                     # Detail view page

resources/js/Types/
    └── {module}.ts                  # TypeScript types for Inertia props
```

---

## Module Manager

Super admins can enable or disable individual modules per school. When a module is disabled:

- Its navigation links are hidden from that school's layout
- Route access returns a 403 if the school's subscription doesn't include the module
- The module's data remains intact and can be re-enabled

Access Module Manager at: **Super Admin → Module Manager**
