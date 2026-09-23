import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center', maxWidth: '600px', margin: '40px auto', borderRadius: '24px' }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, var(--primary-500), var(--accent-cyan))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        margin: '0 auto 16px auto',
        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
      }}>
        <Sparkles size={32} />
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>404</h1>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
        The campus page or ticket URL you are trying to access does not exist or has been relocated.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ gap: '6px' }}>
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ gap: '6px' }}>
          <Home size={16} />
          <span>Campus Dashboard</span>
        </button>
      </div>
    </div>
  );
};
