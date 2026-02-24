import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';
import SearchDoctors from './pages/patient/SearchDoctors';
import BookAppointment from './pages/patient/BookAppointment';
import PatientAppointments from './pages/patient/PatientAppointments';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorProfile from './pages/doctor/DoctorProfile';
import ManageAvailability from './pages/doctor/ManageAvailability';
import DoctorAppointments from './pages/doctor/DoctorAppointments';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageAppointments from './pages/admin/ManageAppointments';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Patient Routes */}
            <Route
              path="/patient/dashboard"
              element={
                <PrivateRoute role="patient">
                  <PatientDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/profile"
              element={
                <PrivateRoute role="patient">
                  <PatientProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/search-doctors"
              element={
                <PrivateRoute role="patient">
                  <SearchDoctors />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/book-appointment/:doctorId"
              element={
                <PrivateRoute role="patient">
                  <BookAppointment />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/appointments"
              element={
                <PrivateRoute role="patient">
                  <PatientAppointments />
                </PrivateRoute>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="/doctor/dashboard"
              element={
                <PrivateRoute role="doctor">
                  <DoctorDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor/profile"
              element={
                <PrivateRoute role="doctor">
                  <DoctorProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor/availability"
              element={
                <PrivateRoute role="doctor">
                  <ManageAvailability />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor/appointments"
              element={
                <PrivateRoute role="doctor">
                  <DoctorAppointments />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute role="admin">
                  <ManageUsers />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/doctors"
              element={
                <PrivateRoute role="admin">
                  <ManageDoctors />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <PrivateRoute role="admin">
                  <ManageAppointments />
                </PrivateRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
