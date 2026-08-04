# SpendVentures

A full stack expense tracking web application — built to track, explore, and conquer your spending.

## Live URL
https://spendventures-frontend.onrender.com

## Demo Account
Try it instantly — no sign up needed:
- **Email:** demo@spendventures.com
- **Password:** demo1234

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Python + FastAPI
- **Database:** PostgreSQL
- **Authentication:** JWT + bcrypt
- **Deployed on:** Render (frontend + backend + database)
- **AI:** Anthropic Claude API (claude-haiku-4-5)

## Features

### Expense Management
- Add expenses with amount, category, description and date
- View all expenses in real time with live updates
- Edit expenses inline — no page reload
- Delete expenses with instant list refresh
- Consistent ordering by entry date

### Analytics
- Category totals — see spending breakdown by category
- Date range filter — filter expenses between any two dates

### AI Chatbot
- Natural language queries — ask "What did I spend in August?" or "Which category costs the most?"
- Powered by Claude — responses include breakdowns, totals, and insights
- Markdown formatted responses for clear readability

### Authentication
- Register and login with email and password
- Passwords hashed with bcrypt — never stored in plain text
- JWT tokens for secure session management
- Protected routes — unauthenticated users redirected to login
- User data isolation — each user only sees their own expenses

### UI/UX
- Responsive design — works on mobile and desktop
- Professional Tailwind CSS styling
- Tab navigation with React Router — real URLs per page
- Auto-deploys on every GitHub push via Render CI/CD

## Architecture
React (Vite) → FastAPI (Python) → PostgreSQL
↓ ↓
Tailwind CSS Anthropic API

## Pages
- `/login` — sign in to your account
- `/register` — create a new account
- `/dashboard` — add, view, edit, delete expenses + category totals
- `/filter` — filter expenses by date range
- `/chat` — AI expense assistant

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
npm install
npm run dev
```

### Environment Variables
**Backend `.env`:**
DATABASE_URL=your_postgres_url
ANTHROPIC_API_KEY=your_anthropic_key
SECRET_KEY=your_jwt_secret

**Frontend `.env`:**
VITE_API_URL=http://127.0.0.1:8000

## GitHub
https://github.com/VamsiAlapaty/spendventures_