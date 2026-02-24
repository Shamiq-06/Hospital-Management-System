import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const { role } = result.user;
      switch (role) {
        case 'patient':
          navigate('/patient/dashboard');
          break;
        case 'doctor':
          navigate('/doctor/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '60px auto' }}>
        <div className="card">
          <h2 className="card-header" style={{ textAlign: 'center' }}>Login</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>

          <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '6px' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '10px' }}>Demo Credentials:</p>
            <p style={{ fontSize: '0.85rem', margin: '5px 0' }}>Admin: admin@hospital.com / admin123</p>
            <p style={{ fontSize: '0.85rem', margin: '5px 0' }}>Doctor: dr.smith@hospital.com / doctor123</p>
            <p style={{ fontSize: '0.85rem', margin: '5px 0' }}>Patient: patient1@example.com / patient123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
