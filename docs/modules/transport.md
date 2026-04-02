---
title: Transport
---

# Transport Management

The Transport module manages the school's fleet of vehicles, defines bus routes with stops, and tracks which students are assigned to which vehicle and route.

---

## Vehicles

**Table:** `vehicles`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `name` | VARCHAR | Vehicle name/identifier, e.g., `Bus 01` |
| `registration_number` | VARCHAR | Vehicle registration plate |
| `type` | VARCHAR | e.g., `Bus`, `Mini Van`, `Car` |
| `capacity` | INT | Maximum passenger capacity |
| `driver_name` | VARCHAR NULL | Driver's name |
| `driver_phone` | VARCHAR NULL | Driver's contact number |
| `driver_license` | VARCHAR NULL | Driver's license number |
| `model` | VARCHAR NULL | Vehicle model |
| `year` | YEAR NULL | Manufacturing year |
| `status` | ENUM | `active`, `maintenance`, `inactive` |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## Routes

Routes define the path a vehicle takes, with named stops along the way.

**Table:** `transport_routes`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `vehicle_id` | BIGINT | FK to `vehicles` |
| `name` | VARCHAR | Route name, e.g., `North Zone Route` |
| `description` | TEXT NULL | Optional description |
| `start_location` | VARCHAR | Route starting point |
| `end_location` | VARCHAR | Route ending point |
| `distance_km` | DECIMAL NULL | Total route distance |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft deletes |

---

## Route Stops

Each route has multiple stops with sequence numbers and pickup times.

**Table:** `transport_route_stops`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `route_id` | BIGINT | FK to `transport_routes` |
| `name` | VARCHAR | Stop name/landmark |
| `pickup_time` | TIME | Morning pickup time at this stop |
| `dropoff_time` | TIME NULL | Evening dropoff time at this stop |
| `sequence` | INT | Order of the stop on the route |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## Student-Vehicle Assignments

Students are assigned to a vehicle and route stop.

**Table:** `student_transport`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `school_id` | BIGINT | FK to `schools` |
| `student_id` | BIGINT | FK to `students` |
| `vehicle_id` | BIGINT | FK to `vehicles` |
| `route_id` | BIGINT | FK to `transport_routes` |
| `stop_id` | BIGINT NULL | FK to `transport_route_stops` |
| `academic_year_id` | BIGINT | FK to `academic_years` |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## UI Pages

| Page | Route | Description |
|---|---|---|
| Vehicles | `/school/transport/vehicles` | Fleet management |
| Routes | `/school/transport/routes` | Route list with stop management |
| Student Assignment | `/school/transport/assignments` | Assign students to vehicles/routes |
| Route Detail | `/school/transport/routes/{id}` | View stops and assigned students |
