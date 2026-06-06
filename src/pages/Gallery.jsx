import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const PHOTOS_LIST = [
  { id: 1, url: '/Lagos-West1.jpeg', alt: 'Two men discussing at Lagos West Conference' },
  { id: 2, url: '/626663584_18040805231733739_4709563975724227572_n.jpg', alt: 'RA member uniform profile inspection' },
  { id: 3, url: '/671245412_18050382983733739_357892051856325748_n.jpg', alt: 'Stage event auditorium audience meeting' },
  { id: 4, url: '/Lagos-West3.jpeg', alt: 'Ambassador saluting during drill inspection' },
  { id: 5, url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&auto=format&fit=crop&q=60', alt: 'Singing with microphone during worship' },
  { id: 6, url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&auto=format&fit=crop&q=60', alt: 'Marshal speaking at podium and address' }
];

export const Gallery = () => {
  const [currentPage, setCurrentPage] = useState('01');
  const [activePhoto, setActivePhoto] = useState(null);

  // Navigate lightbox images
  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    const idx = PHOTOS_LIST.findIndex(p => p.url === activePhoto.url);
    const prevIdx = (idx - 1 + PHOTOS_LIST.length) % PHOTOS_LIST.length;
    setActivePhoto(PHOTOS_LIST[prevIdx]);
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    const idx = PHOTOS_LIST.findIndex(p => p.url === activePhoto.url);
    const nextIdx = (idx + 1) % PHOTOS_LIST.length;
    setActivePhoto(PHOTOS_LIST[nextIdx]);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '3rem 1.5rem', backgroundColor: '#ffffff' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Main Header */}
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '800', 
          marginBottom: '3rem', 
          color: '#000000', 
          fontFamily: 'var(--font-heading)'
        }}>
          Gallery
        </h1>

        {/* Section 1: Jubilee Experience */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '1.75rem' }}>
            <h2 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '700', 
              color: '#000000',
              paddingBottom: '0.4rem', 
              borderBottom: '2px solid #000000', 
              whiteSpace: 'nowrap',
              margin: 0
            }}>
              Jubilee Experience
            </h2>
            <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0', marginLeft: '0.5rem' }}></div>
          </div>

          {/* Grid of 6 */}
          <div style={gridStyle}>
            {PHOTOS_LIST.map((photo) => (
              <div 
                key={`jubilee-${photo.id}`} 
                style={imgContainerStyle} 
                onClick={() => setActivePhoto(photo)}
                className="gallery-photo-card"
              >
                <img src={photo.url} alt={photo.alt} style={imgStyle} />
              </div>
            ))}
          </div>

          {/* See more link */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <a href="#more-jamboree" onClick={(e) => { e.preventDefault(); alert("Viewing more Jamboree pictures..."); }} style={linkStyle}>
              See more Jamboree pictures ›
            </a>
          </div>
        </div>

        {/* Section 2: 2023 Ushering In */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '1.75rem' }}>
            <h2 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '700', 
              color: '#000000',
              paddingBottom: '0.4rem', 
              borderBottom: '2px solid #000000', 
              whiteSpace: 'nowrap',
              margin: 0
            }}>
              2023 Ushering In
            </h2>
            <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0', marginLeft: '0.5rem' }}></div>
          </div>

          {/* Grid of 6 */}
          <div style={gridStyle}>
            {PHOTOS_LIST.map((photo) => (
              <div 
                key={`ushering-${photo.id}`} 
                style={imgContainerStyle} 
                onClick={() => setActivePhoto(photo)}
                className="gallery-photo-card"
              >
                <img src={photo.url} alt={photo.alt} style={imgStyle} />
              </div>
            ))}
          </div>

          {/* See more link */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <a href="#more-ushering" onClick={(e) => { e.preventDefault(); alert("Viewing more 2023 Ushering In pictures..."); }} style={linkStyle}>
              See more 2023 Ushering In pictures ›
            </a>
          </div>
        </div>

        {/* Section 3: Chapter Inauguration */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '1.75rem' }}>
            <h2 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '700', 
              color: '#000000',
              paddingBottom: '0.4rem', 
              borderBottom: '2px solid #000000', 
              whiteSpace: 'nowrap',
              margin: 0
            }}>
              Chapter Inauguration
            </h2>
            <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0', marginLeft: '0.5rem' }}></div>
          </div>

          {/* Grid of 6 */}
          <div style={gridStyle}>
            {PHOTOS_LIST.map((photo) => (
              <div 
                key={`inauguration-${photo.id}`} 
                style={imgContainerStyle} 
                onClick={() => setActivePhoto(photo)}
                className="gallery-photo-card"
              >
                <img src={photo.url} alt={photo.alt} style={imgStyle} />
              </div>
            ))}
          </div>

          {/* See more link */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <a href="#more-ushering-2" onClick={(e) => { e.preventDefault(); alert("Viewing more 2023 Ushering In pictures..."); }} style={linkStyle}>
              See more 2023 Ushering In pictures ›
            </a>
          </div>
        </div>

        {/* Pagination bar divided by line */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
          <button style={arrowButtonStyle} onClick={() => alert("Previous page")} aria-label="Previous page">‹</button>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.25rem 0.75rem', backgroundColor: '#ffffff', cursor: 'pointer' }}>
            <span style={{ fontSize: '0.85rem', color: '#000000', fontWeight: '500', marginRight: '0.5rem' }}>Page {currentPage}</span>
            <span style={{ fontSize: '0.6rem', color: '#64748b' }}>▼</span>
          </div>
          <button style={arrowButtonStyle} onClick={() => alert("Next page")} aria-label="Next page">›</button>
        </div>

      </div>

      {/* Awwwards Level Fullscreen Lightbox Modal */}
      {activePhoto && (
        <div 
          style={lightboxOverlayStyle} 
          onClick={() => setActivePhoto(null)}
          className="animate-fade-in"
        >
          {/* Close Button */}
          <button 
            onClick={() => setActivePhoto(null)} 
            style={lightboxCloseStyle}
            aria-label="Close Lightbox"
          >
            <X size={24} />
          </button>

          {/* Nav Controls */}
          <button onClick={handlePrevPhoto} style={lightboxPrevStyle} aria-label="Previous Image">
            <ChevronLeft size={36} />
          </button>
          <button onClick={handleNextPhoto} style={lightboxNextStyle} aria-label="Next Image">
            <ChevronRight size={36} />
          </button>

          {/* Main Photo Card Container */}
          <div 
            style={lightboxContentStyle} 
            onClick={(e) => e.stopPropagation()}
          >
            <img src={activePhoto.url} alt={activePhoto.alt} style={lightboxImgStyle} />
            <div style={lightboxCaptionStyle}>
              {activePhoto.alt}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gallery-photo-card {
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .gallery-photo-card:hover {
          transform: scale(1.03);
          box-shadow: 0 10px 25px rgba(0, 32, 96, 0.12);
        }
        .gallery-photo-card img {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .gallery-photo-card:hover img {
          transform: scale(1.06);
        }
      `}</style>
    </div>
  );
};

// Styles definitions
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '1.5rem',
  width: '100%'
};

const imgContainerStyle = {
  width: '100%',
  aspectRatio: '3 / 2',
  overflow: 'hidden',
  borderRadius: '6px',
  backgroundColor: '#f1f5f9',
  border: '1px solid #cbd5e1'
};

const imgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

const linkStyle = {
  fontSize: '0.85rem',
  fontWeight: '700',
  color: '#000000',
  textDecoration: 'none',
  fontFamily: 'var(--font-heading)',
  transition: 'opacity 0.2s'
};

const arrowButtonStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: '4px',
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#ffffff',
  color: '#64748b',
  cursor: 'pointer',
  fontSize: '1rem',
  lineHeight: 1
};

// Lightbox modal styling
const lightboxOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(10, 17, 65, 0.95)', // brand transparent navy
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem'
};

const lightboxCloseStyle = {
  position: 'absolute',
  top: '2rem',
  right: '2rem',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '50%',
  width: '44px',
  height: '44px',
  color: '#ffffff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.2s',
  zIndex: 1010
};

const lightboxPrevStyle = {
  position: 'absolute',
  left: '2rem',
  background: 'none',
  border: 'none',
  color: '#ffffff',
  cursor: 'pointer',
  padding: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.7,
  transition: 'opacity 0.2s, transform 0.2s'
};

const lightboxNextStyle = {
  position: 'absolute',
  right: '2rem',
  background: 'none',
  border: 'none',
  color: '#ffffff',
  cursor: 'pointer',
  padding: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.7,
  transition: 'opacity 0.2s, transform 0.2s'
};

const lightboxContentStyle = {
  position: 'relative',
  maxWidth: '900px',
  width: '100%',
  maxHeight: '75vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1.25rem',
  zIndex: 1005
};

const lightboxImgStyle = {
  maxWidth: '100%',
  maxHeight: '70vh',
  objectFit: 'contain',
  borderRadius: '8px',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
};

const lightboxCaptionStyle = {
  color: '#ffffff',
  fontSize: '1rem',
  fontWeight: '600',
  textAlign: 'center',
  fontFamily: 'var(--font-heading)',
  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
};

export default Gallery;
