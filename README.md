# The Smart Goal Breaker

This project implements "The Smart Goal Breaker", a web application that allows users to input a vague goal, which is then broken down into 5 actionable steps by an AI Agent. The goals and their sub-tasks are saved to a PostgreSQL database and displayed on a modern frontend.

## Stack

*   **Backend:** Python (FastAPI)
*   **Frontend:** Next.js
*   **UI:** shadcn/ui
*   **Database:** PostgreSQL
*   **AI:** Google Gemini

## Features

*   User input for vague goals.
*   AI-powered breakdown of goals into 5 actionable steps with a complexity score (1-10).
*   Storage of goals and tasks in PostgreSQL.
*   Display of results on a modern, responsive frontend.
*   Ability to mark tasks as completed.
*   Ability to regenerate tasks for an existing goal.
*   Frontend sidebar to view and navigate to previously created goals (persisted in local storage).
*   Modern, clean, and professional UI design.

## Setup Instructions

### Prerequisites

*   Python 3.9+
*   Node.js 18+ and npm
*   PostgreSQL database (e.g., Supabase, Railway, Neon)
*   Google Gemini API Key

### 1. Clone the Repository

```bash
git clone https://github.com/sualh1999/Goal_Breaker.git
cd Goal_Breaker
```

### 2. Backend Setup

Navigate to the `backend` directory:

```bash
cd backend
```

**Create and activate a Python virtual environment:**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Install dependencies:**

```bash
pip install -r requirements.txt
```

**Configure Environment Variables:**

Create a `.env` file in the `backend/` directory with your database URL and Gemini API key:

```
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
DATABASE_URL="postgresql+psycopg2://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require"
```
*Replace USER, PASSWORD, HOST, PORT, DBNAME with your PostgreSQL credentials.*
*Note: The `sslmode=require` is crucial for many cloud PostgreSQL providers.*

**Run Database Migrations:**

```bash
.venv/bin/alembic upgrade head
```

**Start the Backend Server:**

```bash
.venv/bin/uvicorn app.main:app --reload --port 8000
```
The backend API will be available at `http://127.0.0.1:8000`.

### 3. Frontend Setup

Open a new terminal and navigate to the `frontend/` directory:

```bash
cd frontend
```

**Install dependencies:**

```bash
npm install
```

**Configure Environment Variables (Optional):**

If your backend is not running on `http://localhost:8000`, create a `.env.local` file in the `frontend/` directory:

```
NEXT_PUBLIC_API_URL="http://localhost:8000"
```
*Replace with your backend API URL if different.*

**Start the Frontend Development Server:**

```bash
npm run dev
```
The frontend application will be available at `http://localhost:3000` (or another available port).
