import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Shield, Key, LogIn, Mail, Lock, Eye, EyeOff, 
  Sparkles, CheckCircle2, ArrowLeft, GraduationCap, AlertCircle,
  Building, Wrench, ShieldCheck, Heart
} from 'lucide-react';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('admin@college.edu');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      await login(email.trim(), password);
      setSuccessMsg('Administrative access verified! Redirecting to console...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 400);
    } catch (err) {
      setError(err.message || 'Administrative authentication failed. Check credentials.');
    }
  };

  const fillCredentials = (targetEmail, targetPassword) => {
    setEmail(targetEmail);
    setPassword(targetPassword);
    setError('');
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '480px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Centered White Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '36px 32px',
        border: '1.5px solid rgba(249, 168, 212, 0.5)',
        boxShadow: '0 15px 45px rgba(236, 72, 153, 0.12)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'var(--primary-gradient)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 6px 20px rgba(236, 72, 153, 0.35)',
            marginBottom: '12px'
          }}>
            <Shield size={28} />
          </div>

          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px'
          }}>
            <span style={{ color: '#1E1B4B' }}>Campus</span>
            <span style={{ color: '#EC4899' }}>Care</span>
            <span style={{ color: '#F472B6', fontSize: '1.1rem', marginLeft: '3px' }}>✨</span>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E1B4B', marginTop: '10px', marginBottom: '4px' }}>
            Administrative Portal
          </h2>
          <p style={{ fontSize: '0.825rem', color: '#64748B', margin: 0 }}>
            Sign in to manage complaints, staff rosters, and SLA performance.
          </p>
        </div>

        {/* 1. Portal Selector (Student vs Admin/Staff) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          backgroundColor: '#FFF1F2',
          padding: '5px',
          borderRadius: '16px',
          marginBottom: '20px',
          border: '1.5px solid rgba(249, 168, 212, 0.6)'
        }}>
          <button
            type="button"
            onClick={() => navigate('/student/login')}
            style={{
              padding: '8px 12px',
              fontSize: '0.825rem',
              fontWeight: 700,
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            className="hover-card-highlight"
          >
            <GraduationCap size={16} />
            <span>Student Portal</span>
          </button>
          <button
            type="button"
            style={{
              padding: '8px 12px',
              fontSize: '0.825rem',
              fontWeight: 800,
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#ffffff',
              color: '#EC4899',
              boxShadow: '0 2px 8px rgba(236, 72, 153, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'default'
            }}
          >
            <Building size={16} />
            <span>Admin / Staff</span>
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            color: '#ef4444',
            fontSize: '0.8rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '12px',
            color: '#10b981',
            fontSize: '0.8rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label" style={{ fontWeight: 700, color: '#1E1B4B' }}>
              Administrator Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#EC4899' }} />
              <input
                type="email"
                placeholder="admin@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-control"
                style={{ paddingLeft: '38px', height: '44px', borderRadius: '12px' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="input-label" style={{ fontWeight: 700, color: '#1E1B4B' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#EC4899' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-control"
                style={{ paddingLeft: '38px', paddingRight: '40px', height: '44px', borderRadius: '12px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.95rem',
              fontWeight: 800,
              borderRadius: 'var(--radius-full)',
              marginTop: '4px',
              boxShadow: '0 6px 20px rgba(236, 72, 153, 0.35)'
            }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In as Administrator →'}</span>
          </button>
        </form>

        {/* Quick Fill Demo Credentials */}
        <div style={{
          marginTop: '20px',
          padding: '14px',
          backgroundColor: '#FDF2F8',
          borderRadius: '16px',
          border: '1px solid rgba(249, 168, 212, 0.5)'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EC4899', textTransform: 'uppercase', marginBottom: '8px' }}>
            Quick Demo Login
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              onClick={() => fillCredentials('admin@college.edu', 'admin123')}
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(249, 168, 212, 0.6)',
                backgroundColor: '#ffffff',
                color: '#1E1B4B',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Dean Sarah (Admin)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('alex.chen@college.edu', 'staff123')}
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(249, 168, 212, 0.6)',
                backgroundColor: '#ffffff',
                color: '#1E1B4B',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Alex Chen (IT Lead)
            </button>
          </div>
        </div>

        {/* Back to Student Portal Link */}
        <div style={{ textAlign: 'center', marginTop: '18px' }}>
          <Link
            to="/student/login"
            style={{
              fontSize: '0.825rem',
              fontWeight: 700,
              color: '#EC4899',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ArrowLeft size={14} />
            <span>Switch to Student Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
