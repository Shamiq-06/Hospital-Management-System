import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ specialization: '', isApproved: '' });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDoctors();
  }, [filter]);

  const fetchDoctors = async () => {
    try {
      const response = await adminAPI.getAllDoctors(filter);
      setDoctors(response.data.data.doctors);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setLoading(false);
    }
  };

  const handleApprovalChange = async (doctorId, isApproved) => {
    try {
      await adminAPI.updateDoctorApproval(doctorId, { isApproved });
      setMessage({
        type: 'success',
        text: `Doctor ${isApproved ? 'approved' : 'rejected'} successfully!`,
      });
      fetchDoctors();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update doctor approval',
      });
    }
  };

  const viewDoctorDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailsModal(true);
  };

  const specializations = [
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Surgery',
    'Gynecology',
    'Ophthalmology',
    'ENT',
    'Dentistry',
    'Urology',
    'Gastroenterology',
  ];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>Manage Doctors</h1>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-header">Filter Doctors</h3>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Specialization</label>
            <select
              className="form-select"
              value={filter.specialization}
              onChange={(e) => setFilter({ ...filter, specialization: e.target.value })}
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Approval Status</label>
            <select
              className="form-select"
              value={filter.isApproved}
              onChange={(e) => setFilter({ ...filter, isApproved: e.target.value })}
            >
              <option value="">All</option>
              <option value="true">Approved</option>
              <option value="false">Pending Approval</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-header">Doctors ({doctors.length})</h3>
        {doctors.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center' }}>No doctors found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                style={{
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>
                      Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                    </h3>
                    <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                      📧 {doctor.user?.email} | 📱 {doctor.user?.phone}
                    </p>
                  </div>
                  <span className={`badge ${doctor.isApproved ? 'badge-success' : 'badge-warning'}`}>
                    {doctor.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>

                <div className="grid grid-2" style={{ marginBottom: '15px' }}>
                  <div>
                    <strong>Specialization:</strong> {doctor.specialization}
                  </div>
                  <div>
                    <strong>Experience:</strong> {doctor.experience} years
                  </div>
                  <div>
                    <strong>License Number:</strong> {doctor.licenseNumber}
                  </div>
                  <div>
                    <strong>Department:</strong> {doctor.department}
                  </div>
                  <div>
                    <strong>Consultation Fee:</strong> ${doctor.consultationFee}
                  </div>
                  <div>
                    <strong>Rating:</strong> ⭐ {doctor.rating?.toFixed(1) || 'N/A'}
                  </div>
                </div>

                {doctor.biography && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Biography:</strong>
                    <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                      {doctor.biography.length > 150
                        ? `${doctor.biography.substring(0, 150)}...`
                        : doctor.biography}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => viewDoctorDetails(doctor)}
                    style={{ padding: '8px 20px' }}
                  >
                    View Details
                  </button>
                  {!doctor.isApproved ? (
                    <button
                      className="btn btn-success"
                      onClick={() => handleApprovalChange(doctor._id, true)}
                      style={{ padding: '8px 20px' }}
                    >
                      ✓ Approve
                    </button>
                  ) : (
                    <button
                      className="btn btn-warning"
                      onClick={() => handleApprovalChange(doctor._id, false)}
                      style={{ padding: '8px 20px' }}
                    >
                      ✗ Revoke Approval
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDetailsModal && selectedDoctor && (
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
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '20px' }}>
              Dr. {selectedDoctor.user?.firstName} {selectedDoctor.user?.lastName}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <strong>Email:</strong> {selectedDoctor.user?.email}
              </div>
              <div>
                <strong>Phone:</strong> {selectedDoctor.user?.phone}
              </div>
              <div>
                <strong>Specialization:</strong> {selectedDoctor.specialization}
              </div>
              <div>
                <strong>Experience:</strong> {selectedDoctor.experience} years
              </div>
              <div>
                <strong>License Number:</strong> {selectedDoctor.licenseNumber}
              </div>
              <div>
                <strong>Department:</strong> {selectedDoctor.department}
              </div>
              <div>
                <strong>Consultation Fee:</strong> ${selectedDoctor.consultationFee}
              </div>
              <div>
                <strong>Rating:</strong> ⭐ {selectedDoctor.rating?.toFixed(1) || 'N/A'} ({selectedDoctor.totalRatings} ratings)
              </div>
              <div>
                <strong>Total Consultations:</strong> {selectedDoctor.totalConsultations}
              </div>
              {selectedDoctor.biography && (
                <div>
                  <strong>Biography:</strong>
                  <p style={{ margin: '5px 0 0 0', color: '#666' }}>{selectedDoctor.biography}</p>
                </div>
              )}
              <div>
                <strong>Status:</strong>{' '}
                <span className={`badge ${selectedDoctor.isApproved ? 'badge-success' : 'badge-warning'}`}>
                  {selectedDoctor.isApproved ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
              <div>
                <strong>Account Created:</strong> {new Date(selectedDoctor.createdAt).toLocaleString()}
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

export default ManageDoctors;
