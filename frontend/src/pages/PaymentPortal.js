import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentAPI } from '../utils/api';

/* ── helpers ─────────────────────────────────────────────────────────────── */
const formatCardNumber = (val) =>
  val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const detectBrand = (num) => {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return { name: 'Visa', icon: '💳' };
  if (/^5[1-5]/.test(n)) return { name: 'Mastercard', icon: '💳' };
  if (/^3[47]/.test(n)) return { name: 'Amex', icon: '💳' };
  return { name: '', icon: '💳' };
};

/* ── component ───────────────────────────────────────────────────────────── */
const PaymentPortal = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paymentId   = searchParams.get('paymentId');
  const amount      = searchParams.get('amount');
  const doctor      = searchParams.get('doctor');
  const spec        = searchParams.get('spec');

  const [card, setCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [flipped, setFlipped] = useState(false);
  const [errors, setErrors]   = useState({});
  const [paying, setPaying]   = useState(false);
  const [apiError, setApiError] = useState('');

  const brand = detectBrand(card.number);

  /* ── validation ─────────────────────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    const digits = card.number.replace(/\s/g, '');
    if (digits.length < 16) e.number = 'Enter a valid 16-digit card number';
    if (!card.name.trim())  e.name   = 'Cardholder name is required';
    const parts = card.expiry.split('/');
    if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2) {
      e.expiry = 'Enter expiry as MM/YY';
    } else {
      const month = parseInt(parts[0], 10);
      const year  = parseInt(`20${parts[1]}`, 10);
      const now   = new Date();
      if (month < 1 || month > 12) e.expiry = 'Invalid month';
      else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1))
        e.expiry = 'Card has expired';
    }
    if (card.cvv.length < 3) e.cvv = 'Enter a valid CVV';
    return e;
  };

  /* ── submit ──────────────────────────────────────────────────────────────── */
  const handlePay = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setPaying(true);
    try {
      await paymentAPI.completeDemo(paymentId);
      navigate('/payment/success');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Payment failed. Please try again.');
      setPaying(false);
    }
  };

  /* ── card preview ────────────────────────────────────────────────────────── */
  const CardPreview = () => (
    <div style={{ perspective: '1000px', height: '200px', marginBottom: '30px' }}>
      <div style={{
        position: 'relative', width: '100%', height: '200px',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.6s',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* Front */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden', borderRadius: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px', color: 'white', boxShadow: '0 8px 32px rgba(102,126,234,0.4)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '1px' }}>
              🏥 Hospital Pay
            </span>
            <span style={{ fontSize: '1.4rem' }}>{brand.icon}</span>
          </div>
          <div>
            <div style={{
              fontFamily: 'monospace', fontSize: '1.35rem', letterSpacing: '3px',
              marginBottom: '12px', minHeight: '28px',
            }}>
              {card.number || '•••• •••• •••• ••••'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', opacity: 0.9 }}>
              <div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '2px' }}>CARD HOLDER</div>
                <div style={{ textTransform: 'uppercase', minHeight: '18px' }}>
                  {card.name || 'YOUR NAME'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '2px' }}>EXPIRES</div>
                <div>{card.expiry || 'MM/YY'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden', borderRadius: '16px',
          background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
          transform: 'rotateY(180deg)',
          boxShadow: '0 8px 32px rgba(102,126,234,0.4)',
          overflow: 'hidden',
        }}>
          <div style={{ height: '50px', background: '#1a1a2e', margin: '20px 0' }} />
          <div style={{ padding: '0 24px' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>CVV</div>
            <div style={{
              background: 'white', borderRadius: '4px', padding: '8px 12px',
              fontFamily: 'monospace', letterSpacing: '5px', fontSize: '1rem', color: '#333',
              textAlign: 'right',
            }}>
              {card.cvv ? '•'.repeat(card.cvv.length) : '•••'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '40px 20px' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#2d3748' }}>
            Secure Payment
          </h1>
          <p style={{ color: '#718096', marginTop: '4px' }}>Demo Payment Portal</p>
        </div>

        {/* Order summary */}
        <div style={{
          background: 'white', borderRadius: '12px', padding: '16px 20px',
          marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          borderLeft: '4px solid #667eea',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '600', color: '#2d3748' }}>{doctor}</div>
              <div style={{ fontSize: '0.85rem', color: '#718096' }}>{spec} Consultation</div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#667eea' }}>
              ${amount}
            </div>
          </div>
        </div>

        {/* Demo hint */}
        <div style={{
          background: '#fff8e1', border: '1px solid #ffc107', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '20px', fontSize: '0.85rem', color: '#856404',
        }}>
          <strong>🧪 Demo Mode</strong> — Use card number <code style={{ background: '#fff3cd', padding: '1px 4px', borderRadius: '3px' }}>4242 4242 4242 4242</code>,
          any future date (e.g. <code style={{ background: '#fff3cd', padding: '1px 4px', borderRadius: '3px' }}>12/28</code>), any CVV (<code style={{ background: '#fff3cd', padding: '1px 4px', borderRadius: '3px' }}>123</code>)
        </div>

        {/* Card preview */}
        <CardPreview />

        {/* Form */}
        <div style={{
          background: 'white', borderRadius: '16px', padding: '28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          {apiError && (
            <div style={{
              background: '#fff5f5', border: '1px solid #fc8181', borderRadius: '8px',
              padding: '12px 16px', marginBottom: '20px', color: '#c53030', fontSize: '0.9rem',
            }}>
              ❌ {apiError}
            </div>
          )}

          <form onSubmit={handlePay} noValidate>
            {/* Card Number */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#4a5568', fontSize: '0.9rem' }}>
                Card Number
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                  maxLength={19}
                  style={{
                    width: '100%', padding: '12px 44px 12px 14px', border: `1.5px solid ${errors.number ? '#fc8181' : '#e2e8f0'}`,
                    borderRadius: '8px', fontSize: '1rem', fontFamily: 'monospace',
                    letterSpacing: '2px', outline: 'none', transition: 'border-color .2s',
                  }}
                  onFocus={() => setFlipped(false)}
                />
                <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>
                  {brand.icon}
                </span>
              </div>
              {errors.number && <p style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '4px' }}>{errors.number}</p>}
            </div>

            {/* Cardholder Name */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#4a5568', fontSize: '0.9rem' }}>
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="John Smith"
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value })}
                style={{
                  width: '100%', padding: '12px 14px', border: `1.5px solid ${errors.name ? '#fc8181' : '#e2e8f0'}`,
                  borderRadius: '8px', fontSize: '1rem', outline: 'none',
                  textTransform: 'uppercase',
                }}
                onFocus={() => setFlipped(false)}
              />
              {errors.name && <p style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '4px' }}>{errors.name}</p>}
            </div>

            {/* Expiry + CVV row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#4a5568', fontSize: '0.9rem' }}>
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                  maxLength={5}
                  style={{
                    width: '100%', padding: '12px 14px', border: `1.5px solid ${errors.expiry ? '#fc8181' : '#e2e8f0'}`,
                    borderRadius: '8px', fontSize: '1rem', fontFamily: 'monospace', outline: 'none',
                  }}
                  onFocus={() => setFlipped(false)}
                />
                {errors.expiry && <p style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '4px' }}>{errors.expiry}</p>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#4a5568', fontSize: '0.9rem' }}>
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="•••"
                  value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  maxLength={4}
                  style={{
                    width: '100%', padding: '12px 14px', border: `1.5px solid ${errors.cvv ? '#fc8181' : '#e2e8f0'}`,
                    borderRadius: '8px', fontSize: '1rem', fontFamily: 'monospace', outline: 'none',
                    letterSpacing: '4px',
                  }}
                  onFocus={() => setFlipped(true)}
                  onBlur={() => setFlipped(false)}
                />
                {errors.cvv && <p style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '4px' }}>{errors.cvv}</p>}
              </div>
            </div>

            {/* Pay button */}
            <button
              type="submit"
              disabled={paying}
              style={{
                width: '100%', padding: '15px',
                background: paying ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '1.05rem', fontWeight: '700', cursor: paying ? 'not-allowed' : 'pointer',
                letterSpacing: '0.5px', transition: 'opacity .2s',
                boxShadow: paying ? 'none' : '0 4px 15px rgba(102,126,234,0.4)',
              }}
            >
              {paying ? (
                <span>⏳ Processing...</span>
              ) : (
                <span>🔒 Pay ${amount} Now</span>
              )}
            </button>
          </form>

          {/* Security badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
            {['🔒 SSL Secured', '🛡️ Fraud Protected', '✅ 256-bit Encrypted'].map((badge) => (
              <span key={badge} style={{ fontSize: '0.72rem', color: '#a0aec0' }}>{badge}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPortal;
