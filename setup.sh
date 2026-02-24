#!/bin/bash

# Hospital Management System - Setup Script
# This script sets up both backend and frontend with a single command

echo "🏥 Hospital Management System - Setup Script"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js is installed$(node -v)${NC}"

# Check if MongoDB is running
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    echo -e "${YELLOW}⚠ MongoDB CLI not found. Make sure MongoDB is installed and running.${NC}"
else
    echo -e "${GREEN}✓ MongoDB is available${NC}"
fi

echo ""
echo "Step 1: Setting up Backend..."
echo "------------------------------"

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "node_modules already exists, skipping npm install"
else
    echo "Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install backend dependencies${NC}"
        exit 1
    fi
fi

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file already exists${NC}"
else
    echo "Creating .env file from template..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please update backend/.env with your configuration${NC}"
fi

echo ""
echo "Step 2: Setting up Frontend..."
echo "-------------------------------"

# Navigate to frontend directory
cd ../frontend

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "node_modules already exists, skipping npm install"
else
    echo "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        exit 1
    fi
fi

cd ..

echo ""
echo -e "${GREEN}=============================================="
echo "✓ Setup completed successfully!"
echo "==============================================}"

echo ""
echo "📋 Next Steps:"
echo "-------------"
echo "1. Update backend/.env with your configuration:"
echo "   - MongoDB connection string (MONGO_URI)"
echo "   - JWT secret key (JWT_SECRET)"
echo "   - PayPal credentials (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)"
echo "   - WhatsApp API credentials (optional)"
echo ""
echo "2. Seed the database with sample data:"
echo "   cd backend && npm run seed"
echo ""
echo "3. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "4. Start the frontend (in a new terminal):"
echo "   cd frontend && npm start"
echo ""
echo "5. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📚 Demo Credentials (after seeding):"
echo "   Admin:   admin@hospital.com / Admin@123"
echo "   Doctor:  dr.smith@hospital.com / Doctor@123"
echo "   Patient: patient1@example.com / Patient@123"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
