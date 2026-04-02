---
title: Hostel
---

# Hostel Management

The Hostel module manages on-campus residential facilities — organizing accommodation into blocks and rooms, and tracking which students are allocated to which room.

---

## Hostel Blocks

A hostel block represents a physical building or wing of the hostel.

**Table:** `hostel_blocks`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `name` | VARCHAR | Block name, e.g., `Block A`, `Girls' Wing` |
| `type` | ENUM | `boys`, `girls`, `mixed` |
| `warden_id` | BIGINT NULL | FK to `staff` — assigned warden |
| `description` | TEXT NULL | Optional description |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## Hostel Rooms

**Table:** `hostel_rooms`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `block_id` | BIGINT | FK to `hostel_blocks` |
| `room_number` | VARCHAR | Room identifier, e.g., `101`, `A-201` |
| `type` | VARCHAR | e.g., `Single`, `Double`, `Dormitory` |
| `capacity` | INT | Maximum occupants |
| `current_occupancy` | INT | Current number of residents |
| `floor` | INT NULL | Floor number |
| `amenities` | TEXT NULL | Comma-separated or JSON list |
| `monthly_fee` | DECIMAL NULL | Monthly hostel fee for this room |
| `status` | ENUM | `available`, `full`, `maintenance` |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## Student Room Allocations

**Table:** `hostel_allocations`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `student_id` | BIGINT | FK to `students` |
| `room_id` | BIGINT | FK to `hostel_rooms` |
| `academic_year_id` | BIGINT | FK to `academic_years` |
| `allocation_date` | DATE | Date student moved in |
| `vacate_date` | DATE NULL | Date student moved out |
| `status` | ENUM | `active`, `vacated` |
| `notes` | TEXT NULL | Optional notes |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## Occupancy Management

When a student is allocated to a room:
1. `current_occupancy` on the room is incremented
2. If `current_occupancy >= capacity`, room status becomes `full`

When a student vacates:
1. `vacate_date` is set on the allocation record
2. Allocation status becomes `vacated`
3. `current_occupancy` decrements
4. Room status returns to `available` if applicable

---

## Warden Role

The warden is a staff member assigned to manage a hostel block. The warden can:
- View all room allocations in their block
- Mark student check-in/check-out
- View occupancy reports

Warden access is granted to any staff member with the `warden` designation or explicit assignment via `hostel_blocks.warden_id`.

---

## UI Pages

| Page | Route | Description |
|---|---|---|
| Hostel Overview | `/school/hostel` | Blocks and occupancy summary |
| Blocks | `/school/hostel/blocks` | Manage hostel blocks |
| Rooms | `/school/hostel/rooms` | Manage rooms per block |
| Allocations | `/school/hostel/allocations` | View and manage student allocations |
| Allocate Student | `/school/hostel/allocations/create` | Assign a student to a room |
