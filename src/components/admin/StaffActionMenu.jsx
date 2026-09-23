import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, User, Edit3, ArrowRightLeft, UserX, UserCheck, Shield, FileText } from 'lucide-react';

export const StaffActionMenu = ({
  staff,
  onViewProfile,
  onViewComplaints,
  onEditStaff,
  onReplaceStaff,
  onDeactivateStaff,
  onReactivateStaff,
  isAdmin = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const isActive = (staff.status || 'active') === 'active';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (callback) => {
    setIsOpen(false);
    if (callback) callback(staff);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="btn btn-ghost btn-xs"
        style={{
          padding: '4px',
          borderRadius: '8px',
          color: 'var(--text-muted)',
          backgroundColor: isOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
          transition: 'all 0.15s'
        }}
        title="Staff actions"
        id={`btn-staff-menu-${staff.id}`}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 4px)',
            zIndex: 100,
            minWidth: '195px',
            backgroundColor: 'var(--bg-secondary, #1e2235)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            animation: 'fadeIn 0.15s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            padding: '4px 8px 6px',
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '4px'
          }}>
            Staff Actions
          </div>

          {/* View Assigned Complaints */}
          <button
            type="button"
            onClick={() => handleAction(onViewComplaints)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '7px 10px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FileText size={14} color="var(--accent-cyan)" />
            <span>View Complaints</span>
          </button>

          {/* View Profile */}
          <button
            type="button"
            onClick={() => handleAction(onViewProfile)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '7px 10px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <User size={14} color="var(--primary-400)" />
            <span>View Profile</span>
          </button>

          {/* Edit Staff (Admin only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleAction(onEditStaff)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '7px 10px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Edit3 size={14} color="var(--primary-300)" />
              <span>Edit Staff</span>
            </button>
          )}

          {/* Replace Staff (Admin only & only if active) */}
          {isAdmin && isActive && (
            <button
              type="button"
              onClick={() => handleAction(onReplaceStaff)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '7px 10px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: '#f59e0b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ArrowRightLeft size={14} color="#f59e0b" />
              <span>Replace Staff</span>
            </button>
          )}

          {/* Deactivate Staff (Admin only & only if active) */}
          {isAdmin && isActive && (
            <button
              type="button"
              onClick={() => handleAction(onDeactivateStaff)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '7px 10px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: '#ef4444',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <UserX size={14} color="#ef4444" />
              <span>Deactivate / Left College</span>
            </button>
          )}

          {/* Reactivate Staff (Admin only & if inactive / left) */}
          {isAdmin && !isActive && (
            <button
              type="button"
              onClick={() => handleAction(onReactivateStaff)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '7px 10px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: '#10b981',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <UserCheck size={14} color="#10b981" />
              <span>Reactivate Staff</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
