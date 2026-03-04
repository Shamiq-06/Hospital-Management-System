import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const roleHighlights = [
    {
      title: 'For Patients',
      icon: '👥',
      points: [
        'Search doctors by specialization and availability',
        'Book, reschedule, and cancel appointments online',
        'Track payments, receipts, and appointment status updates',
      ],
    },
    {
      title: 'For Doctors',
      icon: '👨‍⚕️',
      points: [
        'Manage profile, specialization, and consultation fee',
        'Create and manage daily/weekly availability slots',
        'Review appointments and update treatment notes',
      ],
    },
    {
      title: 'For Admins',
      icon: '⚙️',
      points: [
        'Oversee users, doctors, and system-level operations',
        'Review analytics for appointments and revenue',
        'Approve doctors and monitor platform activity',
      ],
    },
  ];

  const platformModules = [
    'Role-based authentication with protected routes',
    'Doctor search with specialization-based filtering',
    'Availability-driven appointment booking flow',
    'Payment flow with demo and real gateway support',
    'WhatsApp notification integration with demo routing',
    'Admin analytics for system monitoring and growth',
  ];

  const bookingFlow = [
    '1) Patient searches and selects a doctor',
    '2) Patient picks available date and time slot',
    '3) Appointment is created and payment is completed',
    '4) Confirmation and status updates are sent automatically',
  ];

  const trustFeatures = [
    'JWT authentication and role-based access control',
    'Input validation and centralized error handling',
    'Appointment slot locking to prevent double-booking',
    'Notification and payment records stored for auditability',
  ];

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
        <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: 'var(--clay-accent)' }}>
          Welcome to Hospital Management System
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--clay-muted)', marginBottom: '40px' }}>
          A complete digital workflow for patients, doctors, and administrators — from discovery and
          booking to payments, notifications, and analytics.
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
          {roleHighlights.map((role) => (
            <div key={role.title} className="card" style={{ textAlign: 'left' }}>
              <h3 style={{ color: 'var(--clay-accent)', marginBottom: '10px' }}>
                {role.icon} {role.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {role.points.map((point) => (
                  <p key={point} style={{ color: 'var(--clay-muted)' }}>• {point}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="card card-lg"
          style={{
            marginTop: '40px',
            background:
              'radial-gradient(120% 140% at 10% 10%, rgba(255,255,255,0.45), transparent 35%), linear-gradient(135deg, var(--clay-accent) 0%, var(--clay-accent-2) 120%)',
            color: 'white',
          }}
        >
          <h2 style={{ marginBottom: '15px' }}>Key Features</h2>
          <div className="grid grid-2" style={{ textAlign: 'left' }}>
            <div>
              <p>✅ Role-based authentication (Patient, Doctor, Admin)</p>
              <p>✅ Online appointment booking, rescheduling, and cancellation</p>
              <p>✅ Doctor discovery by specialization and profile details</p>
              <p>✅ Availability-based slot management and booking locks</p>
            </div>
            <div>
              <p>✅ Payment flow with demo and gateway-ready integration</p>
              <p>✅ WhatsApp notifications with demo recipient routing</p>
              <p>✅ Doctor and patient profile management</p>
              <p>✅ Admin dashboard with analytics and revenue insights</p>
            </div>
          </div>
        </div>

        <div className="grid grid-2" style={{ marginTop: '30px' }}>
          <div className="card" style={{ textAlign: 'left' }}>
            <h3 className="card-header">Platform Modules</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {platformModules.map((item) => (
                <p key={item} style={{ color: 'var(--clay-muted)' }}>• {item}</p>
              ))}
            </div>
          </div>

          <div className="card" style={{ textAlign: 'left' }}>
            <h3 className="card-header">Booking Journey</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {bookingFlow.map((step) => (
                <p key={step} style={{ color: 'var(--clay-muted)' }}>{step}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '30px', textAlign: 'left' }}>
          <h3 className="card-header">Security & Reliability</h3>
          <div className="grid grid-2">
            {trustFeatures.map((item) => (
              <p key={item} style={{ color: 'var(--clay-muted)' }}>🔐 {item}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
