import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusTimeline } from '../common/StatusTimeline';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../common/Badge';
import { DEPARTMENTS, STAFF_MEMBERS } from '../../data/departments';
import { 
  MapPin, Calendar, User, Building, Paperclip, Send, 
  CheckCircle2, Star, ShieldAlert, Edit3, MessageSquare, History, 
  ArrowLeft, ExternalLink, Image as ImageIcon, Sparkles, Layers, DoorOpen
} from 'lucide-react';

export const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { complaints, currentPersona, addComment, submitRating, openModal } = useApp();

  const [newComment, setNewComment] = useState('');
  const [selectedRating, setSelectedRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('overview'); // 'overview' | 'timeline' | 'discussion'

  const complaint = complaints.find(c => String(c.id).toLowerCase() === String(id).toLowerCase());

  if (!complaint) {
    return (
      <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center', maxWidth: '600px', margin: '40px auto', borderRadius: '20px' }}>
        <ShieldAlert size={48} color="#ef4444" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Complaint #{id} Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
          The requested ticket may have been moved, deleted, or does not exist in the campus registry.
        </p>
        <button onClick={() => navigate('/complaints')} className="btn btn-primary" style={{ gap: '6px' }}>
          <ArrowLeft size={16} />
          <span>Return to All Complaints</span>
        </button>
      </div>
    );
  }

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

  // Structured location fields
  const locDetails = complaint.manualLocation || complaint.locationDetails || {};
  const building = locDetails.building || (typeof complaint.location === 'string' ? (complaint.location.split('→')[0]?.trim() || complaint.location) : complaint.location?.building) || 'Campus Facility';
  const floor = locDetails.floor || complaint.floorLevel || (typeof complaint.location === 'string' && complaint.location.includes('→') ? complaint.location.split('→')[1]?.trim() : 'Ground Floor');
  const room = locDetails.roomOrSpot || (typeof complaint.location === 'string' && complaint.location.includes('→') ? complaint.location.split('→')[2]?.trim() : complaint.location?.roomOrSpot) || '';
  const details = locDetails.additionalDetails || '';
  const gpsAddress = complaint.gpsLocation?.address || (typeof complaint.gpsLocation === 'string' ? complaint.gpsLocation : null);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header / Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-ghost"
          style={{ gap: '8px', padding: '8px 12px', fontSize: '0.875rem' }}
        >
          <ArrowLeft size={18} />
          <span>Back to Complaints</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAdminOrStaff && (
            <button
              onClick={() => navigate(`/admin/triage/${complaint.id}`)}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              <Edit3 size={15} />
              <span>Triage & Dispatch Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Glass Detail Container */}
      <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Ticket Header & Status Badges */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-400)', letterSpacing: '0.04em' }}>
                #{complaint.id}
              </span>
              <CategoryBadge categoryId={complaint.category} />
              <PriorityBadge priority={complaint.priority} />
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {complaint.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px', fontSize: '0.825rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} />
                <span>Reported: {new Date(complaint.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} />
                <span>Student: <strong>{complaint.student?.name || 'Student Reporter'}</strong> ({complaint.student?.studentId || complaint.student?.department || 'Student'})</span>
              </div>
            </div>
          </div>

          <div>
            <StatusBadge status={complaint.status} size="lg" />
          </div>
        </div>

        {/* 6-Stage Lifecycle Status Progression Timeline */}
        <div style={{
          padding: '24px 20px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
            Lifecycle Progression Status
          </div>
          <StatusTimeline currentStatus={complaint.status} />
        </div>

        {/* Tab Switcher: Overview | AI Solution | History | Discussion */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          borderBottom: '1.5px solid var(--border-color)',
          paddingBottom: '4px'
        }}>
          {[
            { id: 'overview', label: 'Issue Overview & Location', icon: MapPin },
            { id: 'timeline', label: 'Status Audit History', icon: History, count: complaint.statusHistory?.length || 0 },
            { id: 'discussion', label: 'Comments & Updates', icon: MessageSquare, count: complaint.comments?.length || 0 }
          ].map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeDetailTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDetailTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '12px 12px 0 0',
                  border: 'none',
                  backgroundColor: isTabActive ? '#FDF2F8' : 'transparent',
                  color: isTabActive ? '#EC4899' : 'var(--text-secondary)',
                  fontWeight: isTabActive ? 700 : 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                  borderBottom: isTabActive ? '2.5px solid #EC4899' : '2.5px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: isTabActive ? 'rgba(236, 72, 153, 0.15)' : '#F1F5F9',
                    color: isTabActive ? '#EC4899' : '#64748B'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeDetailTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Campus Location Card (Manual + GPS) */}
            <div style={{
              padding: '20px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <MapPin size={18} />
                  <span>Campus Location & Location Details</span>
                </div>
                {gpsAddress && (
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle2 size={13} />
                    <span>Location Detected</span>
                  </span>
                )}
              </div>

              {/* Manual Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Building / Block</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-300)', marginTop: '4px' }}>
                    {building || 'Campus Facility'}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Floor Level</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '4px' }}>
                    {floor}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Room No. / Spot</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {room || 'Room / Spot'}
                  </div>
                </div>
              </div>

              {details && (
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', padding: '10px 12px', backgroundColor: 'var(--bg-card)', borderRadius: '10px' }}>
                  <strong>Additional Details:</strong> {details}
                </div>
              )}

              {/* GPS Address Banner (Readable Address Only) */}
              {gpsAddress && (
                <div style={{
                  padding: '14px 16px',
                  backgroundColor: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                      📍 GPS Location
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {gpsAddress}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Description */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Detailed Description of Concern
              </div>
              <div style={{
                padding: '18px 20px',
                borderRadius: '14px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                fontSize: '0.925rem',
                color: 'var(--text-primary)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap'
              }}>
                {complaint.description}
              </div>
            </div>

            {/* Attached Photo Evidence Gallery */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                  <ImageIcon size={15} color="var(--primary-400)" />
                  <span>Attached Photo Evidence ({complaint.attachments.length})</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
                  {complaint.attachments.map((att, idx) => (
                    <div
                      key={att.id || idx}
                      onClick={() => setPreviewImage(att.url)}
                      style={{
                        position: 'relative',
                        height: '130px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        transition: 'transform 0.2s'
                      }}
                      title="Click to zoom photo"
                    >
                      <img
                        src={att.url}
                        alt={att.name || `Photo evidence ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '6px',
                        left: '6px',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        Photo {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Department Assignment Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Handling Department
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-400)', marginTop: '2px' }}>
                  {dept ? `${dept.name} (${dept.code})` : 'Pending Administrative Assignment'}
                </div>
                {staff && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Assigned Lead Technician: <strong>{staff.name}</strong> ({staff.role})
                  </div>
                )}
              </div>

              {dept && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  SLA Target: <strong>{dept.slaHours} Hours</strong>
                </div>
              )}
            </div>

            {/* Student Feedback & Rating Section (if resolved) */}
            {(complaint.status === 'Resolved' || complaint.status === 'Closed') && (
              <div style={{
                padding: '22px',
                borderRadius: '16px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={20} color="#10b981" />
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#10b981' }}>
                    Issue Resolved
                  </span>
                </div>

                {complaint.resolutionNotes && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    <strong>Resolution Report:</strong> {complaint.resolutionNotes}
                  </div>
                )}

                {/* Rating Display or Submission Form */}
                {complaint.rating ? (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Student Satisfaction Rating</div>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            size={18}
                            fill={star <= complaint.rating ? '#f59e0b' : 'none'}
                            color="#f59e0b"
                          />
                        ))}
                      </div>
                    </div>
                    {complaint.feedback && (
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        "{complaint.feedback}"
                      </div>
                    )}
                  </div>
                ) : isStudentReporter ? (
                  <form onSubmit={handleRatingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      How satisfied are you with this resolution?
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
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
                            size={24}
                            fill={star <= selectedRating ? '#f59e0b' : 'none'}
                            color="#f59e0b"
                          />
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Optional feedback comment..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="input-control"
                      style={{ fontSize: '0.85rem' }}
                    />
                    <button type="submit" className="btn btn-primary btn-sm" style={{ width: 'fit-content' }}>
                      Submit Feedback Rating
                    </button>
                  </form>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AUDIT TIMELINE */}
        {activeDetailTab === 'timeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(!complaint.statusHistory || complaint.statusHistory.length === 0) ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No status transitions recorded yet.
              </div>
            ) : (
              complaint.statusHistory.map((item, i) => (
                <div
                  key={item.id || i}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-400)',
                    flexShrink: 0
                  }}>
                    <History size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        Status updated to: <strong style={{ color: 'var(--primary-300)' }}>{item.toStatus}</strong>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      By: {item.changedBy}
                    </div>
                    {item.note && (
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-primary)', marginTop: '6px', fontStyle: 'italic' }}>
                        "{item.note}"
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: DISCUSSION COMMENTS */}
        {activeDetailTab === 'discussion' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Post comment box */}
            <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Post an update, question, or technician note..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input-control"
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
                <Send size={16} />
                <span>Post</span>
              </button>
            </form>

            {/* Comment list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(!complaint.comments || complaint.comments.length === 0) ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No comments yet. Start the conversation by posting an update above.
                </div>
              ) : (
                complaint.comments.map(c => (
                  <div
                    key={c.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-400)' }}>
                        {c.author} ({c.role})
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(c.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                      {c.text}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Full-screen Image Lightbox */}
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
            alt="Preview evidence"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px', objectFit: 'contain' }}
          />
        </div>
      )}
    </div>
  );
};
