---
title: API Reference
---

# API Reference

Genius SMS exposes a REST API under `/api/v1/` for external consumers, mobile apps, and AJAX sub-requests. All endpoints return JSON responses following the JSON:API-lite format.

---

## Authentication

API authentication uses **Laravel Sanctum** token-based auth. Obtain a token via the login endpoint:

```
POST /api/v1/auth/login
```

**Request body:**

```json
{
  "email": "admin@school1.com",
  "password": "password"
}
```

**Response:**

```json
{
  "data": {
    "token": "1|abcdefghijklmnopqrstuvwxyz...",
    "user": {
      "id": 1,
      "name": "School Admin",
      "email": "admin@school1.com",
      "role": "school-admin"
    }
  },
  "message": "Login successful"
}
```

Include the token in subsequent requests as a Bearer token:

```
Authorization: Bearer 1|abcdefghijklmnopqrstuvwxyz...
```

---

## Response Format

All API responses follow the JSON:API-lite format:

```json
{
  "data": {},
  "meta": {
    "total": 100,
    "per_page": 15,
    "current_page": 1,
    "last_page": 7
  },
  "links": {
    "first": "https://school.example.com/api/v1/students?page=1",
    "last": "https://school.example.com/api/v1/students?page=7",
    "prev": null,
    "next": "https://school.example.com/api/v1/students?page=2"
  },
  "message": "Success"
}
```

For single-resource responses, `data` is an object. For collections, `data` is an array. The `meta` and `links` fields are only present for paginated collections.

---

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | OK — Request successful |
| 201 | Created — Resource created successfully |
| 204 | No Content — Successful deletion |
| 400 | Bad Request — Invalid request body |
| 401 | Unauthorized — Missing or invalid token |
| 403 | Forbidden — Insufficient permissions |
| 404 | Not Found — Resource does not exist |
| 422 | Unprocessable Entity — Validation failed |
| 429 | Too Many Requests — Rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limiting

All API routes are rate-limited:

| Route Group | Limit |
|---|---|
| Authentication endpoints | 10 requests/minute |
| General API endpoints | 60 requests/minute |
| Bulk operations | 10 requests/minute |

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1700000000
```

---

## Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/login` | Authenticate and get token |
| POST | `/api/v1/auth/logout` | Revoke current token |
| GET | `/api/v1/auth/me` | Get authenticated user details |
| POST | `/api/v1/auth/password/forgot` | Send password reset email |
| POST | `/api/v1/auth/password/reset` | Reset password with token |

---

## Students API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/students` | List students (paginated, filterable) |
| POST | `/api/v1/students` | Create a new student |
| GET | `/api/v1/students/{id}` | Get student details |
| PUT | `/api/v1/students/{id}` | Update student |
| DELETE | `/api/v1/students/{id}` | Soft-delete student |
| GET | `/api/v1/students/{id}/attendance` | Student attendance history |
| GET | `/api/v1/students/{id}/results` | Student exam results |
| GET | `/api/v1/students/{id}/fees` | Student fee records |

**Query parameters for GET /api/v1/students:**

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Search by name or admission number |
| `class_id` | integer | Filter by class |
| `section_id` | integer | Filter by section |
| `status` | string | `active`, `inactive`, `alumni` |
| `per_page` | integer | Results per page (default: 15, max: 100) |
| `page` | integer | Page number |

---

## Attendance API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/attendance` | List attendance records |
| POST | `/api/v1/attendance/bulk` | Bulk mark attendance |
| GET | `/api/v1/attendance/summary` | Attendance summary for date/class |
| PUT | `/api/v1/attendance/{id}` | Update single attendance record |

---

## Timetable API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/timetable` | Get timetable for class/section |
| GET | `/api/v1/timetable/today` | Today's slots for authenticated student/teacher |

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `class_id` | integer | Required. Class to fetch timetable for |
| `section_id` | integer | Optional. Filter by section |
| `day` | string | Optional. Day name (`monday`…`sunday`) |

---

## Fees API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/fees/student/{id}` | Fee summary for a student |
| POST | `/api/v1/fees/payments` | Record a fee payment |
| GET | `/api/v1/fees/payments/{id}` | Get payment details |

---

## Announcements API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/announcements` | List announcements (filtered by auth user's role) |
| GET | `/api/v1/announcements/{id}` | Get announcement details |

---

## School Setup API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/classes` | List all classes |
| GET | `/api/v1/classes/{id}/sections` | List sections for a class |
| GET | `/api/v1/subjects` | List subjects |
| GET | `/api/v1/academic-years` | List academic years |
| GET | `/api/v1/academic-years/current` | Get current academic year |

---

## Error Response Format

Validation errors (422):

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "class_id": ["The selected class id is invalid."]
  }
}
```

General errors (4xx/5xx):

```json
{
  "data": null,
  "message": "Resource not found."
}
```

---

## API Documentation (Swagger)

Full interactive API documentation is available via `darkaonline/l5-swagger` at:

```
GET /api/documentation
```

Accessible to super admin and school admin roles only. All endpoints are documented with request/response schemas, parameter descriptions, and example values.
