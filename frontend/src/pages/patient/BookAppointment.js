import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI, appointmentAPI, paymentAPI } from '../../utils/api';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    reasonForVisit: '',
    symptoms: [],
  });
  const [symptomInput, setSymptomInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDoctorDetails();
    fetchAvailability();
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await patientAPI.getDoctorDetails(doctorId);
      setDoctor(response.data.data.doctor);
    } catch (error) {
      console.error('Error fetching doctor details:', error);
    }
  };

  const fetchAvailability = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const response = await appointmentAPI.getDoctorAvailability(doctorId, {
        startDate: today,
        endDate: endDate.toISOString().split('T')[0],
      });
      setAvailability(response.data.data.availability);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setLoading(false);
    }
  };

  const handleAddSymptom = () => {
    if (symptomInput.trim()) {
      setFormData({
        ...formData,
        symptoms: [...formData.symptoms, symptomInput.trim()],
      });
      setSymptomInput('');
    }
  };

  const handleRemoveSymptom = (index) => {
    setFormData({
      ...formData,
      symptoms: formData.symptoms.filter((_, i) => i !== index),
    });
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      setMessage({ type: 'error', text: 'Please select a time slot' });
      return;
    }

    if (!formData.reasonForVisit.trim()) {
      setMessage({ type: 'error', text: 'Please provide reason for visit' });
      return;
    }

    setBooking(true);
    setMessage({ type: '', text: '' });

    try {
      // Create appointment
      const appointmentResponse = await appointmentAPI.createAppointment({
        doctor: doctorId,
        availabilitySlot: selectedDate,
        appointmentDate: availability.find((a) => a._id === selectedDate).date,
        appointmentTime: selectedSlot,
        reasonForVisit: formData.reasonForVisit,
        symptoms: formData.symptoms,
      });

      const appointmentId = appointmentResponse.data.data.appointment._id;

      // Initiate payment
      const paymentResponse = await paymentAPI.createPayment({ appointmentId });
      const pd = paymentResponse.data.data;

      // Demo portal mode (PayPal credentials not configured)
      if (pd.demoPortal) {
        navigate(
          `/payment/portal?paymentId=${pd.paymentRecordId}&amount=${pd.amount}` +
          `&doctor=${encodeURIComponent(pd.doctorName)}&spec=${encodeURIComponent(pd.specialization)}`
        );
        return;
      }

      // Redirect to real PayPal
      window.location.href = pd.approvalUrl;
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to book appointment',
      });
      setBooking(false);
    }
  };

  if (loading || !doctor) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const selectedAvailability = availability.find((a) => a._id === selectedDate);

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>Book Appointment</h1>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="grid grid-2">
        <div className="card">
          <h3 className="card-header">Doctor Information</h3>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '3rem',
              }}
            >
              👨‍⚕️
            </div>
            <div>
              <h2 style={{ marginBottom: '5px' }}>
                Dr. {doctor.user.firstName} {doctor.user.lastName}
              </h2>
              <p style={{ color: '#667eea', fontWeight: '500', marginBottom: '10px' }}>
                {doctor.specialization}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                📧 {doctor.user.email}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                📞 {doctor.user.phoneNumber}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <p style={{ marginBottom: '10px' }}>
              <strong>Experience:</strong> {doctor.experience} years
            </p>
            <p style={{ marginBottom: '10px' }}>
              <strong>Consultation Fee:</strong> ${doctor.consultationFee}
            </p>
            <p style={{ marginBottom: '10px' }}>
              <strong>Department:</strong> {doctor.department}
            </p>
            {doctor.biography && (
              <p style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
                {doctor.biography}
              </p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">Select Date & Time</h3>

          {availability.length === 0 ? (
            <p style={{ color: '#666' }}>No availability slots found for this doctor.</p>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Select Date</label>
                <select
                  className="form-select"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                >
                  <option value="">Choose a date</option>
                  {availability.map((slot) => (
                    <option key={slot._id} value={slot._id}>
                      {new Date(slot.date).toLocaleDateString()} - {slot.dayOfWeek}
                    </option>
                  ))}
                </select>
              </div>

              {selectedAvailability && (
                <div className="form-group">
                  <label className="form-label">Select Time Slot</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {selectedAvailability.slots
                      .filter((s) => !s.isBooked)
                      .map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`btn ${
                            selectedSlot?.startTime === slot.startTime ? 'btn-primary' : 'btn-secondary'
                          }`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                  </div>
                  {selectedAvailability.slots.every((s) => s.isBooked) && (
                    <p style={{ color: '#dc3545', marginTop: '10px' }}>
                      All slots are booked for this date.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="card-header">Appointment Details</h3>

        <div className="form-group">
          <label className="form-label">Reason for Visit</label>
          <textarea
            className="form-textarea"
            value={formData.reasonForVisit}
            onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
            placeholder="Please describe your symptoms or reason for consultation..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Symptoms (Optional)</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              className="form-input"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder="Add symptom"
            />
            <button type="button" className="btn btn-secondary" onClick={handleAddSymptom}>
              Add
            </button>
          </div>
          {formData.symptoms.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {formData.symptoms.map((symptom, index) => (
                <span
                  key={index}
                  style={{
                    padding: '5px 10px',
                    background: '#e2e3e5',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                  }}
                >
                  {symptom}
                  <button
                    type="button"
                    onClick={() => handleRemoveSymptom(index)}
                    style={{
                      marginLeft: '8px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          className="btn btn-primary"
          onClick={handleBookAppointment}
          disabled={booking || !selectedSlot || !formData.reasonForVisit.trim()}
        >
          {booking ? 'Processing...' : `Book & Pay $${doctor.consultationFee}`}
        </button>
      </div>
    </div>
  );
};

export default BookAppointment;
