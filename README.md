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

## Progressive Web App (PWA)

BoulderLog can be installed on mobile devices:

- Android: Open the app in Chrome → Add to Home Screen

- iOS: Open the app in Safari → Add to Home Screen

The application runs in full-screen mode and supports limited offline usage.

### Database

The database schema is based on a relational data model designed specifically for training analysis.

Key concepts:

- Training sessions (ON-WALL / OFF-WALL)

- Bouldering logs with flexible grading systems

- Gyms with custom difficulty mappings

- Aggregated analytical data (training zones, difficulty profiles)

- Database schema and migrations are managed within the Supabase environment.

### Deployment

- The frontend is automatically deployed via Vercel.

- Each pull request generates a preview deployment.

- Production deployment is triggered on merge to the main branch.

### Project Status

This project is under active development and is intended primarily as:

- an individual training tool,

- a learning project,

- and an academic engineering project.

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
