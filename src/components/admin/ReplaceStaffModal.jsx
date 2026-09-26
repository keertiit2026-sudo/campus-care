import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../common/Badge';
import confetti from 'canvas-confetti';
import { 
  ArrowRightLeft, AlertCircle, CheckCircle2, User, 
  Building, Shield, Check, ArrowRight, ArrowLeft,
  FileText, Sparkles, Layers, History, HelpCircle
} from 'lucide-react';

export const ReplaceStaffModal = ({
  isOpen,
  onClose,
  departingStaff,
  allStaff = [],
  complaints = [],
  onConfirmReplacement
}) => {
  const [step, setStep] = useState(1); // 1: Setup & Select, 2: Review Complaints, 3: Confirmation, 4: Success
  const [replacementStaffId, setReplacementStaffId] = useState('');
  const [departureStatus, setDepartureStatus] = useState('left_college'); // 'left_college' | 'inactive'
  const [transferMode, setTransferMode] = useState('all'); // 'all' | 'manual'
  const [selectedComplaintIds, setSelectedComplaintIds] = useState([]);
  const [reason, setReason] = useState('Staff resignation / role transition');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  // Eligible open complaints for departing staff
  const eligibleComplaints = departingStaff
    ? complaints.filter(
        c => c.assignedStaff === departingStaff.id && c.status !== 'Resolved' && c.status !== 'Closed'
      )
    : [];

  // Closed/Resolved complaints that will NOT be transferred
  const closedComplaints = departingStaff
    ? complaints.filter(
        c => c.assignedStaff === departingStaff.id && (c.status === 'Resolved' || c.status === 'Closed')
      )
    : [];

  // Active replacement options: must be active, not the departing staff
  const activeStaffOptions = allStaff.filter(
    s => s.id !== departingStaff?.id && (s.status || 'active') === 'active'
  );

  // Prioritize same-department staff
  const sameDeptStaff = activeStaffOptions.filter(
    s => s.departmentId === departingStaff?.departmentId
  );
  const crossDeptStaff = activeStaffOptions.filter(
    s => s.departmentId !== departingStaff?.departmentId
  );

  useEffect(() => {
    if (isOpen && departingStaff) {
      setStep(1);
      setError('');
      setSuccessResult(null);
      setDepartureStatus('left_college');
      setTransferMode('all');
      setReason('Staff resignation / role transition');

      // Default to first same-department active staff, or any active staff
      if (sameDeptStaff.length > 0) {
        setReplacementStaffId(sameDeptStaff[0].id);
      } else if (activeStaffOptions.length > 0) {
        setReplacementStaffId(activeStaffOptions[0].id);
      } else {
        setReplacementStaffId('');
      }

      // Pre-select all eligible complaint IDs
      setSelectedComplaintIds(eligibleComplaints.map(c => c.id));
    }
  }, [isOpen, departingStaff]);

  if (!isOpen || !departingStaff) return null;

  const replacementStaff = allStaff.find(s => s.id === replacementStaffId);
  const isCrossDept = replacementStaff && replacementStaff.departmentId !== departingStaff.departmentId;

  // Selected complaints count
  const complaintsToTransfer = transferMode === 'all'
    ? eligibleComplaints
    : eligibleComplaints.filter(c => selectedComplaintIds.includes(c.id));

  const handleToggleComplaint = (id) => {
    setSelectedComplaintIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedComplaintIds(eligibleComplaints.map(c => c.id));
  };

  const handleDeselectAll = () => {
    setSelectedComplaintIds([]);
  };

  const handleNextToReview = () => {
    setError('');
    if (!replacementStaffId) {
      setError('Please select an active replacement technician or staff member.');
      return;
    }
    setStep(2);
  };

  const handleNextToConfirm = () => {
    setError('');
    if (transferMode === 'manual' && selectedComplaintIds.length === 0 && eligibleComplaints.length > 0) {
      setError('Please select at least one complaint to transfer, or choose "Transfer All Open Complaints".');
      return;
    }
    setStep(3);
  };

  const handleExecuteReplacement = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const payload = {
        oldStaffId: departingStaff.id,
        newStaffId: replacementStaffId,
        complaintIds: transferMode === 'all' ? eligibleComplaints.map(c => c.id) : selectedComplaintIds,
        reason: reason.trim() || 'Staff replacement',
        departureStatus
      };

      const result = await onConfirmReplacement(payload);
      setSuccessResult(result);
      setStep(4);

      try {
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.55 } });
      } catch (e) {}
    } catch (err) {
      setError(err.message || 'Replacement could not be completed. No changes were made.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      maxWidth="680px"
      title="Replace Staff Member"
      subtitle="Complete offboarding, complaint ticket reassignment & audit workflow"
      icon={ArrowRightLeft}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Step Indicator Header (Steps 1 to 3) */}
        {step < 4 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            {[
              { num: 1, label: 'Select Replacement' },
              { num: 2, label: 'Complaints to Transfer' },
              { num: 3, label: 'Confirmation' }
            ].map((st, idx) => (
              <div key={st.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: step === st.num ? 'var(--primary-500)' : step > st.num ? '#10b981' : 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {step > st.num ? <Check size={13} /> : st.num}
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: step === st.num ? 700 : 500,
                  color: step === st.num ? 'var(--text-primary)' : 'var(--text-muted)'
                }}>
                  {st.label}
                </span>
                {idx < 2 && (
                  <div style={{ width: '20px', height: '1px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error Notification */}
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

        {/* ========================================================================= */}
        {/* STEP 1: CURRENT STAFF & SELECT REPLACEMENT */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Step 1 Current Staff Card */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.04em' }}>
                Step 1: Current Staff Member (Departing)
              </div>
              <div style={{
                padding: '16px',
                borderRadius: '14px',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <img
                  src={departingStaff.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(departingStaff.name)}`}
                  alt={departingStaff.name}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {departingStaff.name}
                    </span>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      Departing
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {departingStaff.roleTitle || departingStaff.role || 'Staff'} • {departingStaff.department}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700, marginTop: '4px' }}>
                    ⚡ {eligibleComplaints.length} Open Complaint{eligibleComplaints.length === 1 ? '' : 's'} to be transferred
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 Replacement Selection */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.04em' }}>
                Step 2: Select Replacement Staff Member
              </div>

              {activeStaffOptions.length === 0 ? (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '0.85rem'
                }}>
                  ⚠️ No other active staff members found in the roster. Please onboard a new staff member before offboarding {departingStaff.name}.
                </div>
              ) : (
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Select Active Replacement Staff *</label>
                  <select
                    value={replacementStaffId}
                    onChange={(e) => setReplacementStaffId(e.target.value)}
                    className="input-control select-control"
                    style={{ height: '46px', fontSize: '0.9rem' }}
                    id="select-replacement-staff"
                  >
                    <option value="">-- Choose active technician / faculty --</option>
                    {sameDeptStaff.length > 0 && (
                      <optgroup label={`Eligible ${departingStaff.department} Staff`}>
                        {sameDeptStaff.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} — {s.roleTitle || s.role || 'Technician'} ({s.activeTickets || 0} active tickets)
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {crossDeptStaff.length > 0 && (
                      <optgroup label="Other Eligible Active Campus Staff">
                        {crossDeptStaff.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} — {s.department} ({s.roleTitle || s.role || 'Staff'})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Only active staff members are shown. Inactive or former staff cannot receive ticket assignments.
                  </span>
                </div>
              )}

              {/* Cross-department warning banner if selected */}
              {isCrossDept && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '10px',
                  color: '#f59e0b',
                  fontSize: '0.825rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Cross-Department Transfer:</strong> {replacementStaff.name} belongs to <em>{replacementStaff.department}</em>. Transferred complaints will re-route accordingly.
                  </span>
                </div>
              )}
            </div>

            {/* Departing Staff Final Status */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Update Departing Staff Status To</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: departureStatus === 'left_college' ? '2px solid #ef4444' : '1px solid var(--border-color)',
                  backgroundColor: departureStatus === 'left_college' ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="departureStatus"
                    value="left_college"
                    checked={departureStatus === 'left_college'}
                    onChange={() => setDepartureStatus('left_college')}
                  />
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      🔴 Left College
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Resigned / left the institution
                    </div>
                  </div>
                </label>

                <label style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: departureStatus === 'inactive' ? '2px solid #94a3b8' : '1px solid var(--border-color)',
                  backgroundColor: departureStatus === 'inactive' ? 'rgba(148, 163, 184, 0.08)' : 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="departureStatus"
                    value="inactive"
                    checked={departureStatus === 'inactive'}
                    onChange={() => setDepartureStatus('inactive')}
                  />
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ⚪ Inactive
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Temporarily paused / on leave
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Reason for replacement */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Reason for Staff Transition / Replacement</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Resigned from college, sabbatical, role promotion..."
                className="input-control"
              />
            </div>

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNextToReview}
                disabled={!replacementStaffId}
                className="btn btn-primary"
                style={{ gap: '6px' }}
                id="btn-next-review-complaints"
              >
                <span>Review Open Complaints ({eligibleComplaints.length})</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SHOW OPEN COMPLAINTS BEFORE TRANSFER */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Open Complaints to Transfer
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
                  {departingStaff.name} currently has <strong>{eligibleComplaints.length}</strong> open complaint(s)
                </p>
              </div>

              {/* Transfer Mode Toggle */}
              <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--bg-tertiary)', padding: '3px', borderRadius: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setTransferMode('all');
                    setSelectedComplaintIds(eligibleComplaints.map(c => c.id));
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: transferMode === 'all' ? 'var(--primary-500)' : 'transparent',
                    color: transferMode === 'all' ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Transfer All ({eligibleComplaints.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTransferMode('manual')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: transferMode === 'manual' ? 'var(--primary-500)' : 'transparent',
                    color: transferMode === 'manual' ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Select Manually
                </button>
              </div>
            </div>

            {/* Notice: Do NOT Transfer Closed Complaints */}
            <div style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '10px',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Shield size={16} color="var(--primary-400)" style={{ flexShrink: 0 }} />
              <span>
                <strong>Historical Integrity:</strong> Only active/open complaints (<em>Submitted, Under Review, Assigned, In Progress</em>) can be transferred. <strong>{closedComplaints.length}</strong> resolved/closed complaint(s) will permanently remain linked to {departingStaff.name} for auditing.
              </span>
            </div>

            {/* List of Open Complaints */}
            {eligibleComplaints.length === 0 ? (
              <div style={{
                padding: '28px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)'
              }}>
                <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>No Open Complaints</div>
                <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                  {departingStaff.name} currently has no active pending tickets.
                </div>
              </div>
            ) : (
              <div style={{
                maxHeight: '260px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingRight: '4px'
              }}>
                {eligibleComplaints.map(c => {
                  const isChecked = transferMode === 'all' || selectedComplaintIds.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => transferMode === 'manual' && handleToggleComplaint(c.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        backgroundColor: isChecked ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)',
                        border: isChecked ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: transferMode === 'manual' ? 'pointer' : 'default',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                        {transferMode === 'manual' && (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleComplaint(c.id)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ accentColor: 'var(--primary-500)', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                        )}
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-400)' }}>
                              #{c.id}
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {c.title}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            📍 {typeof c.location === 'object' ? (c.location.building || 'Campus') : (c.location || 'Campus')}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PriorityBadge priority={c.priority} size="sm" />
                        <StatusBadge status={c.status} size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {transferMode === 'manual' && eligibleComplaints.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>Selected: <strong>{selectedComplaintIds.length}</strong> of {eligibleComplaints.length} complaints</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={handleSelectAll} style={{ background: 'none', border: 'none', color: 'var(--primary-400)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                    Select All
                  </button>
                  <span>•</span>
                  <button type="button" onClick={handleDeselectAll} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}>
                    Deselect All
                  </button>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-secondary"
                style={{ gap: '6px' }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextToConfirm}
                className="btn btn-primary"
                style={{ gap: '6px' }}
                id="btn-proceed-confirmation"
              >
                <span>Proceed to Confirmation</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: FINAL TRANSFER CONFIRMATION */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Confirm Staff Replacement & Ticket Transfer
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {/* Old Staff Box */}
                <div style={{
                  padding: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '10px'
                }}>
                  <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>
                    Departing Staff (Becomes Inactive)
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {departingStaff.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {departingStaff.roleTitle || 'Technician'} • {departingStaff.department}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700, marginTop: '6px' }}>
                    Account status: ⚫ INACTIVE
                  </div>
                </div>

                {/* New Staff Box */}
                <div style={{
                  padding: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '10px'
                }}>
                  <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>
                    Replacement Staff (Active)
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {replacementStaff?.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {replacementStaff?.roleTitle || 'Technician'} • {replacementStaff?.department}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, marginTop: '6px' }}>
                    Account status: 🟢 ACTIVE
                  </div>
                </div>
              </div>

              {/* Transfer Metrics Summary */}
              <div style={{
                padding: '12px 14px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Complaints to Transfer
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>
                    {complaintsToTransfer.length} Open Tickets
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Audit History Entries
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-400)' }}>
                    {complaintsToTransfer.length} Records to be Created
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Future Assignments
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Auto-routed to {replacementStaff?.name}
                  </div>
                </div>
              </div>

              {/* Warning box */}
              <div style={{
                padding: '12px 14px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '10px',
                color: '#f59e0b',
                fontSize: '0.8rem',
                lineHeight: 1.5
              }}>
                ⚠️ <strong>This action will transfer the selected open complaints.</strong> The old staff member's historical records will NOT be deleted and will remain fully accessible in the audit logs.
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="btn btn-secondary"
                style={{ gap: '6px' }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
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
                  onClick={handleExecuteReplacement}
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{
                    gap: '6px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    borderColor: '#d97706',
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)'
                  }}
                  id="btn-confirm-replacement-final"
                >
                  <ArrowRightLeft size={16} />
                  <span>{isSubmitting ? 'Transferring Tickets...' : 'Confirm Replacement'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: SUCCESS CELEBRATION SCREEN */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '20px 10px',
            gap: '16px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Staff Replacement Completed
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Technician roster and complaints have been updated across the campus directory
              </p>
            </div>

            <div style={{
              width: '100%',
              padding: '16px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Departing Staff Status:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: departureStatus === 'left_college' ? '#ef4444' : '#94a3b8' }}>
                  {departingStaff.name} → {departureStatus === 'left_college' ? '🔴 Left College' : '⚪ Inactive'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Replacement Staff Status:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>
                  {replacementStaff?.name} → 🟢 Active
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Complaints Transferred:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b' }}>
                  {successResult?.transferredCount ?? complaintsToTransfer.length} complaint(s) transferred
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Audit Records:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-400)' }}>
                  {successResult?.auditRecordsCount ?? complaintsToTransfer.length} audit records created
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Future incoming complaints for {departingStaff.department} will automatically route to {replacementStaff?.name}.
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary"
              style={{ minWidth: '180px', marginTop: '6px' }}
              id="btn-view-department-success"
            >
              View Department
            </button>
          </div>
        )}

      </div>
    </Modal>
  );
};
