---
title: Library
---

# Library Management

The Library module manages the school's book inventory and circulation system — tracking books, issues, returns, and overdue fines.

---

## Book Model

**Table:** `books`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `book_category_id` | BIGINT | FK to `book_categories` |
| `title` | VARCHAR | Book title |
| `author` | VARCHAR | Author name(s) |
| `isbn` | VARCHAR | ISBN-10 or ISBN-13 |
| `publisher` | VARCHAR NULL | Publisher name |
| `edition` | VARCHAR NULL | Edition (e.g., `3rd Edition`) |
| `published_year` | YEAR NULL | Publication year |
| `language` | VARCHAR NULL | Language of the book |
| `pages` | INT NULL | Number of pages |
| `total_copies` | INT | Total copies owned by the library |
| `available_copies` | INT | Copies currently available for issue |
| `cover_image` | VARCHAR NULL | Storage path for cover image |
| `description` | TEXT NULL | Book summary |
| `shelf_location` | VARCHAR NULL | Physical shelf/rack number |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## Book Categories

**Table:** `book_categories`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `name` | VARCHAR | e.g., `Science`, `Mathematics`, `Fiction`, `Reference` |
| `description` | TEXT NULL | Optional |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## Book Issues

**Table:** `book_issues`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `book_id` | BIGINT | FK to `books` |
| `borrower_type` | VARCHAR | `App\Models\Student` or `App\Models\Staff` |
| `borrower_id` | BIGINT | ID of student or staff member |
| `issued_by` | BIGINT | FK to `users` — librarian who issued the book |
| `issue_date` | DATE | Date book was issued |
| `due_date` | DATE | Date book should be returned |
| `return_date` | DATE NULL | Actual return date (null if not yet returned) |
| `status` | ENUM | `issued`, `returned`, `overdue` |
| `fine_amount` | DECIMAL | Fine charged (0 if returned on time) |
| `fine_paid` | BOOLEAN | Whether fine has been collected |
| `notes` | TEXT NULL | Optional notes |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## Issue Workflow

```
Librarian searches book ──▶ Checks availability ──▶ Issues book
                                                          │
                                                     Updates available_copies
                                                     (decrements by 1)
                                                          │
                                                     Due date set
                                                  (issue_date + configured days)
```

**Issue endpoint:** `POST /school/library/issues`

**Request body:**

```json
{
  "book_id": 42,
  "borrower_type": "student",
  "borrower_id": 101,
  "due_date": "2024-12-01",
  "notes": ""
}
```

---

## Return Workflow

```
Librarian scans/finds issue record ──▶ Records return date
                                               │
                                       Fine calculated if overdue
                                               │
                                       available_copies incremented
                                               │
                                       status set to "returned"
```

**Return endpoint:** `PUT /school/library/issues/{id}/return`

---

## Fine Calculation

Fines are calculated automatically on return:

```php
// In LibraryService
public function calculateFine(BookIssue $issue, Carbon $returnDate): float
{
    if ($returnDate->lte($issue->due_date)) {
        return 0.0;
    }

    $overdueDays = $returnDate->diffInDays($issue->due_date);
    $dailyFineRate = $this->getSchoolSetting('library_fine_per_day', 1.00);

    return $overdueDays * $dailyFineRate;
}
```

The daily fine rate is configurable per school in School Settings → Academic.

---

## Availability Tracking

When a book is issued, `available_copies` decrements by 1. When returned, it increments. Books with `available_copies = 0` show as **Not Available** in search results and cannot be issued until a copy is returned.

---

## Library Dashboard

The librarian's dashboard shows:

| Metric | Description |
|---|---|
| Total Books | Total distinct titles in the library |
| Total Copies | Sum of all `total_copies` |
| Available Copies | Sum of all `available_copies` |
| Active Issues | Count of records with `status = issued` |
| Overdue Issues | Count of records where `due_date < today` and `status = issued` |
| Collected Fines | Sum of `fine_amount` where `fine_paid = true` |

---

## UI Pages

| Page | Route | Description |
|---|---|---|
| Books List | `/school/library/books` | Searchable book catalog |
| Add Book | `/school/library/books/create` | Add new book to catalog |
| Book Issues | `/school/library/issues` | Active and historical issues |
| Issue Book | `/school/library/issues/create` | Issue a book to student/staff |
| Overdue List | `/school/library/overdue` | All overdue issues |
| Fine Collection | `/school/library/fines` | Outstanding and collected fines |
