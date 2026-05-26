import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ADMIN_PIN = '0822'; // Master admin PIN to access this page

const StaffManagement = () => {
  const { staffList, addStaffMember, removeStaffMember, updateStaffPin } = useAuth();
  const { addToast } = useToast();

  const [adminVerified, setAdminVerified] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState({ id: '', name: '', pin: '' });
  const [editingId, setEditingId] = useState(null);
  const [newPin, setNewPin] = useState('');

  const verifyAdmin = () => {
    if (adminPin === ADMIN_PIN) {
      setAdminVerified(true);
    } else {
      setAdminError('Incorrect admin PIN.');
      setAdminPin('');
    }
  };

  const handleAdd = () => {
    if (!newMember.id.trim() || !newMember.name.trim() || !newMember.pin.trim()) {
      return addToast('All fields are required', 'warning');
    }
    if (staffList.find(s => s.id.toLowerCase() === newMember.id.toLowerCase())) {
      return addToast('Staff ID already exists', 'error');
    }
    addStaffMember({ id: newMember.id.trim().toUpperCase(), name: newMember.name.trim(), pin: newMember.pin.trim() });
    setNewMember({ id: '', name: '', pin: '' });
    setShowAdd(false);
    addToast('Staff member added!', 'success');
  };

  const handleUpdatePin = (id) => {
    if (!newPin.trim()) return addToast('PIN cannot be empty', 'warning');
    updateStaffPin(id, newPin.trim());
    setEditingId(null);
    setNewPin('');
    addToast('PIN updated!', 'success');
  };

  const handleRemove = (id, name) => {
    if (!window.confirm(`Remove ${name} from staff?`)) return;
    removeStaffMember(id);
    addToast('Staff member removed', 'success');
  };

  const inputStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '0.65rem 0.9rem',
    color: 'var(--text-primary)',
    fontSize: '0.88rem',
    outline: 'none',
    fontFamily: 'var(--font-body)',
    width: '100%',
  };

  if (!adminVerified) {
    return (
      <div className="bg-mesh grid-overlay" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 380, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}></div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '0.4rem' }}>Admin Access Required</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>Enter the master admin PIN to manage staff</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              style={{ ...inputStyle, textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.3em' }}
              placeholder="Admin PIN"
              value={adminPin}
              onChange={e => { setAdminPin(e.target.value); setAdminError(''); }}
              onKeyDown={e => e.key === 'Enter' && verifyAdmin()}
              autoFocus
            />
            {adminError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', fontSize: '0.82rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-exclamation-circle"></i> {adminError}
              </div>
            )}
            <button className="btn-primary-glow" onClick={verifyAdmin} disabled={!adminPin} style={{ justifyContent: 'center', padding: '0.85rem' }}>
              <i className="bi bi-shield-lock-fill"></i> Verify
            </button>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
              Default admin PIN: <strong style={{ color: 'var(--text-secondary)' }}>0000</strong> — change in StaffManagement.js
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-mesh grid-overlay" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '0.4rem' }}>
              <i className="bi bi-people-fill me-1"></i> Admin
            </div>
            <h1 className="page-title">Staff <span className="text-gradient">Management</span></h1>
            <p className="page-subtitle">Add, remove, or update staff credentials</p>
          </div>
          <button className="btn-primary-glow" onClick={() => setShowAdd(!showAdd)}>
            <i className={`bi bi-${showAdd ? 'x-lg' : 'person-plus-fill'}`}></i>
            {showAdd ? 'Cancel' : 'Add Staff'}
          </button>
        </div>

        {/* Add Staff Form */}
        {showAdd && (
          <div className="qf-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.3)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1.25rem' }}>
              <i className="bi bi-person-plus-fill me-2" style={{ color: 'var(--accent-primary)' }}></i>New Staff Member
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Staff ID *</label>
                <input style={inputStyle} placeholder="e.g. STAFF003" value={newMember.id} onChange={e => setNewMember({ ...newMember, id: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Full Name *</label>
                <input style={inputStyle} placeholder="e.g. Priya Sharma" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>PIN *</label>
                <input style={inputStyle} placeholder="4-digit PIN" value={newMember.pin} onChange={e => setNewMember({ ...newMember, pin: e.target.value })} maxLength={8} type="password" />
              </div>
            </div>
            <button className="btn-primary-glow" onClick={handleAdd} style={{ padding: '0.7rem 1.5rem' }}>
              <i className="bi bi-check-lg"></i> Add Member
            </button>
          </div>
        )}

        {/* Staff List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {staffList.map((member) => (
            <div
              key={member.id}
              className="qf-card"
              style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}
            >
              {/* Avatar */}
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '2px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: '#a5b4fc', flexShrink: 0 }}>
                {member.name.charAt(0)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{member.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span><i className="bi bi-person-badge me-1"></i>{member.id}</span>
                  <span><i className="bi bi-lock me-1"></i>PIN: {'•'.repeat(member.pin.length)}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {editingId === member.id ? (
                  <>
                    <input
                      type="password"
                      style={{ ...inputStyle, width: 130, padding: '0.5rem 0.75rem' }}
                      placeholder="New PIN"
                      value={newPin}
                      onChange={e => setNewPin(e.target.value)}
                      maxLength={8}
                      autoFocus
                    />
                    <button className="btn-primary-glow" onClick={() => handleUpdatePin(member.id)} style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}>
                      <i className="bi bi-check-lg"></i> Save
                    </button>
                    <button className="btn-ghost" onClick={() => { setEditingId(null); setNewPin(''); }} style={{ padding: '0.5rem 0.75rem' }}>
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-ghost" onClick={() => { setEditingId(member.id); setNewPin(''); }} style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem', gap: '0.35rem' }}>
                      <i className="bi bi-key-fill"></i> Change PIN
                    </button>
                    <button
                      className="btn-danger-soft"
                      onClick={() => handleRemove(member.id, member.name)}
                      style={{ padding: '0.5rem 0.75rem' }}
                      title="Remove staff member"
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {staffList.length === 0 && (
            <div className="qf-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.3 }}></div>
              <h3 style={{ fontFamily: 'var(--font-display)' }}>No staff members yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>Click "Add Staff" to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;