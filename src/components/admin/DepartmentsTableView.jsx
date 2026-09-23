import React from 'react';
import { Shield, MapPin, Clock, ArrowRight, UserPlus } from 'lucide-react';

/**
 * DepartmentsTableView Component
 * Stripe / Linear style clean table view for 20+ departments
 */
export const DepartmentsTableView = ({
  departments = [],
  staffList = [],
  complaints = [],
  isAdmin = true,
  onOpenDrawer,
  onAddStaff
}) => {
  const getDeptColor = (code) => {
    switch (code?.toUpperCase()) {
      case 'ITS': return '#6366f1';
      case 'ELEC': return '#3b82f6';
      case 'CIVIL': return '#06b6d4';
      case 'HOSTEL': return '#8b5cf6';
      case 'SAN': return '#10b981';
      case 'TRANS': return '#f59e0b';
      default: return '#6366f1';
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)'
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontSize: '0.725rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <th style={{ padding: '14px 20px' }}>Department</th>
              <th style={{ padding: '14px 16px' }}>Lead Staff</th>
              <th style={{ padding: '14px 16px' }}>Location</th>
              <th style={{ padding: '14px 16px' }}>SLA Target</th>
              <th style={{ padding: '14px 16px' }}>Active Staff</th>
              <th style={{ padding: '14px 16px' }}>Open Tickets</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, idx) => {
              const deptStaff = staffList.filter(
                s => s.departmentId === dept.id || s.department === dept.name
              );
              const activeInDept = complaints.filter(
                c => c.assignedDepartment === dept.id && c.status !== 'Resolved' && c.status !== 'Closed'
              ).length;
              const deptAccent = getDeptColor(dept.code);
              const visibleAvatars = deptStaff.slice(0, 3);
              const extraCount = deptStaff.length - visibleAvatars.length;

              return (
                <tr
                  key={dept.id}
                  style={{
                    borderBottom: idx === departments.length - 1 ? 'none' : '1px solid var(--border-color)',
                    transition: 'background-color 0.15s ease',
                    cursor: 'pointer'
                  }}
                  className="table-row-hover"
                  onClick={() => onOpenDrawer(dept)}
                >
                  {/* Department Name & Code */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 800,
                          backgroundColor: deptAccent,
                          color: '#ffffff',
                          padding: '2px 7px',
                          borderRadius: '5px',
                          letterSpacing: '0.02em',
                          flexShrink: 0
                        }}
                      >
                        {dept.code}
                      </span>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {dept.name}
                      </span>
                    </div>
                  </td>

                  {/* Lead */}
                  <td style={{ padding: '16px 16px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={14} color="var(--primary-400)" />
                      <span>{dept.head || 'Unassigned'}</span>
                    </div>
                  </td>

                  {/* Location */}
                  <td style={{ padding: '16px 16px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--accent-cyan)" />
                      <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={dept.location}>
                        {dept.location || 'Campus Center'}
                      </span>
                    </div>
                  </td>

                  {/* SLA */}
                  <td style={{ padding: '16px 16px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="#f59e0b" />
                      <span>{dept.slaHours || 24} Hours</span>
                    </div>
                  </td>

                  {/* Staff Stack */}
                  <td style={{ padding: '16px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {visibleAvatars.map((st, i) => (
                        <img
                          key={st.id}
                          src={st.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(st.name)}`}
                          alt={st.name}
                          title={st.name}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid var(--bg-card)',
                            marginLeft: i > 0 ? '-8px' : 0,
                            backgroundColor: 'rgba(99, 102, 241, 0.1)'
                          }}
                        />
                      ))}
                      {extraCount > 0 && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: 'var(--text-secondary)',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid var(--border-color)',
                            padding: '2px 5px',
                            borderRadius: 'var(--radius-full)',
                            marginLeft: '-6px'
                          }}
                        >
                          +{extraCount}
                        </span>
                      )}
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginLeft: '8px' }}>
                        {deptStaff.length}
                      </span>
                    </div>
                  </td>

                  {/* Open Tickets */}
                  <td style={{ padding: '16px 16px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: activeInDept > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.12)',
                        color: activeInDept > 0 ? '#f59e0b' : '#10b981',
                        border: `1px solid ${activeInDept > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {activeInDept} Open
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddStaff(dept.id);
                          }}
                          className="btn btn-ghost btn-xs"
                          style={{ color: 'var(--primary-400)', padding: '4px 8px' }}
                          title={`Add staff to ${dept.name}`}
                        >
                          <UserPlus size={14} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDrawer(dept);
                        }}
                        className="btn btn-secondary btn-xs"
                        style={{ gap: '4px', padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        <span>View</span>
                        <ArrowRight size={13} />
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
  );
};
