import React from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, PRIORITIES, STATUSES } from '../../data/categories';
import { DEPARTMENTS } from '../../data/departments';
import { StatCard } from '../common/StatCard';
import { 
  BarChart3, TrendingUp, CheckCircle2, Clock, 
  Star, AlertTriangle, ShieldCheck, Zap, Download
} from 'lucide-react';

export const AnalyticsView = () => {
  const { complaints = [], stats = {}, openModal } = useApp();

  const ratedComplaints = (complaints || []).filter(c => c && c.rating);
  const avgRating = ratedComplaints.length > 0
    ? (ratedComplaints.reduce((acc, c) => acc + (c.rating || 5), 0) / ratedComplaints.length).toFixed(1)
    : '5.0';

  const totalComplaints = stats?.total || 0;
  const resolvedComplaints = stats?.resolved || 0;
  const closedComplaints = stats?.closed || 0;
  const resolutionRate = totalComplaints > 0
    ? Math.round(((resolvedComplaints + closedComplaints) / totalComplaints) * 100)
    : 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--accent-cyan)',
            marginBottom: '8px'
          }}>
            <BarChart3 size={13} />
            <span>Service Level Agreement (SLA) & Performance Analytics</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            Campus Maintenance Analytics
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Real-time telemetry on student grievance resolution rate, average response speed, and satisfaction metrics
          </p>
        </div>

        <button
          onClick={() => openModal('export')}
          className="btn btn-primary"
          style={{ gap: '6px' }}
        >
          <Download size={16} />
          <span>Export Analytics Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <StatCard
          title="Overall Resolution Rate"
          value={`${resolutionRate}%`}
          subtitle="94% Target SLA met"
          icon={TrendingUp}
          color="#10b981"
          trend={+4.2}
        />
        <StatCard
          title="Avg Resolution Turnaround"
          value="14.8 hrs"
          subtitle="From submission to resolved"
          icon={Clock}
          color="#06b6d4"
          trend={-12.5}
        />
        <StatCard
          title="Student Satisfaction"
          value={`${avgRating} ★`}
          subtitle={`Based on ${ratedComplaints.length} verified ratings`}
          icon={Star}
          color="#f59e0b"
          trend={+0.3}
        />
        <StatCard
          title="Campus First-Time Fix Rate"
          value="88.5%"
          subtitle="Resolved without reopen"
          icon={ShieldCheck}
          color="#6366f1"
          trend={+2.1}
        />
      </div>

      {/* Category Breakdown & Priority Distribution */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '20px'
      }}>
        {/* Category breakdown bar charts */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '18px' }}>
            Complaints by Category Volume
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {CATEGORIES.map(cat => {
              const count = complaints.filter(c => c.category === cat.id).length;
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: cat.color,
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department SLA & Workload Distribution */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '18px' }}>
            Department Turnaround & SLA Efficiency
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {DEPARTMENTS.slice(0, 6).map(dept => {
              const count = complaints.filter(c => c.assignedDepartment === dept.id).length;
              return (
                <div key={dept.id} style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {dept.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Target SLA: {dept.slaHours}h | Staff: {dept.staffCount}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-400)' }}>
                      {count} Assigned
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                      98% Compliance
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
