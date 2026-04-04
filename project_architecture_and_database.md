# StudentOS Architecture & Database Design 🎓

Welcome to the architectural overview and database schema of **StudentOS**. This document breaks down the project structure and the detailed data models powering the application.

## 1. Top-Level Architecture

**StudentOS** uses a modern, decoupled **Client-Server Architecture**:
- **Backend**: Java Spring Boot application exposing a RESTful API.
- **Frontend**: React application bundled with Vite.
- **Database**: Relational Database driven by Hibernate (JPA).

```text
studentOS/
├── backend/                # Java Spring Boot Server
│   └── src/main/java/com/studentos/backend/
│       ├── config/         # System & Security configs (JWT, CORS, etc.)
│       ├── controller/     # REST API Endpoints
│       ├── service/        # Core Business Logic
│       ├── repository/     # Data Access Layer (Spring Data JPA)
│       ├── model/          # Database Entities
│       └── dto/            # Data Transfer Objects
├── frontend/               # React Frontend Application (Vite)
│   └── src/
│       ├── pages/          # Main Views (Login, Dashboard, Course Reviews)
│       ├── components/     # Reusable UI Elements (Cards, Navbars, Modals)
│       ├── context/        # Global State Management (e.g., AuthContext)
│       ├── hooks/          # Custom React Hooks
│       └── main.jsx        # App Entry Point
└── run-all.bat            # Startup script for seamless local development
```

---

## 2. Database Design & Entity Relationships

The backend uses **Spring Data JPA** to interact with a Relational Database. The schema is highly relational, centering around the `User` entity. 

### Core Entities & Their Roles

#### `User` (`users` table)
The central entity for authentication and user profiles.
- **Primary Fields**: `id`, `name`, `username`, `email`, `password`, `role` (STUDENT/ADMIN).
- **Relationships**: `OneToMany` with virtually all entities created by the user (Reviews, Comments, Items, Events, Messages).

#### `CourseReview` (`course_reviews` table)
Stores student feedback on courses and professors.
- **Relationships**: `ManyToOne` with `User` (the reviewer), `OneToMany` with `Comment`.

#### `Comment` (`comments` table)
Threaded discussions attached to course reviews.
- **Relationships**: `ManyToOne` with `User` and `CourseReview`, `OneToMany` (Self-referencing) for `replies`.

#### Other Supporting Entities:
- **Campus Community**: `MarketplaceItem`, `LostFoundItem`, `CampusEvent`, `CampusService`
- **Academic & Utility**: `Resource`, `StudyTask`, `ReviewRequest`, `TuitionFee`
- **Communication**: `Activity`, `Message`, `Notification`, `TrafficRecord`

---

## 3. Frontend to Backend Connection 🔌

The frontend and backend run as distinct services on different ports but act as a cohesive unit. Here is how they are connected:

### API Configuration
- The frontend relies on the native browser **`fetch` API** to communicate with the Spring Boot backend. 
- The base URL is injected dynamically through Vite's environment configurations. During local development, the `.env` file points requests to your local Spring Boot instance:
  ```env
  VITE_API_URL=http://localhost:8081
  VITE_WS_URL=http://localhost:8081/ws-studentos
  ```
- React components retrieve this global URL utilizing `import.meta.env.VITE_API_URL`.

### Authentication & State
- User login state is maintained through a React Context API inside `AuthContext.jsx`.
- When a user logs in via `POST /api/auth/login`, the backend issues the user's data payload.
- The `AuthContext` writes this object to local storage (`studentos_user`). By checking local storage in `index.jsx`, the frontend identifies active sessions across page reloads.

---

## 4. Data Flow Example

Here is how data flows sequentially when interacting with the system (e.g., **Adding a Comment**):

1. **Frontend Action**: A user submits a comment via a React Component (`CourseReviews.jsx`).
2. **API Request**: The React application grabs `import.meta.env.VITE_API_URL` and executes a `POST` request directly to `/api/reviews/{id}/comments`.
3. **Controller Layer**: The Spring Boot `CourseReviewController` or `CommentController` captures the HTTP payload.
4. **Service Layer**: The `CommentService` links the authenticated `User` and the target `CourseReview`, assembling a `Comment` entity.
5. **Repository Layer**: The `CommentRepository` executes a SQL `INSERT` into the database.
6. **Side Effects**: Secondary systems log the activity and dispatch notifications.
7. **Response**: A `201 Created` status returns, causing the React component's `useEffect()` to independently re-query updated comments, patching the UI immediately.
