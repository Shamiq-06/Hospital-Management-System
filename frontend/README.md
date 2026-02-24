# Hospital Management System - Frontend

A modern, responsive React application for managing hospital operations including patient appointments, doctor consultations, and administrative tasks.

## Features

### For Patients
- **User Registration & Login** - Secure authentication with JWT
- **Profile Management** - Complete patient information including medical history
- **Doctor Search** - Find doctors by specialization and name
- **Appointment Booking** - Book appointments with real-time availability
- **Online Payments** - Pay consultation fees via PayPal
- **Appointment History** - View, track, and cancel appointments
- **Consultation Records** - Access consultation notes, diagnosis, and prescriptions

### For Doctors
- **Professional Profile** - Manage qualifications, experience, and fees
- **Availability Management** - Set recurring or one-time availability slots
- **Appointment Dashboard** - View and manage appointment requests
- **Consultation Management** - Add notes, diagnosis, and prescriptions
- **Statistics** - Track consultations and appointment metrics

### For Admins
- **System Dashboard** - Overview of all system activities
- **User Management** - Manage patients, doctors, and staff
- **Doctor Approval** - Approve or reject doctor registrations
- **Analytics** - View revenue, appointments, and performance metrics
- **Comprehensive Reports** - Detailed system insights

## Tech Stack

- **Framework:** React 18.2.0
- **Routing:** React Router DOM 6.20.0
- **HTTP Client:** Axios 1.6.0
- **Styling:** Custom CSS with responsive design
- **State Management:** React Context API
- **Build Tool:** Create React App

## Project Structure

```
frontend/
├── public/
│   └── index.html           # HTML template
├── src/
│   ├── components/
│   │   ├── Navbar.js        # Navigation bar with role-based links
│   │   └── PrivateRoute.js  # Protected route wrapper
│   ├── context/
│   │   └── AuthContext.js   # Authentication context provider
│   ├── pages/
│   │   ├── Home.js          # Landing page
│   │   ├── Login.js         # Login page
│   │   ├── Register.js      # Registration page
│   │   ├── patient/
│   │   │   ├── PatientDashboard.js
│   │   │   ├── PatientProfile.js
│   │   │   ├── SearchDoctors.js
│   │   │   ├── BookAppointment.js
│   │   │   └── PatientAppointments.js
│   │   ├── doctor/
│   │   │   ├── DoctorDashboard.js
│   │   │   ├── DoctorProfile.js
│   │   │   ├── ManageAvailability.js
│   │   │   └── DoctorAppointments.js
│   │   └── admin/
│   │       ├── AdminDashboard.js
│   │       ├── ManageUsers.js
│   │       ├── ManageDoctors.js
│   │       └── ManageAppointments.js
│   ├── utils/
│   │   └── api.js           # API client with all endpoints
│   ├── App.js               # Main app component with routing
│   ├── index.js             # React entry point
│   └── index.css            # Global styles
└── package.json
```

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Backend API** running on `http://localhost:5000`

## Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API endpoint (if different):**
   
   Open `src/utils/api.js` and update the baseURL if needed:
   ```javascript
   const api = axios.create({
     baseURL: 'http://localhost:5000/api', // Update if backend is on different URL
   });
   ```

## Running the Application

### Development Mode

```bash
npm start
```

The application will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Serve Production Build Locally

```bash
npm install -g serve
serve -s build
```

## Demo Credentials

After running the backend seed script, you can use these credentials:

### Admin Account
- **Email:** admin@hospital.com
- **Password:** Admin@123

### Doctor Accounts
- **Dr. Smith (Cardiology)**
  - Email: dr.smith@hospital.com
  - Password: Doctor@123

- **Dr. Johnson (Pediatrics)**
  - Email: dr.johnson@hospital.com
  - Password: Doctor@123

- **Dr. Williams (Orthopedics)**
  - Email: dr.williams@hospital.com
  - Password: Doctor@123

### Patient Accounts
- **John Doe**
  - Email: patient1@example.com
  - Password: Patient@123

- **Jane Smith**
  - Email: patient2@example.com
  - Password: Patient@123

## User Workflows

### Patient Workflow

1. **Registration**
   - Navigate to register page
   - Select "Patient" role
   - Fill in personal details
   - Submit registration

2. **Profile Setup**
   - Login with credentials
   - Navigate to Profile
   - Complete medical information
   - Add emergency contact

3. **Book Appointment**
   - Go to "Find Doctors"
   - Filter by specialization
   - Click "Book Appointment"
   - Select date and time slot
   - Enter symptoms and reason
   - Proceed to payment
   - Complete PayPal checkout

4. **Manage Appointments**
   - View appointment history
   - Check consultation notes
   - View prescriptions
   - Cancel appointments if needed

### Doctor Workflow

1. **Registration & Approval**
   - Register as a doctor
   - Complete professional profile
   - Wait for admin approval

2. **Set Availability**
   - Navigate to "Manage Availability"
   - Create availability slots
   - Set recurring schedules

3. **Handle Appointments**
   - View appointment requests
   - Confirm or reject bookings
   - Add consultation notes
   - Write prescriptions

4. **Dashboard Monitoring**
   - Check appointment statistics
   - View today's schedule
   - Track completed consultations

### Admin Workflow

1. **System Monitoring**
   - View dashboard statistics
   - Check system analytics
   - Monitor revenue

2. **Doctor Management**
   - Review doctor registrations
   - Approve/reject doctors
   - View doctor details

3. **User Management**
   - View all users
   - Activate/deactivate accounts
   - Delete users if needed

4. **Appointment Oversight**
   - View all appointments
   - Filter by status
   - Access full details

## Features Guide

### Authentication

- **JWT Token Storage:** Tokens stored in localStorage
- **Auto-logout:** Invalid tokens trigger automatic logout
- **Protected Routes:** Role-based route protection
- **Persistent Login:** User stays logged in across sessions

### Responsive Design

- **Mobile-friendly:** Optimized for all screen sizes
- **Touch-friendly:** Large clickable areas
- **Grid Layouts:** Responsive grid system
- **Modern UI:** Clean, professional interface

### Real-time Updates

- **Appointment Status:** Live status updates
- **Payment Confirmation:** Instant payment feedback
- **Error Handling:** User-friendly error messages
- **Loading States:** Visual feedback for async operations

### Payment Integration

- **PayPal Sandbox:** Test payments without real money
- **Secure Checkout:** Redirect to PayPal for payment
- **Payment Verification:** Server-side verification
- **Receipt Generation:** Automatic payment receipts

## Component Documentation

### AuthContext

Provides authentication state and methods:
```javascript
const { user, login, logout, register, isAuthenticated, loading } = useAuth();
```

### PrivateRoute

Protects routes based on authentication and role:
```javascript
<PrivateRoute allowedRoles={['patient']}>
  <PatientDashboard />
</PrivateRoute>
```

### API Utility

Centralized API calls with interceptors:
```javascript
import { authAPI, patientAPI, doctorAPI, adminAPI } from '../utils/api';

// Example usage
const response = await patientAPI.searchDoctors({ specialization: 'Cardiology' });
```

## Styling

The application uses custom CSS with:
- **CSS Variables:** For consistent theming
- **Flexbox & Grid:** Modern layout techniques
- **Media Queries:** Responsive breakpoints
- **Animations:** Smooth transitions
- **Utility Classes:** Reusable style classes

### Key Style Classes

- `.container` - Main content wrapper
- `.card` - Card component with shadow
- `.btn` - Button styles (primary, secondary, success, danger)
- `.badge` - Status badges
- `.form-input` - Form input styling
- `.grid` - Responsive grid layouts
- `.stats-grid` - Statistics card grid

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Testing

### Manual Testing Checklist

#### Authentication
- [ ] Register as patient
- [ ] Register as doctor
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout functionality
- [ ] Protected route access

#### Patient Features
- [ ] Create/update profile
- [ ] Search doctors
- [ ] Book appointment
- [ ] Complete payment
- [ ] View appointments
- [ ] Cancel appointment

#### Doctor Features
- [ ] Create/update profile
- [ ] Create availability slots
- [ ] View appointments
- [ ] Confirm appointment
- [ ] Reject appointment
- [ ] Add consultation notes

#### Admin Features
- [ ] View dashboard statistics
- [ ] Approve doctor
- [ ] Manage users
- [ ] View all appointments

## Common Issues & Solutions

### API Connection Failed

**Problem:** Cannot connect to backend

**Solution:**
1. Verify backend is running on port 5000
2. Check API baseURL in `src/utils/api.js`
3. Check CORS configuration in backend

### Authentication Errors

**Problem:** Token invalid or expired

**Solution:**
1. Clear localStorage
2. Login again
3. Check JWT_SECRET matches between frontend and backend

### Payment Redirect Issues

**Problem:** PayPal redirect not working

**Solution:**
1. Verify PayPal credentials in backend
2. Check return URLs are correct
3. Ensure appointment was created successfully
4. Test with PayPal sandbox accounts

### Styling Issues

**Problem:** Styles not loading correctly

**Solution:**
1. Clear browser cache
2. Check `index.css` is imported in `index.js`
3. Verify CSS class names match

## Performance Optimization

- **Code Splitting:** React Router lazy loading
- **Memoization:** Use React.memo for expensive components
- **API Caching:** Consider implementing API response caching
- **Image Optimization:** Compress images before deployment
- **Bundle Size:** Regularly audit with `npm run build`

## Deployment

### Deployment Options

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

3. **GitHub Pages**
   ```bash
   npm install --save-dev gh-pages
   # Add to package.json: "homepage": "https://username.github.io/repo"
   npm run build
   npm run deploy
   ```

### Production Environment Variables

Create `.env.production`:
```env
REACT_APP_API_URL=https://your-backend-api.com/api
```

Update `src/utils/api.js`:
```javascript
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### Pre-deployment Checklist

- [ ] Update API baseURL for production
- [ ] Test all user workflows
- [ ] Verify payment integration
- [ ] Check responsive design
- [ ] Test on multiple browsers
- [ ] Optimize images and assets
- [ ] Run production build
- [ ] Configure environment variables
- [ ] Set up error tracking (e.g., Sentry)

## Folder Organization Best Practices

```
src/
├── components/         # Reusable components
├── pages/             # Page components organized by role
├── context/           # React Context providers
├── utils/             # Utility functions and API client
├── hooks/             # Custom React hooks (future)
├── assets/            # Images, fonts, etc. (future)
└── constants/         # Constants and configurations (future)
```

## Future Enhancements

- [ ] Add email notifications
- [ ] Implement video consultations
- [ ] Add prescription download (PDF)
- [ ] Medical record uploads
- [ ] Advanced search filters
- [ ] Calendar view for appointments
- [ ] Chat/messaging system
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Dark mode theme

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## Troubleshooting

### Build Failures

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Hot Reload Not Working

```bash
# Create .env.local file
echo "FAST_REFRESH=true" > .env.local
```

### Memory Issues During Build

```bash
# Increase Node memory
export NODE_OPTIONS=--max_old_space_size=4096
npm run build
```

## Support

For issues and questions:
- Check browser console for errors
- Verify backend API is running
- Review network tab in browser DevTools
- Check authentication token in localStorage

## License

MIT License - Feel free to use for personal and commercial projects.

---

**Happy Coding! 🏥💻**
