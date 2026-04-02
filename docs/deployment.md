---
title: Deployment
---

# Deployment Guide

This guide covers deploying Genius SMS to a production Linux server (Ubuntu 22.04 recommended).

---

## Prerequisites

Ensure the following are installed on your production server:

```bash
# PHP 8.3 with required extensions
sudo apt install -y php8.3 php8.3-fpm php8.3-mysql php8.3-mbstring php8.3-xml \
  php8.3-curl php8.3-zip php8.3-bcmath php8.3-redis php8.3-gd php8.3-intl

# Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Node.js 20 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# MySQL 8.0
sudo apt install -y mysql-server-8.0

# Redis
sudo apt install -y redis-server

# Nginx
sudo apt install -y nginx

# Supervisor (for Horizon)
sudo apt install -y supervisor
```

---

## Deployment Steps

### 1. Upload Code

```bash
# Clone to server
git clone https://github.com/xgenious/genius-sms.git /var/www/genius-sms
cd /var/www/genius-sms
```

### 2. Install Dependencies

```bash
composer install --no-dev --optimize-autoloader
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
nano .env  # Fill in all production values
```

Set these critical values for production:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

SESSION_SECURE_COOKIE=true
LOG_LEVEL=warning
```

### 4. Generate Application Key

```bash
php artisan key:generate
```

### 5. Run Migrations and Seeders

```bash
php artisan migrate --force
php artisan db:seed --force  # Only run on first deployment
```

### 6. Link Storage

```bash
php artisan storage:link
```

### 7. Build Frontend Assets

```bash
npm run build
```

### 8. Optimize Laravel

```bash
php artisan optimize
php artisan view:cache
php artisan route:cache
php artisan config:cache
php artisan event:cache
```

### 9. Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/genius-sms
sudo chmod -R 755 /var/www/genius-sms
sudo chmod -R 775 /var/www/genius-sms/storage
sudo chmod -R 775 /var/www/genius-sms/bootstrap/cache
```

---

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    root /var/www/genius-sms/public;
    index index.php;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Max upload size
    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
```

Activate and test:

```bash
sudo ln -s /etc/nginx/sites-available/genius-sms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL Certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot auto-renews. Verify auto-renewal:

```bash
sudo certbot renew --dry-run
```

---

## Supervisor Configuration (Laravel Horizon)

Create a Supervisor config file for Horizon:

```ini
; /etc/supervisor/conf.d/genius-sms-horizon.conf
[program:genius-sms-horizon]
process_name=%(program_name)s
command=php /var/www/genius-sms/artisan horizon
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/genius-sms/storage/logs/horizon.log
stopwaitsecs=3600
```

Create configs for each queue worker if not using Horizon auto-scaling:

```ini
; /etc/supervisor/conf.d/genius-sms-worker.conf
[program:genius-sms-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/genius-sms/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/genius-sms/storage/logs/worker.log
stopwaitsecs=3600
```

Activate:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start genius-sms-horizon:*
sudo supervisorctl status
```

---

## Cron Job (Task Scheduler)

Add the Laravel scheduler to the server crontab:

```bash
sudo crontab -e -u www-data
```

Add:

```
* * * * * cd /var/www/genius-sms && php artisan schedule:run >> /dev/null 2>&1
```

The scheduler handles:
- Sending attendance alert notifications (daily)
- Marking fee records as overdue (daily)
- Clearing expired password reset tokens (daily)
- Cleaning up old activity logs (weekly)

---

## S3 / MinIO Storage Setup

For file storage with S3:

```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket-name
AWS_URL=https://your-cdn-url.com
```

For MinIO (self-hosted S3-compatible):

```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=genius-sms
AWS_ENDPOINT=http://minio:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

---

## Production Checklist

Before going live, verify:

- [ ] `APP_ENV=production` and `APP_DEBUG=false`
- [ ] `APP_URL` matches the actual domain (with HTTPS)
- [ ] Database credentials are correct and DB is accessible
- [ ] Redis is running: `redis-cli ping` returns `PONG`
- [ ] `php artisan migrate --force` ran successfully
- [ ] `php artisan storage:link` ran successfully
- [ ] `npm run build` completed without errors
- [ ] `php artisan optimize` ran (config/route/view caches created)
- [ ] Nginx config tested with `nginx -t`
- [ ] SSL certificate installed and redirecting HTTP to HTTPS
- [ ] Supervisor is running Horizon: `supervisorctl status`
- [ ] Cron job added for `artisan schedule:run`
- [ ] File upload directory writable: `storage/app/public/` permissions set
- [ ] Demo passwords changed or demo accounts disabled
- [ ] Mail settings configured and test email sent
- [ ] Stripe keys set (if using subscriptions)
- [ ] Horizon accessible at `/horizon` (super admin only)

---

## Updating the Application

For subsequent deployments:

```bash
cd /var/www/genius-sms
git pull origin main
composer install --no-dev --optimize-autoloader
npm install && npm run build
php artisan migrate --force
php artisan optimize
sudo supervisorctl restart genius-sms-horizon:*
```

> Run `php artisan down` before deploying to put the site in maintenance mode, then `php artisan up` after deployment completes.
