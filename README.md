# 📸 InstaClone Backend (Instagram-like Backend)

A **production-style backend** for an Instagram-like social media platform built using **Node.js, Express, MongoDB**, and **Cloudinary**.  
This project supports **authentication, private accounts, follow requests, posts, stories (24h expiry)** and **privacy-aware feeds**.

---

## 🚀 Features

### 🔐 Authentication & Security
- User registration & login
- JWT-based authentication
- Refresh token flow
- Secure routes using middleware
- Password hashing with bcrypt

---

### 👤 User Profiles
- Username, bio, profile picture
- Public / Private account toggle
- Update profile & profile picture
- Fetch public user profiles

---

### 🤝 Follow System (Instagram-style)
- Follow public accounts instantly
- Follow private accounts via request
- Accept / reject follow requests
- Unfollow users
- Followers & following lists
- Fully privacy-aware logic

---

### 🖼️ Posts
- Create posts (image / video)
- Cloudinary media uploads
- Like / Unlike posts
- Comment on posts
- Soft delete posts
- Pagination support

---

### 📰 Feed (Privacy Aware)
The feed only shows:
- Your own posts
- Posts from users you follow
- Posts from **public accounts**

> Private users’ posts are visible **only after follow request is accepted**

---

### ⏱️ Stories (24-Hour Expiry)
- Create image/video stories
- Auto-expire after 24 hours
- MongoDB TTL index (no cron jobs)
- Privacy-aware story visibility:
  - Public users → visible to all
  - Private users → visible to followers only

---

## 🧠 Key Backend Concepts Used
- JWT authentication & refresh tokens
- MongoDB relationships & population
- TTL indexes for auto-deletion
- Privacy-aware queries
- Modular MVC architecture
- Async error handling
- Cloudinary media storage

---

## 🗂️ Project Structure
src/
├── controllers/
│   ├── user.controller.js
│   ├── follow.controller.js
│   ├── post.controller.js
│   └── story.controller.js
│
├── models/
│   ├── user.models.js
│   ├── follow.models.js
│   ├── post.models.js
│   └── story.models.js
│
├── routes/
│   ├── user.routes.js
│   ├── follow.routes.js
│   ├── post.routes.js
│   └── story.routes.js
│
├── middlewares/
│   ├── auth.middleware.js
│   └── multer.middleware.js
│
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   └── Cloudinary.js
│
├── app.js
└── index.js


---

## 🛠️ Tech Stack
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT
- Cloudinary
- Multer
- bcrypt
- Postman

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

PORT=8000
MONGODB_URI=your_mongodb_uri
CORS_ORIGIN=*

ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

---

## ▶️ Run Locally

npm install
npm run dev

nginx
Copy code

Server will start on:

http://localhost:8000


---

## 🧪 API Testing
All APIs were tested using **Postman**, including:
- Authentication flows
- Follow requests & privacy checks
- Feed visibility logic
- Story expiry behavior

---

## 📌 Resume Description
> Built a scalable Instagram-like backend using Node.js, Express, and MongoDB featuring authentication, private accounts, follow requests, posts, and 24-hour stories with TTL-based auto-expiry. Implemented privacy-aware feeds, secure JWT authentication, and Cloudinary media uploads.

---

## 🔮 Future Enhancements
- Story highlights
- Notifications (WebSockets)
- AI-based caption generator
- Hashtags & search
- Story view analytics

---

## 👨‍💻 Author
**Ishaan Bansal**  
B.Tech IT | Backend Development | Full Stack | DSA
