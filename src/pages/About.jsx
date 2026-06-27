import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Heart, Shield, Crown } from 'lucide-react';

// ─── Emblem-accurate symbol SVGs (colours matched to logo.png) ───────────────
// Navy: #1a1f6b  |  Gold: #c9a227
const TorchIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Staff */}
    <rect x="11" y="10" width="2" height="11" rx="1" fill="#c9a227" />
    {/* Flame body */}
    <path d="M12 2 C10 4 8.5 6 9 8.5 C9.4 10.5 12 11 12 11 C12 11 14.6 10.5 15 8.5 C15.5 6 14 4 12 2Z" fill="#c9a227" />
    {/* Inner flame highlight */}
    <path d="M12 5 C11 6.5 10.5 8 11 9 C11.4 9.8 12 10 12 10 C12 10 12.6 9.8 13 9 C13.5 8 13 6.5 12 5Z" fill="rgba(255,220,80,0.6)" />
  </svg>
);

const WheelIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer rim */}
    <circle cx="12" cy="12" r="9.5" stroke="#c9a227" strokeWidth="2" />
    {/* Hub */}
    <circle cx="12" cy="12" r="2" fill="#c9a227" />
    {/* 8 spokes */}
    <line x1="12" y1="2.5" x2="12" y2="10" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="14" x2="12" y2="21.5" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="2.5" y1="12" x2="10" y2="12" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="14" y1="12" x2="21.5" y2="12" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="4.4" y1="4.4" x2="9.8" y2="9.8" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="14.2" y1="14.2" x2="19.6" y2="19.6" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="19.6" y1="4.4" x2="14.2" y2="9.8" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="9.8" y1="14.2" x2="4.4" y2="19.6" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// ─── RA Rank tiers (enriched with emblem symbol data) ────────────────────────
// Badge colours are taken directly from the logo emblem: navy #1a1f6b + gold #c9a227
const EMBLEM_NAVY = '#1a1f6b';
const EMBLEM_GOLD = '#c9a227';

const RANKS = [
  {
    label: 'Junior RA',
    ages: '10 – 12',
    symbol: 'Torch',
    symbolIcon: <TorchIcon size={22} />,
    symbolMeaning: 'The Torch is the emblem symbol for the Junior Royal Ambassador. It represents the light of the Gospel a boy who carries the flame of faith in its earliest, most formative stage. It calls the junior boy to shine brightly as he begins his walk with Christ.',
    desc: 'Foundational Christian education plans. Introducing boys to scripture, prayer, and the mission of Royal Ambassadors. The junior boy begins his journey of discipleship, building a spiritual foundation that will carry him through every stage of life.',
    color: EMBLEM_NAVY,
    accentColor: EMBLEM_NAVY,
    bg: 'rgba(26,31,107,0.06)',
  },
  {
    label: 'Intermediate RA',
    ages: '13 – 16',
    symbol: 'Wheel',
    symbolIcon: <WheelIcon size={22} />,
    symbolMeaning: 'The Wheel is the emblem of the Intermediate Royal Ambassador the rank of Apprentice. It represents the boy as a learner of trade: becoming an Ambassador for Christ. The wheel is a sign of movement and progress, reminding the boy to progressively pattern his life after the Carpenter Boy from Nazareth, knowing there is no higher work than becoming an Ambassador for Christ.',
    desc: 'Basic discipleship plans for secondary school-age boys. Building habits of faith, study, and community service. The intermediate boy is trained in mission action, leadership, and the practical knowledge of what it means to serve as a representative of Christ.',
    color: EMBLEM_NAVY,
    accentColor: EMBLEM_GOLD,
    bg: 'rgba(201,162,39,0.07)',
  },
  {
    label: 'Senior RA',
    ages: '17 – 24',
    symbol: 'Crown',
    symbolIcon: <Crown size={22} color={EMBLEM_GOLD} />,
    symbolMeaning: 'The Crown is the symbol for the Senior Royal Ambassador. A crown represents a king and this crown specifically represents Christ, the King of kings and Lord of lords. It signifies that the Senior RA has reached an age and acquired certain knowledge that qualifies him to serve as an effective Ambassador for Christ the King, loyal and faithful to his calling.',
    desc: 'Solid mission education and action plans. Preparing young men for leadership, outreach, and lifelong ambassadorship. The senior boy is equipped as a mature representative of Christ, ready to lead, serve, and impact his community and the world.',
    color: EMBLEM_NAVY,
    accentColor: EMBLEM_NAVY,
    bg: 'rgba(26,31,107,0.06)',
  },
];

// ─── 7 Cardinal Objectives ───────────────────────────────────────────────────
const OBJECTIVES = [
  { n: '01', title: 'Spiritual Development', body: 'Helping boys in personal spiritual development and discipleship journey.' },
  { n: '02', title: 'Educational Growth', body: 'Ensuring  educational and career advancement of boys.' },
  { n: '03', title: 'Discipline', body: 'Promoting personal and corporate discipline, and responsiveness.' },
  { n: '04', title: 'Potentiality', body: "Enabling members' personality, potentiality development, and dignity development." },
  { n: '05', title: 'Mission Action', body: 'Equipping boys for mission action.' },
  { n: '06', title: 'Social Awareness', body: 'Promoting social awareness, responsibility, and responsiveness.' },
  { n: '07', title: 'Commitment', body: 'Promoting personal commitment demonstrated in stewardship of life, churchmanship, denominational interest, and understanding as well as appreciation of Baptist beliefs and practices.' },
];

// ─── RA Pledge items ─────────────────────────────────────────────────────────
const PLEDGE = [
  'As a Royal Ambassador I will do my best',
  'To become a well-informed, responsible follower of Christ',
  'To have a Christ-like concern for all people',
  'To learn how the message of Christ is carried around the world',
  'To work with others in sharing Christ; and',
  'To keep myself clean and healthy in mind and body.',
];

// ─── The Royal Ambassador Emblem paragraphs ───────────────────────────────────
const EMBLEM_PARAS = [
  'The Royal Ambassador Emblem is a blue shield on a background of a white circle, with a gold edge around the circle. The shield represents a soldier for in Ephesians 6:16, the Christian is instructed to "take the shield of faith." The emblem reminds every Royal Ambassador to have faith in God, whom he will represent as an ambassador.',
  'The shield is divided into three distinct parts: a torch, a wheel, and a crown. Each symbol corresponds to one of the three ranks of Royal Ambassadors, encoding the full journey of a boy\'s growth from the earliest spark of faith, through the progress of discipleship, to the fullness of mature ambassadorship for Christ the King.',
];

// ─── RA Colours data ──────────────────────────────────────────────────────────
const COLOURS = [
  {
    name: 'Blue',
    hex: '#0a1141',
    displayHex: '#1a2a8a',
    label: 'Loyalty',
    tagline: 'Faithful to King, Church & Mission',
    meaning: 'The blue stands for loyalty — a deep, unwavering commitment that defines every Royal Ambassador:',
    points: [
      'Loyalty to Christ the King',
      'Loyalty to the Church and her mission',
      'Loyalty to the Royal Ambassadors organization and its beliefs',
    ],
  },
  {
    name: 'Gold',
    hex: '#ca8a04',
    displayHex: '#d4a017',
    label: 'Value & Worth',
    tagline: 'The worth that defines the call',
    meaning: 'The gold stands for value or worth — a two-way covenant of immeasurable significance:',
    points: [
      'The worth of Christ to the boy as Lord and Master',
      'The worth of the boy to Christ as His ambassador',
    ],
  },
  {
    name: 'White',
    hex: '#f8fafc',
    displayHex: '#e8edf5',
    label: 'Purity',
    tagline: 'Clean before God in every dimension',
    meaning: 'The white stands for purity — a standard of holiness that touches every part of a young man\'s life:',
    points: [
      'Purity of body',
      'Purity of mind',
      'Purity of soul in the worship of one God and Him alone',
    ],
    dark: true,
  },
];

// ─── Core Anchors ────────────────────────────────────────────────────────────
const ANCHORS = [
  { icon: <BookOpen size={28} color="#ca8a04" />, title: 'Bible Discipleship', body: 'Anchoring our youths in scripture study, doctrinal clarity, and quiz championships to foster deep biblical literacy.' },
  { icon: <Users size={28} color="#ca8a04" />, title: 'Leadership & Fraternity', body: 'Building boys into strong leaders, mentors, and ambassadors. Promoting accountability and Christian brotherhood.' },
  { icon: <Heart size={28} color="#ca8a04" />, title: 'Missions & Service', body: 'Conducting community outreaches, visiting local assemblies, and serving humanity as a testament to the love of Christ.' },
  { icon: <Shield size={28} color="#ca8a04" />, title: 'Character & Discipline', body: 'Cultivating integrity, orderliness, and personal discipline — the hallmarks of a true Royal Ambassador.' },
];

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel = ({ text, light = false }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
    <div style={{ width: '32px', height: '2px', backgroundColor: '#ca8a04', flexShrink: 0 }} />
    <span style={{ color: light ? 'rgba(202,138,4,0.85)' : '#ca8a04', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.22em', textTransform: 'uppercase' }}>{text}</span>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
export const About = () => {
  const [loaded, setLoaded] = useState(false);
  const [objVisible, setObjVisible] = useState(false);
  const [emblVisible, setEmblVisible] = useState(false);
  const [colVisible, setColVisible] = useState(false);
  const objRef = useRef(null);
  const emblRef = useRef(null);
  const colRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Intersection observer factory
  const makeObserver = (setter) => {
    return new IntersectionObserver(([e]) => { if (e.isIntersecting) setter(true); }, { threshold: 0.08 });
  };

  useEffect(() => {
    const obs = makeObserver(setObjVisible);
    if (objRef.current) obs.observe(objRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const obs = makeObserver(setEmblVisible);
    if (emblRef.current) obs.observe(emblRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const obs = makeObserver(setColVisible);
    if (colRef.current) obs.observe(colRef.current);
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
            <SectionLabel text="Who We Are" light />
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
                tag: 'Royal Ambassadors of Nigeria',
                text: 'The organization in Nigeria is called Royal Ambassadors of Nigeria (RAN). In its mission education and ministry plan, RAN has a foundational Christian education plan for Junior RA, boys between the ages of 10 and 12; basic discipleship plans for Intermediate RA, boys from age 13 to 16 (or secondary school age); and solid mission education and action plans for Senior RA, who are boys within the ages of 17 and 24.',
              },
              {
                tag: 'Our Journey',
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
          3. RANK TIERS — Expanded with Emblem Symbols
          ════════════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#f8fafc', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,4rem)', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3.5rem' }}>
            <SectionLabel text="Ranks" />
            <h2 style={{ margin: '0 0 1rem', fontSize: 'clamp(1.8rem,3.5vw,2.75rem)', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
              Three Stages of Growth
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: 'clamp(0.9rem,1.4vw,1rem)', lineHeight: 1.8, maxWidth: '640px' }}>
              Royal Ambassadors structures a boy's journey into three progressive ranks each with its own age range and mission education plan, progressing from Junior through Intermediate to Senior.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
            {RANKS.map((rank, i) => (
              <div
                key={i}
                className="rank-row"
                style={{
                  backgroundColor: '#fff',
                  display: 'grid',
                  gridTemplateColumns: '3px 1fr',
                  transition: 'background-color 0.25s',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(26,31,107,0.03)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
              >
                {/* Coloured left border */}
                <div style={{ backgroundColor: rank.color }} />

                <div style={{ padding: 'clamp(2rem,3vw,2.75rem) clamp(1.5rem,3vw,2.5rem)', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 'clamp(1.5rem,4vw,4rem)', alignItems: 'start' }} className="rank-inner">
                  {/* Left: identity */}
                  <div>
                    {/* Ghost number */}
                    <div style={{ fontSize: 'clamp(3rem,5vw,5rem)', fontWeight: '900', color: 'rgba(26,31,107,0.08)', fontFamily: 'var(--font-heading)', lineHeight: 1, letterSpacing: '-0.04em', marginBottom: '0.5rem', userSelect: 'none' }}>
                      0{i + 1}
                    </div>
                    {/* Symbol badge — navy bg, gold icon + text (matches emblem) */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', backgroundColor: '#1a1f6b', color: '#c9a227', padding: '0.45rem 1rem 0.45rem 0.7rem', borderRadius: '3px', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(26,31,107,0.18)' }}>
                      <span style={{ display: 'flex' }}>{rank.symbolIcon}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{rank.symbol}</span>
                    </div>
                    <h3 style={{ margin: '0 0 0.4rem', fontSize: 'clamp(1.1rem,2vw,1.35rem)', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                      {rank.label}
                    </h3>
                    <div style={{ display: 'inline-block', border: '1.5px solid #1a1f6b', color: '#1a1f6b', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.2rem 0.7rem', borderRadius: '2px' }}>
                      Ages {rank.ages}
                    </div>
                  </div>

                  {/* Right: mission description only — symbol meaning lives in the dedicated Emblem section below */}
                  <div>
                    <p style={{ margin: '0 0 0.4rem', color: '#ca8a04', fontSize: '0.63rem', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Mission & Purpose</p>
                    <p style={{ margin: 0, color: '#475569', fontSize: 'clamp(0.875rem,1.3vw,0.95rem)', lineHeight: 1.85 }}>{rank.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          4. THE ROYAL AMBASSADOR EMBLEM — Editorial Dark Section
          ════════════════════════════════════════════════════════════════════ */}
      <section
        ref={emblRef}
        style={{ backgroundColor: '#0a1141', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,4rem)', position: 'relative', overflow: 'hidden' }}
      >
        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(rgba(202,138,4,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(202,138,4,0.04) 1px,transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />
        {/* Gold bottom bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right,transparent,#ca8a04,transparent)' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ marginBottom: '3.5rem' }}>
            <SectionLabel text="The RA Emblem" light />
            <h2 style={{ margin: '0 0 0', fontSize: 'clamp(1.8rem,3.5vw,2.75rem)', fontWeight: '900', color: '#ffffff', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
              The Royal Ambassador<br /><span style={{ color: '#ca8a04' }}>Emblem</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 'clamp(2.5rem,5vw,6rem)', alignItems: 'start' }} className="about-two-col">
            {/* Left: emblem visual + description */}
            <div>
              {/* Emblem — actual RA logo */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                marginBottom: '2.5rem',
              }}>
                <img
                  src="/logo.png"
                  alt="Royal Ambassador Emblem"
                  style={{
                    width: 'clamp(180px,24vw,260px)',
                    height: 'auto',
                    objectFit: 'contain',
                  }}
                />

                <p style={{
                  marginTop: '1.1rem',
                  color: 'rgba(202,138,4,0.7)',
                  fontSize: '0.62rem', fontWeight: '800',
                  letterSpacing: '0.22em', textTransform: 'uppercase',
                  textAlign: 'center',
                }}>
                  The Royal Ambassador Emblem
                </p>
              </div>

              {EMBLEM_PARAS.map((para, i) => (
                <p key={i} style={{
                  color: i === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.6)',
                  fontSize: 'clamp(0.875rem,1.3vw,0.98rem)', lineHeight: 1.9,
                  margin: i < EMBLEM_PARAS.length - 1 ? '0 0 1.5rem' : '0',
                  opacity: emblVisible ? 1 : 0,
                  transform: emblVisible ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 0.7s ease ${i * 0.15}s, transform 0.7s ease ${i * 0.15}s`,
                }}>
                  {para}
                </p>
              ))}

              {/* Scripture reference */}
              <div style={{ marginTop: '2rem', borderLeft: '3px solid #ca8a04', paddingLeft: '1.25rem' }}>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scripture Foundation</p>
                <p style={{ margin: '0.4rem 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.6 }}>
                  "Take up the shield of faith, with which you can extinguish all the flaming arrows of the evil one." — Ephesians 6:16
                </p>
              </div>
            </div>

            {/* Right: Three symbol breakdown cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'rgba(201,162,39,0.12)' }}>
              {RANKS.map((rank, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    padding: '1.75rem 2rem',
                    display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
                    borderLeft: '3px solid #c9a227',
                    opacity: emblVisible ? 1 : 0,
                    transform: emblVisible ? 'translateX(0)' : 'translateX(20px)',
                    transition: `opacity 0.65s ease ${0.2 + i * 0.12}s, transform 0.65s ease ${0.2 + i * 0.12}s`,
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {/* Symbol icon bubble — navy bg + gold icon, matching emblem */}
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '6px',
                    backgroundColor: '#1a1f6b',
                    border: '1.5px solid rgba(201,162,39,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {rank.symbolIcon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                        The {rank.symbol}
                      </span>
                      <span style={{ color: 'rgba(202,138,4,0.8)', fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                        — {rank.label}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.62)', fontSize: '0.875rem', lineHeight: 1.75 }}>
                      {rank.symbolMeaning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          5. VISION & PLEDGE — Split Dark / Light
          ════════════════════════════════════════════════════════════════════ */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="about-split">
        {/* Left: Vision — dark */}
        <div style={{ backgroundColor: '#0f172a', padding: 'clamp(3.5rem,7vw,6rem) clamp(1.5rem,5vw,4rem)' }}>
          <SectionLabel text="Our Vision" light />
          <blockquote style={{ margin: '0 0 2rem', padding: 0, border: 'none' }}>
            <p style={{ fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: '800', color: '#ffffff', fontFamily: 'var(--font-heading)', lineHeight: 1.25, letterSpacing: '-0.02em', fontStyle: 'italic' }}>
              "Touching the lives of boys, impacting the eternity of men!"
            </p>
          </blockquote>
          <div style={{ borderTop: '1px solid rgba(202,138,4,0.3)', paddingTop: '1.75rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1rem' }}>Our Founding Goals</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                'To become a well-informed, responsible follower of Christ.',
                'To carry the message of Christ around the world.',
                'To have a Christ-like concern for all people.',
                'To work with others in sharing Christ.',
                'To keep myself clean and healthy in mind and body.',
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
          6. THE ROYAL AMBASSADOR COLOURS — Three-Panel Layout
          ════════════════════════════════════════════════════════════════════ */}
      <section
        ref={colRef}
        style={{ backgroundColor: '#fff', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,4rem)', borderTop: '1px solid #e2e8f0' }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3.5rem' }}>
            <SectionLabel text="The RA Colours" />
            <h2 style={{ margin: '0 0 1rem', fontSize: 'clamp(1.8rem,3.5vw,2.75rem)', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
              The Royal Ambassador<br />Colours
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: 'clamp(0.9rem,1.4vw,1rem)', lineHeight: 1.8, maxWidth: '580px' }}>
              The Royal Ambassador colors are <strong style={{ color: '#1a2a8a' }}>Blue</strong>, <strong style={{ color: '#a16207' }}>Gold</strong>, and <strong style={{ color: '#64748b' }}>White</strong>. Each colour carries a profound theological meaning that defines the character and calling of every Royal Ambassador.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }} className="colours-grid">
            {COLOURS.map((col, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#fff',
                  display: 'flex', flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: colVisible ? 1 : 0,
                  transform: colVisible ? 'translateY(0)' : 'translateY(24px)',
                  transition: `opacity 0.7s ease ${i * 0.15}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.15}s`,
                }}
              >
                {/* Colour swatch top */}
                <div style={{
                  height: 'clamp(100px,14vw,160px)',
                  backgroundColor: col.displayHex,
                  position: 'relative',
                  display: 'flex', alignItems: 'flex-end',
                  padding: '1.25rem 1.5rem',
                }}>
                  {/* Pattern overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.06) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.06) 75%, transparent 75%)`,
                    backgroundSize: '12px 12px',
                  }} />
                  {/* Colour name watermark */}
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    fontSize: 'clamp(3.5rem,7vw,5.5rem)', fontWeight: '900',
                    color: 'rgba(255,255,255,0.1)',
                    fontFamily: 'var(--font-heading)', letterSpacing: '-0.05em',
                    userSelect: 'none', whiteSpace: 'nowrap',
                  }}>
                    {col.name.toUpperCase()}
                  </div>
                  {/* Label pill */}
                  <div style={{
                    position: 'relative', zIndex: 1,
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
                    padding: '0.35rem 0.85rem', borderRadius: '2px',
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.name === 'White' ? '#94a3b8' : '#fff', flexShrink: 0 }} />
                    <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                      {col.name} · {col.label}
                    </span>
                  </div>
                </div>

                {/* Content body */}
                <div style={{ padding: '1.75rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <div style={{ width: '28px', height: '3px', backgroundColor: col.displayHex, marginBottom: '0.85rem', borderRadius: '2px' }} />
                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)' }}>
                      {col.label}
                    </h3>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                      {col.tagline}
                    </p>
                  </div>

                  <p style={{ margin: 0, color: '#475569', fontSize: '0.875rem', lineHeight: 1.75 }}>
                    {col.meaning}
                  </p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                    {col.points.map((pt, j) => (
                      <li key={j} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <span style={{
                          minWidth: '20px', height: '20px', borderRadius: '50%',
                          backgroundColor: col.displayHex,
                          color: col.name === 'White' ? '#0a1141' : '#fff',
                          fontSize: '0.6rem', fontWeight: '900',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, marginTop: '0.1rem',
                        }}>
                          {j + 1}
                        </span>
                        <span style={{ color: '#334155', fontSize: '0.875rem', lineHeight: 1.65 }}>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom colour accent bar */}
                <div style={{ height: '3px', backgroundColor: col.displayHex }} />
              </div>
            ))}
          </div>



        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          7. 7 CARDINAL OBJECTIVES — Numbered Editorial Grid
          ════════════════════════════════════════════════════════════════════ */}
      <section ref={objRef} style={{ backgroundColor: '#f8fafc', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,4rem)', borderTop: '1px solid #e2e8f0' }}>
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
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fefce8'}
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
          8. CORE ANCHORS — 4 Cards
          ════════════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#fff', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,4rem)', borderTop: '1px solid #e2e8f0' }}>
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
          9. DARK BRAND FOOTER STRIP
          ════════════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#0a1141', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)', borderTop: '1px solid rgba(202,138,4,0.2)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }} className="about-footer-grid">
          <div>
            <p style={{ margin: '0 0 0.5rem', color: '#ca8a04', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
              Royal Ambassadors · Lagos West Baptist Conference
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
          .rank-inner {
            grid-template-columns: 1fr !important;
          }
          .colours-grid {
            grid-template-columns: 1fr !important;
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
          .colours-callout {
            flex-direction: column;
            gap: 0.75rem;
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
