import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LogIn, UserPlus, Mail, Lock, User, 
  GraduationCap, Building, Key, AlertCircle, Sparkles, Shield, ArrowLeft 
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

export const AuthPage = ({ defaultTab = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loading, quickSwitchPersona } = useAuth();

  const [activeTab, setActiveTab] = useState(
    location.pathname === '/register' ? 'register' : (defaultTab || 'login')
  );

  useEffect(() => {
    if (location.pathname === '/register') {
      setActiveTab('register');
    } else if (location.pathname === '/login') {
      setActiveTab('login');
    }
  }, [location.pathname]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState(COLLEGE_DEPARTMENTS[0]);
  const [year, setYear] = useState('1st Year');
  const [hostel, setHostel] = useState('Day Scholar');

  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Check your email and password.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register({
        name,
        email,
        password,
        studentId,
        department,
        year,
        hostel
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    }
  };

  const handleFillDemo = (role) => {
    quickSwitchPersona(role);
    navigate('/dashboard');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="btn btn-ghost"
        style={{ width: 'fit-content', gap: '8px', padding: '8px 12px', fontSize: '0.875rem' }}
      >
        <ArrowLeft size={18} />
        <span>Back to Dashboard</span>
      </button>

      {/* Main Glass Panel */}
      <div className="glass-panel" style={{ padding: '36px', borderRadius: '24px' }}>
        
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary-500), var(--accent-cyan))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 12px auto',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={24} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {activeTab === 'login' ? 'Sign In to CampusCare' : 'New Student Registration'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            College Complaint & Maintenance Resolution Portal
          </p>
        </div>

        {/* Tab switch */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-tertiary)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('login'); navigate('/login'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'login' ? 'var(--primary-600)' : 'transparent',
              color: activeTab === 'login' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); navigate('/register'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'register' ? 'var(--primary-600)' : 'transparent',
              color: activeTab === 'register' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <UserPlus size={16} />
            <span>Student Registration</span>
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            color: '#ef4444',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form 1: Login */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">College Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  placeholder="e.g. admin@college.edu or student@college.edu"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="input-control"
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  placeholder="Enter your account password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="input-control"
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '6px' }}
            >
              <LogIn size={18} />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>

            {/* Quick Demo Logins Bar */}
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '14px',
              border: '1px dashed var(--border-color)',
              marginTop: '12px'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                1-Click Quick Testing Roles:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleFillDemo('student')}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, fontSize: '0.78rem' }}
                >
                  <GraduationCap size={14} color="#6366f1" />
                  <span>Student (Priya)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin')}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, fontSize: '0.78rem' }}
                >
                  <Shield size={14} color="#f59e0b" />
                  <span>Dean (Admin)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('staff')}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, fontSize: '0.78rem' }}
                >
                  <Key size={14} color="#06b6d4" />
                  <span>IT Staff (Alex)</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Form 2: Student Registration */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rohit Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-control"
                  required
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Student Roll / ID *</label>
                <input
                  type="text"
                  placeholder="e.g. CS-2024-042"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="input-control"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">College Email Address *</label>
                <input
                  type="email"
                  placeholder="rohit@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-control"
                  required
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Password * (Min 6 chars)</label>
                <input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-control"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Academic Department *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="input-control"
              >
                {COLLEGE_DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Academic Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="input-control"
                >
                  <option value="1st Year">1st Year (Semester 1-2)</option>
                  <option value="2nd Year">2nd Year (Semester 3-4)</option>
                  <option value="3rd Year">3rd Year (Semester 5-6)</option>
                  <option value="4th Year">4th Year (Semester 7-8)</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Residence / Hostel</label>
                <input
                  type="text"
                  placeholder="e.g. Block A Room 204 or Day Scholar"
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  className="input-control"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '6px' }}
            >
              <Sparkles size={18} />
              <span>{loading ? 'Creating Student Account...' : 'Complete Registration'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
