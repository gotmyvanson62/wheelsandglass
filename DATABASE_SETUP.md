# Database Setup Guide

You have **3 options** for setting up the database. Choose the one that works best for you:

---

## Option 1: Vercel Postgres (Easiest - Cloud Database) ⭐ RECOMMENDED

This is the easiest option and works great for both development and production!

### Steps:

1. **Go to Vercel**: https://vercel.com/dashboard
2. **Create account** (if you don't have one)
3. **Click "Storage"** in the sidebar
4. **Click "Create Database"**
5. **Select "Postgres"**
6. **Copy the connection strings** provided
7. **Update your `.env` file** with the connection strings:

```bash
# Edit the .env file
nano .env

# Add these values from Vercel:
DATABASE_URL=postgresql://...          # From Vercel
POSTGRES_URL=postgresql://...          # From Vercel (pooled)
POSTGRES_URL_NON_POOLING=postgresql://...  # From Vercel
```

8. **Run migrations**:
```bash
npm run db:generate
npm run db:migrate
```

9. **Start the app**:
```bash
npm run dev
```

✅ **Pros**: No local installation, works everywhere, free tier available
❌ **Cons**: Requires internet connection

---

## Option 2: Install PostgreSQL with Homebrew (Local Database)

This installs PostgreSQL on your Mac for local development.

### Steps:

1. **Install Homebrew** (if not installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
   - You'll need to enter your Mac password
   - Follow the on-screen instructions

2. **After Homebrew is installed, add it to your PATH**:
```bash
# For Apple Silicon (M1/M2/M3)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# For Intel Macs
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/usr/local/bin/brew shellenv)"
```

3. **Install PostgreSQL**:
```bash
brew install postgresql@15
```

4. **Start PostgreSQL**:
```bash
brew services start postgresql@15
```

5. **Create the database**:
```bash
createdb wheelsandglass
```

6. **Update `.env` file**:
```bash
# Edit .env
nano .env

# Update DATABASE_URL to:
DATABASE_URL=postgresql://$(whoami)@localhost:5432/wheelsandglass
```

7. **Run migrations**:
```bash
cd /Users/elanokonsky/Documents/Work/Projects/wheels-and-glass
npm run db:generate
npm run db:migrate
```

8. **Start the app**:
```bash
npm run dev
```

✅ **Pros**: Full control, works offline, free
❌ **Cons**: Requires local installation and setup

---

## Option 3: Postgres.app (Easiest Local Option)

A simple macOS app with a nice GUI.

### Steps:

1. **Download Postgres.app**: https://postgresapp.com/
2. **Install and open** Postgres.app
3. **Click "Initialize"** to create a new server
4. **Click on the database** in the sidebar
5. **Open Terminal** and run:
```bash
# Add psql to your PATH
sudo mkdir -p /etc/paths.d &&
echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp

# Create database
createdb wheelsandglass
```

6. **Update `.env` file**:
```bash
# Edit .env
nano .env

# Update DATABASE_URL to:
DATABASE_URL=postgresql://$(whoami)@localhost:5432/wheelsandglass
```

7. **Run migrations**:
```bash
cd /Users/elanokonsky/Documents/Work/Projects/wheels-and-glass
npm run db:generate
npm run db:migrate
```

8. **Start the app**:
```bash
npm run dev
```

✅ **Pros**: Easy GUI, simple setup, works offline
❌ **Cons**: macOS only

---

## Quick Test Without Database

You can test the frontend **right now** without setting up a database:

```bash
cd /Users/elanokonsky/Documents/Work/Projects/wheels-and-glass
npm run dev:client
```

Then open: **http://localhost:5173**

You'll see the UI and navigation, but no data will load until you set up a database.

---

## Verifying Your Setup

Once you've chosen an option and set up the database, verify it's working:

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# You should see PostgreSQL version info
```

---

## Troubleshooting

### "Database connection error"
- Check that PostgreSQL is running: `brew services list` (for Homebrew)
- Verify DATABASE_URL in `.env` is correct
- Try connecting manually: `psql $DATABASE_URL`

### "Permission denied"
- Make sure you have admin/sudo access
- Try running the setup command with your password

### "Command not found: createdb"
- PostgreSQL may not be in your PATH
- Restart your terminal after installation
- Or use full path: `/opt/homebrew/bin/createdb` (M1) or `/usr/local/bin/createdb` (Intel)

---

## My Recommendation

🌟 **Start with Vercel Postgres** - It's the easiest and works immediately!

You can always switch to local PostgreSQL later if you want to work offline.

---

## Need Help?

Run these commands to check your setup:

```bash
# Check Node.js
node --version

# Check npm
npm --version

# Check PostgreSQL (if installed locally)
psql --version

# Check if database exists
psql -l | grep wheelsandglass
```
