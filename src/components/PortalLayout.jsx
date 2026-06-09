import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, User, BookOpen, FileText, LogOut, Menu, X, Trophy, Users, Image } from 'lucide-react';

export const PortalLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If no user is logged in, don't wrap (shouldn't happen as these are protected routes)
  if (!currentUser) return <>{children}</>;

  const isAdmin = currentUser.role === 'admin';
  const queryParams = new URLSearchParams(location.search);
  const currentTab = queryParams.get('tab');

  // Define sidebar menu options and active states
  const menuItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: isAdmin ? '/admin' : '/dashboard',
      isActive: isAdmin 
        ? (location.pathname === '/admin' && currentTab !== 'exams' && currentTab !== 'candidates' && currentTab !== 'leaderboard')
        : location.pathname === '/dashboard'
    },
    {
      name: 'Profile',
      icon: <User size={20} />,
      path: isAdmin ? '/admin/profile' : '/profile',
      isActive: location.pathname === '/profile' || location.pathname === '/admin/profile'
    },
    isAdmin && {
      name: 'Candidates',
      icon: <Users size={20} />,
      path: '/admin?tab=candidates',
      isActive: location.pathname === '/admin' && currentTab === 'candidates'
    },
    {
      // For students: "My Exams" returns to dashboard (where active exam card is shown)
      // For admins: navigates to the Exams management tab
      name: isAdmin ? 'Examinations' : 'My Exams',
      icon: <BookOpen size={20} />,
      path: isAdmin ? '/admin?tab=exams' : '/dashboard',
      isActive: isAdmin
        ? (location.pathname === '/admin' && currentTab === 'exams')
        : (location.pathname === '/dashboard'),
    },
    isAdmin && {
      name: 'Leaderboard',
      icon: <Trophy size={20} />,
      path: '/admin?tab=leaderboard',
      isActive: location.pathname === '/admin' && currentTab === 'leaderboard'
    },
    {
      name: 'Blogs',
      icon: <FileText size={20} />,
      path: isAdmin ? '/admin/blogs' : '/blogs',
      isActive: location.pathname === '/admin/blogs' || location.pathname === '/blogs'
    },
    isAdmin && {
      name: 'Gallery',
      icon: <Image size={20} />,
      path: '/admin?tab=gallery',
      isActive: location.pathname === '/admin' && currentTab === 'gallery'
    },
  ].filter(Boolean);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get user avatar or first letter fallback
  const getAvatarContent = () => {
    if (currentUser.avatar) {
      return (
        <img 
          src={currentUser.avatar} 
          alt={currentUser.name} 
          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} 
        />
      );
    }
    const firstLetter = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
    return (
      <div style={{
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        backgroundColor: '#0a1141',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '1rem'
      }}>
        {firstLetter}
      </div>
    );
  };

  const getFirstName = () => {
    if (!currentUser.name) return 'User';
    return currentUser.name.split(' ')[0];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      
      {/* Top Header Section */}
      <header style={{
        height: '80px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        backgroundColor: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Left Side: Logo and Stacked Brand Text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src="/logo.png" 
              alt="Royal Ambassadors Logo" 
              style={{ width: '48px', height: '48px', objectFit: 'contain' }} 
            />
            <div style={{ height: '36px', borderRight: '1px solid #cbd5e1' }}></div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: '0.75rem',
              fontWeight: '800',
              color: '#002060', // Navy blue
              lineHeight: '1.15',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.02em'
            }}>
              <span>Royal Ambassador,</span>
              <span>Lagos West</span>
              <span>Baptist</span>
              <span>Conference</span>
            </div>
          </Link>
        </div>

        {/* Right Side: Profile Info & Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link 
            to={isAdmin ? '/admin/profile' : '/profile'} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
          >
            {getAvatarContent()}
            <span style={{ fontSize: '1rem', fontWeight: '700', color: '#000000', fontFamily: 'var(--font-heading)' }}>
              {getFirstName()}
            </span>
          </Link>

          {/* Mobile hamburger button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#002060',
              padding: '0.25rem'
            }}
            className="mobile-toggle"
            aria-label="Toggle Portal Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Main Area: Sidebar + Content */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        
        {/* Sidebar Left Column */}
        <aside 
          className={`portal-sidebar ${mobileMenuOpen ? 'open' : ''}`}
          style={{
            width: '240px',
            backgroundColor: '#f8fafc',
            borderRight: '1px solid #e2e8f0',
            padding: '1.5rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            transition: 'transform 0.3s ease',
            zIndex: 40
          }}
        >
          {menuItems.map((item, idx) => (
            <Link 
              key={idx}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1.25rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: item.isActive ? '#002060' : '#475569',
                backgroundColor: item.isActive ? '#edf2f7' : 'transparent',
                fontWeight: item.isActive ? '700' : '500',
                fontSize: '0.95rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!item.isActive) {
                  e.currentTarget.style.backgroundColor = '#edf2f7';
                  e.currentTarget.style.color = '#002060';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#475569';
                }
              }}
            >
              <span style={{ color: item.isActive ? '#ca8a04' : '#64748b' }}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: 'none',
              width: '100%',
              textAlign: 'left',
              color: '#ef4444',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              marginTop: 'auto',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </aside>

        {/* Content Right Column */}
        <main style={{ flex: 1, padding: '2rem', backgroundColor: '#ffffff', minHeight: 'calc(100vh - 80px)' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-toggle {
            display: block !important;
          }
          .portal-sidebar {
            position: absolute !important;
            top: 0;
            left: 0;
            bottom: 0;
            transform: translateX(-100%);
            box-shadow: 4px 0 15px rgba(0,0,0,0.05);
          }
          .portal-sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PortalLayout;
