import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { AntiCheatGuard } from '../../components/AntiCheatGuard';
import { Clock, ShieldAlert, AlertTriangle, CheckCircle, CheckSquare } from 'lucide-react';

// ── Deterministic seeded shuffle ─────────────────────────────────────────────
// Same userId+examId → same shuffled order every time (for resume support).
// Different userId → different order (anti-collusion).
function seededShuffle(array, seed) {
  const arr = [...array];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function hashSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
// ─────────────────────────────────────────────────────────────────────────────

export const Examination = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]); // shuffled order for this user
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [warningsCount, setWarningsCount] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sessionClosed, setSessionClosed] = useState(false);

  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [infractionLogs, setInfractionLogs] = useState([]);

  // React Router v7 useBlocker implementation
  const blocker = useBlocker(({ nextLocation }) => {
    return !isSubmitted;
  });

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const confirmLeave = window.confirm(
        "WARNING: The exam is in progress! If you navigate away, your progress will not be saved and this will count as an incomplete attempt. Do you want to leave?"
      );
      if (confirmLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  // Window beforeunload implementation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isSubmitted) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to exit? Your exam is in progress and will be lost.";
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSubmitted]);

  const storageKey = `ralwbc_active_exam_${currentUser.id}_${id}`;

  const timeRemainingRef = useRef(0);
  const answersRef = useRef({});
  const warningsRef = useRef(0);
  const infractionLogsRef = useRef([]);
  const flaggedRef = useRef({});
  const timerIntervalRef = useRef(null);
  const sessionPollRef = useRef(null);

  const saveSessionToStorage = (time, currAnswers, currWarnings, currLogs, currFlagged) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        timeRemaining: time,
        answers: currAnswers,
        warningsCount: currWarnings,
        infractionLogs: currLogs,
        flaggedQuestions: currFlagged
      }));
    } catch (e) {
      console.error('Failed to save active exam session state', e);
    }
  };

  useEffect(() => {
    dbService.init();
    const fetchedExam = dbService.getExamById(id);
    if (!fetchedExam || !fetchedExam.isActive) {
      alert('Exam not found or is currently inactive.');
      navigate('/dashboard');
      return;
    }

    const existingSub = dbService.getSubmissionForUserAndExam(currentUser.id, id);
    if (existingSub) {
      alert('You have already taken this exam.');
      navigate('/dashboard');
      return;
    }

    // ── Seeded deterministic shuffle ────────────────────────────────────────
    // Seed = hash of userId + examId so each student gets a unique but stable order
    const seed = hashSeed(currentUser.id + id);
    const shuffled = seededShuffle(fetchedExam.questions, seed);
    setShuffledQuestions(shuffled);

    setExam(fetchedExam);
    setLoading(false);

    // Resume saved session if it exists
    const savedSession = localStorage.getItem(storageKey);
    let initialTime = fetchedExam.duration * 60;
    let initialAnswers = {};
    let initialWarnings = 0;
    let initialLogs = [];
    let initialFlagged = {};

    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        initialTime = typeof parsed.timeRemaining === 'number' ? parsed.timeRemaining : initialTime;
        initialAnswers = parsed.answers || {};
        initialWarnings = typeof parsed.warningsCount === 'number' ? parsed.warningsCount : 0;
        initialLogs = parsed.infractionLogs || [];
        initialFlagged = parsed.flaggedQuestions || {};
      } catch (e) {
        console.error('Failed to parse saved exam session', e);
      }
    }

    setTimeRemaining(initialTime);
    timeRemainingRef.current = initialTime;
    setAnswers(initialAnswers);
    answersRef.current = initialAnswers;
    setWarningsCount(initialWarnings);
    warningsRef.current = initialWarnings;
    setInfractionLogs(initialLogs);
    infractionLogsRef.current = initialLogs;
    setFlaggedQuestions(initialFlagged);
    flaggedRef.current = initialFlagged;

    // ── Countdown timer ────────────────────────────────────────────────────
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const next = prev <= 1 ? 0 : prev - 1;
        timeRemainingRef.current = next;
        saveSessionToStorage(next, answersRef.current, warningsRef.current, infractionLogsRef.current, flaggedRef.current);
        if (next === 0) {
          clearInterval(timerIntervalRef.current);
          if (submitExamResultsRef.current) submitExamResultsRef.current('TIME_EXPIRED');
        }
        return next;
      });
    }, 1000);

    // ── Session expiry polling (every 60s) ─────────────────────────────────
    // If the admin closes the session while a student is mid-exam, auto-submit.
    sessionPollRef.current = setInterval(() => {
      if (!dbService.isSessionActive()) {
        clearInterval(timerIntervalRef.current);
        clearInterval(sessionPollRef.current);
        setSessionClosed(true);
        // Give student 5 seconds to see the notice then auto-submit
        setTimeout(() => {
          if (submitExamResultsRef.current) submitExamResultsRef.current('SESSION_CLOSED');
        }, 5000);
      }
    }, 60000);

    return () => {
      clearInterval(timerIntervalRef.current);
      clearInterval(sessionPollRef.current);
    };
  }, [id, currentUser, navigate]);

  const handleSelectOption = (questionId, option) => {
    const updated = { ...answers, [questionId]: option };
    setAnswers(updated);
    answersRef.current = updated;
    saveSessionToStorage(timeRemainingRef.current, updated, warningsRef.current, infractionLogsRef.current, flaggedRef.current);
  };

  const handleToggleFlag = (questionId) => {
    setFlaggedQuestions(prev => {
      const updated = { ...prev, [questionId]: !prev[questionId] };
      flaggedRef.current = updated;
      saveSessionToStorage(timeRemainingRef.current, answersRef.current, warningsRef.current, infractionLogsRef.current, updated);
      return updated;
    });
  };

  const handleWarningTriggered = (count, reason) => {
    setWarningsCount(count);
    warningsRef.current = count;
    const newLog = { timestamp: new Date().toISOString(), reason: reason || 'Unknown Infraction' };
    setInfractionLogs(prev => {
      const updated = [...prev, newLog];
      infractionLogsRef.current = updated;
      saveSessionToStorage(timeRemainingRef.current, answersRef.current, count, updated, flaggedRef.current);
      return updated;
    });
  };

  const handleAutoSubmitDueToCheating = () => submitExamResults('SECURITY_VIOLATION');
  const handleManualSubmit = (e) => { if (e) e.preventDefault(); setShowConfirmModal(true); };

  const submitExamResults = (method = 'MANUAL_SUBMIT') => {
    clearInterval(timerIntervalRef.current);
    clearInterval(sessionPollRef.current);
    try {
      const totalDuration = exam ? exam.duration * 60 : 0;
      const durationSpent = Math.max(1, totalDuration - timeRemainingRef.current);
      dbService.submitExam(
        currentUser.id, currentUser.name, exam.id, exam.title,
        answersRef.current, warningsRef.current, durationSpent, infractionLogsRef.current
      );
      localStorage.removeItem(storageKey);
      setIsSubmitted(true);
    } catch (error) {
      alert('Error saving exam submission: ' + error.message);
      navigate('/dashboard');
    }
  };

  const submitExamResultsRef = useRef(submitExamResults);
  useEffect(() => { submitExamResultsRef.current = submitExamResults; });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Count answered questions
  const answeredCount = shuffledQuestions.filter(q => !!answers[q.id]).length;
  const totalCount = shuffledQuestions.length;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>Loading exam content...</div>;
  }

  // Session closed mid-exam notice
  if (sessionClosed && !isSubmitted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem', minHeight: '70vh' }}>
        <div className="glass-panel-glow" style={{ maxWidth: '520px', width: '100%', padding: '3rem', textAlign: 'center', border: '1px solid rgba(234,179,8,0.3)', backgroundColor: '#0b0f19', color: '#ffffff' }}>
          <ShieldAlert size={56} color="#eab308" style={{ marginBottom: '1.5rem', display: 'inline-block' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#ffffff' }}>Session Has Ended</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6' }}>
            The exam session was closed by the committee while you were writing. Your answers are being automatically submitted now...
          </p>
        </div>
      </div>
    );
  }

  // Success screen
  if (isSubmitted) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem', minHeight: '70vh' }}>
        <div className="glass-panel-glow" style={{ maxWidth: '550px', width: '100%', padding: '3rem', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.3)', backgroundColor: '#0b0f19', color: '#ffffff' }}>
          <CheckCircle size={56} color="var(--success)" style={{ marginBottom: '1.5rem', display: 'inline-block' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#ffffff' }}>Exam Submitted Successfully!</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Thank you, <strong style={{ color: '#ffffff' }}>{currentUser.name}</strong>. Your answers for <strong>{exam.title}</strong> have been saved and scored.
          </p>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '2rem', fontSize: '0.9rem' }}>
            <div style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#94a3b8' }}>Status:</strong> Marked &amp; Saved</div>
            <div style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#94a3b8' }}>Security warnings flagged:</strong> {warningsCount}</div>
            <div><strong style={{ color: '#94a3b8' }}>Grade access:</strong> Secured with the Exam Committee (Scores are not displayed to candidates).</div>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-full">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const activeQuestion = shuffledQuestions[activeIdx];
  if (!activeQuestion) return null;

  return (
    <AntiCheatGuard onWarning={handleWarningTriggered} onAutoSubmit={handleAutoSubmitDueToCheating} maxWarnings={3} initialWarnings={warningsCount}>
      <div className="animate-fade-in" style={{ padding: '2rem 0 5rem' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* Main Question Sheet */}
          <div>
            {/* Header */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>{exam.title}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Select an option for each question using the navigation pills below.
                </p>
              </div>
              {/* Progress indicator */}
              <div style={{
                padding: '0.5rem 1rem', borderRadius: '8px',
                backgroundColor: answeredCount === totalCount ? 'rgba(16,185,129,0.1)' : 'rgba(37,99,235,0.1)',
                border: `1px solid ${answeredCount === totalCount ? 'rgba(16,185,129,0.3)' : 'rgba(37,99,235,0.3)'}`,
                fontSize: '0.85rem', fontWeight: '700',
                color: answeredCount === totalCount ? '#10b981' : 'var(--primary)',
                display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}>
                <CheckSquare size={15} />
                {answeredCount} / {totalCount} answered
              </div>
            </div>

            {/* Question Navigation Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }} aria-label="Question Navigator">
              {shuffledQuestions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isActive = idx === activeIdx;
                const isFlagged = !!flaggedQuestions[q.id];
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      border: isActive ? '2px solid var(--accent)' : (isFlagged ? '2px solid var(--warning)' : '1px solid var(--border-color)'),
                      backgroundColor: isActive ? 'var(--accent)' : (isAnswered ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.02)'),
                      color: isActive ? '#ffffff' : (isFlagged ? 'var(--warning)' : (isAnswered ? 'var(--success)' : 'var(--text-secondary)')),
                      fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', transition: 'all 0.15s ease'
                    }}
                    title={`Question ${idx + 1}${isAnswered ? ' (answered)' : ''}${isFlagged ? ' (flagged)' : ''}`}
                  >
                    {idx + 1}
                    {isFlagged && !isActive && (
                      <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)', border: '1px solid #ffffff' }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Question Box */}
            <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', margin: 0, flex: 1 }}>
                  <span style={{ color: 'var(--accent)' }}>Q{activeIdx + 1}.</span>
                  <span>{activeQuestion.text}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => handleToggleFlag(activeQuestion.id)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
                    border: flaggedQuestions[activeQuestion.id] ? '1px solid var(--warning)' : '1px solid var(--border-color)',
                    backgroundColor: flaggedQuestions[activeQuestion.id] ? 'rgba(202,138,4,0.1)' : 'transparent',
                    color: flaggedQuestions[activeQuestion.id] ? 'var(--warning)' : 'var(--text-muted)',
                    fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <span>🚩</span>
                  <span>{flaggedQuestions[activeQuestion.id] ? 'Flagged' : 'Flag Question'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {activeQuestion.options.map(option => {
                  const isChecked = answers[activeQuestion.id] === option;
                  return (
                    <label
                      key={option}
                      className="option-label"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '1.1rem',
                        backgroundColor: isChecked ? 'var(--primary-light)' : 'rgba(255,255,255,0.02)',
                        border: isChecked ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        transition: 'all var(--transition-fast)', position: 'relative'
                      }}
                    >
                      <input
                        type="radio"
                        name={`q-${activeQuestion.id}`}
                        value={option}
                        checked={isChecked}
                        onChange={() => handleSelectOption(activeQuestion.id, option)}
                        style={{ accentColor: 'var(--primary)', width: '1.1rem', height: '1.1rem' }}
                      />
                      {/* Show option image if present */}
                      {activeQuestion.optionImages?.[activeQuestion.options.indexOf(option)] && (
                        <img
                          src={activeQuestion.optionImages[activeQuestion.options.indexOf(option)]}
                          alt=""
                          style={{ height: '36px', maxWidth: '60px', borderRadius: '4px', objectFit: 'contain' }}
                        />
                      )}
                      <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Bottom Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                disabled={activeIdx === 0}
                onClick={() => setActiveIdx(prev => prev - 1)}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.75rem' }}
              >
                Previous
              </button>
              {activeIdx < shuffledQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveIdx(prev => prev + 1)}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.75rem' }}
                >
                  Next Question
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleManualSubmit}
                  className="btn btn-accent"
                  style={{ padding: '0.75rem 1.75rem' }}
                >
                  Finish &amp; Submit Exam
                </button>
              )}
            </div>
          </div>

          {/* Sticky Timer & Proctoring Sidebar */}
          <div style={{ position: 'sticky', top: '5.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <Clock size={20} color="var(--primary)" />
                <h4 style={{ fontSize: '1rem' }}>Remaining Time</h4>
              </div>
              <div
                aria-live="polite"
                aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
                className={timeRemaining < 180 ? 'timer-urgent' : ''}
                style={{
                  fontFamily: 'monospace', fontSize: '2.2rem', fontWeight: 'bold',
                  textAlign: 'center',
                  color: timeRemaining < 180 ? 'var(--danger)' : 'var(--text-primary)',
                  letterSpacing: '1px'
                }}
              >
                {formatTime(timeRemaining)}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <ShieldAlert size={20} color="var(--warning)" />
                <h4 style={{ fontSize: '1rem' }}>Security Proctoring</h4>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>Infractions:</span>
                <strong style={{ color: warningsCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {warningsCount} / 3 warnings
                </strong>
              </div>
              {warningsCount > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#f87171' }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  <span>Warnings recorded. Do NOT leave page again to avoid auto-submitting.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11,15,25,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', zIndex: 10000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ maxWidth: '460px', width: '100%', padding: '2.5rem', textAlign: 'center', border: '2px solid var(--border-color)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <ShieldAlert size={48} color="var(--warning)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Submit Examination?</h3>
            {shuffledQuestions.some(q => !answers[q.id]) ? (
              <p style={{ color: '#f87171', fontSize: '0.95rem', marginBottom: '2rem', fontWeight: 'bold', lineHeight: 1.5 }}>
                WARNING: You have {shuffledQuestions.filter(q => !answers[q.id]).length} unanswered question(s). Are you sure you want to finish and submit now?
              </p>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.5 }}>
                All questions answered. Are you sure you want to finish and submit your exam? You cannot re-attempt after submitting.
              </p>
            )}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={() => setShowConfirmModal(false)} className="btn btn-secondary btn-full">Cancel</button>
              <button type="button" onClick={() => { setShowConfirmModal(false); submitExamResults('MANUAL_SUBMIT'); }} className="btn btn-accent btn-full">Yes, Submit Exam</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes timerPulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.04); opacity: 0.85; }
          100% { transform: scale(1); opacity: 1; }
        }
        .timer-urgent { animation: timerPulse 0.8s infinite ease-in-out; }
        .option-label:focus-within { outline: 2px solid var(--accent); outline-offset: 2px; }
        @media (max-width: 968px) {
          .container { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AntiCheatGuard>
  );
};

export default Examination;
