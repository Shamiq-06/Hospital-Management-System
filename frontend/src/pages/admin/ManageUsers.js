import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: '', status: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers(filter);
      setUsers(response.data.data.users);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      await adminAPI.updateUserStatus(userId, { isActive });
      setMessage({
        type: 'success',
        text: `User ${isActive ? 'activated' : 'deactivated'} successfully!`,
      });
      fetchUsers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update user status',
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      setMessage({ type: 'success', text: 'User deleted successfully!' });
      fetchUsers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete user',
      });
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
      <h1 style={{ marginBottom: '30px' }}>Manage Users</h1>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-header">Filter Users</h3>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={filter.role}
              onChange={(e) => setFilter({ ...filter, role: e.target.value })}
            >
              <option value="">All Roles</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-header">Users ({users.length})</h3>
        {users.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center' }}>No users found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Joined</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>
                      {user.firstName} {user.lastName}
                    </td>
                    <td style={{ padding: '12px' }}>{user.email}</td>
                    <td style={{ padding: '12px' }}>{user.phone}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        className={`badge ${
                          user.role === 'admin'
                            ? 'badge-danger'
                            : user.role === 'doctor'
                            ? 'badge-info'
                            : 'badge-success'
                        }`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-secondary'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button
                          className={`btn ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleStatusChange(user._id, !user.isActive)}
                          style={{ padding: '5px 10px', fontSize: '0.85rem' }}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteUser(user._id)}
                            style={{ padding: '5px 10px', fontSize: '0.85rem' }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
