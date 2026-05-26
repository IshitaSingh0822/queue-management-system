import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { connected } = useSocket();
  const { role, currentStaff, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const staffLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: 'bi-grid-fill' },
    { to: '/queues', label: 'Queues', icon: 'bi-collection-fill' },
    { to: '/staff', label: 'Staff', icon: 'bi-people-fill' },
    { to: '/display', label: 'Display Board', icon: 'bi-display-fill' },
  ];

  const customerLinks = [
    { to: '/generate', label: 'Get Token', icon: 'bi-ticket-perforated-fill' },
    { to: '/display', label: 'Display Board', icon: 'bi-display-fill' },
  ];

  const links = role === 'staff' ? staffLinks : customerLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="qf-navbar" style={{ height: 64 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <NavLink to={role === 'staff' ? '/dashboard' : '/generate'} className="qf-logo" style={{ textDecoration: 'none' }}>
          Queue<span>Flow</span>
          <sup style={{ fontSize: '0.45em', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginLeft: 2 }}>PRO</sup>
        </NavLink>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="d-none d-md-flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `qf-nav-link ${isActive ? 'active' : ''}`}
            >
              <i className={`bi ${l.icon}`} style={{ fontSize: '0.9rem' }}></i>
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Staff name badge */}
          {role === 'staff' && currentStaff && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 100, padding: '0.25rem 0.85rem 0.25rem 0.4rem', fontSize: '0.75rem', color: '#a5b4fc' }} className="d-none d-sm-flex">
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem' }}>
                {currentStaff.name.charAt(0)}
              </div>
              <span style={{ fontWeight: 600 }}>{currentStaff.name.split(' ')[0]}</span>
              <span style={{ opacity: 0.5, fontSize: '0.65rem' }}>{currentStaff.id}</span>
            </div>
          )}

          {/* Customer badge */}
          {role === 'customer' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 100, padding: '0.25rem 0.75rem', fontSize: '0.72rem', fontWeight: 600, color: '#67e8f9' }} className="d-none d-sm-flex">
              <i className="bi bi-person-fill"></i> Customer
            </div>
          )}

          {/* Live dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: connected ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            <span className={`pulse-dot ${connected ? 'green' : 'red'}`} style={{ width: 8, height: 8 }}></span>
            <span className="d-none d-sm-inline">{connected ? 'Live' : 'Offline'}</span>
          </div>

          {/* Logout */}
          <button onClick={handleLogout} className="btn-ghost d-none d-md-flex" title="Logout" style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', gap: '0.35rem' }}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>

          {/* Mobile toggle */}
          <button className="d-md-none btn-ghost" onClick={() => setMenuOpen(!menuOpen)} style={{ padding: '0.4rem 0.6rem', fontSize: '1.1rem' }}>
            <i className={`bi bi-${menuOpen ? 'x-lg' : 'list'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="d-md-none" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `qf-nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              <i className={`bi ${l.icon}`}></i> {l.label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="btn-ghost" style={{ marginTop: '0.5rem', justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.85rem' }}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;