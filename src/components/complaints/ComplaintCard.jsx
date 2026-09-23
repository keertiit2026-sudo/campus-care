import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../common/Badge';
import { DEPARTMENTS } from '../../data/departments';
import { MapPin, Clock, MessageSquare, Paperclip, ChevronRight, UserCheck, Star } from 'lucide-react';

export const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate();

  if (!complaint) return null;

  const dept = DEPARTMENTS.find(d => d.id === complaint.assignedDepartment);
  const commentCount = complaint.comments ? complaint.comments.length : 0;
  const attachmentCount = complaint.attachments ? complaint.attachments.length : 0;

  const timeAgo = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHrs / 24);

      if (diffDays > 0) return `${diffDays}d ago`;
      if (diffHrs > 0) return `${diffHrs}h ago`;
      return 'Just now';
    } catch (e) {
      return dateStr;
    }
  };

  const getPriorityBorderColor = (p) => {
    switch ((p || '').toLowerCase()) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      default: return '#10b981';
    }
  };

  return (
    <div
      className="glass-panel glass-panel-interactive"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        borderLeft: `4px solid ${getPriorityBorderColor(complaint.priority)}`,
        gap: '14px',
        cursor: 'pointer'
      }}
      onClick={() => navigate(`/complaints/${complaint.id}`)}
    >
      {/* Top row: Category, Priority, Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            #{complaint.id}
          </span>
          <CategoryBadge categoryId={complaint.category} size="sm" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PriorityBadge priority={complaint.priority} size="sm" />
          <StatusBadge status={complaint.status} size="sm" />
        </div>
      </div>

      {/* Main: Title & Snippet */}
      <div>
        <h3 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.35,
          marginBottom: '6px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {complaint.title}
        </h3>
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {complaint.description}
        </p>
      </div>

      {/* Location Pill */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '4px 10px',
        borderRadius: 'var(--radius-sm)',
        width: 'fit-content'
      }}>
        <MapPin size={13} color="var(--primary-400)" />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
          {complaint.location}
        </span>
      </div>

      {/* Bottom Footer info: Reporter/Department, Comments, Attachments, Date */}
      <div style={{
        paddingTop: '12px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {dept?.name ? (
            <span style={{ color: 'var(--primary-400)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UserCheck size={14} />
              {dept.name.includes('&') ? dept.name.split('&')[0].trim() : dept.name}
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Pending Assignment
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {attachmentCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Paperclip size={13} /> {attachmentCount}
            </span>
          )}
          {commentCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MessageSquare size={13} /> {commentCount}
            </span>
          )}
          {complaint.rating && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b', fontWeight: 700 }}>
              <Star size={13} fill="#f59e0b" /> {complaint.rating}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={13} /> {timeAgo(complaint.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};
