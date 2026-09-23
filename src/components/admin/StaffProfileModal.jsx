import React from 'react';
import { Modal } from '../common/Modal';
import { 
  User, Mail, Phone, Building, Clock, CheckCircle2, 
  AlertCircle, ArrowRightLeft, Edit3, UserX, UserCheck, Calendar, Shield
} from 'lucide-react';

export const StaffProfileModal = ({
  isOpen,
  onClose,
  staff,
  onEditStaff,
  onReplaceStaff,
  onDeactivateStaff,
  onReactivateStaff,
  isAdmin = false
}) => {
  if (!isOpen || !staff) return null;

  const isActive = (staff.status || 'active') === 'active';
  const openCount = staff.activeTickets ?? 0;
  const resolvedCount = staff.resolvedTickets ?? 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return '01/08/2025';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="540px"
      title="Staff Profile"
      subtitle="Comprehensive campus faculty and technician record"
      icon={User}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Profile Card Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px',
          backgroundColor: 'var(--bg-tertiary, rgba(255,255,255,0.03))',
          borderRadius: '16px',
          border: '1px solid var(--border-color, rgba(255,255,255,0.08))'
        }}>
          <img
            src={staff.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(staff.name)}`}
            alt={staff.name}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--primary-400)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {staff.name}
              </h2>
              {isActive ? (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  Active
                </span>
              ) : (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(100, 116, 139, 0.2)',
                  color: '#94a3b8',
                  border: '1px solid rgba(100, 116, 139, 0.3)'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b' }} />
                  Inactive (Left Organization)
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>
              {staff.roleTitle || staff.role || 'Staff Technician'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--primary-400)', marginTop: '2px' }}>
              {staff.department || 'Campus Department'}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {/* Email */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={13} color="var(--primary-400)" /> Email Address
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
              {staff.email || 'N/A'}
            </span>
          </div>

          {/* Phone */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={13} color="var(--accent-cyan)" /> Contact Phone
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {staff.phone || 'N/A'}
            </span>
          </div>

          {/* Assigned Open Tickets */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: openCount > 0 ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)',
            borderRadius: '12px',
            border: openCount > 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.72rem', color: openCount > 0 ? '#f59e0b' : 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={13} color={openCount > 0 ? '#f59e0b' : 'var(--text-muted)'} /> Assigned Open Tickets
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: openCount > 0 ? '#f59e0b' : 'var(--text-primary)' }}>
              {openCount}
            </span>
          </div>

          {/* Resolved Tickets */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} color="#10b981" /> Resolved Tickets
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
              {resolvedCount}
            </span>
          </div>

          {/* SLA Turnaround */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} color="var(--primary-400)" /> Current SLA Target
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {staff.slaHours || 24} Hours
            </span>
          </div>

          {/* Joined Date */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={13} color="var(--accent-cyan)" /> Date Joined
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {formatDate(staff.joinedAt || staff.createdAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)',
          flexWrap: 'wrap'
        }}>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onEditStaff) onEditStaff(staff);
              }}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <Edit3 size={14} />
              <span>Edit Staff</span>
            </button>
          )}

          {isAdmin && isActive && (
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onReplaceStaff) onReplaceStaff(staff);
              }}
              className="btn btn-primary btn-sm"
              style={{
                gap: '6px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderColor: '#d97706',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
              }}
            >
              <ArrowRightLeft size={14} />
              <span>Replace Staff</span>
            </button>
          )}

          {isAdmin && isActive && (
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onDeactivateStaff) onDeactivateStaff(staff);
              }}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            >
              <UserX size={14} />
              <span>Deactivate</span>
            </button>
          )}

          {isAdmin && !isActive && (
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onReactivateStaff) onReactivateStaff(staff);
              }}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px', background: 'linear-gradient(135deg, #10b981, #059669)', borderColor: '#059669' }}
            >
              <UserCheck size={14} />
              <span>Reactivate Staff</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
