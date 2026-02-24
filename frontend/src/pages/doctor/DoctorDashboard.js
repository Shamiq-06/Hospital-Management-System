import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doctorAPI } from '../../utils/api';

const DoctorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, appointmentsResponse] = await Promise.all([
        doctorAPI.getStatistics(),
        doctorAPI.getAppointments({ limit: 5 }),
      ]);

      setStats(statsResponse.data.data);
      setAppointments(appointmentsResponse.data.data.appointments);
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
      <h1 style={{ marginBottom: '30px' }}>Doctor Dashboard</h1>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalAppointments}</div>
            <div className="stat-label">Total Appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.todayAppointments}</div>
            <div className="stat-label">Today's Appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.pendingAppointments}</div>
            <div className="stat-label">Pending Approvals</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completedAppointments}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <h3 className="card-header">Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/doctor/appointments">
              <button className="btn btn-primary" style={{ width: '100%' }}>
                📅 View All Appointments
              </button>
            </Link>
            <Link to="/doctor/availability">
              <button className="btn btn-secondary" style={{ width: '100%' }}>
                🕐 Manage Availability
              </button>
            </Link>
            <Link to="/doctor/profile">
              <button className="btn btn-secondary" style={{ width: '100%' }}>
                👤 Update Profile
              </button>
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">Recent Appointments</h3>
          {appointments.length === 0 ? (
            <p style={{ color: '#666' }}>No appointments scheduled.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {appointments.map((appointment) => (
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
                      {appointment.patient?.firstName} {appointment.patient?.lastName}
                    </strong>
                    <span className={getStatusBadge(appointment.status)}>{appointment.status}</span>
                  </div>
                  <div style={{ color: '#666' }}>
                    {new Date(appointment.appointmentDate).toLocaleDateString()} at{' '}
                    {appointment.appointmentTime.startTime}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.85rem' }}>{appointment.reasonForVisit}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
