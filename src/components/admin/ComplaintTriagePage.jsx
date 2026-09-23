import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { DEPARTMENTS as FALLBACK_DEPARTMENTS, STAFF_MEMBERS as FALLBACK_STAFF } from '../../data/departments';
import { STATUSES, PRIORITIES } from '../../data/categories';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../common/Badge';
import { 
  Edit3, Building, UserCheck, CheckCircle2, 
  ArrowLeft, Sparkles, Shield, MapPin, AlertCircle, Save 
} from 'lucide-react';
import { SmartTriageCard } from '../intelligence/SmartTriageCard';

export const ComplaintTriagePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { complaints, triageComplaint, currentPersona, addToast } = useApp();

  const complaint = complaints.find(c => String(c.id).toLowerCase() === String(id).toLowerCase());

  const [status, setStatus] = useState('Submitted');
  const [departmentId, setDepartmentId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Live active staff & departments
  const [departments, setDepartments] = useState(FALLBACK_DEPARTMENTS);
  const [activeStaffList, setActiveStaffList] = useState(FALLBACK_STAFF.filter(s => (s.status || 'active') === 'active'));

  useEffect(() => {
    // Fetch live active staff & departments
    api.getStaff({ status: 'active' })
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          setActiveStaffList(res.filter(s => (s.status || 'active') === 'active'));
        }
      })
      .catch(() => {});

    api.getDepartments()
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          setDepartments(res);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status || 'Submitted');
      setDepartmentId(complaint.assignedDepartment || '');
      setStaffId(complaint.assignedStaff || '');
      setResolutionNotes(complaint.resolutionNotes || '');
      setError('');
    }
  }, [complaint]);

  if (!complaint) {
    return (
      <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center', maxWidth: '600px', margin: '40px auto', borderRadius: '20px' }}>
        <Shield size={48} color="#ef4444" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Complaint #{id} Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Unable to locate this complaint for administrative triage.
        </p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ gap: '6px' }}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>
    );
  }

  // Filter ONLY active staff by selected department (inactive staff excluded)
  const availableStaff = departmentId
    ? activeStaffList.filter(s => (s.departmentId === departmentId || s.department === departmentId) && (s.status || 'active') === 'active')
    : activeStaffList.filter(s => (s.status || 'active') === 'active');

  const handleDepartmentChange = (e) => {
    const newDept = e.target.value;
    setDepartmentId(newDept);
    setStaffId(''); // Reset assigned technician when department changes
  };

  const handleQuickResolutionFill = () => {
    setResolutionNotes('Inspection completed on-site by facilities technician. Necessary maintenance, repair, and circuit validation completed successfully.');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const isResolvedOrClosed = status === 'Resolved' || status === 'Closed';

    if (isResolvedOrClosed && (!resolutionNotes || resolutionNotes.trim().length < 5)) {
      setError('Please provide a brief resolution note detailing the fix before marking as Resolved.');
      return;
    }

    setIsSaving(true);

    try {
      await triageComplaint(complaint.id, {
        status,
        statusNote: statusNote.trim() || `Triage update processed by ${currentPersona.name}`,
        assignedDepartment: departmentId || null,
        assignedStaff: staffId || null,
        resolutionNotes: isResolvedOrClosed ? resolutionNotes.trim() : complaint.resolutionNotes
      });

      navigate(`/complaints/${complaint.id}`);
    } catch (err) {
      setError(err.message || 'Failed to update ticket. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAcceptSuggestions = (suggestions) => {
    if (suggestions.departmentId) {
      setDepartmentId(suggestions.departmentId);
    }
    if (suggestions.staffId) {
      setStaffId(suggestions.staffId);
    }
    if (status === 'Submitted') {
      setStatus('In Progress');
    }
    setStatusNote('Applied automated Smart AI recommendations (Department & Technician)');
    if (addToast) {
      addToast({
        type: 'success',
        title: 'AI Suggestions Applied',
        message: 'Smart AI triage recommendations applied!'
      });
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn btn-ghost"
        style={{ width: 'fit-content', gap: '8px', padding: '8px 12px', fontSize: '0.875rem' }}
      >
        <ArrowLeft size={18} />
        <span>Back to Ticket Details</span>
      </button>

      {/* CampusCare Smart Triage AI Card */}
      <SmartTriageCard
        complaint={complaint}
        onAcceptSuggestions={handleAcceptSuggestions}
        departments={departments}
        staffMembers={activeStaffList}
      />

      {/* Main Glass Form */}
      <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
          }}>
            <Edit3 size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              Triage & Dispatch: #{complaint.id}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Update complaint lifecycle status, assign maintenance units, and designate active technicians
            </p>
          </div>
        </div>

        {/* Complaint Summary Card */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CategoryBadge categoryId={complaint.category} size="sm" />
              <PriorityBadge priority={complaint.priority} size="sm" />
            </div>
            <StatusBadge status={complaint.status} size="sm" />
          </div>

          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {complaint.title}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} color="var(--accent-cyan)" /> {complaint.location}
            </span>
            <span>Student: <strong>{complaint.student?.name || 'Student'}</strong></span>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#ef4444',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Status Selection */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Update Lifecycle Status *</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '8px'
            }}>
              {STATUSES.map(s => {
                const isSelected = status.toLowerCase() === s.id.toLowerCase();
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatus(s.label)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid ${s.color}` : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? `${s.color}20` : 'var(--bg-tertiary)',
                      color: isSelected ? s.color : 'var(--text-secondary)',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s'
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Department Dispatch & Staff Assignment */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {/* Department */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={14} color="var(--primary-400)" />
                <span>Assign Campus Department</span>
              </label>
              <select
                value={departmentId}
                onChange={handleDepartmentChange}
                className="input-control"
              >
                <option value="">-- Select Handling Department --</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code}) - SLA: {dept.slaHours}h
                  </option>
                ))}
              </select>
            </div>

            {/* Staff Member (Only Active Staff) */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={14} color="var(--accent-cyan)" />
                <span>Assign Lead Technician (Active Only)</span>
              </label>
              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="input-control"
                disabled={!departmentId}
                id="select-triage-staff"
              >
                <option value="">
                  {departmentId ? '-- Select Active Technician --' : 'Select a department first'}
                </option>
                {availableStaff.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.roleTitle || s.role || 'Staff'}) — {s.phone || 'Extension'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Audit Note */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Audit Log Note (Visible in Ticket History)</label>
            <input
              type="text"
              placeholder="e.g. Assigned to Electrical Maintenance; replacement circuit breaker ordered."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="input-control"
            />
          </div>

          {/* Resolution Notes (if marking Resolved / Closed) */}
          {(status === 'Resolved' || status === 'Closed') && (
            <div className="input-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="input-label" style={{ color: '#10b981', fontWeight: 700, margin: 0 }}>
                  Official Resolution Report & Student Summary *
                </label>
                <button
                  type="button"
                  onClick={handleQuickResolutionFill}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-400)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Insert Standard Template
                </button>
              </div>
              <textarea
                placeholder="Detail the work carried out to fix the issue, parts replaced, and preventive testing performed..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="input-control"
                style={{ minHeight: '90px', borderColor: '#10b981' }}
                required
              />
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
              style={{ gap: '8px' }}
            >
              <Save size={16} />
              <span>{isSaving ? 'Updating...' : 'Save Triage & Dispatch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
