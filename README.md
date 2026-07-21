# Mini Social Media Platform

A full-stack mini social media platform built with **HTML, CSS, Vanilla JavaScript** (frontend) and **Node.js, Express.js, MySQL** (backend). Includes JWT authentication, password hashing, image uploads, posts, comments, likes, and a follow system.

---

## ✨ Features

- **Authentication** — Register, Login, Logout with JWT tokens and bcrypt password hashing
- **User Profiles** — Name, email, bio, profile picture, edit profile
- **Posts** — Create, edit, delete posts with optional image upload
- **Comments** — Add, edit, delete comments on posts
- **Likes** — Like/unlike posts, view total like counts
- **Follow System** — Follow/unfollow users, view follower/following counts
- **Search** — Search for other users by name
- Fully responsive, modern UI (mobile-friendly)

---

## 🗂 Project Structure

```
social-media-platform/
│
├── client/                   # Frontend (HTML, CSS, Vanilla JS)
│   ├── index.html             # News feed page
│   ├── login.html             # Login page
│   ├── register.html          # Registration page
│   ├── profile.html           # Profile page (view/edit + follow)
│   ├── css/
│   │   └── style.css          # All styling
│   └── js/
│       ├── api.js             # Shared fetch wrapper + helpers
│       ├── auth.js             # Login/register logic
│       ├── main.js             # Feed, posts, likes, comments logic
│       └── profile.js          # Profile view/edit + follow logic
│
├── server/                    # Backend (Node.js + Express)
│   ├── server.js               # App entry point
│   ├── .env.example            # Environment variable template
│   ├── package.json
│   ├── config/
│   │   └── db.js               # MySQL connection pool
│   ├── middleware/
│   │   ├── auth.js              # JWT verification middleware
│   │   ├── upload.js            # Multer image upload config
│   │   └── errorHandler.js      # Centralized error handling
│   ├── models/
│   │   ├── userModel.js
│   │   ├── postModel.js
│   │   ├── commentModel.js
│   │   ├── likeModel.js
│   │   └── followModel.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── postController.js
│   │   ├── commentController.js
│   │   ├── likeController.js
│   │   └── followController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── postRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── likeRoutes.js
│   │   └── followRoutes.js
│   └── uploads/                # Uploaded images (profiles/ and posts/)
│
├── database/
│   └── database.sql            # MySQL schema (run this first)
│
└── README.md
```

---

## 🛠 Prerequisites

Before you begin, make sure you have installed:

- [Node.js](https://nodejs.org/) (v16 or later) and npm
- [MySQL](https://dev.mysql.com/downloads/) (v8 or later recommended)
- A code editor (e.g. VS Code)

---

## 🚀 Step-by-Step Setup Instructions

### 1. Extract the project

Unzip the project folder anywhere on your machine.

### 2. Set up the MySQL database

Open a terminal and log into MySQL:

```bash
mysql -u root -p
```

Then run the schema file to create the database and tables:

```bash
mysql -u root -p < database/database.sql
```

This creates a database called `social_media_db` with the `users`, `posts`, `comments`, `likes`, and `followers` tables.

### 3. Configure the backend environment variables

Navigate to the server folder:

```bash
cd server
```

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Open `.env` and fill in your actual MySQL credentials and a JWT secret:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=social_media_db
DB_PORT=3306
JWT_SECRET=some_long_random_secret_string
JWT_EXPIRES_IN=7d
```

> 🔐 Generate a strong `JWT_SECRET`, e.g. by running: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 4. Install backend dependencies

Still inside the `server/` folder:

```bash
npm install
```

### 5. Start the backend server

```bash
npm start
```

Or, for development with auto-restart on file changes:

```bash
npm run dev
```

You should see:
```
✅ Connected to MySQL database
🚀 Server running on http://localhost:5000
```

### 6. Run the frontend

The frontend is plain HTML/CSS/JS with no build step required. You can:

**Option A — Open directly in browser**
Just double-click `client/index.html` (it will redirect to `login.html` if you're not logged in).

**Option B — Serve with a local static server (recommended, avoids some browser file:// restrictions)**

Using VS Code's "Live Server" extension, or:

```bash
cd client
npx serve .
```

Then visit the URL it gives you (e.g. `http://localhost:3000`).

> ⚠️ Note: The frontend is hardcoded to call the API at `http://localhost:5000/api` (see `client/js/api.js`, `API_BASE_URL`). Change this constant if your backend runs elsewhere.

### 7. Try it out

1. Open the app → you'll be redirected to `register.html`
2. Create an account
3. You'll be logged in automatically and redirected to the news feed
4. Create a post, like it, comment on it
5. Search for other users, view their profile, follow them
6. Go to your own profile to edit your name, bio, and profile picture

---

## 🔌 API Overview

All endpoints are prefixed with `/api`. All routes except `/auth/*` require a `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT |
| POST | `/auth/logout` | Logout (client discards token) |
| GET | `/users/me` | Get logged-in user's profile |
| PUT | `/users/me` | Edit profile (name, bio, picture) |
| GET | `/users/:id` | Get a user's public profile |
| GET | `/users/search?q=` | Search users by name |
| POST | `/users/:id/follow` | Follow a user |
| DELETE | `/users/:id/follow` | Unfollow a user |
| GET | `/users/:id/followers` | List a user's followers |
| GET | `/users/:id/following` | List who a user is following |
| POST | `/posts` | Create a post (multipart, field: `image`) |
| GET | `/posts` | Get all posts (news feed) |
| GET | `/posts/user/:userId` | Get a user's posts |
| GET | `/posts/:id` | Get a single post |
| PUT | `/posts/:id` | Edit a post |
| DELETE | `/posts/:id` | Delete a post |
| POST | `/posts/:postId/comments` | Add a comment |
| GET | `/posts/:postId/comments` | List comments on a post |
| PUT | `/comments/:id` | Edit a comment |
| DELETE | `/comments/:id` | Delete a comment |
| POST | `/posts/:postId/like` | Like a post |
| DELETE | `/posts/:postId/like` | Unlike a post |
| GET | `/posts/:postId/likes` | List users who liked a post |

---

## 🗄 Database Schema Summary

- **users** — id, name, email, password (hashed), bio, profile_picture, timestamps
- **posts** — id, user_id (FK), content, image, timestamps
- **comments** — id, post_id (FK), user_id (FK), content, timestamps
- **likes** — id, post_id (FK), user_id (FK), unique(post_id, user_id)
- **followers** — id, follower_id (FK), following_id (FK), unique(follower_id, following_id)

See `database/database.sql` for full definitions, foreign keys, and indexes.

---

## 🔒 Security Notes

- Passwords are hashed with **bcrypt** (10 salt rounds) before storage — plaintext passwords are never saved.
- Authentication uses **JWT** tokens signed with a secret from `.env`, expiring after 7 days by default.
- All post/comment edit & delete actions verify that the requester is the resource **owner**.
- Uploaded files are restricted to image types and 5MB max size via **Multer**.
- User-generated content is HTML-escaped on the frontend to help mitigate XSS.

---

## 🧩 Tech Stack

**Frontend:** HTML5, CSS3, Vanilla JavaScript (Fetch API)
**Backend:** Node.js, Express.js
**Database:** MySQL (via `mysql2`)
**Auth:** JSON Web Tokens (`jsonwebtoken`), bcrypt
**File Uploads:** Multer
**Config:** dotenv

---

## 📌 Troubleshooting

- **"Error connecting to MySQL database"** → Double check `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `.env`, and that MySQL is running.
- **CORS errors in browser console** → Make sure the backend is running and `API_BASE_URL` in `client/js/api.js` matches your backend's actual host/port.
- **Images not showing** → Confirm the `server/uploads/profiles` and `server/uploads/posts` folders exist (they're created automatically on first upload) and that the server is serving `/uploads` statically (already configured in `server.js`).
- **401 Unauthorized on every request** → Your token may have expired; log out and log back in.

---

## 📄 License

This project is provided as a learning/starter template — free to use and modify.
