# USOF Backend - Comprehensive Project Implementation Plan

## 1. Project Overview & Objectives

**USOF** is a RESTful API backend for a StackOverflow-like Question and Answer platform tailored for developers. It enables users to ask questions (posts), submit answers and discussions (comments), categorize topics, vote (like/dislike), and manage reputations.

### Key Constraints & Standards
* **Stack**: Node.js, Express, MySQL (`mysql2/promise`), JavaScript (ES6+).
* **Architecture**: Model-View-Controller (MVC), Object-Oriented Programming (OOP), and SOLID design principles.
* **Code Style**: Clean, maintainable, readable Strong-Junior level code adhering to JavaScript and SQL style guides.
* **Zero Unapproved Comments**: Per project guidelines, source code will not contain redundant/unnecessary comments unless explicitly requested.
* **Security**: Password hashing (`bcrypt`), JWT authentication, input sanitization/validation, role-based access control (`user`, `admin`), email verification before login.
* **Assessment Readiness**: Passing peer-to-peer evaluations (3 peers) and automated tests with a target score of 90+/100.

---

## 2. System Architecture & Project Structure

The project follows a layered MVC + Service architecture ensuring separation of concerns:

```
usof-backend/
├── config/
│   ├── db.config.js          # MySQL connection pool configuration
│   ├── app.config.js         # Environment and application constants
│   └── mail.config.js        # Nodemailer transport configuration
├── database/
│   ├── schema.sql            # Complete DB DDL schema & table creation
│   ├── seed.sql              # Initial test data (>= 5 records per table)
│   └── init.js               # Database initialization & migration runner
├── src/
│   ├── controllers/          # Request handling & HTTP responses
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── post.controller.js
│   │   ├── category.controller.js
│   │   ├── comment.controller.js
│   │   ├── like.controller.js
│   │   └── admin.controller.js
│   ├── models/               # OOP Data Access Objects / Entities
│   │   ├── BaseModel.js
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Category.js
│   │   ├── Comment.js
│   │   ├── Like.js
│   │   └── Favorite.js       # Creative feature
│   ├── services/             # Core business logic
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── post.service.js
│   │   ├── category.service.js
│   │   ├── comment.service.js
│   │   ├── like.service.js
│   │   └── mail.service.js
│   ├── middlewares/          # Express middlewares
│   │   ├── auth.middleware.js       # JWT validation
│   │   ├── role.middleware.js       # Role-based access control (Admin / User)
│   │   ├── upload.middleware.js     # Multer file upload handler
│   │   ├── validate.middleware.js   # Request payload validation
│   │   └── error.middleware.js      # Centralized error handler
│   ├── routes/               # API endpoint definitions
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── post.routes.js
│   │   ├── category.routes.js
│   │   ├── comment.routes.js
│   │   ├── like.routes.js
│   │   ├── admin.routes.js
│   │   └── index.js
│   ├── utils/                # Helper utilities
│   │   ├── AppError.js       # Custom error class
│   │   ├── response.util.js  # Standardized API response wrappers
│   │   └── token.util.js     # JWT & confirmation token helpers
│   └── app.js                # Express app setup & middleware pipeline
├── uploads/                  # Local storage for avatars and post images
│   ├── avatars/
│   └── posts/
├── public/                   # Static assets & Admin panel UI (if applicable)
├── docs/                     # Documentation & specifications
├── .env.example              # Environment variables template
├── server.js                 # Server entry point
└── package.json
```

---

## 3. Database Schema Design

### Relational Schema Summary
1. **`users`**
   * `id` INT AUTO_INCREMENT PRIMARY KEY
   * `login` VARCHAR(50) NOT NULL UNIQUE
   * `password` VARCHAR(255) NOT NULL
   * `full_name` VARCHAR(100) NOT NULL
   * `email` VARCHAR(100) NOT NULL UNIQUE
   * `profile_picture` VARCHAR(255) DEFAULT 'default-avatar.png'
   * `rating` INT DEFAULT 0
   * `role` ENUM('user', 'admin') DEFAULT 'user'
   * `is_email_confirmed` BOOLEAN DEFAULT FALSE
   * `email_confirm_token` VARCHAR(255) NULL
   * `reset_password_token` VARCHAR(255) NULL
   * `reset_password_expires` DATETIME NULL
   * `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   * `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

2. **`categories`**
   * `id` INT AUTO_INCREMENT PRIMARY KEY
   * `title` VARCHAR(50) NOT NULL UNIQUE
   * `description` TEXT
   * `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

3. **`posts`**
   * `id` INT AUTO_INCREMENT PRIMARY KEY
   * `author_id` INT NOT NULL (FK -> `users.id` ON DELETE CASCADE)
   * `title` VARCHAR(255) NOT NULL
   * `content` TEXT NOT NULL
   * `status` ENUM('active', 'inactive') DEFAULT 'active'
   * `publish_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   * `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

4. **`post_categories`** (Many-to-Many junction)
   * `post_id` INT NOT NULL (FK -> `posts.id` ON DELETE CASCADE)
   * `category_id` INT NOT NULL (FK -> `categories.id` ON DELETE CASCADE)
   * PRIMARY KEY (`post_id`, `category_id`)

5. **`comments`**
   * `id` INT AUTO_INCREMENT PRIMARY KEY
   * `post_id` INT NOT NULL (FK -> `posts.id` ON DELETE CASCADE)
   * `author_id` INT NOT NULL (FK -> `users.id` ON DELETE CASCADE)
   * `content` TEXT NOT NULL
   * `status` ENUM('active', 'inactive') DEFAULT 'active'
   * `publish_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   * `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

6. **`likes`** (Handles both Posts and Comments)
   * `id` INT AUTO_INCREMENT PRIMARY KEY
   * `author_id` INT NOT NULL (FK -> `users.id` ON DELETE CASCADE)
   * `target_type` ENUM('post', 'comment') NOT NULL
   * `target_id` INT NOT NULL
   * `type` ENUM('like', 'dislike') NOT NULL
   * `publish_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   * UNIQUE KEY `unique_user_target_like` (`author_id`, `target_type`, `target_id`)

7. **`favorites`** (Creative Feature: User saved/bookmarked posts)
   * `user_id` INT NOT NULL (FK -> `users.id` ON DELETE CASCADE)
   * `post_id` INT NOT NULL (FK -> `posts.id` ON DELETE CASCADE)
   * `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   * PRIMARY KEY (`user_id`, `post_id`)

---

## 4. Implementation Phases & Milestones

### Phase 1: Foundation & Infrastructure
* **Step 1.1**: Initialize Node.js environment, `package.json`, install production dependencies (`express`, `mysql2`, `bcrypt`, `jsonwebtoken`, `dotenv`, `cors`, `multer`, `nodemailer`) and development tools.
* **Step 1.2**: Configure environment management (`.env`, `.env.example`, `config/`).
* **Step 1.3**: Implement MySQL database connection pool with automatic initialization scripts (`schema.sql`, `seed.sql`, `init.js`).
* **Step 1.4**: Build core utilities: custom `AppError`, standardized JSON response wrapper, async error handling boundary.

### Phase 2: Authentication & Authorization Module
* **Step 2.1**: Implement `User` model with secure password hashing and verification.
* **Step 2.2**: Implement `MailService` for sending email confirmation links and password reset tokens.
* **Step 2.3**: Build Auth endpoints:
  * `POST /api/auth/register` (creates unconfirmed account, sends verification email).
  * `GET /api/auth/confirm-email/:token` (activates account upon clicking email link).
  * `POST /api/auth/login` (checks credentials & confirmed email status, generates JWT token).
  * `POST /api/auth/logout` (invalidates session / clears client token).
  * `POST /api/auth/password-reset` (generates reset token and sends email).
  * `POST /api/auth/password-reset/:confirm_token` (sets new password).
* **Step 2.4**: Implement `auth.middleware.js` (JWT verification) and `role.middleware.js` (Role validation).

### Phase 3: User Management Module
* **Step 3.1**: Build User endpoints:
  * `GET /api/users` (all users, public view with sanitized fields).
  * `GET /api/users/:user_id` (single user profile with calculated rating).
  * `POST /api/users` (admin-only user/admin creation).
  * `PATCH /api/users/avatar` (upload/update profile picture via Multer).
  * `PATCH /api/users/:user_id` (update user profile data: full name, email, role if admin).
  * `DELETE /api/users/:user_id` (delete user account with proper cascading).
* **Step 3.2**: Implement rating calculation service based on post/comment like/dislike balance.

### Phase 4: Categories Module
* **Step 4.1**: Build Category model and service.
* **Step 4.2**: Build Category endpoints:
  * `GET /api/categories` (public list of all categories).
  * `GET /api/categories/:category_id` (category details).
  * `GET /api/categories/:category_id/posts` (all posts under a specific category).
  * `POST /api/categories` (admin-only creation).
  * `PATCH /api/categories/:category_id` (admin-only update).
  * `DELETE /api/categories/:category_id` (admin-only delete).

### Phase 5: Posts Module (Core Q&A)
* **Step 5.1**: Build Post model supporting many-to-many category relationships and image uploads.
* **Step 5.2**: Build Post endpoints:
  * `GET /api/posts` (public with pagination, sorting by likes/date, filtering by categories/date/status).
  * `GET /api/posts/:post_id` (single post details with category tags and author info).
  * `POST /api/posts` (create post with categories and content).
  * `PATCH /api/posts/:post_id` (author: update title/content/categories; admin: toggle active/inactive status or change category).
  * `DELETE /api/posts/:post_id` (author or admin delete).
  * `GET /api/posts/:post_id/categories` (get categories for post).
* **Step 5.3**: Implement status visibility rules (regular users only see active posts + own inactive posts; admins see all).

### Phase 6: Comments Module
* **Step 6.1**: Build Comment model and service.
* **Step 6.2**: Build Comment endpoints:
  * `GET /api/posts/:post_id/comments` (public: list comments under post).
  * `POST /api/posts/:post_id/comments` (authenticated user: create comment under active post).
  * `GET /api/comments/:comment_id` (get comment details).
  * `PATCH /api/comments/:comment_id` (author or admin: toggle status active/inactive).
  * `DELETE /api/comments/:comment_id` (author or admin: delete comment).

### Phase 7: Likes & Rating Module
* **Step 7.1**: Build Like model handling both posts and comments with toggle/switch logic (like <-> dislike <-> remove).
* **Step 7.2**: Build Like endpoints:
  * `GET /api/posts/:post_id/like` (get all likes/dislikes on post).
  * `POST /api/posts/:post_id/like` (add/update like or dislike on post).
  * `DELETE /api/posts/:post_id/like` (remove user like from post).
  * `GET /api/comments/:comment_id/like` (get all likes/dislikes on comment).
  * `POST /api/comments/:comment_id/like` (add/update like or dislike on comment).
  * `DELETE /api/comments/:comment_id/like` (remove user like from comment).
* **Step 7.3**: Synchronize user rating updates when likes/dislikes are added, modified, or deleted.

### Phase 8: Admin Panel & Administrative Controls
* **Step 8.1**: Build dedicated Admin controllers/routes or integrated Admin API for system-wide entity management.
* **Step 8.2**: Provide a lightweight web UI or static dashboard in `public/admin` for demonstrating full CRUD across users, posts, categories, and comments.

### Phase 9: Creative Features (Act: Creative)
* **Step 9.1**: Favorites Feature:
  * `POST /api/posts/:post_id/favorite` (add post to favorites).
  * `DELETE /api/posts/:post_id/favorite` (remove post from favorites).
  * `GET /api/users/me/favorites` (list user's bookmarked posts).
* **Step 9.2**: Search & Post Activity Feed:
  * Full-text search endpoint for posts (`GET /api/posts/search?q=...`).

### Phase 10: Verification, Seeding & Documentation
* **Step 10.1**: Prepare rich seed dataset with at least 5-10 realistic entries for each entity.
* **Step 10.2**: Create comprehensive Postman/REST client test collection verifying all business rules, role permissions, and edge cases.
* **Step 10.3**: Write detailed `README.md` containing:
  * Project overview & architectural overview.
  * Prerequisites, installation, and environment setup instructions.
  * Database initialization commands.
  * Full API Reference with sample requests/responses.
  * Screenshots of API in action and database schema diagrams.

---

## 5. Development Rules & Process Protocol

1. **Step-by-Step Execution**: Every phase and step will be developed incrementally with user approval before modifying code.
2. **Explanations**: Each proposed change and technical decision will be clearly documented and explained.
3. **No Redundant Comments**: Clean, self-documenting code with zero extraneous comments in files.
