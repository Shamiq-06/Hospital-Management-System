import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'patient':
        return '/patient/dashboard';
      case 'doctor':
        return '/doctor/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <div className="container">
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#667eea' }}>
          Welcome to Hospital Management System
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '40px' }}>
          Modern healthcare management for patients, doctors, and administrators
        </p>

        {isAuthenticated ? (
          <Link to={getDashboardLink()}>
            <button className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '15px 40px' }}>
              Go to Dashboard
            </button>
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/login">
              <button className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '15px 40px' }}>
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '15px 40px' }}>
                Register
              </button>
            </Link>
          </div>
        )}

        <div className="grid grid-3" style={{ marginTop: '60px' }}>
          <div className="card">
            <h3 style={{ color: '#667eea', marginBottom: '10px' }}>👥 For Patients</h3>
            <p>Search doctors, book appointments, manage health records, and make secure online payments.</p>
          </div>
          <div className="card">
            <h3 style={{ color: '#667eea', marginBottom: '10px' }}>👨‍⚕️ For Doctors</h3>
            <p>Manage appointments, set availability, add consultation notes, and track patient records.</p>
          </div>
          <div className="card">
            <h3 style={{ color: '#667eea', marginBottom: '10px' }}>⚙️ For Admins</h3>
            <p>Oversee system operations, manage users, view analytics, and ensure smooth operations.</p>
          </div>
        </div>

        <div className="card" style={{ marginTop: '40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h2 style={{ marginBottom: '15px' }}>Key Features</h2>
          <div className="grid grid-2" style={{ textAlign: 'left' }}>
            <div>
              <p>✅ Role-based authentication (Patient, Doctor, Admin)</p>
              <p>✅ Online appointment booking & management</p>
              <p>✅ Doctor search by specialization</p>
              <p>✅ Appointment rescheduling & cancellation</p>
            </div>
            <div>
              <p>✅ PayPal payment integration</p>
              <p>✅ WhatsApp notifications for updates</p>
              <p>✅ Real-time availability management</p>
              <p>✅ Comprehensive admin analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
