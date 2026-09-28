import React from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  ListFilter, 
  FileText, 
  BarChart3, 
  Building, 
  RotateCcw, 
  Sparkles,
  Download,
  GraduationCap,
  LogOut,
  Bell,
  Heart,
  Grid,
  User
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    currentPersona, 
    stats, 
    openModal, 
    resetToSampleData 
  } = useApp();
  const { user, logout } = useAuth();

  const isStudent = user?.role === 'student' || currentPersona?.role === 'student';

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { path: '/complaints', label: 'Complaints', icon: ListFilter, badge: stats?.total || 0 },
    ...(isStudent ? [
      { path: '/complaints/my', label: 'My Tickets', icon: FileText, badge: (stats?.myTotal || 0) > 0 ? stats?.myTotal : null }
    ] : []),
    { path: '/departments', label: 'Departments', icon: Building, badge: null },
    { path: '/profile', label: 'My Profile', icon: User, badge: null },
    ...(user?.role === 'admin' || user?.role === 'staff' || currentPersona?.role === 'admin' ? [
      { path: '/admin/intelligence', label: 'Intelligence AI', icon: Sparkles, badge: 'AI' },
      { path: '/analytics', label: 'Reports', icon: BarChart3, badge: null }
    ] : [])
  ];

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const handleSignOut = () => {
    logout();
    if (onCloseMobile) onCloseMobile();
    navigate('/student/login');
  };

  return (
    <aside className={`app-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Logo Link */}
      <Link
        to="/dashboard"
        onClick={handleLinkClick}
        style={{
          padding: '22px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none'
        }}
      >
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'var(--primary-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(236, 72, 153, 0.35)',
          color: '#ffffff'
        }}>
          <GraduationCap size={24} />
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            <span style={{ color: '#1E1B4B' }}>Campus</span>
            <span style={{ color: '#EC4899' }}>Care</span>
            <span style={{ color: '#F472B6', fontSize: '0.9rem', marginLeft: '2px' }}>✨</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Complaint System
          </div>
        </div>
      </Link>

      {/* Navigation Menu */}
      <div style={{ flex: 1, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
        <div style={{
          fontSize: '0.68rem',
          fontWeight: 800,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '4px 12px 6px',
          marginBottom: '2px'
        }}>
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 600,
                background: isActive ? 'var(--primary-gradient)' : 'transparent',
                color: isActive ? '#ffffff' : '#1E1B4B',
                boxShadow: isActive ? '0 6px 18px rgba(236, 72, 153, 0.3)' : 'none',
                transition: 'all 0.15s ease'
              }}
              className={!isActive ? 'btn-ghost' : ''}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} color={isActive ? '#ffffff' : '#EC4899'} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : '#FCE7F3',
                  color: isActive ? '#ffffff' : '#EC4899'
                }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Aesthetic Footer Branding */}
      <div style={{
        padding: '16px 18px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        backgroundColor: 'rgba(253, 242, 248, 0.5)'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '8px 12px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid rgba(249, 168, 212, 0.4)',
          boxShadow: '0 2px 8px rgba(236, 72, 153, 0.06)'
        }}>
          <div style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            color: '#EC4899',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}>
            <span>Better Campus Together</span>
            <Heart size={13} fill="#EC4899" color="#EC4899" />
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="btn btn-ghost btn-sm"
          style={{
            width: '100%',
            justifyContent: 'flex-start',
            gap: '8px',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem'
          }}
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
