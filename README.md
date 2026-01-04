# Habit Tracker

A modern **habit tracking web application** inspired by GitHub-style heatmaps.  
Track your daily habits, analyze streaks, visualize progress, and stay motivated with a clean UI and Firebase-powered backend.

---

## Features

### Habit Management
- Create, edit, and delete habits
- Habit types:
  - **Hours** (time-based tracking)
  - **Amount** (numeric tracking)
- Custom habit colors
- Habit categories:
  - Soul
  - Verse
  - Sport
  - Finance
  - Self-development
  - Uncategorized

---

### GitHub-Style Heatmap
- Visualizes activity for the **last 365 days**
- Dynamic color intensity based on value
- Hover to preview date
- Click any day to:
  - Add or edit value
  - Attach a comment/note

---

### Daily Notes
- Save a numeric value and a text comment per day
- Clean, focused modal UI
- Notes are stored per habit & per date

---

### Statistics
- Current streak calculation
- Average value per habit
- Visual analytics:
  - Monthly activity (Line Chart)
  - Best streaks (Bar Chart)
- Built using **Recharts**
- Optimized with `useMemo`

---

### Authentication & Profile
- Firebase Authentication:
  - Email & Password
  - Google Sign-In
- User profile with:
  - Display name
  - Avatar initials
- Secure per-user data isolation

---

### Cloud Storage
- Firebase Firestore
- Automatic syncing of habits
- Each user has their own document
- Persistent data across sessions

---

### UI / UX
- Dark mode by default
- Smooth animations
- Custom modal components
- Responsive layout
- Minimal, modern design

---

## Tech Stack

**Frontend**
- React
- Hooks (`useState`, `useEffect`, `useMemo`)
- Custom CSS
- Framer Motion

**Backend / Services**
- Firebase
  - Authentication
  - Firestore

**Charts**
- Recharts

---

## Data Model Example

{
  "name": "Reading",
  "type": "hours",
  "color": "#2ecc71",
  "category": "self",
  "data": {
    "2025-01-01": 45
  },
  "comments": {
    "2025-01-01": "Very focused session"
  }
}

---

## 🚀 Getting Started & 🔮 Future Improvements

# Getting Started
1️⃣ Clone the repository
git clone https://github.com/your-username/habit-tracker.git
cd habit-tracker

2️⃣ Install dependencies
npm install

3️⃣ Run the app
npm start

The app will be available at: http://localhost:3000

# Future Improvements
- Habit goals
- Weekly & monthly summaries
- Notifications
- Data export (CSV)
- Mobile-first enhancements
- Premium features
