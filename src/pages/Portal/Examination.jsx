import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { AntiCheatGuard } from '../../components/AntiCheatGuard';
import { ConfirmDialog } from '../../components/Toast';
import { hashSeed, seededShuffle } from '../../utils/shuffle';
import { Clock, ShieldAlert, AlertTriangle, CheckCircle, CheckSquare, Send, WifiOff } from 'lucide-react';

export const Examination = () => {
  const { id }          = useParams();
  const { currentUser } = useAuth();
  const navigate        = useNavigate();

  const [exam, setExam]                       = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [answers, setAnswers]                 = useState({});
  const [timeRemaining, setTimeRemaining]     = useState(0);
  const [warningsCount, setWarningsCount]     = useState(0);
  const [isSubmitted, setIsSubmitted]         = useState(false);
  const [loading, setLoading]                 = useState(true);
  const [activeIdx, setActiveIdx]             = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sessionClosed, setSessionClosed]     = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [infractionLogs, setInfractionLogs]   = useState([]);
  const [isOnline, setIsOnline]               = useState(navigator.onLine);       // Fix C
  const [submissionError, setSubmissionError] = useState(null); // Fix A: null | 'NETWORK' | 'RETRYING'
  const [showReconnected, setShowReconnected] = useState(false);
  const prevOnlineRef = useRef(isOnline);

  useEffect(() => {
    if (isOnline && !prevOnlineRef.current) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  // ── Race-condition guard: prevents double-submit from timer + session poll ──
  const isSubmittingRef = useRef(false);

  // ── Fix stale closure by using a ref for isSubmitted ────────────
  const isSubmittedRef = useRef(false);
  useEffect(() => { isSubmittedRef.current = isSubmitted; }, [isSubmitted]);

  // Window beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isSubmittedRef.current) {
        e.preventDefault();
        e.returnValue = 'The exam is in progress. Leaving will count as an incomplete attempt.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // ── Fix C: Online / Offline detection ────────────────────────────────────
  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const storageKey = `ralwbc_active_exam_${currentUser.id}_${id}`;

  // Refs for use inside intervals (avoid stale closures)
  const timeRemainingRef   = useRef(0);
  const answersRef         = useRef({});
  const warningsRef        = useRef(0);
  const infractionLogsRef  = useRef([]);
  const flaggedRef         = useRef({});
  const timerIntervalRef   = useRef(null);
  const sessionPollRef     = useRef(null);
  const examRef            = useRef(null);

  const saveSessionToStorage = (time, currAnswers, currWarnings, currLogs, currFlagged) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        timeRemaining: time, answers: currAnswers,
        warningsCount: currWarnings, infractionLogs: currLogs, flaggedQuestions: currFlagged,
      }));
    } catch { /* quota exceeded during session save — non-critical */ }
  };

  // Keep submitExamResults in a ref so the interval can always call the latest version
  const submitExamResultsRef = useRef(null);

  const submitExamResults = useCallback(async (method = 'MANUAL_SUBMIT') => {
    if (isSubmittingRef.current) return; // guard against race condition
    isSubmittingRef.current = true;

    clearInterval(timerIntervalRef.current);
    clearInterval(sessionPollRef.current);

    try {
      const currentExam   = examRef.current;
      const totalDuration = currentExam ? currentExam.duration * 60 : 0;
      const durationSpent = Math.max(1, totalDuration - timeRemainingRef.current);
      // Fix B: pass pre-loaded questions to skip a redundant DB fetch on weak connections
      await dbService.submitExam(
        currentUser.id, currentUser.name,
        currentExam.id, currentExam.title,
        answersRef.current, warningsRef.current,
        durationSpent, infractionLogsRef.current,
        currentExam.questions,
      );
      localStorage.removeItem(storageKey);
      setIsSubmitted(true);
    } catch (error) {
      isSubmittingRef.current = false; // Fix A: allow retry attempts
      const alreadySubmitted = error?.message?.toLowerCase().includes('already submitted');
      if (alreadySubmitted) {
        // Confirmed duplicate — safe to wipe local data and redirect
        localStorage.removeItem(storageKey);
        navigate('/dashboard');
      } else {
        // Fix A: network / timeout failure — keep answers safe in localStorage, show retry UI
        setSubmissionError('NETWORK');
      }
    }
  }, [currentUser, navigate, storageKey]);

  // Keep the ref current every render
  useEffect(() => { submitExamResultsRef.current = submitExamResults; });

  useEffect(() => {
    dbService.init();

    const initExam = async () => {
      try {
        const fetchedExam = await dbService.getExamById(id);
        if (!fetchedExam || !fetchedExam.isActive) {
          navigate('/dashboard');
          return;
        }

        const existingSub = await dbService.getSubmissionForUserAndExam(currentUser.id, id);
        if (existingSub) {
          navigate('/dashboard');
          return;
        }

        // Seeded deterministic shuffle
        const seed     = hashSeed(currentUser.id + id);
        const shuffled = seededShuffle(fetchedExam.questions, seed);
        setShuffledQuestions(shuffled);
        setExam(fetchedExam);
        examRef.current = fetchedExam;
        setLoading(false);

        // Resume saved session
        const savedSession = localStorage.getItem(storageKey);
        let initialTime     = fetchedExam.duration * 60;
        let initialAnswers  = {};
        let initialWarnings = 0;
        let initialLogs     = [];
        let initialFlagged  = {};

        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            initialTime     = typeof parsed.timeRemaining === 'number' ? parsed.timeRemaining : initialTime;
            initialAnswers  = parsed.answers || {};
            initialWarnings = typeof parsed.warningsCount === 'number' ? parsed.warningsCount : 0;
            initialLogs     = parsed.infractionLogs || [];
            initialFlagged  = parsed.flaggedQuestions || {};
          } catch { /* ignore corrupted session */ }
        }

        setTimeRemaining(initialTime);    timeRemainingRef.current  = initialTime;
        setAnswers(initialAnswers);       answersRef.current        = initialAnswers;
        setWarningsCount(initialWarnings); warningsRef.current      = initialWarnings;
        setInfractionLogs(initialLogs);   infractionLogsRef.current = initialLogs;
        setFlaggedQuestions(initialFlagged); flaggedRef.current     = initialFlagged;

        // ── Countdown timer ──────────────────────────────────────────────────────
        timerIntervalRef.current = setInterval(() => {
          setTimeRemaining(prev => {
            const next = prev <= 1 ? 0 : prev - 1;
            timeRemainingRef.current = next;
            saveSessionToStorage(next, answersRef.current, warningsRef.current, infractionLogsRef.current, flaggedRef.current);
            if (next === 0) {
              clearInterval(timerIntervalRef.current);
              submitExamResultsRef.current?.('TIME_EXPIRED');
            }
            return next;
          });
        }, 1000);

        // ── Session expiry poll (every 60s) ──────────────────────────────────────
        sessionPollRef.current = setInterval(async () => {
          try {
            // Fix D: wrap in try/catch so a network error here never crashes the exam tab
            const active = await dbService.isSessionActive();
            if (!active) {
              clearInterval(timerIntervalRef.current);
              clearInterval(sessionPollRef.current);
              setSessionClosed(true);
              setTimeout(() => submitExamResultsRef.current?.('SESSION_CLOSED'), 5000);
            }
          } catch (pollErr) {
            // Silently ignore network errors during the poll — will retry on next interval
            console.warn('Session poll failed (network):', pollErr?.message);
          }
        }, 60000);
      } catch (err) {
        console.error('Failed to initialize exam:', err);
        navigate('/dashboard');
      }
    };

    initExam();

    return () => {
      clearInterval(timerIntervalRef.current);
      clearInterval(sessionPollRef.current);
    };
  }, [id, currentUser, navigate]); // eslint-disable-line

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
  const handleManualSubmit = () => setShowConfirmModal(true);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Focus trap ref for confirm modal
  const confirmModalRef = useRef(null);
  useEffect(() => {
    if (showConfirmModal && confirmModalRef.current) {
      confirmModalRef.current.focus();
    }
  }, [showConfirmModal]);

  const answeredCount = shuffledQuestions.filter(q => !!answers[q.id]).length;
  const totalCount    = shuffledQuestions.length;
  const unansweredCount = totalCount - answeredCount;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
        Loading exam content...
      </div>
    );
  }

  // Session closed mid-exam notice
  if (sessionClosed && !isSubmitted) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem', minHeight: '70vh', backgroundColor: '#ffffff' }}
      >
        <div className="glass-panel" style={{ maxWidth: '520px', width: '100%', padding: '3rem', textAlign: 'center', border: '1px solid rgba(234,179,8,0.3)' }}>
          <ShieldAlert size={56} color="#eab308" style={{ marginBottom: '1.5rem', display: 'inline-block' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#0a1141' }}>Session Has Ended</h2>
          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6' }}>
            The exam session was closed by the committee while you were writing. Your answers are being automatically submitted now...
          </p>
        </div>
      </div>
    );
  }

  // Success screen
  if (isSubmitted) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem', minHeight: '70vh', backgroundColor: '#ffffff' }}>
        <div className="glass-panel" style={{ maxWidth: '550px', width: '100%', padding: '3rem', textAlign: 'center', border: '1px solid rgba(16,185,129,0.3)' }}>
          <CheckCircle size={56} color="var(--success)" style={{ marginBottom: '1.5rem', display: 'inline-block' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#0a1141' }}>Exam Submitted Successfully!</h2>
          <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Thank you, <strong style={{ color: '#0a1141' }}>{currentUser.name}</strong>. Your answers for <strong>{exam.title}</strong> have been saved and scored.
          </p>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '2rem', fontSize: '0.9rem' }}>
            <div style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#64748b' }}>Status:</strong> Marked &amp; Saved</div>
            <div style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#64748b' }}>Security warnings flagged:</strong> {warningsCount}</div>
            <div><strong style={{ color: '#64748b' }}>Grade access:</strong> Secured with the Exam Committee (Scores are not displayed to candidates).</div>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-full">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  // ── Fix A: Network Submission Failure / Retry Screen ─────────────────────
  if (submissionError) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem', minHeight: '70vh', backgroundColor: '#ffffff' }}>
        <div className="glass-panel" style={{ maxWidth: '520px', width: '100%', padding: '3rem', textAlign: 'center', border: '1px solid rgba(239,68,68,0.3)' }}>
          <WifiOff size={56} color="#ef4444" style={{ marginBottom: '1.5rem', display: 'inline-block' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#0a1141' }}>Submission Failed</h2>
          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '0.75rem' }}>
            Your internet connection dropped while saving your exam.{' '}
            <strong style={{ color: '#16a34a' }}>Your answers are safe</strong> — stored on this device.
          </p>
          <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Check your connection and click <strong>Retry Submission</strong> to send your answers.
          </p>
          {!isOnline && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#ef4444', fontWeight: '600' }}>
              <WifiOff size={15} /> You are offline — waiting for connection to return...
            </div>
          )}
          <button
            type="button"
            disabled={submissionError === 'RETRYING' || !isOnline}
            onClick={() => {
              setSubmissionError('RETRYING');
              isSubmittingRef.current = false;
              submitExamResultsRef.current?.('MANUAL_SUBMIT');
            }}
            style={{
              width: '100%', padding: '0.9rem', borderRadius: '8px', border: 'none',
              backgroundColor: (!isOnline || submissionError === 'RETRYING') ? '#94a3b8' : '#0a1141',
              color: '#ffffff', fontWeight: '700', fontSize: '0.95rem',
              cursor: (!isOnline || submissionError === 'RETRYING') ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'background-color 0.2s',
            }}
          >
            <Send size={16} />
            {submissionError === 'RETRYING'
              ? 'Submitting...'
              : isOnline ? 'Retry Submission' : 'Waiting for Connection...'}
          </button>
        </div>
      </div>
    );
  }

  const activeQuestion = shuffledQuestions[activeIdx];
  if (!activeQuestion) return null;

  return (
    <AntiCheatGuard onWarning={handleWarningTriggered} onAutoSubmit={handleAutoSubmitDueToCheating} maxWarnings={3} initialWarnings={warningsCount}>

      {/* ── Offline Reconnect Banner ── */}
      {!isOnline && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 1000,
          backgroundColor: '#ef4444', color: '#ffffff',
          padding: '0.75rem 1rem', textAlign: 'center',
          fontSize: '0.9rem', fontWeight: '700',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(239,68,68,0.2)'
        }}>
          <WifiOff size={18} />
          <span>📡 Reconnecting to Campsite Router... (Your answers are safe on this device)</span>
        </div>
      )}

      {/* ── Reconnected Success Banner ── */}
      {showReconnected && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 1000,
          backgroundColor: '#16a34a', color: '#ffffff',
          padding: '0.75rem 1rem', textAlign: 'center',
          fontSize: '0.9rem', fontWeight: '700',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(22,163,74,0.2)'
        }}>
          <CheckCircle size={18} />
          <span>🟢 Connected back online! Unsaved answers synchronized.</span>
        </div>
      )}

      {/* ── Mobile sticky timer bar (shown only on small screens) ── */}
      <div className="mobile-timer-bar" style={{
        display: 'none',
        position: 'sticky', top: '44px', zIndex: 20,
        backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0',
        padding: '0.6rem 1rem', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} color={timeRemaining < 180 ? '#ef4444' : '#0a1141'} />
          <span
            aria-live="polite"
            aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
            style={{ fontFamily: 'monospace', fontSize: '1.3rem', fontWeight: 'bold', color: timeRemaining < 180 ? '#ef4444' : '#0a1141' }}
            className={timeRemaining < 180 ? 'timer-urgent' : ''}
          >
            {formatTime(timeRemaining)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {answeredCount}/{totalCount} answered
          </span>
          <button
            type="button"
            onClick={handleManualSubmit}
            style={{
              padding: '0.4rem 0.85rem', borderRadius: '6px',
              backgroundColor: '#ca8a04', color: '#ffffff',
              border: 'none', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}
          >
            <Send size={12} /> Submit
          </button>
        </div>
      </div>

      <div className="animate-fade-in" style={{ padding: '2rem 0 5rem' }}>
        <div className="container exam-grid" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* ── Main Question Sheet ─────────────────────────────────────────── */}
          <div>
            {/* Header */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>{exam.title}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Select an option for each question using the navigation pills below.
                </p>
              </div>
              <div style={{
                padding: '0.5rem 1rem', borderRadius: '8px',
                backgroundColor: answeredCount === totalCount ? 'rgba(16,185,129,0.1)' : 'rgba(37,99,235,0.1)',
                border: `1px solid ${answeredCount === totalCount ? 'rgba(16,185,129,0.3)' : 'rgba(37,99,235,0.3)'}`,
                fontSize: '0.85rem', fontWeight: '700',
                color: answeredCount === totalCount ? '#10b981' : 'var(--primary)',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
                <CheckSquare size={15} />
                {answeredCount} / {totalCount} answered
              </div>
            </div>

            {/* Question Navigation Pills */}
            <div
              role="navigation"
              aria-label="Question Navigator"
              style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', maxHeight: '200px', overflowY: 'auto', padding: '0.25rem' }}
            >
              {shuffledQuestions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isActive   = idx === activeIdx;
                const isFlagged  = !!flaggedQuestions[q.id];
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      border: isActive ? '2px solid var(--accent)' : (isFlagged ? '2px solid var(--warning)' : '1px solid var(--border-color)'),
                      backgroundColor: isActive ? 'var(--accent)' : (isAnswered ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.02)'),
                      color: isActive ? '#ffffff' : (isFlagged ? 'var(--warning)' : (isAnswered ? 'var(--success)' : 'var(--text-secondary)')),
                      fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', transition: 'all 0.15s ease', flexShrink: 0,
                    }}
                    aria-label={`Question ${idx + 1}${isAnswered ? ', answered' : ', not answered'}${isFlagged ? ', flagged' : ''}${isActive ? ', current' : ''}`}
                    aria-current={isActive ? 'true' : undefined}
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
                <h2 style={{ fontSize: '1.15rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', margin: 0, flex: 1 }}>
                  <span style={{ color: 'var(--accent)', flexShrink: 0 }}>Q{activeIdx + 1}.</span>
                  <span>{activeQuestion.text}</span>
                </h2>
                <button
                  type="button"
                  onClick={() => handleToggleFlag(activeQuestion.id)}
                  aria-pressed={!!flaggedQuestions[activeQuestion.id]}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
                    border: flaggedQuestions[activeQuestion.id] ? '1px solid var(--warning)' : '1px solid var(--border-color)',
                    backgroundColor: flaggedQuestions[activeQuestion.id] ? 'rgba(202,138,4,0.1)' : 'transparent',
                    color: flaggedQuestions[activeQuestion.id] ? 'var(--warning)' : 'var(--text-muted)',
                    fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <span aria-hidden="true">🚩</span>
                  <span>{flaggedQuestions[activeQuestion.id] ? 'Flagged' : 'Flag for Review'}</span>
                </button>
              </div>

              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend className="sr-only">Options for question {activeIdx + 1}</legend>
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
                          transition: 'all var(--transition-fast)',
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
              </fieldset>
            </div>

            {/* Bottom Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={activeIdx === 0}
                onClick={() => setActiveIdx(prev => prev - 1)}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.75rem' }}
              >
                ← Previous
              </button>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {activeIdx < shuffledQuestions.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveIdx(prev => prev + 1)}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.75rem' }}
                  >
                    Next Question →
                  </button>
                )}
                {/* Always-visible submit button */}
                <button
                  type="button"
                  onClick={handleManualSubmit}
                  className="btn btn-accent"
                  style={{ padding: '0.75rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Send size={15} />
                  {activeIdx === shuffledQuestions.length - 1 ? 'Finish & Submit' : 'Submit Exam'}
                </button>
              </div>
            </div>
          </div>

          {/* ── Sticky Sidebar: Timer + Proctoring + Submit ─────────────────── */}
          <div style={{ position: 'sticky', top: '5.5rem' }}>
            {/* Timer */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <Clock size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1rem', margin: 0 }}>Remaining Time</h3>
              </div>
              <div
                aria-live="polite"
                aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
                className={timeRemaining < 180 ? 'timer-urgent' : ''}
                style={{
                  fontFamily: 'monospace', fontSize: '2.2rem', fontWeight: 'bold',
                  textAlign: 'center', letterSpacing: '1px',
                  color: timeRemaining < 180 ? 'var(--danger)' : 'var(--text-primary)',
                }}
              >
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Proctoring */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <ShieldAlert size={20} color="var(--warning)" />
                <h3 style={{ fontSize: '1rem', margin: 0 }}>Proctoring</h3>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>Infractions:</span>
                <strong style={{ color: warningsCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {warningsCount} / 3
                </strong>
              </div>
              {warningsCount > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'rgba(239,68,68,0.08)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#f87171' }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>Do NOT leave this page again to avoid auto-submit.</span>
                </div>
              )}
            </div>

            {/* Sidebar Submit Button */}
            <button
              type="button"
              onClick={handleManualSubmit}
              className="btn btn-accent btn-full"
              style={{ padding: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Send size={16} />
              Submit Exam
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
              {unansweredCount > 0 ? `${unansweredCount} question${unansweredCount > 1 ? 's' : ''} unanswered` : 'All questions answered ✓'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Submit Confirmation Modal (with focus trap) ─────────────────────── */}
      {showConfirmModal && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="submit-modal-title"
          aria-describedby="submit-modal-desc"
          ref={confirmModalRef}
          tabIndex={-1}
          onKeyDown={e => { if (e.key === 'Escape') setShowConfirmModal(false); }}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(11,15,25,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem', zIndex: 10000, backdropFilter: 'blur(4px)', outline: 'none',
          }}
        >
          <div className="glass-panel" style={{ maxWidth: '460px', width: '100%', padding: '2.5rem', textAlign: 'center', border: '2px solid var(--border-color)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <ShieldAlert size={48} color="var(--warning)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
            <h3 id="submit-modal-title" style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Submit Examination?</h3>
            <p id="submit-modal-desc" style={{ fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.5, color: unansweredCount > 0 ? '#f87171' : 'var(--text-secondary)', fontWeight: unansweredCount > 0 ? 'bold' : 'normal' }}>
              {unansweredCount > 0
                ? `WARNING: You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}. Are you sure you want to finish and submit now?`
                : 'All questions answered. Are you sure you want to finish and submit? You cannot re-attempt after submitting.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-secondary btn-full"
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { setShowConfirmModal(false); submitExamResults('MANUAL_SUBMIT'); }}
                className="btn btn-accent btn-full"
              >
                Yes, Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fix C: Offline Connection Banner ─────────────────────────────── */}
      {!isOnline && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#1e293b', color: '#ffffff',
          padding: '0.75rem 1.5rem', borderRadius: '999px',
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          fontSize: '0.85rem', fontWeight: '600', zIndex: 9999,
          boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
          whiteSpace: 'nowrap',
        }}>
          <WifiOff size={15} />
          You are offline — your progress is saved. Keep answering.
        </div>
      )}

      <style>{`
        .sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0;
          margin: -1px; overflow: hidden; clip: rect(0,0,0,0);
          white-space: nowrap; border: 0;
        }
        @keyframes timerPulse {
          0%   { transform: scale(1);    opacity: 1;    }
          50%  { transform: scale(1.04); opacity: 0.85; }
          100% { transform: scale(1);    opacity: 1;    }
        }
        .timer-urgent { animation: timerPulse 0.8s infinite ease-in-out; }
        .option-label:focus-within { outline: 2px solid var(--accent); outline-offset: 2px; }

        @media (max-width: 968px) {
          .exam-grid { grid-template-columns: 1fr !important; }
          .mobile-timer-bar { display: flex !important; }
        }
      `}</style>
    </AntiCheatGuard>
  );
};

export default Examination;
