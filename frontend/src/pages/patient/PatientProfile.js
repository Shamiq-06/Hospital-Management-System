import React, { useState, useEffect } from 'react';
import { patientAPI } from '../../utils/api';

const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: 'A+',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: '',
    },
    allergies: [],
    currentMedications: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await patientAPI.getProfile();
      const profileData = response.data.data.profile;
      setProfile(profileData);

      // Format date for input
      const dobDate = new Date(profileData.dateOfBirth);
      const formattedDate = dobDate.toISOString().split('T')[0];

      setFormData({
        ...profileData,
        dateOfBirth: formattedDate,
      });
      setLoading(false);
    } catch (error) {
      // Profile doesn't exist yet
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await patientAPI.createOrUpdateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setSaving(false);
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
      <h1 style={{ marginBottom: '30px' }}>Patient Profile</h1>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3 className="card-header">Personal Information</h3>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                className="form-input"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select name="gender" className="form-select" value={formData.gender} onChange={handleChange} required>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                name="bloodGroup"
                className="form-select"
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">Address</h3>

          <div className="form-group">
            <label className="form-label">Street</label>
            <input
              type="text"
              name="address.street"
              className="form-input"
              value={formData.address.street}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="address.city"
                className="form-input"
                value={formData.address.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                name="address.state"
                className="form-input"
                value={formData.address.state}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Zip Code</label>
              <input
                type="text"
                name="address.zipCode"
                className="form-input"
                value={formData.address.zipCode}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                name="address.country"
                className="form-input"
                value={formData.address.country}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">Emergency Contact</h3>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="emergencyContact.name"
                className="form-input"
                value={formData.emergencyContact.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Relationship</label>
              <input
                type="text"
                name="emergencyContact.relationship"
                className="form-input"
                value={formData.emergencyContact.relationship}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="emergencyContact.phoneNumber"
                className="form-input"
                value={formData.emergencyContact.phoneNumber}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default PatientProfile;
