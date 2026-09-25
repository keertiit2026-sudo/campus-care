import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { STATUSES, PRIORITIES } from '../../data/categories';
import { DEPARTMENTS, STAFF_MEMBERS } from '../../data/departments';
import { CategoryBadge, PriorityBadge } from '../common/Badge';
import { 
  CheckCircle2, Edit3, ShieldAlert, Building, 
  UserCheck, AlertCircle, FileCheck, Camera, Sparkles, Check, Info
} from 'lucide-react';
import { api } from '../../api/client';

export const ComplaintTriageModal = () => {
  const { modalState, closeModal, complaints, triageComplaint, currentPersona, addToast } = useApp();

  const [status, setStatus] = useState('In Progress');
  const [priority, setPriority] = useState('medium');
  const [department, setDepartment] = useState('');
  const [staffId, setStaffId] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState('');
  const [error, setError] = useState('');

  const complaint = modalState.isOpen && modalState.type === 'triage' && modalState.data?.id
    ? complaints.find(c => c.id === modalState.data.id)
    : null;

  const [activeStaffList, setActiveStaffList] = useState(STAFF_MEMBERS.filter(s => (s.status || 'active') === 'active'));

  useEffect(() => {
    // Fetch live active staff
    api.getStaff({ status: 'active' })
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          setActiveStaffList(res.filter(s => (s.status || 'active') === 'active'));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status || 'Under Review');
      setPriority(complaint.priority || 'medium');
      setDepartment(complaint.assignedDepartment || 'it_services');
      setStaffId(complaint.assignedStaff || '');
      setResolutionNotes(complaint.resolutionNotes || '');
      setResolutionPhoto(complaint.resolutionPhoto || '');
      setStatusNote('');
      setError('');
    }
  }, [complaint]);

  if (!modalState.isOpen || modalState.type !== 'triage' || !complaint) {
    return null;
  }

  const availableStaff = activeStaffList.filter(
    s => (s.departmentId === department || s.department === department) && (s.status || 'active') === 'active'
  );

  const handleSave = (e) => {
    e.preventDefault();

    // Enforce resolution note requirement when moving to Resolved
    if (status === 'Resolved' && (!resolutionNotes || resolutionNotes.trim().length < 10)) {
      setError('A detailed resolution note (at least 10 characters) is required to mark a complaint as Resolved.');
      return;
    }

    triageComplaint(complaint.id, {
      status,
      priority,
      assignedDepartment: department,
      assignedStaff: staffId || null,
      statusNote: statusNote.trim() || `Triage updated by ${currentPersona.name}`,
      resolutionNotes: status === 'Resolved' ? resolutionNotes.trim() : complaint.resolutionNotes,
      resolutionPhoto: status === 'Resolved' ? (resolutionPhoto.trim() || null) : complaint.resolutionPhoto
    });
  };

  return (
    <Modal
      isOpen={modalState.isOpen && modalState.type === 'triage'}
      onClose={closeModal}
      maxWidth="750px"
      title={`Triage & Dispatch: #${complaint.id}`}
      subtitle={`Reviewing "${complaint.title.slice(0, 45)}..."`}
      icon={Edit3}
    >
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Status Transition Selector */}
        <div>
          <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>
            Complaint Status Lifecycle
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '8px'
          }}>
            {STATUSES.map(s => {
              const isSelected = status === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(s.id)}
                  style={{
                    padding: '10px 6px',
                    borderRadius: '10px',
                    border: isSelected ? `2px solid ${s.color}` : '1px solid var(--border-color)',
                    backgroundColor: isSelected ? `${s.color}20` : 'var(--bg-tertiary)',
                    color: isSelected ? s.color : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Urgency & Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input-control"
            >
              {PRIORITIES.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.eta})</option>
              ))}
            </select>
          </div>

          {/* Handling Department */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Assigned Department</label>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setStaffId(''); // reset staff if department changed
              }}
              className="input-control"
            >
              {DEPARTMENTS.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Staff Assignment */}
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Assign Lead Technician (Active Only)</label>
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="input-control"
          >
            <option value="">-- Unassigned (Department Pool) --</option>
            {availableStaff.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} - {s.roleTitle || s.role} ({s.activeTickets || 0} active tickets)
              </option>
            ))}
          </select>
        </div>

        {/* Audit / Transition Note */}
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Status Transition Note (Recorded in Audit History)</label>
          <input
            type="text"
            placeholder="e.g. Assigned to electrical technician, parts ordered from inventory"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            className="input-control"
          />
        </div>

        {/* If Status is RESOLVED: Show Mandatory Resolution Notes & Photo Proof */}
        {status === 'Resolved' && (
          <div style={{
            padding: '18px',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '0.95rem' }}>
              <FileCheck size={18} />
              <span>Mandatory Resolution Documentation</span>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ color: '#10b981' }}>
                Resolution Actions Taken <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                placeholder="Detail the exact repair steps taken, parts replaced, diagnostic checks, and test results..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="input-control"
                style={{ minHeight: '80px', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                required
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Resolution Photo URL (Optional Evidence)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="https://... (Image proof of completed repair)"
                  value={resolutionPhoto}
                  onChange={(e) => setResolutionPhoto(e.target.value)}
                  className="input-control"
                />
                <button
                  type="button"
                  onClick={() => setResolutionPhoto('https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80')}
                  className="btn btn-secondary btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Insert Sample Proof
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button type="button" onClick={closeModal} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
            <Sparkles size={16} />
            <span>Save & Apply Updates</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
