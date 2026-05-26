import React, { useEffect, useState } from 'react';
import { getQueues, generateToken } from '../api';
import { useToast } from '../context/ToastContext';

const GenerateToken = () => {
  const { addToast } = useToast();
  const [queues, setQueues] = useState([]);
  const [form, setForm] = useState({ queueId: '', customerName: '', customerPhone: '', priority: 'normal', notes: '' });
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null);

  useEffect(() => {
    getQueues().then((r) => {
      const active = r.data.filter((q) => q.status === 'active');
      setQueues(active);
    }).catch(() => addToast('Failed to load queues', 'error'));
  }, [addToast]);

  useEffect(() => {
    if (form.queueId) {
      const q = queues.find((q) => q._id === form.queueId);
      setSelectedQueue(q || null);
    } else {
      setSelectedQueue(null);
    }
  }, [form.queueId, queues]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.queueId) return addToast('Please select a queue', 'warning');
    setLoading(true);
    try {
      const res = await generateToken(form);
      setTicket({ ...res.data.token, estimatedWait: res.data.estimatedWait });
      setForm({ queueId: '', customerName: '', customerPhone: '', priority: 'normal', notes: '' });
      addToast(`Token ${res.data.token.tokenDisplay} generated!`, 'success');
    } catch (e) {
      addToast(e.response?.data?.error || 'Failed to generate token', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();
  const handleReset = () => setTicket(null);

  return (
    <div className="bg-mesh grid-overlay" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="page-header">
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '0.4rem' }}>
            <i className="bi bi-ticket-perforated-fill me-1"></i> Customer
          </div>
          <h1 className="page-title">Get Your <span className="text-gradient">Token</span></h1>
          <p className="page-subtitle">Select a queue and generate your service token</p>
        </div>

        {ticket ? (
          // Token Ticket View
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div className="token-ticket" style={{ width: '100%', maxWidth: 440 }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 100, padding: '0.3rem 1rem', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                  <i className="bi bi-check-circle-fill"></i> Token Issued
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Your Token Number</div>
              <div className="ticket-number">{ticket.tokenDisplay}</div>

              <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)', margin: '1.5rem 0' }}></div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Customer', value: ticket.customerName, icon: 'bi-person' },
                  { label: 'Priority', value: ticket.priority, icon: 'bi-star' },
                  { label: 'Est. Wait', value: `~${ticket.estimatedWait || 0} min`, icon: 'bi-clock' },
                  { label: 'Issued At', value: new Date(ticket.createdAt).toLocaleTimeString(), icon: 'bi-calendar3' },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <i className={`bi ${item.icon}`}></i> {item.label}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.2rem', textTransform: 'capitalize' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-md)', padding: '0.9rem', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <i className="bi bi-info-circle" style={{ flexShrink: 0, marginTop: '0.1rem' }}></i>
                Please wait until your token number is called. Keep this number handy.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-ghost" onClick={handlePrint}>
                <i className="bi bi-printer"></i> Print
              </button>
              <button className="btn-primary-glow" onClick={handleReset}>
                <i className="bi bi-plus-lg"></i> Generate Another
              </button>
            </div>
          </div>
        ) : (
          // Form View
          <div style={{ display: 'grid', gridTemplateColumns: queues.length > 0 ? '1fr 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>
            {/* Queue Selection */}
            {queues.length > 0 && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0.4rem' }}>Select Queue</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>Choose the service you need</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {queues.map((q) => (
                    <button
                      key={q._id}
                      onClick={() => setForm({ ...form, queueId: q._id })}
                      style={{
                        background: form.queueId === q._id ? `${q.color || '#6366f1'}15` : 'var(--bg-card)',
                        border: `1px solid ${form.queueId === q._id ? q.color || '#6366f1' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-lg)',
                        padding: '1rem 1.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.9rem',
                        transition: 'all 0.2s',
                        textAlign: 'left',
                        width: '100%',
                      }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: `${q.color || '#6366f1'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                        {q.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{q.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {q.counterName} · ~{q.avgWaitTime} min · {q.waitingCount || 0} waiting
                        </div>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${form.queueId === q._id ? q.color || '#6366f1' : 'var(--border-color)'}`, background: form.queueId === q._id ? q.color || '#6366f1' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                        {form.queueId === q._id && <i className="bi bi-check" style={{ color: 'white', fontSize: '0.7rem' }}></i>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Details Form */}
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0.4rem' }}>Your Details</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>Fill in your information (optional)</p>
              </div>

              <div className="qf-card" style={{ padding: '1.5rem' }}>
                {queues.length === 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label className="qf-label">Select Queue *</label>
                    <select className="qf-select" value={form.queueId} onChange={(e) => setForm({ ...form, queueId: e.target.value })}>
                      <option value="">-- Choose a queue --</option>
                      {queues.map((q) => <option key={q._id} value={q._id}>{q.icon} {q.name}</option>)}
                    </select>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="qf-label">Your Name</label>
                    <input className="qf-input" placeholder="Enter your name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
                  </div>
                  <div>
                    <label className="qf-label">Phone Number</label>
                    <input className="qf-input" placeholder="+91 XXXXX XXXXX" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
                  </div>
                  <div>
                    <label className="qf-label">Priority</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {['normal', 'priority'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setForm({ ...form, priority: p })}
                          style={{
                            background: form.priority === p ? (p === 'priority' ? 'rgba(236,72,153,0.15)' : 'rgba(99,102,241,0.15)') : 'var(--bg-secondary)',
                            border: `1px solid ${form.priority === p ? (p === 'priority' ? '#ec4899' : '#6366f1') : 'var(--border-color)'}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '0.65rem',
                            cursor: 'pointer',
                            color: form.priority === p ? (p === 'priority' ? '#ec4899' : '#6366f1') : 'var(--text-muted)',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.2s',
                          }}
                        >
                          <i className={`bi bi-${p === 'priority' ? 'star-fill' : 'person'}`}></i>
                          {p === 'priority' ? 'Priority' : 'Normal'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="qf-label">Notes (Optional)</label>
                    <input className="qf-input" placeholder="Any special requests..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>

                  {selectedQueue && (
                    <div style={{ background: `${selectedQueue.color}10`, border: `1px solid ${selectedQueue.color}25`, borderRadius: 'var(--radius-md)', padding: '0.9rem', fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 600, color: selectedQueue.color, marginBottom: '0.3rem' }}>
                        {selectedQueue.icon} {selectedQueue.name}
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        {selectedQueue.waitingCount || 0} people waiting · ~{(selectedQueue.waitingCount || 0) * selectedQueue.avgWaitTime} min est. wait
                      </div>
                    </div>
                  )}

                  <button
                    className="btn-primary-glow"
                    onClick={handleSubmit}
                    disabled={loading || !form.queueId}
                    style={{ justifyContent: 'center', padding: '0.9rem' }}
                  >
                    {loading ? <><i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s linear infinite' }}></i> Generating...</> : <><i className="bi bi-ticket-perforated-fill"></i> Generate Token</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {queues.length === 0 && !ticket && (
          <div className="qf-card" style={{ padding: '4rem', textAlign: 'center', marginTop: '1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></div>
            <h3 style={{ fontFamily: 'var(--font-display)' }}>No Active Queues</h3>
            <p style={{ color: 'var(--text-muted)' }}>There are currently no active queues available. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateToken;
