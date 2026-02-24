import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'patient':
        return '/patient/dashboard';
      case 'doctor':
        return '/doctor/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/">
          <h1>🏥 Hospital Management System</h1>
        </Link>
        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()}>Dashboard</Link>
              {user.role === 'patient' && (
                <>
                  <Link to="/patient/search-doctors">Find Doctors</Link>
                  <Link to="/patient/appointments">My Appointments</Link>
                  <Link to="/patient/profile">Profile</Link>
                </>
              )}
              {user.role === 'doctor' && (
                <>
                  <Link to="/doctor/appointments">Appointments</Link>
                  <Link to="/doctor/availability">Availability</Link>
                  <Link to="/doctor/profile">Profile</Link>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/users">Users</Link>
                  <Link to="/admin/doctors">Doctors</Link>
                  <Link to="/admin/appointments">Appointments</Link>
                </>
              )}
              <span>Welcome, {user.firstName}!</span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
