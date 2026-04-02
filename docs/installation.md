---
title: Installation
---

# Installation Guide

This guide walks you through setting up Genius SMS on a local development machine or a production server from scratch.

---

## Prerequisites

Before you begin, ensure the following software is installed on your system:

| Requirement | Version | Notes |
|---|---|---|
| PHP | 8.3+ | With extensions: `mbstring`, `xml`, `curl`, `zip`, `bcmath`, `pdo_mysql`, `redis`, `gd` |
| Composer | 2.x | PHP dependency manager |
| Node.js | 18.x or 20.x | JavaScript runtime |
| npm | 9.x+ | Comes bundled with Node.js |
| MySQL | 8.0+ | Primary database |
| Redis | 6.x or 7.x | Required for queues and caching |
| Git | 2.x+ | Version control |

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/xgenious/genius-sms.git
cd genius-sms
```

---

## Step 2: Install PHP Dependencies

```bash
composer install
```

For production environments, use the optimized install:

```bash
composer install --no-dev --optimize-autoloader
```

---

## Step 3: Install JavaScript Dependencies

```bash
npm install
```

---

## Step 4: Configure Environment

Copy the example environment file and open it for editing:

```bash
cp .env.example .env
```

Edit `.env` and configure the following key variables:

| Variable | Example | Description |
|---|---|---|
| `APP_NAME` | `Genius SMS` | Application display name |
| `APP_ENV` | `local` | `local`, `staging`, or `production` |
| `APP_KEY` | *(generated)* | Laravel encryption key — generate in Step 5 |
| `APP_URL` | `http://localhost` | Base URL of the application |
| `APP_DEBUG` | `true` | Set to `false` in production |
| `DB_CONNECTION` | `mysql` | Database driver |
| `DB_HOST` | `127.0.0.1` | Database host |
| `DB_PORT` | `3306` | Database port |
| `DB_DATABASE` | `genius_sms` | Database name |
| `DB_USERNAME` | `root` | Database username |
| `DB_PASSWORD` | `secret` | Database password |
| `REDIS_HOST` | `127.0.0.1` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `CACHE_DRIVER` | `redis` | Cache driver |
| `QUEUE_CONNECTION` | `redis` | Queue driver (must be `redis` for Horizon) |
| `SESSION_DRIVER` | `database` | Session storage |
| `MAIL_MAILER` | `smtp` | Mail driver |
| `MAIL_HOST` | `smtp.mailtrap.io` | SMTP server host |
| `MAIL_PORT` | `2525` | SMTP port |
| `MAIL_USERNAME` | *(your value)* | SMTP username |
| `MAIL_PASSWORD` | *(your value)* | SMTP password |
| `MAIL_FROM_ADDRESS` | `noreply@school.com` | From email address |
| `MAIL_FROM_NAME` | `Genius SMS` | From name |
| `STRIPE_KEY` | `pk_test_...` | Stripe publishable key (for subscriptions) |
| `STRIPE_SECRET` | `sk_test_...` | Stripe secret key |
| `VONAGE_API_KEY` | `abc123` | Vonage SMS API key |
| `VONAGE_API_SECRET` | `secret` | Vonage SMS API secret |
| `AWS_ACCESS_KEY_ID` | *(your value)* | S3/MinIO access key |
| `AWS_SECRET_ACCESS_KEY` | *(your value)* | S3/MinIO secret key |
| `AWS_DEFAULT_REGION` | `us-east-1` | S3 region |
| `AWS_BUCKET` | `genius-sms` | S3 bucket name |
| `AWS_ENDPOINT` | `http://localhost:9000` | MinIO endpoint (omit for real S3) |
| `MULTITENANCY_MODE` | `path` | Tenant routing: `subdomain` or `path` |
| `SUPER_ADMIN_EMAIL` | `admin@xgenious.com` | First super admin email |

---

## Step 5: Generate Application Key

```bash
php artisan key:generate
```

This writes a secure random key to `APP_KEY` in your `.env` file.

---

## Step 6: Create the Database

Create a MySQL database matching the `DB_DATABASE` value in your `.env`:

```sql
CREATE DATABASE genius_sms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## Step 7: Run Migrations

```bash
php artisan migrate
```

This creates all database tables in the correct order with foreign key constraints.

---

## Step 8: Seed the Database

Run all seeders to populate demo data, roles, permissions, and a super admin account:

```bash
php artisan db:seed
```

The seeders run in this order:

| Order | Seeder | Description |
|---|---|---|
| 1 | `RolesAndPermissionsSeeder` | Creates all 9 roles and their permissions |
| 2 | `SuperAdminSeeder` | Creates the default super admin user |
| 3 | `SchoolSeeder` | Creates 2 demo schools |
| 4 | `PlatformSettingSeeder` | Sets default platform settings |
| 5 | `SchoolSettingSeeder` | Sets default school-level settings |
| 6 | `PackageSeeder` | Creates demo subscription packages |
| 7 | `SchoolSetupSeeder` | Creates demo classes, sections, subjects, shifts |
| 8 | `AcademicYearSeeder` | Creates current academic year |
| 9 | `StaffSeeder` | Creates demo staff members |
| 10 | `StudentSeeder` | Creates demo students with guardians |
| 11 | `DemoUserSeeder` | Creates login accounts for all demo users and links them to student/guardian records |

> The `DemoUserSeeder` is critical for the student and parent portals to work correctly. It sets `user_id` on `students` and `guardians` tables so portal logins resolve to the correct profile.

---

## Step 9: Link Storage

Make uploaded files publicly accessible:

```bash
php artisan storage:link
```

This creates a symbolic link from `public/storage` to `storage/app/public`.

---

## Step 10: Build Frontend Assets

**Development** (hot reload):

```bash
npm run dev
```

**Production** (minified build):

```bash
npm run build
```

---

## Step 11: Start the Queue Worker (Horizon)

Laravel Horizon manages the Redis-backed queue workers. Start it with:

```bash
php artisan horizon:start
```

For production, configure Supervisor to keep Horizon running (see [Deployment Guide](deployment.md)).

---

## Step 12: Start the Scheduler

In development, you can run scheduled tasks manually:

```bash
php artisan schedule:work
```

In production, add this cron entry (see [Deployment Guide](deployment.md)):

```
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

---

## Demo Accounts

After seeding, the following accounts are available for testing:

| Role | Email | Password | Dashboard URL |
|---|---|---|---|
| Super Admin | `superadmin@demo.com` | `password` | `/super-admin/dashboard` |
| School Admin | `admin@school1.com` | `password` | `/school/dashboard` |
| Principal | `principal@school1.com` | `password` | `/school/dashboard` |
| Teacher | `teacher@school1.com` | `password` | `/school/teacher/dashboard` |
| Accountant | `accountant@school1.com` | `password` | `/school/dashboard` |
| Student | `student@school1.com` | `password` | `/school/student/dashboard` |
| Parent | `parent@school1.com` | `password` | `/school/parent/dashboard` |

> Change all demo passwords before deploying to production.

---

## Verify Installation

Once everything is running, visit `http://localhost` (or your configured `APP_URL`) and:

1. You should see the login page
2. Log in with the super admin credentials
3. Navigate to **Super Admin → Schools** to confirm demo schools are listed
4. Log in as a school admin and verify the school dashboard loads

If you encounter any issues, check the [Troubleshooting](troubleshooting.md) guide.
