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
    <div className="pay-card-wrap">
      <div className={`pay-card ${flipped ? 'is-flipped' : ''}`}>
        {/* Front */}
        <div className="pay-card-face pay-card-front">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '0.02em' }}>
              🏥 Hospital Pay
            </span>
            <span style={{ fontSize: '1.4rem' }}>{brand.icon}</span>
          </div>
          <div>
            <div style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: '1.35rem',
              letterSpacing: '0.18em',
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
        <div className="pay-card-face pay-card-back">
          <div className="pay-card-strip" />
          <div className="pay-card-cvv">
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>CVV</div>
            <div style={{
              background: 'white', borderRadius: '4px', padding: '8px 12px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              letterSpacing: '0.3em',
              fontSize: '1rem',
              color: '#333',
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
    <div className="page">
      <div className="page-narrow">

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Secure Payment</h1>
          <p className="page-subtitle">Demo Payment Portal</p>
        </div>

        {/* Order summary */}
        <div className="card card-accent" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '800' }}>{doctor}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--clay-muted)' }}>{spec} Consultation</div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--clay-accent)' }}>
              ${amount}
            </div>
          </div>
        </div>

        {/* Demo hint */}
        <div className="alert alert-warning" style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
          <strong>🧪 Demo Mode</strong> — Use card number <code style={{ background: '#fff3cd', padding: '1px 4px', borderRadius: '3px' }}>4242 4242 4242 4242</code>,
          any future date (e.g. <code style={{ background: '#fff3cd', padding: '1px 4px', borderRadius: '3px' }}>12/28</code>), any CVV (<code style={{ background: '#fff3cd', padding: '1px 4px', borderRadius: '3px' }}>123</code>)
        </div>

        {/* Card preview */}
        <CardPreview />

        {/* Form */}
        <div className="card card-lg">
          {apiError && (
            <div className="alert alert-error">❌ {apiError}</div>
          )}

          <form onSubmit={handlePay} noValidate>
            {/* Card Number */}
            <div style={{ marginBottom: '18px' }}>
              <label className="form-label" style={{ fontSize: '0.9rem' }}>
                Card Number
              </label>
              <div className="input-with-icon">
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                  maxLength={19}
                  className={`form-input input-mono input-spaced ${errors.number ? 'is-error' : ''}`}
                  style={{ paddingRight: '44px', fontSize: '1rem' }}
                  onFocus={() => setFlipped(false)}
                />
                <span className="input-icon">
                  {brand.icon}
                </span>
              </div>
              {errors.number && <p className="form-error">{errors.number}</p>}
            </div>

            {/* Cardholder Name */}
            <div style={{ marginBottom: '18px' }}>
              <label className="form-label" style={{ fontSize: '0.9rem' }}>
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="John Smith"
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value })}
                className={`form-input ${errors.name ? 'is-error' : ''}`}
                style={{ fontSize: '1rem', textTransform: 'uppercase' }}
                onFocus={() => setFlipped(false)}
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            {/* Expiry + CVV row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.9rem' }}>
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                  maxLength={5}
                  className={`form-input input-mono ${errors.expiry ? 'is-error' : ''}`}
                  style={{ fontSize: '1rem' }}
                  onFocus={() => setFlipped(false)}
                />
                {errors.expiry && <p className="form-error">{errors.expiry}</p>}
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.9rem' }}>
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="•••"
                  value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  maxLength={4}
                  className={`form-input input-mono input-spaced ${errors.cvv ? 'is-error' : ''}`}
                  style={{ fontSize: '1rem' }}
                  onFocus={() => setFlipped(true)}
                  onBlur={() => setFlipped(false)}
                />
                {errors.cvv && <p className="form-error">{errors.cvv}</p>}
              </div>
            </div>

            {/* Pay button */}
            <button
              type="submit"
              disabled={paying}
              className="btn btn-primary btn-lg btn-block"
            >
              {paying ? (
                <span>⏳ Processing...</span>
              ) : (
                <span>🔒 Pay ${amount} Now</span>
              )}
            </button>
          </form>

          {/* Security badges */}
          <div className="micro-badges">
            {['🔒 SSL Secured', '🛡️ Fraud Protected', '✅ 256-bit Encrypted'].map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPortal;
