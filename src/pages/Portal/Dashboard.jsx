import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dbService, getRankLabel } from '../../services/db';
import {
  BookOpen, CheckCircle, Clock, ShieldAlert,
  ArrowRight, User, CalendarClock, Lock, Timer
} from 'lucide-react';
// seededShuffle is used only in Examination.jsx; import removed (was duplicate dead code)


export const Dashboard = () => {
  const { currentUser } = useAuth();
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [session, setSession] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [countdown, setCountdown] = useState(null); // { d, h, m, s }
  const navigate = useNavigate();
  const countdownRef = useRef(null);
  const sessionPollRef = useRef(null);

  useEffect(() => {
    dbService.init();

    const loadData = () => {
      // Filter active exams matching user's rankCategory
      const allExams = dbService.getExams().filter(
        e => e.isActive && (!e.category || !currentUser.rankCategory || e.category === currentUser.rankCategory)
      );
      setExams(allExams);

      const subs = dbService.getSubmissionsByUser(currentUser.id);
      const subMap = {};
      subs.forEach(s => { subMap[s.examId] = s; });
      setSubmissions(subMap);
    };

    const loadSession = () => {
      const s = dbService.getSession();
      setSession(s);
      const active = dbService.isSessionActive();
      setSessionActive(active);
      return { session: s, active };
    };

    loadData();
    const { session: s, active } = loadSession();

    // ── Countdown timer to session open ─────────────────────────────────────
    if (!active && s && s.startDate) {
      const tick = () => {
        const now    = new Date();
        const time   = s.startTime || '08:00';
        const target = new Date(s.startDate + 'T' + time + ':00');
        const diff = target - now;
        if (diff <= 0) {
          setCountdown(null);
          clearInterval(countdownRef.current);
        } else {
          const d = Math.floor(diff / 86400000);
          const h = Math.floor((diff % 86400000) / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const sec = Math.floor((diff % 60000) / 1000);
          setCountdown({ d, h, m, s: sec });
        }
      };
      tick();
      countdownRef.current = setInterval(tick, 1000);
    }

    // ── Session polling — re-check every 60s ────────────────────────────────
    sessionPollRef.current = setInterval(() => {
      const newActive = dbService.isSessionActive();
      setSessionActive(newActive);
      if (newActive) {
        clearInterval(countdownRef.current);
        setCountdown(null);
        // Reload exams when session opens
        loadData();
      }
    }, 60000);

    return () => {
      clearInterval(countdownRef.current);
      clearInterval(sessionPollRef.current);
    };
  }, [currentUser]);

  const handleStartExam = (examId) => {
    setSelectedExamId(examId);
    setShowStartModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    try {
      return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="animate-fade-in" style={{ padding: '3rem 0' }}>
      <section className="container">
        {/* Welcome Banner */}
        <div className="glass-panel-glow" style={{
          padding: '2.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(18, 24, 38, 0.7) 100%)'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome, {currentUser.name}!</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Conference Ambassador Portal &bull; {getRankLabel(currentUser.rankCategory)}
            </p>
          </div>
          <Link to="/profile" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <User size={16} /> Edit Profile
          </Link>
        </div>

        {/* ── Session Status Banner ───────────────────────────────────────── */}
        {!sessionActive && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1.25rem 1.75rem',
            marginBottom: '2rem',
            borderRadius: '12px',
            border: '1px solid rgba(234, 179, 8, 0.35)',
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, rgba(18, 24, 38, 0.7) 100%)',
            boxShadow: '0 4px 20px rgba(234, 179, 8, 0.08)'
          }}>
            <CalendarClock size={22} color="#eab308" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '700', fontSize: '1rem', color: '#eab308', marginBottom: '0.25rem' }}>
                Exam Portal is Currently Closed
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: countdown ? '1rem' : 0 }}>
                The ranking examination portal will only be accessible during the designated Camping Session.
                {session && session.startDate && session.endDate ? (
                  <> The next session is scheduled from&nbsp;
                    <strong style={{ color: 'var(--text-primary)' }}>{formatDate(session.startDate)}</strong>
                    &nbsp;to&nbsp;
                    <strong style={{ color: 'var(--text-primary)' }}>{formatDate(session.endDate)}</strong>.
                  </>
                ) : (
                  <> Session dates have not yet been announced. Please check back later.</>
                )}
              </p>

              {/* Live countdown */}
              {countdown && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Days', val: countdown.d },
                    { label: 'Hours', val: countdown.h },
                    { label: 'Mins', val: countdown.m },
                    { label: 'Secs', val: countdown.s }
                  ].map(({ label, val }) => (
                    <div key={label} style={{
                      textAlign: 'center',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(234, 179, 8, 0.12)',
                      border: '1px solid rgba(234,179,8,0.3)',
                      minWidth: '56px'
                    }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#eab308', fontFamily: 'monospace', lineHeight: 1 }}>
                        {pad(val)}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {label}
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Timer size={14} /> Opens in...
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="dashboard-grid" style={{
          display: 'grid',
          gridTemplateColumns: '3fr 1fr',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          {/* Main Exams List */}
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="var(--accent)" /> Available Ranking Exams
            </h2>

            {exams.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {exams.map(exam => {
                  const submission = submissions[exam.id];
                  const isSubmitted = !!submission;

                  // Generate deterministic shuffled question order for preview count (actual shuffle in Examination.jsx)
                  return (
                    <div
                      key={exam.id}
                      className="glass-panel"
                      style={{
                        padding: '2rem',
                        borderLeft: isSubmitted ? '4px solid var(--success)' : '4px solid var(--primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.3rem', margin: 0 }}>{exam.title}</h3>
                        {isSubmitted ? (
                          <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle size={12} /> Submitted &amp; Marked
                          </span>
                        ) : (
                          <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} /> Timed Exam
                          </span>
                        )}
                      </div>

                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                        {exam.description}
                      </p>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '1rem',
                        marginTop: '0.5rem',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}>
                        <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          <div><strong>Questions:</strong> {exam.questions.length} items</div>
                          <div><strong>Duration:</strong> {exam.duration} minutes</div>
                        </div>

                        {isSubmitted ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.6 }}>
                              Exam Finished
                            </button>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ) : sessionActive ? (
                          <button
                            onClick={() => handleStartExam(exam.id)}
                            className="btn btn-accent btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            Start Exam <ArrowRight size={14} />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', opacity: 0.55, cursor: 'not-allowed' }}
                          >
                            <Lock size={13} /> Portal Closed
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Clock size={40} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
                <p>No active exams are assigned to your rank at this moment.</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Please check back during the designated annual conference calendar dates.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Guidelines */}
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', margin: 0 }}>
              Portal Security Rules
            </h3>

            {[
              { title: 'Single Attempt Only:', body: 'You can only open and take the exam once. Double entries are blocked.' },
              { title: 'Secure Proctoring:', body: 'The exam monitors visibility state. Minimizing the browser or switching tabs triggers warnings. After 3 warnings, the test is auto-submitted immediately.' },
              { title: 'Hidden Scoring:', body: 'Your exam score will be marked automatically, but you will not see the grade. The scores are secure and only visible to the conference committee.' }
            ].map(({ title, body }) => (
              <div key={title} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                <ShieldAlert size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <div><strong>{title}</strong> {body}</div>
              </div>
            ))}

            {/* Live status pill */}
            <div style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: sessionActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(234, 179, 8, 0.08)',
              border: `1px solid ${sessionActive ? 'rgba(16,185,129,0.25)' : 'rgba(234,179,8,0.25)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: sessionActive ? '#10b981' : '#eab308'
            }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: sessionActive ? '#10b981' : '#eab308',
                display: 'inline-block',
                boxShadow: sessionActive ? '0 0 6px rgba(16,185,129,0.6)' : '0 0 6px rgba(234,179,8,0.6)'
              }} />
              Portal: {sessionActive ? 'Open — Session Active' : 'Closed — Awaiting Session'}
            </div>
          </div>
        </div>
      </section>

      {/* Start Exam Modal */}
      {showStartModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(11, 15, 25, 0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem', zIndex: 10000, backdropFilter: 'blur(4px)'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '520px', width: '100%', padding: '2.5rem',
            textAlign: 'left', border: '2px solid var(--primary)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{
              fontSize: '1.4rem', color: 'var(--text-primary)', textAlign: 'center',
              borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem'
            }}>
              Secure Exam Regulations
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
              {[
                'This exam is <strong>TIMED</strong>. Once you begin, the proctoring timer cannot be paused.',
                'Do <strong>NOT</strong> switch tabs, leave the page, or minimize the window. Doing so triggers warnings.',
                'Receiving <strong>3 warnings</strong> results in automatic security disqualification &amp; submission.',
                'Right-click, long-press, copy, and paste shortcuts are disabled inside the exam context.'
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem' }}>
                  <strong style={{ color: 'var(--accent)', flexShrink: 0 }}>{i + 1}.</strong>
                  <span dangerouslySetInnerHTML={{ __html: text }} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={() => setShowStartModal(false)} className="btn btn-secondary btn-full">
                Go Back
              </button>
              <button
                type="button"
                onClick={() => { setShowStartModal(false); navigate(`/exam/${selectedExamId}`); }}
                className="btn btn-accent btn-full"
              >
                I Agree &amp; Start Exam
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 968px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
