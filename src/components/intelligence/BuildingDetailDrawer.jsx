import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../common/Badge';
import { formatLocationString } from '../../utils/intelligenceEngine';
import { 
  Building, X, AlertTriangle, Clock, 
  CheckCircle2, Flame, MapPin, ArrowRight, ShieldCheck, Activity 
} from 'lucide-react';

export const BuildingDetailDrawer = ({ building, onClose }) => {
  const navigate = useNavigate();

  if (!building) return null;

  const total = building.totalCount ?? building.complaintCount ?? 0;
  const categories = building.categoryBreakdown || (Array.isArray(building.categories) ? building.categories : Object.entries(building.categories || {}).map(([name, count]) => ({ name, count }))) || [];
  const mostAffected = building.mostAffectedLocation || building.topZone || 'General Campus Area';
  const recurring = building.possibleRecurringIssue || (building.recurringDetected ? `${building.topCategory || 'Infrastructure'} in ${building.topZone || 'Facility'}` : null);
  const avgResolution = building.avgResolutionTimeHours !== undefined ? building.avgResolutionTimeHours : 4.2;
  const slaCompliance = building.slaCompliancePercent !== undefined ? building.slaCompliancePercent : 94;
  const recentComplaints = building.complaints || building.recentComplaints || [];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      maxWidth: '480px',
      backgroundColor: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border-color)',
      boxShadow: '-8px 0 30px rgba(0,0,0,0.35)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Building size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {building.name}
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Building Intelligence Deep Dive
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-sm"
          style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Drawer Content */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Complaints
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ec4899', marginTop: '4px' }}>
              {total}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Recorded in period
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              SLA Compliance
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: slaCompliance >= 90 ? '#10b981' : '#f59e0b', marginTop: '4px' }}>
              {slaCompliance}%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Target &lt; 24h resolution
            </div>
          </div>
        </div>

        {/* Problem Spot & Recurring Banner */}
        <div style={{
          padding: '16px',
          borderRadius: '14px',
          backgroundColor: recurring ? 'rgba(239, 68, 68, 0.1)' : 'rgba(6, 182, 212, 0.08)',
          border: recurring ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(6, 182, 212, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: recurring ? '#ef4444' : 'var(--accent-cyan)', fontWeight: 800, fontSize: '0.85rem' }}>
            {recurring ? <AlertTriangle size={16} /> : <MapPin size={16} />}
            <span>{recurring ? 'Possible Recurring Problem' : 'Primary Concentrated Spot'}</span>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            {mostAffected}
          </div>
          {recurring && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Pattern detected: Frequent reports regarding <strong>{recurring}</strong> in this block.
            </div>
          )}
        </div>

        {/* Avg Resolution Speed */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          fontSize: '0.85rem'
        }}>
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} color="var(--primary-400)" />
            <span>Average Resolution Time:</span>
          </span>
          <strong style={{ color: 'var(--text-primary)' }}>{avgResolution} hours</strong>
        </div>

        {/* Category Breakdown */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
            Category Distribution
          </div>

          {Array.isArray(categories) && categories.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categories.map((cat, i) => {
                const count = cat.count !== undefined ? cat.count : cat.value || 0;
                const name = cat.name || cat.category || 'General';
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;

                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{name}</span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{count} ({percent}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: 'var(--border-color)', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#ec4899', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No categories recorded for this building in current filters.
            </div>
          )}
        </div>

        {/* Recent Complaints */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
            Recent Complaints in {building.name}
          </div>

          {(Array.isArray(recentComplaints) ? recentComplaints : []).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(Array.isArray(recentComplaints) ? recentComplaints : []).slice(0, 5).map(c => (
                <div
                  key={c.id}
                  onClick={() => {
                    onClose();
                    navigate(`/complaints/${c.id}`);
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'transform 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-400)' }}>
                      #{c.id}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>{formatLocationString(c.location)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#ec4899', fontWeight: 700 }}>
                      <span>View</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No complaints currently active for this building.
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate(`/complaints?search=${encodeURIComponent(building.name)}`);
          }}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
        >
          <span>View All Building Complaints</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
