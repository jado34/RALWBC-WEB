import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Heart, Shield } from 'lucide-react';

// ─── RA Rank tiers ────────────────────────────────────────────────────────────
const RANKS = [
  { label: 'Junior RA', ages: '10 – 12', desc: 'Foundational Christian education plans. Introducing boys to scripture, prayer, and the mission of Royal Ambassadors.', color: '#0a1141' },
  { label: 'Intermediate RA', ages: '13 – 16', desc: 'Basic discipleship plans for secondary school-age boys. Building habits of faith, study, and community service.', color: '#ca8a04' },
  { label: 'Senior RA', ages: '17 – 24', desc: 'Solid mission education and action plans. Preparing young men for leadership, outreach, and lifelong ambassadorship.', color: '#065f46' },
];

// ─── 7 Cardinal Objectives ───────────────────────────────────────────────────
const OBJECTIVES = [
  { n: '01', title: 'Spiritual Development', body: 'Helping boys in personal spiritual development and discipleship journey.' },
  { n: '02', title: 'Educational Growth', body: 'Ensuring structural educational and career advancement of our members.' },
  { n: '03', title: 'Discipline', body: 'Promoting personal and corporate discipline, physical alertness, and group cohesion.' },
  { n: '04', title: 'Potentiality', body: "Enabling members' personality development, discovering talents, and restoring dignity." },
  { n: '05', title: 'Mission Action', body: 'Equipping our members for physical and spiritual mission activities and outreaches.' },
  { n: '06', title: 'Social Awareness', body: 'Promoting social awareness, civic responsibility, and active responsiveness to community needs.' },
  { n: '07', title: 'Commitment', body: 'Promoting stewardship of life, churchmanship, denominational interest, and Baptist practices.' },
];

// ─── RA Pledge items ─────────────────────────────────────────────────────────
const PLEDGE = [
  'To become a well-informed, responsible follower of Christ;',
  'To have a Christ-like concern for all people;',
  'To learn how the message of Christ is carried around the world;',
  'To work with others in sharing Christ; and',
  'To keep myself clean and healthy in mind and body.',
];

// ─── Core Anchors ────────────────────────────────────────────────────────────
const ANCHORS = [
  { icon: <BookOpen size={28} color="#ca8a04" />, title: 'Bible Discipleship', body: 'Anchoring our youths in scripture study, doctrinal clarity, and quiz championships to foster deep biblical literacy.' },
  { icon: <Users size={28} color="#ca8a04" />, title: 'Leadership & Fraternity', body: 'Building boys into strong leaders, mentors, and ambassadors. Promoting accountability and Christian brotherhood.' },
  { icon: <Heart size={28} color="#ca8a04" />, title: 'Missions & Service', body: 'Conducting community outreaches, visiting local assemblies, and serving humanity as a testament to the love of Christ.' },
  { icon: <Shield size={28} color="#ca8a04" />, title: 'Character & Discipline', body: 'Cultivating integrity, orderliness, and personal discipline — the hallmarks of a true Royal Ambassador.' },
];

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel = ({ text }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
    <div style={{ width: '32px', height: '2px', backgroundColor: '#ca8a04', flexShrink: 0 }} />
    <span style={{ color: '#ca8a04', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.22em', textTransform: 'uppercase' }}>{text}</span>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
export const About = () => {
  const [loaded, setLoaded] = useState(false);
  const [objVisible, setObjVisible] = useState(false);
  const objRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = objRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setObjVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const fade = (delay = 0) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.9s ease ${delay}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

      {/* ════════════════════════════════════════════════════════════════════
          1. HERO — Dark Navy Full-Width
          ════════════════════════════════════════════════════════════════════ */}
      <section style={{
        backgroundColor: '#0a1141', position: 'relative', overflow: 'hidden',
        padding: 'clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem) clamp(3rem,6vw,5rem)',
      }}>
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(rgba(202,138,4,0.05) 1px,transparent 1px),
            linear-gradient(90deg,rgba(202,138,4,0.05) 1px,transparent 1px)`,
          backgroundSize: '56px 56px',
        }} />
        {/* Photo background — right half bleed */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: 'clamp(200px,40%,520px)',
          backgroundImage: 'url("/Lagos-West3.jpeg")',
          backgroundSize: 'cover', backgroundPosition: 'center 20%',
          opacity: 0.12, pointerEvents: 'none',
          maskImage: 'linear-gradient(to right, transparent 0%, black 60%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 60%)',
        }} />
        {/* Gold top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right,transparent,#ca8a04,transparent)' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={fade(0.1)}>
            <SectionLabel text="Who We Are" />
          </div>
          <h1 style={{
            color: '#ffffff', margin: '0 0 1.5rem',
            fontSize: 'clamp(2.8rem,7vw,6rem)',
            fontWeight: '900', fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.035em', lineHeight: 0.95,
            maxWidth: '720px',
            ...fade(0.2),
          }}>
            ABOUT<br /><span style={{ color: '#ca8a04' }}>RALWBC.</span>
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 'clamp(0.95rem,1.5vw,1.05rem)',
            maxWidth: '560px', lineHeight: 1.8, margin: '0 0 2.5rem',
            ...fade(0.35),
          }}>
            Royal Ambassadors is a Baptist worldwide missionary organization for boys aged 10–24 — found on every continent where Baptists gather, we are ambassadors for Christ 2 CORINTHIANS 5:20.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', ...fade(0.5) }}>
            <Link to="/officers" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.85rem 2rem', backgroundColor: '#ca8a04', color: '#fff',
              borderRadius: '3px', fontWeight: '700', fontSize: '0.82rem',
              letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none',
              transition: 'background 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#a16207'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ca8a04'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Meet Our Officers <ArrowRight size={14} />
            </Link>
            <Link to="/gallery" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.85rem 2rem', backgroundColor: 'transparent', color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: '3px',
              fontWeight: '600', fontSize: '0.82rem', letterSpacing: '0.1em',
              textTransform: 'uppercase', textDecoration: 'none',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ca8a04'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              View Gallery <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          2. HISTORY — Editorial Two-Column
          ════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,4rem)', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 'clamp(2.5rem,5vw,6rem)', alignItems: 'start' }} className="about-two-col">
          {/* Sticky left label */}
          <div style={{ position: 'sticky', top: '6rem' }}>
            <SectionLabel text="Our History" />
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 1.5rem' }}>
              A Legacy<br />Since 1908.
            </h2>
            {/* Photo */}
            <div style={{ borderRadius: '4px', overflow: 'hidden', position: 'relative', height: 'clamp(200px,30vw,320px)', marginTop: '1rem' }}>
              <img src="/Lagos-West1.jpeg" alt="RALWBC Conference" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,17,65,0.5) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', color: '#fff', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Lagos West Baptist Conference
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: '#ca8a04' }} />
            </div>
          </div>

          {/* Right: 3 text blocks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {[
              {
                tag: 'Global Reach',
                text: 'Royal Ambassadors is the name of a Baptist worldwide missionary organization for boys between the ages of 10 and 24 – an international organization found in many countries of the world, wherever there are Baptists. It is found on the continents of Africa, Asia, Australia, Europe, North America, and South America.',
              },
              {
                tag: 'Nigeria Chapter',
                text: 'The organization in Nigeria is called Royal Ambassadors of Nigeria (RAN). In its mission education and ministry plan, RAN has a foundational Christian education plan for Junior RA, boys between the ages of 10 and 12; basic discipleship plans for Intermediate RA, boys from age 13 to 16 (or secondary school age); and solid mission education and action plans for Senior RA, who are boys within the ages of 17 and 24.',
              },
              {
                tag: 'The Journey',
                text: "The vision and work of Royal Ambassadors started in the United States of America in 1908 among the brotherhood commission of the Southern Baptist Convention, USA; and came to Nigeria as one of the world's leading organizations for boys through the SBC missionaries in the 1920s. The Women's Missionary Union sponsored the organization from the beginning until 1954, when it was proposed that the men of the Nigerian Baptist Convention should take over the boys' work. This led to the proposal of the Men and Boys Department in 1961, which later became the defunct Men's Missionary Union and Youth Department, now known as the Missionary Organizations Department since 1998. Royal Ambassadors National Executive Committee (RANEC) comprises all elected national officers of the organization only; while the National Executive Council (NEC) includes all Conference RA Directors.",
              },
            ].map(({ tag, text }, i) => (
              <div key={i} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                <span style={{ display: 'inline-block', color: '#ca8a04', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
                  {tag}
                </span>
                <p style={{ color: '#475569', fontSize: 'clamp(0.9rem,1.4vw,1rem)', lineHeight: 1.85, margin: 0 }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          3. RANK TIERS — Full Width Bento
          ════════════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#f8fafc', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,4rem)', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
            <SectionLabel text="Membership Ranks" />
            <h2 style={{ margin: 0, fontSize: 'clamp(1.8rem,3.5vw,2.75rem)', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
              Three Stages of Growth
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.5px', backgroundColor: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            {RANKS.map((rank, i) => (
              <div key={i} style={{ backgroundColor: '#fff', padding: '2.5rem 2rem', position: 'relative', transition: 'background-color 0.25s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fefce8'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
              >
                {/* Coloured top border */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: rank.color }} />
                {/* Number */}
                <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'rgba(10,17,65,0.07)', fontFamily: 'var(--font-heading)', lineHeight: 1, marginBottom: '1rem', letterSpacing: '-0.04em' }}>
                  0{i + 1}
                </div>
                <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', fontWeight: '800', color: '#0a1141', fontFamily: 'var(--font-heading)' }}>
                  {rank.label}
                </h3>
                <div style={{ display: 'inline-block', backgroundColor: rank.color, color: '#fff', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.2rem 0.65rem', borderRadius: '2px', marginBottom: '1rem' }}>
                  Ages {rank.ages}
                </div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem', lineHeight: 1.7 }}>
                  {rank.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          4. VISION & PLEDGE — Split Dark / Light
          ════════════════════════════════════════════════════════════════════ */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="about-split">
        {/* Left: Vision — dark */}
        <div style={{ backgroundColor: '#0a1141', padding: 'clamp(3.5rem,7vw,6rem) clamp(1.5rem,5vw,4rem)' }}>
          <SectionLabel text="Our Vision" />
          <blockquote style={{ margin: '0 0 2rem', padding: 0, border: 'none' }}>
            <p style={{ fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: '800', color: '#ffffff', fontFamily: 'var(--font-heading)', lineHeight: 1.25, letterSpacing: '-0.02em', fontStyle: 'italic' }}>
              "Touching the lives of boys, impacting the eternity of men!"
            </p>
          </blockquote>
          <div style={{ borderTop: '1px solid rgba(202,138,4,0.3)', paddingTop: '1.75rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1rem' }}>Mission Declarations</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                'To become a well-informed, responsible follower of Christ.',
                'To carry the message of Christ around the world.',
                'To have a Christ-like concern for all people.',
                'To work with others in sharing Christ.',
                'To keep oneself clean and healthy in mind and body.',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ca8a04', marginTop: '0.45rem', flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Pledge — light */}
        <div style={{ backgroundColor: '#fefce8', padding: 'clamp(3.5rem,7vw,6rem) clamp(1.5rem,5vw,4rem)', borderLeft: '3px solid #ca8a04' }}>
          <SectionLabel text="The RA Pledge" />
          <p style={{ color: '#0a1141', fontSize: 'clamp(1rem,1.8vw,1.2rem)', fontWeight: '700', fontStyle: 'italic', margin: '0 0 2rem', lineHeight: 1.5 }}>
            "As a Royal Ambassador I will do my best:"
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {PLEDGE.map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', borderBottom: i < PLEDGE.length - 1 ? '1px solid rgba(202,138,4,0.2)' : 'none', paddingBottom: i < PLEDGE.length - 1 ? '1.25rem' : '0' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '900', color: '#ca8a04', letterSpacing: '0.08em', minWidth: '24px', marginTop: '0.15rem', fontFamily: 'var(--font-heading)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ color: '#1e293b', fontSize: '0.92rem', lineHeight: 1.65 }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          5. 7 CARDINAL OBJECTIVES — Numbered Editorial Grid
          ════════════════════════════════════════════════════════════════════ */}
      <section ref={objRef} style={{ backgroundColor: '#fff', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,4rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
            <div>
              <SectionLabel text="Cardinal Objectives" />
              <h2 style={{ margin: 0, fontSize: 'clamp(1.8rem,3.5vw,2.75rem)', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                7 Pillars of the<br />Royal Ambassadors
              </h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.5px', backgroundColor: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            {OBJECTIVES.map((obj, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#fff', padding: '2rem 1.75rem',
                  opacity: objVisible ? 1 : 0,
                  transform: objVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.6s ease ${i * 0.07}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s`,
                  position: 'relative',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', backgroundColor: '#0a1141', transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.35s ease' }}
                  className="obj-hover-bar" />
                <div style={{ fontSize: 'clamp(2.5rem,4vw,3.5rem)', fontWeight: '900', color: 'rgba(10,17,65,0.06)', fontFamily: 'var(--font-heading)', lineHeight: 1, letterSpacing: '-0.04em', marginBottom: '0.75rem' }}>
                  {obj.n}
                </div>
                <h3 style={{ margin: '0 0 0.6rem', fontSize: '1rem', fontWeight: '800', color: '#0a1141', fontFamily: 'var(--font-heading)' }}>
                  {obj.title}
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', lineHeight: 1.7 }}>
                  {obj.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          6. CORE ANCHORS — 4 Cards
          ════════════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#f8fafc', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,4rem)', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
            <SectionLabel text="Core Anchors" />
            <h2 style={{ margin: 0, fontSize: 'clamp(1.8rem,3.5vw,2.75rem)', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
              What We Stand For
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1.5rem' }}>
            {ANCHORS.map((a, i) => (
              <div key={i} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'box-shadow 0.3s, transform 0.3s, border-color 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 16px 40px rgba(10,17,65,0.08)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#ca8a04'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'rgba(202,138,4,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {a.icon}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0a1141', fontFamily: 'var(--font-heading)' }}>{a.title}</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', lineHeight: 1.7 }}>{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          7. DARK BRAND FOOTER STRIP
          ════════════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#0a1141', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)', borderTop: '1px solid rgba(202,138,4,0.2)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }} className="about-footer-grid">
          <div>
            <p style={{ margin: '0 0 0.5rem', color: '#ca8a04', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
              Royal Ambassadors · RALWBC
            </p>
            <p style={{ margin: '0 0 1.25rem', color: '#ffffff', fontSize: 'clamp(1.1rem,2vw,1.4rem)', fontWeight: '800', fontFamily: 'var(--font-heading)', lineHeight: 1.3, fontStyle: 'italic' }}>
              "We are ambassadors for Christ."<br />
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', fontWeight: '500', fontStyle: 'normal', letterSpacing: '0.1em' }}>
                2 CORINTHIANS 5:20
              </span>
            </p>
            <Link to="/officers" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#ca8a04', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', borderBottom: '1px solid rgba(202,138,4,0.4)', paddingBottom: '2px', transition: 'border-color 0.2s' }}>
              Meet Our Officers <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <img src="/logo.png" alt="RA Logo" style={{ width: 'clamp(44px,6vw,64px)', objectFit: 'contain', opacity: 0.85 }} />
            <img src="/lwbc-logo.png" alt="LWBC Logo" style={{ width: 'clamp(44px,6vw,64px)', objectFit: 'contain', opacity: 0.85 }} />
          </div>
        </div>
      </section>

      {/* ─── Global mobile responsiveness ──────────────────────────────── */}
      <style>{`
        @media (max-width: 860px) {
          .about-two-col {
            grid-template-columns: 1fr !important;
          }
          .about-two-col > div:first-child {
            position: static !important;
          }
        }
        @media (max-width: 700px) {
          .about-split {
            grid-template-columns: 1fr !important;
          }
          .about-split > div:last-child {
            border-left: none !important;
            border-top: 3px solid #ca8a04;
          }
        }
        @media (max-width: 560px) {
          .about-footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .obj-hover-bar { display: none; }
        div:hover > .obj-hover-bar { transform: scaleX(1) !important; }
      `}</style>
    </div>
  );
};

export default About;
