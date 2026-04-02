---
title: System Administration
---

# System Administration

The System Administration module manages all configuration settings — both at the platform level (super admin) and at the individual school level (school admin).

---

## Platform Settings (Super Admin)

Accessible at `/super-admin/settings`, these settings apply globally across the entire platform.

### General Settings

| Setting | Key | Description |
|---|---|---|
| Platform Name | `platform_name` | Name shown in browser tab and emails |
| Platform URL | `platform_url` | Base URL of the installation |
| Platform Logo | `platform_logo` | Uploaded logo file path |
| Platform Favicon | `platform_favicon` | Uploaded favicon file path |
| Support Email | `support_email` | Contact email for support |
| Copyright Text | `copyright_text` | Footer copyright text |

> Always check `isset($settings['platform_logo'])` before accessing it from the platform settings array. The key may not exist if no logo has been uploaded, causing an undefined key error.

### Favicon Implementation

The favicon is stored in the `platform_settings` table under the key `platform_favicon` and injected into the HTML via a `<link>` tag in the main Blade layout:

```html
<!-- resources/views/app.blade.php -->
<link id="app-favicon" rel="icon" type="image/x-icon"
  href="{{ isset($settings['platform_favicon']) ? Storage::url($settings['platform_favicon']) : '/favicon.ico' }}">
```

On the client side, a `useEffect` hook updates the favicon dynamically when settings change (useful for school-specific favicon overrides):

```tsx
useEffect(() => {
  if (settings?.platform_favicon) {
    const link = document.getElementById('app-favicon') as HTMLLinkElement;
    if (link) {
      link.href = `/storage/${settings.platform_favicon}`;
    }
  }
}, [settings?.platform_favicon]);
```

### Payment / Stripe Settings

| Setting | Key | Description |
|---|---|---|
| Stripe Publishable Key | `stripe_key` | Stripe pk_live/pk_test key |
| Stripe Secret Key | `stripe_secret` | Stripe sk_live/sk_test key |
| Currency | `currency` | e.g., `USD`, `GBP`, `BDT` |
| Currency Symbol | `currency_symbol` | e.g., `$`, `£`, `৳` |

### SMTP / Email Settings

| Setting | Key | Description |
|---|---|---|
| Mail Host | `mail_host` | SMTP server hostname |
| Mail Port | `mail_port` | SMTP port (465, 587, 25) |
| Mail Username | `mail_username` | SMTP username |
| Mail Password | `mail_password` | SMTP password |
| Mail Encryption | `mail_encryption` | `tls` or `ssl` |
| Mail From Address | `mail_from_address` | Sender email address |
| Mail From Name | `mail_from_name` | Sender display name |

### Storage Limits

| Setting | Key | Description |
|---|---|---|
| Max File Upload Size | `max_upload_size_mb` | Maximum upload size in MB |
| Allowed File Types | `allowed_file_types` | Comma-separated MIME types |
| Storage Driver | `storage_driver` | `local` or `s3` |

### Localization

| Setting | Key | Description |
|---|---|---|
| Default Language | `default_language` | ISO language code |
| Default Timezone | `default_timezone` | PHP timezone name |
| Date Format | `date_format` | e.g., `d/m/Y`, `Y-m-d`, `m/d/Y` |
| Time Format | `time_format` | `12` or `24` |

### Maintenance Mode

Super admins can toggle maintenance mode from the settings panel. When active, all non-admin users see a maintenance page. The toggle calls:

```
POST /super-admin/settings/maintenance
```

---

## School Settings (School Admin)

Accessible at `/school/settings`, these settings apply only to the current school.

### General School Settings

| Setting | Description |
|---|---|
| School Name | Official school name |
| School Code | Short identifier code |
| School Address | Physical address |
| School Phone | Main contact number |
| School Email | Official email address |
| School Website | Website URL |
| Working Days | Which days of the week the school operates |
| School Start Time | Daily school start time |
| School End Time | Daily school end time |

### Branding

| Setting | Description |
|---|---|
| School Logo | Uploaded logo, shown in school dashboard and documents |
| School Favicon | School-specific favicon (overrides platform favicon) |
| Primary Color | Hex color code for school-specific theming |

### Academic Settings

| Setting | Description |
|---|---|
| Current Academic Year | Select the active academic year |
| Grading System | Letter grades or percentage-based |
| Pass Percentage | Minimum percentage to pass |
| Library Fine Per Day | Fine amount for overdue books |
| Late Fee Amount | Fee charged for late fee payments |

### Notification Templates

Schools can customize the notification message templates used for:
- Fee reminder SMS/email
- Exam result notification
- Attendance alert (low attendance)
- Leave approval/rejection notification

Templates support placeholder variables (see [Communication module](communication.md) for full placeholder list).

### Audit Log (School Level)

Each school has its own activity log showing all actions performed by school staff, visible to school admins.

---

## Platform Settings Storage

Platform settings are stored as key-value pairs in the `platform_settings` table:

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `key` | VARCHAR | Setting key (unique) |
| `value` | TEXT | Setting value |
| `type` | VARCHAR | `string`, `boolean`, `integer`, `json` |
| `group` | VARCHAR | Grouping: `general`, `payment`, `mail`, `storage`, `localization` |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

Settings are loaded once per request and cached in Redis:

```php
$settings = Cache::remember('platform_settings', 3600, function () {
    return PlatformSetting::pluck('value', 'key')->toArray();
});
```

The cache is invalidated whenever settings are saved.
