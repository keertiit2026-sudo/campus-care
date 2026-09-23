import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { CampusHeatmap } from './CampusHeatmap';
import { BuildingDetailDrawer } from './BuildingDetailDrawer';
import { CategoryBadge, PriorityBadge } from '../common/Badge';
import { 
  Sparkles, Flame, Clock, RefreshCw, AlertTriangle, ShieldCheck, 
  MapPin, Activity, ShieldAlert, ArrowRight, Layers, Building2, CheckCircle2 
} from 'lucide-react';

export const IntelligenceDashboardPage = () => {
  const navigate = useNavigate();

  const [heatmapData, setHeatmapData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filters, setFilters] = useState({
    timeRange: '30d',
    category: 'all',
    priority: 'all'
  });

  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [hmData, alertsData, sumData] = await Promise.all([
        api.getHeatmapData(filters),
        api.getIntelligenceAlerts(),
        api.getIntelligenceSummary()
      ]);

      setHeatmapData(hmData);
      setAlerts(alertsData || []);
      setSummary(sumData);
    } catch (err) {
      console.error('Failed to load intelligence dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleSelectBuilding = (bld) => {
    setSelectedBuilding(bld);
    setIsDrawerOpen(true);
  };

  const kpis = summary?.kpis || heatmapData?.kpis || {
    totalComplaints: 0,
    activeComplaints: 0,
    criticalHotspots: 0,
    recurringPatterns: 0,
    urgentPendingCount: 0,
    healthyZonesCount: 0
  };

  const recurringList = heatmapData?.recurringIssuesList || summary?.recentRecurring || [];

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Executive Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary-500), #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
                CampusCare Intelligence Hub
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                AI-driven problem clustering, recurring pattern detection, and real-time infrastructure heatmap.
              </p>
            </div>
          </div>
        </div>

        {/* Live Refresh & Engine Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '6px 12px', borderRadius: '10px', fontSize: '0.78rem', color: '#10b981', fontWeight: 600
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
            <span>NLP Engine Active</span>
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="btn btn-secondary"
            style={{ gap: '6px' }}
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* Critical Hotspots */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Critical Hotspots
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <Flame size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: kpis.criticalHotspots > 0 ? '#ef4444' : 'var(--text-primary)', marginBottom: '4px' }}>
            {kpis.criticalHotspots}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Buildings requiring immediate triage
          </div>
        </div>

        {/* Recurring Issues */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Recurring Issue Clusters
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Activity size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginBottom: '4px' }}>
            {kpis.recurringPatterns || recurringList.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Repeat patterns in same room/zone
          </div>
        </div>

        {/* Urgent Triage Needed */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Urgent Safety / Outages
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ec4899', marginBottom: '4px' }}>
            {kpis.urgentPendingCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            High urgency tickets pending resolution
          </div>
        </div>

        {/* Nominal Zones */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Nominal Campus Zones
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginBottom: '4px' }}>
            {kpis.healthyZonesCount || (heatmapData?.buildings?.filter(b => b.density === 'low').length || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Zones operating with 0 active tickets
          </div>
        </div>
      </div>

      {/* Main Grid: Heatmap (Left/Top) + Live Intelligence Alerts (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Interactive Campus Heatmap */}
        <div>
          <CampusHeatmap
            heatmapData={heatmapData}
            onSelectBuilding={handleSelectBuilding}
            filters={filters}
            onFilterChange={setFilters}
            isLoading={isLoading}
          />
        </div>

        {/* Live Intelligence Alerts Feed */}
        <div className="glass-panel" style={{ borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                <AlertTriangle size={16} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Live Alerts Stream</h3>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>
              {alerts.length} Active
            </span>
          </div>

          {alerts.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 8px auto' }} />
              <div>All campus infrastructure operating smoothly. No active alerts.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto' }}>
              {alerts.map((alert) => {
                const isCritical = alert.severity === 'critical' || alert.severity === 'urgent';

                return (
                  <div
                    key={alert.id}
                    onClick={() => {
                      if (alert.complaintId) {
                        navigate(alert.actionUrl);
                      } else if (alert.buildingName) {
                        const target = heatmapData?.buildings?.find(b => b.name === alert.buildingName);
                        if (target) handleSelectBuilding(target);
                      }
                    }}
                    style={{
                      background: isCritical ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-secondary)',
                      border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)'}`,
                      borderRadius: '12px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px',
                        background: isCritical ? '#ef4444' : '#f59e0b', color: '#ffffff'
                      }}>
                        {alert.type === 'recurring_problem' ? 'RECURRING SPIKE' : alert.type === 'urgent_hazard' ? 'SAFETY HAZARD' : 'HIGH LOAD'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {alert.buildingName || 'Campus'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {alert.title}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {alert.message}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', color: 'var(--primary-400)', fontSize: '0.75rem', fontWeight: 600 }}>
                      <span>View details</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Recurring Patterns Table */}
      <div className="glass-panel" style={{ borderRadius: '20px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              Recurring Problem Detection Log
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Identifies chronic failures in specific rooms, labs, or buildings over rolling 30-day analysis windows.
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Threshold: ≥2 incidents in same location
          </span>
        </div>

        {recurringList.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            No recurring complaint clusters detected across campus.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                  <th style={{ padding: '10px 14px' }}>Campus Landmark & Zone</th>
                  <th style={{ padding: '10px 14px' }}>Category</th>
                  <th style={{ padding: '10px 14px' }}>Total / Open</th>
                  <th style={{ padding: '10px 14px' }}>Severity Tag</th>
                  <th style={{ padding: '10px 14px' }}>Detected Pattern Reasons</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recurringList.map((rec) => (
                  <tr
                    key={rec.id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {rec.buildingName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {rec.zone}
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <CategoryBadge categoryId={rec.category} size="sm" />
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{rec.totalComplaints}</strong> Total
                      <span style={{ color: 'var(--text-secondary)', margin: '0 4px' }}>•</span>
                      <span style={{ color: rec.openComplaints > 0 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                        {rec.openComplaints} Pending
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                        background: rec.severity === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: rec.severity === 'critical' ? '#ef4444' : '#f59e0b'
                      }}>
                        {rec.severity === 'critical' ? 'Critical Spike' : 'Warning Pattern'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px', maxWidth: '340px' }}>
                      <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                        {rec.reasons?.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          const target = heatmapData?.buildings?.find(b => b.name === rec.buildingName || b.id === rec.buildingId);
                          if (target) handleSelectBuilding(target);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 10px', gap: '4px' }}
                      >
                        <span>Inspect</span>
                        <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Building Detail Drawer Modal */}
      <BuildingDetailDrawer
        building={selectedBuilding}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedBuilding(null);
        }}
      />
    </div>
  );
};
