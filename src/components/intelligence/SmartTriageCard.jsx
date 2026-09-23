import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Check, AlertTriangle, Link2, ExternalLink, 
  ShieldAlert, CheckCircle2, ChevronRight, HelpCircle, Layers, UserCheck, Flame
} from 'lucide-react';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../common/Badge';
import { api } from '../../api/client';

export const SmartTriageCard = ({ 
  complaint, 
  onAcceptSuggestions,
  departments = [],
  staffMembers = []
}) => {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(complaint?.intelligence || null);
  const [similarTickets, setSimilarTickets] = useState([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [linkSuccessMsg, setLinkSuccessMsg] = useState('');

  // Fetch analysis & similar complaints
  useEffect(() => {
    if (!complaint?.id) return;

    // 1. If complaint does not have intelligence metadata, analyze it dynamically
    if (!complaint.intelligence) {
      api.analyzeComplaintDraft({
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        priority: complaint.priority,
        location: complaint.location
      })
        .then(res => {
          if (res?.analysis) setAnalysis(res.analysis);
        })
        .catch(err => console.error('Dynamic analysis failed:', err));
    } else {
      setAnalysis(complaint.intelligence);
    }

    // 2. Fetch duplicate & similar complaints
    setIsLoadingSimilar(true);
    api.getSimilarComplaints(complaint.id)
      .then(res => {
        if (res?.similarComplaints) {
          setSimilarTickets(res.similarComplaints);
        }
      })
      .catch(err => console.error('Fetch similar failed:', err))
      .finally(() => setIsLoadingSimilar(false));
  }, [complaint]);

  if (!analysis) return null;

  const handleApplySuggestions = () => {
    if (onAcceptSuggestions) {
      onAcceptSuggestions({
        category: analysis.suggestedCategory,
        priority: analysis.suggestedPriority,
        departmentId: analysis.suggestedDepartmentId,
        staffId: analysis.suggestedStaffId
      });
    }
  };

  const handleLinkTickets = async (secondaryComplaintId) => {
    try {
      setIsLinking(true);
      await api.linkComplaints(complaint.id, secondaryComplaintId, 'duplicate');
      setLinkSuccessMsg(`Ticket #${secondaryComplaintId} linked successfully to this ticket.`);
      setTimeout(() => setLinkSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Link ticket failed:', err);
    } finally {
      setIsLinking(false);
    }
  };

  const confidencePercent = Math.round((analysis.confidence || 0.85) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Smart Triage Recommendation Banner */}
      <div
        className="glass-panel"
        style={{
          borderRadius: '16px',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(236, 72, 153, 0.05) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary-500), #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>CampusCare Smart Triage AI</h4>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary-400)', border: '1px solid rgba(99, 102, 241, 0.3)'
                }}>
                  {confidencePercent}% Confidence
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Automated NLP rule heuristics & urgency risk scoring.
              </p>
            </div>
          </div>

          {/* 1-Click Accept Suggestions Button */}
          <button
            type="button"
            onClick={handleApplySuggestions}
            className="btn btn-primary btn-sm"
            style={{
              gap: '6px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
              fontWeight: 700,
              padding: '8px 16px'
            }}
          >
            <Sparkles size={15} />
            <span>Accept Suggestions</span>
          </button>
        </div>

        {/* Suggestion Badges Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '14px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          marginBottom: '14px'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Suggested Category
            </div>
            <CategoryBadge categoryId={analysis.suggestedCategory} size="sm" />
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Suggested Priority
            </div>
            <PriorityBadge priority={analysis.suggestedPriority} size="sm" />
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Recommended Department
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {analysis.suggestedDepartmentName || 'Maintenance Department'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Suggested Staff Technician
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UserCheck size={14} />
              <span>{analysis.suggestedStaffName || 'Next Available Technician'}</span>
            </div>
          </div>
        </div>

        {/* Transparent Reasoning Bullet Points */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Decision Reasoning & Signal Evidence:
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {analysis.reasons?.map((reason, idx) => (
              <li key={idx} style={{ color: 'var(--text-primary)' }}>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 2. Similar & Duplicate Complaints Warning Card */}
      {similarTickets.length > 0 && (
        <div
          className="glass-panel"
          style={{
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            background: 'rgba(245, 158, 11, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="#f59e0b" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#f59e0b' }}>
                Similar / Possible Duplicate Complaints ({similarTickets.length})
              </h4>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Location & Token Overlap
            </span>
          </div>

          {linkSuccessMsg && (
            <div style={{
              padding: '8px 12px', background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px',
              color: '#10b981', fontSize: '0.8rem', fontWeight: 600, marginBottom: '10px'
            }}>
              ✓ {linkSuccessMsg}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {similarTickets.map((match) => {
              const comp = match.complaint;
              const isDuplicateRisk = match.matchPercentage >= 50;

              return (
                <div
                  key={comp.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-400)' }}>
                        #{comp.id}
                      </span>
                      <span style={{
                        padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800,
                        background: isDuplicateRisk ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: isDuplicateRisk ? '#ef4444' : '#f59e0b',
                        border: `1px solid ${isDuplicateRisk ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`
                      }}>
                        {match.matchPercentage}% Match
                      </span>
                      <StatusBadge status={comp.status} size="sm" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleLinkTickets(comp.id)}
                        disabled={isLinking}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                      >
                        <Link2 size={13} />
                        <span>Link Duplicate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/admin/triage/${comp.id}`)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                      >
                        <span>View</span>
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {comp.title}
                  </div>

                  {/* Matching reasons */}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {match.reasons?.join(' • ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
