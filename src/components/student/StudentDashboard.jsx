import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  FileText, Clock, CheckCircle2, AlertTriangle, 
  PlusCircle, Sparkles, ArrowRight, ShieldCheck, MapPin,
  TrendingUp, Wifi, BookOpen, Building, Home, Laptop, 
  Grid, Compass, Search, Heart, HelpCircle
} from 'lucide-react';

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { studentComplaints = [], complaints = [], currentPersona, openModal } = useApp();

  const myComplaints = studentComplaints;

  const totalCount = studentComplaints.length;
  const inProgressCount = studentComplaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolvedCount = studentComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const criticalCount = studentComplaints.filter(c => c.priority === 'urgent' || c.priority === 'high').length;

  // Status Badge Component (Soft Pastel as specified)
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return <span style={{ padding: '3px 9px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6' }}>Submitted</span>;
      case 'Under Review':
        return <span style={{ padding: '3px 9px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#D97706' }}>Under Review</span>;
      case 'Assigned':
        return <span style={{ padding: '3px 9px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(14, 165, 233, 0.12)', color: '#0284C7' }}>Assigned</span>;
      case 'In Progress':
        return <span style={{ padding: '3px 9px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#6366F1' }}>In Progress</span>;
      case 'Resolved':
        return <span style={{ padding: '3px 9px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>Resolved</span>;
      default:
        return <span style={{ padding: '3px 9px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(100, 116, 139, 0.12)', color: '#64748B' }}>{status || 'Closed'}</span>;
    }
  };

  // Priority Badge
  const renderPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
      case 'critical':
        return <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#EC4899', backgroundColor: '#FDF2F8', padding: '2px 7px', borderRadius: '4px' }}>Critical</span>;
      case 'high':
        return <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F59E0B', backgroundColor: '#FFFBEB', padding: '2px 7px', borderRadius: '4px' }}>High</span>;
      case 'medium':
        return <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0EA5E9', backgroundColor: '#F0F9FF', padding: '2px 7px', borderRadius: '4px' }}>Medium</span>;
      default:
        return <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10B981', backgroundColor: '#ECFDF5', padding: '2px 7px', borderRadius: '4px' }}>Low</span>;
    }
  };

  const categories = [
    { id: 'classroom', name: 'Classroom', icon: Building, color: '#EC4899' },
    { id: 'laboratory', name: 'Laboratory', icon: Laptop, color: '#8B5CF6' },
    { id: 'hostel', name: 'Hostel', icon: Home, color: '#0EA5E9' },
    { id: 'wifi_it', name: 'Wi-Fi', icon: Wifi, color: '#EC4899' },
    { id: 'library', name: 'Library', icon: BookOpen, color: '#10B981' },
    { id: 'general', name: 'Others', icon: Grid, color: '#64748B' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Title */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '4px 0 0 0' }}>
          Here's what's happening in your campus.
        </p>
      </div>

      {/* 2. Main 2-Column Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 340px',
        gap: '24px',
        alignItems: 'start'
      }}
      className="student-dashboard-grid"
      >
        {/* Left Column: Stats & Recent Complaints */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          {/* 4 Stat Cards Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px'
          }}>
            {/* Total Complaints */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '18px 20px',
              border: '1.5px solid rgba(249, 168, 212, 0.45)',
              boxShadow: '0 4px 15px rgba(236, 72, 153, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899' }}>
                <FileText size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>Total Complaints</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1E1B4B', lineHeight: 1.1, marginTop: '2px' }}>{totalCount}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '6px' }}>
                  <TrendingUp size={12} />
                  <span>↑ 2 this week</span>
                </div>
              </div>
            </div>

            {/* In Progress */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '18px 20px',
              border: '1.5px solid rgba(249, 168, 212, 0.45)',
              boxShadow: '0 4px 15px rgba(236, 72, 153, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>In Progress</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1E1B4B', lineHeight: 1.1, marginTop: '2px' }}>{inProgressCount}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '6px' }}>
                  <TrendingUp size={12} />
                  <span>↑ 1 this week</span>
                </div>
              </div>
            </div>

            {/* Resolved */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '18px 20px',
              border: '1.5px solid rgba(249, 168, 212, 0.45)',
              boxShadow: '0 4px 15px rgba(236, 72, 153, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>Resolved</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1E1B4B', lineHeight: 1.1, marginTop: '2px' }}>{resolvedCount}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '6px' }}>
                  <TrendingUp size={12} />
                  <span>↑ 3 this week</span>
                </div>
              </div>
            </div>

            {/* Critical */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '18px 20px',
              border: '1.5px solid rgba(249, 168, 212, 0.45)',
              boxShadow: '0 4px 15px rgba(236, 72, 153, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F43F5E' }}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>Critical</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1E1B4B', lineHeight: 1.1, marginTop: '2px' }}>{criticalCount}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '6px' }}>
                  <span>↑ 0 this week</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Complaints Table Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1.5px solid rgba(249, 168, 212, 0.5)',
            boxShadow: '0 10px 35px rgba(236, 72, 153, 0.06)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(249, 168, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                Recent Complaints
              </h3>
              <Link
                to="/complaints"
                style={{
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  color: '#EC4899',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{
                    backgroundColor: '#FFF7FB',
                    borderBottom: '1px solid rgba(249, 168, 212, 0.3)',
                    color: '#64748B',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    <th style={{ padding: '12px 20px' }}>ID</th>
                    <th style={{ padding: '12px 14px' }}>Category</th>
                    <th style={{ padding: '12px 14px' }}>Description</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px' }}>Priority</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#94A3B8' }}>
                        No complaints submitted yet.
                      </td>
                    </tr>
                  ) : (
                    myComplaints.map((c, i) => (
                      <tr
                        key={c.id || i}
                        onClick={() => navigate(`/complaints/${c.id}`)}
                        style={{
                          borderBottom: i === myComplaints.length - 1 ? 'none' : '1px solid rgba(249, 168, 212, 0.25)',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease'
                        }}
                        className="table-row-hover"
                      >
                        <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1E1B4B', fontFamily: 'monospace' }}>
                          #{c.id?.slice(-4) || '1024'}
                        </td>
                        <td style={{ padding: '14px 14px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#EC4899', backgroundColor: '#FDF2F8', padding: '2px 8px', borderRadius: '6px' }}>
                            {c.category || 'Wi-Fi'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 14px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1E1B4B', fontWeight: 600 }}>
                          {c.title || c.description || 'Slow internet in hostel'}
                        </td>
                        <td style={{ padding: '14px 14px' }}>
                          {renderStatusBadge(c.status || 'Under Review')}
                        </td>
                        <td style={{ padding: '14px 14px' }}>
                          {renderPriorityBadge(c.priority || 'medium')}
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', color: '#64748B', fontSize: '0.8rem' }}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '08 Sep'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions & Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 1. Quick Actions Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '24px',
            border: '1.5px solid rgba(249, 168, 212, 0.5)',
            boxShadow: '0 10px 35px rgba(236, 72, 153, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 4px 0' }}>
              Quick Actions
            </h3>

            {/* Raise Complaint Primary Button */}
            <button
              onClick={() => navigate('/complaints/new')}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.9rem',
                fontWeight: 800,
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 6px 20px rgba(236, 72, 153, 0.35)',
                gap: '8px'
              }}
            >
              <PlusCircle size={17} />
              <span>Raise Complaint</span>
            </button>

            {/* Track Status Secondary Button */}
            <button
              onClick={() => navigate('/complaints')}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '11px',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-full)',
                gap: '8px'
              }}
            >
              <Compass size={16} />
              <span>Track Status</span>
            </button>

            {/* Browse Categories Secondary Button */}
            <button
              onClick={() => navigate('/departments')}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '11px',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-full)',
                gap: '8px'
              }}
            >
              <Grid size={16} />
              <span>Browse Categories</span>
            </button>
          </div>

          {/* 2. Complaint Categories Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '24px',
            border: '1.5px solid rgba(249, 168, 212, 0.5)',
            boxShadow: '0 10px 35px rgba(236, 72, 153, 0.06)'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 16px 0' }}>
              Complaint Categories
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px'
            }}>
              {categories.map(cat => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => navigate('/complaints/new', { state: { category: cat.id } })}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '14px 8px',
                      backgroundColor: '#FFF7FB',
                      borderRadius: '16px',
                      border: '1px solid rgba(249, 168, 212, 0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    className="hover-card-highlight"
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cat.color,
                      boxShadow: '0 2px 6px rgba(236, 72, 153, 0.08)'
                    }}>
                      <IconComponent size={18} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E1B4B' }}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Encouragement Banner */}
          <div style={{
            backgroundColor: '#FDF2F8',
            borderRadius: '20px',
            padding: '16px 20px',
            border: '1.5px solid rgba(249, 168, 212, 0.6)',
            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            textAlign: 'center'
          }}>
            <Heart size={16} fill="#EC4899" color="#EC4899" />
            <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#EC4899' }}>
              Your feedback helps us grow!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
