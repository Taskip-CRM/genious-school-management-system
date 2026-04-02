---
title: Home
---

# Genius School Management System

Welcome to the official documentation for **Genius SMS** — a modern, full-featured School Management System built for schools, colleges, and educational institutions of all sizes.

---

## What is Genius SMS?

Genius SMS is an open-source **School Management System** built on a modern monolithic SPA architecture using **Laravel 11**, **Inertia.js**, and **React 18**. It is designed to be SaaS-ready with multi-tenancy at its core, allowing a single installation to serve multiple schools simultaneously.

The system covers every aspect of school operations — from student admissions and attendance tracking to fee collection, library management, transportation, and parent communication — all in one unified platform.

---

## Key Features

- **19+ integrated modules** covering every operational area of a school
- **Multi-tenancy** — each school gets its own isolated data environment
- **Role-Based Access Control** — 9 distinct roles with granular permissions via Spatie
- **SaaS-ready** — subscription packages, coupons, and module manager for per-school feature control
- **Student & Parent Portals** — dedicated self-service dashboards
- **Polymorphic Attendance** — unified attendance for both students and staff
- **Examination & Grade Engine** — auto-calculated grades with result publishing
- **Fee Management** — structured fee categories, monthly billing, partial payment tracking
- **Communication Hub** — announcements, internal messaging, SMS/email blasts (queued)
- **Reports & Analytics** — KPI dashboards with Recharts visualizations
- **Dark mode** support via Tailwind CSS
- **Queue-based** heavy operations (PDF export, bulk import, email blasts) via Laravel Horizon

---

## Quick Links

| Section | Description |
|---|---|
| [Installation](installation.md) | Get the system running locally or on a server |
| [Architecture](architecture.md) | Understand the technical structure |
| [User Roles](roles.md) | Learn about the 9 roles and their permissions |
| [Modules](modules/) | Detailed documentation for all 19 modules |
| [API Reference](api.md) | REST API endpoints under `/api/v1/` |
| [Configuration](configuration.md) | Environment variables and settings |
| [Deployment](deployment.md) | Production deployment guide |
| [Troubleshooting](troubleshooting.md) | Known issues and fixes |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Backend Framework | Laravel | 11 |
| Server Language | PHP | 8.3 |
| Frontend Framework | React | 18 |
| TypeScript | TypeScript | 5.x |
| SPA Bridge | Inertia.js | latest |
| State Management | Zustand | latest |
| UI Components | shadcn/ui | latest |
| CSS Framework | Tailwind CSS | 3.x |
| Database | MySQL | 8 |
| Cache & Queue | Redis + Laravel Horizon | latest |
| Authentication | Laravel Sanctum | latest |
| Roles & Permissions | Spatie laravel-permission | latest |
| Audit Logging | Spatie laravel-activitylog | latest |
| PDF Generation | barryvdh/laravel-dompdf | latest |
| Excel Import/Export | maatwebsite/laravel-excel | latest |
| Charts | Recharts | latest |
| Forms & Validation | react-hook-form + Zod | latest |
| Data Tables | TanStack React Table | latest |
| Drag & Drop | react-dnd | latest |

---

## System Requirements

| Requirement | Minimum | Recommended |
|---|---|---|
| PHP | 8.2 | 8.3 |
| Composer | 2.x | 2.x |
| Node.js | 18.x | 20.x |
| npm / pnpm | 9.x | latest |
| MySQL | 8.0 | 8.0+ |
| Redis | 6.x | 7.x |
| Web Server | Nginx / Apache | Nginx |
| OS | Ubuntu 20.04+ | Ubuntu 22.04 / 24.04 |
| RAM | 2 GB | 4 GB+ |
| Disk | 5 GB | 20 GB+ |

---

## Module Overview

| # | Module | Description |
|---|---|---|
| 01 | Authentication & Access Control | Login, roles, permissions, session management |
| 02 | School Setup & Configuration | Classes, sections, subjects, shifts, holidays, academic years |
| 03 | Student Management | Student CRUD, guardian linking, documents, admission numbers |
| 04 | Staff & HR Management | Staff, departments, designations, leaves, payroll |
| 05 | Attendance Management | Polymorphic attendance for students and staff |
| 06 | Timetable & Scheduling | Class schedules, room assignments, day-based slots |
| 07 | Examination & Results | Exams, marks, grade auto-calculation, result publishing |
| 08 | Fee Management | Fee categories, structures, monthly billing, payment tracking |
| 09 | Library Management | Books, issues, returns, fine calculation |
| 10 | Transport Management | Vehicles, routes, stops, student assignments |
| 11 | Hostel Management | Blocks, rooms, student allocations |
| 12 | Homework & Lesson Planning | Homework, lesson plans, syllabi, online classes |
| 13 | Communication | Announcements, messages, SMS/email blasts, notifications |
| 14 | Reports & Analytics | KPI dashboards, attendance reports, finance reports, audit log |
| 15 | System Administration | Platform settings, school settings, favicon/logo, maintenance |
| 16 | Admission Inquiry & Visitors | Inquiry workflow, followups, visitor logs, public form |
| 17 | Hostel Management | Blocks, rooms, warden access |
| 18 | Inventory & Asset Management | Asset tracking, categories, assignments |
| 19 | Subscription & Package Management | SaaS packages, school subscriptions, coupons, module manager |

---

## License

Genius SMS is released as **free and open source software**. See the `LICENSE` file in the repository root for full license terms.
