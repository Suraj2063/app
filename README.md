# TableEase - Restaurant Table Booking Application

A full-stack, production-ready restaurant table booking application built with **React + TypeScript + Vite** (frontend) and **FastAPI** (backend) with **Supabase/PostgreSQL** database.

## 🚀 Features

### For Customers
- 🔍 **Browse & Search** restaurants by cuisine, location, price range, and rating
- 📅 **Real-time Availability** - Check available tables instantly
- 🎯 **Easy Booking** - Reserve a table in under 60 seconds
- 📧 **Email Confirmation** - Automatic booking confirmations and notifications
- 📊 **Booking History** - View, manage, and cancel reservations
- ⭐ **Reviews** - Rate and review restaurants you've visited

### For Restaurant Owners
- 🏪 **Restaurant Management** - Add and update restaurant details
- 🪑 **Table Management** - Configure tables, capacity, and locations
- 📈 **Booking Management** - View and manage all reservations

### For Admins
- 📊 **Analytics Dashboard** - Platform-wide statistics
- 👥 **User Management** - Manage all users
- 🏪 **Restaurant Oversight** - Manage all restaurants
- 📋 **Booking Control** - View and update any booking status

---

## 🛠️ Tech Stack

| Layer     | Technology                                |
|-----------|-------------------------------------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS  |
| Backend   | FastAPI, Python 3.11+, Pydantic v2        |
| Database  | Supabase (PostgreSQL)                     |
| Auth      | JWT (JSON Web Tokens)                     |
| Email     | SMTP via aiosmtplib                       |
| Deploy    | Docker + Docker Compose                   |

---

## 📁 Project Structure

```
app/
├── frontend/               # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context (Auth)
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helper functions
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
├── backend/                # FastAPI
│   ├── app/
│   │   ├── routers/        # API route handlers
│   │   ├── schemas/        # Pydantic models
│   │   └── utils/          # Auth, email, helpers
│   ├── main.py             # Application entry point
│   ├── requirements.txt
│   └── .env.example
├── database/               # Supabase/PostgreSQL
│   ├── schema.sql          # Complete database schema
│   └── seed.sql            # Sample data
├── docker-compose.yml
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) account (free tier works)

---

### 1. Set Up Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Navigate to the SQL Editor
3. Run the contents of `database/schema.sql`
4. Optionally run `database/seed.sql` to add sample data
5. Copy your **Project URL** and **API Keys** from Project Settings > API

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials and other settings

# Run the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env if your backend is not at localhost:8000

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

---

### 4. Docker Deployment

```bash
# From the root directory
cp backend/.env.example .env
# Edit .env with your credentials

docker-compose up --build
```

---

## 🔑 API Endpoints

### Authentication
| Method | Endpoint             | Description              |
|--------|----------------------|--------------------------|
| POST   | `/auth/register`     | Register new user        |
| POST   | `/auth/login`        | Login (returns JWT)      |
| GET    | `/auth/me`           | Get current user profile |
| PUT    | `/auth/me`           | Update profile           |
| PUT    | `/auth/me/password`  | Change password          |

### Restaurants
| Method | Endpoint                                    | Description                    |
|--------|---------------------------------------------|--------------------------------|
| GET    | `/restaurants`                              | List restaurants (with filters)|
| GET    | `/restaurants/{id}`                         | Get restaurant details         |
| POST   | `/restaurants`                              | Create restaurant              |
| PUT    | `/restaurants/{id}`                         | Update restaurant              |
| DELETE | `/restaurants/{id}`                         | Delete restaurant              |
| GET    | `/restaurants/{id}/tables`                  | Get all tables                 |
| GET    | `/restaurants/{id}/available-tables`        | Get available tables           |
| GET    | `/restaurants/{id}/reviews`                 | Get reviews                    |
| POST   | `/restaurants/{id}/reviews`                 | Create review                  |

### Bookings
| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| POST   | `/bookings`                 | Create booking       |
| GET    | `/bookings`                 | List user's bookings |
| GET    | `/bookings/{id}`            | Get booking details  |
| PUT    | `/bookings/{id}/cancel`     | Cancel booking       |
| PUT    | `/bookings/{id}`            | Update booking       |

### Admin
| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| GET    | `/admin/stats`                    | Dashboard statistics     |
| GET    | `/admin/users`                    | List all users           |
| GET    | `/admin/bookings`                 | List all bookings        |
| GET    | `/admin/restaurants`              | List all restaurants     |
| PUT    | `/admin/bookings/{id}/status`     | Update booking status    |

---

## 🗄️ Database Schema

| Table         | Description                                    |
|---------------|------------------------------------------------|
| `users`       | User accounts, profiles, and roles             |
| `restaurants` | Restaurant details, hours, and metadata        |
| `tables`      | Individual tables with capacity and location   |
| `bookings`    | Reservations with status tracking              |
| `reviews`     | User ratings and comments                      |
| `admin_logs`  | Activity audit trail                           |

---

## 🔐 Security Features

- **JWT Authentication** with configurable expiry
- **Bcrypt password hashing**
- **Row Level Security (RLS)** in Supabase
- **CORS configuration** for allowed origins
- **Input validation** with Pydantic
- **Role-based access control** (customer, admin, restaurant_owner)

---

## 🧪 Demo Credentials

> ⚠️ **Development/Testing Only**: These credentials are for local development and testing **only**. They must **never** be used in a production environment. Change all passwords and remove or regenerate seed data before any public deployment.

After running `database/seed.sql`:

| Role              | Email                    | Password    |
|-------------------|--------------------------|-------------|
| Admin             | admin@example.com        | password123 |
| Restaurant Owner  | owner@example.com        | password123 |
| Customer          | john@example.com         | password123 |

---

## 📝 Environment Variables

### Backend (`.env`)

| Variable                     | Description                           |
|------------------------------|---------------------------------------|
| `SUPABASE_URL`               | Your Supabase project URL             |
| `SUPABASE_KEY`               | Supabase anon/public key              |
| `SUPABASE_SERVICE_KEY`       | Supabase service role key             |
| `SECRET_KEY`                 | JWT signing secret                    |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| JWT expiry (default: 1440 = 24h)      |
| `ALLOWED_ORIGINS`            | CORS allowed origins (comma-separated)|
| `SMTP_HOST`                  | SMTP server hostname                  |
| `SMTP_PORT`                  | SMTP port (default: 587)              |
| `SMTP_USERNAME`              | SMTP username/email                   |
| `SMTP_PASSWORD`              | SMTP password or app password         |
| `EMAIL_FROM`                 | Sender email address                  |

### Frontend (`.env`)

| Variable       | Description                    |
|----------------|--------------------------------|
| `VITE_API_URL` | Backend API URL                |

---

## 📄 License

MIT License

---

Built with ❤️ using React, FastAPI, and Supabase.