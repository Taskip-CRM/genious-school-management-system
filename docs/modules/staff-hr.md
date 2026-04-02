---
title: Staff & HR
---

# Staff & HR Management

The Staff & HR module manages all human resource operations for school staff — from basic staff profiles and department organization through leave management and payroll processing.

---

## Staff Model

**Table:** `staff`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `user_id` | BIGINT NULL | FK to `users` — links to login account |
| `employee_id` | VARCHAR | Unique staff/employee ID per school |
| `first_name` | VARCHAR | |
| `last_name` | VARCHAR | |
| `email` | VARCHAR | Work email |
| `phone` | VARCHAR | Contact number |
| `gender` | ENUM | `male`, `female`, `other` |
| `date_of_birth` | DATE | |
| `join_date` | DATE | Employment start date |
| `department_id` | BIGINT | FK to `departments` |
| `designation_id` | BIGINT | FK to `designations` |
| `qualification` | VARCHAR | Highest qualification |
| `experience` | INT | Years of experience |
| `salary` | DECIMAL | Basic salary amount |
| `photo` | VARCHAR | Storage path for profile photo |
| `address` | TEXT | Home address |
| `status` | ENUM | `active`, `inactive`, `terminated` |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## Departments

Departments organize staff by functional area.

**Table:** `departments`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `name` | VARCHAR | e.g., `Science`, `Mathematics`, `Administration` |
| `description` | TEXT | Optional |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## Designations

Designations define job titles within departments.

**Table:** `designations`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `name` | VARCHAR | e.g., `Head Teacher`, `Lab Assistant`, `Clerk` |
| `description` | TEXT | Optional |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## Leave Management

### Leave Types

Leave types are configurable per school (Annual Leave, Sick Leave, Maternity Leave, etc.).

**Table:** `leave_types`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `name` | VARCHAR | e.g., `Annual Leave`, `Sick Leave` |
| `days_allowed` | INT | Maximum days allowed per year |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### Leave Requests

**Table:** `leave_requests`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `staff_id` | BIGINT | FK to `staff` |
| `leave_type_id` | BIGINT | FK to `leave_types` |
| `start_date` | DATE | Leave start date |
| `end_date` | DATE | Leave end date |
| `days` | INT | Total days requested |
| `reason` | TEXT | Staff-provided reason |
| `status` | ENUM | `pending`, `approved`, `rejected` |
| `approved_by` | BIGINT NULL | FK to `users` — who approved/rejected |
| `approved_at` | TIMESTAMP NULL | When the decision was made |
| `remarks` | TEXT NULL | Admin remarks on approval/rejection |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### Leave Approval Workflow

```
Staff submits leave request (status: pending)
        │
        ▼
Principal or School Admin reviews
        │
    ┌───┴───┐
    │       │
  Approve  Reject
    │       │
    ▼       ▼
status:   status:
approved  rejected
```

**Approval endpoint:**

```
PUT /school/hr/leaves/{id}/approve
```

Request body:

```json
{
  "status": "approved",  // or "rejected"
  "remarks": "Approved. Cover classes arranged."
}
```

Roles allowed to approve/reject: `school-admin`, `principal`

---

## Payroll

The payroll system calculates monthly salary for each staff member, factoring in basic salary, allowances, and deductions.

### Payroll Model

**Table:** `payrolls`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `staff_id` | BIGINT | FK to `staff` |
| `month_year` | VARCHAR | Format: `YYYY-MM` (e.g., `2024-11`) |
| `basic_salary` | DECIMAL | Base salary amount |
| `allowances` | DECIMAL | Total allowances |
| `deductions` | DECIMAL | Total deductions (taxes, absences, etc.) |
| `net_salary` | DECIMAL | `basic_salary + allowances - deductions` |
| `payment_status` | ENUM | `pending`, `paid` |
| `payment_date` | DATE NULL | Date salary was disbursed |
| `notes` | TEXT | Optional admin notes |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

> The `month_year` column stores the month as `YYYY-MM` format string (e.g., `2024-11`). Do **not** use a column named `pay_date` for filtering payroll records — that column does not exist on the `payrolls` table.

### Payroll Generation

Payroll for a month is generated in bulk for all active staff:

```php
// Generate payroll for all staff for a given month
POST /school/hr/payroll/generate

// Request body
{
  "month_year": "2024-11"
}
```

After generation, individual records can be adjusted before marking as paid.

### Finance Report Integration

The Payroll section of the Finance Report at `/school/reports/finance` filters by `month_year`. Ensure the month selector emits values in `YYYY-MM` format when building report filters.

---

## UI Pages

| Page | Route | Roles |
|---|---|---|
| Staff List | `/school/staff` | school-admin, principal |
| Create Staff | `/school/staff/create` | school-admin |
| Edit Staff | `/school/staff/{id}/edit` | school-admin |
| Staff Profile | `/school/staff/{id}` | school-admin, principal |
| Departments | `/school/hr/departments` | school-admin |
| Designations | `/school/hr/designations` | school-admin |
| Leave Types | `/school/hr/leave-types` | school-admin |
| Leave Requests | `/school/hr/leaves` | school-admin, principal |
| Leave Request Detail | `/school/hr/leaves/{id}` | school-admin, principal |
| Payroll | `/school/hr/payroll` | school-admin, accountant |
| Generate Payroll | `/school/hr/payroll/generate` | school-admin, accountant |
