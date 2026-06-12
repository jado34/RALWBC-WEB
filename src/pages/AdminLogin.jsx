import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Eye, EyeOff, ShieldAlert, Lock } from 'lucide-react';

export const AdminLogin = () => {
  const { login, currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'admin' || currentUser.role === 'pro_admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'admin' && user.role !== 'pro_admin') {
        // Block non-admin accounts from this portal
        setError('This portal is for conference administrators only. Please use the Member Portal to sign in.');
        localStorage.removeItem('ralwbc_current_user');
        setIsSubmitting(false);
        return;
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '3rem 1rem',
    }}>

      {/* Back to home */}
      <Link to="/" style={{
        position: 'absolute', top: '1.5rem', left: '2rem',
        color: '#64748b', fontSize: '0.78rem', fontWeight: '600',
        letterSpacing: '0.08em', textDecoration: 'none', textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        transition: 'color 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = '#ca8a04'}
        onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
      >
        ← Back to Site
      </Link>

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: '420px',
        padding: 'clamp(2rem,5vw,3rem) clamp(1.5rem,4vw,2.5rem)',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(10, 17, 65, 0.08)',
        margin: '1rem',
      }}>
        {/* Logos */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', alignItems: 'center' }}>
          <img src="/logo.png" alt="RA Logo" style={{ width: '56px', objectFit: 'contain' }} />
          <div style={{ width: '1px', height: '40px', backgroundColor: '#e2e8f0' }} />
          <img src="/lwbc-logo.png" alt="LWBC Logo" style={{ width: '56px', objectFit: 'contain' }} />
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <Lock size={14} color="#ca8a04" />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.2em', color: '#ca8a04', textTransform: 'uppercase' }}>
              Restricted Access
            </span>
          </div>
          <h1 style={{ margin: '0 0 0.4rem', fontSize: '1.5rem', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
            Conference Administration
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
            Authorized personnel only
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
            backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
            padding: '0.85rem 1rem', borderRadius: '8px', color: '#dc2626',
            fontSize: '0.82rem', marginBottom: '1.5rem', lineHeight: 1.5,
          }}>
            <ShieldAlert size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="Admin Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '0.85rem 2.75rem 0.85rem 1rem',
                  backgroundColor: '#ffffff', border: '1px solid #cbd5e1',
                  borderRadius: '8px', color: '#0a1141', fontSize: '0.9rem',
                  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                  fontFamily: 'var(--font-body)',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#ca8a04'}
                onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
              />
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '0.85rem 2.75rem 0.85rem 1rem',
                  backgroundColor: '#ffffff', border: '1px solid #cbd5e1',
                  borderRadius: '8px', color: '#0a1141', fontSize: '0.9rem',
                  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                  fontFamily: 'var(--font-body)',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#ca8a04'}
                onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%', padding: '0.9rem', backgroundColor: '#ca8a04',
              color: '#fff', border: 'none', borderRadius: '3px',
              fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.1em',
              textTransform: 'uppercase', cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1, transition: 'background 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { if (!isSubmitting) { e.currentTarget.style.backgroundColor = '#a16207'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ca8a04'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {isSubmitting ? 'Authenticating…' : 'Sign In to Admin Portal'}
          </button>
        </form>

        {/* Disclaimer */}
        <p style={{ margin: '1.75rem 0 0', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>
          For member access, use the{' '}
          <Link to="/login" style={{ color: '#ca8a04', textDecoration: 'none', fontWeight: '600' }}>
            Member Portal
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
