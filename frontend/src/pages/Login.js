import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { loginAsStaff, loginAsCustomer } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('select');
  const [staffId, setStaffId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleStaffLogin = () => {
    if (!staffId.trim()) return setError('Please enter your Staff ID.');
    if (!pin.trim()) return setError('Please enter your PIN.');
    const ok = loginAsStaff(staffId.trim(), pin.trim());
    if (ok) {
      navigate('/dashboard');
    } else {
      setError('Invalid Staff ID or PIN. Please try again.');
      setPin('');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  const handleCustomerLogin = () => {
    loginAsCustomer();
    navigate('/generate');
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '0.75rem 1rem',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'var(--font-body)',
  };

  return (
    <div
      className="bg-mesh grid-overlay"
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
    >
      {/* Logo */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.4rem' }}>
          QueueFlow<sup style={{ fontSize: '0.4em' }}>PRO</sup>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Smart Queue Management System</p>
      </div>

      {view === 'select' ? (
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>Who are you?</h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem', marginBottom: '2rem' }}>Choose your role to continue</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Staff Card */}
              <button
                onClick={() => setView('staff')}
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'all 0.25s', textAlign: 'left', width: '100%' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}></div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: '#a5b4fc', marginBottom: '0.3rem' }}>Staff / Manager</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage queues, call tokens, view dashboard</div>
                </div>
                <i className="bi bi-chevron-right" style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}></i>
              </button>

              {/* Customer Card */}
              <button
                onClick={handleCustomerLogin}
                style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'all 0.25s', textAlign: 'left', width: '100%' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: 'rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}></div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: '#67e8f9', marginBottom: '0.3rem' }}>Customer</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get a token, check the display board</div>
                </div>
                <i className="bi bi-chevron-right" style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Staff Login Form */
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', animation: shaking ? 'shake 0.4s ease' : 'none' }}>
            <button
              onClick={() => { setView('select'); setError(''); setPin(''); setStaffId(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', padding: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <i className="bi bi-arrow-left"></i> Back
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}></div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.4rem' }}>Staff Login</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', margin: 0 }}>Enter your Staff ID and PIN</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Staff ID */}
              <div>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Staff ID
                </label>
                <input
                  style={inputStyle}
                  placeholder="e.g. STAFF001"
                  value={staffId}
                  onChange={e => { setStaffId(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleStaffLogin()}
                  autoFocus
                />
              </div>

              {/* PIN */}
              <div>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  PIN
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPin ? 'text' : 'password'}
                    style={{ ...inputStyle, paddingRight: '3rem', letterSpacing: showPin ? 'normal' : '0.3em' }}
                    placeholder="4-digit PIN"
                    value={pin}
                    onChange={e => { setPin(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleStaffLogin()}
                    maxLength={8}
                  />
                  <button
                    onClick={() => setShowPin(!showPin)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem' }}
                  >
                    <i className={`bi bi-eye${showPin ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="bi bi-exclamation-circle"></i> {error}
                </div>
              )}

              <button
                className="btn-primary-glow"
                onClick={handleStaffLogin}
                disabled={!staffId || !pin}
                style={{ justifyContent: 'center', padding: '0.9rem', marginTop: '0.25rem' }}
              >
                <i className="bi bi-unlock-fill"></i> Login
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
        input:focus { border-color: rgba(99,102,241,0.6) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
      `}</style>
    </div>
  );
};

export default Login;