<div align="center">

# 💊 RxManager

### Digital Prescription Management Platform

A full-stack web application that enables **doctors** to create, manage, and issue digital prescriptions, and **patients** to view and download them as PDFs — all through a sleek, dark-themed dashboard.

[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## ✨ Features

### 🩺 Doctor Dashboard
- **Create prescriptions** — patient lookup by phone number, multi-medicine form with dosage/frequency/duration
- **Edit prescriptions** — update diagnosis, medicines, notes, or status after issuing
- **Manage patients** — view all treated patients with prescription count and last visit date
- **Medicine catalog** — auto-aggregated list of all prescribed medicines with usage stats
- **Status management** — toggle prescriptions between `active`, `pending`, and `expired`
- **PDF generation** — download professionally formatted prescription PDFs via PDFKit

### 🧑‍⚕️ Patient Dashboard
- **View prescriptions** — see all prescriptions issued by doctors, filterable by status
- **Prescription detail** — full breakdown of diagnosis, medicines, doctor info, and notes
- **Download PDFs** — one-click download of any prescription as a PDF

### ⚙️ Account & Settings
- **Profile management** — update name, email, and phone number
- **Password change** — with live strength indicator and confirmation matching
- **Digital signature** (doctor only) — customize the signature that appears on prescriptions, with live preview
- **Danger zone** — sign out or permanently delete account (with safety confirmation gate)

### 🎨 UI / UX
- Dark-themed glassmorphism design with indigo accents
- Fully responsive — mobile sidebar with slide-in animation and hamburger toggle
- Toast notifications for all actions
- Skeleton loaders and empty-state illustrations
- Role-based routing (automatic redirect based on `doctor` vs `patient`)

### 🤖 Assistant Integration (Role-Aware)
- **Assistant Page:** First-class, full-screen assistant chat page (`/assistant`) in the sidebar with customized suggestion chips.
- **Floating Widget:** Global, overlaying glassmorphic chat widget (`<ChatBot />`) accessible from any view.
- **Doctor Clinical Assistant:** Suggest typical dosages, draft digital prescriptions, and lookup drug interactions.
- **Patient Care Companion:** Explain active prescriptions, medicine storage guidelines, and potential side-effects.
- **Demo Mode Fallback:** Gracefully operates with simulated role guides when no API keys are supplied.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router 6, Axios, Lucide Icons |
| **Styling** | Tailwind CSS 4 (via Vite plugin), DM Sans / DM Serif Display (Google Fonts) |
| **Build Tool** | Vite 8 |
| **Backend** | Node.js, Express 4 |
| **Database** | MongoDB (Mongoose 8 ODM) |
| **Auth** | JWT (cookie + Bearer token), bcryptjs for password hashing |
| **PDF** | PDFKit — server-side A4 prescription generation |
| **AI / Assistant** | Google Gemini API (gemini-2.5-flash) via @google/generative-ai |
| **DevOps** | Docker, Docker Compose |

---

## 📋 Prerequisites

- **Node.js** ≥ 18 (22 recommended)
- **npm** ≥ 9
- **MongoDB** — either:
  - A MongoDB Atlas cloud instance (connection string), **or**
  - Docker installed locally (a `docker-compose.yml` is provided)

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/pranay498/Zomato_clone.git rxmanager
cd rxmanager
```

### 2. Start MongoDB (pick one)

**Option A — Docker (recommended for local dev):**
```bash
docker compose up -d
```
This spins up MongoDB 6 on port `27018` with credentials `rxuser:rxpass`.

**Option B — MongoDB Atlas:**
Use your Atlas connection string in the server `.env` file (see below).

### 3. Server setup

```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=9000
MONGO_URI=mongodb://rxuser:rxpass@localhost:27018/rxmanager?authSource=admin
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
```

> If using Atlas, replace `MONGO_URI` with your Atlas connection string.

Start the server:
```bash
npm run dev        # Development (nodemon)
npm start          # Production
```

### 4. Client setup

```bash
cd client
npm install
```

Optionally create `client/.env`:
```env
VITE_API_URL=http://localhost:9000/api
```

> The Vite dev server also has a built-in proxy that forwards `/api` requests to the server.

Start the client:
```bash
npm run dev        # Vite dev server on http://localhost:5173
npm run build      # Production build → dist/
```

### 5. Open the app

Navigate to **http://localhost:5173** — register as a `doctor` or `patient` to get started.

---

## 🐳 Docker

A Dockerfile is included for the server:

```bash
cd server
docker build -t rxmanager-server .
docker run -p 9000:9000 --env-file .env rxmanager-server
```

For the full stack with MongoDB, use Docker Compose from the project root:
```bash
docker compose up -d
```

---

## 📁 Project Structure

```
rxmanager/
├── docker-compose.yml              # MongoDB container
├── .gitignore
│
├── server/                         # Express API
│   ├── Dockerfile
│   ├── package.json
│   ├── .env                        # Environment variables (not committed)
│   └── src/
│       ├── app.js                  # Entry point — Express setup, routes, middleware
│       ├── config/
│       │   └── db.js               # Mongoose connection
│       ├── controllers/
│       │   ├── authController.js   # Register, login, logout, profile, password
│       │   ├── chatController.js   # Chatbot handler
│       │   └── prescriptionController.js
│       ├── middleware/
│       │   ├── auth.js             # JWT verify + role-based access
│       │   └── errorMiddleware.js  # Centralized error handler
│       ├── models/
│       │   ├── User.js             # email, password, role, name, phone, signature
│       │   └── Prescription.js     # doctor, patient, medicines[], diagnosis, status
│       ├── routes/
│       │   ├── auth.js             # /api/auth/*
│       │   ├── chat.js             # /api/chat/*
│       │   └── prescriptions.js    # /api/prescriptions/*
│       ├── services/
│       │   ├── userService.js      # Auth logic, profile CRUD
│       │   ├── chatService.js      # Google Gemini integration, context compiler
│       │   ├── prescriptionService.js  # Prescription CRUD, patient/medicine aggregation
│       │   └── pdfService.js       # PDFKit prescription rendering
│       └── utils/
│           ├── ApiError.js         # Custom error class
│           ├── ApiResponse.js      # Standard response wrapper
│           ├── asyncHandler.js     # try/catch wrapper for controllers
│           └── logger.js           # Console logger utility
│
└── client/                         # React SPA
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx                # React DOM root
        ├── App.jsx                 # Routes & auth guards
        ├── index.css               # Tailwind config, design tokens, global styles
        ├── api/
        │   ├── axiosinstance.js    # Axios with JWT interceptors
        │   └── index.js            # authAPI + prescriptionAPI methods
        ├── context/
        │   └── AuthContext.jsx     # Global auth state (user, login, logout, refresh)
        ├── components/
        │   ├── DashboardLayout.jsx # Sidebar + Navbar + Outlet wrapper
        │   ├── Sidebar.jsx         # Navigation (responsive slide-in on mobile)
        │   ├── Navbar.jsx          # Top bar with greeting, search, logout
        │   ├── ChatBot.jsx         # Floating glassmorphic chat widget
        │   ├── PrescriptionTable.jsx  # Data table with row navigation
        │   ├── PrescriptionCard.jsx   # Card view variant
        │   ├── StatCard.jsx        # Dashboard stat widget
        │   ├── StatusBadge.jsx     # Active/Pending/Expired badge
        │   └── MedicineRow.jsx     # Inline medicine input row
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── ChatAssistant.jsx   # Dedicated AI Assistant full chat page
            ├── DoctorDashboard.jsx
            ├── PatientDashboard.jsx
            ├── CreatePrescription.jsx
            ├── EditPrescription.jsx
            ├── PrescriptionDetail.jsx
            ├── Patients.jsx
            ├── Medicines.jsx
            └── Settings.jsx
```

---

## 🤝 Contributing

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and commit: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a **Pull Request** with a clear description of your changes

### Coding Conventions
- Server uses **CommonJS** (`require`/`module.exports`)
- Client uses **ES Modules** (`import`/`export`)
- Follow the existing **service → controller → route** pattern on the backend
- Use the existing **dark theme design tokens** (CSS custom properties in `index.css`) for new UI

---

## 📄 License

This project is **private** and currently unlicensed. Contact the repository owner for usage permissions.
