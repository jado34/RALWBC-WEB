import React, { useEffect, useState, useRef } from 'react';
import { ShieldAlert } from 'lucide-react';

export const AntiCheatGuard = ({ children, onWarning, onAutoSubmit, maxWarnings = 3, initialWarnings = 0 }) => {
  const [warnings, setWarnings] = useState(initialWarnings);
  const [showAlert, setShowAlert] = useState(false);
  const [alertReason, setAlertReason] = useState("");
  const isAutoSubmitted = useRef(false);

  // Fullscreen state tracking
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const hasEnteredFullscreenOnce = useRef(!!document.fullscreenElement);

  // Store callbacks in refs to prevent stale closure bugs in event listeners
  const onWarningRef = useRef(onWarning);
  const onAutoSubmitRef = useRef(onAutoSubmit);

  useEffect(() => {
    onWarningRef.current = onWarning;
    onAutoSubmitRef.current = onAutoSubmit;
  });

  useEffect(() => {
    setWarnings(initialWarnings);
  }, [initialWarnings]);

  const isFullscreenSupported = () => {
    return typeof document.documentElement.requestFullscreen === 'function';
  };

  const enterFullscreen = () => {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          hasEnteredFullscreenOnce.current = true;
        })
        .catch((err) => {
          console.error("Error entering fullscreen:", err);
          alert("Could not enter secure fullscreen mode. Please ensure no other windows are overlaying, and try again.");
        });
    }
  };

  useEffect(() => {
    // 1. Activate body CSS block (user-select: none, etc.)
    document.body.classList.add('secure-mode-active');
    
    // Create custom styles to block selection and copy-paste on mobile/desktop
    const styleElement = document.createElement('style');
    styleElement.id = 'anti-cheat-styles';
    styleElement.innerHTML = `
      * {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -khtml-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(styleElement);

    // 2. Disable context menu (Right click / Mobile long-press)
    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerWarning("Right-click or Long-press action blocked.");
    };
    document.addEventListener('contextmenu', handleContextMenu);

    // 3. Disable copy, paste, cut, and key shortcuts (Ctrl+C, Ctrl+V, Ctrl+U, F12)
    const handleKeyDown = (e) => {
      const isCtrl = e.ctrlKey || e.metaKey; // cmd/ctrl key
      
      // Ctrl+C (67), Ctrl+V (86), Ctrl+X (88), Ctrl+U (85), F12 (123), Ctrl+Shift+I (73)
      if (
        (isCtrl && [67, 86, 88, 85].includes(e.keyCode)) || 
        e.keyCode === 123 || 
        (isCtrl && e.shiftKey && e.keyCode === 73)
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning("Keyboard shortcuts (Copy, Paste, View Source, Developer Tools) are blocked.");
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);

    // Block copy, cut, and paste events directly
    const handleClipboardEvent = (e) => {
      e.preventDefault();
      triggerWarning(`${e.type.toUpperCase()} actions are blocked inside this exam.`);
    };
    document.addEventListener('copy', handleClipboardEvent);
    document.addEventListener('cut', handleClipboardEvent);
    document.addEventListener('paste', handleClipboardEvent);

    // 4. Focus loss and Visibility loss detection (Tab switching / App switching)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerWarning("Browser tab or application switched.");
      }
    };

    let blurTimeout = null;

    const handleWindowBlur = () => {
      if (blurTimeout) clearTimeout(blurTimeout);
      blurTimeout = setTimeout(() => {
        if (!document.hasFocus() && document.visibilityState !== 'hidden') {
          triggerWarning("Exam browser window lost focus (Focus was lost for more than 1.5 seconds).");
        }
      }, 1500); // 1.5 second grace period
    };

    const handleWindowFocus = () => {
      if (blurTimeout) {
        clearTimeout(blurTimeout);
        blurTimeout = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    // 5. Fullscreen exit detection
    const handleFullscreenChange = () => {
      const isFS = !!document.fullscreenElement;
      setIsFullscreen(isFS);
      
      if (hasEnteredFullscreenOnce.current) {
        if (!isFS && !isAutoSubmitted.current) {
          triggerWarning("Secure fullscreen mode exited.");
        }
      } else if (isFS) {
        hasEnteredFullscreenOnce.current = true;
      }
    };

    if (isFullscreenSupported()) {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }

    // Clean up all hooks when exam unmounts
    return () => {
      document.body.classList.remove('secure-mode-active');
      const customStyles = document.getElementById('anti-cheat-styles');
      if (customStyles) customStyles.remove();
      
      if (blurTimeout) clearTimeout(blurTimeout);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('copy', handleClipboardEvent);
      document.removeEventListener('cut', handleClipboardEvent);
      document.removeEventListener('paste', handleClipboardEvent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      if (isFullscreenSupported()) {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
      }
    };
  }, []); // Run ONCE on mount

  // Warning trigger
  const triggerWarning = (reason) => {
    // Avoid triggering when already auto-submitted
    if (isAutoSubmitted.current) return;

    setWarnings(prev => {
      const nextWarnings = prev + 1;
      
      // Callback to parent components to update warnings list
      if (onWarningRef.current) {
        onWarningRef.current(nextWarnings, reason);
      }

      if (nextWarnings >= maxWarnings) {
        isAutoSubmitted.current = true;
        setShowAlert(false);
        if (onAutoSubmitRef.current) {
          onAutoSubmitRef.current();
        }
      } else {
        setAlertReason(reason);
        setShowAlert(true);
      }

      return nextWarnings;
    });
  };

  const handleDismissAlert = () => {
    setShowAlert(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100%' }}>
      {/* Banner indicating secure mode */}
      <div style={{
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderBottom: '1px solid var(--danger)',
        padding: '0.5rem 1rem',
        textAlign: 'center',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        color: '#f87171',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)' }} className="pulse"></div>
        SECURE EXAM CONTEXT ACTIVE — PROCTORING IN PROGRESS
      </div>

      {children}

      {/* Alert Warning Popup */}
      {showAlert && (
        <div 
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="infraction-title"
          aria-describedby="infraction-desc"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11, 15, 25, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div className="glass-panel" style={{
            maxWidth: '450px',
            width: '100%',
            padding: '2rem',
            textAlign: 'center',
            border: '2px solid var(--warning)',
            boxShadow: '0 0 30px rgba(245, 158, 11, 0.2)'
          }}>
            <ShieldAlert size={48} color="var(--warning)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
            
            <h3 id="infraction-title" style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Security Infraction Detected</h3>
            
            <p id="infraction-desc" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {alertReason}
            </p>
            
            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              color: '#fde047',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              marginBottom: '1.5rem'
            }}>
              WARNING COUNT: {warnings} / {maxWarnings}
              <div style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Exceeding {maxWarnings} warnings will result in immediate automatic exam submission.
              </div>
            </div>
            
            <button onClick={handleDismissAlert} className="btn btn-accent btn-full">
              I Understand & Resume Exam
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Overlay Modal Lock */}
      {isFullscreenSupported() && !isFullscreen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(11, 15, 25, 0.96)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 99999,
          backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '500px',
            width: '100%',
            padding: '3rem 2.5rem',
            textAlign: 'center',
            border: '2px solid var(--accent)',
            boxShadow: '0 0 40px rgba(202, 138, 4, 0.25)'
          }}>
            <ShieldAlert size={56} color="var(--accent)" style={{ marginBottom: '1.5rem', display: 'inline-block' }} />
            
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#ffffff' }}>Secure Exam Mode Required</h3>
            
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6' }}>
              To maintain the integrity of the **Royal Ambassadors Senior Ranking Exam**, this exam must be written in Fullscreen Mode. Exiting fullscreen or swapping tabs will be recorded as proctoring infractions.
            </p>
            
            <button onClick={enterFullscreen} className="btn btn-accent btn-full" style={{ padding: '0.9rem' }}>
              Enter Secure Fullscreen Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AntiCheatGuard;
