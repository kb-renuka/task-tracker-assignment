# Task Tracker — Full Stack Assignment (Round 1)

A Task Management System with authentication, task CRUD, filtering/search, and a basic analytics dashboard. Built with the required stack: **React (frontend)**, **Node.js + Express (backend)**, **MongoDB (database)**.

## Tech Stack

- **Frontend:** React 19 (Vite), React Router, Axios, plain CSS (custom properties for theming — no UI framework, kept dependency-light)
- **Backend:** Node.js, Express, Mongoose, JWT (jsonwebtoken), bcryptjs
- **Database:** MongoDB (Mongoose ODM)

## Project Structure
task-tracker/
├── backend/
│ ├── config/db.js # MongoDB connection
│ ├── models/User.js # User schema (bcrypt password hashing)
│ ├── models/Task.js # Task schema + compound indexes
│ ├── middleware/auth.js # JWT verification (protect) + optional role guard
│ ├── middleware/errorHandler.js # Global error handler + asyncHandler wrapper
│ ├── controllers/authController.js
│ ├── controllers/taskController.js
│ ├── routes/authRoutes.js
│ ├── routes/taskRoutes.js
│ ├── server.js
│ └── .env.example
└── frontend/
├── src/
│ ├── api/axios.js # Axios instance + auth token interceptor
│ ├── context/AuthContext.jsx
│ ├── context/ThemeContext.jsx # Dark mode
│ ├── components/ # Navbar, FilterBar, TaskForm, TaskItem, TaskList,
│ │ # AnalyticsCards, Pagination, ProtectedRoute
│ ├── pages/ # Login, Signup, Dashboard
│ └── index.css # Theming + responsive layout
└── .env.example

## Setup Steps

### Prerequisites
- Node.js 18+
- A MongoDB instance — local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI to your local or Atlas connection string,
# and set JWT_SECRET to any long random string
npm run dev        # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your backend isn't on http://localhost:5000/api
npm run dev         # starts on http://localhost:5173
```

Open `http://localhost:5173`, sign up for an account, and start creating tasks.

### 3. Production build (frontend)

```bash
cd frontend
npm run build        # outputs static files to frontend/dist
```

## API Endpoints

All `/api/tasks/*` routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create account — `{ name, email, password }` |
| POST | `/api/auth/login` | Log in — `{ email, password }` → returns JWT |
| GET | `/api/auth/me` | Get current authenticated user |
| GET | `/api/tasks` | List tasks — query: `status, priority, search, sortBy, order, page, limit` |
| GET | `/api/tasks/:id` | Get a single task |
| POST | `/api/tasks` | Create a task — `{ title, description, status, priority, dueDate }` |
| PUT | `/api/tasks/:id` | Update a task (partial) |
| DELETE | `/api/tasks/:id` | Delete a task |
| PATCH | `/api/tasks/:id/complete` | Shortcut to mark a task `Done` |
| GET | `/api/tasks/analytics/summary` | Total / completed / pending / completion % / breakdown by status & priority |
| GET | `/api/tasks/admin/all` | **Admin only.** All tasks across all users, owner populated |
| DELETE | `/api/tasks/admin/:id` | **Admin only.** Delete any user's task by ID |

## Design Decisions

- **JWT auth, stateless** — token stored in `localStorage` on the client; every request attaches it via an Axios interceptor, and a 401 response auto-logs-out and redirects to `/login`.
- **Every task scoped to `req.user._id`** at the query level (not just the UI) — a user can never read, edit, or delete another user's tasks even if they guess an ID.
- **Filtering, search, sort, and pagination all happen server-side** in one `GET /api/tasks` call (not client-side array filtering), so the approach scales past a handful of tasks.
- **MongoDB indexes** — compound indexes on `{user, status}`, `{user, priority}`, `{user, dueDate}`, plus a text index on `title`, so filtered/sorted list queries and search stay fast as a user's task count grows, instead of full collection scans.
- **Analytics via aggregation pipeline** (`$group` by status/priority) rather than pulling all tasks into Node and counting in memory — cheaper and correct even at scale.
- **Centralized error handling** — every controller is wrapped in `asyncHandler`, so thrown errors (validation, not-found, cast errors, duplicate key) all funnel through one `errorHandler` middleware and return a consistent JSON shape instead of unhandled promise rejections or ad hoc try/catch in every route.
- **Dark mode** via a `data-theme` attribute + CSS custom properties, persisted in `localStorage` — no extra CSS-in-JS library needed.
- **Skeleton loading states** on both the task list and analytics cards, plus a distinct empty state, rather than a blank screen or spinner-only UX.

## Role-Based Access

The spec lists this as "if extended" — it's implemented, not just scaffolded:

- `User.role` is `"user"` (default) or `"admin"`.
- `middleware/auth.js` exports `requireRole(...roles)`, applied directly on the admin routes below — a non-admin's valid JWT still gets a `403 Forbidden` if they call these URLs, it's not just hidden in the UI.
- **`GET /api/tasks/admin/all`** — lists tasks across *every* user (not scoped to the caller), with each task's owner (`name`, `email`) populated. Supports the same `status`/`priority`/`search`/`page`/`limit` filters as the regular list endpoint.
- **`DELETE /api/tasks/admin/:id`** — deletes any task by ID regardless of which user owns it (the regular `DELETE /api/tasks/:id` stays scoped to the caller's own tasks).
- **Frontend**: a logged-in admin sees an extra "Admin" section on the dashboard — a table of every user's tasks with a delete action. Regular users never see this section at all (gated on `user.role === "admin"` from the JWT payload returned at login).

### Creating an admin account

Regular signup always creates a `role: "user"` account — nobody can self-promote. To create an admin account:

1. Set `ADMIN_SIGNUP_KEY` in the backend `.env` to any secret string of your choosing.
2. On the Signup page, click "Signing up as an admin?" to reveal an optional **Admin Key** field, and enter that same value.
3. If it matches the server-side `ADMIN_SIGNUP_KEY`, the new account is created with `role: "admin"`. If the field is left blank, or `ADMIN_SIGNUP_KEY` isn't set on the server, every signup is a regular user — admin signup is opt-in and off by default.

## Known Limitations / Next Steps

- No automated test suite (unit/integration tests) included — given the timeline, manual verification was prioritized: backend module load-checks and a clean production frontend build were both verified.
- Charts are implemented as stat cards + a completion progress bar rather than a charting library (kept dependency count low); swapping in a library like `recharts` for the analytics section would be a natural next step.
- No live deployment link included in this submission — see the note in the submission checklist below.

## Submission Checklist (per assignment)

- [ ] Push this repo to GitHub (frontend + backend)
- [x] README includes setup steps, API endpoints, and design decisions (this file)
- [ ] Add live deployment link here, if deployed
- [ ] Fill out the submission Google Form
