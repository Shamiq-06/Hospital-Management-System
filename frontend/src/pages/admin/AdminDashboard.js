import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, analyticsResponse] = await Promise.all([
        adminAPI.getSystemStatistics(),
        adminAPI.getAnalytics(),
      ]);

      setStats(statsResponse.data.data);
      setAnalytics(analyticsResponse.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
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
      <h1 style={{ marginBottom: '30px' }}>Admin Dashboard</h1>

      <h3 style={{ marginBottom: '15px' }}>System Overview</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalDoctors}</div>
          <div className="stat-label">Doctors</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalPatients}</div>
          <div className="stat-label">Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalAppointments}</div>
          <div className="stat-label">Appointments</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '30px' }}>
        <div className="card">
          <h3 className="card-header">Appointment Statistics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#fff3cd', borderRadius: '4px' }}>
              <span>Pending</span>
              <strong>{stats?.pendingAppointments}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#d4edda', borderRadius: '4px' }}>
              <span>Confirmed</span>
              <strong>{stats?.confirmedAppointments}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#cfe2ff', borderRadius: '4px' }}>
              <span>Completed</span>
              <strong>{stats?.completedAppointments}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8d7da', borderRadius: '4px' }}>
              <span>Cancelled</span>
              <strong>{stats?.cancelledAppointments}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">Revenue Overview</h3>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#28a745', marginBottom: '10px' }}>
              ${stats?.totalRevenue?.toFixed(2) || '0.00'}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Revenue Generated</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Completed Payments:</span>
              <strong>{stats?.completedPayments}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Pending Payments:</span>
              <strong>{stats?.pendingPayments}</strong>
            </div>
          </div>
        </div>
      </div>

      {analytics && analytics.appointmentsByStatus && (
        <div className="card" style={{ marginTop: '30px' }}>
          <h3 className="card-header">Appointments by Status</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            {analytics.appointmentsByStatus.map((item) => (
              <div
                key={item._id}
                style={{
                  padding: '15px',
                  background: '#f8f9fa',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {item.count}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666', textTransform: 'capitalize' }}>{item._id}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics && analytics.appointmentsBySpecialization && (
        <div className="card" style={{ marginTop: '30px' }}>
          <h3 className="card-header">Appointments by Specialization</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {analytics.appointmentsBySpecialization.map((item) => (
              <div
                key={item._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px',
                  background: '#f8f9fa',
                  borderRadius: '6px',
                }}
              >
                <span>{item._id || 'Not Specified'}</span>
                <strong>{item.count} appointments</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics && analytics.revenueByMonth && analytics.revenueByMonth.length > 0 && (
        <div className="card" style={{ marginTop: '30px' }}>
          <h3 className="card-header">Monthly Revenue</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {analytics.revenueByMonth.map((item) => (
              <div
                key={`${item._id.year}-${item._id.month}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px',
                  background: '#e7f4e7',
                  borderRadius: '6px',
                }}
              >
                <span>
                  {new Date(item._id.year, item._id.month - 1).toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <strong>${item.totalRevenue.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '30px' }}>
        <h3 className="card-header">User Status</h3>
        <div className="grid grid-2">
          <div style={{ padding: '15px', background: '#d4edda', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats?.activeUsers}</div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Active Users</div>
          </div>
          <div style={{ padding: '15px', background: '#f8d7da', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats?.inactiveUsers}</div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Inactive Users</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
