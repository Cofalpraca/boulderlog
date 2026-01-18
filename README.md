# BoulderLog

**BoulderLog** is a Progressive Web App (PWA) designed for logging bouldering training sessions and analyzing climbing progress over time.

The application supports both **ON-WALL** (bouldering gym sessions) and **OFF-WALL** (supplementary strength and conditioning training), allowing users to track volume, difficulty, and training trends in a structured way.

---

## Features

- Logging bouldering sessions with support for multiple grading systems
- Managing bouldering gyms with custom grade mappings
- Tracking ON-WALL and OFF-WALL training sessions
- Training volume and difficulty analysis
- Personalized gym difficulty profiling
- Classification of training sessions into development zones
- Progressive Web App (installable on mobile devices)
- Online-first application with optional offline support

---

## Technology Stack

### Frontend
- React
- TypeScript
- Progressive Web App (PWA)

### Backend
- Supabase (Backend-as-a-Service)
  - PostgreSQL database
  - Authentication
  - API access

### Hosting
- Frontend: Vercel
- Backend & Database: Supabase

---

## Architecture Overview

- The application is implemented as a client-side web application.
- Core business logic and training analyses are performed on the client side.
- Supabase is used for data persistence, authentication, and secure data access.
- The system is designed for a small number of users (1–3), focusing on simplicity and maintainability.

---

## Installation & Development

### Prerequisites
- Node.js (LTS recommended)
- npm / yarn / pnpm
- Supabase project (URL + anon key)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/boulderlog.git
   cd boulderlog
   ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create environment variables:
    ```bash
    cp .env.example .env.local
    ```

4. Fill in Supabase credentials:

    REACT_APP_SUPABASE_URL=your_supabase_url
    REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key


5. Run the development server:
    ```
    npm run dev
    ```