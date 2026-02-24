@echo off
REM Hospital Management System - Setup Script for Windows
REM This script sets up both backend and frontend with a single command

echo ========================================
echo Hospital Management System - Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node -v

REM Check if MongoDB is available
where mongosh >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    where mongo >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] MongoDB CLI not found. Make sure MongoDB is installed and running.
    ) else (
        echo [OK] MongoDB is available
    )
) else (
    echo [OK] MongoDB is available
)

echo.
echo Step 1: Setting up Backend...
echo ------------------------------

cd backend

REM Check if node_modules exists
if exist "node_modules\" (
    echo node_modules already exists, skipping npm install
) else (
    echo Installing backend dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install backend dependencies
        pause
        exit /b 1
    )
)

REM Check if .env exists
if exist ".env" (
    echo [OK] .env file already exists
) else (
    echo Creating .env file from template...
    copy .env.example .env
    echo [WARNING] Please update backend\.env with your configuration
)

echo.
echo Step 2: Setting up Frontend...
echo -------------------------------

cd ..\frontend

REM Check if node_modules exists
if exist "node_modules\" (
    echo node_modules already exists, skipping npm install
) else (
    echo Installing frontend dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

cd ..

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo Next Steps:
echo -----------
echo 1. Update backend\.env with your configuration:
echo    - MongoDB connection string (MONGO_URI)
echo    - JWT secret key (JWT_SECRET)
echo    - PayPal credentials (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
echo    - WhatsApp API credentials (optional)
echo.
echo 2. Seed the database with sample data:
echo    cd backend
echo    npm run seed
echo.
echo 3. Start the backend server:
echo    cd backend
echo    npm run dev
echo.
echo 4. Start the frontend (in a new terminal):
echo    cd frontend
echo    npm start
echo.
echo 5. Access the application:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo.
echo Demo Credentials (after seeding):
echo    Admin:   admin@hospital.com / Admin@123
echo    Doctor:  dr.smith@hospital.com / Doctor@123
echo    Patient: patient1@example.com / Patient@123
echo.
echo Happy coding! 🚀
echo.
pause
