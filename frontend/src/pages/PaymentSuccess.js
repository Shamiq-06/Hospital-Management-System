import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { paymentAPI } from '../utils/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const paymentId = searchParams.get('paymentId');
    const payerId  = searchParams.get('PayerID');

    if (paymentId && payerId) {
      // Real PayPal redirect
      executePayment(paymentId, payerId);
    } else {
      // Arrived from demo portal (already completed server-side)
      setStatus('success');
    }
  }, []);

  const executePayment = async (paymentId, payerId) => {
    try {
      await paymentAPI.executePayment({ paymentId, payerId });
      setStatus('success');
    } catch (error) {
      setStatus('error');
    }
  };

  if (status === 'processing') {
    return (
      <div className="container">
        <div style={{ maxWidth: '480px', margin: '80px auto', textAlign: 'center' }}>
          <div className="card">
            <div className="loading" style={{ position: 'static', height: 'auto', marginBottom: '20px' }}>
              <div className="spinner"></div>
            </div>
            <h2>Processing Payment...</h2>
            <p style={{ color: '#666' }}>Please wait while we confirm your payment.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container">
        <div style={{ maxWidth: '480px', margin: '80px auto', textAlign: 'center' }}>
          <div className="card">
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>❌</div>
            <h2 style={{ color: '#dc3545', marginBottom: '10px' }}>Payment Failed</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Something went wrong while processing your payment.
            </p>
            <Link to="/patient/search-doctors">
              <button className="btn btn-primary">Try Again</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '40px 20px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>

        {/* Success banner */}
        <div style={{
          background: 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)',
          borderRadius: '16px', padding: '32px', textAlign: 'center',
          color: 'white', marginBottom: '20px',
          boxShadow: '0 8px 32px rgba(56,161,105,0.3)',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '12px' }}>✅</div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: '700', marginBottom: '8px' }}>
            Payment Successful!
          </h1>
          <p style={{ opacity: 0.9 }}>Your appointment has been confirmed.</p>
        </div>

        {/* What happens next */}
        <div style={{
          background: 'white', borderRadius: '12px', padding: '20px 24px',
          marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <h3 style={{ fontWeight: '600', marginBottom: '16px', color: '#2d3748' }}>
            What happens next?
          </h3>
          {[
            { icon: '📱', title: 'WhatsApp Notification', desc: 'A confirmation message has been sent to your registered WhatsApp number.' },
            { icon: '📅', title: 'Appointment Confirmed', desc: 'Your slot is reserved. Please arrive 10 minutes early.' },
            { icon: '💳', title: 'Receipt Generated', desc: 'Your payment receipt has been saved. View it in your appointments.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: '14px', marginBottom: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: '#ebf4ff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
              }}>
                {icon}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.92rem', color: '#2d3748' }}>{title}</div>
                <div style={{ fontSize: '0.84rem', color: '#718096', marginTop: '2px' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp demo notice */}
        <div style={{
          background: '#fff8e1', border: '1px solid #ffc107', borderRadius: '10px',
          padding: '14px 18px', marginBottom: '20px', fontSize: '0.85rem', color: '#744210',
          display: 'flex', gap: '10px', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.2rem' }}>📲</span>
          <div>
            <strong>Demo Mode:</strong> WhatsApp credentials are not configured.
            The appointment confirmation message was logged to the server console and saved in the
            Notifications database. Add real WhatsApp Cloud API credentials in{' '}
            <code style={{ background: '#fff3cd', padding: '1px 4px', borderRadius: '3px' }}>backend/.env</code>{' '}
            to receive actual WhatsApp messages.
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/patient/appointments" style={{ flex: 1 }}>
            <button className="btn btn-primary" style={{ width: '100%' }}>
              View My Appointments
            </button>
          </Link>
          <Link to="/patient/dashboard" style={{ flex: 1 }}>
            <button className="btn btn-secondary" style={{ width: '100%' }}>
              Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
