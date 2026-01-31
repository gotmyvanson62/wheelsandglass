#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     Update Environment Variables with Vercel Postgres    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "From your Vercel Postgres dashboard, copy the connection strings."
echo ""
echo "Enter your POSTGRES_URL (the pooled connection):"
read -r POSTGRES_URL

echo ""
echo "Enter your POSTGRES_URL_NON_POOLING (the direct connection):"
read -r POSTGRES_URL_NON_POOLING

echo ""
echo "Updating .env file..."

# Backup current .env
cp .env .env.backup

# Update the .env file
cat > .env << EOF
# Database - Vercel Postgres
DATABASE_URL=$POSTGRES_URL
POSTGRES_URL=$POSTGRES_URL
POSTGRES_URL_NON_POOLING=$POSTGRES_URL_NON_POOLING

# Omega EDI - Optional for testing
OMEGA_API_URL=https://api.omega.com
OMEGA_API_KEY=
OMEGA_SHOP_ID=

# Square - Optional for testing
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
SQUARE_ENVIRONMENT=sandbox
SQUARE_WEBHOOK_SECRET=

# Twilio - Optional for testing
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FLEX_FLOW_SID=
TWILIO_PHONE_NUMBER=

# VIN Lookup - Free API, no key needed
VIN_API_URL=https://vpic.nhtsa.dot.gov/api

# NAGS Lookup - Optional
NAGS_API_KEY=
NAGS_API_URL=

# App Configuration
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173
EOF

echo ""
echo "✅ .env file updated successfully!"
echo "📋 Backup saved as .env.backup"
echo ""
echo "Next steps:"
echo "  1. Run: npm run db:generate"
echo "  2. Run: npm run db:migrate"
echo "  3. Run: npm run dev"
echo ""
