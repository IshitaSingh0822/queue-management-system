import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const icons = { success: '', error: '', info: '', warning: '' };
  const colors = {
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', color: '#10b981' },
    error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', color: '#ef4444' },
    info: { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', color: '#6366f1' },
    warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b' },
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {toasts.map((toast) => {
          const c = colors[toast.type] || colors.info;
          return (
            <div
              key={toast.id}
              className="qf-toast"
              style={{ borderColor: c.border }}
            >
              <div
                className="toast-icon"
                style={{ background: c.bg, color: c.color }}
              >
                {icons[toast.type]}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>
                {toast.message}
              </span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
