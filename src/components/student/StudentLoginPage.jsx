import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, Mail, Lock, User, 
  Eye, EyeOff, Sparkles, CheckCircle2, ArrowRight,
  AlertCircle, Building, Heart, Lightbulb
} from 'lucide-react';

const COLLEGE_DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology & AI',
  'Electronics & Communication (ECE)',
  'Electrical & Electronics (EEE)',
  'Mechanical Engineering',
  'Civil & Environmental Engineering',
  'Biotechnology & Chemical',
  'Management & Business Studies',
  'Basic Sciences & Humanities'
];

export const StudentLoginPage = ({ defaultTab = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loading } = useAuth();

  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes('register')) return 'register';
    return defaultTab || 'login';
  });

  useEffect(() => {
    if (location.pathname.includes('register')) {
      setActiveTab('register');
    } else if (location.pathname.includes('login')) {
      setActiveTab('login');
    }
  }, [location.pathname]);

  // Login form state
  const [identifier, setIdentifier] = useState(() => {
    return localStorage.getItem('campuscare_saved_student_id') || 'STU-2024-8841';
  });
  const [loginPassword, setLoginPassword] = useState('student123');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState(COLLEGE_DEPARTMENTS[0]);
  const [year, setYear] = useState('1st Year');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setError('Please enter your Student Roll ID or College Email.');
      return;
    }

    try {
      await login(identifier.trim(), loginPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your Student ID and password.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim() || !email.trim() || !registerPassword) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password: registerPassword,
        studentId: studentId.trim() || `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        department,
        year,
        role: 'student'
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      backgroundColor: 'var(--bg-primary, #FFF7FB)',
      backgroundImage: `
        radial-gradient(circle at 10% 20%, rgba(252, 231, 243, 0.7) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(253, 242, 248, 0.85) 0%, transparent 45%),
        linear-gradient(135deg, #FFF7FB 0%, #FFFFFF 50%, #FDF2F8 100%)
      `
    }}>
      {/* Centered White Auth Card */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '36px 32px',
        border: '1.5px solid rgba(249, 168, 212, 0.5)',
        boxShadow: '0 15px 45px rgba(236, 72, 153, 0.12)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Logo Header */}
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
            <GraduationCap size={28} />
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

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E1B4B', marginTop: '12px', marginBottom: '4px' }}>
            {activeTab === 'login' ? 'Student Login' : 'Create Student Account'}
          </h2>
          <p style={{ fontSize: '0.825rem', color: '#64748B', margin: 0 }}>
            {activeTab === 'login' 
              ? 'Access your account to raise complaints and track status.'
              : 'Join CampusCare to resolve campus issues quickly.'}
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
          marginBottom: '18px',
          border: '1.5px solid rgba(249, 168, 212, 0.6)'
        }}>
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
            <GraduationCap size={16} />
            <span>Student Portal</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/login')}
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
            <Building size={16} />
            <span>Admin / Staff</span>
          </button>
        </div>

        {/* 2. Student Sub-Tab Switcher (Login vs Register) */}
        <div style={{
          display: 'flex',
          backgroundColor: '#FDF2F8',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          marginBottom: '20px',
          border: '1px solid rgba(249, 168, 212, 0.4)'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '7px',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              border: 'none',
              backgroundColor: activeTab === 'login' ? '#ffffff' : 'transparent',
              color: activeTab === 'login' ? '#EC4899' : '#64748B',
              boxShadow: activeTab === 'login' ? '0 2px 8px rgba(236, 72, 153, 0.12)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '7px',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              border: 'none',
              backgroundColor: activeTab === 'register' ? '#ffffff' : 'transparent',
              color: activeTab === 'register' ? '#EC4899' : '#64748B',
              boxShadow: activeTab === 'register' ? '0 2px 8px rgba(236, 72, 153, 0.12)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Register
          </button>
        </div>

        {/* Error / Success Notifications */}
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
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="input-label" style={{ fontWeight: 700, color: '#1E1B4B' }}>
                Email or Student ID
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#EC4899' }} />
                <input
                  type="text"
                  placeholder="e.g. STU-2024-8841 or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
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
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
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

            {/* Login Button */}
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
                marginTop: '6px',
                boxShadow: '0 6px 20px rgba(236, 72, 153, 0.35)'
              }}
            >
              <span>{loading ? 'Logging in...' : 'Login →'}</span>
            </button>

            {/* Register Link */}
            <div style={{ textAlign: 'center', fontSize: '0.825rem', color: '#64748B', marginTop: '4px' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#EC4899',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Register
              </button>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="input-label" style={{ fontWeight: 700 }}>Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-control"
                style={{ height: '42px', borderRadius: '12px' }}
                required
              />
            </div>

            <div>
              <label className="input-label" style={{ fontWeight: 700 }}>College Email *</label>
              <input
                type="email"
                placeholder="priya.sharma@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-control"
                style={{ height: '42px', borderRadius: '12px' }}
                required
              />
            </div>

            <div>
              <label className="input-label" style={{ fontWeight: 700 }}>Academic Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="input-control"
                style={{ height: '42px', borderRadius: '12px' }}
              >
                {COLLEGE_DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label" style={{ fontWeight: 700 }}>Create Password *</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="input-control"
                style={{ height: '42px', borderRadius: '12px' }}
                required
              />
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
                marginTop: '6px'
              }}
            >
              <span>{loading ? 'Creating Account...' : 'Create Account →'}</span>
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.825rem', color: '#64748B' }}>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                style={{ background: 'none', border: 'none', color: '#EC4899', fontWeight: 700, cursor: 'pointer' }}
              >
                Login
              </button>
            </div>
          </form>
        )}

        {/* Quick Fill Demo Student Credentials */}
        {activeTab === 'login' && (
          <div style={{
            marginTop: '18px',
            padding: '12px 14px',
            backgroundColor: '#FDF2F8',
            borderRadius: '16px',
            border: '1px solid rgba(249, 168, 212, 0.5)'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#EC4899', textTransform: 'uppercase', marginBottom: '6px' }}>
              Quick Demo Login
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setIdentifier('STU-2024-8841');
                  setLoginPassword('student123');
                  setError('');
                }}
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
                Priya Sharma (STU-2024-8841)
              </button>
            </div>
          </div>
        )}

        {/* Switch to Admin / Staff Portal Banner */}
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1.5px dashed rgba(249, 168, 212, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E1B4B' }}>Campus Administrator?</div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Access management & triage console</div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/login')}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 800,
              gap: '4px',
              whiteSpace: 'nowrap'
            }}
          >
            <span>Admin Login</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Bottom Encouragement Callout */}
        <div style={{
          marginTop: '18px',
          padding: '10px 14px',
          backgroundColor: '#FDF2F8',
          borderRadius: '14px',
          border: '1px solid rgba(249, 168, 212, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          color: '#EC4899',
          fontWeight: 700
        }}>
          <Lightbulb size={14} />
          <span>Together we make campus life better! ♡</span>
        </div>
      </div>
    </div>
  );
};
