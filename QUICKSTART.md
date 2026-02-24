# 🚀 Quick Start Guide

Get the Hospital Management System up and running in minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js (v14+) installed - [Download](https://nodejs.org/)
- ✅ MongoDB installed and running - [Download](https://www.mongodb.com/try/download/community)
- ✅ Git (optional, for cloning) - [Download](https://git-scm.com/)

## Option 1: Automated Setup (Recommended)

### Windows Users

1. Open Command Prompt in the project directory
2. Run the setup script:
   ```cmd
   setup.bat
   ```
3. Follow the on-screen instructions

### Mac/Linux Users

1. Open Terminal in the project directory
2. Make the script executable:
   ```bash
   chmod +x setup.sh
   ```
3. Run the setup script:
   ```bash
   ./setup.sh
   ```
4. Follow the on-screen instructions

## Option 2: Manual Setup

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Backend Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your favorite text editor
# Minimum required configuration:
# - MONGO_URI (MongoDB connection string)
# - JWT_SECRET (any random secure string)
```

**Quick .env configuration for local development:**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=my_super_secret_jwt_key_12345
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### Step 3: Seed the Database

```bash
# Still in backend directory
npm run seed
```

This creates sample users:
- Admin: admin@hospital.com / Admin@123
- Doctor: dr.smith@hospital.com / Doctor@123  
- Patient: patient1@example.com / Patient@123

### Step 4: Start Backend Server

```bash
# Still in backend directory
npm run dev
```

You should see: `✓ Server running on port 5000` and `✓ MongoDB Connected`

### Step 5: Install Frontend Dependencies

Open a **new terminal** window:

```bash
cd frontend
npm install
```

### Step 6: Start Frontend

```bash
# Still in frontend directory
npm start
```

The browser will automatically open at http://localhost:3000

## Verify Installation

### 1. Check Backend
Visit http://localhost:5000 - You should see a response from the server

### 2. Check Frontend
Visit http://localhost:3000 - You should see the Hospital Management System homepage

### 3. Test Login
- Click "Login"
- Use: patient1@example.com / Patient@123
- You should be redirected to the patient dashboard

## Common Issues & Solutions

### MongoDB Not Running

**Error:** `MongooseError: connect ECONNREFUSED`

**Solution:**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Port 5000 Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>

# OR change PORT in backend/.env
PORT=5001
```

### Port 3000 Already in Use

**Solution:** React will ask if you want to use another port. Type `Y` and press Enter.

### Module Not Found Errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Testing the Application

### Test Patient Flow

1. **Login as Patient**
   - Email: patient1@example.com
   - Password: Patient@123

2. **Complete Profile**
   - Navigate to "Profile"
   - Fill in medical information
   - Save

3. **Search Doctors**
   - Go to "Find Doctors"
   - Filter by "Cardiology"
   - View Dr. Smith's profile

4. **Book Appointment** (PayPal credentials needed)
   - Click "Book Appointment" on Dr. Smith
   - Select a date and time
   - Add symptoms
   - Proceed to payment

### Test Doctor Flow

1. **Login as Doctor**
   - Email: dr.smith@hospital.com
   - Password: Doctor@123

2. **View Dashboard**
   - See appointment statistics
   - View pending appointments

3. **Set Availability**
   - Navigate to "Manage Availability"
   - Create new time slots
   - Set recurring schedule

4. **Manage Appointments**
   - Go to "My Appointments"
   - Confirm pending appointments
   - Add consultation notes

### Test Admin Flow

1. **Login as Admin**
   - Email: admin@hospital.com
   - Password: Admin@123

2. **View Dashboard**
   - See system statistics
   - View analytics

3. **Manage Doctors**
   - Go to "Manage Doctors"
   - Approve new doctors
   - View doctor details

4. **Manage Users**
   - Navigate to "Manage Users"
   - View all users
   - Activate/deactivate accounts

## PayPal Sandbox Setup (for Payments)

### Quick Setup

1. Visit [PayPal Developer](https://developer.paypal.com/)
2. Sign in or create account
3. Go to "Dashboard" → "My Apps & Credentials"
4. Under "Sandbox", click "Create App"
5. Copy "Client ID" and "Secret"
6. Add to `backend/.env`:
   ```env
   PAYPAL_MODE=sandbox
   PAYPAL_CLIENT_ID=your_client_id_here
   PAYPAL_CLIENT_SECRET=your_secret_here
   ```
7. Restart backend server

### Test Payment

Use PayPal's sandbox test accounts (created automatically):
- Buyer account: Check your PayPal developer dashboard
- Use these credentials in PayPal checkout during appointment booking

## WhatsApp Notifications (Optional)

### Quick Setup

1. Visit [Meta for Developers](https://developers.facebook.com/)
2. Create an app with WhatsApp product
3. Get Phone Number ID and Access Token
4. Add to `backend/.env`:
   ```env
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_ACCESS_TOKEN=your_access_token
   ```
5. Restart backend server

**Note:** Without this, the system works fine, just without WhatsApp notifications.

## Next Steps

Now that your system is running:

1. **Read the Documentation**
   - [Backend README](backend/README.md) - API documentation
   - [Frontend README](frontend/README.md) - Component documentation
   - [Main README](README.md) - Complete overview

2. **Explore the Features**
   - Test all three user roles
   - Try booking and managing appointments
   - Explore admin analytics

3. **Customize**
   - Modify styles in `frontend/src/index.css`
   - Add new features
   - Extend the API

4. **Deploy**
   - Follow deployment guides in respective READMEs
   - Deploy backend to Heroku/Railway/AWS
   - Deploy frontend to Vercel/Netlify

## Getting Help

- **Documentation Issues:** Check the detailed READMEs
- **Setup Problems:** Review this guide's troubleshooting section
- **Code Questions:** Review the code comments and structure
- **Bugs:** Check the console logs (browser DevTools and terminal)

## Useful Commands

### Backend
```bash
npm start          # Start server (production)
npm run dev        # Start server (development with nodemon)
npm run seed       # Seed database with sample data
```

### Frontend
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests (if configured)
```

### MongoDB
```bash
mongosh                              # Open MongoDB shell
use hospital_management              # Switch to database
db.users.find()                      # View all users
db.appointments.find().pretty()      # View appointments
```

## Development Tips

1. **Auto-reload:** Both frontend and backend have hot-reload enabled
2. **Console Logs:** Check browser console and terminal for errors
3. **Network Tab:** Use browser DevTools to inspect API calls
4. **MongoDB Compass:** Visual tool for viewing database contents

## Success Indicators

✅ **Backend Running:** Terminal shows "Server running on port 5000"  
✅ **Database Connected:** Terminal shows "MongoDB Connected"  
✅ **Frontend Running:** Browser opens at localhost:3000  
✅ **Login Works:** Can login with demo credentials  
✅ **API Working:** Dashboard displays data correctly  

---

**You're all set! 🎉 Happy building!**

If you encounter any issues not covered here, check the detailed documentation in the respective README files.
