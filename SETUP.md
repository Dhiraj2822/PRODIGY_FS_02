# Quick Setup Guide

## Prerequisites Checklist
- [ ] Node.js installed (v16+)
- [ ] XAMPP installed
- [ ] Git installed

## 5-Minute Setup

### 1. Get the Code
```bash
git clone <your-repo-url>
cd employee-management-system
npm install
```

### 2. Start Database
1. Open XAMPP Control Panel
2. Click "Start" for Apache
3. Click "Start" for MySQL
4. Both should show green "Running" status

### 3. Configure Environment
```bash
cp .env.example .env
```

**Important**: Edit `.env` and change `JWT_SECRET` to something secure!

### 4. Run the App
```bash
npm run dev
```

### 5. Access the System
- Open: `http://localhost:5173`
- Login: `admin` / `admin123`

## That's It!

The database and tables will be created automatically on first run.

## Quick Verification

You should see these success messages:
```
✅ Connected to MySQL database successfully
✅ Database tables created successfully
✅ Default admin created
🚀 Server running on port 3001
```

## Need Help?

Check the full README.md for detailed troubleshooting.