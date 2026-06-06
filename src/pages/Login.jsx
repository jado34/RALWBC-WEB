import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Eye, EyeOff, ShieldAlert } from 'lucide-react';

export const Login = () => {
  const { login, currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false); // Controls onboarding vs form view
  const navigate = useNavigate();

  // If already logged in, redirect away
  React.useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Callback avatar helper
  const renderAvatarFallback = (name, size = 120) => {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'rgba(0, 32, 96, 0.08)',
        color: '#002060',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '1rem',
        border: '1px solid rgba(0, 32, 96, 0.15)',
        margin: '0 auto 1.25rem'
      }}>
        RA
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
      backgroundColor: '#ffffff', // Plain white background on portal login page
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Blurred watermark background image layer */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url('https://images.unsplash.com/photo-1526948531399-320e5e361a29?w=1200&auto=format&fit=crop&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.04, // low opacity marching background
        filter: 'blur(2px)',
        zIndex: 1,
        pointerEvents: 'none'
      }}></div>

      {!showLoginForm ? (
        /* ONBOARDING SCREEN VIEW (Image 4) */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '850px',
          padding: '2rem',
          zIndex: 2,
          textAlign: 'center'
        }}>
          {/* Dual Emblem Logos (RA & Conference Logo side-by-side) */}
          <div style={{ 
            display: 'flex', 
            gap: '3rem', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexWrap: 'wrap', 
            marginBottom: '4.5rem',
            width: '100%'
          }}>
            <img 
              src="/logo.png" 
              alt="Royal Ambassadors Logo" 
              style={{ 
                width: 'clamp(150px, 25vw, 240px)', 
                height: 'auto', 
                objectFit: 'contain',
                filter: 'drop-shadow(0 8px 16px rgba(10, 17, 65, 0.08))'
              }}
            />
            <img 
              src="/lwbc-logo.png" 
              alt="Lagos West Baptist Conference Logo" 
              style={{ 
                width: 'clamp(150px, 25vw, 240px)', 
                height: 'auto', 
                objectFit: 'contain',
                filter: 'drop-shadow(0 8px 16px rgba(10, 17, 65, 0.08))'
              }}
            />
          </div>

          {/* Begin Call-To-Action Link (Click here to begin) */}
          <button 
            onClick={() => setShowLoginForm(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.4rem',
              fontWeight: '700',
              color: '#0a1141', // Navy blue
              fontFamily: 'var(--font-heading)',
              transition: 'transform var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Click <span style={{ color: '#ca8a04' }}>here</span> to begin
          </button>
        </div>
      ) : (
        /* LOGIN CARD FORM VIEW (Image 3) */
        <div className="glass-panel" style={{
          maxWidth: '460px',
          width: '100%',
          padding: '3rem 2.5rem',
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          boxShadow: '0 10px 40px rgba(10, 17, 65, 0.08)',
          border: '1px solid #e2e8f0',
          zIndex: 2
        }}>
          {/* Back button to onboarding */}
          <button 
            onClick={() => setShowLoginForm(false)} 
            style={{
              background: 'none',
              border: 'none',
              color: '#ca8a04',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: 0
            }}
          >
            &larr; Back
          </button>

          {/* Branding Emblem Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <img 
              src="/logo.png" 
              alt="Royal Ambassadors Logo" 
              style={{ 
                width: '60px', 
                height: '60px', 
                objectFit: 'contain', 
                margin: '0 auto 1.25rem', 
                display: 'block' 
              }} 
            />
            <h2 style={{ 
              fontSize: '1.6rem', 
              color: '#ca8a04', // Brand Gold
              fontWeight: '800', 
              marginBottom: '0.35rem',
              fontFamily: 'var(--font-heading)'
            }}>
              Welcome Back!
            </h2>
            <p style={{ color: '#475569', fontSize: '0.85rem', fontWeight: '500' }}>
              Please login to your account
            </p>
          </div>

          {/* Error notification */}
          {error && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              color: '#ef4444',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              alignItems: 'center'
            }}>
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email input field */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ 
                    padding: '0.85rem 3rem 0.85rem 1.25rem',
                    backgroundColor: '#eff6f5', // Faint greyish-blue tinted background
                    border: 'none',
                    borderRadius: '10px',
                    color: '#0a1141',
                    fontSize: '0.95rem'
                  }}
                />
                <Mail 
                  size={18} 
                  color="#64748b" 
                  style={{ 
                    position: 'absolute', 
                    right: '1.25rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)' 
                  }} 
                />
              </div>
            </div>

            {/* Password input field */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ 
                    padding: '0.85rem 3rem 0.85rem 1.25rem',
                    backgroundColor: '#eff6f5', // Faint greyish-blue tinted background
                    border: 'none',
                    borderRadius: '10px',
                    color: '#0a1141',
                    fontSize: '0.95rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1.25rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me & Recover Password row */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              fontSize: '0.85rem',
              color: '#1e293b',
              marginBottom: '2.5rem',
              fontWeight: '500'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#ca8a04',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                Remember me
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Please contact your local conference administrator to reset your exam credentials."); }} style={{ color: '#1e293b' }}>
                Recover Password
              </a>
            </div>

            {/* Centered navy submit button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn"
              style={{ 
                display: 'block', 
                margin: '0 auto', 
                width: '180px', 
                padding: '0.75rem 1.5rem', 
                backgroundColor: '#0a1141', // Deep navy blue
                color: '#ffffff', 
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '0.95rem',
                boxShadow: '0 4px 10px rgba(10, 17, 65, 0.25)',
                cursor: 'pointer'
              }}
            >
              {isSubmitting ? 'Log In...' : 'Log In'}
            </button>
          </form>

          {/* Redirect section */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '2.25rem', 
            fontSize: '0.85rem', 
            color: '#1e293b',
            fontWeight: '500'
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#ca8a04', fontWeight: '700' }}>
              Register Here!
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
export default Login;
