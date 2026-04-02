---
title: Fee Management
---

# Fee Management

The Fee Management module handles all financial collections from students — from defining fee structures per class to recording individual payments and generating finance reports.

---

## Data Model Hierarchy

```
Fee Categories
    └── Fee Structures  (category assigned to a class/section)
            └── Fee Payments  (individual payment records per student)
```

---

## Fee Categories

Fee categories classify the type of fee being collected.

**Table:** `fee_categories`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `name` | VARCHAR | e.g., `Tuition Fee`, `Library Fee`, `Sports Fee`, `Transport Fee` |
| `description` | TEXT NULL | Optional |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## Fee Structures

Fee structures define the amount due for a specific fee category, class, and billing period.

**Table:** `fee_structures`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `fee_category_id` | BIGINT | FK to `fee_categories` |
| `class_id` | BIGINT | FK to `school_classes` |
| `section_id` | BIGINT NULL | Specific section, or null for all sections |
| `academic_year_id` | BIGINT | FK to `academic_years` |
| `amount` | DECIMAL | Fee amount |
| `frequency` | ENUM | `monthly`, `quarterly`, `annually`, `one-time` |
| `due_day` | INT NULL | Day of month when fee is due (for monthly fees) |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## Fee Payments

Individual payment records track each student's fee transactions.

**Table:** `fee_payments`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `student_id` | BIGINT | FK to `students` |
| `fee_structure_id` | BIGINT | FK to `fee_structures` |
| `fee_category_id` | BIGINT | FK to `fee_categories` |
| `month_year` | VARCHAR | Billing period: `YYYY-MM` format (e.g., `2024-11`) |
| `amount_due` | DECIMAL | Total amount owed |
| `amount_paid` | DECIMAL | Amount actually paid |
| `discount` | DECIMAL | Any discount applied |
| `fine` | DECIMAL | Late fee fine applied |
| `status` | ENUM | `paid`, `partial`, `unpaid`, `overdue` |
| `payment_date` | DATE NULL | Date payment was received |
| `receipt_number` | VARCHAR NULL | Auto-generated receipt number |
| `collected_by` | BIGINT NULL | FK to `users` — who collected the payment |
| `notes` | TEXT NULL | Optional notes |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

> The `fee_payments` table does **not** have a `payment_method` column. Do not attempt to select or insert `payment_method`. If payment method tracking is needed, add it as a new migration — do not assume it exists.

---

## Payment Status Workflow

```
unpaid  ──▶  partial  ──▶  paid
  │
  └──▶  overdue  (when due date has passed)
```

| Status | Condition |
|---|---|
| `unpaid` | No payment received yet, not past due |
| `partial` | `amount_paid > 0` but `amount_paid < amount_due` |
| `paid` | `amount_paid >= amount_due` |
| `overdue` | Due date passed and `amount_paid < amount_due` |

---

## Recording a Payment

**Route:** `POST /school/fees/payments`

**Request body:**

```json
{
  "student_id": 101,
  "fee_structure_id": 5,
  "month_year": "2024-11",
  "amount_paid": 500.00,
  "discount": 0,
  "fine": 0,
  "payment_date": "2024-11-10",
  "notes": ""
}
```

On successful submission:
1. Payment record is created/updated
2. Status is recalculated based on `amount_paid` vs `amount_due`
3. A PDF receipt is generated (queued job) and stored in `fees/receipts/`
4. Optional: notification sent to parent (if enabled in school settings)

---

## Fee Summary for a Student

All outstanding and paid fees for a student:

```
GET /school/fees/student/{student_id}
```

Returns grouped by `month_year` with totals.

---

## Student Portal View

Students view their fee status at `/school/student/fees`:

- Summary: total due, total paid, outstanding balance
- Monthly breakdown table with status badges
- Download receipt button for paid months

---

## Parent Portal View

Parents can see fee status for each linked child at `/school/parent/fees`.

---

## Finance Report

The consolidated finance report is at `/school/reports/finance`:

- **Summary:** Total collected this month/year, outstanding amounts, overdue count
- **Collections by category:** Bar chart grouped by fee category
- **Monthly trend:** Line chart of collections over the year
- **Payroll summary:** Monthly payroll totals filtered by `month_year`

> The finance report's payroll section filters using `month_year` — ensure date pickers in the report filter emit values in `YYYY-MM` format.

---

## Receipt Number Generation

Receipt numbers are auto-generated on payment:

```
RCP-{SCHOOL_CODE}-{YEAR}-{NNNN}
```

Example: `RCP-SMS1-2024-0347`
