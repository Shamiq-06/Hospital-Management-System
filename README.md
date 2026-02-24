# 🏥 Hospital Management System

A comprehensive, full-stack web application for managing hospital operations built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🌟 Features

### Core Functionality

- **🔐 Role-Based Authentication** - Secure JWT-based authentication for Patients, Doctors, and Admins
- **📅 Appointment Management** - Book, reschedule, and cancel appointments with real-time availability
- **💳 Online Payments** - Integrated PayPal Sandbox for consultation fee payments
- **📱 WhatsApp Notifications** - Automated notifications using Meta WhatsApp Cloud API
- **👨‍⚕️ Doctor Management** - Profile management, availability slots, consultation notes
- **👤 Patient Portal** - Profile management, doctor search, appointment history
- **👨‍💼 Admin Dashboard** - User management, analytics, system overview

### Technical Highlights

- RESTful API architecture
- Secure password hashing with bcryptjs
- JWT token-based authentication
- MongoDB with Mongoose ODM
- React Context API for state management
- Responsive modern UI design
- Input validation and sanitization
- Rate limiting and security headers
- Comprehensive error handling

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**
- **PayPal Developer Account** (for payments)
- **Meta WhatsApp API** (optional, for notifications)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Hospital\ Management\ System
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run seed    # Seed database with sample data
   npm run dev     # Start backend server
   ```

3. **Setup Frontend (in a new terminal):**
   ```bash
   cd frontend
   npm install
   npm start       # Start React development server
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📋 Demo Credentials

After running the seed script (`npm run seed`), use these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@hospital.com | Admin@123 |
| **Doctor** | dr.smith@hospital.com | Doctor@123 |
| **Patient** | patient1@example.com | Patient@123 |

## 🏗️ Project Structure

```
Hospital Management System/
├── backend/                    # Node.js + Express API
│   ├── config/                # Database configuration
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Custom middleware
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API routes
│   ├── services/              # External service integrations
│   ├── utils/                 # Utility functions
│   ├── scripts/               # Database seed scripts
│   ├── server.js              # Server entry point
│   └── README.md              # Backend documentation
├── frontend/                   # React application
│   ├── public/                # Static files
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React Context providers
│   │   ├── pages/             # Page components
│   │   │   ├── patient/       # Patient pages
│   │   │   ├── doctor/        # Doctor pages
│   │   │   └── admin/         # Admin pages
│   │   ├── utils/             # API client & utilities
│   │   ├── App.js             # Main app component
│   │   └── index.js           # React entry point
│   └── README.md              # Frontend documentation
└── README.md                   # This file
```

## 🎯 User Roles & Capabilities

### 👤 Patient
- Create and manage personal profile
- Search doctors by specialization
- View doctor details and availability
- Book appointments with preferred doctors
- Pay consultation fees via PayPal
- View appointment history
- Access consultation notes and prescriptions
- Cancel upcoming appointments

### 👨‍⚕️ Doctor
- Create and manage professional profile
- Set availability schedules (recurring or one-time)
- View appointment requests
- Approve or reject appointments
- Add consultation notes and diagnosis
- Write digital prescriptions
- View statistics and consultation history

### 👨‍💼 Admin
- View system-wide statistics and analytics
- Manage all users (patients, doctors, staff)
- Approve or reject doctor registrations
- View all appointments across the system
- Monitor payment transactions
- Generate reports and insights
- Activate/deactivate user accounts

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 4.18.2
- **Database:** MongoDB with Mongoose 7.6.3
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcryptjs 2.4.3
- **Payment:** PayPal REST SDK 1.8.1
- **Validation:** express-validator 7.0.1
- **Security:** helmet, express-rate-limit, CORS

### Frontend
- **Library:** React 18.2.0
- **Routing:** React Router DOM 6.20.0
- **HTTP Client:** Axios 1.6.0
- **State Management:** React Context API
- **Styling:** Custom CSS with responsive design

### External Services
- **Payment Gateway:** PayPal Sandbox
- **Notifications:** WhatsApp Cloud API (Meta)
- **Database:** MongoDB Atlas (optional)

## 📚 API Documentation

### Authentication
```http
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login user
GET  /api/auth/me          # Get current user
PUT  /api/auth/profile     # Update profile
```

### Patient Endpoints
```http
GET    /api/patients/doctors              # Search doctors
GET    /api/patients/appointments         # Get appointments
PUT    /api/patients/profile              # Update profile
GET    /api/patients/doctors/:id          # Get doctor details
```

### Doctor Endpoints
```http
POST   /api/doctors/availability          # Create availability
GET    /api/doctors/availability          # Get availability
GET    /api/doctors/appointments          # Get appointments
PATCH  /api/doctors/appointments/:id/status    # Update status
POST   /api/doctors/appointments/:id/notes     # Add notes
```

### Appointment Endpoints
```http
POST   /api/appointments                  # Create appointment
GET    /api/appointments/:id              # Get appointment
PATCH  /api/appointments/:id/reschedule   # Reschedule
DELETE /api/appointments/:id/cancel       # Cancel
```

### Payment Endpoints
```http
POST   /api/payments/create               # Create PayPal payment
POST   /api/payments/execute              # Execute payment
GET    /api/payments/:id                  # Get payment details
```

### Admin Endpoints
```http
GET    /api/admin/statistics              # System statistics
GET    /api/admin/analytics               # Analytics data
GET    /api/admin/users                   # All users
GET    /api/admin/doctors                 # All doctors
PATCH  /api/admin/doctors/:id/approval    # Approve doctor
GET    /api/admin/appointments            # All appointments
```

For detailed API documentation, see [backend/README.md](backend/README.md)

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration

Update `frontend/src/utils/api.js` if your backend URL is different:
```javascript
const baseURL = 'http://localhost:5000/api';
```

## 🔒 Security Features

- **Password Hashing:** bcrypt with salt rounds
- **JWT Tokens:** Secure token-based authentication
- **Role-Based Access Control:** Middleware authorization
- **Input Validation:** express-validator on all inputs
- **Rate Limiting:** Prevention of brute force attacks
- **CORS Protection:** Configured allowed origins
- **Helmet:** Security headers middleware
- **MongoDB Injection Prevention:** Mongoose sanitization

## 📱 Screenshots & User Flow

### Patient Workflow
1. Register → 2. Complete Profile → 3. Search Doctors → 4. Book Appointment → 5. Pay Online → 6. View Consultation

### Doctor Workflow
1. Register → 2. Wait for Admin Approval → 3. Set Availability → 4. Manage Appointments → 5. Add Consultation Notes

### Admin Workflow
1. Review Registrations → 2. Approve Doctors → 3. Monitor System → 4. Generate Reports

## 🧪 Testing

### Manual Testing

Use the provided demo credentials to test:
1. Patient booking flow
2. Doctor consultation flow
3. Admin management flow
4. Payment integration
5. Role-based access control

### Sample Test Scenarios

**Patient:**
- Register and login
- Complete profile with medical history
- Search for cardiologist
- Book appointment with Dr. Smith
- Pay via PayPal sandbox
- View appointment details

**Doctor:**
- Login as Dr. Smith
- Create Monday-Friday availability (9 AM - 5 PM)
- View pending appointment
- Confirm appointment
- Add consultation notes and prescription

**Admin:**
- Login as admin
- Review new doctor registration
- Approve doctor
- View system statistics
- Check monthly revenue

## 🚀 Deployment

### Backend Deployment (Heroku Example)

```bash
cd backend
heroku create your-hospital-api
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_strong_secret
# Set other env variables
git push heroku main
```

### Frontend Deployment (Vercel Example)

```bash
cd frontend
npm run build
vercel --prod
```

Update frontend API URL to production backend URL.

## 📖 Documentation

- [Backend Documentation](backend/README.md) - Detailed backend setup and API docs
- [Frontend Documentation](frontend/README.md) - Frontend setup and component docs

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongosh

# Verify connection string in backend/.env
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### PayPal Payment Errors
- Verify sandbox mode is enabled
- Check credentials in .env
- Use PayPal sandbox test accounts

### CORS Errors
- Verify FRONTEND_URL in backend .env
- Check CORS configuration in server.js

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [JWT Introduction](https://jwt.io/introduction)
- [PayPal Developer Docs](https://developer.paypal.com/docs/)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Future Enhancements

- [ ] Video consultation feature
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Prescription PDF download
- [ ] Medical record file uploads
- [ ] Advanced search and filters
- [ ] Calendar view for appointments
- [ ] Real-time chat messaging
- [ ] Mobile application (React Native)
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Analytics dashboard with charts
- [ ] Appointment reminders (24 hours before)
- [ ] Doctor ratings and reviews
- [ ] Insurance integration

## 📄 License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 👏 Acknowledgments

- PayPal for payment gateway sandbox
- Meta for WhatsApp Cloud API
- MongoDB for excellent database documentation
- React team for amazing frontend library
- All open-source contributors

## 📞 Support

For issues, questions, or suggestions:
- Review the documentation in backend/README.md and frontend/README.md
- Check the troubleshooting section
- Open an issue on GitHub

---

**Built with ❤️ using the MERN Stack**
