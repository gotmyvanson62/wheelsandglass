# 🚀 Quick Start Guide

You have Node.js installed! Here's what to do next:

---

## ⚡ Option 1: Test Frontend Only (No Database) - FASTEST!

See the app UI **right now** without any database setup:

### Open your Terminal and run:

```bash
cd /Users/elanokonsky/Documents/Work/Projects/wheels-and-glass
npm run dev:client
```

### Then open in your browser:
**http://localhost:5173**

You'll see:
- ✅ Navigation working
- ✅ All pages (CRM, Dashboard, Operations, Settings)
- ✅ Beautiful UI
- ⚠️ No data (needs database)

To stop: Press `Ctrl + C` in terminal

---

## 🗄️ Option 2: Full Setup with Database

To see real data and full functionality, you need a database.

### Easiest: Use Vercel Postgres (5 minutes)

1. Go to: **https://vercel.com/dashboard**
2. Create account (free)
3. Click **"Storage"** → **"Create Database"** → **"Postgres"**
4. Copy the connection strings
5. Update your `.env` file:

```bash
cd /Users/elanokonsky/Documents/Work/Projects/wheels-and-glass
nano .env  # Or use any text editor
```

Paste your Vercel connection strings:
```
DATABASE_URL=postgresql://...  # Paste from Vercel
POSTGRES_URL=postgresql://...  # Paste from Vercel
```

6. Run migrations:
```bash
npm run db:generate
npm run db:migrate
```

7. Start the app:
```bash
npm run dev
```

8. Open: **http://localhost:5173**

---

## 📋 Alternative: Local PostgreSQL

If you prefer local database, see [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.

---

## 🎯 What You'll See

### Frontend Only (Option 1):
- ✅ UI and navigation
- ❌ No data in tables
- ❌ API calls will fail

### Full Setup (Option 2):
- ✅ Complete application
- ✅ Create and manage jobs
- ✅ View statistics
- ✅ All features working

---

## 🔧 Useful Commands

```bash
# Start frontend only
npm run dev:client

# Start backend only (needs database)
npm run dev:server

# Start both together (needs database)
npm run dev

# Build for production
npm run build

# Run database migrations
npm run db:migrate
```

---

## 🆘 Need Help?

### Check if everything is installed:
```bash
node --version    # Should show v24.13.0
npm --version     # Should show 11.6.2
```

### Common Issues:

**"Port already in use"**
```bash
lsof -ti:5173 | xargs kill -9  # Kill frontend
lsof -ti:3001 | xargs kill -9  # Kill backend
```

**"Database connection failed"**
- Make sure DATABASE_URL is set in `.env`
- For Vercel Postgres, check connection strings are correct
- For local PostgreSQL, make sure it's running

**"Module not found"**
```bash
npm install  # Reinstall dependencies
```

---

## 📁 Project Files

- **START_APP.sh** - Quick start script
- **DATABASE_SETUP.md** - Detailed database setup guide
- **SETUP.md** - Complete setup documentation
- **PROJECT_STATUS.md** - What's been built
- **.env** - Your configuration (don't commit to git!)

---

## 🎉 You're All Set!

### Right now you can:
1. **Test the UI**: `npm run dev:client`
2. **Set up database**: Follow Option 2 above
3. **Deploy to Vercel**: `vercel --prod` (when ready)

### Choose your path:
- **Just want to see it?** → Run `npm run dev:client` now!
- **Want full functionality?** → Set up Vercel Postgres (5 min)
- **Want local development?** → See DATABASE_SETUP.md

---

**Recommended**: Start with Option 1 to see the UI, then add database when you're ready!
