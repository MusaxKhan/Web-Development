# Property Dealer CRM System
### CS-4032 Web Programming — Assignment 3

A full-stack CRM system for property dealers built with Next.js (App Router), MongoDB, Socket.io, and Tailwind CSS.

---

## ⚡ Quick Start (3 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.local
```

Edit `.env.local`:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/Assignment3?retryWrites=true&w=majority
JWT_SECRET=any_random_strong_string_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```
  
> **Email:** Use Gmail App Password (not your regular password). Generate at: Google Account → Security → 2FA → App Passwords  
> **JWT_SECRET:** Any random string, e.g. `mysecretkey123`

### 3. Run the App
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗 Tech Stack
- **Next.js 14** (App Router)
- **MongoDB + Mongoose**
- **JWT Authentication** (bcryptjs + jsonwebtoken)
- **Socket.io** (real-time updates)
- **Tailwind CSS**
- **Nodemailer** (email notifications)

---

## 📁 Project Structure
```
├── app/
│   ├── login/page.js          # Login page
│   ├── signup/page.js         # Signup page
│   ├── admin/dashboard/       # Admin dashboard (full access)
│   ├── agent/dashboard/       # Agent dashboard (assigned leads)
│   ├── agent/add-lead/        # Create new lead form
│   └── api/
│       ├── auth/login/        # POST - Login
│       ├── auth/signup/       # POST - Signup
│       ├── leads/             # GET, POST - leads
│       ├── leads/[id]/        # PATCH, GET - single lead
│       ├── leads/[id]/timeline/ # GET - activity log
│       └── admin/
│           ├── agents/        # GET - list agents
│           ├── analytics/     # GET - dashboard stats
│           ├── assign/        # PATCH - assign lead to agent
│           └── delete-lead/   # DELETE - remove lead
├── models/                    # Mongoose schemas
├── lib/                       # DB, JWT, Mail utilities
├── middleware.js              # JWT auth + rate limiting
├── server.js                  # Custom server with Socket.io
└── pages/api/socket.js        # Socket wake-up endpoint
```

---

## 👥 Roles

| Feature | Admin | Agent |
|---------|-------|-------|
| View all leads | ✅ | ❌ |
| View own leads | ✅ | ✅ |
| Create leads | ✅ | ✅ |
| Assign leads | ✅ | ❌ |
| Delete leads | ✅ | ❌ |
| Update lead status | ✅ | ✅ |
| WhatsApp click-to-chat | ✅ | ✅ |
| View activity timeline | ✅ | ✅ |
| Analytics dashboard | ✅ | ❌ |

---

## 🔧 Features
- ✅ JWT Authentication with bcrypt password hashing
- ✅ Role-Based Access Control (Admin / Agent)  
- ✅ Lead CRUD with automatic priority scoring
- ✅ Socket.io real-time updates + polling fallback
- ✅ Activity timeline / audit trail per lead
- ✅ Smart follow-up tracking (overdue & stale detection)
- ✅ WhatsApp click-to-chat integration
- ✅ Email notifications (new lead, assignment)
- ✅ Admin analytics dashboard
- ✅ Rate limiting (agents: 50 req/min)
