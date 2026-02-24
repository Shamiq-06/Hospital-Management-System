import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../../utils/api';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescriptions, setPrescriptions] = useState([
    { medication: '', dosage: '', frequency: '', duration: '' },
  ]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await doctorAPI.getAppointments(params);
      setAppointments(response.data.data.appointments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await doctorAPI.updateAppointmentStatus(appointmentId, { status: newStatus });
      setMessage({ type: 'success', text: `Appointment ${newStatus} successfully!` });
      fetchAppointments();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update appointment',
      });
    }
  };

  const openNotesModal = (appointment) => {
    setSelectedAppointment(appointment);
    setConsultationNotes(appointment.consultationNotes || '');
    setDiagnosis(appointment.diagnosis || '');
    setPrescriptions(
      appointment.prescription?.length > 0
        ? appointment.prescription
        : [{ medication: '', dosage: '', frequency: '', duration: '' }]
    );
    setShowNotesModal(true);
  };

  const handlePrescriptionChange = (index, field, value) => {
    const newPrescriptions = [...prescriptions];
    newPrescriptions[index][field] = value;
    setPrescriptions(newPrescriptions);
  };

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { medication: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removePrescription = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleSubmitNotes = async (e) => {
    e.preventDefault();

    try {
      await doctorAPI.addConsultationNotes(selectedAppointment._id, {
        consultationNotes,
        diagnosis,
        prescription: prescriptions.filter((p) => p.medication),
      });
      setMessage({ type: 'success', text: 'Consultation notes added successfully!' });
      setShowNotesModal(false);
      fetchAppointments();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to add consultation notes',
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
      <h1 style={{ marginBottom: '30px' }}>My Appointments</h1>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div style={{ marginBottom: '20px' }}>
        <label className="form-label">Filter by Status:</label>
        <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Appointments</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {appointments.length === 0 ? (
        <div className="card">
          <p style={{ color: '#666', textAlign: 'center' }}>No appointments found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {appointments.map((appointment) => (
            <div key={appointment._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0' }}>
                    {appointment.patient?.firstName} {appointment.patient?.lastName}
                  </h3>
                  <p style={{ margin: '0', color: '#666' }}>📧 {appointment.patient?.email}</p>
                  <p style={{ margin: '0', color: '#666' }}>📱 {appointment.patient?.phone}</p>
                </div>
                <span className={getStatusBadge(appointment.status)}>{appointment.status}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Time:</strong> {appointment.appointmentTime.startTime} -{' '}
                  {appointment.appointmentTime.endTime}
                </div>
                <div>
                  <strong>Reason:</strong> {appointment.reasonForVisit}
                </div>
                {appointment.isPaid && (
                  <div>
                    <span className="badge badge-success">Paid</span>
                  </div>
                )}
              </div>

              {appointment.symptoms && appointment.symptoms.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>Symptoms:</strong>
                  <div style={{ marginTop: '5px' }}>
                    {appointment.symptoms.map((symptom, index) => (
                      <span key={index} className="badge badge-info" style={{ marginRight: '5px' }}>
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {appointment.consultationNotes && (
                <div
                  style={{
                    padding: '10px',
                    background: '#f0f8ff',
                    borderRadius: '6px',
                    marginBottom: '10px',
                  }}
                >
                  <strong>Consultation Notes:</strong>
                  <p style={{ margin: '5px 0 0 0' }}>{appointment.consultationNotes}</p>
                </div>
              )}

              {appointment.diagnosis && (
                <div
                  style={{
                    padding: '10px',
                    background: '#f0fff4',
                    borderRadius: '6px',
                    marginBottom: '10px',
                  }}
                >
                  <strong>Diagnosis:</strong>
                  <p style={{ margin: '5px 0 0 0' }}>{appointment.diagnosis}</p>
                </div>
              )}

              {appointment.prescription && appointment.prescription.length > 0 && (
                <div
                  style={{
                    padding: '10px',
                    background: '#f0f4ff',
                    borderRadius: '6px',
                    marginBottom: '10px',
                  }}
                >
                  <strong>Prescription:</strong>
                  {appointment.prescription.map((med, index) => (
                    <div key={index} style={{ marginTop: '8px', paddingLeft: '10px' }}>
                      <div>
                        <strong>{med.medication}</strong>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {med.dosage} - {med.frequency} - {med.duration}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                {appointment.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleUpdateStatus(appointment._id, 'confirmed')}
                    >
                      ✓ Confirm
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleUpdateStatus(appointment._id, 'rejected')}
                    >
                      ✗ Reject
                    </button>
                  </>
                )}
                {appointment.status === 'confirmed' && (
                  <button className="btn btn-success" onClick={() => openNotesModal(appointment)}>
                    📝 Add Consultation Notes
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showNotesModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <h3 style={{ marginBottom: '20px' }}>Add Consultation Notes</h3>
            <form onSubmit={handleSubmitNotes}>
              <div className="form-group">
                <label className="form-label">Consultation Notes</label>
                <textarea
                  className="form-textarea"
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  placeholder="Enter detailed consultation notes..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Diagnosis</label>
                <textarea
                  className="form-textarea"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis..."
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label className="form-label">Prescription</label>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addPrescription}
                    style={{ padding: '5px 15px' }}
                  >
                    + Add Medication
                  </button>
                </div>

                {prescriptions.map((prescription, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '15px',
                      background: '#f8f9fa',
                      borderRadius: '6px',
                      marginBottom: '10px',
                    }}
                  >
                    <div className="grid grid-2">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Medication name"
                        value={prescription.medication}
                        onChange={(e) => handlePrescriptionChange(index, 'medication', e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Dosage (e.g., 500mg)"
                        value={prescription.dosage}
                        onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Frequency (e.g., Twice daily)"
                        value={prescription.frequency}
                        onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Duration (e.g., 7 days)"
                        value={prescription.duration}
                        onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}
                        required
                      />
                    </div>
                    {prescriptions.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => removePrescription(index)}
                        style={{ marginTop: '10px', padding: '5px 15px' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">
                  Save & Mark Completed
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNotesModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
