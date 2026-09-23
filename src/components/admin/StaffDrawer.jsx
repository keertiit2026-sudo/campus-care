import React, { useState, useEffect } from 'react';
import { 
  X, UserPlus, Shield, MapPin, Clock, AlertTriangle, 
  ArrowRightLeft, FileText, Edit3, UserX, Tag, CheckCircle2,
  MoreVertical, ExternalLink
} from 'lucide-react';
import { StaffActionMenu } from './StaffActionMenu';

/**
 * StaffDrawer Component
 * Slide-out right-hand sheet listing department staff in clean, Linear-style list
 */
export const StaffDrawer = ({
  isOpen,
  onClose,
  department,
  staffList = [],
  allStaffList = [],
  complaints = [],
  isAdmin = true,
  onAddStaff,
  onReplaceStaff,
  onEditStaff,
  onDeactivateStaff,
  onViewComplaints
}) => {
  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !department) return null;

  // Filter staff belonging to this department
  const deptStaff = staffList.filter(
    s => s.departmentId === department.id || s.department === department.name
  );

  // Duplicate detection across the entire organization
  const nameCounts = {};
  const idCounts = {};
  allStaffList.forEach(s => {
    if (s.name) {
      const k = s.name.trim().toLowerCase();
      nameCounts[k] = (nameCounts[k] || 0) + 1;
    }
    if (s.employeeId) {
      const k = s.employeeId.trim().toLowerCase();
      idCounts[k] = (idCounts[k] || 0) + 1;
    }
  });

  const isDuplicate = (st) => {
    const hasDuplicateName = st.name && nameCounts[st.name.trim().toLowerCase()] > 1;
    const hasDuplicateId = st.employeeId && idCounts[st.employeeId.trim().toLowerCase()] > 1;
    return hasDuplicateName || hasDuplicateId;
  };

  const activeInDept = complaints.filter(
    c => c.assignedDepartment === department.id && c.status !== 'Resolved' && c.status !== 'Closed'
  ).length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(4px)',
        transition: 'opacity 0.2s ease'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          backgroundColor: 'var(--bg-glass-solid, #0f172a)',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.4)',
          overflowY: 'auto',
          animation: 'drawerSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            backgroundColor: 'var(--bg-secondary)'
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  backgroundColor: 'var(--primary-500)',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  letterSpacing: '0.03em'
                }}
              >
                {department.code}
              </span>
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: activeInDept > 0 ? '#f59e0b' : '#10b981',
                  backgroundColor: activeInDept > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${activeInDept > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                }}
              >
                {activeInDept} Open Ticket{activeInDept === 1 ? '' : 's'}
              </span>
            </div>

            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: 0,
                lineHeight: 1.25
              }}
            >
              {department.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-xs"
            style={{
              padding: '6px',
              borderRadius: '8px',
              color: 'var(--text-muted)'
            }}
            title="Close drawer (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Department Info Bar */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderBottom: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={13} color="var(--primary-400)" />
            <span><strong>Lead:</strong> {department.head || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={13} color="var(--accent-cyan)" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={department.location}>
              {department.location || 'Campus Center'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={13} color="#f59e0b" />
            <span><strong>SLA:</strong> {department.slaHours || 24}h target</span>
          </div>
        </div>

        {/* Action Header & Staff Count */}
        <div
          style={{
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Department Staff ({deptStaff.length})
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Assigned technicians and maintenance leads
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => onAddStaff(department.id)}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px', fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <UserPlus size={14} />
              <span>Add Staff</span>
            </button>
          )}
        </div>

        {/* Staff Members List */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          {deptStaff.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                border: '1px dashed var(--border-color)',
                borderRadius: '14px',
                color: 'var(--text-muted)',
                backgroundColor: 'rgba(255, 255, 255, 0.01)'
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                No staff yet in this department
              </div>
              <p style={{ fontSize: '0.8rem', margin: 0, marginBottom: '14px' }}>
                Add the first technician to start assigning facility tickets.
              </p>
              {isAdmin && (
                <button
                  onClick={() => onAddStaff(department.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px' }}
                >
                  <UserPlus size={14} />
                  <span>Add First Member</span>
                </button>
              )}
            </div>
          ) : (
            deptStaff.map(st => {
              const staffTickets = complaints.filter(
                c => c.assignedStaff === st.id && c.status !== 'Resolved' && c.status !== 'Closed'
              ).length;

              const duplicate = isDuplicate(st);
              const isActive = (st.status || 'active') === 'active';

              // Clean Employee ID format
              let rawEmpId = st.employeeId || '';
              if (!rawEmpId || rawEmpId.startsWith('usr_staff_')) {
                rawEmpId = `EMP-2024-${st.id ? st.id.slice(-3) : '001'}`;
              }

              return (
                <div
                  key={st.id}
                  style={{
                    padding: '14px 16px',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover-card-highlight"
                >
                  {/* Left: Avatar with green active dot */}
                  <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                    <img
                      src={st.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(st.name)}`}
                      alt={st.name}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1.5px solid var(--border-color)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)'
                      }}
                    />
                    {isActive ? (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '10px',
                          height: '10px',
                          backgroundColor: '#10b981',
                          borderRadius: '50%',
                          border: '2px solid var(--bg-tertiary)'
                        }}
                        title="Active staff member"
                      />
                    ) : (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '10px',
                          height: '10px',
                          backgroundColor: '#94a3b8',
                          borderRadius: '50%',
                          border: '2px solid var(--bg-tertiary)'
                        }}
                        title="Inactive / On leave"
                      />
                    )}
                  </div>

                  {/* Center: Details */}
                  <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {/* Line 1: Name + Status/Warning Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={st.name}
                      >
                        {st.name}
                      </span>

                      {/* Duplicate detection warning badge */}
                      {duplicate && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(245, 158, 11, 0.15)',
                            color: '#f59e0b',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                          title="Multiple records found with this name or employee ID in directory"
                        >
                          <AlertTriangle size={10} />
                          <span>Possible duplicate</span>
                        </span>
                      )}

                      {/* Non-active status pill if applicable */}
                      {!isActive && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(148, 163, 184, 0.15)',
                            color: 'var(--text-muted)',
                            border: '1px solid rgba(148, 163, 184, 0.3)'
                          }}
                        >
                          {st.status === 'left_college' ? 'Left College' : 'Inactive'}
                        </span>
                      )}
                    </div>

                    {/* Line 2: Monospace ID & Role Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--text-secondary)',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          whiteSpace: 'nowrap'
                        }}
                        title={rawEmpId}
                      >
                        {rawEmpId}
                      </span>
                      <span>•</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={st.roleTitle || st.role || 'Technician'}>
                        {st.roleTitle || st.role || 'Technician'}
                      </span>
                    </div>

                    {/* Line 3: Location / Category tags if customized */}
                    {(st.campusZone && st.campusZone !== 'Main Campus' || st.categoryResponsibility && st.categoryResponsibility !== 'general') && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {st.campusZone && st.campusZone !== 'Main Campus' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <MapPin size={11} color="var(--accent-cyan)" />
                            <span>{st.campusZone}</span>
                          </span>
                        )}
                        {st.categoryResponsibility && st.categoryResponsibility !== 'general' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Tag size={11} color="var(--primary-400)" />
                            <span>{st.categoryResponsibility}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Open Tickets Badge + 3-Dot Action Menu */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {staffTickets > 0 && (
                      <button
                        type="button"
                        onClick={() => onViewComplaints && onViewComplaints(st)}
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title={`Click to view ${staffTickets} open complaint(s)`}
                      >
                        ⚡ {staffTickets} ticket{staffTickets === 1 ? '' : 's'}
                      </button>
                    )}

                    {/* 3-Dot Action Menu */}
                    <StaffActionMenu
                      staff={st}
                      isAdmin={isAdmin}
                      onReplaceStaff={onReplaceStaff}
                      onEditStaff={onEditStaff}
                      onDeactivateStaff={onDeactivateStaff}
                      onViewComplaints={onViewComplaints}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
