# GamerEars Backend — Documentation

## 1. Engage

* **Challenge:** Build a robust, scalable RESTful API for a gaming community and Q&A platform inspired by Stack Overflow. The platform requires two distinct user roles (`user`, `admin`), email verification before account activation, password recovery, community-driven content moderation with admin content immutability, and dynamic reputation scoring (XP).
* **Goal:** Develop MVC backend with zero dependencies on heavy ORMsm which contain functionality of working with posts, categories, profiles, comments, likes and filtering topics.

---

## 2. Investigate

### 2.1 Technical Decisions Matrix

| Domain | Choice | Engineering Justification |
| :--- | :--- | :--- |
| **Runtime and Framework** | Node.js + Express.js | Non-blocking asynchronous I/O ideal for high-throughput forum APIs. |
| **Database** | MySQL 8 (`mysql2/promise`) | Relational model with ACID guarantees, foreign keys, and connection pooling. |
| **Database Schema** | 3NF Relational Schema | 7 consolidated tables with strict integrity and single-cell atomicity. |
| **Authentication** | Stateless JWT (Bearer Tokens) | Scalable auth verification without server-side session stores. |
| **Password Hashing** | `bcryptjs` (10 rounds) | Pure JavaScript implementation, easy to use and has no problems with builds. |
| **Email Service** | Nodemailer (Gmail SMTP) | Idempotent token delivery. |
| **Archiving** | `status`: active/inactive | Admins can archive topics/comments on their choice, to not share them with all users. |
| **Content Moderation** | Admin Content Immutability | Admins can moderate categories and lock status, but cannot rewrite user posts or comments. |

---

### 2.2 Layered MVC Architecture

```
Client Request
  └── routes/ (Route definition and validation middleware)
       └── middlewares/ (JWT authentication, RBAC, Multer upload)
            └── controllers/ (HTTP extraction, response envelopes)
                 └── services/ (Business logic and domain rules)
                      └── models/ (Active Record and SQL execution)
                           └── MySQL Database
```

* **`routes/`:** Maps endpoints to controllers, binds validation rules (`validate.middleware.js`), and protects private routes (`auth.middleware.js`).
* **`controllers/`:** Extracts request parameters/body, executes domain services, and wraps responses in standard envelopes (`successResponse`).
* **`services/`:** Implements all core logic, permissions (e.g. author vs admin update rights), and transactional orchestration.
* **`models/`:** [`BaseModel.js`](file:///c:/Users/qluant/Desktop/University/campus/3_year/1_semester/usof/usof-backend/src/models/BaseModel.js) provides generic CRUD and pagination; domain models ([`Post.js`](file:///c:/Users/qluant/Desktop/University/campus/3_year/1_semester/usof/usof-backend/src/models/Post.js), [`User.js`](file:///c:/Users/qluant/Desktop/University/campus/3_year/1_semester/usof/usof-backend/src/models/User.js)) implement complex queries.

---

### 2.3 SOLID Principles in Practice

* **Single Responsibility:** Each controller and service manages exactly one entity (`auth`, `post`, `comment`, `category`, `user`, `like`).
* **Open/Closed:** New entity endpoints and models extend `BaseModel` without modifying core CRUD methods.
* **Liskov Substitution:** Specialized models substitute the base model cleanly while inheriting generic query helpers.
* **Interface Segregation:** Controllers receive concise, targeted service methods rather than monolithic database handles.
* **Dependency Inversion:** Database access is encapsulated through data access objects, abstracting SQL connection details from controllers.

---

## 3. Act — System Algorithms and workflows

### 3.1 Authentication and Verification Lifecycle
1. **Registration (`POST /api/auth/register`):** Validates password confirmation, checks login/email uniqueness, hashes password, creates unconfirmed user (`is_email_confirmed = FALSE`), and sends confirmation link.
2. **Idempotent Confirmation (`GET /api/auth/confirm-email/:token`):** Looks up user by `email_confirm_token` and updates `is_email_confirmed = TRUE`. Idempotent design ensures page reloads or duplicate requests return `200 OK` rather than failing.
3. **Login (`POST /api/auth/login`):** Validates credentials with `bcryptjs.compare`. Blocks unconfirmed accounts (`403 Forbidden`). Issues signed JWT token.
4. **Password Reset:** Generates time-limited token (`reset_password_token`, 1-hour expiration) via email, allowing users to safely set a new password.

### 3.2 Visibility and Moderation Matrix
* **Active Topics:** Visible publicly to all visitors and users.
* **Inactive / Locked Topics:** Visible exclusively to the original author and administrators.
* **Admin Immutability Rule:** Administrators can modify post categories (`category_id`) and toggle `status` (`active` -> `inactive`). Attempting to alter title or content on another player's post returns `403 Forbidden`.
* **Author Comment Editing:** Authors can update their own comment text; administrators can only archive or delete inappropriate comments.

### 3.3 Dynamic User Reputation (XP Calculation)
User rating is calculated dynamically upon every like/dislike event:

Total XP = sum(Post Likes - Post Dislikes) + sum(Comment Likes - Comment Dislikes)

Whenever a vote is cast or updated in `like.service.js`, the author's rating is recomputed in the database and synchronized.

### 3.4 Role and Access Control Matrix

| Action | Visitor | User | Admin |
| :--- | :---: | :---: | :---: |
| View active posts and comments | ✓ | ✓ | ✓ |
| Register, log in, reset password | ✓ | ✓ | ✓ |
| Create post, comment, like, favorite | ✗ | ✓ | ✓ |
| Edit own post content | ✗ | ✓ | ✓ |
| Edit others' post content | ✗ | ✗ | ✗ |
| Change others' post categories and status | ✗ | ✗ | ✓ |
| Create, update, or delete categories | ✗ | ✗ | ✓ |
| View admin stats (`/api/admin/stats`) | ✗ | ✗ | ✓ |
| Change user roles | ✗ | ✗ | ✓ |

---

## 4. Backend Screenshots Guide

Save the following screenshots in `usof-backend/docs/screenshots/`:

| Filename | Command / Action | Expected Result |
| :--- | :--- | :--- |
| `01-server-boot.png` | Terminal running `npm run dev` or `npm start` | Clean server boot showing port 3000 and database connected. |
| `02-db-init.png` | Terminal running `npm run db:init` | Success message confirming database initialization and seed. |
| `03-login-admin.png` | Postman / cURL: `POST /api/auth/login` as `admin` | HTTP 200 with JWT token and admin user payload. |
| `04-login-user.png` | Postman / cURL: `POST /api/auth/login` as `shadow_hunter` | HTTP 200 with JWT token and user payload. |
| `05-get-posts.png` | Postman / cURL: `GET /api/posts?sort=likes&order=desc` | HTTP 200 returning sorted posts array with categories and score. |
| `06-create-post.png` | Postman / cURL: `POST /api/posts` with Bearer token | HTTP 201 with newly created post object. |
| `07-admin-stats.png` | Postman / cURL: `GET /api/admin/stats` with Admin token | HTTP 200 returning users, posts, comments, categories counts. |
| `08-admin-forbidden.png` | Postman / cURL: Admin editing other user's post content | HTTP 403 `Content is not editable even for admins.` |

---

## 5. Specification and Requirements Compliance Checklist

All project requirements and rubric criteria have been fully verified and implemented:

### Authentication Module
- [x] `POST /api/auth/register` — User registration with login, password, password confirmation, and email validation.
- [x] `GET /api/auth/confirm-email/:token` — Email verification link handler (idempotent; activates account).
- [x] `POST /api/auth/login` — Sign in with username or email + password. Only accounts with confirmed email can authenticate.
- [x] `POST /api/auth/logout` — Securely terminates session / client authorization state.
- [x] `POST /api/auth/password-reset` — Requests password reset link delivered via transactional email.
- [x] `POST /api/auth/password-reset/:confirm_token` — Validates one-time token and updates account password with bcryptjs.

### User Management Module
- [x] `GET /api/users` — Paginated list of all registered users (authenticated).
- [x] `GET /api/users/:user_id` — Detailed public user profile with dynamic rating/XP.
- [x] `POST /api/users` — Administrative user creation with assigned role (`admin` only).
- [x] `PATCH /api/users/avatar` — Upload and serve custom avatar images using Multer.
- [x] `PATCH /api/users/:user_id` — Update profile info (`login`, `full_name`, `email`, `role`).
- [x] `DELETE /api/users/:user_id` — Cascade-delete account and associated content (`admin` or owner).

### Post Module
- [x] `GET /api/posts` — Public feed with pagination (`page`, `limit`), sorting, and filtering.
- [x] `GET /api/posts/:post_id` — Single post details with author rating, score, and tags.
- [x] `POST /api/posts` — Create new topic with title, body, and category bindings (`auth` required).
- [x] `PATCH /api/posts/:post_id` — Edit topic (author: title/body/categories; admin: categories/status only).
- [x] `DELETE /api/posts/:post_id` — Cascade-delete topic (`author` or `admin`).
- [x] `GET /api/posts/:post_id/comments` — Retrieve all active responses for a topic.
- [x] `POST /api/posts/:post_id/comments` — Submit a response (`auth` required).
- [x] `GET /api/posts/:post_id/like` — Fetch likes and dislikes tally for a topic.
- [x] `POST /api/posts/:post_id/like` — Cast or toggle vote (`like` or `dislike`).
- [x] `DELETE /api/posts/:post_id/like` — Remove reaction from a topic.

### Comments Module
- [x] `GET /api/comments/:comment_id` — Retrieve comment data by identifier.
- [x] `PATCH /api/comments/:comment_id` — Update comment (author: content; admin: active/inactive status only).
- [x] `DELETE /api/comments/:comment_id` — Delete comment (`author` or `admin`).
- [x] `GET /api/comments/:comment_id/like` — Fetch like score under comment.
- [x] `POST /api/comments/:comment_id/like` — Vote on comment (`like` / `dislike`).
- [x] `DELETE /api/comments/:comment_id/like` — Clear vote on comment.

### Categories Module
- [x] `GET /api/categories` — List all categories enriched with live topic count (`posts_count`).
- [x] `GET /api/categories/:category_id` — Single category view and metadata.
- [x] `POST /api/categories` — Admin-only category creation (`title`, `description`).
- [x] `PATCH /api/categories/:category_id` — Admin-only category modification.
- [x] `DELETE /api/categories/:category_id` — Admin-only category removal.

### Filtering, Sorting and Moderation
- [x] Sorting by total score (likes − dislikes) by default.
- [x] Sorting by publication date (`publish_date`) with ascending/descending order support.
- [x] Filtering by categories, status (`active`/`inactive`), and author.
- [x] Content moderation locking: status toggling hides inactive posts from regular visitors while preserving audit trail for admins.
- [x] Strict admin immutability: administrators cannot alter another player's post title or content (HTTP 403).

### Creative Features and Quality
- [x] **Favorites System:** `POST /api/posts/:id/favorite` and `GET /api/users/favorites`.
- [x] **Dynamic XP Calculation:** Automatic synchronization of user rating based on community votes.
- [x] **Transactional Email Service:** Real Gmail SMTP delivery with fallback handling.
- [x] **Code Standards:** 0 npm audit vulnerabilities and 0 deprecation warnings.
