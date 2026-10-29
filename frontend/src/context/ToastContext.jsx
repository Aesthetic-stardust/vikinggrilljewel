import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let _nextId = 0;

let _imperativeAdd = null;
export function emitToast(type, message, duration) {
  _imperativeAdd?.(type, message, duration);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((type, message, duration = 3500) => {
    const id = ++_nextId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  _imperativeAdd = add;

  const toast = {
    success: (msg, dur) => add('success', msg, dur),
    error:   (msg, dur) => add('error',   msg, dur ?? 5000),
    info:    (msg, dur) => add('info',    msg, dur),
    warning: (msg, dur) => add('warning', msg, dur),
    signout: (msg, dur) => add('signout', msg, dur ?? 4000),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

/* ─── SVG icon helpers ─────────────────────────────────── */

function IconCheck({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function IconX({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function IconInfo({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconWarning({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconLogout({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

/* ─── Toast Container + Item ──────────────────────────── */

const CONFIG = {
  success: { bg: '#f0fdf4', border: '#86efac', text: '#166534', Icon: IconCheck },
  error:   { bg: '#fff0f0', border: '#fca5a5', text: '#991b1b', Icon: IconX },
  info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', Icon: IconInfo },
  warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', Icon: IconWarning },
  signout: { bg: '#1a1a2e', border: '#D00000', text: '#ffffff', Icon: IconLogout },
};

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div style={containerStyle}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast: t, onDismiss }) {
  const cfg = CONFIG[t.type] || CONFIG.info;
  const ToastIcon = cfg.Icon;
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        background: cfg.bg,
        border: `1.5px solid ${cfg.border}`,
        borderRadius: '10px',
        padding: '12px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        minWidth: '280px',
        maxWidth: '380px',
        animation: 'toastSlideIn 0.22s ease',
        cursor: 'default',
      }}
    >
      <span style={{ flexShrink: 0, lineHeight: 1, marginTop: '1px' }}>
        <ToastIcon color={cfg.text} />
      </span>
      <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: cfg.text, lineHeight: 1.45 }}>
        {t.message}
      </span>
      <button
        onClick={() => onDismiss(t.id)}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: cfg.text,
          opacity: 0.6,
          fontSize: '16px',
          lineHeight: 1,
          padding: '0 2px',
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

const containerStyle = {
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  zIndex: 9999,
};
