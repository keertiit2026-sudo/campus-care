import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, PlusCircle, Search, Menu, 
  ChevronDown, Shield, User, X, LogIn, LogOut, UserPlus, 
  GraduationCap, Sparkles, Heart
} from 'lucide-react';

export const Header = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    notifications,
    setNotifications,
    searchQuery,
    setSearchQuery,
    openModal
  } = useApp();

  const {
    user,
    logout
  } = useAuth();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const personaRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (personaRef.current && !personaRef.current.contains(e.target)) {
        setShowPersonaMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotifClick = (complaintId) => {
    setShowNotifMenu(false);
    navigate(`/complaints/${complaintId}`);
  };

  const handleSignOut = () => {
    logout();
    setShowPersonaMenu(false);
    navigate('/student/login');
  };

  const userName = user?.name || 'Keerti';
  const userRole = user?.role === 'admin' ? 'Admin' : (user?.role === 'staff' ? 'Staff' : 'Student');
  const userAvatar = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;

  return (
    <header className="app-header">
      {/* Left side: Hamburger & Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '520px' }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-ghost"
          style={{ padding: '8px', display: 'flex', color: 'var(--text-primary)' }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#EC4899'
            }}
          />
          <input
            type="text"
            placeholder="Search complaints by title, category, ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value && location.pathname !== '/complaints') {
                navigate('/complaints');
              }
            }}
            className="input-control"
            style={{
              paddingLeft: '38px',
              height: '42px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#ffffff',
              border: '1.5px solid rgba(249, 168, 212, 0.5)',
              fontSize: '0.85rem'
            }}
          />
        </div>
      </div>

      {/* Right side: Actions, Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Quick Raise Complaint Button */}
        <button
          onClick={() => openModal('createComplaint')}
          className="btn btn-primary btn-sm"
          style={{
            gap: '6px',
            boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
            display: 'none'
          }}
          id="header-raise-complaint-btn"
        >
          <PlusCircle size={15} />
          <span>Raise Complaint</span>
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1.5px solid rgba(249, 168, 212, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1E1B4B',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s ease'
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: '#EC4899',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 10px)',
                width: '320px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid rgba(249, 168, 212, 0.6)',
                boxShadow: '0 10px 35px rgba(236, 72, 153, 0.15)',
                zIndex: 100,
                overflow: 'hidden',
                animation: 'fadeIn 0.15s ease'
              }}
            >
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(249, 168, 212, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FDF2F8'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E1B4B' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotifsRead}
                    style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#EC4899', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No new notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n.complaintId)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(249, 168, 212, 0.2)',
                        backgroundColor: n.read ? '#ffffff' : 'rgba(252, 231, 243, 0.3)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E1B4B' }}>{n.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div style={{ position: 'relative' }} ref={personaRef}>
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 12px 4px 4px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid rgba(249, 168, 212, 0.5)',
              boxShadow: '0 2px 8px rgba(236, 72, 153, 0.06)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <img
              src={userAvatar}
              alt={userName}
              referrerPolicy="no-referrer"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid #EC4899'
              }}
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName || 'User')}`;
              }}
            />
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#1E1B4B' }}>
                {userName}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#EC4899', fontWeight: 700 }}>
                {userRole}
              </div>
            </div>
            <ChevronDown size={14} color="#64748B" />
          </button>

          {/* Profile Dropdown Menu */}
          {showPersonaMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 10px)',
                width: '210px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid rgba(249, 168, 212, 0.6)',
                boxShadow: '0 10px 35px rgba(236, 72, 153, 0.15)',
                padding: '6px',
                zIndex: 100,
                animation: 'fadeIn 0.15s ease'
              }}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(249, 168, 212, 0.3)', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E1B4B' }}>{userName}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user?.email || 'student@college.edu'}</div>
              </div>

              <Link
                to="/profile"
                onClick={() => setShowPersonaMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  color: '#1E1B4B',
                  textDecoration: 'none',
                  fontSize: '0.825rem',
                  fontWeight: 600
                }}
                className="btn-ghost"
              >
                <User size={15} color="#EC4899" />
                <span>My Profile</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  color: '#ef4444',
                  backgroundColor: 'transparent',
                  border: 'none',
                  width: '100%',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                className="btn-ghost"
              >
                <LogOut size={15} color="#ef4444" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
