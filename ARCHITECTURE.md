# Express Auto Glass - System Architecture Documentation

## Overview

Express Auto Glass is an auto glass service management system that provides:
- **CPQ (Configure Price Quote)**: Customer quote requests → pricing → scheduling
- **CRM**: Contact and job management for the admin team
- **Appointments**: Service scheduling with technician coordination
- **Payments**: Direct customer-to-business payment processing
- **Reviews**: Post-service review invitation automation

---

## Core Business Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           CUSTOMER JOURNEY                                    │
└──────────────────────────────────────────────────────────────────────────────┘

1. QUOTE REQUEST      2. RECEIVE QUOTE     3. SCHEDULE          4. PAY & COMPLETE
   ┌─────────┐          ┌─────────┐         ┌─────────┐         ┌─────────┐
   │ Customer│    →     │  Admin  │    →    │ Customer│    →    │ Service │
   │  Form   │          │ Reviews │         │ Selects │         │Complete │
   │         │          │ & Prices│         │  Time   │         │+ Review │
   └─────────┘          └─────────┘         └─────────┘         └─────────┘
        │                    │                   │                    │
        ▼                    ▼                   ▼                    ▼
   quoteSubmissions     omegaJobs          appointments          payments
      (database)        (database)          (database)          (database)
```

---

## System Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + TypeScript + Vite | Single Page Application |
| UI Framework | TailwindCSS + shadcn/ui | Component library |
| State | TanStack Query | Server state management |
| Backend | Express.js + TypeScript | REST API server |
| Database | PostgreSQL + Drizzle ORM | Data persistence |
| Deployment | Vercel | Serverless hosting |

### Directory Structure

```
wheels-and-glass/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── crm/          # CRM-specific components
│   │   │   ├── dashboard/    # Dashboard widgets
│   │   │   └── ui/           # Base UI components (shadcn)
│   │   ├── pages/            # Route pages
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Utilities and API client
│   └── public/               # Static assets
├── server/                    # Express backend
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # Business logic services
│   │   └── db/               # Database connection
└── shared/                    # Shared code
    └── schema.ts             # Database schema (Drizzle)
```

---

## Database Schema

### Core Tables

#### `quoteSubmissions` - Quote Request Intake
Captures customer quote requests from the public form.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| timestamp | timestamp | Submission time |
| firstName, lastName | text | Customer name |
| mobilePhone, email | text | Contact info |
| location, zipCode | text | Service location |
| serviceType | text | Type of service needed |
| year, make, model | text | Vehicle info |
| vin | text | Vehicle Identification Number |
| selectedWindows | jsonb | Array of selected glass types |
| status | text | submitted/processed/quoted/converted |

#### `customers` - Enhanced Contact Records
Full customer profiles with history.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| firstName, lastName | text | Name |
| primaryEmail, primaryPhone | text | Contact |
| address, city, state, postalCode | text | Location |
| smsOptIn, emailOptIn | boolean | Marketing preferences |
| totalJobs, totalSpent | integer | Lifetime metrics |
| accountType | text | individual/business/fleet |

#### `omegaJobs` - Job Records (Omega EDI Format)
Jobs in Omega EDI-compatible format.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| jobNumber | text | Unique job identifier |
| customerId, vehicleId | integer | Foreign keys |
| status | text | Open Lead/Open Quote/Work Order/Ready to Invoice/Invoiced/Archived |
| invoiceItems | jsonb | Line items with NAGS codes |
| subtotal, tax, total | integer | Amounts in cents |
| appointmentDate, appointmentStatus | text | Scheduling |

#### `appointments` - Scheduling
Service appointments linked to jobs.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| transactionId | integer | Link to job |
| customerName, customerPhone | text | Contact |
| requestedDate, scheduledDate | timestamp | Scheduling |
| serviceAddress | text | Location |
| status | text | requested/scheduled/confirmed/cancelled |
| technicianId | text | Assigned tech |

#### `vehicleLookups` - VIN Cache
Cached VIN decode results.

| Column | Type | Description |
|--------|------|-------------|
| vin | text | VIN (unique) |
| year, make, model | text | Decoded info |
| bodyType, engine, trim | text | Additional details |
| lookupSource | text | omega_edi/nhtsa/manual |
| isValid | boolean | VIN validity |

---

## API Endpoints

### Quote Management (`/api/quote`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/quote/submit | Submit new quote request |
| GET | /api/quote/submissions | List all quotes (admin) |
| GET | /api/quote/submissions/:id | Get single quote |
| PUT | /api/quote/submissions/:id | Update quote status |
| GET | /api/quote/stats | Quote statistics |

### Jobs (`/api/jobs`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/jobs | List jobs with filters |
| POST | /api/jobs | Create new job |
| GET | /api/jobs/:id | Get job details |
| PUT | /api/jobs/:id | Update job |
| POST | /api/jobs/:id/sync-omega | Sync with Omega EDI |

### Appointments (`/api/appointments`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/appointments | List appointments |
| POST | /api/appointments | Create appointment |
| PUT | /api/appointments/:id | Update appointment |

### Payments (`/api/payments`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/payments | List payments |
| POST | /api/payments | Process payment |
| GET | /api/payments/:id | Get payment details |

### Dashboard (`/api/dashboard`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/stats | Dashboard statistics |
| GET | /api/dashboard/recent-activity | Recent activity log |

---

## Omega EDI Integration Mapping

### What We Build Natively

| Feature | Our Implementation | Omega EDI Equivalent |
|---------|-------------------|---------------------|
| Quote Intake | `/api/quote/submit` | POST /Invoices (status=LE) |
| VIN Lookup | `/api/vin/lookup` + NHTSA | GET /NAGS/Vehicles |
| Customer Management | `customers` table | GET/POST /Companies |
| Job Status Tracking | `omegaJobs.status` | Invoice lifecycle |
| Appointment Scheduling | `appointments` table | GET/POST /Appointments |

### Omega EDI Dependencies (To Consider Replacing)

| Omega Feature | Current Usage | Replacement Strategy |
|--------------|---------------|---------------------|
| **NAGS Parts Lookup** | Used for pricing | Build local parts database or integrate NAGS directly |
| **VIN to Glass Mapping** | Critical for quoting | Use NHTSA API + local mapping database |
| **Price Calculations** | Uses Omega pricing | Build local pricing engine with markup rules |
| **EDI Submission** | Insurance claims | Direct integration with SGC/HSG/GNCS |

### Omega EDI Status Codes (Reference)

| Code | Status | Description |
|------|--------|-------------|
| LE | Lead | Initial contact/quote request |
| QO | Quote | Quote sent to customer |
| WO | Work Order | Scheduled for service |
| IN | Invoice | Service complete, ready for payment |
| CL | Closed | Paid and complete |
| VO | Void | Cancelled |

---

## Service Layer Architecture

### VIN Lookup Service (`vin-lookup.ts`)

```
VIN Input
    │
    ▼
┌─────────────────┐
│ Check Local     │
│ Cache           │ → Hit: Return cached data
└─────────────────┘
    │ Miss
    ▼
┌─────────────────┐
│ Omega EDI API   │ → Success: Cache & return
│ /vehicles/vin   │
└─────────────────┘
    │ Fail
    ▼
┌─────────────────┐
│ NHTSA API       │ → Success: Cache & return
│ (Free fallback) │
└─────────────────┘
    │ Fail
    ▼
Return invalid VIN
```

### Quote to Job Conversion Flow

```
quoteSubmissions (status: submitted)
         │
         ▼ Admin reviews
quoteSubmissions (status: processed)
         │
         ▼ Price calculated
omegaJobs (status: Open Quote)
         │
         ▼ Customer accepts
omegaJobs (status: Work Order)
         │
         ▼ Create appointment
appointments (status: scheduled)
         │
         ▼ Service complete
omegaJobs (status: Ready to Invoice)
         │
         ▼ Payment received
payments + omegaJobs (status: Invoiced)
         │
         ▼ Review invitation
```

---

## Payment Architecture

### Direct Payment Model (No POS)

The system supports direct customer-to-business payments, eliminating middlemen:

```
Customer → Square Payments → Business Bank Account
              │
              └── Transaction logged in `payments` table
```

### Payment Flow

1. **Quote Accepted**: Customer views pricing
2. **Payment Link**: Square payment link generated
3. **Payment Capture**: Customer pays directly
4. **Confirmation**: System updates job status
5. **Review Invite**: Automated Yelp/Google review request

---

## Building Native Alternatives to Omega EDI

### Priority 1: NAGS Auto Glass Database

**Current**: Omega EDI `/NAGS/Parts/{id}` endpoint
**Alternative**:
- License NAGS database directly
- Build local parts database with:
  - Part numbers by vehicle
  - Pricing tiers (OEM, aftermarket, OEE)
  - Compatibility mapping

### Priority 2: VIN to Glass Mapping

**Current**: Omega EDI `/NAGS/Vehicles` endpoint
**Alternative**:
- NHTSA vPIC API (free, covers basic VIN decode)
- Build mapping table: VIN pattern → NAGS part numbers
- Cache all lookups in `vehicleLookups` table

### Priority 3: Pricing Engine

**Current**: Omega EDI pricing profiles
**Alternative**:
- `rpjSettings` table for Revenue Per Job configuration
- Markup rules by part type, service type, location
- Insurance vs. cash pricing tiers

### Priority 4: EDI Claim Submission

**Current**: Omega EDI handles SGC/HSG/GNCS submission
**Alternative**:
- Direct integration with glass network APIs
- `ediWorkOrders` and `ediInvoices` tables already support this

---

## Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Omega EDI (optional - for legacy sync)
OMEGA_API_KEY=your_key
OMEGA_API_BASE_URL=https://app.omegaedi.com/api/2.0/

# Square Payments
SQUARE_ACCESS_TOKEN=your_token
SQUARE_LOCATION_ID=your_location
SQUARE_ENVIRONMENT=sandbox|production

# Twilio SMS
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1...

# App
NODE_ENV=development|production
CLIENT_URL=https://your-domain.com
```

---

## Security Considerations

1. **Authentication**: Session-based auth for admin portal
2. **API Keys**: Stored in environment variables, never in code
3. **Input Validation**: Zod schemas on all API inputs
4. **Rate Limiting**: 100 requests/15min on public endpoints
5. **HTTPS**: All production traffic encrypted

---

## Deployment

### Vercel Configuration

The app deploys as:
- **Static Frontend**: Vite-built React app served via CDN
- **Serverless API**: Express routes as Vercel functions
- **Database**: PostgreSQL with connection pooling

### Build Commands

```bash
# Local development
npm run dev

# Production build
npm run build

# Deploy
npx vercel --prod
```

---

## Future Roadmap

### Phase 1: Native Functionality (Current)
- [x] Quote intake system
- [x] CRM with quotes tab
- [x] VIN lookup with NHTSA fallback
- [x] Dashboard with quote metrics

### Phase 2: Reduce Omega Dependency
- [ ] Local NAGS parts database
- [ ] Native pricing engine
- [ ] Direct EDI network integration

### Phase 3: Enhanced Automation
- [ ] Automated quote generation
- [ ] SMS appointment reminders
- [ ] Review invitation automation
- [ ] Technician mobile app

---

## UI/UX Architecture

### Theme System

The application implements a dual-theme system with:

- **Light Mode**: Default theme for all users
- **Dark Mode**: Toggle available for admin portal

#### Implementation Details

| Component | File | Purpose |
|-----------|------|---------|
| CSS Variables | `client/src/index.css` | Theme color definitions |
| ThemeProvider | `client/src/hooks/use-theme.tsx` | React context for theme state |
| Theme Toggle | `client/src/components/layout/sidebar-layout.tsx` | UI toggle button |

#### CSS Variable System

```css
/* Light mode (default) */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 160 84% 39%;           /* Emerald primary */
  --card: 0 0% 100%;
  --border: 214.3 31.8% 91.4%;
}

/* Dark mode (softer grays) */
.dark {
  --background: 220 14% 10%;        /* Soft dark gray #181b20 */
  --foreground: 210 20% 95%;
  --primary: 160 84% 39%;           /* Emerald maintained */
  --card: 220 14% 12%;
  --border: 220 14% 22%;
}
```

#### Public Pages (Force Light Mode)

Public-facing pages use the `force-light` class to maintain light mode regardless of user preference:

```tsx
// Example: Landing page
<div className="min-h-screen bg-gray-50 force-light">
  {/* Content always light themed */}
</div>
```

Pages using force-light:
- Landing (`/`)
- Features (`/features`)
- Insurance (`/insurance`)
- Service Areas (`/service-areas`)
- Customer Portal (`/customer-portal`)
- Admin Login (`/admin/login`)
- Quote Form (modal)

### Brand Identity

| Element | Value |
|---------|-------|
| Primary Color | Emerald/Teal gradient (`from-emerald-500 to-teal-600`) |
| Logo | Car icon in emerald gradient |
| Font Weight (Dark) | +50 weight compensation for legibility |

### Component Styling Patterns

All admin pages follow these dark mode patterns:

```tsx
// Background colors
bg-gray-50 dark:bg-gray-800       // Page backgrounds
bg-gray-100 dark:bg-gray-700      // Secondary backgrounds
bg-white dark:bg-gray-900         // Card backgrounds

// Text colors
text-gray-900 dark:text-gray-100  // Primary text
text-gray-600 dark:text-gray-400  // Secondary text
text-gray-500 dark:text-gray-400  // Muted text

// Borders
border-gray-200 dark:border-gray-700

// Hover states
hover:bg-gray-50 dark:hover:bg-gray-700
hover:bg-gray-100 dark:hover:bg-gray-600
```

---

## Support & Resources

- **Omega EDI API Docs**: https://app.omegaedi.com/api/docs/
- **NHTSA vPIC API**: https://vpic.nhtsa.dot.gov/api/
- **Square Developer**: https://developer.squareup.com/
- **Twilio Docs**: https://www.twilio.com/docs

