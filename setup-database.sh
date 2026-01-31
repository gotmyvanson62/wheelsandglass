#!/bin/bash

cd "$(dirname "$0")"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         Setting Up Database with Vercel Postgres         ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if DATABASE_URL is set
if grep -q "placeholder" .env; then
    echo "❌ ERROR: .env file still has placeholder values!"
    echo ""
    echo "Please update your .env file with Vercel connection strings first."
    echo ""
    echo "Run: ./update-env.sh"
    echo "Or manually edit: nano .env"
    echo ""
    exit 1
fi

echo "✅ Environment variables configured"
echo ""

echo "📦 Step 1: Generating database migrations..."
npm run db:generate
if [ $? -ne 0 ]; then
    echo "❌ Migration generation failed!"
    exit 1
fi
echo ""

echo "🗄️  Step 2: Running migrations to create tables..."
npm run db:migrate
if [ $? -ne 0 ]; then
    echo "❌ Migration failed!"
    echo ""
    echo "Common issues:"
    echo "  - Check your DATABASE_URL is correct in .env"
    echo "  - Make sure you copied the complete connection string"
    echo "  - Verify your Vercel Postgres database is running"
    exit 1
fi
echo ""

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                   ✅ DATABASE READY!                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Your database has been set up with 15 tables:"
echo "  • users, contacts, jobRecords"
echo "  • appointments, invoices, payments"
echo "  • smsInteractions, transactions"
echo "  • activityLogs, webhookEvents"
echo "  • and more..."
echo ""
echo "🚀 Next: Start the application"
echo ""
echo "   npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
