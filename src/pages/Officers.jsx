import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { Shield } from 'lucide-react';

// ─── Role rank badge colour map ────────────────────────────────────────────────
const TIER_COLOR = {
  1: { bg: '#ca8a04', text: '#fff', label: 'Director' },
  2: { bg: '#0a1141', text: '#ca8a04', label: 'Asst. Director' },
  default: { bg: '#f1f5f9', text: '#0a1141', label: '' },
};

const getTier = (order) => {
  if (order === 1) return TIER_COLOR[1];
  if (order === 2) return TIER_COLOR[2];
  return TIER_COLOR.default;
};

// Initials avatar
const Avatar = ({ name, size = 120 }) => {
  const initials = name
    ? name.trim().split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
    : 'RA';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #0a1141 0%, #1e3a8a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#ca8a04', fontWeight: '800',
      fontSize: size > 100 ? '2rem' : '1.2rem',
      letterSpacing: '0.05em', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

export const Officers = () => {
  const [officers, setOfficers] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    dbService.init();
    setOfficers(dbService.getOfficers());
  }, []);

  const director = officers.find(o => o.sortOrder === 1);
  const asstDirector = officers.find(o => o.sortOrder === 2);
  const rest = officers.filter(o => o.sortOrder !== 1 && o.sortOrder !== 2).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

      {/* ── PAGE HERO ─────────────────────────────────────────────────── */}
      <section style={{
        backgroundColor: '#0a1141',
        padding: 'clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem) clamp(3rem,6vw,5rem)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(rgba(202,138,4,0.05) 1px,transparent 1px),
            linear-gradient(90deg,rgba(202,138,4,0.05) 1px,transparent 1px)`,
          backgroundSize: '56px 56px',
        }} />
        {/* Gold top accent line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right,transparent,#ca8a04,transparent)' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '32px', height: '2px', backgroundColor: '#ca8a04' }} />
            <span style={{ color: '#ca8a04', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              RALWBC Leadership
            </span>
          </div>
          <h1 style={{
            color: '#ffffff', margin: '0 0 1rem',
            fontSize: 'clamp(2.5rem,6vw,5rem)',
            fontWeight: '900', fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.03em', lineHeight: 1,
          }}>
            Conference<br />
            <span style={{ color: '#ca8a04' }}>Officers.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(0.9rem,1.5vw,1.05rem)', maxWidth: '520px', lineHeight: 1.75, margin: 0 }}>
            The dedicated executive leadership team of the Royal Ambassadors Lagos West Baptist Conference — serving with honour and commitment.
          </p>
        </div>
      </section>

      {/* ── FEATURED TOP 2 (Director + Asst. Director) ─────────────────── */}
      {(director || asstDirector) && (
        <section style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5px', backgroundColor: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            {[director, asstDirector].filter(Boolean).map((officer) => {
              const tier = getTier(officer.sortOrder);
              return (
                <div
                  key={officer.id}
                  style={{
                    backgroundColor: '#fff', padding: '3rem 2.5rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                    gap: '1.25rem',
                    transition: 'background-color 0.2s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fefce8'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  {/* Photo */}
                  <div style={{ flexShrink: 0, position: 'relative' }}>
                    {officer.image ? (
                      <img src={officer.image} alt={officer.name} style={{ width: '200px', height: '200px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #ca8a04', boxShadow: '0 8px 32px rgba(202,138,4,0.25)' }} />
                    ) : (
                      <Avatar name={officer.name} size={200} />
                    )}
                    {/* Rank badge */}
                    <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: tier.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                      <Shield size={16} color={tier.text} />
                    </div>
                  </div>
                  {/* Info */}
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ca8a04', marginBottom: '0.5rem' }}>
                      {tier.label || officer.post.split(',')[0]}
                    </div>
                    <h2 style={{ margin: '0 0 0.35rem', fontSize: 'clamp(1.1rem,2vw,1.4rem)', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
                      {officer.name}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', fontWeight: '500' }}>
                      {officer.post}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── REST OF OFFICERS ──────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '32px', height: '2px', backgroundColor: '#ca8a04' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ca8a04' }}>Executive Committee</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
              Conference Leadership Team
            </h2>
          </div>

          {rest.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1.5px', backgroundColor: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              {rest.map((officer) => (
                <div
                  key={officer.id}
                  onMouseEnter={() => setHoveredId(officer.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    backgroundColor: hoveredId === officer.id ? '#fefce8' : '#fff',
                    padding: '2rem 1.75rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                    gap: '1rem', transition: 'background-color 0.25s', cursor: 'default',
                    position: 'relative',
                  }}
                >
                  {/* Top gold accent on hover */}
                  <div style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    height: '2px', width: hoveredId === officer.id ? '60%' : '0%',
                    backgroundColor: '#ca8a04', transition: 'width 0.35s ease',
                    borderRadius: '0 0 2px 2px',
                  }} />

                  {/* Photo / Avatar */}
                  <div style={{ position: 'relative' }}>
                    {officer.image ? (
                      <img src={officer.image} alt={officer.name} style={{
                        width: '160px', height: '160px', borderRadius: '50%', objectFit: 'cover',
                        border: hoveredId === officer.id ? '3px solid #ca8a04' : '3px solid #e2e8f0',
                        transition: 'border-color 0.25s',
                        boxShadow: hoveredId === officer.id ? '0 8px 24px rgba(202,138,4,0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
                      }} />
                    ) : (
                      <div style={{
                        width: '160px', height: '160px', borderRadius: '50%',
                        background: hoveredId === officer.id
                          ? 'linear-gradient(135deg,#ca8a04 0%,#a16207 100%)'
                          : 'linear-gradient(135deg,#0a1141 0%,#1e3a8a 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: hoveredId === officer.id ? '#fff' : '#ca8a04',
                        fontWeight: '800', fontSize: '2rem',
                        transition: 'background 0.3s, color 0.3s',
                      }}>
                        {officer.name.trim().split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <h3 style={{ margin: '0 0 0.3rem', fontSize: '1rem', fontWeight: '800', color: '#0a1141', fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>
                      {officer.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '600', color: '#ca8a04', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {officer.post.replace(', RALWBC', '')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <Shield size={40} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.9rem' }}>No additional officers registered yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── BOTTOM DARK STRIP ─────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#0a1141', padding: '3rem clamp(1.5rem,5vw,4rem)', borderTop: '1px solid rgba(202,138,4,0.2)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <p style={{ margin: '0 0 0.25rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              RALWBC · {new Date().getFullYear()}
            </p>
            <p style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
              Serving the Lagos West Baptist Conference with honour.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <img src="/logo.png" alt="RA Logo" style={{ width: '48px', objectFit: 'contain', opacity: 0.85 }} />
            <img src="/lwbc-logo.png" alt="LWBC Logo" style={{ width: '48px', objectFit: 'contain', opacity: 0.85 }} />
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .featured-card { flex-direction: column !important; text-align: center; }
        }
      `}</style>
    </div>
  );
};

export default Officers;
