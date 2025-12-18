# 🎨 Drawing App

A full-stack drawing application where users can create drawings on a canvas, save them, and manage them through an admin dashboard.  
The project uses **Firebase Authentication**, a **Node.js + Express backend**, **PostgreSQL with Prisma**, and is deployed using **Render (backend)** and **Netlify (frontend)**.

---

## 🌐 Live Application

- **Frontend (Netlify):**  
  👉 https://drawing-project-app.netlify.app

- **Backend (Render):**  
  👉 https://drawing-app-q0sx.onrender.com

---

## 🧱 Tech Stack

### Frontend

- HTML5
- CSS
- Vanilla JavaScript
- Firebase Authentication (Google, GitHub, Email/Password)
- QR Code generation
- Canvas API

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Firebase Admin SDK
- Zod (validation)
- Winston (logging)
- Swagger (API documentation)
- Jest + Supertest (testing)

### DevOps

- Docker
- Render (backend hosting)
- Netlify (frontend hosting)
- GitHub Actions (CI)

---

## 🗂 Project Structure

```
drawing-app/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── app.ts
│   │   ├── index.ts
│   │   ├── routes/
│   │   ├── config/
│   │   └── docs/
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── index.html
│   ├── home.html
│   ├── register.html
│   ├── paint.html
│   ├── admin.html
│   ├── admin-login.html
│   ├── css/
│   └── js/
│
├── docs/
│   ├── erd-final.drawio
│   └── drawing-app-erd.png
│
└──docker-compose.yml
└── README.md
```

---

## 🧠 Database Design (ERD)

The database follows a simple relational model:

- **User**
  - id (UUID)
  - name
  - email (optional)
  - birthday (optional)
  - firebaseUid (optional)
  - avatar
  - createdAt

- **Drawing**
  - id (UUID)
  - imageData (Base64)
  - userId (FK → User)
  - createdAt

📸 **ERD Screenshot:**  
![ERD](docs/drawing-app-erd.png)

---

## 🔐 Authentication Flow

- Users can:
  - Register manually (name + birthday)
  - Login via Google or GitHub (Firebase Auth)
- Firebase ID tokens are sent to the backend
- Backend verifies tokens using Firebase Admin SDK
- Admin users can:
  - View all drawings
  - Delete drawings
  - View user profiles

---

## ⚙️ Environment Variables

### Backend (`.env`)

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
FIREBASE_SERVICE_ACCOUNT_JSON=path/to/firebase-admin.json
NODE_ENV=development
PORT=3000
```

### Frontend

Handled automatically via `firebaseConfig.js` and `API_BASE_URL`.

---

## 🚀 How to Run the Project Locally

### 1️⃣ Clone the repository

```bash
git clone https://github.com/jeehalways/drawing-app.git
cd drawing-app
```

### 2️⃣ Backend setup

```bash
cd backend
npm install
```

Generate Prisma client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Start backend:

```bash
npm run dev
```

Backend runs on:

```
http://localhost:3000
```

Swagger docs:

```
http://localhost:3000/api/docs
```

### 3️⃣ Frontend setup

```bash
cd frontend
```

Open `index.html` using Live Server OR use a simple server:

```bash
npx serve .
```

Frontend runs on:

```
http://localhost:5500
```

(or the port provided by Live Server)

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

Tests include:
- Health check
- Registration
- Drawing creation
- Validation errors

---

## 🐳 Docker (Backend only)

Build image:

```bash
docker build -t drawing-backend .
```

Run container:

```bash
docker run -p 3001:3000 \
  -e DATABASE_URL=your_database_url \
  drawing-backend
```

---

## ☁️ Deployment

### Backend (Render)
- Docker-based service
- Automatic Prisma migrations on deploy
- Environment variables configured in Render dashboard

### Frontend (Netlify)
- Static site
- SPA redirect via `netlify.toml`
- Firebase Auth enabled
- CORS configured on backend

---

## ✅ Features Summary

- 🎨 Canvas drawing with tools
- 💾 Save drawings to database
- 👤 User profiles
- 🔐 Firebase authentication
- 🧑‍💼 Admin dashboard
- 📱 QR code login
- 🌗 Light/Dark mode
- 🧪 Automated tests
- 📦 Dockerized backend
- 🌍 Fully deployed

---

## 👩‍💻 Author

**Jessica Rodrigues**  
Backend Development Student

