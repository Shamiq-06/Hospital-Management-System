import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { paymentAPI } from '../utils/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
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
  }, [searchParams]);

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
    <div className="page">
      <div className="page-narrow" style={{ maxWidth: '500px' }}>

        {/* Success banner */}
        <div
          className="card card-lg"
          style={{
            background:
              'radial-gradient(120% 140% at 10% 10%, rgba(255,255,255,0.45), transparent 35%), linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: 'white',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '12px' }}>✅</div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: '700', marginBottom: '8px' }}>
            Payment Successful!
          </h1>
          <p style={{ opacity: 0.9 }}>Your appointment has been confirmed.</p>
        </div>

        {/* What happens next */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <h3 className="card-header" style={{ marginBottom: '16px' }}>What happens next?</h3>
          {[
            { icon: '📱', title: 'WhatsApp Notification', desc: 'A confirmation message has been sent to your registered WhatsApp number.' },
            { icon: '📅', title: 'Appointment Confirmed', desc: 'Your slot is reserved. Please arrive 10 minutes early.' },
            { icon: '💳', title: 'Receipt Generated', desc: 'Your payment receipt has been saved. View it in your appointments.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: '14px', marginBottom: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.55)',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: 'var(--clay-shadow-sm)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
              }}>
                {icon}
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.92rem' }}>{title}</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--clay-muted)', marginTop: '2px' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp demo notice */}
        <div className="alert alert-warning" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.2rem' }}>📲</span>
          <div>
            <strong>Demo Mode:</strong> Booking and payment notifications are generated successfully.
            In demo setup, messages are routed using the configured demo recipient and also stored in
            Notifications for tracking.
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/patient/appointments" style={{ flex: 1 }}>
            <button className="btn btn-primary btn-block">
              View My Appointments
            </button>
          </Link>
          <Link to="/patient/dashboard" style={{ flex: 1 }}>
            <button className="btn btn-secondary btn-block">
              Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
