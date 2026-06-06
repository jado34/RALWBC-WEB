import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { Calendar, User, BookOpen, ArrowRight, Tag } from 'lucide-react';

// ─── Format date nicely ────────────────────────────────────────────────────────
const formatDate = (raw) => {
  try {
    return new Date(raw).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return raw; }
};

// ─── Reading time estimate ─────────────────────────────────────────────────────
const readTime = (content = '') => {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

// ─── Category tag colour ──────────────────────────────────────────────────────
const TAG_COLORS = ['#0a1141', '#ca8a04', '#1e3a8a', '#065f46'];

export const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [rest, setRest] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    dbService.init();
    const all = dbService.getBlogs();
    if (all.length > 0) {
      setFeatured(all[0]);
      setRest(all.slice(1));
    }
    setBlogs(all);
  }, []);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

      {/* ── PAGE HERO ─────────────────────────────────────────────────── */}
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
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right,transparent,#ca8a04,transparent)' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '32px', height: '2px', backgroundColor: '#ca8a04' }} />
            <span style={{ color: '#ca8a04', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              RALWBC Newsroom
            </span>
          </div>
          <h1 style={{
            color: '#ffffff', margin: '0 0 1rem',
            fontSize: 'clamp(2.5rem,6vw,5rem)',
            fontWeight: '900', fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.03em', lineHeight: 1,
          }}>
            Announcements<br />
            <span style={{ color: '#ca8a04' }}>&amp; Blogs.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(0.9rem,1.5vw,1.05rem)', maxWidth: '560px', lineHeight: 1.75, margin: 0 }}>
            Stay updated with the latest exam committee announcements, quiz tips, regional camp summaries, and weekly devotionals from RALWBC.
          </p>
        </div>
      </section>

      {blogs.length === 0 ? (
        /* ── EMPTY STATE ──────────────────────────────────────────────── */
        <section style={{ padding: 'clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)', textAlign: 'center' }}>
          <div style={{ maxWidth: '420px', margin: '0 auto' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <BookOpen size={32} color="#94a3b8" />
            </div>
            <h2 style={{ color: '#0a1141', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
              No posts yet
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.7 }}>
              Blog announcements will appear here once the admin publishes them. Check back soon.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* ── FEATURED POST (first / latest) ──────────────────────── */}
          {featured && (
            <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                  <div style={{ width: '32px', height: '2px', backgroundColor: '#ca8a04' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ca8a04' }}>Latest Post</span>
                </div>

                <article
                  style={{ backgroundColor: '#fff', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', cursor: 'pointer', transition: 'box-shadow 0.3s' }}
                  className="featured-article responsive-row"
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 20px 60px rgba(10,17,65,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  onClick={() => setExpandedId(expandedId === featured.id ? null : featured.id)}
                >
                  {/* Left: decorative panel */}
                  <div style={{
                    backgroundColor: '#0a1141', padding: '3rem',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    minHeight: '280px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ca8a04' }} />
                      <span style={{ color: '#ca8a04', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                        Featured Announcement
                      </span>
                    </div>
                    <div>
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} /> {formatDate(featured.date)}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <BookOpen size={13} /> {readTime(featured.content)} min read
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>
                        <User size={13} />
                        <span>By {featured.author}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: content */}
                  <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.25rem' }}>
                    <h2 style={{ margin: 0, fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                      {featured.title}
                    </h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', lineHeight: 1.75, display: '-webkit-box', WebkitLineClamp: expandedId === featured.id ? 'unset' : 3, WebkitBoxOrient: 'vertical', overflow: expandedId === featured.id ? 'visible' : 'hidden' }}>
                      {featured.content}
                    </p>
                    <button style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: '#ca8a04', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', padding: 0 }}>
                      {expandedId === featured.id ? 'Show Less' : 'Read Full Post'} <ArrowRight size={13} />
                    </button>
                  </div>
                </article>
              </div>
            </section>
          )}

          {/* ── MORE POSTS ──────────────────────────────────────────────── */}
          {rest.length > 0 && (
            <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)' }}>
              <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
                  <div style={{ width: '32px', height: '2px', backgroundColor: '#ca8a04' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ca8a04' }}>
                    All Posts
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1.5px', backgroundColor: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  {rest.map((blog, idx) => (
                    <article
                      key={blog.id}
                      onClick={() => setExpandedId(expandedId === blog.id ? null : blog.id)}
                      style={{
                        backgroundColor: '#fff', padding: '2rem 2rem',
                        cursor: 'pointer', transition: 'background-color 0.2s',
                        display: 'flex', flexDirection: 'column', gap: '1rem',
                        position: 'relative',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fefce8'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                    >
                      {/* Coloured left bar */}
                      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', backgroundColor: TAG_COLORS[idx % TAG_COLORS.length] }} />

                      {/* Meta row */}
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '500' }}>
                          <Calendar size={12} /> {formatDate(blog.date)}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '500' }}>
                          <BookOpen size={12} /> {readTime(blog.content)} min
                        </span>
                      </div>

                      {/* Title */}
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0a1141', fontFamily: 'var(--font-heading)', lineHeight: 1.25, letterSpacing: '-0.01em' }}>
                        {blog.title}
                      </h3>

                      {/* Content — collapses/expands */}
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: expandedId === blog.id ? 'unset' : 3, WebkitBoxOrient: 'vertical', overflow: expandedId === blog.id ? 'visible' : 'hidden', whiteSpace: 'pre-wrap' }}>
                        {blog.content}
                      </p>

                      {/* Author + read toggle */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <User size={12} /> {blog.author}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#ca8a04', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {expandedId === blog.id ? 'Collapse' : 'Read'} <ArrowRight size={11} />
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* ── DARK FOOTER STRIP ─────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#0a1141', padding: '3rem clamp(1.5rem,5vw,4rem)', borderTop: '1px solid rgba(202,138,4,0.2)', marginTop: '2rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <p style={{ margin: '0 0 0.25rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              RALWBC · Newsroom
            </p>
            <p style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
              "Go ye therefore, and teach all nations." — Matt 28:19
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <img src="/logo.png" alt="RA Logo" style={{ width: '44px', objectFit: 'contain', opacity: 0.8 }} />
            <img src="/lwbc-logo.png" alt="LWBC" style={{ width: '44px', objectFit: 'contain', opacity: 0.8 }} />
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .featured-article {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Blogs;
