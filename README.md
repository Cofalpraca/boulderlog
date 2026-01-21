# BoulderLog

**BoulderLog** is a Progressive Web App (PWA) designed for logging bouldering training sessions and analyzing climbing progress over time.

The application supports both **ON-WALL** (bouldering gym sessions) and **OFF-WALL** (supplementary strength and conditioning training), allowing users to track volume, difficulty, and training trends in a structured way.

---

## Features

### Core Training Features

- Logging bouldering sessions with support for multiple grading systems (V-Scale, Font, Colors, Numeric)
- Managing bouldering gyms with custom grade mappings
- Tracking ON-WALL and OFF-WALL training sessions
- Session templates for quick session creation
- Weekly training plan management
- Pain and injury tracking with contextual insights

### Analytics & Insights

- **User Level Computation**: Calculates climbing level based on best 20 boulders from last 90 days (minimum 10 required)
- **Development Zones**: Classifies climbs into Comfort, Growth, and Limit zones relative to user ability
- **Volume by Grade**: Aggregated boulder counts by grade with duplicate prevention
- **Gym Difficulty Index**: Compares gym difficulty relative to user's climbing baseline
- **Weekly Trends**: Session counts, boulder volume, and pain markers over time
- **Training Balance**: Correlation analysis between ON-WALL and OFF-WALL sessions

### Data Management

- **Boulder History Import**: Import historical climbing data via free-text parser (DD.MM.YYYY or YYYY-MM-DD formats)
- **Grade Mapping Health**: Diagnostic tools for verifying gym grade configurations
- **Session Lifecycle**: Strict status management (draft → active → completed/discarded)

### User Experience

- Progressive Web App (installable on mobile devices)
- Online-first application with offline support
- Multi-language support (English, Polish)
- Dark/Light theme support
- Real-time session persistence and recovery

---

## Technology Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- TanStack Query (React Query)
- i18next (internationalization)
- Recharts (data visualization)

### Backend

- Supabase (Backend-as-a-Service)
  - PostgreSQL database with Row-Level Security
  - Authentication
  - Edge Functions
  - Real-time subscriptions

### Testing

- Vitest
- React Testing Library
- 150+ unit tests covering analytics, import, and session logic

### Hosting

- Frontend: Lovable / Vercel
- Backend & Database: Supabase

---

## Architecture Overview

- The application is implemented as a client-side web application.
- Core business logic and training analyses are performed on the client side.
- Supabase is used for data persistence, authentication, and secure data access.
- Pre-computed aggregates (weekly summaries, zone summaries) are stored on session completion for performance.
- The system is designed for a small number of users (1–3), focusing on simplicity and maintainability.

### Key Data Models

| Table | Purpose |
|-------|---------|
| `sessions` | Training sessions with lifecycle status |
| `boulder_logs` | Individual climb records with grade and count |
| `gyms` | User-defined climbing gyms |
| `gym_grade_mappings` | Grade-to-difficulty mappings per gym |
| `weekly_aggregates` | Pre-computed weekly statistics |
| `session_zone_summaries` | Pre-computed development zone percentages |
| `templates` | Reusable session templates |
| `weekly_plans` | Weekly training schedules |

---

## Installation & Development

### Prerequisites

- Node.js (LTS recommended)
- Bun / npm / yarn / pnpm
- Supabase project (URL + anon key)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/boulderlog.git
   cd boulderlog
   ```

2. Install dependencies:

   ```bash
   bun install
   # or npm install
   ```

3. Create environment variables:

   ```bash
   cp .env.example .env.local
   ```

4. Fill in Supabase credentials:

   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

5. Run the development server:

   ```bash
   bun run dev
   # or npm run dev
   ```

### Running Tests

```bash
bun run test
# or npm run test
```

---

## Progressive Web App (PWA)

BoulderLog can be installed on mobile devices:

- **Android**: Open the app in Chrome → Add to Home Screen
- **iOS**: Open the app in Safari → Add to Home Screen

The application runs in full-screen mode and supports offline session creation with automatic sync.

---

## Database

The database schema is based on a relational data model designed specifically for training analysis.

Key concepts:

- Training sessions with strict lifecycle (draft → active → completed)
- Bouldering logs with flexible grading systems
- Gyms with custom difficulty mappings (V-Scale, Font normalization)
- Aggregated analytical data (training zones, difficulty profiles, weekly summaries)
- Row-Level Security (RLS) policies for data isolation
- Cascading deletes for referential integrity

Database schema and migrations are managed within the Supabase environment.

---

## Deployment

- The frontend is automatically deployed via Lovable/Vercel.
- Each pull request generates a preview deployment.
- Production deployment is triggered on merge to the main branch.
- Database migrations are applied via Supabase migration workflow.

---

## Project Status

This project is under active development and is intended primarily as:

- an individual training tool,
- a learning project,
- and an academic engineering project.

---

## License

```
MIT License

Copyright (c) 2026 BoulderLog

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
