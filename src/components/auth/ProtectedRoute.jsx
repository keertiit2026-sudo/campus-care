import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Home, LogIn, Lock } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Not authenticated -> Redirect to login
  if (!user && !token) {
    return <Navigate to="/student/login" state={{ from: location }} replace />;
  }

  // 2. Role restriction check
  if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="glass-panel" style={{
        padding: '50px 28px',
        textAlign: 'center',
        maxWidth: '560px',
        margin: '40px auto',
        borderRadius: '24px',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          margin: '0 auto 20px auto',
          boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)'
        }}>
          <ShieldAlert size={36} />
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '20px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '12px'
        }}>
          <Lock size={12} />
          <span>Restricted Clearance (403)</span>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
          Administrative Access Required
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px', lineHeight: 1.6 }}>
          This operations module is restricted to campus <strong>Administrators</strong> and <strong>Staff</strong>.
          You are currently signed in as <strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong> ({user.role}).
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ gap: '6px' }}>
            <Home size={16} />
            <span>Return to Dashboard</span>
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="btn btn-primary"
            style={{
              gap: '6px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)'
            }}
          >
            <LogIn size={16} />
            <span>Sign In as Admin</span>
          </button>
        </div>
      </div>
    );
  }

  return children;
};
