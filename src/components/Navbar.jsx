import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="navbar-header navbar-light">
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
          </ul>
        </nav>

        <div className="nav-actions">
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
