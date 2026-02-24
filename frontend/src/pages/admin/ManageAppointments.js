import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', sortBy: 'createdAt', order: 'desc' });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    fetchAppointments();
  }, [filter, pagination.page]);

  const fetchAppointments = async () => {
    try {
      const response = await adminAPI.getAllAppointments({
        ...filter,
        page: pagination.page,
        limit: pagination.limit,
      });
      setAppointments(response.data.data.appointments);
      setPagination({
        ...pagination,
        total: response.data.data.total,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const viewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
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

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>Manage Appointments</h1>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-header">Filter Appointments</h3>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Sort By</label>
            <select
              className="form-select"
              value={filter.sortBy}
              onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
            >
              <option value="createdAt">Creation Date</option>
              <option value="appointmentDate">Appointment Date</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="card-header" style={{ marginBottom: '0' }}>
            Appointments ({pagination.total})
          </h3>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Page {pagination.page} of {totalPages}
          </div>
        </div>

        {appointments.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center' }}>No appointments found.</p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  style={{
                    padding: '15px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>
                        Patient: {appointment.patient?.firstName} {appointment.patient?.lastName}
                      </h4>
                      <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                        Doctor: Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                      </p>
                    </div>
                    <span className={getStatusBadge(appointment.status)}>{appointment.status}</span>
                  </div>

                  <div className="grid grid-2" style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
                    <div>
                      <strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Time:</strong> {appointment.appointmentTime.startTime} -{' '}
                      {appointment.appointmentTime.endTime}
                    </div>
                    <div>
                      <strong>Specialization:</strong> {appointment.doctorProfile?.specialization}
                    </div>
                    <div>
                      <strong>Payment:</strong>{' '}
                      <span className={`badge ${appointment.isPaid ? 'badge-success' : 'badge-warning'}`}>
                        {appointment.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </div>

                  {appointment.reasonForVisit && (
                    <div style={{ marginBottom: '10px', fontSize: '0.9rem' }}>
                      <strong>Reason:</strong> {appointment.reasonForVisit}
                    </div>
                  )}

                  <button
                    className="btn btn-primary"
                    onClick={() => viewAppointmentDetails(appointment)}
                    style={{ padding: '5px 15px', fontSize: '0.85rem' }}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  style={{ padding: '8px 15px' }}
                >
                  Previous
                </button>
                <span style={{ padding: '8px 15px', display: 'flex', alignItems: 'center' }}>
                  Page {pagination.page} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === totalPages}
                  style={{ padding: '8px 15px' }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showDetailsModal && selectedAppointment && (
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
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '20px' }}>Appointment Details</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="card">
                <h4 style={{ marginBottom: '10px' }}>Patient Information</h4>
                <div>
                  <strong>Name:</strong> {selectedAppointment.patient?.firstName}{' '}
                  {selectedAppointment.patient?.lastName}
                </div>
                <div>
                  <strong>Email:</strong> {selectedAppointment.patient?.email}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedAppointment.patient?.phone}
                </div>
              </div>

              <div className="card">
                <h4 style={{ marginBottom: '10px' }}>Doctor Information</h4>
                <div>
                  <strong>Name:</strong> Dr. {selectedAppointment.doctor?.firstName}{' '}
                  {selectedAppointment.doctor?.lastName}
                </div>
                <div>
                  <strong>Specialization:</strong> {selectedAppointment.doctorProfile?.specialization}
                </div>
                <div>
                  <strong>Consultation Fee:</strong> ${selectedAppointment.doctorProfile?.consultationFee}
                </div>
              </div>

              <div className="card">
                <h4 style={{ marginBottom: '10px' }}>Appointment Details</h4>
                <div>
                  <strong>Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Time:</strong> {selectedAppointment.appointmentTime.startTime} -{' '}
                  {selectedAppointment.appointmentTime.endTime}
                </div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span className={getStatusBadge(selectedAppointment.status)}>{selectedAppointment.status}</span>
                </div>
                <div>
                  <strong>Payment Status:</strong>{' '}
                  <span className={`badge ${selectedAppointment.isPaid ? 'badge-success' : 'badge-warning'}`}>
                    {selectedAppointment.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                {selectedAppointment.reasonForVisit && (
                  <div>
                    <strong>Reason for Visit:</strong> {selectedAppointment.reasonForVisit}
                  </div>
                )}
                {selectedAppointment.symptoms && selectedAppointment.symptoms.length > 0 && (
                  <div>
                    <strong>Symptoms:</strong>
                    <div style={{ marginTop: '5px' }}>
                      {selectedAppointment.symptoms.map((symptom, index) => (
                        <span key={index} className="badge badge-info" style={{ marginRight: '5px' }}>
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedAppointment.consultationNotes && (
                <div className="card" style={{ background: '#f0f8ff' }}>
                  <h4 style={{ marginBottom: '10px' }}>Consultation Notes</h4>
                  <p>{selectedAppointment.consultationNotes}</p>
                </div>
              )}

              {selectedAppointment.diagnosis && (
                <div className="card" style={{ background: '#f0fff4' }}>
                  <h4 style={{ marginBottom: '10px' }}>Diagnosis</h4>
                  <p>{selectedAppointment.diagnosis}</p>
                </div>
              )}

              {selectedAppointment.prescription && selectedAppointment.prescription.length > 0 && (
                <div className="card" style={{ background: '#f0f4ff' }}>
                  <h4 style={{ marginBottom: '10px' }}>Prescription</h4>
                  {selectedAppointment.prescription.map((med, index) => (
                    <div key={index} style={{ marginBottom: '10px', paddingLeft: '10px' }}>
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

              <div className="card">
                <h4 style={{ marginBottom: '10px' }}>Additional Information</h4>
                <div>
                  <strong>Created:</strong> {new Date(selectedAppointment.createdAt).toLocaleString()}
                </div>
                <div>
                  <strong>Last Updated:</strong> {new Date(selectedAppointment.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setShowDetailsModal(false)}
              style={{ marginTop: '20px', width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAppointments;
