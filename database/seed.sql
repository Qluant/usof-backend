USE usof_db;

INSERT INTO users (id, login, password, full_name, email, profile_picture, rating, role, is_email_confirmed) VALUES
(1, 'admin', '$2b$10$wE9aW6vH/M2wRz2P6oYj7u3rXy6sM2gT5vL0.0oR6xPqW4yVnO6lO', 'System Administrator', 'admin@usof.com', 'default-avatar.png', 10, 'admin', TRUE),
(2, 'johndoe', '$2b$10$wE9aW6vH/M2wRz2P6oYj7u3rXy6sM2gT5vL0.0oR6xPqW4yVnO6lO', 'John Doe', 'john@example.com', 'default-avatar.png', 5, 'user', TRUE),
(3, 'alice_smith', '$2b$10$wE9aW6vH/M2wRz2P6oYj7u3rXy6sM2gT5vL0.0oR6xPqW4yVnO6lO', 'Alice Smith', 'alice@example.com', 'default-avatar.png', 8, 'user', TRUE),
(4, 'bob_dev', '$2b$10$wE9aW6vH/M2wRz2P6oYj7u3rXy6sM2gT5vL0.0oR6xPqW4yVnO6lO', 'Bob Developer', 'bob@example.com', 'default-avatar.png', 2, 'user', TRUE),
(5, 'emma_watson', '$2b$10$wE9aW6vH/M2wRz2P6oYj7u3rXy6sM2gT5vL0.0oR6xPqW4yVnO6lO', 'Emma Watson', 'emma@example.com', 'default-avatar.png', 4, 'user', TRUE)
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO categories (id, title, description) VALUES
(1, 'Node.js', 'Questions related to server-side JavaScript development with Node.js.'),
(2, 'MySQL', 'Relational database management system, SQL queries, and performance.'),
(3, 'Express', 'Fast, unopinionated, minimalist web framework for Node.js.'),
(4, 'JavaScript', 'Core language features, ECMAScript standards, and asynchronous programming.'),
(5, 'REST API', 'Design, architecture, standards, and best practices for building REST APIs.')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO posts (id, author_id, title, content, status) VALUES
(1, 2, 'How to handle async errors in Express middleware?', 'I am building an Express REST API and wondering what the best pattern is for catching asynchronous errors inside route handlers.', 'active'),
(2, 3, 'Optimizing MySQL connection pooling in high traffic apps', 'What are the recommended settings for mysql2 connection pool limit and queue limits in Node.js?', 'active'),
(3, 4, 'Differences between JWT and session-based authentication', 'Can someone explain when to choose stateless JWT tokens versus server-side Redis sessions?', 'active'),
(4, 5, 'How to design many-to-many relationships in MySQL?', 'Need advice on designing junction tables with composite primary keys and foreign key constraints.', 'active'),
(5, 2, 'Proper HTTP status codes for RESTful resources', 'Which status code is best when updating a resource partially versus completely?', 'active')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO post_categories (post_id, category_id) VALUES
(1, 1),
(1, 3),
(2, 1),
(2, 2),
(3, 1),
(3, 5),
(4, 2),
(5, 5)
ON DUPLICATE KEY UPDATE post_id=post_id;

INSERT INTO comments (id, post_id, author_id, content, status) VALUES
(1, 1, 3, 'You can wrap your controllers with an async handler wrapper function or use Express 5 native promise handling.', 'active'),
(2, 1, 4, 'Always make sure to pass the error to next(err) so your centralized error handler catches it.', 'active'),
(3, 2, 1, 'Set a reasonable connectionLimit matching your database server capacity, usually 10 to 20 for single Node instances.', 'active'),
(4, 3, 2, 'JWT is great for microservices and mobile apps where statelessness is beneficial.', 'active'),
(5, 4, 3, 'Use a junction table containing both foreign keys as a composite primary key.', 'active')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO likes (id, author_id, target_type, target_id, type) VALUES
(1, 1, 'post', 1, 'like'),
(2, 3, 'post', 1, 'like'),
(3, 4, 'post', 2, 'like'),
(4, 5, 'comment', 1, 'like'),
(5, 2, 'comment', 3, 'like')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO favorites (user_id, post_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5)
ON DUPLICATE KEY UPDATE user_id=user_id;
