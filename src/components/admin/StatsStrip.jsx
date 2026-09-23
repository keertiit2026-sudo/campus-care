import React from 'react';
import { Building2, Users, AlertCircle, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

/**
 * StatsStrip Component
 * 4 summary stat tiles: Total Departments, Total Active Staff, Open Tickets, Avg SLA
 */
export const StatsStrip = ({ departments = [], activeStaffList = [], complaints = [] }) => {
  // Compute open tickets count
  const openComplaintsCount = complaints.filter(
    c => c.status !== 'Resolved' && c.status !== 'Closed'
  ).length;

  // Compute average SLA across departments
  const avgSla = departments.length > 0
    ? (departments.reduce((acc, d) => acc + (Number(d.slaHours) || 24), 0) / departments.length).toFixed(0)
    : 24;

  const stats = [
    {
      label: 'Operational Departments',
      value: departments.length,
      unit: 'Units',
      icon: Building2,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.1)',
      border: 'rgba(99, 102, 241, 0.2)'
    },
    {
      label: 'Active Staff Roster',
      value: activeStaffList.length,
      unit: 'Technicians',
      icon: Users,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.2)'
    },
    {
      label: 'Open Campus Tickets',
      value: openComplaintsCount,
      unit: openComplaintsCount === 1 ? 'Pending' : 'Pending',
      icon: AlertCircle,
      color: openComplaintsCount > 0 ? '#f59e0b' : '#10b981',
      bg: openComplaintsCount > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
      border: openComplaintsCount > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'
    },
    {
      label: 'Average SLA Target',
      value: `${avgSla}h`,
      unit: 'Turnaround',
      icon: Clock,
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.1)',
      border: 'rgba(6, 182, 212, 0.2)'
    }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px'
      }}
    >
      {stats.map((st, idx) => {
        const IconComponent = st.icon;
        return (
          <div
            key={idx}
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '14px',
              padding: '16px 18px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              transition: 'transform 0.15s ease, border-color 0.15s ease'
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '4px'
                }}
              >
                {st.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                  {st.value}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {st.unit}
                </span>
              </div>
            </div>

            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: st.bg,
                border: `1px solid ${st.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <IconComponent size={20} color={st.color} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
