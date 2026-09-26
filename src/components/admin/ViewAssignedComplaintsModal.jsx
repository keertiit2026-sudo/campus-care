import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useNavigate } from 'react-router-dom';
import { CategoryIcon, PriorityBadge, StatusBadge } from '../common/Badge';
import { 
  FileText, CheckCircle2, Clock, MapPin, 
  User, Calendar, ExternalLink, ArrowRightLeft, Shield 
} from 'lucide-react';

export const ViewAssignedComplaintsModal = ({ isOpen, onClose, staff, complaints = [] }) => {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'active' | 'resolved'

  if (!staff) return null;

  // Filter complaints assigned to this staff member
  const staffComplaints = complaints.filter(c => c.assignedStaff === staff.id);

  const activeComplaints = staffComplaints.filter(
    c => c.status !== 'Resolved' && c.status !== 'Closed'
  );
  const resolvedComplaints = staffComplaints.filter(
    c => c.status === 'Resolved' || c.status === 'Closed'
  );

  const displayedComplaints = filterTab === 'active' 
    ? activeComplaints 
    : filterTab === 'resolved' 
    ? resolvedComplaints 
    : staffComplaints;

  const handleOpenDetail = (complaintId) => {
    onClose();
    navigate(`/complaints/${complaintId}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assigned Complaints: ${staff.name}`}
      size="xl"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Staff Summary Card */}
        <div style={{
          padding: '14px 18px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={staff.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`}
              alt={staff.name}
              style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  {staff.name}
                </span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  backgroundColor: staff.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : staff.status === 'left_college' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                  color: staff.status === 'active' ? '#10b981' : staff.status === 'left_college' ? '#ef4444' : '#94a3b8',
                  border: `1px solid ${staff.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : staff.status === 'left_college' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`
                }}>
                  {staff.status === 'active' ? '● Active' : staff.status === 'left_college' ? '● Left College' : '● Inactive'}
                </span>
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {staff.employeeId || 'ID: N/A'} • {staff.roleTitle || staff.role} • {staff.department}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-400)' }}>
                {activeComplaints.length}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Open</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                {resolvedComplaints.length}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>Resolved</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {staffComplaints.length}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total All-Time</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          {[
            { id: 'all', label: `All Complaints (${staffComplaints.length})` },
            { id: 'active', label: `Active / Open (${activeComplaints.length})` },
            { id: 'resolved', label: `Resolved / Closed (${resolvedComplaints.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: 700,
                border: 'none',
                backgroundColor: filterTab === tab.id ? 'var(--primary-600)' : 'transparent',
                color: filterTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Complaints List */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayedComplaints.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '36px 20px',
              color: 'var(--text-muted)',
              fontSize: '0.9rem'
            }}>
              <FileText size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <div>No complaints found for this view.</div>
            </div>
          ) : (
            displayedComplaints.map(c => {
              // Check if complaint has transfer history
              const transferLogs = (c.statusHistory || []).filter(sh => sh.transferDetails || sh.note?.includes('transferred'));

              return (
                <div
                  key={c.id}
                  style={{
                    padding: '14px 16px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'border-color 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary-400)' }}>
                        #{c.id}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                        {c.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <StatusBadge status={c.status} />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleOpenDetail(c.id)}
                        style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                        title="Open full complaint details"
                      >
                        <span>View</span>
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CategoryIcon category={c.category} size={13} />
                      <span>{c.category}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} />
                      <span>{typeof c.location === 'object' ? (c.location.building || 'Campus') : (c.location || 'Campus Location')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} />
                      <span>Student: {c.student?.name || 'Anonymous'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} />
                      <span>Created: {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Transfer history banner if applicable */}
                  {transferLogs.length > 0 && (
                    <div style={{
                      padding: '6px 10px',
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: 'var(--primary-300)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <ArrowRightLeft size={13} />
                      <span>{transferLogs[transferLogs.length - 1].note}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
