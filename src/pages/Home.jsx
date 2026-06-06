import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RALogo } from '../components/Navbar';
import { Calendar, User, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { dbService } from '../services/db';

const CAROUSEL_SLIDES = [
  {
    id: 1,
    url: "/Lagos-West3.jpeg",
    caption: "LWBC Trophies",
    objectPosition: "center 15%"
  },
  {
    id: 2,
    url: "/671245412_18050382983733739_357892051856325748_n.jpg",
    caption: "Nigeria Baptist Convention in session Abuja 2026",
    objectPosition: "center 15%"
  }
];

export const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    dbService.init();
    setBlogs(dbService.getBlogs());
  }, []);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  return (
    <div className="light-theme" style={{ paddingBottom: '0' }}>

      {/* 1. Main Hero Carousel Banner (Animate Slide Up) */}
      <section className="container animate-slide-up delay-1" style={{ padding: '2rem 1.5rem', position: 'relative' }}>
        <div style={{
          position: 'relative',
          height: 'clamp(380px, 60vh, 580px)',
          width: '100%',
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <img
            src={CAROUSEL_SLIDES[currentSlide].url}
            alt="Royal Ambassadors Meet"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: CAROUSEL_SLIDES[currentSlide].objectPosition || 'center',
              transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
          {/* Slide overlay caption */}
          <div style={{
            position: 'absolute',
            bottom: '1.25rem',
            left: '1.5rem',
            backgroundColor: 'rgba(0,32,96,0.9)',
            color: 'white',
            padding: '0.5rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            borderRadius: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {CAROUSEL_SLIDES[currentSlide].caption}
          </div>

          {/* Prev/Next arrows bottom right */}
          <div style={{
            position: 'absolute',
            bottom: '1.25rem',
            right: '1.5rem',
            display: 'flex',
            gap: '0.5rem',
            zIndex: 5
          }}>
            <button
              onClick={handlePrevSlide}
              style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: 'none',
                width: '2.75rem',
                height: '2.75rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#002060',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="Previous Slide"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={handleNextSlide}
              style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: 'none',
                width: '2.75rem',
                height: '2.75rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#002060',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="Next Slide"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Conference Title & Intro Paragraph (Animate Fade In with Delay 2) */}
      <section className="container animate-slide-up delay-2" style={{
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem'
      }}>
        <h1 style={{
          color: '#002060',
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: '800',
          lineHeight: '1.15',
          letterSpacing: '-0.03em',
          fontFamily: 'var(--font-heading)'
        }}>
          The Royal Ambassadors,<br />
          Lagos West Baptist Conference.
        </h1>

        <p style={{
          maxWidth: '850px',
          color: '#475569',
          fontSize: '1.05rem',
          lineHeight: '1.75',
          margin: '0 auto'
        }}>
          The Royal Ambassadors of Nigeria (Lagos West Baptist Conference) is a department of the Baptist youth missionary organization. Anchored on our national vision: <strong>"Touching the lives of boys, impacting the eternity of men!"</strong>, we build boys and young men into well-informed, responsible followers of Christ.
        </p>

        <Link to="/about-us" className="btn btn-gold glow-gold" style={{ marginTop: '0.75rem', padding: '0.8rem 2.5rem', borderRadius: '30px' }}>
          About Us
        </Link>
      </section>

      {/* 3. Why Join The Mission Section (Grid Cards Lift on Hover & Zoom Image) */}
      <section className="container animate-slide-up delay-3" style={{ padding: '3rem 1.5rem 4rem', textAlign: 'center' }}>
        <div className="badge-gold" style={{ marginBottom: '3rem' }}>
          Why Join The Mission?
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          marginBottom: '2.5rem'
        }}>
          {/* Card 1 */}
          <div className="premium-card glow-navy" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', padding: '1.75rem', overflow: 'hidden' }}>
            <div style={imageWrapperStyle} className="zoom-wrapper">
              <img
                src="https://images.unsplash.com/photo-1489641493513-ba4ee84ccea9?w=600&auto=format&fit=crop&q=80"
                alt="Discipleship"
                style={cardImageStyle}
              />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#002060', fontWeight: '800', margin: 0 }}>Spiritual Discipleship</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '280px', height: '65px', overflow: 'hidden', lineHeight: '1.5' }}>
              Helping boys develop a personal saving relationship with Jesus Christ and training them to become well-informed followers.
            </p>
            <button className="btn btn-navy btn-sm" onClick={() => navigate('/about-us')}>Read More</button>
          </div>

          {/* Card 2 */}
          <div className="premium-card glow-navy" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', padding: '1.75rem', overflow: 'hidden' }}>
            <div style={imageWrapperStyle} className="zoom-wrapper">
              <img
                src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&auto=format&fit=crop&q=80"
                alt="Leadership"
                style={cardImageStyle}
              />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#002060', fontWeight: '800', margin: 0 }}>Leadership Training</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '280px', height: '65px', overflow: 'hidden', lineHeight: '1.5' }}>
              Promoting personal and corporate discipline, orderliness, character development, and enabling potentiality.
            </p>
            <button className="btn btn-navy btn-sm" onClick={() => navigate('/about-us')}>Our Page</button>
          </div>

          {/* Card 3 */}
          <div className="premium-card glow-navy" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', padding: '1.75rem', overflow: 'hidden' }}>
            <div style={imageWrapperStyle} className="zoom-wrapper">
              <img
                src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80"
                alt="Education"
                style={cardImageStyle}
              />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#002060', fontWeight: '800', margin: 0 }}>Quiz & Mission</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '280px', height: '65px', overflow: 'hidden', lineHeight: '1.5' }}>
              Equipping boys for mission action, social responsiveness, denominational commitment, and scripture studies.
            </p>
            <button className="btn btn-navy btn-sm" onClick={() => navigate('/register')}>Register</button>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container" style={{ borderBottom: '1px solid #e2e8f0', margin: '2rem auto' }}></div>

      {/* 4. Blog Section */}
      <section className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="badge-gold" style={{ marginBottom: '3.5rem' }}>
          Latest News
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', textAlign: 'left' }}>
          {/* Row 1 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '4rem',
            alignItems: 'center'
          }} className="responsive-row">
            <div>
              <p style={{ fontSize: '1rem', color: '#475569', lineHeight: '1.75', marginBottom: '2rem' }}>
                Our weekly devotionals and scripture breakdowns help candidates stay spiritually fit. We explore the deep doctrines of Christian faith, the role of ambassadors in society, and guidelines on RA ranks.
              </p>
              <button className="btn btn-navy" onClick={() => navigate('/blogs')}>View Blogs</button>
            </div>
            <div className="premium-card glow-navy" style={{ height: '260px', overflow: 'hidden', padding: 0 }}>
              <img
                src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80"
                alt="Ambassadors Podium"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                className="zoom-image"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr',
            gap: '4rem',
            alignItems: 'center'
          }} className="responsive-row reverse-row">
            <div className="premium-card glow-navy" style={{ height: '260px', overflow: 'hidden', padding: 0 }}>
              <img
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80"
                alt="Ambassadors Parade"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                className="zoom-image"
              />
            </div>
            <div>
              <p style={{ fontSize: '1rem', color: '#475569', lineHeight: '1.75', marginBottom: '2rem' }}>
                Annual camp meets host regional drill competitions, uniform parades, and leadership campfires. Read summaries of our achievements, honors, and drill results from Lagos West Conference.
              </p>
              <button className="btn btn-navy" onClick={() => navigate('/blogs')}>Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Gallery Grid Section */}
      <section className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="badge-gold" style={{ marginBottom: '3.5rem' }}>
          Conference Gallery
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          <div className="premium-card glow-gold" style={{ height: '260px', overflow: 'hidden', padding: 0 }}>
            <img src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&auto=format&fit=crop&q=80" alt="RA Group" style={galleryImgStyle} className="zoom-image" />
          </div>
          <div className="premium-card glow-gold" style={{ height: '260px', overflow: 'hidden', padding: 0 }}>
            <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80" alt="RA Singing" style={galleryImgStyle} className="zoom-image" />
          </div>
          <div className="premium-card glow-gold" style={{ height: '260px', overflow: 'hidden', padding: 0 }}>
            <img src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&auto=format&fit=crop&q=80" alt="RA Parade Line" style={galleryImgStyle} className="zoom-image" />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container" style={{ borderBottom: '1px solid #e2e8f0', margin: '2rem auto' }}></div>

      {/* 6. Announcements Section */}
      <section className="container animate-slide-up" style={{ padding: '4.5rem 1.5rem', textAlign: 'center' }}>
        <div className="badge-gold" style={{ marginBottom: '3.5rem' }}>
          Announcements
        </div>

        <div className="premium-card glow-gold" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          maxWidth: '650px',
          margin: '0 auto',
          padding: '3rem 2rem',
          backgroundColor: '#ffffff'
        }}>
          {/* Big Circular Logo */}
          <div className="animate-float">
            <RALogo size={140} />
          </div>

          <h2 style={{
            fontSize: '1.8rem',
            color: '#002060',
            fontWeight: '800',
            marginTop: '0.5rem',
            lineHeight: '1.35',
            fontFamily: 'var(--font-heading)'
          }}>
            The Senior Royal Ambassadors Exam<br />
            Coming up December
          </h2>

          <button className="btn btn-navy" style={{ padding: '0.75rem 2.5rem' }} onClick={() => navigate('/blogs')}>Read More</button>
        </div>
      </section>

      {/* 7. Portal Action Section (Out-of-Phase Floating Logos) */}
      <section className="container" style={{ padding: '4.5rem 1.5rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }} className="responsive-row">
        <div>
          <h2 style={{ fontSize: '2.2rem', color: '#002060', fontWeight: '800', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
            RALWBC Online Examination Center
          </h2>
          <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.75', marginBottom: '2rem' }}>
            Registered Royal Ambassador candidates can access their secured quiz room. Log in with your unique credentials to write the annual Ranking Exam. Ensure you study the materials and manual resources beforehand.
          </p>
        </div>
        <div className="premium-card glow-navy" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2.5rem',
          width: '100%',
          padding: '3.5rem 2.5rem',
          backgroundColor: '#ffffff'
        }}>
          {/* Dual Emblem Logos (RA & Conference) Floating out of Phase */}
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <img
              src="/logo.png"
              alt="Royal Ambassadors Logo"
              style={{ width: '130px', height: '130px', objectFit: 'contain' }}
              className="animate-float"
            />
            <img
              src="/lwbc-logo.png"
              alt="Lagos West Conference Logo"
              style={{ width: '130px', height: '130px', objectFit: 'contain', animationDelay: '1.5s' }}
              className="animate-float"
            />
          </div>

          <button
            onClick={() => navigate('/login')}
            style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              padding: '0.9rem 3.5rem',
              backgroundColor: '#0a1141',
              color: '#ffffff',
              borderRadius: '30px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(10, 17, 65, 0.25)'
            }}
            className="btn-gold"
          >
            Click here to begin
          </button>
        </div>
      </section>

      {/* 8. King's Business Section */}
      <section style={{ backgroundColor: '#edf2f7', padding: '4.5rem 1.5rem', marginTop: '4rem', borderTop: '1px solid #cbd5e1' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ color: '#002060', fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>The King's Business</h2>
          <p style={{
            color: '#1e293b',
            fontStyle: 'italic',
            fontSize: '1.15rem',
            lineHeight: '1.85',
            fontWeight: '600'
          }}>
            "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost: Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world. Amen."
          </p>
          <span style={{ fontWeight: '700', color: '#ca8a04', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Matthew 28:19-20
          </span>
        </div>
      </section>

      {/* Premium styles embedding */}
      <style>{`
        @media (max-width: 768px) {
          .responsive-row {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .reverse-row {
            display: flex;
            flex-direction: column-reverse;
          }
        }
        
        /* Zoom wrappers */
        .zoom-wrapper {
          overflow: hidden;
          width: 100%;
        }
        
        .premium-card:hover .zoom-image,
        .premium-card:hover .card-img {
          transform: scale(1.06) rotate(0.5deg) !important;
        }
      `}</style>
    </div>
  );
};

// Auxiliary style objects
const imageWrapperStyle = {
  width: '100%',
  height: '240px',
  overflow: 'hidden',
  borderRadius: '8px',
  backgroundColor: '#f1f5f9'
};

const cardImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  transformOrigin: 'center'
};

const galleryImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
};

export default Home;
