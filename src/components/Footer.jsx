import React from 'react';
import { Link } from 'react-router-dom';
import { RALogo } from './Navbar';

export const Footer = () => {
  const footerBg = '#ffffff';
  const footerBorderColor = '#e2e8f0';
  const textColor = '#475569';
  const titleColor = '#002060';

  return (
    <footer className="footer-section" style={{
      backgroundColor: footerBg,
      borderTop: `1px solid ${footerBorderColor}`,
      padding: '4rem 0 2rem',
      color: textColor
    }}>
      <div className="container">
        <div className="footer-grid" style={{ gridTemplateColumns: '2fr repeat(2, 1fr) 1.5fr' }}>

          <div className="footer-col-about" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RALogo size={32} />
              <span className="logo-text" style={{ fontSize: '1rem', color: '#002060', fontWeight: '800' }}>
                RALWBC
              </span>
            </Link>
            <p style={{ color: textColor, fontSize: '0.85rem', lineHeight: '1.6', maxWidth: '300px' }}>
              Royal Ambassadors Lagos West Baptist Conference (RALWBC). Developing Christ-centered youths through discipleship, missions, and Parade Session.
            </p>
          </div>

          <div>
            <h4 className="footer-col-title" style={{ color: titleColor, fontSize: '0.9rem', fontWeight: 'bold' }}>Navigation</h4>
            <ul className="footer-links" style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}><Link to="/" style={{ color: textColor }}>Home</Link></li>
              <li style={{ marginBottom: '0.5rem' }}><Link to="/about-us" style={{ color: textColor }}>About Us</Link></li>
              <li style={{ marginBottom: '0.5rem' }}><Link to="/blogs" style={{ color: textColor }}>Blog</Link></li>
              <li><Link to="/gallery" style={{ color: textColor }}>Gallery</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title" style={{ color: titleColor, fontSize: '0.9rem', fontWeight: 'bold' }}>Community</h4>
            <ul className="footer-links" style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}><Link to="/officers" style={{ color: textColor }}>Officers</Link></li>
              <li style={{ marginBottom: '0.5rem' }}><Link to="/resources" style={{ color: textColor }}>Resources</Link></li>
              <li><Link to="/contact" style={{ color: textColor }}>Contact Us</Link></li>
            </ul>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 className="footer-col-title" style={{ color: titleColor, fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Social Links</h4>
            <div style={{ display: 'flex', gap: '1rem', color: '#002060' }}>
              <a href="https://www.instagram.com/ralwbc/" target="_blank" rel="noreferrer" style={{ color: '#002060' }} aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              <a href="https://web.facebook.com/people/Royal-Ambassadors-Lagos-West-Baptist-Conference/100070112613066/?locale=en_GB#" target="_blank" rel="noreferrer" style={{ color: '#002060' }} aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
            </div>
            <span style={{ fontSize: '0.8rem', color: textColor, marginTop: '0.5rem' }}>
              Conference Secretariat, Lagos, Nigeria.
            </span>
          </div>
        </div>


        <div className="footer-bottom" style={{ borderTop: `1px solid ${footerBorderColor}`, marginTop: '3rem', paddingTop: '1.5rem', color: textColor }}>
          <p>Copyright &copy; {new Date().getFullYear()} RALWBC. All rights reserved.</p>
          <p style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="#privacy" style={{ color: textColor }}>Privacy Policy</a>
            <span>&bull;</span>
            <a href="#terms" style={{ color: textColor }}>Terms of Service</a>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </footer>
  );
};

