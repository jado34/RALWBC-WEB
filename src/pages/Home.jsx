import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown, ArrowRight, Shield, BookOpen, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { dbService } from '../services/db';

// ─── Hero Slides ─────────────────────────────────────────────────────────────
const SLIDES = [
  { url: '/Lagos-West3.jpeg', position: 'center 20%' },
  { url: '/671245412_18050382983733739_357892051856325748_n.jpg', position: 'center 15%' },
  { url: '/Lagos-West1.jpeg', position: 'center 25%' },
];

// ─── Stats Data ───────────────────────────────────────────────────────────────
const STATS = [
  { end: 16, label: 'LWBC ASSOCIATIONS', prefix: '' },
  { end: 11, label: 'RA RANKS', prefix: '' },
];


// ─── Animated Counter Component ───────────────────────────────────────────────
const AnimatedCounter = ({ end, prefix = '', animate }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!animate) return;
    let start = null;
    const duration = 2000;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(end);
    };
    requestAnimationFrame(step);
  }, [animate, end]);
  return <>{prefix}{animate ? count.toLocaleString() : '0'}</>;
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const Home = () => {
  const [slide, setSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();
  const statsRef = useRef(null);

  useEffect(() => {
    dbService.init();
    dbService.getBlogs().then(data => setBlogs(data));
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Auto-advance slides every 6s
  useEffect(() => {
    const iv = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 6000);
    return () => clearInterval(iv);
  }, []);

  // Intersection Observer for stats
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Transition helpers
  const kin = (delay, dir = -1) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? 'translateX(0)' : `translateX(${dir * 80}px)`,
    transition: `opacity 1s ease ${delay}s, transform 1.1s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });
  const fade = (delay) => ({
    opacity: loaded ? 1 : 0,
    transition: `opacity 0.9s ease ${delay}s`,
  });

  return (
    <div style={{ paddingBottom: 0, backgroundColor: '#fff' }}>

      {/* ════════════════════════════════════════════════════════════════════
          1. HERO — Full Viewport, Immersive
          ════════════════════════════════════════════════════════════════════ */}
      <section className="hero-section" style={{ position: 'relative', width: '100%', height: '100vh', minHeight: '640px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>

        {/* Background Images */}
        {SLIDES.map((s, i) => (
          <img
            key={i}
            src={s.url}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: s.position,
              opacity: i === slide ? 1 : 0,
              transition: 'opacity 1.8s cubic-bezier(0.16,1,0.3,1)',
              zIndex: 1,
            }}
          />
        ))}

        {/* Cinematic Overlay — bottom navy fade */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to top, #0a1141 0%, rgba(10,17,65,0.78) 30%, rgba(10,17,65,0.25) 65%, rgba(0,0,0,0.15) 100%)' }} />
        {/* Left vignette for content area */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(105deg, rgba(10,17,65,0.55) 0%, transparent 55%)' }} />
        {/* Grain texture */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', opacity: 0.045,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat', backgroundSize: '200px 200px',
        }} />

        {/* Hero Content */}
        <div className="hero-content" style={{ position: 'relative', zIndex: 4, width: '100%', maxWidth: '1280px', margin: '0 auto', padding: 'clamp(2rem,5vw,5rem)', paddingBottom: 'clamp(5rem,10vh,8rem)' }}>

          {/* Gold badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', maxWidth: '100%', ...fade(0.1) }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff', flexShrink: 0 }} />
            <span style={{ color: '#ffffff', fontSize: 'clamp(0.85rem, 1.7vw, 1.9rem)', fontWeight: '800', letterSpacing: 'clamp(0.04em,0.16vw,0.16em)', textTransform: 'uppercase', lineHeight: 1.35 }}>
              Royal Ambassadors Lagos West Baptist Conference
            </span>
          </div>

          {/* Kinetic Headline — 4 lines alternating white/gold, left/right */}
          <div style={{ marginBottom: 'clamp(1.5rem,4vw,3rem)' }}>
            {[
              { text: 'TOUCHING THE', color: '#ffffff', dir: -1, delay: 0.15 },
              { text: 'LIVES OF BOYS,', color: '#ca8a04', dir: 1, delay: 0.35 },
              { text: 'IMPACTING THE', color: '#ffffff', dir: -1, delay: 0.55 },
              { text: 'ETERNITY OF MEN.', color: '#ca8a04', dir: 1, delay: 0.75 },
            ].map(({ text, color, dir, delay }) => (
              <div key={text} style={{ overflow: 'hidden' }}>
                <h1 style={{
                  margin: 0,
                  fontSize: 'clamp(1.8rem,7.5vw,6.5rem)',
                  fontWeight: '900',
                  color,
                  lineHeight: 0.93,
                  letterSpacing: '-0.035em',
                  fontFamily: 'var(--font-heading)',
                  ...kin(delay, dir),
                  display: 'block',
                }}>
                  {text}
                </h1>
              </div>
            ))}
          </div>

          {/* RA Motto — 2 Corinthians 5:20 */}
          <div style={{ marginBottom: '2rem', ...fade(1.05) }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'clamp(1.1rem,2vw,1.35rem)', fontWeight: '600', fontStyle: 'italic', maxWidth: '480px', lineHeight: 1.5, margin: '0 0 0.5rem' }}>
              "We are ambassadors for Christ."
            </p>
            <span style={{ color: '#ca8a04', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              2 Corinthians 5:20 · RA Motto
            </span>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', ...fade(1.2) }}>
            <button
              onClick={() => navigate('/login')}
              className="hero-cta-primary"
              style={{ padding: '0.9rem 2.25rem', backgroundColor: '#ca8a04', color: '#fff', border: 'none', borderRadius: '3px', fontWeight: '700', fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#a16207'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ca8a04'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Join The Mission
            </button>
            <button
              onClick={() => navigate('/about-us')}
              style={{ padding: '0.9rem 2.25rem', backgroundColor: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.45)', borderRadius: '3px', fontWeight: '600', fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'border-color 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ca8a04'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Learn More <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Slide dots — bottom right */}
        <div style={{ position: 'absolute', bottom: '2rem', right: '2.5rem', zIndex: 5, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Slide ${i + 1}`}
              style={{ width: i === slide ? '28px' : '8px', height: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', padding: 0, backgroundColor: i === slide ? '#ca8a04' : 'rgba(255,255,255,0.35)', transition: 'all 0.4s ease' }}
            />
          ))}
        </div>

        {/* Scroll indicator — center bottom */}
        <div style={{ position: 'absolute', bottom: '1.75rem', left: '50%', transform: 'translateX(-50%)', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', ...fade(1.8) }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ animation: 'bounceDown 1.6s infinite ease-in-out' }}>
            <ChevronDown size={16} color="rgba(255,255,255,0.5)" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          2. STATS STRIP — Dark Navy Band
          ════════════════════════════════════════════════════════════════════ */}
      <section ref={statsRef} style={{ backgroundColor: '#0a1141', borderBottom: '1px solid rgba(202,138,4,0.25)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap' }}>
          {STATS.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ flex: 1, minWidth: '140px', textAlign: 'center', padding: '2.25rem 1.5rem' }}>
                <div style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: '900', color: '#ca8a04', fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  <AnimatedCounter end={s.end} prefix={s.prefix} animate={statsVisible} />
                </div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: '700', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '0.5rem' }}>
                  {s.label}
                </div>
              </div>
              {i < STATS.length - 1 && (
                <div style={{ width: '1px', backgroundColor: 'rgba(202,138,4,0.2)', margin: '1.5rem 0', flexShrink: 0, alignSelf: 'stretch' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          3. CONFERENCE INTRO — Editorial
          ════════════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#fff', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,4rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 'clamp(3rem,6vw,7rem)', alignItems: 'center' }} className="responsive-row">
          {/* Left: text */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '32px', height: '2px', backgroundColor: '#ca8a04' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ca8a04' }}>Who We Are</span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3.25rem)', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
              A Baptist Missionary<br />Organization for Boys.
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
              The Royal Ambassadors of Nigeria (Lagos West Baptist Conference) anchors boys and young men — ages 10 to 24 — in scripture, service, and mission action.
            </p>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              From Junior RA (10–12) through Intermediate (13–16) to Senior RA (17–24), every rank equips members for a Christ-centred life and global mission.
            </p>
            <Link to="/about-us" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#0a1141', fontWeight: '700', fontSize: '0.88rem', letterSpacing: '0.06em', textDecoration: 'none', textTransform: 'uppercase', borderBottom: '2px solid #ca8a04', paddingBottom: '2px', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ca8a04'}
              onMouseLeave={e => e.currentTarget.style.color = '#0a1141'}
            >
              Our Full Story <ArrowRight size={15} />
            </Link>
          </div>

          {/* Right: image */}
          <div style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden', height: 'clamp(320px,45vw,520px)' }}>
            <img src="/Lagos-West3.jpeg" alt="RALWBC Conference" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%', transition: 'transform 0.7s ease' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
            {/* Gold accent bar */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundColor: '#ca8a04' }} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          4. MISSION PILLARS — 3 Editorial Cards
          ════════════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#f8fafc', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,4rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '32px', height: '2px', backgroundColor: '#ca8a04' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ca8a04' }}>Our Mission</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.75rem)', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0 }}>
                Why Join The Mission?
              </h2>
            </div>
            <button onClick={() => navigate('/about-us')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'transparent', border: '1.5px solid #0a1141', color: '#0a1141', borderRadius: '3px', padding: '0.7rem 1.5rem', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#0a1141'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#0a1141'; }}
            >
              Learn More <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.5px', backgroundColor: '#e2e8f0', border: '1.5px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            {[
              { icon: <BookOpen size={26} color="#ca8a04" />, title: 'Spiritual Discipleship', body: 'Helping boys develop a personal saving relationship with Jesus Christ and training them to become well-informed followers through structured Bible studies and devotionals.', img: '/Lagos-West3.jpeg', imgPos: 'center 20%', link: '/about-us' },
              { icon: <Shield size={26} color="#ca8a04" />, title: 'Leadership Training', body: 'Promoting personal and corporate discipline, orderliness, character development, and enabling potentiality. We build boys into strong leaders and Christian role models.', img: '/671245412_18050382983733739_357892051856325748_n.jpg', imgPos: 'center 15%', link: '/about-us' },
              { icon: <Users size={26} color="#ca8a04" />, title: 'Mission & Service', body: 'Equipping boys for physical and spiritual mission activities and outreaches — scripture studies, ranking exams, community service, and annual camp meets.', img: '/Lagos-West1.jpeg', imgPos: 'center 30%', link: '/login' },
            ].map((card, i) => (
              <div key={i} className="mission-pillar-card" style={{ backgroundColor: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'box-shadow 0.3s' }}>
                <div style={{ height: '220px', overflow: 'hidden' }}>
                  <img src={card.img} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: card.imgPos || 'center', transition: 'transform 0.7s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {card.icon}
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0a1141' }}>{card.title}</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: 1.7, flex: 1 }}>{card.body}</p>
                  <button onClick={() => navigate(card.link)} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: '#ca8a04', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', padding: 0, marginTop: '0.25rem' }}>
                    Read More <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          5. GALLERY PREVIEW — Asymmetric Bento
          ════════════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#fff', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,4rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '32px', height: '2px', backgroundColor: '#ca8a04' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ca8a04' }}>Gallery</span>
              </div>
              <h2 style={{ margin: 0, fontSize: 'clamp(1.8rem,3.5vw,2.75rem)', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                Conference Moments
              </h2>
            </div>
            <button onClick={() => navigate('/gallery')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#0a1141', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', borderBottom: '2px solid #ca8a04', paddingBottom: '2px' }}>
              View All <ArrowRight size={14} />
            </button>
          </div>

          {/* Bento grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: '1fr 1fr', gap: '6px', height: 'clamp(320px,50vw,520px)', borderRadius: '6px', overflow: 'hidden' }}>
            {/* Large left tile */}
            <div style={{ gridRow: '1 / 3', overflow: 'hidden', position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/gallery')}>
              <img src="/Lagos-West3.jpeg" alt="Conference" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', transition: 'transform 0.7s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,17,65,0.5) 0%, transparent 50%)' }} />
              <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', color: '#fff', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                LWBC Conference
              </div>
            </div>

            {/* Top right */}
            <div style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate('/gallery')}>
              <img src="/671245412_18050382983733739_357892051856325748_n.jpg" alt="NBC Abuja" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%', transition: 'transform 0.7s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>
            {/* Bottom right */}
            <div style={{ overflow: 'hidden', cursor: 'pointer', position: 'relative', backgroundColor: '#0a1141' }} onClick={() => navigate('/gallery')}>
              <img src="/Lagos-West1.jpeg" alt="LWBC" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', opacity: 0.8, transition: 'opacity 0.4s, transform 0.7s ease' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.transform = 'scale(1)'; }}
              />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ color: '#ca8a04', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>View Gallery →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          6. PORTAL CTA — Dark Section
          ════════════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#0a1141', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,4rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'clamp(3rem,5vw,6rem)', alignItems: 'center' }} className="responsive-row">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '32px', height: '2px', backgroundColor: '#ca8a04' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ca8a04' }}>Exam Portal</span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: '900', color: '#ffffff', fontFamily: 'var(--font-heading)', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
              RALWBC Online<br />Examination Center
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              Registered Royal Ambassador candidates can access their secured exam room. Log in with your unique credentials to write the senior ranking exam.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{ padding: '0.95rem 2.5rem', backgroundColor: '#ca8a04', color: '#fff', border: 'none', borderRadius: '3px', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#a16207'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ca8a04'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Click Here To Begin
            </button>
          </div>

          {/* Dual floating logos */}
          <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <img src="/logo.png" alt="Royal Ambassadors Logo" style={{ width: 'clamp(100px,14vw,150px)', objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))' }} className="animate-float" />
            <div style={{ width: '1px', height: '80px', backgroundColor: 'rgba(202,138,4,0.3)', flexShrink: 0 }} />
            <img src="/lwbc-logo.png" alt="Lagos West Conference Logo" style={{ width: 'clamp(100px,14vw,150px)', objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))', animationDelay: '1.5s' }} className="animate-float" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          7. KING'S BUSINESS — Scripture
          ════════════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#f8fafc', padding: 'clamp(4.5rem,9vw,8rem) clamp(1.5rem,5vw,4rem)', borderTop: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative gold lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, transparent, #ca8a04, transparent)' }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <div style={{ width: '32px', height: '2px', backgroundColor: '#ca8a04' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ca8a04' }}>The King's Business</span>
            <div style={{ width: '32px', height: '2px', backgroundColor: '#ca8a04' }} />
          </div>

          <blockquote style={{ margin: '0 0 1.5rem', padding: 0, border: 'none' }}>
            <p style={{ fontSize: 'clamp(1.1rem,2.2vw,1.4rem)', fontStyle: 'italic', color: '#1e293b', lineHeight: 1.85, fontWeight: '500', marginBottom: '1.5rem' }}>
              "Go ye therefore, and make disciples of all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost: Teaching them to obey everything I have commanded you: and, surely I will be with you, even unto the end of the age."
            </p>
          </blockquote>

          <span style={{ display: 'inline-block', fontWeight: '800', color: '#ca8a04', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', borderTop: '2px solid #ca8a04', paddingTop: '0.75rem' }}>
            Matthew 28:19-20
          </span>
        </div>
      </section>

      {/* Inline styles */}
      <style>{`
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        @media (max-width: 768px) {
          .hero-section {
            align-items: center !important;
            height: auto !important;
            min-height: 80vh !important;
            padding: 4rem 0 !important;
          }
          .hero-content {
            padding: 2rem !important;
          }
          .responsive-row {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
        @media (max-width: 576px) {
          .mission-pillar-card { min-width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Home;
