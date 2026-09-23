import React, { useState } from 'react';
import { 
  MapPin, AlertTriangle, CheckCircle2, Flame, Layers, 
  Filter, Eye, Sparkles, ArrowUpRight, Clock, ShieldCheck
} from 'lucide-react';
import { CATEGORIES, PRIORITIES } from '../../data/categories';

export const CampusHeatmap = ({ 
  heatmapData, 
  onSelectBuilding, 
  filters, 
  onFilterChange,
  isLoading = false 
}) => {
  const [hoveredBuilding, setHoveredBuilding] = useState(null);

  const buildings = heatmapData?.buildings || [];

  const getDensityTheme = (density) => {
    switch (density) {
      case 'high':
        return {
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.5)',
          glow: 'rgba(239, 68, 68, 0.35)',
          badgeBg: '#ef4444',
          badgeText: '#ffffff',
          color: '#ef4444',
          label: 'High Density Hotspot',
          pulse: true
        };
      case 'medium':
        return {
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.4)',
          glow: 'rgba(245, 158, 11, 0.25)',
          badgeBg: '#f59e0b',
          badgeText: '#ffffff',
          color: '#f59e0b',
          label: 'Moderate Load',
          pulse: false
        };
      default:
        return {
          bg: 'rgba(16, 185, 129, 0.08)',
          border: 'rgba(16, 185, 129, 0.25)',
          glow: 'transparent',
          badgeBg: 'rgba(16, 185, 129, 0.2)',
          badgeText: '#10b981',
          color: '#10b981',
          label: 'Nominal / Normal',
          pulse: false
        };
    }
  };

  return (
    <div className="glass-panel" style={{ borderRadius: '20px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Header & Controls Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)'
            }}>
              <MapPin size={18} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Interactive Campus Problem Heatmap</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 40px' }}>
            Real-time concentration of student maintenance requests & recurring infrastructure hotspots.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          {/* Time Range Pills */}
          <div style={{
            display: 'flex', background: 'var(--bg-secondary)', padding: '3px',
            borderRadius: '10px', border: '1px solid var(--border-color)'
          }}>
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'all', label: 'All Time' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => onFilterChange({ ...filters, timeRange: t.id })}
                style={{
                  border: 'none',
                  background: (filters.timeRange || '30d') === t.id ? 'var(--primary-500)' : 'transparent',
                  color: (filters.timeRange || '30d') === t.id ? '#ffffff' : 'var(--text-secondary)',
                  padding: '5px 12px',
                  borderRadius: '7px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={filters.category || 'all'}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority || 'all'}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent Only</option>
            <option value="high">High & Urgent</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Legend & Legend Indicator Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: 'rgba(255,255,255,0.02)',
        borderRadius: '12px', border: '1px solid var(--border-color)',
        marginBottom: '20px', fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Density Legend:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)' }} />
            <span>High Density (≥3 Active / Urgent)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <span>Moderate (1-2 Active)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span>Nominal / All Clear</span>
          </div>
        </div>

        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
          Click any building to open Deep-Dive Analysis
        </div>
      </div>

      {/* Interactive Campus Map Canvas Container */}
      <div style={{
        position: 'relative',
        minHeight: '440px',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(99, 102, 241, 0.05) 0%, rgba(15, 23, 42, 0.4) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '24px',
        boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Subtle Campus Grid & Blueprint Lines */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          borderRadius: '16px'
        }} />

        {/* Campus Pathways / Road Lines */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Main Central Boulevard */}
          <line x1="15%" y1="50%" x2="85%" y2="50%" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="8" strokeDasharray="10 6" />
          <line x1="50%" y1="15%" x2="50%" y2="85%" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="8" strokeDasharray="10 6" />
          {/* Connecting arteries */}
          <line x1="25%" y1="30%" x2="50%" y2="50%" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="3" />
          <line x1="75%" y1="30%" x2="50%" y2="50%" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="3" />
          <line x1="25%" y1="75%" x2="50%" y2="50%" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="3" />
          <line x1="75%" y1="75%" x2="50%" y2="50%" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="3" />
        </svg>

        {/* Campus Map Building Nodes Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          position: 'relative',
          zIndex: 2
        }}>
          {buildings.map((bld) => {
            const theme = getDensityTheme(bld.density);
            const isHovered = hoveredBuilding === bld.id;

            return (
              <div
                key={bld.id}
                onClick={() => onSelectBuilding(bld)}
                onMouseEnter={() => setHoveredBuilding(bld.id)}
                onMouseLeave={() => setHoveredBuilding(null)}
                style={{
                  background: isHovered ? 'var(--bg-secondary)' : theme.bg,
                  border: `1px solid ${isHovered ? 'var(--primary-400)' : theme.border}`,
                  borderRadius: '14px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isHovered ? 'translateY(-3px)' : 'none',
                  boxShadow: isHovered
                    ? `0 12px 24px -6px rgba(0, 0, 0, 0.4), 0 0 20px ${theme.glow}`
                    : `0 4px 12px rgba(0, 0, 0, 0.15), 0 0 10px ${theme.glow}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Top Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '5px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: 'var(--text-secondary)',
                      letterSpacing: '0.5px'
                    }}>
                      {bld.code}
                    </span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      {bld.name}
                    </h4>
                  </div>

                  {/* Density Status Tag */}
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '10px',
                    background: theme.badgeBg,
                    color: theme.badgeText,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: theme.pulse ? '0 0 10px rgba(239, 68, 68, 0.6)' : 'none'
                  }}>
                    {theme.pulse && <Flame size={12} />}
                    {bld.density === 'high' ? 'High Hotspot' : bld.density === 'medium' ? 'Moderate' : 'Nominal'}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {bld.description}
                </div>

                {/* Metrics Breakdown Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  textAlign: 'center',
                  marginBottom: '10px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Total</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {bld.totalCount}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Active</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: bld.activeCount > 0 ? '#f59e0b' : '#10b981' }}>
                      {bld.activeCount}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Urgent</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: bld.urgentCount > 0 ? '#ef4444' : 'var(--text-secondary)' }}>
                      {bld.urgentCount}
                    </div>
                  </div>
                </div>

                {/* Hotspot details footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.73rem',
                  color: 'var(--text-secondary)'
                }}>
                  <span>
                    Top Zone: <strong style={{ color: 'var(--text-primary)' }}>{bld.topZone}</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--primary-400)', fontWeight: 600 }}>
                    Details <ArrowUpRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
