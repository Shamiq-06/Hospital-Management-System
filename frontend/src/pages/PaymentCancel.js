import React from 'react';
import { Link } from 'react-router-dom';

const PaymentCancel = () => {
  return (
    <div className="container">
      <div style={{ maxWidth: '500px', margin: '80px auto', textAlign: 'center' }}>
        <div className="card">
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚫</div>
          <h2 style={{ color: '#dc3545', marginBottom: '10px' }}>Payment Cancelled</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            You cancelled the payment. Your appointment has not been confirmed.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <Link to="/patient/search-doctors">
              <button className="btn btn-primary">Find Doctors</button>
            </Link>
            <Link to="/patient/dashboard">
              <button className="btn btn-secondary">Go to Dashboard</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
