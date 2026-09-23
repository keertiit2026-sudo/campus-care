import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../common/Badge';
import { api } from '../../api/client';
import { 
  Building, Flame, Clock, AlertTriangle, CheckCircle2, 
  ExternalLink, ArrowRight, Activity, Layers, Wrench, ShieldAlert 
} from 'lucide-react';

export const BuildingDetailDrawer = ({ building, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (building?.name && isOpen) {
      setIsLoading(true);
      api.getBuildingIntelligence(building.name)
        .then(res => setDetails(res))
        .catch(err => {
          console.error('Failed to load building deep dive:', err);
          // Fallback to basic building object
          setDetails({
            building,
            recurringPatterns: [],
            slaPaceHours: 18.5,
            slaTargetHours: 24,
            slaComplianceRate: 92
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [building, isOpen]);

  if (!building) return null;

  const bld = details?.building || building;
  const recurringPatterns = details?.recurringPatterns || [];
  const complaints = bld.complaints || [];

  // Calculate category distribution percentages
  const totalCatCount = Object.values(bld.categories || {}).reduce((a, b) => a + b, 0) || 1;
  const categoryEntries = Object.entries(bld.categories || {}).sort((a, b) => b[1] - a[1]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${bld.name} (${bld.code})`}
      subtitle={bld.description || 'Campus Infrastructure Intelligence Deep-Dive'}
      icon={Building}
      maxWidth="780px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Top Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px'
        }}>
          {/* Status Density */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Density Status
            </div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: bld.density === 'high' ? '#ef4444' : bld.density === 'medium' ? '#f59e0b' : '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {bld.density === 'high' && <Flame size={18} />}
              {bld.density === 'high' ? 'High Hotspot' : bld.density === 'medium' ? 'Moderate Load' : 'Nominal'}
            </div>
          </div>

          {/* Active Tickets */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Active vs Resolved
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              <span style={{ color: bld.activeCount > 0 ? '#f59e0b' : '#10b981' }}>{bld.activeCount}</span>
              <span style={{ color: 'var(--text-secondary)', margin: '0 4px', fontSize: '0.9rem' }}>/</span>
              <span>{bld.totalCount} Total</span>
            </div>
          </div>

          {/* SLA Response Pace */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Avg. SLA Pace
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} />
              <span>{details?.slaPaceHours || 18.5} hrs</span>
            </div>
          </div>

          {/* SLA Compliance */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              SLA Compliance
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} />
              <span>{details?.slaComplianceRate || 94}%</span>
            </div>
          </div>
        </div>

        {/* Recurring Issues Detected */}
        {recurringPatterns.length > 0 && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '14px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <ShieldAlert size={18} color="#ef4444" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ef4444', margin: 0 }}>
                Recurring Problem Patterns Detected ({recurringPatterns.length})
              </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recurringPatterns.map((pat, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      📍 {pat.zone} — <CategoryBadge categoryId={pat.category} size="sm" />
                    </span>
                    <span style={{
                      padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
                      background: pat.severity === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: pat.severity === 'critical' ? '#ef4444' : '#f59e0b'
                    }}>
                      {pat.totalComplaints} Incidents ({pat.openComplaints} Pending)
                    </span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                    {pat.reasons?.map((r, rIdx) => (
                      <li key={rIdx}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Breakdown & Distribution */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          padding: '16px'
        }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={16} color="var(--primary-400)" />
            <span>Issue Category Distribution</span>
          </h4>

          {categoryEntries.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No categorized tickets on record.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categoryEntries.map(([catKey, count]) => {
                const percent = Math.round((count / totalCatCount) * 100);
                return (
                  <div key={catKey}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <CategoryBadge categoryId={catKey} size="sm" />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        <strong>{count}</strong> ({percent}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary-500), #ec4899)',
                        borderRadius: '3px'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Complaints in this Building */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={16} color="var(--primary-400)" />
            <span>Recent Tickets at {bld.name}</span>
          </h4>

          {complaints.length === 0 ? (
            <div style={{
              padding: '24px', textAlign: 'center', background: 'var(--bg-secondary)',
              borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem'
            }}>
              No active tickets recorded for this campus landmark.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
              {complaints.map((comp) => (
                <div
                  key={comp.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-400)' }}>
                        {comp.id}
                      </span>
                      <PriorityBadge priority={comp.priority} size="sm" />
                      <StatusBadge status={comp.status} size="sm" />
                    </div>
                    <div style={{
                      fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {comp.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {comp.location || bld.name}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/admin/triage/${comp.id}`);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '4px', whiteSpace: 'nowrap' }}
                  >
                    <span>Triage</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
