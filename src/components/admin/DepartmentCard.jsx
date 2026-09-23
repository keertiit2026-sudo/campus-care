import React from 'react';
import { Shield, MapPin, Clock, Users, ArrowRight, UserPlus, AlertCircle } from 'lucide-react';

/**
 * DepartmentCard Component (Grid View)
 * Linear / Stripe dashboard style equal-height card with avatar stack
 */
export const DepartmentCard = ({
  department,
  staffList = [],
  complaints = [],
  isAdmin = true,
  onOpenDrawer,
  onAddStaff
}) => {
  // Only active staff inside this department
  const deptStaff = staffList.filter(
    s => s.departmentId === department.id || s.department === department.name
  );

  // Open complaints assigned to this department
  const activeInDept = complaints.filter(
    c => c.assignedDepartment === department.id && c.status !== 'Resolved' && c.status !== 'Closed'
  ).length;

  // Department code badge accent colors
  const getDeptColor = (code) => {
    switch (code?.toUpperCase()) {
      case 'ITS': return '#6366f1'; // Indigo
      case 'ELEC': return '#3b82f6'; // Blue
      case 'CIVIL': return '#06b6d4'; // Cyan
      case 'HOSTEL': return '#8b5cf6'; // Purple
      case 'SAN': return '#10b981'; // Emerald
      case 'TRANS': return '#f59e0b'; // Amber
      default: return '#6366f1';
    }
  };

  const deptAccent = getDeptColor(department.code);
  const visibleAvatars = deptStaff.slice(0, 3);
  const extraCount = deptStaff.length - visibleAvatars.length;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        padding: '20px 22px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        minHeight: '230px',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'pointer'
      }}
      className="cc-department-card"
      onClick={() => onOpenDrawer(department)}
    >
      {/* 1. Header: Department Code Badge + Name + Open Tickets Pill */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 800,
                backgroundColor: deptAccent,
                color: '#ffffff',
                padding: '3px 8px',
                borderRadius: '6px',
                letterSpacing: '0.03em',
                flexShrink: 0
              }}
            >
              {department.code}
            </span>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={department.name}
            >
              {department.name}
            </h3>
          </div>

          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: activeInDept > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.1)',
              color: activeInDept > 0 ? '#f59e0b' : '#10b981',
              border: `1px solid ${activeInDept > 0 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {activeInDept} Open Ticket{activeInDept === 1 ? '' : 's'}
          </span>
        </div>

        {/* 2. Compact Meta Row: Lead, Location, SLA */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            padding: '10px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <Shield size={13} color="var(--primary-400)" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Lead:</strong> {department.head || 'Unassigned'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <MapPin size={13} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }} title={department.location}>
              {department.location || 'Campus Center'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={13} color="#f59e0b" style={{ flexShrink: 0 }} />
            <span>
              <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>SLA:</strong> {department.slaHours || 24}h target
            </span>
          </div>
        </div>
      </div>

      {/* 3. Staff Section: Avatar Stack & View Button */}
      <div
        style={{
          paddingTop: '12px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        {/* Left: Avatar Stack with Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {deptStaff.length === 0 ? (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No staff assigned
            </span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {/* Stacked Avatars */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {visibleAvatars.map((st, index) => (
                  <img
                    key={st.id}
                    src={st.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(st.name)}`}
                    alt={st.name}
                    title={`${st.name} (${st.roleTitle || 'Staff'})`}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--bg-card)',
                      marginLeft: index > 0 ? '-10px' : 0,
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                ))}
              </div>

              {/* Extra count badge */}
              {extraCount > 0 && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: 'var(--text-secondary)',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1.5px solid var(--border-color)',
                    padding: '3px 6px',
                    borderRadius: 'var(--radius-full)',
                    marginLeft: '-6px',
                    zIndex: 4
                  }}
                >
                  +{extraCount}
                </span>
              )}

              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginLeft: '10px' }}>
                {deptStaff.length} {deptStaff.length === 1 ? 'Staff' : 'Staff'}
              </span>
            </div>
          )}
        </div>

        {/* Right: Quick Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isAdmin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddStaff(department.id);
              }}
              className="btn btn-ghost btn-xs"
              style={{
                color: 'var(--primary-400)',
                padding: '5px 8px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                gap: '4px'
              }}
              title={`Add new staff to ${department.name}`}
            >
              <UserPlus size={13} />
              <span>Add</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDrawer(department);
            }}
            className="btn btn-secondary btn-xs"
            style={{
              gap: '4px',
              padding: '5px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '8px'
            }}
          >
            <span>View</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
