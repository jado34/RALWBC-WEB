import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { Calendar, User, BookOpen, ArrowRight } from 'lucide-react';

const formatDate = (raw) => {
  try {
    return new Date(raw).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return raw; }
};

const readTime = (content = '') => {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const TAG_COLORS = ['#0a1141', '#ca8a04', '#1e3a8a', '#065f46'];

// Module-level cache so data survives between page navigations
let _blogsCache = null;

export const Blogs = () => {
  // If we have cached data, show it immediately (no spinner)
  const [blogs, setBlogs] = useState(_blogsCache || []);
  const [featured, setFeatured] = useState(_blogsCache ? _blogsCache[0] : null);
  const [rest, setRest] = useState(_blogsCache ? _blogsCache.slice(1) : []);
  const [expandedId, setExpandedId] = useState(null);
  // Only show skeleton when we truly have nothing yet
  const [isLoading, setIsLoading] = useState(!_blogsCache);

  useEffect(() => {
    dbService.init();
    dbService.getBlogs()
      .then(all => {
        _blogsCache = all; // store in module cache
        if (all && all.length > 0) {
          setFeatured(all[0]);
          setRest(all.slice(1));
          setBlogs(all);
        } else {
          setBlogs([]);
        }
      })
      .catch(err => {
        console.error('Failed to load blogs:', err);
        if (!_blogsCache) setBlogs([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div style={{ backgroundColor: '#fdfdfd', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>

      {/* ── PAGE HERO ──────────────────────── */}
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
            Stay updated with the latest exam committee announcements, quiz tips, senior camp summaries, and weekly bulletin from RALWBC.
          </p>
        </div>
      </section>

      {isLoading ? (
        /* ── SKELETON STATE ─ content-shaped placeholders ──────────── */
        <section style={{ padding: 'clamp(4rem,6vw,6rem) clamp(1.5rem,5vw,4rem)', backgroundColor: '#f8fafc' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {/* Featured skeleton */}
            <div style={{ height: '12px', width: '160px', borderRadius: '4px', backgroundColor: '#e2e8f0', marginBottom: '2.5rem', animation: 'shimmer 1.4s infinite' }} />
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1.2fr', minHeight: '280px', marginBottom: '4rem' }}>
              <div style={{ backgroundColor: '#f1f5f9', animation: 'shimmer 1.4s infinite' }} />
              <div style={{ padding: '3.5rem 3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ height: '28px', width: '80%', borderRadius: '4px', backgroundColor: '#e2e8f0', animation: 'shimmer 1.4s infinite' }} />
                <div style={{ height: '14px', width: '100%', borderRadius: '4px', backgroundColor: '#f1f5f9', animation: 'shimmer 1.4s infinite' }} />
                <div style={{ height: '14px', width: '90%', borderRadius: '4px', backgroundColor: '#f1f5f9', animation: 'shimmer 1.4s infinite' }} />
                <div style={{ height: '14px', width: '75%', borderRadius: '4px', backgroundColor: '#f1f5f9', animation: 'shimmer 1.4s infinite' }} />
              </div>
            </div>
            {/* Grid skeletons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2.5rem' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ height: '12px', width: '120px', borderRadius: '4px', backgroundColor: '#e2e8f0', animation: 'shimmer 1.4s infinite' }} />
                  <div style={{ height: '22px', width: '85%', borderRadius: '4px', backgroundColor: '#e2e8f0', animation: 'shimmer 1.4s infinite' }} />
                  <div style={{ height: '13px', width: '100%', borderRadius: '4px', backgroundColor: '#f1f5f9', animation: 'shimmer 1.4s infinite' }} />
                  <div style={{ height: '13px', width: '90%', borderRadius: '4px', backgroundColor: '#f1f5f9', animation: 'shimmer 1.4s infinite' }} />
                  <div style={{ height: '13px', width: '70%', borderRadius: '4px', backgroundColor: '#f1f5f9', animation: 'shimmer 1.4s infinite' }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : blogs.length === 0 ? (
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
            <section style={{ padding: 'clamp(4rem,6vw,6rem) clamp(1.5rem,5vw,4rem)', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
                  <div style={{ width: '32px', height: '2px', backgroundColor: '#ca8a04' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ca8a04' }}>Latest Announcement</span>
                </div>

                <article
                  className="featured-article"
                  onClick={() => setExpandedId(expandedId === featured.id ? null : featured.id)}
                >
                  {/* Left: featured image OR decorative dark panel */}
                  {featured.image_url ? (
                    <div style={{
                      position: 'relative',
                      overflow: 'hidden',
                      minHeight: '280px',
                    }}>
                      <img
                        src={featured.image_url}
                        alt={featured.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: '280px' }}
                      />
                      {/* Overlay gradient */}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,17,65,0.65) 0%, transparent 55%)' }} />
                      {/* Meta on image */}
                      <div style={{ position: 'absolute', bottom: '1.75rem', left: '2rem', right: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={13} /> {formatDate(featured.date)}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <BookOpen size={13} /> {readTime(featured.content)} min read
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c9a227', fontSize: '0.82rem', fontWeight: '700', marginTop: '0.4rem' }}>
                          <User size={13} />
                          <span>{featured.author}</span>
                        </div>
                      </div>
                      {/* FEATURED pill */}
                      <div style={{ position: 'absolute', top: '1.25rem', left: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(10,17,65,0.75)', backdropFilter: 'blur(6px)', padding: '0.3rem 0.75rem', borderRadius: '2px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ca8a04' }} />
                        <span style={{ color: '#ca8a04', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Featured</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      backgroundColor: '#0a1141', padding: '3.5rem 3rem',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      minHeight: '280px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute', top: '-10%', right: '-10%', width: '150px', height: '150px',
                        background: 'radial-gradient(circle, rgba(202,138,4,0.15) 0%, transparent 70%)',
                        pointerEvents: 'none'
                      }} />

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ca8a04' }} />
                        <span style={{ color: '#ca8a04', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                          FEATURED Announcement
                        </span>
                      </div>
                      <div>
                        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={14} /> {formatDate(featured.date)}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <BookOpen size={14} /> {readTime(featured.content)} min read
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ca8a04', fontSize: '0.82rem', fontWeight: '700' }}>
                          <User size={14} />
                          <span>{featured.author}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Right: content */}
                  <div style={{ padding: '3.5rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.25rem' }}>
                    <h2 style={{ margin: 0, fontSize: 'clamp(1.4rem,2.5vw,1.95rem)', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                      {featured.title}
                    </h2>
                    <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.8, display: '-webkit-box', WebkitLineClamp: expandedId === featured.id ? 'unset' : 3, WebkitBoxOrient: 'vertical', overflow: expandedId === featured.id ? 'visible' : 'hidden', whiteSpace: 'pre-wrap' }}>
                      {featured.content}
                    </p>
                    <button style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: '#ca8a04', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', padding: 0 }}>
                      {expandedId === featured.id ? 'Show Less' : 'Read Full Post'} <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              </div>
            </section>
          )}

          {/* ── MORE POSTS ─────────────────────────────── */}
          {rest.length > 0 && (
            <section style={{ padding: 'clamp(4rem,6vw,6rem) clamp(1.5rem,5vw,4rem)' }}>
              <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem' }}>
                  <div style={{ width: '32px', height: '2px', backgroundColor: '#ca8a04' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ca8a04' }}>
                    All Publications
                  </span>
                </div>

                <div className="blogs-grid">
                  {rest.map((blog, idx) => (
                    <article
                      key={blog.id}
                      onClick={() => setExpandedId(expandedId === blog.id ? null : blog.id)}
                      className="blog-card"
                    >
                      {/* Left vertical tag stripe */}
                      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: TAG_COLORS[idx % TAG_COLORS.length] }} />

                      {/* Optional featured image strip */}
                      {blog.image_url && (
                        <div style={{ margin: '-2.5rem -2rem 1rem -2rem', height: '180px', overflow: 'hidden', position: 'relative' }}>
                          <img
                            src={blog.image_url}
                            alt={blog.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={e => { e.currentTarget.parentElement.style.display = 'none'; }}
                          />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,17,65,0.35) 0%, transparent 60%)' }} />
                        </div>
                      )}

                      {/* Meta row */}
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600' }}>
                          <Calendar size={13} /> {formatDate(blog.date)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600' }}>
                          <BookOpen size={13} /> {readTime(blog.content)} min
                        </span>
                      </div>

                      {/* Title */}
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#0a1141', fontFamily: 'var(--font-heading)', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                        {blog.title}
                      </h3>

                      {/* Content — collapses/expands */}
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.8, display: '-webkit-box', WebkitLineClamp: expandedId === blog.id ? 'unset' : 3, WebkitBoxOrient: 'vertical', overflow: expandedId === blog.id ? 'visible' : 'hidden', whiteSpace: 'pre-wrap' }}>
                        {blog.content}
                      </p>

                      {/* Author + read toggle */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(10, 17, 65, 0.05)' }}>
                        <span style={{ fontSize: '0.78rem', color: '#0a1141', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <User size={13} color="#ca8a04" /> {blog.author}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#ca8a04', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {expandedId === blog.id ? 'Collapse' : 'Read Post'} <ArrowRight size={13} />
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

      {/* ── DARK FOOTER STRIP ────────────────────────────── */}
      <section style={{ backgroundColor: '#0a1141', padding: '3.5rem clamp(1.5rem,5vw,4rem)', borderTop: '1px solid rgba(202,138,4,0.2)', marginTop: '4rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <p style={{ margin: '0 0 0.35rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              RALWBC · Newsroom
            </p>
            <p style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: '800', fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em' }}>
              "Go ye therefore, and teach all nations." — Matt 28:19
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <img src="/logo.png" alt="RA Logo" style={{ width: '48px', objectFit: 'contain', opacity: 0.9 }} />
            <img src="/lwbc-logo.png" alt="LWBC" style={{ width: '48px', objectFit: 'contain', opacity: 0.9 }} />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .featured-article {
          background: #ffffff;
          border: 1px solid rgba(10, 17, 65, 0.08);
          border-radius: 24px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          box-shadow: 0 10px 40px rgba(10, 17, 65, 0.03);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .featured-article:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 60px rgba(10, 17, 65, 0.1);
          border-color: rgba(202, 138, 4, 0.3);
        }

        .blogs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2.5rem;
          width: 100%;
        }

        .blog-card {
          background: #ffffff;
          border: 1px solid rgba(10, 17, 65, 0.06);
          border-radius: 20px;
          padding: 2.5rem 2rem;
          box-shadow: 0 4px 25px rgba(10, 17, 65, 0.02);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .blog-card:hover {
          transform: translateY(-8px);
          border-color: rgba(202, 138, 4, 0.25);
          box-shadow: 0 20px 45px rgba(10, 17, 65, 0.08);
        }

        @media (max-width: 768px) {
          .featured-article {
            grid-template-columns: 1fr !important;
          }
          .blogs-grid {
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Blogs;
