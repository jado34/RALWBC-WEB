import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { dbService, GALLERY_CATEGORIES } from '../services/db';

export const Gallery = () => {
  const [photosList, setPhotosList] = useState([]);
  const [currentPage, setCurrentPage] = useState('01');
  const [activePhoto, setActivePhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dbService.init();
    dbService.getGalleryPhotos()
      .then(data => setPhotosList(data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  // Navigate lightbox images
  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    if (photosList.length === 0) return;
    const idx = photosList.findIndex(p => p.url === activePhoto.url);
    const prevIdx = (idx - 1 + photosList.length) % photosList.length;
    setActivePhoto(photosList[prevIdx]);
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    if (photosList.length === 0) return;
    const idx = photosList.findIndex(p => p.url === activePhoto.url);
    const nextIdx = (idx + 1) % photosList.length;
    setActivePhoto(photosList[nextIdx]);
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

        {/* Dynamic Photo Sections */}
        {isLoading ? (
          <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '40px', height: '40px', border: '3px solid rgba(10, 17, 65, 0.1)',
              borderTopColor: '#ca8a04', borderRadius: '50%',
              animation: 'spin 1s linear infinite', margin: '0 auto'
            }} />
            <p style={{ marginTop: '1.5rem', color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Loading gallery photos...</p>
          </div>
        ) : photosList.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b', margin: '2rem 0' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No photos available in the gallery yet.</p>
          </div>
        ) : (() => {
          const grouped = photosList.reduce((acc, photo) => {
            const cat = photo.category || 'General';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(photo);
            return acc;
          }, {});

          const orderedCategories = [...GALLERY_CATEGORIES];
          Object.keys(grouped).forEach(cat => {
            if (!orderedCategories.includes(cat)) {
              orderedCategories.push(cat);
            }
          });

          return orderedCategories.map((categoryName) => {
            const photos = grouped[categoryName] || [];
            if (photos.length === 0) return null;
            return (
              <div key={categoryName} style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '2rem' }}>
                  <h2 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '800', 
                    color: '#0a1141',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    paddingBottom: '0.5rem', 
                    borderBottom: '3px solid #ca8a04', 
                    whiteSpace: 'nowrap',
                    margin: 0,
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {categoryName}
                  </h2>
                  <div style={{ flex: 1, borderBottom: '1px solid rgba(10, 17, 65, 0.1)', marginLeft: '1rem' }}></div>
                </div>

                {/* Grid of photos */}
                <div style={gridStyle}>
                  {photos.map((photo) => (
                    <div 
                      key={`photo-${photo.id}`} 
                      style={imgContainerStyle} 
                      onClick={() => setActivePhoto(photo)}
                      className="gallery-photo-card"
                    >
                      <img src={photo.url} alt={photo.alt} style={imgStyle} />
                    </div>
                  ))}
                </div>
              </div>
            );
          });
        })()}

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
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .gallery-photo-card {
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
          border-radius: 16px;
        }
        .gallery-photo-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 35px rgba(10, 17, 65, 0.15);
        }
        .gallery-photo-card img {
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
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
  borderRadius: '16px',
  backgroundColor: '#f1f5f9',
  border: '1px solid rgba(10, 17, 65, 0.08)',
  boxShadow: '0 4px 20px rgba(10, 17, 65, 0.02)'
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
