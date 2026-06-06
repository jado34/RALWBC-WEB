import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User } from 'lucide-react';

// Official Royal Ambassadors Image Logo
export const RALogo = ({ size = 36 }) => (
  <img 
    src="/logo.png" 
    alt="RALWBC Logo" 
    style={{ 
      width: `${size}px`, 
      height: `${size}px`, 
      borderRadius: '50%', 
      objectFit: 'contain' 
    }} 
  />
);


export const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isPortalRoute = ['/dashboard', '/exam', '/admin', '/profile'].some(path => location.pathname.startsWith(path));
  if (isPortalRoute) return null;

  // Check if current route is a public website page
  const headerClass = "navbar-header navbar-light";

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className={headerClass}>
      <div className="container navbar-container">
        <Link to="/" className="logo-link" onClick={() => setIsOpen(false)}>
          <RALogo size={40} />
          <span className="logo-text" style={{ fontSize: '1.15rem', color: '#002060' }}>
            RALWBC
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <ul className="nav-menu">
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
            </li>
            <li>
              <NavLink to="/about-us" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>About Us</NavLink>
            </li>
            <li>
              <NavLink to="/officers" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Officers</NavLink>
            </li>
            <li>
              <NavLink to="/blogs" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Blog</NavLink>
            </li>
            <li>
              <NavLink to="/gallery" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Gallery</NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Contact</NavLink>
            </li>
            {currentUser && (
              <li>
                <NavLink 
                  to={currentUser.role === 'admin' ? '/admin' : '/dashboard'} 
                  className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                >
                  Portal Dashboard
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="nav-actions">
          {/* Desktop-only auth buttons — hidden on mobile, moved into hamburger menu */}
          <div className="desktop-auth">
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link 
                  to={currentUser.role === 'admin' ? '/admin/profile' : '/profile'} 
                  className="btn btn-secondary btn-sm" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #002060', color: '#002060', background: 'transparent' }}
                >
                  <User size={16} />
                  <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.name.split(' ')[0]}
                  </span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-primary btn-sm" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--danger)', boxShadow: 'none' }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/login" className="btn btn-outline-navy btn-sm" style={{ borderRadius: '24px' }}>Log In</Link>
              </div>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle Menu" style={{ color: '#002060' }}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      {isOpen && (
        <div className="mobile-nav" style={{
          position: 'absolute',
          top: '4.5rem',
          left: 0,
          right: 0,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          zIndex: 99
        }}>
          <Link to="/" className="nav-link" onClick={toggleMenu} style={{ color: '#475569' }}>Home</Link>
          <Link to="/about-us" className="nav-link" onClick={toggleMenu} style={{ color: '#475569' }}>About Us</Link>
          <Link to="/officers" className="nav-link" onClick={toggleMenu} style={{ color: '#475569' }}>Officers</Link>
          <Link to="/blogs" className="nav-link" onClick={toggleMenu} style={{ color: '#475569' }}>Blog</Link>
          <Link to="/gallery" className="nav-link" onClick={toggleMenu} style={{ color: '#475569' }}>Gallery</Link>
          <Link to="/contact" className="nav-link" onClick={toggleMenu} style={{ color: '#475569' }}>Contact</Link>
          {currentUser && (
            <Link to={currentUser.role === 'admin' ? '/admin' : '/dashboard'} className="nav-link" onClick={toggleMenu} style={{ color: '#002060', fontWeight: 'bold' }}>
              Portal Dashboard
            </Link>
          )}
          {currentUser && (
            <Link to={currentUser.role === 'admin' ? '/admin/profile' : '/profile'} className="nav-link" onClick={toggleMenu} style={{ color: '#002060' }}>
              My Profile
            </Link>
          )}
          {/* Auth action at the bottom of the mobile menu */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '0.5rem' }}>
            {currentUser ? (
              <button
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', background: 'none', border: 'none', color: '#ef4444', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', padding: '0.5rem 0' }}
              >
                <LogOut size={18} /> Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={toggleMenu}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0.8rem', backgroundColor: '#0a1141', color: '#ffffff', borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 4px 12px rgba(10,17,65,0.2)' }}
              >
                Log In to Portal
              </Link>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .desktop-auth { display: none !important; }
        }
      `}</style>
    </header>
  );
};

