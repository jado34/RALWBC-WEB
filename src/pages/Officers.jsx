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
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2.5rem' }}>
            {[director, asstDirector].filter(Boolean).map((officer) => {
              return (
                <div
                  key={officer.id}
                  className="officer-card"
                  style={{ width: '100%', maxWidth: '420px' }}
                >
                  {/* Photo */}
                  <div className="officer-img-wrapper">
                    {officer.image ? (
                      <img src={officer.image} alt={officer.name} className="officer-img" style={{ objectPosition: officer.imagePosition || 'center top', transform: `scale(${officer.imageScale || 1})`, transformOrigin: 'center top' }} />
                    ) : (
                      <Avatar name={officer.name} size={260} />
                    )}
                  </div>
                  {/* Info */}
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ca8a04', marginBottom: '0.5rem' }}>
                      {officer.post}
                    </div>
                    <h2 style={{ margin: 0, fontSize: 'clamp(1.3rem,2vw,1.65rem)', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                      {officer.name}
                    </h2>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── REST OF OFFICERS ───────────────────────── */}
      <section style={{ padding: 'clamp(4rem,8vw,6rem) clamp(1.5rem,5vw,4rem)', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '32px', height: '2px', backgroundColor: '#ca8a04' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ca8a04' }}>Executive Committee</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 'clamp(1.75rem,3vw,2.5rem)', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>
              Conference Leadership Team
            </h2>
          </div>

          {rest.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '2rem' }}>
              {rest.map((officer) => (
                <div
                  key={officer.id}
                  className="exec-card"
                >
                  {/* Photo / Avatar */}
                  <div className="exec-img-wrapper">
                    {officer.image ? (
                      <img src={officer.image} alt={officer.name} className="exec-img" style={{ objectPosition: officer.imagePosition || 'center top', transform: `scale(${officer.imageScale || 1})`, transformOrigin: 'center top' }} />
                    ) : (
                      <Avatar name={officer.name} size={190} />
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ca8a04', marginBottom: '0.4rem' }}>
                      {officer.post}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', lineHeight: 1.25 }}>
                      {officer.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <Shield size={40} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.9rem' }}>No officers yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── BOTTOM DARK STRIP ───────────────*/}
      <section style={{ backgroundColor: '#0a1141', padding: '3.5rem clamp(1.5rem,5vw,4rem)', borderTop: '1px solid rgba(202,138,4,0.2)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <p style={{ margin: '0 0 0.35rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              RALWBC · {new Date().getFullYear()}
            </p>
            <p style={{ margin: 0, color: '#fff', fontSize: '1.15rem', fontWeight: '800', fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em' }}>
              Serving the Royal Ambassador Lagos West Baptist Conference with honour.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <img src="/logo.png" alt="RA Logo" style={{ width: '52px', objectFit: 'contain', opacity: 0.9 }} />
            <img src="/lwbc-logo.png" alt="LWBC Logo" style={{ width: '52px', objectFit: 'contain', opacity: 0.9 }} />
          </div>
        </div>
      </section>

      <style>{`
        .officer-card {
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 20px;
          padding: 3.5rem 2.5rem;
          box-shadow: 0 4px 30px rgba(10, 17, 65, 0.03);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.5rem;
          position: relative;
          overflow: hidden;
          cursor: default;
        }

        .officer-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #0a1141, #ca8a04);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .officer-card:hover {
          transform: translateY(-10px);
          border-color: rgba(202, 138, 4, 0.35);
          box-shadow: 0 25px 50px rgba(10, 17, 65, 0.1);
        }

        .officer-card:hover::before {
          opacity: 1;
        }

        .officer-img-wrapper {
          position: relative;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid #ffffff;
          box-shadow: 0 8px 24px rgba(10, 17, 65, 0.08);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .officer-card:hover .officer-img-wrapper {
          border-color: #ca8a04;
          box-shadow: 0 12px 32px rgba(202, 138, 4, 0.3);
          transform: scale(1.04);
        }

        .officer-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: contrast(1.08) saturate(1.1) brightness(1.02);
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .officer-card:hover .officer-img {
          transform: scale(1.1);
        }

        /* Secondary Executive Cards */
        .exec-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 2.5rem 2rem;
          box-shadow: 0 4px 15px rgba(10, 17, 65, 0.02);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.25rem;
          position: relative;
          cursor: default;
        }

        .exec-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #ca8a04, #0a1141);
          opacity: 0;
          transition: opacity 0.4s ease;
          border-radius: 18px 18px 0 0;
        }

        .exec-card:hover {
          transform: translateY(-8px);
          border-color: rgba(202, 138, 4, 0.3);
          box-shadow: 0 20px 40px rgba(10, 17, 65, 0.08);
        }

        .exec-card:hover::before {
          opacity: 1;
        }

        .exec-img-wrapper {
          position: relative;
          width: 190px;
          height: 190px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #ffffff;
          box-shadow: 0 6px 18px rgba(10, 17, 65, 0.06);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .exec-card:hover .exec-img-wrapper {
          border-color: #ca8a04;
          transform: scale(1.04);
        }

        .exec-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: contrast(1.08) saturate(1.1) brightness(1.02);
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .exec-card:hover .exec-img {
          transform: scale(1.1);
        }

        @media (max-width: 640px) {
          .officer-card { padding: 2.5rem 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default Officers;
