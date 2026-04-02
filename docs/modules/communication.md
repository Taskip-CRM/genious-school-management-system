---
title: Communication
---

# Communication

The Communication module provides all channels for sharing information within the school community — from simple announcements to bulk SMS and email blasts.

---

## Announcements

Announcements are the primary broadcast mechanism for sharing news, events, and notices with specific audiences.

**Table:** `announcements`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `created_by` | BIGINT | FK to `users` — author |
| `title` | VARCHAR | Announcement title |
| `content` | TEXT | Announcement body (supports rich text) |
| `audience` | ENUM | `all`, `students`, `parents`, `staff`, `class` |
| `class_id` | BIGINT NULL | FK to `school_classes` — only used when `audience = class` |
| `is_pinned` | BOOLEAN | Pinned announcements appear at top with special highlight |
| `published_at` | TIMESTAMP NULL | When to show (null = immediate) |
| `expires_at` | TIMESTAMP NULL | When to hide (null = never) |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

### Audience Values

| Value | Shown To |
|---|---|
| `all` | All logged-in users of the school |
| `students` | All users with `student` role |
| `parents` | All users with `parent` role |
| `staff` | All users with `teacher`, `accountant`, `librarian`, `receptionist`, `principal` roles |
| `class` | Only students in `class_id` and their parents |

### Pinned Announcements

Announcements with `is_pinned = true` appear at the top of the announcements list with an **amber/yellow highlight**. This draws attention to critical notices (exam schedules, fee deadlines, emergency notices).

```tsx
// Pinned announcements get amber styling
<div className={cn(
  "border rounded-lg p-4",
  announcement.is_pinned && "border-amber-400 bg-amber-50 dark:bg-amber-950"
)}>
```

---

## Internal Messages

The internal messaging system works like an inbox — staff, principals, and admins can send direct messages to each other.

**Table:** `messages`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `sender_id` | BIGINT | FK to `users` |
| `receiver_id` | BIGINT | FK to `users` |
| `subject` | VARCHAR | Message subject |
| `body` | TEXT | Message content |
| `is_read` | BOOLEAN | Whether the receiver has read it |
| `read_at` | TIMESTAMP NULL | When it was read |
| `parent_message_id` | BIGINT NULL | FK to `messages` — for threaded replies |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## SMS Blast

Send bulk SMS to a target audience using the configured Vonage gateway. SMS blasts are queued to avoid timeout:

**Route:** `POST /school/communication/sms-blast`

**Request body:**

```json
{
  "audience": "parents",
  "class_id": null,
  "message": "Dear Parent, the school will be closed tomorrow due to the national holiday."
}
```

The job resolves all phone numbers for the target audience, then sends individual SMS via Vonage:

```php
// In SendSmsBlastJob
SendSmsBlastJob::dispatch($audience, $classId, $message, $schoolId)
    ->onQueue('notifications');
```

---

## Email Blast

Similar to SMS blast but sends formatted HTML emails:

**Route:** `POST /school/communication/email-blast`

**Request body:**

```json
{
  "audience": "students",
  "class_id": 5,
  "subject": "Exam Schedule Released",
  "body": "Dear Student, the mid-term exam schedule is now available..."
}
```

Email blasts use the configured SMTP settings and are dispatched via `SendEmailBlastJob` on the `notifications` queue.

---

## Email Templates

Reusable email templates can be defined in **School Settings → Notification Templates**. They support placeholder variables:

| Placeholder | Replaced With |
|---|---|
| `{{student_name}}` | Student's full name |
| `{{school_name}}` | School's name |
| `{{fee_amount}}` | Outstanding fee amount |
| `{{due_date}}` | Fee due date |
| `{{exam_name}}` | Exam name |
| `{{result}}` | Pass/Fail result |

---

## Notifications

System notifications are generated automatically by:

- New fee payment recorded → notification to accountant
- Leave request submitted → notification to principal/admin
- Exam result published → notification to students in that class
- New announcement → notification to all in audience
- Book overdue → notification to student/staff borrower

**Table:** `notifications`

Uses Laravel's built-in `notifications` table (polymorphic, `notifiable_type` + `notifiable_id`).

Unread notification count is stored in Zustand's `useNotificationStore` and shown in the top nav bar.

---

## UI Pages

| Page | Route | Roles |
|---|---|---|
| Announcements | `/school/announcements` | All school roles |
| Create Announcement | `/school/announcements/create` | school-admin, principal, teacher |
| Messages Inbox | `/school/messages` | All school roles |
| Compose Message | `/school/messages/create` | All school roles |
| SMS Blast | `/school/communication/sms` | school-admin, principal |
| Email Blast | `/school/communication/email` | school-admin, principal |
| Email Templates | `/school/communication/templates` | school-admin |
