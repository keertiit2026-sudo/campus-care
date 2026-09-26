import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { UserX, AlertCircle, ArrowRightLeft, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../common/Badge';

export const StaffDeactivateModal = ({
  isOpen,
  onClose,
  staff,
  complaints = [],
  onOpenReplaceModal,
  onConfirmDeactivate
}) => {
  const [targetStatus, setTargetStatus] = useState('left_college'); // 'left_college' | 'inactive'
  const [reason, setReason] = useState('Left the college');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !staff) return null;

  // Find open complaints assigned to this staff member
  const openComplaints = complaints.filter(
    c => c.assignedStaff === staff.id && c.status !== 'Resolved' && c.status !== 'Closed'
  );

  const hasOpenComplaints = openComplaints.length > 0;

  const handleDeactivate = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await onConfirmDeactivate(staff.id, {
        status: targetStatus,
        reason: reason.trim() || (targetStatus === 'left_college' ? 'Left college' : 'Deactivated')
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update staff status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      maxWidth="540px"
      title={hasOpenComplaints ? 'Active Complaints Require Transfer First' : 'Update Staff Status'}
      subtitle={`Staff member: ${staff.name} (${staff.department})`}
      icon={hasOpenComplaints ? ShieldAlert : UserX}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#ef4444',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {hasOpenComplaints ? (
          // Case 1: Has open complaints -> Guard Block
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '14px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              color: '#ef4444',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Action Required:</strong> <em>{staff.name}</em> currently has <strong>{openComplaints.length}</strong> active open complaint ticket(s). Please transfer these complaints to another active staff member using the Replace Staff workflow before offboarding.
              </div>
            </div>

            {/* List of open complaints causing the block */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Open Complaints Requiring Reassignment:
              </div>
              <div style={{
                maxHeight: '180px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {openComplaints.map(c => (
                  <div
                    key={c.id}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        #{c.id} — {c.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {typeof c.location === 'object' ? (c.location.building || 'Campus') : (c.location || 'Campus Location')}
                      </div>
                    </div>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenReplaceModal) onOpenReplaceModal(staff);
                }}
                className="btn btn-primary"
                style={{
                  gap: '6px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  borderColor: '#d97706',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                }}
              >
                <ArrowRightLeft size={16} />
                <span>Replace Staff & Transfer Tickets</span>
              </button>
            </div>
          </div>
        ) : (
          // Case 2: 0 Open complaints -> Safe to deactivate or mark Left College
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                Select Target Status
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: targetStatus === 'left_college' ? '2px solid #ef4444' : '1px solid var(--border-color)',
                  backgroundColor: targetStatus === 'left_college' ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="deactivateTargetStatus"
                    value="left_college"
                    checked={targetStatus === 'left_college'}
                    onChange={() => setTargetStatus('left_college')}
                  />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      🔴 Left College
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Quits / departs the college
                    </div>
                  </div>
                </label>

                <label style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: targetStatus === 'inactive' ? '2px solid #94a3b8' : '1px solid var(--border-color)',
                  backgroundColor: targetStatus === 'inactive' ? 'rgba(148, 163, 184, 0.08)' : 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="deactivateTargetStatus"
                    value="inactive"
                    checked={targetStatus === 'inactive'}
                    onChange={() => setTargetStatus('inactive')}
                  />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ⚪ Inactive
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Temporarily paused / leave
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                Reason / Note
              </label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Relocated, end of contract, resignation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}>
              <strong>Data Protection Notice:</strong> {staff.name}'s profile will not be deleted. All past resolved complaints will permanently retain {staff.name}'s name in historical records.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{
                  gap: '6px',
                  background: targetStatus === 'left_college' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #64748b, #475569)',
                  borderColor: targetStatus === 'left_college' ? '#dc2626' : '#475569',
                  boxShadow: targetStatus === 'left_college' ? '0 4px 15px rgba(239, 68, 68, 0.3)' : '0 4px 15px rgba(100, 116, 139, 0.3)'
                }}
                id="btn-confirm-deactivate"
              >
                <UserX size={16} />
                <span>{isSubmitting ? 'Saving...' : `Confirm ${targetStatus === 'left_college' ? 'Left College' : 'Inactive'}`}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
