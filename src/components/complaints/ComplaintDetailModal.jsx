import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { StatusTimeline } from '../common/StatusTimeline';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../common/Badge';
import { DEPARTMENTS, STAFF_MEMBERS } from '../../data/departments';
import { formatLocationString } from '../../utils/intelligenceEngine';
import { 
  MapPin, Calendar, User, Building, Paperclip, Send, 
  CheckCircle2, Star, ShieldAlert, Edit3, MessageSquare, History, ExternalLink, Image as ImageIcon, Sparkles
} from 'lucide-react';

export const ComplaintDetailModal = () => {
  const { 
    modalState, 
    closeModal, 
    complaints, 
    currentPersona, 
    addComment, 
    submitRating, 
    openModal 
  } = useApp();

  const [newComment, setNewComment] = useState('');
  const [selectedRating, setSelectedRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('overview'); // 'overview' | 'timeline' | 'discussion'

  if (!modalState.isOpen || modalState.type !== 'detail' || !modalState.data?.id) {
    return null;
  }

  const complaint = complaints.find(c => c.id === modalState.data.id);

  if (!complaint) return null;

  const dept = DEPARTMENTS.find(d => d.id === complaint.assignedDepartment);
  const staff = STAFF_MEMBERS.find(s => s.id === complaint.assignedStaff);
  const isStudentReporter = currentPersona?.id === complaint.student?.id || currentPersona?.email === complaint.student?.email;
  const isAdminOrStaff = currentPersona?.role === 'admin' || currentPersona?.role === 'staff';

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(complaint.id, newComment);
    setNewComment('');
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    submitRating(complaint.id, selectedRating, feedbackText);
    setFeedbackText('');
  };

  return (
    <Modal
      isOpen={modalState.isOpen && modalState.type === 'detail'}
      onClose={closeModal}
      maxWidth="860px"
      title={`Complaint #${complaint.id}`}
      subtitle={`Submitted on ${new Date(complaint.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Lifecycle Visualizer */}
        <div style={{
          backgroundColor: 'var(--bg-tertiary)',
          padding: '16px 20px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Lifecycle Progression
          </div>
          <StatusTimeline currentStatus={complaint.status} statusHistory={complaint.statusHistory} />
        </div>

        {/* Top Badges & Actions Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <CategoryBadge categoryId={complaint.category} />
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>

          {/* Quick Admin Triage Action Button */}
          {isAdminOrStaff && (
            <button
              onClick={() => openModal('triage', { id: complaint.id })}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              <Edit3 size={15} />
              <span>Triage & Update Status</span>
            </button>
          )}
        </div>

        {/* Navigation tabs inside detail view */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          borderBottom: '1.5px solid var(--border-color)',
          paddingBottom: '8px'
        }}>
          {[
            { id: 'overview', label: 'Details & Location', icon: MessageSquare },
            { id: 'timeline', label: `Audit Log (${complaint.statusHistory.length})`, icon: History },
            { id: 'discussion', label: `Discussion (${(complaint.comments || []).length})`, icon: MessageSquare }
          ].map(tab => {
            const isTabActive = activeDetailTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDetailTab(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: isTabActive ? '1.5px solid #EC4899' : '1px solid transparent',
                  background: isTabActive ? '#FDF2F8' : 'transparent',
                  color: isTabActive ? '#EC4899' : 'var(--text-secondary)',
                  fontWeight: isTabActive ? 700 : 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
                  boxShadow: isTabActive ? '0 2px 8px rgba(236, 72, 153, 0.12)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview & Resolution */}
        {activeDetailTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* AI Diagnosis Quick Action Card */}
            <AiSolutionCard complaint={complaint} compact={true} />

            {/* Title & Description */}
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {complaint.title}
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {complaint.description}
              </p>
            </div>

            {/* Meta Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px'
            }}>
              {/* Location Card */}
              <div style={{
                padding: '14px 16px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <MapPin size={22} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Reported Campus Location
                  </div>
                  <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {formatLocationString(complaint.location)}
                  </div>
                  {complaint.locationDetails?.additionalDetails && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                      Note: {complaint.locationDetails.additionalDetails}
                    </div>
                  )}
                </div>
              </div>

              {/* Student Reporter Card */}
              <div style={{
                padding: '14px 16px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <img
                  src={complaint.student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={complaint.student?.name || 'Student'}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Reported By
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {complaint.student?.name || 'Student'} ({complaint.student?.studentId || 'Enrolled'})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {complaint.student?.department || 'Department'}
                  </div>
                </div>
              </div>

              {/* Department & Staff Card */}
              <div style={{
                padding: '14px 16px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                gap: '12px'
              }}>
                <Building size={22} color="var(--primary-400)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Assigned Handling Unit
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {dept ? dept.name : 'Unassigned (Awaiting Dean Triage)'}
                  </div>
                  {staff && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary-400)', fontWeight: 600, marginTop: '2px' }}>
                      Staff Technician: {staff.name} ({staff.phone})
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Paperclip size={16} />
                  <span>Attachments & Photo Proof ({complaint.attachments.length})</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {complaint.attachments.map((att, idx) => (
                    <div
                      key={att.id || idx}
                      onClick={() => setPreviewImage(att.url)}
                      style={{
                        position: 'relative',
                        width: '160px',
                        height: '110px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer'
                      }}
                    >
                      <img
                        src={att.url}
                        alt={att.name || 'Attachment'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                      >
                        <span style={{ color: '#ffffff', fontSize: '0.75rem', fontWeight: 700 }}>Click to Zoom</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Report (If resolved) */}
            {complaint.resolutionNotes && (
              <div style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '1rem' }}>
                  <CheckCircle2 size={20} />
                  <span>Resolution Report & Action Taken</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {complaint.resolutionNotes}
                </p>
                {complaint.resolutionPhoto && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      After-Resolution Evidence:
                    </div>
                    <img
                      src={complaint.resolutionPhoto}
                      alt="Resolution proof"
                      style={{ maxHeight: '180px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                )}
                {complaint.resolvedAt && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Resolved at: {new Date(complaint.resolvedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {/* Student Satisfaction Rating & Feedback */}
            {(complaint.status === 'Resolved' || complaint.status === 'Closed') && (
              <div style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)'
              }}>
                {complaint.rating ? (
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Student Resolution Rating
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={20}
                          fill={star <= complaint.rating ? '#f59e0b' : 'none'}
                          color={star <= complaint.rating ? '#f59e0b' : 'var(--text-muted)'}
                        />
                      ))}
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', marginLeft: '6px', color: '#f59e0b' }}>
                        {complaint.rating} / 5 Stars
                      </span>
                    </div>
                    {complaint.feedback && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        "{complaint.feedback}"
                      </p>
                    )}
                  </div>
                ) : isStudentReporter ? (
                  <form onSubmit={handleRatingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        How satisfied are you with this resolution?
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Please rate the speed, quality, and staff response.
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', margin: '4px 0' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSelectedRating(star)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <Star
                            size={26}
                            fill={star <= selectedRating ? '#f59e0b' : 'none'}
                            color={star <= selectedRating ? '#f59e0b' : 'var(--text-muted)'}
                          />
                        </button>
                      ))}
                    </div>

                    <textarea
                      placeholder="Add brief feedback or comments on the fix..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="input-control"
                      style={{ minHeight: '60px' }}
                    />

                    <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
                      Submit Feedback & Rating
                    </button>
                  </form>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Awaiting student satisfaction rating and review.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Audit History Log */}
        {activeDetailTab === 'timeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {complaint.statusHistory.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  display: 'flex',
                  gap: '14px',
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary-400)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      Transitioned to <span style={{ color: 'var(--primary-400)' }}>{item.toStatus}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    By: {item.changedBy}
                  </div>
                  {item.note && (
                    <div style={{
                      marginTop: '6px',
                      fontSize: '0.825rem',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)'
                    }}>
                      {item.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Discussion & Comments */}
        {activeDetailTab === 'discussion' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Comments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto' }}>
              {!complaint.comments || complaint.comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No messages yet. Post a question or update below.
                </div>
              ) : (
                complaint.comments.map(c => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: c.authorRole === 'staff' || c.authorRole === 'admin'
                        ? 'rgba(99, 102, 241, 0.1)'
                        : 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <img
                      src={c.authorAvatar}
                      alt={c.authorName}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{c.authorName}</span>
                          <span style={{
                            fontSize: '0.68rem',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            backgroundColor: c.authorRole === 'admin' ? '#f59e0b25' : c.authorRole === 'staff' ? '#06b6d425' : 'rgba(255,255,255,0.1)',
                            color: c.authorRole === 'admin' ? '#f59e0b' : c.authorRole === 'staff' ? '#06b6d4' : 'var(--text-secondary)',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            {c.authorRole}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.45 }}>
                        {c.message}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input Box */}
            <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <input
                type="text"
                placeholder={`Post an update as ${currentPersona?.name || 'User'}...`}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input-control"
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
                <Send size={16} />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* Modal footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)',
          gap: '10px'
        }}>
          <button onClick={closeModal} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>

      {/* Image Zoom Lightbox */}
      {previewImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px'
          }}
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px', objectFit: 'contain' }}
          />
        </div>
      )}
    </Modal>
  );
};
