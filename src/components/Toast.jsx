import React, { useEffect, useRef } from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

// ── Individual Toast Item ─────────────────────────────────────────────────────
const TOAST_CONFIG = {
  success: { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
  error:   { icon: XCircle,     color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)'   },
  warning: { icon: AlertTriangle,color: '#ca8a04', bg: 'rgba(202,138,4,0.08)', border: 'rgba(202,138,4,0.25)'   },
  info:    { icon: Info,         color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)'  },
};

const ToastItem = ({ toast, onRemove }) => {
  const { icon: Icon, color, bg, border } = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;

  useEffect(() => {
    const timer = setTimeout(onRemove, toast.duration ?? 4500);
    return () => clearTimeout(timer);
  }, [onRemove, toast.duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        padding: '1rem 1.25rem',
        backgroundColor: '#ffffff',
        border: `1px solid ${border}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        maxWidth: '380px',
        minWidth: '280px',
        animation: 'toastSlideIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        fontFamily: 'var(--font-body)',
      }}
    >
      <Icon size={18} color={color} style={{ flexShrink: 0, marginTop: '1px' }} />
      <span style={{ flex: 1, fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5 }}>
        {toast.message}
      </span>
      <button
        onClick={onRemove}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#94a3b8',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
};

// ── Toast Container ───────────────────────────────────────────────────────────
export const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;
  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: '1.75rem',
          right: '1.75rem',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
      `}</style>
    </>
  );
};

// ── Confirm Dialog ────────────────────────────────────────────────────────────
// Drop-in replacement for window.confirm() that fits the design system.
export const ConfirmDialog = ({ isOpen, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger = false }) => {
  const btnRef = useRef(null);

  useEffect(() => {
    if (isOpen && btnRef.current) {
      btnRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(11,15,25,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem', zIndex: 100000, backdropFilter: 'blur(4px)',
      }}
      onKeyDown={e => { if (e.key === 'Escape') onCancel(); }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '2rem 2.25rem',
          maxWidth: '440px', width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0',
        }}
      >
        {title && (
          <h3 id="confirm-title" style={{ fontSize: '1.25rem', color: '#0a1141', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
            {title}
          </h3>
        )}
        {message && (
          <p id="confirm-desc" style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            {message}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.65rem 1.5rem', borderRadius: '8px',
              border: '1px solid #cbd5e1', background: '#f8fafc',
              color: '#475569', fontWeight: '600', fontSize: '0.9rem',
              cursor: 'pointer', fontFamily: 'var(--font-heading)',
            }}
          >
            {cancelLabel}
          </button>
          <button
            ref={btnRef}
            onClick={onConfirm}
            style={{
              padding: '0.65rem 1.5rem', borderRadius: '8px',
              border: 'none',
              background: danger ? '#ef4444' : '#0a1141',
              color: '#ffffff', fontWeight: '700', fontSize: '0.9rem',
              cursor: 'pointer', fontFamily: 'var(--font-heading)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
