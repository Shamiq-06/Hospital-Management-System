import React, { useState, useEffect } from 'react';
import { patientAPI, appointmentAPI } from '../../utils/api';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = filter ? { status: filter } : {};
      const response = await patientAPI.getAppointments(params);
      setAppointments(response.data.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentAPI.cancelAppointment(appointmentId, {
        cancellationReason: 'Cancelled by patient',
      });
      setMessage({ type: 'success', text: 'Appointment cancelled successfully' });
      fetchAppointments();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to cancel appointment',
      });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      confirmed: 'badge-success',
      completed: 'badge-info',
      cancelled: 'badge-danger',
      rejected: 'badge-danger',
      rescheduled: 'badge-warning',
    };
    return `badge ${badges[status] || 'badge-secondary'}`;
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>My Appointments</h1>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="card-header" style={{ marginBottom: 0 }}>
            Filter by Status
          </h3>
          <select className="form-select" style={{ width: '200px' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666' }}>No appointments found.</p>
        </div>
      ) : (
        <div className="grid">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h3 style={{ marginBottom: '5px' }}>
                  Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                </h3>
                <span className={getStatusBadge(appointment.status)}>{appointment.status}</span>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p style={{ color: '#667eea', fontWeight: '500', marginBottom: '10px' }}>
                  {appointment.doctorProfile?.specialization}
                </p>
                <p style={{ color: '#666', marginBottom: '5px' }}>
                  📅 Date: {new Date(appointment.appointmentDate).toLocaleDateString()}
                </p>
                <p style={{ color: '#666', marginBottom: '5px' }}>
                  🕐 Time: {appointment.appointmentTime.startTime} - {appointment.appointmentTime.endTime}
                </p>
                <p style={{ color: '#666', marginBottom: '5px' }}>
                  📝 Reason: {appointment.reasonForVisit}
                </p>
                {appointment.isPaid && (
                  <p style={{ color: '#28a745', fontWeight: '500', marginTop: '10px' }}>
                    ✅ Paid: ${appointment.doctorProfile?.consultationFee}
                  </p>
                )}
              </div>

              {appointment.consultationNotes && (
                <div
                  style={{
                    padding: '10px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    marginBottom: '15px',
                  }}
                >
                  <strong>Consultation Notes:</strong>
                  <p style={{ marginTop: '5px' }}>{appointment.consultationNotes}</p>
                </div>
              )}

              {appointment.diagnosis && (
                <div
                  style={{
                    padding: '10px',
                    background: '#d4edda',
                    borderRadius: '6px',
                    marginBottom: '15px',
                  }}
                >
                  <strong>Diagnosis:</strong>
                  <p style={{ marginTop: '5px' }}>{appointment.diagnosis}</p>
                </div>
              )}

              {appointment.prescription && appointment.prescription.length > 0 && (
                <div
                  style={{
                    padding: '10px',
                    background: '#d1ecf1',
                    borderRadius: '6px',
                    marginBottom: '15px',
                  }}
                >
                  <strong>Prescription:</strong>
                  {appointment.prescription.map((med, index) => (
                    <div key={index} style={{ marginTop: '5px' }}>
                      <p>
                        <strong>{med.medication}</strong> - {med.dosage}
                      </p>
                      <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        {med.frequency} for {med.duration}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleCancelAppointment(appointment._id)}
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
