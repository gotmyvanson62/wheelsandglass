# Wheels and Glass

A comprehensive Squarespace to Omega EDI integration platform for auto glass services.

## Features

- Real-time job record management with clickable access throughout CRM
- Authentic Omega EDI job dialog format with complete customer/vehicle/financial details
- PostgreSQL database with 15+ tables for comprehensive business management
- React/TypeScript frontend with shadcn/ui components
- Express.js backend with comprehensive API routes
- Production-ready webhook handlers and payment integration

## Architecture

- **Frontend**: React 18 + TypeScript + Vite + shadcn/ui + TailwindCSS
- **Backend**: Node.js + Express + TypeScript + Drizzle ORM
- **Database**: PostgreSQL with comprehensive schema for business operations
- **Integration**: Omega EDI + Square Payments + Quo (OpenPhone) SMS + VIN/NAGS APIs

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run database migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. Start development servers:
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend on http://localhost:5173
   - Backend API on http://localhost:3001

### Project Structure

```
wheels-and-glass/
├── client/              # React frontend
├── server/              # Express backend
├── shared/              # Shared types and database schema
└── api/                 # Vercel serverless functions
```

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Configure environment variables in Vercel dashboard

4. Set up Vercel Postgres or external PostgreSQL database

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `OMEGA_API_KEY` - Omega EDI API credentials
- `SQUARE_ACCESS_TOKEN` - Square Payments API token
- `QUO_API_KEY` - Quo (OpenPhone) SMS API credentials

## License

Proprietary - All rights reserved
