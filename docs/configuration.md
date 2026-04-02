---
title: Configuration
---

# Configuration

All Genius SMS configuration is managed via the `.env` file at the project root. This page documents all available environment variables with descriptions, expected values, and defaults.

---

## Application

| Variable | Default | Description |
|---|---|---|
| `APP_NAME` | `Genius SMS` | Application name shown in UI and emails |
| `APP_ENV` | `local` | Environment: `local`, `staging`, `production` |
| `APP_KEY` | *(generated)* | Laravel encryption key. Generate with `php artisan key:generate` |
| `APP_DEBUG` | `true` | Show detailed errors. Set to `false` in production |
| `APP_URL` | `http://localhost` | Base URL. Must match the actual domain in production |
| `APP_TIMEZONE` | `UTC` | PHP timezone for the application |
| `APP_LOCALE` | `en` | Default locale |
| `APP_FALLBACK_LOCALE` | `en` | Fallback locale when translation is missing |

---

## Database

| Variable | Default | Description |
|---|---|---|
| `DB_CONNECTION` | `mysql` | Database driver. Always `mysql` for production |
| `DB_HOST` | `127.0.0.1` | Database server hostname |
| `DB_PORT` | `3306` | Database port |
| `DB_DATABASE` | `genius_sms` | Database name |
| `DB_USERNAME` | `root` | Database username |
| `DB_PASSWORD` | *(empty)* | Database password |
| `DB_CHARSET` | `utf8mb4` | Character set — must be `utf8mb4` for emoji support |
| `DB_COLLATION` | `utf8mb4_unicode_ci` | Collation |

---

## Cache

| Variable | Default | Description |
|---|---|---|
| `CACHE_DRIVER` | `redis` | Cache backend. Use `redis` for production performance |
| `CACHE_PREFIX` | `genius_sms_cache` | Key prefix to avoid collisions |

---

## Session

| Variable | Default | Description |
|---|---|---|
| `SESSION_DRIVER` | `database` | Session storage: `database`, `redis`, `file`, `cookie` |
| `SESSION_LIFETIME` | `120` | Session lifetime in minutes |
| `SESSION_SECURE_COOKIE` | `false` | Set to `true` in production (HTTPS only) |
| `SESSION_DOMAIN` | *(empty)* | Session cookie domain |

---

## Queue

| Variable | Default | Description |
|---|---|---|
| `QUEUE_CONNECTION` | `redis` | Queue driver. Must be `redis` for Laravel Horizon |
| `QUEUE_RETRY_AFTER` | `90` | Seconds before a job is considered failed |

---

## Redis

| Variable | Default | Description |
|---|---|---|
| `REDIS_HOST` | `127.0.0.1` | Redis server hostname |
| `REDIS_PASSWORD` | `null` | Redis password (null if no auth) |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_DB` | `0` | Redis database index for cache |
| `REDIS_QUEUE_DB` | `1` | Redis database index for queues |

---

## Mail / SMTP

| Variable | Default | Description |
|---|---|---|
| `MAIL_MAILER` | `smtp` | Mail driver: `smtp`, `ses`, `mailgun`, `log` |
| `MAIL_HOST` | `smtp.mailtrap.io` | SMTP server hostname |
| `MAIL_PORT` | `2525` | SMTP port (25, 465, 587, 2525) |
| `MAIL_USERNAME` | `null` | SMTP authentication username |
| `MAIL_PASSWORD` | `null` | SMTP authentication password |
| `MAIL_ENCRYPTION` | `null` | Encryption: `tls`, `ssl`, or `null` |
| `MAIL_FROM_ADDRESS` | `hello@example.com` | Default from email |
| `MAIL_FROM_NAME` | `${APP_NAME}` | Default from name |

---

## Payment (Stripe)

| Variable | Default | Description |
|---|---|---|
| `STRIPE_KEY` | *(empty)* | Stripe publishable key (`pk_live_...` or `pk_test_...`) |
| `STRIPE_SECRET` | *(empty)* | Stripe secret key (`sk_live_...` or `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | *(empty)* | Stripe webhook endpoint signing secret |

---

## SMS (Vonage)

| Variable | Default | Description |
|---|---|---|
| `VONAGE_API_KEY` | *(empty)* | Vonage API key |
| `VONAGE_API_SECRET` | *(empty)* | Vonage API secret |
| `VONAGE_SMS_FROM` | `GeniusSMS` | SMS sender name (max 11 chars) |

---

## File Storage

| Variable | Default | Description |
|---|---|---|
| `FILESYSTEM_DISK` | `public` | Default storage disk |
| `AWS_ACCESS_KEY_ID` | *(empty)* | S3/MinIO access key |
| `AWS_SECRET_ACCESS_KEY` | *(empty)* | S3/MinIO secret key |
| `AWS_DEFAULT_REGION` | `us-east-1` | S3 region |
| `AWS_BUCKET` | *(empty)* | S3 bucket name |
| `AWS_URL` | *(empty)* | Public S3 URL (CDN endpoint) |
| `AWS_ENDPOINT` | *(empty)* | Custom endpoint URL (for MinIO or other S3-compatible) |
| `AWS_USE_PATH_STYLE_ENDPOINT` | `false` | Set to `true` for MinIO |

---

## Multi-Tenancy

| Variable | Default | Description |
|---|---|---|
| `MULTITENANCY_MODE` | `path` | Routing mode: `path` or `subdomain` |
| `SUPER_ADMIN_EMAIL` | *(empty)* | Email for the initial super admin account |

### Path Mode
URL format: `https://example.com/school/{slug}/dashboard`

### Subdomain Mode
URL format: `https://{slug}.example.com/dashboard`

---

## Platform Settings (Stored in DB)

These are managed through the Super Admin Settings UI, not via `.env`. They are stored in the `platform_settings` table and cached in Redis.

| Setting Key | Description |
|---|---|
| `platform_name` | Platform display name |
| `platform_logo` | Uploaded logo file path (relative to storage) |
| `platform_favicon` | Uploaded favicon file path (relative to storage) |
| `platform_url` | Canonical URL |
| `support_email` | Support contact email |
| `copyright_text` | Footer text |
| `currency` | ISO currency code |
| `currency_symbol` | Currency symbol |
| `default_timezone` | PHP timezone name |
| `default_language` | ISO language code |
| `date_format` | PHP date format string |
| `time_format` | `12` or `24` |
| `max_upload_size_mb` | Maximum file upload size |
| `stripe_key` | Stripe publishable key (overrides .env) |
| `stripe_secret` | Stripe secret key (overrides .env) |
| `mail_host` | SMTP host (overrides .env) |
| `maintenance_mode` | `0` or `1` |

---

## Laravel Horizon Configuration

Horizon settings are in `config/horizon.php`. Key settings:

```php
// config/horizon.php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'maxProcesses' => 10,
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
        ],
    ],
    'local' => [
        'supervisor-1' => [
            'maxProcesses' => 3,
        ],
    ],
],

'defaults' => [
    'supervisor-1' => [
        'connection' => 'redis',
        'queue' => ['default', 'notifications', 'reports', 'imports'],
        'balance' => 'auto',
        'processes' => 1,
        'tries' => 3,
        'timeout' => 60,
    ],
],
```

Queue names used:

| Queue | Purpose |
|---|---|
| `default` | General background jobs |
| `notifications` | SMS and email blast jobs |
| `reports` | PDF and Excel export jobs |
| `imports` | Bulk student/staff import jobs |
| `payroll` | Payroll generation jobs |

---

## Logging

| Variable | Default | Description |
|---|---|---|
| `LOG_CHANNEL` | `stack` | Log channel: `stack`, `single`, `daily`, `slack` |
| `LOG_LEVEL` | `debug` | Minimum log level: `debug`, `info`, `warning`, `error` |
| `LOG_DEPRECATIONS_CHANNEL` | `null` | Channel for deprecation warnings |

In production, set `LOG_LEVEL=warning` and configure `LOG_CHANNEL=daily` for rotating log files.
