---
title: Troubleshooting
---

# Troubleshooting

This page documents known issues encountered during development, their root causes, and the correct fixes.

---

## 1. "Account not linked" on Student/Parent Portal

**Symptom:** After logging in as a student or parent, the portal shows "Account not linked" or "No student profile found for your account."

**Root cause:** The `students.user_id` or `guardians.user_id` column is `NULL`. The portal looks up the student/guardian by `user_id = auth()->id()`. If no record is found, it shows the not-linked screen.

**Fix:**

Option A — Run the `DemoUserSeeder` (development only):
```bash
php artisan db:seed --class=DemoUserSeeder
```

Option B — Manually link via Tinker:
```php
php artisan tinker

// Link student
Student::find(1)->update(['user_id' => User::where('email', 'student@school1.com')->value('id')]);

// Link guardian
Guardian::find(1)->update(['user_id' => User::where('email', 'parent@school1.com')->value('id')]);
```

Option C — Via school admin UI:
Navigate to **Students → [Student Name] → Link User Account** and select the user account to link.

---

## 2. 403 After Login (Redirects to Homepage)

**Symptom:** After logging in, the user is redirected to `/` or gets a 403 error instead of their dashboard.

**Root cause:** Using `redirect()->intended()` instead of `redirect()->route('dashboard')` in `LoginController`. If there's no previously intended URL, `intended()` falls back to `/`, which may not be accessible.

**Fix:** The `LoginController` must use `redirect()->route('dashboard')`:

```php
// Correct
return redirect()->route('dashboard');

// Wrong — do not use this
return redirect()->intended(route('dashboard'));
```

Verify in `app/Http/Controllers/Auth/LoginController.php`:
```php
public function store(LoginRequest $request): Response
{
    $request->authenticate();
    $request->session()->regenerate();
    return redirect()->route('dashboard'); // Always use named route
}
```

---

## 3. `payment_method` Column Not Found

**Symptom:** SQL error: `Column not found: 1054 Unknown column 'payment_method' in 'field list'`

**Root cause:** The `fee_payments` table does **not** have a `payment_method` column. It was removed from the schema but may still be referenced in old code, Eloquent `$fillable` arrays, or query builders.

**Fix:** Remove all references to `payment_method` from:
- `FeePayment` model `$fillable` array
- Any select queries on `fee_payments`
- Import/export formatters for fee payments

If payment method tracking is required, create a new migration:
```bash
php artisan make:migration add_payment_method_to_fee_payments_table
```

---

## 4. `pay_date` Column Not Found in Payrolls

**Symptom:** SQL error: `Column not found: 1054 Unknown column 'pay_date' in 'where clause'`

**Root cause:** The `payrolls` table uses `month_year` (format `YYYY-MM`) to identify the billing period. There is no `pay_date` column.

**Fix:** Always filter payroll records by `month_year`, not `pay_date`:

```php
// Correct
$payrolls = Payroll::where('month_year', '2024-11')->get();

// Wrong — column does not exist
$payrolls = Payroll::where('pay_date', '2024-11-01')->get();
```

Ensure all finance report filters and payroll generators use `month_year` in `YYYY-MM` format.

---

## 5. `student` Relationship Not Found on Attendance

**Symptom:** Error: `Call to undefined relationship [student] on model [App\Models\Attendance]`

**Root cause:** The `Attendance` model uses a **polymorphic** relationship (`attendable`), not a direct `student` relationship. Attendance records can belong to either a `Student` or a `Staff` member.

**Fix:** Always use `$attendance->attendable` instead of `$attendance->student`:

```php
// Correct
$studentName = $attendance->attendable->full_name;

// Also correct — check type first
if ($attendance->attendable instanceof Student) {
    $class = $attendance->attendable->schoolClass->name;
}

// Wrong
$attendance->student->full_name; // Throws error
```

To eager load correctly:
```php
$attendances = Attendance::with('attendable')->get();
```

---

## 6. `schoolClass` Relationship Not Found on Attendance

**Symptom:** Error: `Call to undefined relationship [schoolClass] on model [App\Models\Attendance]`

**Root cause:** The `attendances` table has no `class_id` column. Class information must be obtained by going through the `attendable` → `schoolClass` chain.

**Fix:** Access class via the attendable:

```php
// Correct — for student attendance
$class = $attendance->attendable->schoolClass->name;

// Correct — filter attendance by class using whereHasMorph
$attendances = Attendance::with('attendable')
    ->whereHasMorph('attendable', [Student::class], function ($q) use ($classId) {
        $q->where('class_id', $classId);
    })
    ->whereDate('date', $date)
    ->get();

// Wrong — no class_id on attendances table
$attendances = Attendance::where('class_id', $classId)->get(); // Throws error
```

---

## 7. Recharts `removeChild` DOM Error

**Symptom:** JavaScript console error: `Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.` Occurs when navigating between pages containing Recharts charts.

**Root cause:** Recharts animation uses `requestAnimationFrame` which tries to update the DOM after the component has already been unmounted by Inertia's page transition. This is a known Recharts + React 18 + Inertia compatibility issue.

**Fix:** Add `isAnimationActive={false}` to **every** Recharts chart component:

```tsx
// All chart primitives need this prop
<BarChart data={data}>
  <Bar dataKey="value" isAnimationActive={false} />
</BarChart>

<LineChart data={data}>
  <Line type="monotone" dataKey="value" isAnimationActive={false} />
</LineChart>

<AreaChart data={data}>
  <Area type="monotone" dataKey="value" isAnimationActive={false} />
</AreaChart>

<PieChart>
  <Pie data={data} dataKey="value" isAnimationActive={false} />
</PieChart>
```

This must be applied to every `<Bar>`, `<Line>`, `<Area>`, and `<Pie>` component across the entire codebase, not just the one currently throwing the error.

---

## 8. `$this->authorize()` Undefined

**Symptom:** Error: `Call to undefined method App\Http\Controllers\...\SomeController::authorize()`

**Root cause:** The base `Controller` class does not include the `AuthorizesRequests` trait. This was intentionally omitted to keep controllers lean.

**Fix:** Use `abort_if()` with manual school ID checks instead:

```php
// Correct — manual authorization
public function edit(Student $student): Response
{
    abort_if($student->school_id !== $this->getSchoolId(), 403, 'Access denied.');
    // ...
}

// Wrong — $this->authorize() is not available
public function edit(Student $student): Response
{
    $this->authorize('update', $student); // Throws "Call to undefined method"
}
```

If you need policy-based authorization, add the trait explicitly to a specific controller:

```php
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class StudentController extends Controller
{
    use AuthorizesRequests;
    // Now $this->authorize() is available
}
```

---

## 9. Favicon Not Showing

**Symptom:** The browser tab shows the default Laravel favicon instead of the uploaded platform favicon.

**Causes and fixes:**

**A) Storage link missing:**
```bash
php artisan storage:link
```

**B) Favicon not uploaded:**
Log in as super admin → Navigate to **Settings → Platform → Branding** → Upload favicon file (`.ico`, `.png`, or `.svg`)

**C) Browser cache:**
Hard refresh with `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac). Or clear browser cache.

**D) Wrong file path in settings:**
Check the `platform_settings` table:
```sql
SELECT * FROM platform_settings WHERE `key` = 'platform_favicon';
```
The value should be a relative path like `platform/favicon.ico`. Verify the file exists at `storage/app/public/platform/favicon.ico`.

---

## 10. `platform_logo` Undefined Key Error

**Symptom:** PHP error: `Undefined array key "platform_logo"` (or `platform_favicon`)

**Root cause:** The `platform_settings` array is built from the database. If no logo has been uploaded yet, the key simply doesn't exist in the array.

**Fix:** Always check with `isset()` or use the null coalescing operator before accessing platform settings:

```php
// Correct
$logo = isset($settings['platform_logo']) ? $settings['platform_logo'] : null;

// Or with null coalescing
$logo = $settings['platform_logo'] ?? null;

// Wrong — throws error if key doesn't exist
$logo = $settings['platform_logo']; // Undefined array key error
```

In Blade templates:
```blade
@if(isset($platformSettings['platform_logo']))
    <img src="{{ Storage::url($platformSettings['platform_logo']) }}" alt="Logo">
@endif
```

---

## 11. Horizon Not Processing Jobs

**Symptom:** Jobs are queued but never executed. Horizon dashboard shows jobs stuck in "Pending".

**Checks:**

1. Verify Redis is running:
```bash
redis-cli ping  # Should return PONG
```

2. Verify Horizon is running:
```bash
sudo supervisorctl status genius-sms-horizon
```

3. Restart Horizon:
```bash
php artisan horizon:terminate
sudo supervisorctl restart genius-sms-horizon:*
```

4. Check Horizon logs:
```bash
tail -f storage/logs/horizon.log
```

5. Verify `QUEUE_CONNECTION=redis` in `.env`

---

## 12. `php artisan optimize` Fails After Config Change

**Symptom:** After changing `.env` or config files, cached values are stale.

**Fix:** Clear all caches and rebuild:

```bash
php artisan optimize:clear  # Clear all caches
php artisan optimize        # Rebuild caches
```

Or individually:
```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```
