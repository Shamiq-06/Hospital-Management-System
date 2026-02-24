import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../../utils/api';

const DoctorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    specialization: 'General Medicine',
    experience: 0,
    licenseNumber: '',
    department: '',
    consultationFee: 0,
    biography: '',
    languages: [],
    qualifications: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await doctorAPI.getProfile();
      const profileData = response.data.data.profile;
      setProfile(profileData);
      setFormData(profileData);
      setLoading(false);
    } catch (error) {
      // Profile doesn't exist yet
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await doctorAPI.createOrUpdateProfile(formData);
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

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>Doctor Profile</h1>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {profile && !profile.isApproved && (
        <div className="alert alert-info">
          Your profile is pending approval by the admin. You will be able to receive appointments once approved.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3 className="card-header">Professional Information</h3>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Specialization</label>
              <select
                name="specialization"
                className="form-select"
                value={formData.specialization}
                onChange={handleChange}
                required
              >
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input
                type="number"
                name="experience"
                className="form-input"
                value={formData.experience}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Medical License Number</label>
              <input
                type="text"
                name="licenseNumber"
                className="form-input"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                name="department"
                className="form-input"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Consultation Fee ($)</label>
              <input
                type="number"
                name="consultationFee"
                className="form-input"
                value={formData.consultationFee}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Biography</label>
            <textarea
              name="biography"
              className="form-textarea"
              value={formData.biography}
              onChange={handleChange}
              placeholder="Tell us about yourself, your expertise, and experience..."
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default DoctorProfile;
