import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Sparkles, ArrowRight, Zap, 
  Users, Shield, Heart, CheckCircle2, Clock, 
  Smile, Award, Star
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary, #FFF7FB)',
      backgroundImage: `
        radial-gradient(circle at 15% 15%, rgba(252, 231, 243, 0.7) 0%, transparent 40%),
        radial-gradient(circle at 85% 75%, rgba(253, 242, 248, 0.85) 0%, transparent 45%),
        linear-gradient(135deg, #FFF7FB 0%, #FFFFFF 50%, #FDF2F8 100%)
      `,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 1. Clean White Navbar */}
      <header style={{
        height: '76px',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(249, 168, 212, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 12px rgba(236, 72, 153, 0.04)'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)'
          }}>
            <GraduationCap size={22} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontFamily: 'var(--font-heading)' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E1B4B' }}>Campus</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#EC4899' }}>Care</span>
            <span style={{ color: '#F472B6', fontSize: '1rem', marginLeft: '3px' }}>✨</span>
          </div>
        </Link>

        {/* Center Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#EC4899',
            backgroundColor: '#FCE7F3',
            padding: '5px 14px',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer'
          }}>
            Home
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>
            About
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>
            Features
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>
            Contact
          </span>
        </nav>

        {/* Login CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to="/student/login"
            className="btn btn-primary btn-sm"
            style={{
              gap: '6px',
              padding: '8px 16px',
              fontSize: '0.825rem',
              boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)'
            }}
          >
            <GraduationCap size={15} />
            <span>Student Login</span>
          </Link>
          <Link
            to="/admin/login"
            className="btn btn-secondary btn-sm"
            style={{
              gap: '6px',
              padding: '8px 14px',
              fontSize: '0.825rem'
            }}
          >
            <Shield size={14} />
            <span>Admin / Staff</span>
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '48px 24px 60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        alignItems: 'center',
        gap: '48px',
        flex: 1
      }}>
        {/* Left: Text & CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 2 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FCE7F3',
            border: '1px solid rgba(249, 168, 212, 0.6)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 800,
            color: '#EC4899',
            width: 'fit-content'
          }}>
            <Sparkles size={14} fill="#EC4899" />
            <span>Student Complaint Management System</span>
          </div>

          {/* Headline */}
          <div>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#1E1B4B',
              letterSpacing: '-0.03em',
              margin: 0
            }}>
              Your Voice Matters
            </h1>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#EC4899',
              letterSpacing: '-0.03em',
              margin: '4px 0 0 0'
            }}>
              We're Here to Help
            </h2>
          </div>

          {/* Subheading */}
          <p style={{
            fontSize: '1.1rem',
            color: '#64748B',
            lineHeight: 1.6,
            maxWidth: '480px',
            margin: 0
          }}>
            Report issues. Track progress. Make your campus better — all in one transparent, student-friendly platform.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/student/login')}
              className="btn btn-primary"
              style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                padding: '13px 26px',
                borderRadius: 'var(--radius-full)',
                gap: '8px',
                boxShadow: '0 8px 25px rgba(236, 72, 153, 0.35)'
              }}
            >
              <GraduationCap size={18} />
              <span>Student Portal</span>
              <ArrowRight size={16} />
            </button>

            <Link
              to="/admin/login"
              className="btn btn-secondary"
              style={{
                fontSize: '0.925rem',
                fontWeight: 700,
                padding: '12px 22px',
                borderRadius: 'var(--radius-full)',
                gap: '6px'
              }}
            >
              <Shield size={16} />
              <span>Admin & Staff Console</span>
            </Link>
          </div>

          {/* Stats Badges Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(249, 168, 212, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899' }}>
                <Users size={18} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1E1B4B', lineHeight: 1 }}>1000+</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Students</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1E1B4B', lineHeight: 1 }}>50+</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Issues Resolved</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1E1B4B', lineHeight: 1 }}>24/7</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Modern Aesthetic Student Illustration Card */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          {/* Subtle Decorative Pink Glow */}
          <div style={{
            position: 'absolute',
            inset: '-15px',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%)',
            borderRadius: '30px',
            zIndex: 0
          }} />

          {/* Illustration Container */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              backgroundColor: '#ffffff',
              padding: '12px',
              borderRadius: '28px',
              border: '1.5px solid rgba(249, 168, 212, 0.6)',
              boxShadow: '0 20px 50px rgba(236, 72, 153, 0.15)',
              maxWidth: '480px',
              width: '100%',
              overflow: 'hidden'
            }}
          >
            <img
              src="/student_hero.jpg"
              alt="CampusCare Student with Laptop"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '20px',
                display: 'block',
                objectFit: 'cover'
              }}
            />

            {/* Cute Floating Tag */}
            <div style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: '8px 14px',
              borderRadius: '16px',
              border: '1px solid rgba(249, 168, 212, 0.6)',
              boxShadow: '0 6px 20px rgba(236, 72, 153, 0.15)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EC4899', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Small Steps Big Changes</span>
                <Heart size={12} fill="#EC4899" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 4 Features Pills Card Banner */}
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto 40px',
        padding: '0 24px',
        width: '100%'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '24px 32px',
          border: '1.5px solid rgba(249, 168, 212, 0.45)',
          boxShadow: '0 10px 35px rgba(236, 72, 153, 0.08)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899', flexShrink: 0 }}>
              <Zap size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E1B4B' }}>Quick Support</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Fast turnaround & automated routing</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899', flexShrink: 0 }}>
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E1B4B' }}>Transparent Process</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Real-time status updates</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899', flexShrink: 0 }}>
              <Shield size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E1B4B' }}>Better Campus Life</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Safe & well-maintained facilities</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899', flexShrink: 0 }}>
              <Heart size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E1B4B' }}>Student Focused</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Built with students in mind ♡</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
