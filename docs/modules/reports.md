---
title: Reports & Analytics
---

# Reports & Analytics

The Reports & Analytics module provides KPI dashboards, detailed operational reports, and a custom report builder for data-driven decision making.

---

## Reports Dashboard

The reports dashboard is the entry point at `/school/reports`. It displays:

- KPI summary cards (total students, active staff, monthly collections, attendance rate)
- Monthly attendance trend chart (line chart)
- Fee collection chart (bar chart by category)
- Enrollment growth chart (area chart)

All charts use **Recharts** components.

> **Important:** All `<Bar>`, `<Line>`, `<Area>`, and `<Pie>` Recharts components **must** include `isAnimationActive={false}`. Omitting this prop causes a `removeChild` DOM error during React re-renders (particularly on Inertia page transitions).

```tsx
// Correct — always disable animation
<BarChart data={data}>
  <Bar dataKey="amount" isAnimationActive={false} />
</BarChart>

<LineChart data={data}>
  <Line type="monotone" dataKey="value" isAnimationActive={false} />
</LineChart>

<PieChart>
  <Pie data={data} isAnimationActive={false} />
</PieChart>
```

---

## Attendance Report

**Route:** `GET /school/reports/attendance`

**Filters:**

| Filter | Type | Description |
|---|---|---|
| `type` | string | `student` or `staff` |
| `class_id` | int | Filter by class |
| `section_id` | int | Filter by section |
| `month` | string | `YYYY-MM` format |
| `date_from` | date | Custom date range start |
| `date_to` | date | Custom date range end |

> Attendance is polymorphic. Use the `attendable` relationship, not `student`. When building the report query, use `whereHasMorph` to filter by class:

```php
// Correct approach for student attendance by class
$attendances = Attendance::with('attendable')
    ->whereHasMorph('attendable', [Student::class], function ($q) use ($classId) {
        $q->where('class_id', $classId);
    })
    ->whereBetween('date', [$dateFrom, $dateTo])
    ->get();

// Wrong — this will throw an error
// $attendance->student  (no such relationship)
// $attendance->schoolClass  (no class_id on attendances table)
```

The report output includes:
- Per-student attendance summary (present/absent/late/excused count and percentage)
- Downloadable Excel export
- PDF export (queued)

---

## Academic Report

**Route:** `GET /school/reports/academic`

Shows:
- Class-wise exam performance comparison
- Subject-wise average marks
- Grade distribution pie chart
- Top performers list

**Filters:** exam, class, section, subject, academic year

---

## Finance Report

**Route:** `GET /school/reports/finance`

Sections:
1. **Fee Collections** — monthly collection trend, status breakdown (paid/partial/unpaid/overdue)
2. **Outstanding Fees** — students with unpaid/overdue fees
3. **Payroll Summary** — monthly payroll totals per department

> The payroll filter uses `month_year` (format `YYYY-MM`). Ensure all date pickers in the finance report filter emit values in `YYYY-MM` format. Do **not** filter by a column named `pay_date`.

```php
// Correct payroll filter
$payrolls = Payroll::where('month_year', $request->month_year)->get();

// Wrong — this column does not exist
// Payroll::where('pay_date', '...')->get();
```

---

## Custom Report Builder

**Route:** `GET /school/reports/custom`

The custom report builder lets admins select:
- **Data source:** Students, Staff, Fees, Attendance, Exams
- **Columns:** Drag-and-drop column selector
- **Filters:** Dynamic filter builder (field + operator + value)
- **Date range**
- **Export format:** Excel or PDF

Reports are saved as named templates for reuse.

---

## Audit Log

**Route:** `GET /school/reports/audit-log`

The audit log uses `spatie/laravel-activitylog` to track all create, update, and delete operations on major models.

| Column | Description |
|---|---|
| `log_name` | Category of action |
| `description` | Human-readable action description |
| `subject_type` | The model that was changed |
| `subject_id` | ID of the changed record |
| `causer_type` | Who made the change (`App\Models\User`) |
| `causer_id` | User ID of who made the change |
| `properties` | JSON: `old` and `new` values |
| `created_at` | When the action occurred |

**Filters:** model type, user, date range, action type

---

## Super Admin Analytics

The Super Admin Dashboard at `/super-admin/dashboard` shows 12 platform-level KPIs:

| KPI | Description |
|---|---|
| Total Schools | All registered schools |
| Active Schools | Schools with active subscriptions |
| Total Students | Sum across all schools |
| Total Staff | Sum across all schools |
| Monthly Revenue | Subscription payments this month |
| Annual Revenue | Subscription payments this year |
| Active Subscriptions | Currently active school subscriptions |
| Expiring Soon | Subscriptions expiring in next 30 days |
| Free Trial Schools | Schools on trial plans |
| New Schools (Month) | Schools registered this month |
| Coupon Usage | Total coupon redemptions |
| Pending Renewals | Expired subscriptions not yet renewed |

Charts on the super admin dashboard:
- Revenue trend (last 12 months) — line chart
- School growth chart — area chart
- Subscription plan distribution — pie chart

All charts follow the same `isAnimationActive={false}` rule.
