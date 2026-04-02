---
title: Subscriptions
---

# Subscription & Package Management

The Subscription module is the SaaS billing layer of the platform. It allows the super admin to define pricing packages, assign them to schools, manage coupons, and control which modules are available per school.

---

## Packages

Packages define the subscription tiers available on the platform.

**Table:** `packages`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `name` | VARCHAR | e.g., `Starter`, `Professional`, `Enterprise` |
| `description` | TEXT NULL | Package description |
| `price` | DECIMAL | Monthly price |
| `annual_price` | DECIMAL NULL | Annual price (usually discounted) |
| `billing_cycle` | ENUM | `monthly`, `annually`, `lifetime` |
| `max_students` | INT NULL | Student limit (null = unlimited) |
| `max_staff` | INT NULL | Staff limit (null = unlimited) |
| `max_storage_gb` | INT NULL | Storage limit in GB |
| `features` | JSON | List of enabled features/modules |
| `is_featured` | BOOLEAN | Highlight this package on pricing page |
| `is_active` | BOOLEAN | Whether package is available for new subscriptions |
| `trial_days` | INT | Free trial period in days (0 = no trial) |
| `sort_order` | INT | Display order on pricing page |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## School Subscriptions

Each school has a subscription that determines which package they're on and when it expires.

**Table:** `school_subscriptions`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `package_id` | BIGINT | FK to `packages` |
| `coupon_id` | BIGINT NULL | FK to `coupons` — if a coupon was applied |
| `start_date` | DATE | Subscription start date |
| `end_date` | DATE | Subscription expiry date |
| `status` | ENUM | `active`, `expired`, `cancelled`, `trial`, `pending` |
| `amount_paid` | DECIMAL | Amount paid for this subscription period |
| `discount_amount` | DECIMAL | Discount from coupon |
| `payment_reference` | VARCHAR NULL | Stripe payment intent ID |
| `auto_renew` | BOOLEAN | Whether to auto-renew on expiry |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### Subscription Status Workflow

```
pending ──▶ trial ──▶ active ──▶ expired
                ╰────────────────▶ cancelled
```

| Status | Meaning |
|---|---|
| `pending` | Payment initiated but not confirmed |
| `trial` | In free trial period |
| `active` | Paid and currently valid |
| `expired` | End date passed without renewal |
| `cancelled` | Manually cancelled by school or super admin |

---

## Coupons

Discount coupons reduce the subscription price for qualifying schools.

**Table:** `coupons`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `code` | VARCHAR | Unique coupon code (case-insensitive) |
| `name` | VARCHAR | Human-readable name |
| `description` | TEXT NULL | Internal notes |
| `discount_type` | ENUM | `percentage` or `fixed` |
| `discount_amount` | DECIMAL | Percentage (0–100) or fixed amount |
| `minimum_amount` | DECIMAL NULL | Minimum order amount to use coupon |
| `usage_limit` | INT NULL | Total uses allowed (null = unlimited) |
| `usage_per_school` | INT | Max times one school can use it |
| `used_count` | INT | Times used so far |
| `valid_from` | DATE | Coupon active start date |
| `valid_until` | DATE NULL | Coupon expiry date (null = no expiry) |
| `applicable_packages` | JSON NULL | Array of package IDs (null = all packages) |
| `is_active` | BOOLEAN | Whether coupon is enabled |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## Module Manager

The Module Manager allows the super admin to enable or disable specific modules for each school individually. This is useful for:

- Enforcing package limits (e.g., Starter plan doesn't include Hostel module)
- Disabling a module that a school doesn't use
- Temporarily disabling a module for troubleshooting

**Route:** `GET /super-admin/schools/{id}/modules`

The module list shows all 19 modules with toggle switches. Changes take effect immediately.

When a module is disabled for a school:
1. Navigation links for that module are hidden from the school's sidebar
2. Direct URL access returns 403

**How it's stored:**

School module settings are stored in the `school_module_settings` table:

| Column | Type | Description |
|---|---|---|
| `school_id` | BIGINT | FK to `schools` |
| `module_key` | VARCHAR | Module identifier, e.g., `library`, `transport`, `hostel` |
| `is_enabled` | BOOLEAN | Whether the module is enabled |

---

## Subscription Management UI

| Page | Route | Description |
|---|---|---|
| Packages List | `/super-admin/packages` | View and manage all packages |
| Create Package | `/super-admin/packages/create` | Add new subscription package |
| Edit Package | `/super-admin/packages/{id}/edit` | Modify existing package |
| Subscriptions | `/super-admin/subscriptions` | All school subscriptions |
| Assign Subscription | `/super-admin/subscriptions/create` | Manually assign a package to a school |
| Coupons | `/super-admin/coupons` | Manage discount coupons |
| Create Coupon | `/super-admin/coupons/create` | Create a new coupon |
| Module Manager | `/super-admin/schools/{id}/modules` | Per-school module control |
