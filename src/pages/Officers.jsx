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

  useEffect(() => {
    dbService.init();
    dbService.getOfficers().then(data => setOfficers(data));
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
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
            {[director, asstDirector].filter(Boolean).map((officer) => {
              return (
                <div
                  key={officer.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '3rem 2.5rem',
                    width: '100%',
                    maxWidth: '420px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '1.5rem',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.borderColor = '#ca8a04';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(10, 17, 65, 0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  {/* Photo */}
                  <div style={{ flexShrink: 0 }}>
                    {officer.image ? (
                      <img src={officer.image} alt={officer.name} style={{ width: '200px', height: '200px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #ca8a04', boxShadow: '0 8px 24px rgba(202,138,4,0.15)' }} />
                    ) : (
                      <Avatar name={officer.name} size={200} />
                    )}
                  </div>
                  {/* Info */}
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ca8a04', marginBottom: '0.4rem' }}>
                      {officer.post}
                    </div>
                    <h2 style={{ margin: 0, fontSize: 'clamp(1.2rem,2vw,1.5rem)', fontWeight: '800', color: '#0a1141', fontFamily: 'var(--font-heading)', lineHeight: 1.25 }}>
                      {officer.name}
                    </h2>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1.5rem' }}>
              {rest.map((officer) => (
                <div
                  key={officer.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '2.5rem 1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '1.25rem',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'default',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = '#ca8a04';
                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(10, 17, 65, 0.06)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  {/* Photo / Avatar */}
                  <div>
                    {officer.image ? (
                      <img src={officer.image} alt={officer.name} style={{
                        width: '160px', height: '160px', borderRadius: '50%', objectFit: 'cover',
                        border: '3px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }} />
                    ) : (
                      <Avatar name={officer.name} size={160} />
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ca8a04', marginBottom: '0.35rem' }}>
                      {officer.post}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0a1141', fontFamily: 'var(--font-heading)', lineHeight: 1.25 }}>
                      {officer.name}
                    </h3>
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
