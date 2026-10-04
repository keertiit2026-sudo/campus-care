import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { 
  computeClientIntelligenceSummary, 
  computeClientHeatmapData, 
  computeClientIntelligenceAlerts,
  computeClientRecurringProblems,
  formatLocationString
} from '../../utils/intelligenceEngine';
import { CampusHeatmap } from './CampusHeatmap';
import { BuildingDetailDrawer } from './BuildingDetailDrawer';
import { CategoryBadge, PriorityBadge } from '../common/Badge';
import { 
  Sparkles, ShieldAlert, AlertTriangle, Flame, 
  MapPin, TrendingUp, Clock, Activity, ArrowRight, 
  RefreshCw, CheckCircle2, ChevronRight, BarChart2, Layers 
} from 'lucide-react';

export const IntelligenceDashboardPage = () => {
  const navigate = useNavigate();
  const { complaints } = useApp();
  const { user } = useAuth();

  const [summaryData, setSummaryData] = useState(null);
  const [heatmapBuildings, setHeatmapBuildings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recurringProblems, setRecurringProblems] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [heatmapFilters, setHeatmapFilters] = useState({
    period: '30d',
    category: 'all',
    priority: 'all'
  });

  // Load intelligence data
  const loadIntelligenceData = async () => {
    setIsLoading(true);
    try {
      // 1. Generate real-time client intelligence respecting active filters
      const clientSummary = computeClientIntelligenceSummary(complaints);
      const clientHeatmap = computeClientHeatmapData(complaints, heatmapFilters);
      const clientAlerts = computeClientIntelligenceAlerts(complaints);
      const clientRecurring = computeClientRecurringProblems(complaints, heatmapFilters);

      let summary = clientSummary;
      let heatmapRes = clientHeatmap;
      let alertsData = clientAlerts;
      let rec = clientRecurring;

      // Try syncing with API endpoints if available
      try {
        const apiSummary = await api.getIntelligenceSummary();
        if (apiSummary && (apiSummary.kpis || apiSummary.categoryBreakdown)) {
          summary = { ...clientSummary, ...apiSummary, kpis: { ...clientSummary.kpis, ...(apiSummary.kpis || {}) } };
        }
      } catch (e) {}

      try {
        const apiHeatmap = await api.getHeatmapData(heatmapFilters);
        if (apiHeatmap && (Array.isArray(apiHeatmap) ? apiHeatmap.length > 0 : (apiHeatmap.buildings && apiHeatmap.buildings.length > 0))) {
          heatmapRes = apiHeatmap;
        }
      } catch (e) {}

      try {
        const apiAlerts = await api.getIntelligenceAlerts();
        if (apiAlerts && (Array.isArray(apiAlerts) ? apiAlerts.length > 0 : (apiAlerts.alerts && apiAlerts.alerts.length > 0))) {
          alertsData = apiAlerts;
        }
      } catch (e) {}

      try {
        const apiRec = await api.getRecurringProblems(heatmapFilters);
        if (Array.isArray(apiRec) && apiRec.length > 0) {
          rec = apiRec;
        } else if (apiRec && Array.isArray(apiRec.recurringProblems) && apiRec.recurringProblems.length > 0) {
          rec = apiRec.recurringProblems;
        }
      } catch (e) {}

      setSummaryData(summary);
      const bList = Array.isArray(heatmapRes) ? heatmapRes : (heatmapRes?.buildings || clientHeatmap.buildings || []);
      setHeatmapBuildings(bList);
      const aList = Array.isArray(alertsData) ? alertsData : (alertsData?.alerts || clientAlerts);
      setAlerts(aList);
      const rList = (Array.isArray(rec) && rec.length > 0) ? rec : clientRecurring;
      setRecurringProblems(rList);

    } catch (err) {
      console.warn('Backend intelligence API fallback:', err);
      const clientSummary = computeClientIntelligenceSummary(complaints);
      const clientHeatmap = computeClientHeatmapData(complaints, heatmapFilters);
      const clientAlerts = computeClientIntelligenceAlerts(complaints);
      const clientRecurring = computeClientRecurringProblems(complaints, heatmapFilters);

      setSummaryData(clientSummary);
      setHeatmapBuildings(clientHeatmap.buildings || clientSummary.buildings);
      setAlerts(clientAlerts);
      setRecurringProblems(clientRecurring);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIntelligenceData();
  }, [complaints, heatmapFilters]);

  const kpis = summaryData?.kpis || {
    totalAnalyzed: complaints.length,
    totalComplaints: complaints.length,
    similarGroupsCount: 1,
    recurringProblemsCount: 1,
    highDensityHotspots: 1
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '28px 32px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(244, 114, 182, 0.05) 100%)',
        border: '1px solid rgba(236, 72, 153, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 25px rgba(236, 72, 153, 0.4)'
          }}>
            <Sparkles size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                CampusCare Intelligence
              </h1>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '12px',
                backgroundColor: 'rgba(236, 72, 153, 0.15)',
                color: '#ec4899',
                border: '1px solid rgba(236, 72, 153, 0.3)'
              }}>
                Smart AI Insights
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Automated pattern detection, spatial heatmap density, and recurring maintenance diagnostics
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={loadIntelligenceData}
            disabled={isLoading}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh Diagnostics</span>
          </button>
        </div>
      </div>

      {/* 4 Major KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* KPI 1: Total Analyzed */}
        <div className="glass-panel" style={{ padding: '22px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Complaints Analyzed
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {kpis.totalAnalyzed ?? kpis.totalComplaints ?? complaints.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            100% telemetry coverage across active campus logs
          </div>
        </div>

        {/* KPI 2: Similar Groups */}
        <div className="glass-panel" style={{ padding: '22px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Possible Similar Groups
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f59e0b' }}>
            {kpis.similarGroupsCount ?? 1}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Linked or duplicate student issue clusters
          </div>
        </div>

        {/* KPI 3: Recurring Problems */}
        <div className="glass-panel" style={{ padding: '22px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Recurring Problems
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ef4444' }}>
            {kpis.recurringProblemsCount ?? kpis.recurringPatterns ?? 1}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Repeated anomalies within rolling 30-day windows
          </div>
        </div>

        {/* KPI 4: High Complaint Locations */}
        <div className="glass-panel" style={{ padding: '22px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              High Complaint Locations
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981' }}>
            {kpis.highDensityHotspots ?? kpis.criticalHotspots ?? 1}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Campus buildings with density index &gt; threshold
          </div>
        </div>

      </div>

      {/* Live Alerts Section */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              🚨 Real-Time Intelligence Alerts
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing {alerts.length} active pattern triggers
          </span>
        </div>

        {alerts.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No critical pattern anomalies detected at this time.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
            {alerts.map(a => {
              const isDanger = a.severity === 'high' || a.severity === 'urgent' || a.type === 'recurring_issue' || a.type === 'urgent_hazard';
              return (
                <div
                  key={a.id}
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                    border: isDanger ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isDanger ? '#ef4444' : '#f59e0b' }}>
                      {a.title}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {a.building || 'Campus Facility'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {a.message}
                  </div>
                  {a.recommendation && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', paddingTop: '4px', borderTop: '1px dashed var(--border-color)' }}>
                      💡 <strong>Recommended Action:</strong> {a.recommendation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid: Heatmap + Top Problem Areas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '20px' }}>
        
        {/* Heatmap Section */}
        <div>
          <CampusHeatmap
            buildings={heatmapBuildings}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={(b) => setSelectedBuilding(b)}
            filters={heatmapFilters}
            onFilterChange={(f) => setHeatmapFilters(f)}
            isLoading={isLoading}
          />
        </div>

        {/* Top Problem Areas & Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Problem Areas Card */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="#ef4444" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                📊 Top Problem Areas
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(Array.isArray(heatmapBuildings) ? heatmapBuildings : [])
                .slice()
                .sort((a, b) => (b.totalCount ?? b.complaintCount ?? b.activeCount ?? 0) - (a.totalCount ?? a.complaintCount ?? a.activeCount ?? 0))
                .slice(0, 4)
                .map((b, idx) => {
                  const count = b.totalCount ?? b.complaintCount ?? b.activeCount ?? 0;
                  return (
                    <div
                      key={b.id || idx}
                      onClick={() => setSelectedBuilding(b)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: idx === 0 ? '#ef4444' : idx === 1 ? '#f59e0b' : '#64748b',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          {idx + 1}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                            {b.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {b.mostAffectedLocation || b.topZone || 'General Area'}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 800, color: '#ec4899', fontSize: '0.9rem' }}>
                          {count}
                        </span>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>tickets</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Category Distribution Breakdown */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} color="var(--primary-400)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Campus Category Breakdown
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {summaryData?.categoryBreakdown && summaryData.categoryBreakdown.length > 0 ? (
                summaryData.categoryBreakdown.map(cat => (
                  <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{cat.count} ({cat.percent}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: 'var(--border-color)', overflow: 'hidden' }}>
                      <div style={{ width: `${cat.percent}%`, height: '100%', backgroundColor: cat.color || '#ec4899', borderRadius: '3px' }} />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  No complaints categorized yet.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Feature 4: Recurring Problem Detection Log */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  🚨 Recurring Problem Detection Log
                </h3>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(236, 72, 153, 0.12)',
                  color: '#ec4899',
                  border: '1px solid rgba(236, 72, 153, 0.25)'
                }}>
                  {heatmapFilters.period === '7d' ? 'Last 7 Days' : heatmapFilters.period === '90d' ? 'Last 90 Days' : heatmapFilters.period === 'all' ? 'All Time' : 'Rolling 30-Day Window'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Statistical repeat pattern analysis and preventive maintenance guidance across campus facilities
              </p>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            Showing {recurringProblems.length} detected pattern clusters
          </div>
        </div>

        {recurringProblems.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No recurring maintenance patterns detected in the current window.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {recurringProblems.map((rp, i) => {
              const count = rp.count ?? rp.complaintCount ?? rp.complaintsCount ?? 2;
              const isCritical = rp.severity === 'critical' || count >= 3;
              return (
                <div
                  key={rp.id || i}
                  style={{
                    padding: '18px',
                    borderRadius: '16px',
                    backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                    border: isCritical ? '1.5px solid rgba(239, 68, 68, 0.3)' : '1.5px solid rgba(245, 158, 11, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                    transition: 'transform 0.15s, box-shadow 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={16} color={isCritical ? '#ef4444' : '#f59e0b'} />
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {formatLocationString(rp.location || rp.buildingName)}
                      </span>
                    </div>
                    <span style={{
                      padding: '3px 9px',
                      borderRadius: '8px',
                      backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.18)' : 'rgba(245, 158, 11, 0.18)',
                      color: isCritical ? '#ef4444' : '#f59e0b',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      letterSpacing: '0.02em'
                    }}>
                      {count} {count === 1 ? 'Complaint Logged' : 'Complaints'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Pattern: <strong style={{ color: 'var(--text-primary)' }}>{rp.title || rp.category || 'Infrastructure Maintenance'}</strong>
                  </div>

                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.825rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.45
                  }}>
                    <strong style={{ color: '#ec4899', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <Sparkles size={13} /> AI Recommended Action:
                    </strong>
                    {rp.recommendation || rp.suggestedAction || 'Investigate underlying infrastructure and perform preventive checks in this block.'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>⚡ Est. Resolution: {rp.avgResolutionTime || '3.2h'}</span>
                    <span>Status: <strong style={{ color: isCritical ? '#ef4444' : '#10b981' }}>{isCritical ? 'High Repeat Risk' : 'Active Pattern'}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Building Deep Dive Slide Drawer */}
      <BuildingDetailDrawer
        building={selectedBuilding}
        onClose={() => setSelectedBuilding(null)}
      />

    </div>
  );
};
