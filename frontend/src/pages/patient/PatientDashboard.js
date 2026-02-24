import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { patientAPI, appointmentAPI } from '../../utils/api';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await patientAPI.getAppointments({ limit: 5 });
      const appointmentsData = response.data.data.appointments;
      setAppointments(appointmentsData);

      // Calculate stats
      const upcoming = appointmentsData.filter(
        (apt) => apt.status === 'pending' || apt.status === 'confirmed'
      ).length;
      const completed = appointmentsData.filter((apt) => apt.status === 'completed').length;
      const cancelled = appointmentsData.filter((apt) => apt.status === 'cancelled').length;

      setStats({ upcoming, completed, cancelled });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      confirmed: 'badge-success',
      completed: 'badge-info',
      cancelled: 'badge-danger',
      rejected: 'badge-danger',
    };
    return `badge ${badges[status] || 'badge-secondary'}`;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>Patient Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.upcoming}</div>
          <div className="stat-label">Upcoming Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.cancelled}</div>
          <div className="stat-label">Cancelled</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="card-header">Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/patient/search-doctors">
              <button className="btn btn-primary" style={{ width: '100%' }}>
                🔍 Find Doctors
              </button>
            </Link>
            <Link to="/patient/appointments">
              <button className="btn btn-secondary" style={{ width: '100%' }}>
                📅 View All Appointments
              </button>
            </Link>
            <Link to="/patient/profile">
              <button className="btn btn-secondary" style={{ width: '100%' }}>
                👤 Update Profile
              </button>
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">Recent Appointments</h3>
          {appointments.length === 0 ? (
            <p style={{ color: '#666' }}>No appointments yet. Book your first appointment!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {appointments.slice(0, 5).map((appointment) => (
                <div
                  key={appointment._id}
                  style={{
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong>
                      Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                    </strong>
                    <span className={getStatusBadge(appointment.status)}>{appointment.status}</span>
                  </div>
                  <div style={{ color: '#666' }}>
                    {new Date(appointment.appointmentDate).toLocaleDateString()} at{' '}
                    {appointment.appointmentTime.startTime}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.85rem' }}>
                    {appointment.doctorProfile?.specialization}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
