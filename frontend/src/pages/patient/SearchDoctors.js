import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientAPI } from '../../utils/api';

const SearchDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [filters, setFilters] = useState({
    specialization: '',
    search: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpecializations();
    searchDoctors();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const response = await patientAPI.getSpecializations();
      setSpecializations(response.data.data.specializations);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  };

  const searchDoctors = async () => {
    setLoading(true);
    try {
      const response = await patientAPI.searchDoctors(filters);
      setDoctors(response.data.data.doctors);
    } catch (error) {
      console.error('Error searching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchDoctors();
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>Find Doctors</h1>

      <div className="card">
        <form onSubmit={handleSearch}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Specialization</label>
              <select
                name="specialization"
                className="form-select"
                value={filters.specialization}
                onChange={handleFilterChange}
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
              <label className="form-label">Search by Name</label>
              <input
                type="text"
                name="search"
                className="form-input"
                placeholder="Doctor name..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            🔍 Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <div>
          <h3 style={{ marginTop: '30px', marginBottom: '20px' }}>
            {doctors.length} {doctors.length === 1 ? 'Doctor' : 'Doctors'} Found
          </h3>

          {doctors.length === 0 ? (
            <div className="card">
              <p style={{ textAlign: 'center', color: '#666' }}>
                No doctors found. Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-2">
              {doctors.map((doctor) => (
                <div key={doctor._id} className="card">
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2rem',
                        flexShrink: 0,
                      }}
                    >
                      👨‍⚕️
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: '5px' }}>
                        Dr. {doctor.user.firstName} {doctor.user.lastName}
                      </h3>
                      <p style={{ color: '#667eea', fontWeight: '500', marginBottom: '10px' }}>
                        {doctor.specialization}
                      </p>
                      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
                        ⭐ Rating: {doctor.rating.toFixed(1)} | 💼 {doctor.experience} years experience
                      </p>
                      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
                        💰 Consultation Fee: ${doctor.consultationFee}
                      </p>
                      <Link to={`/patient/book-appointment/${doctor.user._id}`}>
                        <button className="btn btn-primary">Book Appointment</button>
                      </Link>
                    </div>
                  </div>
                  {doctor.biography && (
                    <p
                      style={{
                        marginTop: '15px',
                        padding: '10px',
                        background: '#f8f9fa',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                      }}
                    >
                      {doctor.biography}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDoctors;
