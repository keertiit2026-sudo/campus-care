import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { CATEGORIES, STATUSES, PRIORITIES } from '../../data/categories';
import { DEPARTMENTS } from '../../data/departments';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../common/Badge';
import { formatLocationString } from '../../utils/intelligenceEngine';
import { 
  Shield, AlertTriangle, CheckCircle2, Clock, 
  BarChart3, Users, Building, ArrowUpRight, Edit3, Eye, Download, Sparkles
} from 'lucide-react';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { complaints = [], stats = {}, openModal } = useApp();

  const totalCount = stats?.total || 0;
  const resolvedCount = stats?.resolved || 0;
  const closedCount = stats?.closed || 0;
  const unresolvedCount = totalCount - resolvedCount - closedCount;
  const resolutionRate = totalCount > 0 ? Math.round(((resolvedCount + closedCount) / totalCount) * 100) : 100;
  const urgentCount = (complaints || []).filter(c => c && c.priority === 'urgent' && c.status !== 'Resolved' && c.status !== 'Closed').length;

  // Compute category counts
  const categoryStats = CATEGORIES.map(cat => ({
    ...cat,
    count: (complaints || []).filter(c => c && c.category === cat.id).length
  })).sort((a, b) => b.count - a.count);

  // Compute status counts
  const statusCounts = STATUSES.map(s => ({
    ...s,
    count: (complaints || []).filter(c => c && c.status && c.status.toLowerCase() === s.id.toLowerCase()).length
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Admin Executive Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#f59e0b',
            marginBottom: '8px'
          }}>
            <Shield size={13} />
            <span>Campus Operations & Triage Command Center</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            Platform Administrative Hub
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Centralized monitoring of campus maintenance, departmental dispatch, and student SLA metrics
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/admin/intelligence')}
            className="btn btn-primary"
            style={{ gap: '6px', background: 'var(--primary-gradient)', border: 'none' }}
          >
            <Sparkles size={16} />
            <span>Intelligence AI</span>
          </button>
          <button
            onClick={() => navigate('/complaints')}
            className="btn btn-secondary"
            style={{ gap: '6px' }}
          >
            <BarChart3 size={16} />
            <span>Triage Queue ({unresolvedCount})</span>
          </button>
          <button
            onClick={() => openModal('export')}
            className="btn btn-secondary"
            style={{ gap: '6px' }}
          >
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Urgent Warning Banner */}
      {urgentCount > 0 && (
        <div style={{
          padding: '16px 20px',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {urgentCount} Critical / Urgent Issue{urgentCount > 1 ? 's' : ''} Require Immediate Attention
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Lab Wi-Fi outages or hostel leaks requiring swift dispatch to prevent safety or academic disruption.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/complaints')}
            className="btn btn-danger btn-sm"
            style={{ gap: '6px' }}
          >
            <span>Review Urgent Tickets</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      )}

      {/* KPI Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px'
      }}>
        <StatCard
          title="Total Registered Complaints"
          value={stats.total}
          subtitle="All recorded tickets"
          icon={BarChart3}
          color="#6366f1"
          onClick={() => navigate('/complaints')}
        />
        <StatCard
          title="Active Backlog"
          value={unresolvedCount}
          subtitle="Submitted, Review, In Progress"
          icon={Clock}
          color="#f59e0b"
          onClick={() => navigate('/complaints')}
        />
        <StatCard
          title="Resolution Rate"
          value={`${resolutionRate}%`}
          subtitle="Successfully closed tickets"
          icon={CheckCircle2}
          color="#10b981"
          onClick={() => navigate('/complaints')}
        />
        <StatCard
          title="Average Turnaround Time"
          value="14.8 hrs"
          subtitle="Average SLA resolution pace"
          icon={Building}
          color="#06b6d4"
          onClick={() => navigate('/analytics')}
        />
      </div>

      {/* Analytics Visual Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {/* Status Distribution Visual */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>
            Complaint Status Pipeline
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {statusCounts.map(s => {
              const pct = stats.total > 0 ? Math.round((s.count / stats.total) * 100) : 0;
              return (
                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{s.count} tickets ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: s.color,
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Category Distribution Visual */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>
            Issues by Campus Category
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categoryStats.slice(0, 5).map(cat => {
              const pct = stats.total > 0 ? Math.round((cat.count / stats.total) * 100) : 0;
              return (
                <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                    <span style={{ fontWeight: 600, color: cat.color }}>{cat.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{cat.count} issues</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: cat.color,
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actionable Triage Master Table */}
      <div className="glass-panel" style={{ padding: '22px', borderRadius: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Active Complaint Dispatch & Triage</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Directly assign departments, update technician assignments, or close resolved tickets
            </p>
          </div>
          <button
            onClick={() => navigate('/complaints')}
            className="btn btn-secondary btn-sm"
          >
            View All ({complaints.length})
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                <th style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>ID</th>
                <th style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>Title & Location</th>
                <th style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>Category</th>
                <th style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>Priority</th>
                <th style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>Assigned Dept</th>
                <th style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>Triage Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.slice(0, 6).map(c => {
                const dept = DEPARTMENTS.find(d => d.id === c.assignedDepartment);
                return (
                  <tr
                    key={c.id}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--primary-400)' }}>
                      #{c.id}
                    </td>
                    <td style={{ padding: '12px 14px', maxWidth: '260px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        📍 {formatLocationString(c.location)}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <CategoryBadge categoryId={c.category} size="sm" />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      {dept ? dept.code : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Pending</span>}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => navigate(`/admin/triage/${c.id}`)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                          title="Triage & Assign"
                        >
                          <Edit3 size={13} />
                          <span>Triage</span>
                        </button>
                        <button
                          onClick={() => navigate(`/complaints/${c.id}`)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                          title="View Details"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
