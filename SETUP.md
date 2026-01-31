# Wheels and Glass - Setup Guide

## Project Structure Created

```
wheels-and-glass/
├── client/                 # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/ui/  # shadcn/ui components (to be added)
│   │   ├── pages/          # Main pages (CRM, Dashboard, etc.)
│   │   ├── lib/            # API client and utilities
│   │   └── hooks/          # Custom React hooks
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── server/                 # Express backend (Node + TypeScript)
│   ├── src/
│   │   ├── routes/         # API routes (jobs, appointments, payments, webhooks)
│   │   ├── services/       # External service integrations
│   │   ├── db/             # Database connection and migrations
│   │   └── middleware/     # Express middleware
│   ├── package.json
│   └── drizzle.config.ts
├── shared/                 # Shared code between client and server
│   ├── schema.ts           # Database schema (15+ tables)
│   ├── types.ts            # TypeScript types
│   └── constants.ts        # Shared constants
├── api/                    # Vercel serverless entry point
│   └── index.ts
├── .env.example            # Environment variables template
├── vercel.json             # Vercel deployment configuration
└── package.json            # Root package.json with workspaces

## Prerequisites

You need to install Node.js and npm first:

1. **Install Node.js** (v18 or higher):
   - Visit https://nodejs.org/
   - Download and install the LTS version
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

## Installation Steps

### 1. Install Dependencies

```bash
cd /Users/elanokonsky/Documents/Work/Projects/wheels-and-glass

# Install root dependencies
npm install

# This will install dependencies for all workspaces (client, server, shared)
```

### 2. Build Shared Package

```bash
npm run build:shared
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual credentials
nano .env  # or use your preferred editor
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `OMEGA_API_KEY` - Omega EDI API credentials
- `SQUARE_ACCESS_TOKEN` - Square Payments API token
- `TWILIO_ACCOUNT_SID` - Twilio API credentials
- See `.env.example` for full list

### 4. Set Up Database

You'll need a PostgreSQL database. Options:

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL locally
# Then create a database
createdb wheelsandglass

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost:5432/wheelsandglass
```

#### Option B: Vercel Postgres (Recommended for production)
1. Go to Vercel Dashboard
2. Create a new Postgres database
3. Copy the connection strings to your `.env`

#### Run Migrations
```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate
```

### 5. Start Development Servers

```bash
# Start both frontend and backend simultaneously
npm run dev

# Or start them separately:
# Frontend: npm run dev:client (http://localhost:5173)
# Backend: npm run dev:server (http://localhost:3001)
```

## Next Steps

### Complete Frontend Components

The following key components still need to be created:

1. **UI Components** (in `client/src/components/ui/`):
   - `button.tsx`
   - `dialog.tsx`
   - `card.tsx`
   - `tabs.tsx`
   - `badge.tsx`
   - `input.tsx`
   - `select.tsx`
   - `table.tsx`

   You can use shadcn/ui CLI to generate these:
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button dialog card tabs badge input select table
   ```

2. **JobRecordDialog Component** (500 lines):
   - Location: `client/src/components/JobRecordDialog.tsx`
   - Displays job details in Omega EDI format
   - Critical for CRM functionality

3. **Page Components**:
   - `CRM.tsx` - Main CRM interface with job listings
   - `Dashboard.tsx` - Statistics and analytics
   - `OperationsCenter.tsx` - Operations management
   - `Settings.tsx` - App configuration
   - `Navigation.tsx` - Main navigation component

### Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables**:
   - Go to Vercel Dashboard
   - Navigate to your project
   - Go to Settings > Environment Variables
   - Add all variables from `.env.example`

5. **Set Up Database**:
   - Create Vercel Postgres database in Vercel dashboard
   - Run migrations on production database
   - Update environment variables with production database URLs

## Project Status

### ✅ Completed
- Root project structure and monorepo setup
- Shared package with 15+ database tables
- Backend Express server with database connection
- API routes (jobs, appointments, payments, webhooks, communications, dashboard)
- Service layer (Omega EDI, Square, Twilio, VIN/NAGS lookups)
- Frontend base structure (Vite, React, TypeScript, TailwindCSS)
- API client and utilities
- Vercel deployment configuration

### 🔨 To Do
- Install shadcn/ui components
- Create JobRecordDialog component (500 lines)
- Create CRM page with job listings
- Create Dashboard, Operations, and Settings pages
- Create Navigation component
- Install Node.js and npm
- Install dependencies
- Run database migrations
- Test local development
- Deploy to Vercel

## Architecture Highlights

### Database Schema
- 15+ comprehensive tables for auto glass business management
- Drizzle ORM for type-safe database queries
- Relations defined between tables
- Zod schemas for validation

### Backend Features
- Express.js with TypeScript
- Serverless-compatible architecture
- Comprehensive API routes for all entities
- External service integrations (Omega EDI, Square, Twilio)
- Webhook handlers for Square and Twilio
- Activity logging and error tracking

### Frontend Features
- React 18 with TypeScript
- Vite for fast development and optimized builds
- TailwindCSS for styling
- shadcn/ui for UI components
- React Query for data fetching
- React Router for navigation

### Deployment
- Vercel for hosting
- Serverless functions for backend
- Static assets for frontend
- Automatic deployments from Git

## Troubleshooting

### Port Already in Use
If ports 3001 or 5173 are in use:
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Database Connection Issues
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check firewall settings

### Build Errors
- Ensure Node.js v18+ is installed
- Clear node_modules and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

## Support

For issues, refer to:
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Vite Documentation](https://vitejs.dev/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Vercel Documentation](https://vercel.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
