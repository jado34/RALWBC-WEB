import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RANK_CATEGORIES, dbService } from '../services/db';
import { ShieldAlert, ChevronDown, Lock } from 'lucide-react';

export const Register = () => {
  const { register, updateProfile, currentUser } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [association, setAssociation] = useState('');
  const [church, setChurch] = useState('');
  const [rank, setRank] = useState('');
  const [rankCategory, setRankCategory] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+234');
  const [regWindowOpen, setRegWindowOpen] = useState(null); // null = checking

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  // Check if registration window is open
  useEffect(() => {
    dbService.isRegistrationWindowOpen().then(open => setRegWindowOpen(open));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !association.trim() || !church.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!rankCategory) {
      setError('Please select your RA rank category.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const generatedPassword = lastName.trim().toLowerCase();
      const user = await register(fullName, email, generatedPassword, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        association: association.trim(),
        church: church.trim(),
        rank: rank.trim(),
        rankCategory,
        phoneNumber: phoneNumber.trim(),
      });

      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Styles ─────────────────────────────────────────────── */
  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: '2rem 1rem',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  };

  const cardStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '3.5rem 3rem',
    width: '100%',
    maxWidth: '680px',
    boxShadow: '0 20px 50px rgba(10, 17, 65, 0.08)',
  };

  const headingStyle = {
    color: '#000000',
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
    textAlign: 'center',
    letterSpacing: '-0.5px',
  };

  const subheadingStyle = {
    color: '#64748b',
    fontSize: '0.875rem',
    textAlign: 'center',
    marginBottom: '2rem',
  };

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  };

  const groupStyle = {
    marginBottom: '1.1rem',
    position: 'relative',
  };

  const labelStyle = {
    display: 'block',
    color: '#000000',
    fontSize: '0.85rem',
    fontWeight: 700,
    marginBottom: '0.4rem',
    letterSpacing: '0.01em',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.8rem 1rem',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    color: '#000000',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-body)',
  };

  const selectWrapperStyle = {
    position: 'relative',
    width: '100%',
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    cursor: 'pointer',
    paddingRight: '2.5rem',
  };

  const chevronStyle = {
    position: 'absolute',
    right: '0.85rem',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
  };

  const helperTextStyle = {
    color: '#64748b',
    fontSize: '0.75rem',
    marginTop: '0.35rem',
    lineHeight: 1.4,
  };

  const errorBoxStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.15)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#ef4444',
    fontSize: '0.875rem',
    marginBottom: '1.25rem',
  };

  const btnStyle = {
    width: '100%',
    padding: '0.9rem',
    backgroundColor: '#0a1141',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: isSubmitting ? 'not-allowed' : 'pointer',
    boxShadow: '0 4px 12px rgba(10, 17, 65, 0.25)',
    transition: 'opacity 0.2s',
    marginTop: '0.5rem',
    opacity: isSubmitting ? 0.7 : 1,
  };

  const linkStyle = {
    color: '#ca8a04',
    textDecoration: 'none',
    fontWeight: 700,
  };

  const footerStyle = {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#1e293b',
    fontSize: '0.875rem',
    fontWeight: 500,
    borderTop: '1px solid #e2e8f0',
    paddingTop: '1.5rem',
  };

  const dividerStyle = {
    borderColor: '#e2e8f0',
    margin: '1.5rem 0',
  };

  /* ─── Rank category options ──────────────────────────────── */
  // RANK_CATEGORIES is expected to be an array of { value, label } objects
  // or an object map — we handle both shapes gracefully.
  const rankCategoryOptions = Array.isArray(RANK_CATEGORIES)
    ? RANK_CATEGORIES
    : [
      { value: 'ambassador', label: 'Ambassador' },
      { value: 'ambassador_extraordinary', label: 'Ambassador Extraordinary' },
      { value: 'ambassador_plenipotentiary', label: 'Ambassador Plenipotentiary' },
    ];

  /* ─── JSX ────────────────────────────────────────────────── */

  // ── Registration window gate ───────────────────────────────────────────────
  if (regWindowOpen === null) {
    return <div style={{ minHeight: '100vh' }} />;
  }

  if (regWindowOpen === false) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', backgroundColor: '#ffffff', padding: '3rem 1.5rem', textAlign: 'center'
      }}>
        <img src="/logo.png" alt="RALWBC" style={{ width: '90px', height: 'auto', marginBottom: '2rem', objectFit: 'contain' }} />
        <div style={{
          backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '16px', padding: '2.5rem 2rem', maxWidth: '460px', width: '100%'
        }}>
          <Lock size={40} color="#ef4444" style={{ marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.5rem', color: '#0a1141', fontWeight: '800', marginBottom: '0.75rem' }}>
            Registration Closed
          </h2>
          <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.7 }}>
            New account registration is currently closed. The conference administrator will open
            registration when the enrollment window begins. Please check back later.
          </p>
        </div>
        <p style={{ marginTop: '2.5rem', fontSize: '0.78rem', color: '#94a3b8' }}>
          Admin?{' '}
          <Link to="/admin-login" style={{ color: '#94a3b8', textDecoration: 'underline', fontWeight: '500' }}>
            Click here
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <h1 style={headingStyle}>Create Account</h1>
        <p style={subheadingStyle}>Register to access the RALWBC ranking portal</p>

        {/* Error */}
        {error && (
          <div style={errorBoxStyle}>
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name row */}
          <div style={rowStyle}>
            <div style={groupStyle}>
              <label style={labelStyle} htmlFor="reg-firstName">First Name *</label>
              <input
                id="reg-firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                required
                style={inputStyle}
              />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle} htmlFor="reg-lastName">Last Name *</label>
              <input
                id="reg-lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="David"
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Email */}
          <div style={groupStyle}>
            <label style={labelStyle} htmlFor="reg-email">Email Address *</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
            />
          </div>

          {/* Informational Password Note */}
          <div style={{
            backgroundColor: 'rgba(0, 32, 96, 0.04)',
            border: '1px solid rgba(0, 32, 96, 0.15)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#002060',
            fontSize: '0.9rem',
            lineHeight: '1.4'
          }}>
            <strong>🔑 Access Password Info:</strong>
            <p style={{ margin: '0.25rem 0 0 0' }}>
              Your login password will automatically be set to your <strong>Last Name (Surname) in lowercase</strong>.
            </p>
          </div>

          <hr style={dividerStyle} />

          {/* Association */}
          <div style={groupStyle}>
            <label style={labelStyle} htmlFor="reg-association">Association *</label>
            <input
              id="reg-association"
              type="text"
              value={association}
              onChange={(e) => setAssociation(e.target.value)}
              placeholder="e.g. Victory Land Baptist Association"
              required
              style={inputStyle}
            />
          </div>

          {/* Church */}
          <div style={groupStyle}>
            <label style={labelStyle} htmlFor="reg-church">Church *</label>
            <input
              id="reg-church"
              type="text"
              value={church}
              onChange={(e) => setChurch(e.target.value)}
              placeholder="e.g. Aalafia Oluwa Baptist Church"
              required
              style={inputStyle}
            />
          </div>

          {/* Phone */}
          <div style={groupStyle}>
            <label style={labelStyle} htmlFor="reg-phone">Phone Number</label>
            <input
              id="reg-phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+234 800 000 0000"
              style={inputStyle}
            />
          </div>

          <hr style={dividerStyle} />

          {/* ── Rank Category dropdown (REQUIRED) ── */}
          <div style={groupStyle}>
            <label style={labelStyle} htmlFor="reg-rankCategory">RA Rank Category *</label>
            <div style={selectWrapperStyle}>
              <select
                id="reg-rankCategory"
                value={rankCategory}
                onChange={(e) => setRankCategory(e.target.value)}
                required
                style={selectStyle}
              >
                <option value="" disabled>
                  — Select rank category —
                </option>
                {rankCategoryOptions.map((cat) => (
                  <option
                    key={cat.value}
                    value={cat.value}
                  >
                    {cat.label}
                  </option>
                ))}
              </select>
              <span style={chevronStyle}>
                <ChevronDown size={16} />
              </span>
            </div>
            <p style={helperTextStyle}>
              This determines which ranking exam you will be given access to.
            </p>
          </div>

          {/* ── Current Rank / Title (optional free-text) ── */}
          <div style={groupStyle}>
            <label style={labelStyle} htmlFor="reg-rank">Current Rank / Title (optional)</label>
            <input
              id="reg-rank"
              type="text"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              placeholder='e.g. Dean, Amb. Extra-Ordinary '
              style={inputStyle}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={btnStyle}
            onMouseOver={(e) => { if (!isSubmitting) e.currentTarget.style.opacity = '0.88'; }}
            onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
            onMouseDown={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {isSubmitting ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <div style={footerStyle}>
          Already have an account?{' '}
          <Link to="/login" style={linkStyle}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
