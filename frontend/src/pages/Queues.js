import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getQueues, createQueue, deleteQueue, updateQueue } from '../api';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316'];
const ICONS = ['ticket', 'hospital', 'bank', 'travel', 'retail', 'general', 'government', 'food', 'phone', 'maintenance', 'tech', 'delivery'];

const CreateQueueModal = ({ onClose, onCreated }) => {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    name: '', description: '', prefix: 'A', counterName: 'Counter 1',
    avgWaitTime: 5, color: '#6366f1', icon: '', status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) return addToast('Queue name is required', 'warning');
    setSubmitting(true);
    try {
      await createQueue(form);
      addToast('Queue created successfully!', 'success');
      onCreated();
      onClose();
    } catch (e) {
      addToast(e.response?.data?.error || 'Failed to create queue', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="qf-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="qf-modal">
        <div className="qf-modal-header">
          <div>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Create New Queue</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Set up a new service queue</p>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '0.3rem 0.6rem' }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="qf-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="qf-label">Queue Name *</label>
              <input className="qf-input" placeholder="e.g. Customer Support" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="qf-label">Token Prefix</label>
              <input className="qf-input" placeholder="A" maxLength={3} value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value.toUpperCase() })} />
            </div>
            <div>
              <label className="qf-label">Counter Name</label>
              <input className="qf-input" placeholder="Counter 1" value={form.counterName} onChange={(e) => setForm({ ...form, counterName: e.target.value })} />
            </div>
            <div>
              <label className="qf-label">Avg Wait Time (min)</label>
              <input type="number" className="qf-input" min={1} value={form.avgWaitTime} onChange={(e) => setForm({ ...form, avgWaitTime: parseInt(e.target.value) || 5 })} />
            </div>
            <div>
              <label className="qf-label">Status</label>
              <select className="qf-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="qf-label">Description</label>
              <input className="qf-input" placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="qf-label">Queue Color</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {COLORS.map((c) => (
                <button key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: form.color === c ? `3px solid white` : '3px solid transparent', outline: form.color === c ? `2px solid ${c}` : 'none', cursor: 'pointer', transition: 'all 0.2s' }} />
              ))}
            </div>
          </div>

          <div>
            <label className="qf-label">Queue Icon</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {ICONS.map((ic) => (
                <button key={ic} onClick={() => setForm({ ...form, icon: ic })} style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: form.icon === ic ? `${form.color}25` : 'var(--bg-secondary)', border: `1px solid ${form.icon === ic ? form.color : 'var(--border-color)'}`, cursor: 'pointer', fontSize: '1.2rem', transition: 'all 0.2s' }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="qf-modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary-glow" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <><i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s linear infinite' }}></i> Creating...</> : <><i className="bi bi-plus-lg"></i> Create Queue</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const Queues = () => {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { socket } = useSocket();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchQueues = useCallback(async () => {
    try {
      const res = await getQueues();
      setQueues(res.data);
    } catch {
      addToast('Failed to load queues', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchQueues(); }, [fetchQueues]);

  useEffect(() => {
    if (!socket) return;
    const events = ['queue_created', 'queue_updated', 'queue_deleted', 'queue_reset', 'token_generated', 'token_called'];
    events.forEach((e) => socket.on(e, fetchQueues));
    return () => events.forEach((e) => socket.off(e, fetchQueues));
  }, [socket, fetchQueues]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this queue?')) return;
    try {
      await deleteQueue(id);
      addToast('Queue deleted', 'success');
    } catch {
      addToast('Failed to delete', 'error');
    }
  };

  const handleToggleStatus = async (q) => {
    const newStatus = q.status === 'active' ? 'paused' : 'active';
    try {
      await updateQueue(q._id, { status: newStatus });
      addToast(`Queue ${newStatus}`, 'success');
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  const statusBadge = (s) => (
    <span className={`queue-stat-pill badge-${s}`} style={{ fontSize: '0.72rem' }}>
      {s === 'active' && <span className="pulse-dot green" style={{ width: 7, height: 7 }}></span>}
      {s}
    </span>
  );

  return (
    <div className="bg-mesh grid-overlay" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '0.4rem' }}>
              <i className="bi bi-collection-fill me-1"></i> Management
            </div>
            <h1 className="page-title">All <span className="text-gradient">Queues</span></h1>
            <p className="page-subtitle">{queues.length} queue{queues.length !== 1 ? 's' : ''} configured</p>
          </div>
          <button className="btn-primary-glow" onClick={() => setShowCreate(true)}>
            <i className="bi bi-plus-lg"></i> New Queue
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-md)' }}></div>)}
          </div>
        ) : queues.length === 0 ? (
          <div className="qf-card" style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem', opacity: 0.3 }}></div>
            <h3 style={{ fontFamily: 'var(--font-display)' }}>No queues created</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Get started by creating your first queue</p>
            <button className="btn-primary-glow" onClick={() => setShowCreate(true)}>
              <i className="bi bi-plus-lg"></i> Create Queue
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {queues.map((q) => (
              <div key={q._id} className="qf-card" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: `${q.color || '#6366f1'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                    {q.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>{q.name}</span>
                      {statusBadge(q.status)}
                      <span className="queue-stat-pill" style={{ background: `${q.color || '#6366f1'}15`, color: q.color || '#6366f1', border: `1px solid ${q.color || '#6366f1'}30`, fontSize: '0.72rem' }}>
                        Prefix: {q.prefix}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {q.counterName} · {q.description || 'No description'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                    {[
                      { label: 'Waiting', value: q.waitingCount || 0, color: '#f59e0b' },
                      { label: 'Serving', value: q.servingCount || 0, color: '#10b981' },
                      { label: 'Done', value: q.completedCount || 0, color: '#6366f1' },
                    ].map((s) => (
                      <div key={s.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button className="btn-ghost" onClick={() => handleToggleStatus(q)} style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
                      <i className={`bi bi-${q.status === 'active' ? 'pause-fill' : 'play-fill'}`}></i>
                      {q.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                    <button className="btn-ghost" onClick={() => navigate(`/queues/${q._id}`)} style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
                      <i className="bi bi-sliders"></i> Manage
                    </button>
                    <button className="btn-danger-soft" onClick={() => handleDelete(q._id)} style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}>
                      <i className="bi bi-trash3"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showCreate && <CreateQueueModal onClose={() => setShowCreate(false)} onCreated={fetchQueues} />}
    </div>
  );
};

export default Queues;
