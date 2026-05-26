import React, { useEffect, useState, useCallback } from 'react';
import { getAllDisplayTokens } from '../api';
import { useSocket } from '../context/SocketContext';

const Clock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="board-clock">
      {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
};

const DisplayBoard = () => {
  const [data, setData] = useState({ serving: [], recent: [] });
  const [loading, setLoading] = useState(true);
  const [lastCalled, setLastCalled] = useState(null);
  const { socket } = useSocket();

  const fetchData = useCallback(async () => {
    try {
      const res = await getAllDisplayTokens();
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!socket) return;
    socket.on('token_called', (payload) => {
      setLastCalled(payload.token);
      fetchData();
      // Audio notification simulation
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) {}
    });
    socket.on('token_generated', fetchData);
    socket.on('token_updated', fetchData);
    socket.on('queue_reset', fetchData);
    return () => {
      socket.off('token_called');
      socket.off('token_generated', fetchData);
      socket.off('token_updated', fetchData);
      socket.off('queue_reset', fetchData);
    };
  }, [socket, fetchData]);

  if (loading) return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
        <p>Loading display...</p>
      </div>
    </div>
  );

  const mainServing = data.serving[0];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="board-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}></div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>QueueFlow</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Service Display Board</div>
          </div>
        </div>
        <Clock />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--accent-green)' }}>
          <span className="pulse-dot green" style={{ width: 8, height: 8 }}></span>
          Live
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem', display: 'grid', gridTemplateColumns: data.serving.length > 1 ? '2fr 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left: Now Serving */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="pulse-dot green" style={{ width: 8, height: 8 }}></span>
            Now Being Served
          </div>

          {mainServing ? (
            <div className="now-serving-card">
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#10b981', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  {mainServing.queueId?.name || 'Service Queue'}
                  <span style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 100, padding: '0.15rem 0.75rem', fontSize: '0.7rem' }}>
                    {mainServing.queueId?.counterName}
                  </span>
                </div>
                <div className="serving-number">{mainServing.tokenDisplay}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.75rem' }}>
                  {mainServing.customerName}
                </div>
                {mainServing.priority === 'priority' && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 100, padding: '0.25rem 0.9rem', fontSize: '0.78rem', color: '#ec4899', marginTop: '0.75rem' }}>
                    <i className="bi bi-star-fill"></i> Priority Customer
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', opacity: 0.2, marginBottom: '1rem' }}></div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-muted)' }}>No one being served</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Waiting for next token to be called</div>
            </div>
          )}

          {/* Other serving counters */}
          {data.serving.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {data.serving.slice(1).map((t) => (
                <div key={t._id} style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {t.queueId?.counterName || 'Counter'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{t.tokenDisplay}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>{t.customerName}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recently Completed */}
        <div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-primary)', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bi bi-clock-history"></i> Recent History
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {data.recent.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No history yet
              </div>
            ) : (
              data.recent.map((t, i) => (
                <div
                  key={t._id}
                  style={{
                    background: 'rgba(17,24,39,0.6)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem 1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.9rem',
                    opacity: 1 - i * 0.15,
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--accent-primary)', minWidth: 60 }}>{t.tokenDisplay}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t.customerName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.queueId?.name}</div>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 100, padding: '0.2rem 0.6rem', fontSize: '0.7rem', color: 'var(--accent-primary)' }}>
                    <i className="bi bi-check-circle-fill"></i> Done
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Announcement Banner */}
      {lastCalled && (
        <div style={{ padding: '1rem 2rem', background: 'rgba(16,185,129,0.08)', borderTop: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <i className="bi bi-megaphone-fill" style={{ color: '#10b981', fontSize: '1.2rem' }}></i>
          <div style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem' }}>
            Now calling: <span style={{ color: '#10b981' }}>{lastCalled.tokenDisplay}</span>
            {lastCalled.customerName && lastCalled.customerName !== 'Customer' && (
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.5rem', fontSize: '0.9rem' }}>
                — {lastCalled.customerName}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {lastCalled.calledAt ? new Date(lastCalled.calledAt).toLocaleTimeString() : ''}
          </div>
        </div>
      )}

      {/* Footer Ticker */}
      <div style={{ padding: '0.7rem 2rem', background: 'rgba(0,0,0,0.4)', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '2rem', overflow: 'hidden' }}>
        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', flexShrink: 0 }}>
          <i className="bi bi-info-circle me-1"></i> Info
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Welcome to QueueFlow — Please keep your token handy and listen for your number. Thank you for your patience.
        </div>
      </div>
    </div>
  );
};

export default DisplayBoard;
