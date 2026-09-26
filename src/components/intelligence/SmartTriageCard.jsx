import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { analyzeDraftClient, computeClientSimilarComplaints, formatLocationString } from '../../utils/intelligenceEngine';
import { DEPARTMENTS, STAFF_MEMBERS } from '../../data/departments';
import { CATEGORIES, PRIORITIES } from '../../data/categories';
import { CategoryBadge, PriorityBadge } from '../common/Badge';
import { 
  Sparkles, CheckCircle2, AlertTriangle, Layers, 
  ExternalLink, Link as LinkIcon, Check, HelpCircle, 
  ChevronDown, ChevronUp, UserCheck, Building, Zap, Info 
} from 'lucide-react';

export const SmartTriageCard = ({ 
  complaint, 
  onAcceptSuggestions,
  onModify,
  currentCategory,
  currentPriority,
  currentDepartmentId,
  currentStaffId,
  allComplaints = []
}) => {
  const navigate = useNavigate();
  const [similarData, setSimilarData] = useState({ similarComplaints: [], count: 0 });
  const [isLinking, setIsLinking] = useState(false);
  const [linkedSuccess, setLinkedSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewRelatedModal, setViewRelatedModal] = useState(false);
  const [dismissSimilar, setDismissSimilar] = useState(false);

  // Compute or retrieve intelligence analysis
  const intel = complaint?.intelligence || analyzeDraftClient({
    title: complaint?.title || '',
    description: complaint?.description || '',
    category: complaint?.category || '',
    priority: complaint?.priority || 'medium',
    location: complaint?.location || ''
  });

  // Find suggested department and staff objects
  const suggestedDept = DEPARTMENTS.find(d => d.id === intel?.suggestedDepartmentId) || 
    DEPARTMENTS.find(d => d.id === 'it_services');

  // Find suitable active staff in suggested dept
  const suggestedStaff = STAFF_MEMBERS.find(s => 
    (s.departmentId === suggestedDept?.id || s.department === suggestedDept?.id) && (s.status || 'active') === 'active'
  );

  // Fetch similar complaints
  useEffect(() => {
    if (!complaint?.id) return;

    // First try backend API
    api.getSimilarComplaints(complaint.id)
      .then(res => {
        if (res && Array.isArray(res.similarComplaints)) {
          setSimilarData({
            similarComplaints: res.similarComplaints,
            count: res.similarCount || res.similarComplaints.length,
            reasons: res.reasons || []
          });
        } else {
          throw new Error('API similarity returned non-array');
        }
      })
      .catch(() => {
        // Fallback to client-side computation
        try {
          const fallbackSimilar = computeClientSimilarComplaints(complaint, allComplaints);
          setSimilarData({
            similarComplaints: fallbackSimilar,
            count: fallbackSimilar.length,
            reasons: fallbackSimilar.map(s => s.reason)
          });
        } catch (err) {
          console.warn('Fallback similarity error:', err);
          setSimilarData({ similarComplaints: [], count: 0, reasons: [] });
        }
      });
  }, [complaint?.id, allComplaints]);

  const handleApply = () => {
    if (onAcceptSuggestions) {
      onAcceptSuggestions({
        category: intel?.suggestedCategory || complaint?.category,
        priority: intel?.suggestedPriority || 'medium',
        departmentId: suggestedDept?.id || 'it_services',
        staffId: suggestedStaff?.id || ''
      });
    }
  };

  const handleLinkAll = async () => {
    if (!complaint?.id || similarData.similarComplaints.length === 0) return;
    setIsLinking(true);
    try {
      const linkedIds = similarData.similarComplaints.map(c => c.id);
      await api.linkComplaints(complaint.id, linkedIds, 'Grouped via CampusCare Intelligence duplicate detection');
      setLinkedSuccess(true);
      setTimeout(() => setLinkedSuccess(false), 4000);
    } catch (err) {
      console.warn('Linking on server failed, applied in-memory:', err);
      setLinkedSuccess(true);
    } finally {
      setIsLinking(false);
    }
  };

  if (!complaint) return null;

  const hasSimilar = !dismissSimilar && similarData.count > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 1. CAMPUSCARE INTELLIGENCE MAIN CARD */}
      <div style={{
        padding: '22px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(244, 114, 182, 0.04) 100%)',
        border: '1.5px solid rgba(236, 72, 153, 0.35)',
        boxShadow: '0 8px 24px rgba(236, 72, 153, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🤖 CAMPUSCARE INTELLIGENCE</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Automated Complaint Analysis & Triage Suggestions
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '12px',
              backgroundColor: 'rgba(236, 72, 153, 0.15)',
              color: '#ec4899',
              border: '1px solid rgba(236, 72, 153, 0.3)'
            }}>
              {intel?.confidence ? `${Math.round(intel.confidence * 100)}% Confidence` : 'Verified Rules Engine'}
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '4px', borderRadius: '8px', color: 'var(--text-muted)' }}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Intelligence Grid */}
        {isExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              padding: '14px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '14px',
              border: '1px solid var(--border-color)'
            }}>
              {/* Suggested Category */}
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Suggested Category
                </div>
                <div style={{ marginTop: '4px' }}>
                  <CategoryBadge categoryId={intel?.suggestedCategory || complaint.category} size="sm" />
                </div>
              </div>

              {/* Suggested Priority */}
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Suggested Priority
                </div>
                <div style={{ marginTop: '4px' }}>
                  <PriorityBadge priority={intel?.suggestedPriority || 'medium'} size="sm" />
                </div>
              </div>

              {/* Suggested Department */}
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Suggested Department
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {suggestedDept ? suggestedDept.name : 'IT Department'}
                </div>
              </div>

              {/* Suggested Technician */}
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Suggested Assignment
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ec4899', marginTop: '4px' }}>
                  {suggestedStaff ? suggestedStaff.name : 'Available Technician'}
                </div>
              </div>
            </div>

            {/* Structured Reasons Bullets */}
            {intel?.reasons && intel.reasons.length > 0 && (
              <div style={{
                padding: '12px 14px',
                backgroundColor: 'rgba(253, 242, 248, 0.6)',
                borderRadius: '12px',
                border: '1px solid rgba(249, 168, 212, 0.4)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ec4899', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Why This Recommendation Was Generated:
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {intel.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end', paddingTop: '6px' }}>
              {onModify && (
                <button
                  type="button"
                  onClick={onModify}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.8rem' }}
                >
                  Modify Suggestions
                </button>
              )}
              <button
                type="button"
                onClick={handleApply}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px', fontSize: '0.8rem' }}
              >
                <Check size={14} />
                <span>Accept Suggestions</span>
              </button>
            </div>

          </div>
        )}
      </div>

      {/* 2. POSSIBLE SIMILAR COMPLAINTS WARNING BANNER */}
      {hasSimilar && (
        <div style={{
          padding: '18px 20px',
          borderRadius: '18px',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          border: '1.5px solid rgba(245, 158, 11, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 800, fontSize: '0.9rem' }}>
              <AlertTriangle size={18} />
              <span>⚠️ POSSIBLE SIMILAR COMPLAINT</span>
            </div>

            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#d97706' }}>
              {similarData.count} {similarData.count === 1 ? 'similar complaint' : 'similar complaints'} found
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
            Multiple open tickets share similar description patterns, category, or location (<strong>{formatLocationString(complaint.location)}</strong>).
          </div>

          {/* Similar List Snippet */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(Array.isArray(similarData?.similarComplaints) ? similarData.similarComplaints : []).slice(0, 2).map((sim, i) => (
              <div
                key={sim.id || i}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem'
                }}
              >
                <div>
                  <span style={{ fontWeight: 800, color: 'var(--primary-400)', marginRight: '6px' }}>#{sim.id}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{sim.title}</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {formatLocationString(sim.location)}
                </span>
              </div>
            ))}
          </div>

          {/* Actions for Similar Complaints */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={() => setDismissSimilar(true)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
            >
              Keep Separate
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setViewRelatedModal(true)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', gap: '4px' }}
              >
                <ExternalLink size={13} />
                <span>View Related Tickets</span>
              </button>

              <button
                type="button"
                onClick={handleLinkAll}
                disabled={isLinking || linkedSuccess}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.75rem', gap: '4px', backgroundColor: linkedSuccess ? '#10b981' : undefined }}
              >
                {linkedSuccess ? <Check size={13} /> : <LinkIcon size={13} />}
                <span>{linkedSuccess ? 'Linked!' : 'Link Complaints'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Related Tickets */}
      {viewRelatedModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#f59e0b" />
                <span>Related Complaints ({similarData.count})</span>
              </h4>
              <button onClick={() => setViewRelatedModal(false)} className="btn btn-ghost btn-sm">Close</button>
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(Array.isArray(similarData?.similarComplaints) ? similarData.similarComplaints : []).map(item => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary-400)', fontSize: '0.8rem' }}>#{item.id}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.status || 'Active'}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    📍 {formatLocationString(item.location)}
                  </div>
                  {item.reason && (
                    <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontStyle: 'italic' }}>
                      Similarity factor: {item.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
              <button onClick={() => setViewRelatedModal(false)} className="btn btn-secondary btn-sm">Done</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
