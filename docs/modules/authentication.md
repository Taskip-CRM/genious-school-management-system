---
title: Authentication
---

# Authentication & Access Control

The authentication module handles all aspects of user login, session management, role-based routing, and password management for all 9 user roles.

---

## Login Page

The login page is served at `/login` and is accessible to all user types. On `.test` or local development domains, a **Demo Login Panel** is displayed showing quick-access buttons for all demo accounts so reviewers can switch roles without remembering credentials.

```tsx
// Demo panel only shown in development/test environments
{isDemoEnvironment && (
  <DemoLoginPanel roles={demoAccounts} />
)}
```

---

## Authentication Method

Genius SMS uses **Laravel Sanctum** for session-based authentication on the web interface:

- Credentials are submitted via an Inertia form POST to `/login`
- Laravel validates credentials against the `users` table (bcrypt password)
- On success, a server-side session is created and the user is redirected
- CSRF protection is enforced on all state-changing requests

```php
// LoginController.php
public function store(LoginRequest $request): Response
{
    $request->authenticate(); // Uses Laravel's built-in auth guard

    $request->session()->regenerate();

    return redirect()->route('dashboard'); // Role-based redirect
}
```

> The `LoginController` uses `redirect()->route('dashboard')` — **not** `redirect()->intended()`. This is intentional to ensure users always land on their correct role-based dashboard.

---

## Role-Based Redirects

After a successful login, the `dashboard` named route resolves to the appropriate page based on the user's primary role:

| Role | Dashboard Route |
|---|---|
| `super-admin` | `/super-admin/dashboard` |
| `school-admin` | `/school/dashboard` |
| `principal` | `/school/dashboard` |
| `teacher` | `/school/dashboard` |
| `accountant` | `/school/dashboard` |
| `librarian` | `/school/dashboard` |
| `receptionist` | `/school/dashboard` |
| `student` | `/school/student/dashboard` |
| `parent` | `/school/parent/dashboard` |

The routing logic lives in a middleware or controller that checks the user's highest-priority role:

```php
// routes/web.php — named route resolves role-aware
Route::get('/dashboard', function () {
    $user = auth()->user();
    return match(true) {
        $user->hasRole('super-admin') => redirect('/super-admin/dashboard'),
        $user->hasRole('student')     => redirect('/school/student/dashboard'),
        $user->hasRole('parent')      => redirect('/school/parent/dashboard'),
        default                       => redirect('/school/dashboard'),
    };
})->middleware('auth')->name('dashboard');
```

---

## Route Middleware

All school routes are protected by a chain of middleware:

```php
Route::middleware(['auth', 'verified', 'role:school-admin|principal|teacher'])->group(function () {
    // Academic routes
});
```

Middleware stack for school routes:

| Middleware | Purpose |
|---|---|
| `auth` | Requires authenticated session |
| `role:rolename` | Spatie RBAC role check (403 if not matching) |
| `EnsureSchoolAccess` | Confirms user belongs to the current school |
| `SetSchoolContext` | Stores `school_id` in session for model scoping |

---

## Password Reset Flow

1. User visits `/forgot-password` and submits their email
2. Laravel sends a password reset link to the email (uses `MAIL_*` config from `.env`)
3. User clicks the link → `/reset-password/{token}`
4. User enters and confirms new password
5. Password is updated and user is redirected to login

All reset tokens are stored in the `password_reset_tokens` table and expire after 60 minutes (configurable in `config/auth.php`).

---

## Session Security

| Setting | Value |
|---|---|
| Session driver | `database` (stored in `sessions` table) |
| Session lifetime | 120 minutes (default) |
| HTTPS-only cookies | Enabled in production (`SESSION_SECURE_COOKIE=true`) |
| SameSite | `lax` |
| Session regeneration | On login to prevent session fixation |

---

## Permissions Structure

Permissions are defined using Spatie `laravel-permission` and seeded via `RolesAndPermissionsSeeder`. Each permission follows the format `action.resource`:

```
view.students
create.students
edit.students
delete.students
view.fees
create.fee-payments
approve.leaves
manage.payroll
view.reports
...
```

Roles are assigned a set of permissions at seeder time. School admins receive all permissions for their school scope; super admins operate outside the permission system (they have a global bypass).

---

## Two-Factor Authentication (2FA)

2FA is available via **TOTP** (Time-based One-Time Password) using `pragmarx/google2fa`:

- Users can enable 2FA from their profile settings
- On login, if 2FA is enabled, they are prompted for a 6-digit code after entering their password
- Compatible with Google Authenticator, Authy, and any TOTP app

> 2FA is optional per-user. Super admins can require 2FA for all admin roles via Platform Settings.
