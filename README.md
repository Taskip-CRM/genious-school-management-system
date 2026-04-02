# Genius School Management System

A comprehensive, open-source School Management System built with **Laravel 11 + Inertia.js + React (TypeScript)**.

## Links

| | |
|---|---|
| **Documentation** | https://genius-school-management-system.vercel.app/ |
| **Live Demo** | https://genius-school-ms.xgenious.com/ |
| **GitHub** | https://github.com/XgeniousLLC/genius-school-management-system |

## Tech Stack

- **Backend:** Laravel 11 (PHP 8.3)
- **Frontend:** React 18 + TypeScript + Inertia.js
- **UI:** shadcn/ui + Tailwind CSS
- **Database:** MySQL 8
- **Queue:** Redis + Laravel Horizon
- **Auth:** Laravel Sanctum + Spatie RBAC

## Modules

| Module | Status |
|---|---|
| Authentication & Access Control | Done |
| School Setup & Configuration | Done |
| Student Management | Done |
| Staff & HR Management | Done |
| Attendance Management | Done |
| Timetable & Scheduling | Done |
| Examination & Results | Done |
| Fee Management | Done |
| Library Management | Done |
| Inventory & Asset Management | Done |
| Transport Management | Done |
| Hostel Management | Done |
| Homework & Lesson Planning | Done |
| Communication | Done |
| Reports & Analytics | Done |
| System Administration | Done |
| Subscription & Package Management | Done |
| Admission Inquiry & Visitor Management | Done |

## Installation

See the [documentation](https://genius-school-management-system.vercel.app/) for full installation guides including VPS and shared hosting (cPanel) setup.

## Quick Start

```bash
git clone https://github.com/XgeniousLLC/genius-school-management-system.git
cd genius-school-management-system

composer install
npm install

cp .env.example .env
php artisan key:generate

# Configure your .env (DB, Redis, Mail, etc.)

php artisan migrate --seed
npm run build
php artisan serve
```

## License

Open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).
