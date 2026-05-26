import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getQueues, getStats, callNext, resetQueue, deleteQueue } from '../api';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';

const StatCard = ({ icon, value, label, color, glow }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div className="stat-icon" style={{ background: `${color}18`, color }}>
          <i className={`bi ${icon}`}></i>
        </div>
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
      <div style={{ fontSize: '3.5rem', opacity: 0.05, lineHeight: 1, marginTop: '-0.5rem' }}>
        <i className={`bi ${icon}`}></i>
      </div>
    </div>
  </div>
);

const QueueCard = ({ queue, onCallNext, onReset, onDelete }) => {
  const statusColors = { active: '#10b981', paused: '#f59e0b', closed: '#ef4444' };
  const color = queue.color || '#6366f1';

  return (
    <div className="queue-card">
      <div className="queue-card-header">
        <div className="queue-icon" style={{ background: `${color}18`, fontSize: '1.3rem' }}>
          {queue.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {queue.name}
            </h3>
            <span className={`queue-stat-pill badge-${queue.status}`} style={{ flexShrink: 0 }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, background: statusColors[queue.status] }}></span>
              {queue.status}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{queue.counterName}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Prefix</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color }}>{queue.prefix}</div>
        </div>
      </div>

      <div className="queue-card-body">
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>Now Serving</div>
          <div className="queue-number-display" style={{ background: `linear-gradient(135deg, ${color}, #06b6d4)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {queue.currentServing > 0 ? `${queue.prefix}${String(queue.currentServing).padStart(3, '0')}` : '—'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Waiting', value: queue.waitingCount || 0, color: '#f59e0b', icon: 'bi-hourglass-split' },
            { label: 'Serving', value: queue.servingCount || 0, color: '#10b981', icon: 'bi-person-check' },
            { label: 'Done', value: queue.completedCount || 0, color: '#6366f1', icon: 'bi-check-circle' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.5rem', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-next"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => onCallNext(queue._id)}
            disabled={queue.status !== 'active'}
          >
            <i className="bi bi-skip-forward-fill"></i> Call Next
          </button>
          <Link
            to={`/queues/${queue._id}`}
            className="btn-ghost"
            style={{ padding: '0.65rem 0.9rem' }}
            title="Manage Queue"
          >
            <i className="bi bi-sliders"></i>
          </Link>
          <button
            className="btn-danger-soft"
            style={{ padding: '0.65rem 0.9rem' }}
            onClick={() => onDelete(queue._id)}
            title="Delete Queue"
          >
            <i className="bi bi-trash3"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [queues, setQueues] = useState([]);
  const [stats, setStats] = useState({ totalWaiting: 0, totalServing: 0, totalCompleted: 0, totalToday: 0 });
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { addToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [qRes, sRes] = await Promise.all([getQueues(), getStats()]);
      setQueues(qRes.data);
      setStats(sRes.data);
    } catch (e) {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!socket) return;
    const events = ['queue_created', 'queue_updated', 'queue_deleted', 'queue_reset', 'token_generated', 'token_called', 'token_updated'];
    events.forEach((e) => socket.on(e, () => fetchData()));
    return () => events.forEach((e) => socket.off(e));
  }, [socket, fetchData]);

  const handleCallNext = async (id) => {
    try {
      const res = await callNext(id);
      if (res.data.token) {
        addToast(`Now serving: ${res.data.token.tokenDisplay}`, 'success');
      } else {
        addToast('No waiting tokens', 'warning');
      }
    } catch {
      addToast('Failed to call next token', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this queue and all its tokens?')) return;
    try {
      await deleteQueue(id);
      addToast('Queue deleted', 'success');
    } catch {
      addToast('Failed to delete queue', 'error');
    }
  };

  const statItems = [
    { icon: 'bi-ticket-perforated-fill', value: stats.totalToday, label: "Today's Tokens", color: '#6366f1' },
    { icon: 'bi-hourglass-split', value: stats.totalWaiting, label: 'Waiting Now', color: '#f59e0b' },
    { icon: 'bi-person-check-fill', value: stats.totalServing, label: 'Being Served', color: '#10b981' },
    { icon: 'bi-check-circle-fill', value: stats.totalCompleted, label: 'Completed', color: '#06b6d4' },
  ];

  return (
    <div className="bg-mesh grid-overlay" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Page Header */}
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '0.4rem' }}>
              <i className="bi bi-grid-fill me-1"></i> Overview
            </div>
            <h1 className="page-title">
              Queue <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="page-subtitle">Real-time view of all active queues and token status</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/display" className="btn-ghost">
              <i className="bi bi-display"></i> Display Board
            </Link>
            <Link to="/queues/new" className="btn-primary-glow">
              <i className="bi bi-plus-lg"></i> New Queue
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {statItems.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Queues Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 340, borderRadius: 'var(--radius-xl)' }}></div>
            ))}
          </div>
        ) : queues.length === 0 ? (
          <div className="qf-card" style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}></div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>No queues yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Create your first queue to get started</p>
            <Link to="/queues/new" className="btn-primary-glow">
              <i className="bi bi-plus-lg"></i> Create Queue
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {queues.map((q) => (
              <QueueCard
                key={q._id}
                queue={q}
                onCallNext={handleCallNext}
                onReset={resetQueue}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
