import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../../utils/api';

const ManageAvailability = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    date: '',
    dayOfWeek: '',
    isRecurring: false,
    slots: [
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '10:00', endTime: '11:00' },
      { startTime: '11:00', endTime: '12:00' },
      { startTime: '14:00', endTime: '15:00' },
      { startTime: '15:00', endTime: '16:00' },
      { startTime: '16:00', endTime: '17:00' },
    ],
  });

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const fetchAvailabilities = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const endDate = nextMonth.toISOString().split('T')[0];

      const response = await doctorAPI.getAvailability({ startDate: today, endDate: endDate });
      setAvailabilities(response.data.data.availability);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...formData.slots];
    newSlots[index][field] = value;
    setFormData({ ...formData, slots: newSlots });
  };

  const addSlot = () => {
    setFormData({
      ...formData,
      slots: [...formData.slots, { startTime: '', endTime: '' }],
    });
  };

  const removeSlot = (index) => {
    const newSlots = formData.slots.filter((_, i) => i !== index);
    setFormData({ ...formData, slots: newSlots });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      await doctorAPI.createAvailability(formData);
      setMessage({ type: 'success', text: 'Availability created successfully!' });
      setShowForm(false);
      fetchAvailabilities();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create availability',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this availability?')) return;

    try {
      await doctorAPI.deleteAvailability(id);
      setMessage({ type: 'success', text: 'Availability deleted successfully!' });
      fetchAvailabilities();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete availability',
      });
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Manage Availability</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Availability'}
        </button>
      </div>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
          <div className="card">
            <h3 className="card-header">Create Availability</h3>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  name="date"
                  className="form-input"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Day of Week</label>
                <select
                  name="dayOfWeek"
                  className="form-select"
                  value={formData.dayOfWeek}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Day</option>
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleChange}
                />
                <span>Make this a recurring availability (repeats weekly)</span>
              </label>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label className="form-label">Time Slots</label>
                <button type="button" className="btn btn-secondary" onClick={addSlot} style={{ padding: '5px 15px' }}>
                  + Add Slot
                </button>
              </div>

              {formData.slots.map((slot, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="time"
                    className="form-input"
                    value={slot.startTime}
                    onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                    required
                  />
                  <input
                    type="time"
                    className="form-input"
                    value={slot.endTime}
                    onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeSlot(index)}
                    style={{ padding: '8px 15px' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button type="submit" className="btn btn-primary">
              Create Availability
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <h3 className="card-header">Your Availabilities</h3>
        {availabilities.length === 0 ? (
          <p style={{ color: '#666' }}>No availabilities found. Create one to start accepting appointments.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {availabilities.map((availability) => (
              <div
                key={availability._id}
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
                      {new Date(availability.date).toLocaleDateString()} - {availability.dayOfWeek}
                    </h4>
                    {availability.isRecurring && (
                      <span className="badge badge-info">Recurring Weekly</span>
                    )}
                  </div>
                  <button className="btn btn-danger" onClick={() => handleDelete(availability._id)} style={{ padding: '5px 15px' }}>
                    Delete
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
                  {availability.slots.map((slot, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '8px',
                        background: slot.isBooked ? '#ffe6e6' : '#e6f7ff',
                        border: `1px solid ${slot.isBooked ? '#ffcccc' : '#cce6ff'}`,
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                      }}
                    >
                      <div>
                        {slot.startTime} - {slot.endTime}
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: '3px', color: slot.isBooked ? '#d9534f' : '#5cb85c' }}>
                        {slot.isBooked ? 'Booked' : 'Available'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAvailability;
