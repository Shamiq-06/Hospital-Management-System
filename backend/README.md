# Hospital Management System - Backend API

A comprehensive RESTful API for a Hospital Management System built with Node.js, Express.js, and MongoDB.

## Features

- **Role-based Authentication** - JWT-based authentication with three user roles: Patient, Doctor, and Admin
- **Patient Management** - Profile management, doctor search, appointment booking
- **Doctor Management** - Profile management, availability slots, appointment handling, consultation notes
- **Admin Dashboard** - User management, doctor approval, system statistics and analytics
- **Payment Integration** - PayPal Sandbox integration for consultation fees
- **WhatsApp Notifications** - Automated notifications using Meta WhatsApp Cloud API
- **Secure API** - Helmet, CORS, rate limiting, input validation

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 4.18.2
- **Database:** MongoDB with Mongoose 7.6.3
- **Authentication:** JWT (jsonwebtoken 9.0.2), bcryptjs 2.4.3
- **Payment:** PayPal REST SDK 1.8.1
- **Validation:** express-validator 7.0.1
- **Security:** helmet 7.1.0, express-rate-limit 7.1.5, CORS

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js    # Authentication (register, login, profile)
│   ├── patientController.js # Patient operations
│   ├── doctorController.js  # Doctor operations
│   ├── appointmentController.js # Appointment management
│   ├── paymentController.js # PayPal payment handling
│   ├── adminController.js   # Admin operations
│   └── notificationController.js # Notification management
├── middleware/
│   ├── auth.js              # JWT & role-based authorization
│   ├── errorHandler.js      # Centralized error handling
│   └── validation.js        # Request validation middleware
├── models/
│   ├── User.js              # User model (all roles)
│   ├── PatientProfile.js    # Patient profile details
│   ├── DoctorProfile.js     # Doctor profile details
│   ├── AvailabilitySlot.js  # Doctor availability slots
│   ├── Appointment.js       # Appointment bookings
│   ├── Payment.js           # Payment transactions
│   └── Notification.js      # Notification records
├── routes/
│   ├── authRoutes.js
│   ├── patientRoutes.js
│   ├── doctorRoutes.js
│   ├── appointmentRoutes.js
│   ├── paymentRoutes.js
│   ├── adminRoutes.js
│   └── notificationRoutes.js
├── services/
│   ├── whatsappService.js   # WhatsApp Cloud API integration
│   └── paypalService.js     # PayPal payment operations
├── utils/
│   ├── jwtUtils.js          # JWT token generation & verification
│   └── logger.js            # Logging utility
├── scripts/
│   └── seedData.js          # Database seeding script
├── .env.example             # Environment variables template
├── server.js                # Express server entry point
└── package.json
```

## Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher) - Local installation or MongoDB Atlas
- **PayPal Developer Account** - For sandbox credentials
- **Meta WhatsApp Cloud API** - For WhatsApp notifications (optional)

## Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Connection
   MONGO_URI=mongodb://localhost:27017/hospital_management
   # For MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hospital_management

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d

   # PayPal Configuration (Sandbox)
   PAYPAL_MODE=sandbox
   PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret

   # WhatsApp Cloud API Configuration
   WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
   WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
   WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

## MongoDB Setup

### Option 1: Local MongoDB

1. **Install MongoDB:**
   - Windows: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - macOS: `brew install mongodb-community`
   - Linux: Follow [official installation guide](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. **Start MongoDB service:**
   ```bash
   # Windows (run as administrator)
   net start MongoDB

   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

3. **Verify connection:**
   ```bash
   mongosh
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add database user credentials
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get connection string and update `MONGO_URI` in `.env`

## PayPal Sandbox Setup

1. **Create PayPal Developer Account:**
   - Visit [PayPal Developer](https://developer.paypal.com/)
   - Sign up or log in

2. **Create Sandbox App:**
   - Go to "My Apps & Credentials"
   - Create a new app in Sandbox mode
   - Copy Client ID and Secret
   - Update `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` in `.env`

3. **Test Accounts:**
   - PayPal automatically creates test buyer and seller accounts
   - Use these for testing payments

## WhatsApp Cloud API Setup (Optional)

1. **Create Meta Business Account:**
   - Visit [Meta for Developers](https://developers.facebook.com/)
   - Create a new app with WhatsApp product

2. **Configure WhatsApp:**
   - Get Phone Number ID from WhatsApp Business API
   - Generate Access Token
   - Update credentials in `.env`

3. **Message Templates:**
   - Create approved message templates in Meta Business Suite
   - Update template names in `services/whatsappService.js` if needed

## Database Seeding

Seed the database with sample data (admin, doctors, patients, availability slots):

```bash
npm run seed
```

**Sample Credentials Created:**
- **Admin:** 
  - Email: admin@hospital.com
  - Password: Admin@123

- **Doctors:**
  - Dr. Smith (Cardiology): dr.smith@hospital.com / Doctor@123
  - Dr. Johnson (Pediatrics): dr.johnson@hospital.com / Doctor@123
  - Dr. Williams (Orthopedics): dr.williams@hospital.com / Doctor@123

- **Patients:**
  - John Doe: patient1@example.com / Patient@123
  - Jane Smith: patient2@example.com / Patient@123

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start at `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Routes (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "Password@123",
  "role": "patient"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password@123"
}
```

Response includes JWT token:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "email": "john@example.com",
      "role": "patient"
    }
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Patient Routes (`/api/patients`)
All routes require authentication and patient role.

#### Create/Update Patient Profile
```http
PUT /api/patients/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "bloodGroup": "A+",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "+1234567890"
  }
}
```

#### Search Doctors
```http
GET /api/patients/doctors?specialization=Cardiology&search=Smith
Authorization: Bearer {token}
```

#### Get Appointments
```http
GET /api/patients/appointments?status=confirmed&page=1&limit=10
Authorization: Bearer {token}
```

### Doctor Routes (`/api/doctors`)
All routes require authentication and doctor role.

#### Create/Update Doctor Profile
```http
PUT /api/doctors/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "specialization": "Cardiology",
  "experience": 10,
  "licenseNumber": "MD12345",
  "department": "Cardiology Department",
  "consultationFee": 150,
  "biography": "Experienced cardiologist..."
}
```

#### Create Availability
```http
POST /api/doctors/availability
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2024-01-20",
  "dayOfWeek": "Monday",
  "isRecurring": true,
  "slots": [
    { "startTime": "09:00", "endTime": "10:00" },
    { "startTime": "10:00", "endTime": "11:00" }
  ]
}
```

#### Update Appointment Status
```http
PATCH /api/doctors/appointments/:appointmentId/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "confirmed"
}
```

#### Add Consultation Notes
```http
POST /api/doctors/appointments/:appointmentId/notes
Authorization: Bearer {token}
Content-Type: application/json

{
  "consultationNotes": "Patient examined...",
  "diagnosis": "Hypertension",
  "prescription": [
    {
      "medication": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily",
      "duration": "30 days"
    }
  ]
}
```

### Appointment Routes (`/api/appointments`)

#### Create Appointment
```http
POST /api/appointments
Authorization: Bearer {token}
Content-Type: application/json

{
  "doctorId": "...",
  "availabilitySlotId": "...",
  "appointmentDate": "2024-01-20",
  "appointmentTime": {
    "startTime": "09:00",
    "endTime": "10:00"
  },
  "reasonForVisit": "Regular checkup",
  "symptoms": ["headache", "fatigue"]
}
```

#### Cancel Appointment
```http
DELETE /api/appointments/:id/cancel
Authorization: Bearer {token}
```

### Payment Routes (`/api/payments`)

#### Create Payment
```http
POST /api/payments/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "appointmentId": "..."
}
```

Response includes PayPal approval URL.

#### Execute Payment
```http
POST /api/payments/execute
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentId": "PAYID-...",
  "PayerID": "..."
}
```

### Admin Routes (`/api/admin`)
All routes require authentication and admin role.

#### Get System Statistics
```http
GET /api/admin/statistics
Authorization: Bearer {token}
```

#### Get All Users
```http
GET /api/admin/users?role=doctor&status=active
Authorization: Bearer {token}
```

#### Update Doctor Approval
```http
PATCH /api/admin/doctors/:id/approval
Authorization: Bearer {token}
Content-Type: application/json

{
  "isApproved": true
}
```

#### Get Analytics
```http
GET /api/admin/analytics
Authorization: Bearer {token}
```

### Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "stack": "... (only in development)"
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- **Password Hashing:** bcryptjs with salt rounds
- **JWT Authentication:** Secure token-based authentication
- **Role-based Authorization:** Middleware for role checking
- **Input Validation:** express-validator for all inputs
- **Rate Limiting:** Protection against brute force attacks
- **Helmet:** Security headers
- **CORS:** Configured for frontend origin
- **MongoDB Injection Prevention:** Mongoose sanitization

## Testing

### Manual Testing with Postman/Thunder Client

1. Import the API routes
2. Set environment variable for token
3. Test authentication flow
4. Test role-based endpoints

### Using Seed Data

Run seed script and use the created test accounts to test all flows.

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB status
mongosh

# Check connection string in .env
echo $MONGO_URI
```

### Port Already in Use

```bash
# Change PORT in .env or kill process
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### PayPal Payment Errors

- Verify sandbox mode is enabled
- Check client ID and secret
- Ensure return URLs are correct
- Review PayPal sandbox dashboard for logs

### WhatsApp API Errors

- Verify access token hasn't expired
- Check phone number ID is correct
- Ensure message templates are approved
- Review Meta dashboard for API logs

## Production Deployment

### Environment Configuration

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production MongoDB URI
4. Update `FRONTEND_URL` to production domain
5. Switch PayPal to live mode (update credentials)

### Security Checklist

- [ ] Change all default credentials
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable MongoDB authentication
- [ ] Regular security updates
- [ ] Backup strategy in place

### Recommended Hosting

- **API:** Heroku, AWS EC2, DigitalOcean, Railway
- **Database:** MongoDB Atlas
- **Process Manager:** PM2

## Support

For issues and questions:
- Check error logs in console
- Review MongoDB connection
- Verify environment variables
- Check API endpoint documentation

## License

MIT License - Feel free to use for personal and commercial projects.
