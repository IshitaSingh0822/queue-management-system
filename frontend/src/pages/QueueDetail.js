import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQueue, getTokensByQueue, callNext, resetQueue, updateTokenStatus, deleteToken } from '../api';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';

const QueueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { socket } = useSocket();
  const [queue, setQueue] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [filter, setFilter] = useState('waiting');
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [qRes, tRes] = await Promise.all([getQueue(id), getTokensByQueue(id, filter)]);
      setQueue(qRes.data);
      setTokens(tRes.data);
    } catch {
      addToast('Failed to load queue', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, filter, addToast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!socket) return;
    const events = ['token_generated', 'token_called', 'token_updated', 'token_deleted', 'queue_updated', 'queue_reset'];
    events.forEach((e) => socket.on(e, fetchAll));
    return () => events.forEach((e) => socket.off(e, fetchAll));
  }, [socket, fetchAll]);

  const handleCallNext = async () => {
    try {
      const res = await callNext(id);
      if (res.data.token) addToast(`Now serving: ${res.data.token.tokenDisplay}`, 'success');
      else addToast('No waiting tokens', 'warning');
    } catch { addToast('Failed to call next', 'error'); }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset queue? All tokens will be deleted.')) return;
    try {
      await resetQueue(id);
      addToast('Queue reset successfully', 'success');
    } catch { addToast('Failed to reset', 'error'); }
  };

  const handleStatusChange = async (tokenId, status) => {
    try {
      await updateTokenStatus(tokenId, status);
      addToast(`Token marked as ${status}`, 'success');
    } catch { addToast('Failed to update token', 'error'); }
  };

  const handleDeleteToken = async (tokenId) => {
    try {
      await deleteToken(tokenId);
      addToast('Token removed', 'info');
    } catch { addToast('Failed to remove token', 'error'); }
  };

  const statusConfig = {
    waiting: { color: '#f59e0b', icon: 'bi-hourglass-split', cls: 'badge-waiting' },
    serving: { color: '#10b981', icon: 'bi-person-check-fill', cls: 'badge-serving' },
    completed: { color: '#6366f1', icon: 'bi-check-circle-fill', cls: 'badge-completed' },
    skipped: { color: '#94a3b8', icon: 'bi-skip-forward-fill', cls: 'badge-paused' },
    cancelled: { color: '#ef4444', icon: 'bi-x-circle-fill', cls: 'badge-paused' },
  };

  if (loading) return (
    <div className="bg-mesh" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p>Loading queue...</p>
      </div>
    </div>
  );

  if (!queue) return (
    <div className="bg-mesh" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></div>
        <h3>Queue not found</h3>
        <button className="btn-primary-glow" onClick={() => navigate('/queues')}>Back to Queues</button>
      </div>
    </div>
  );

  const qColor = queue.color || '#6366f1';

  return (
    <div className="bg-mesh grid-overlay" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div className="page-header">
          <button className="btn-ghost" onClick={() => navigate('/queues')} style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
            <i className="bi bi-arrow-left"></i> Back to Queues
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: `${qColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', border: `1px solid ${qColor}30` }}>
              {queue.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 className="page-title" style={{ margin: 0 }}>{queue.name}</h1>
                <span className={`queue-stat-pill badge-${queue.status}`}>{queue.status}</span>
              </div>
              <p className="page-subtitle">{queue.counterName} · Prefix: {queue.prefix} · Avg wait: {queue.avgWaitTime} min</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn-danger-soft" onClick={handleReset}>
                <i className="bi bi-arrow-counterclockwise"></i> Reset
              </button>
              <button className="btn-next" onClick={handleCallNext} disabled={queue.status !== 'active'}>
                <i className="bi bi-skip-forward-fill"></i> Call Next
              </button>
            </div>
          </div>
        </div>

        {/* Current Serving Banner */}
        {queue.currentServing > 0 && (
          <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.06))', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-xl)', padding: '1.5rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#10b981', marginBottom: '0.3rem' }}>Now Serving</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, lineHeight: 1, background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {queue.prefix}{String(queue.currentServing).padStart(3, '0')}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {tokens.find(t => t.status === 'serving') && (
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>{tokens.find(t => t.status === 'serving')?.customerName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tokens.find(t => t.status === 'serving')?.customerPhone}</div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ textAlign: 'center', padding: '0.75rem 1.25rem', background: 'rgba(245,158,11,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{queue.waitingCount || 0}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Waiting</div>
              </div>
            </div>
          </div>
        )}

        {/* Tokens Section */}
        <div className="qf-card" style={{ overflow: 'visible' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1rem', flex: 1 }}>Token List</h3>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['waiting', 'serving', 'completed', 'skipped', 'cancelled'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={filter === s ? 'btn-primary-glow' : 'btn-ghost'}
                  style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '1rem', overflowX: 'auto' }}>
            {tokens.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-inbox"></i>
                <p>No {filter} tokens</p>
              </div>
            ) : (
              <table className="token-table" style={{ minWidth: 600 }}>
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((t) => {
                    const sc = statusConfig[t.status] || statusConfig.waiting;
                    return (
                      <tr key={t._id}>
                        <td><span className="token-num">{t.tokenDisplay}</span></td>
                        <td style={{ fontWeight: 500 }}>{t.customerName}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{t.customerPhone || '—'}</td>
                        <td>
                          {t.priority === 'priority' ? (
                            <span className="queue-stat-pill badge-priority"><i className="bi bi-star-fill" style={{ fontSize: '0.65rem' }}></i> Priority</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Normal</span>
                          )}
                        </td>
                        <td>
                          <span className={`queue-stat-pill ${sc.cls}`}>
                            <i className={`bi ${sc.icon}`} style={{ fontSize: '0.7rem' }}></i> {t.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {new Date(t.createdAt).toLocaleTimeString()}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            {t.status === 'waiting' && (
                              <button className="btn-ghost" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleStatusChange(t._id, 'serving')}>
                                <i className="bi bi-play-fill"></i>
                              </button>
                            )}
                            {t.status === 'serving' && (
                              <button className="btn-ghost" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }} onClick={() => handleStatusChange(t._id, 'completed')}>
                                <i className="bi bi-check-lg"></i>
                              </button>
                            )}
                            {t.status === 'waiting' && (
                              <button className="btn-ghost" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleStatusChange(t._id, 'skipped')}>
                                <i className="bi bi-skip-forward"></i>
                              </button>
                            )}
                            <button className="btn-danger-soft" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleDeleteToken(t._id)}>
                              <i className="bi bi-trash3"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueDetail;
