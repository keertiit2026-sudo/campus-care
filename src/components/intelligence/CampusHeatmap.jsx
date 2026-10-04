import React, { useState } from 'react';
import { CATEGORIES, PRIORITIES } from '../../data/categories';
import { 
  MapPin, Filter, Layers, Flame, 
  Clock, ShieldAlert, Sparkles, AlertTriangle, Eye, RefreshCw 
} from 'lucide-react';

export const CampusHeatmap = ({ 
  buildings = [], 
  selectedBuilding, 
  onSelectBuilding, 
  filters, 
  onFilterChange,
  isLoading = false 
}) => {
  const [activeViewMode, setActiveViewMode] = useState('grid'); // 'grid' | 'visual'

  const getDensityColor = (density, count) => {
    if (count === 0) return { bg: 'rgba(100, 116, 139, 0.1)', border: 'rgba(100, 116, 139, 0.25)', text: '#94a3b8', badge: 'bg-slate' };
    if (density === 'high' || count >= 3) return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#ef4444', badge: 'bg-red', label: '🔴 High Density' };
    if (density === 'medium' || count === 2) return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#f59e0b', badge: 'bg-amber', label: '🟠 Medium' };
    return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#10b981', badge: 'bg-emerald', label: '🟢 Low' };
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
          }}>
            <Flame size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Campus Problem Heatmap</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
                Live Density
              </span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Spatial complaint concentration across campus buildings and laboratories
            </p>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
            <span>High (3+)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
            <span>Medium (2)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            <span>Low (1)</span>
          </div>
        </div>
      </div>

      {/* Filter Bar (Period, Category, Priority) */}
      <div style={{
        padding: '14px 16px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          <Filter size={14} />
          <span>Filters:</span>
        </div>

        {/* Time Period Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: '90d', label: 'Last 90 Days' },
            { id: 'all', label: 'All Time' }
          ].map(p => {
            const isActive = (filters.period || '30d') === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onFilterChange({ ...filters, period: p.id })}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? '1px solid #ec4899' : '1px solid var(--border-color)',
                  backgroundColor: isActive ? 'rgba(236, 72, 153, 0.15)' : 'var(--bg-card)',
                  color: isActive ? '#ec4899' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div style={{ height: '18px', width: '1px', backgroundColor: 'var(--border-color)' }} />

        {/* Category Dropdown */}
        <select
          value={filters.category || 'all'}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
          className="input-control"
          style={{ width: 'auto', padding: '5px 10px', fontSize: '0.78rem', height: '32px' }}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Priority Dropdown */}
        <select
          value={filters.priority || 'all'}
          onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
          className="input-control"
          style={{ width: 'auto', padding: '5px 10px', fontSize: '0.78rem', height: '32px' }}
        >
          <option value="all">All Priorities</option>
          {PRIORITIES.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {(filters.category !== 'all' || filters.priority !== 'all' || filters.period !== '30d') && (
          <button
            type="button"
            onClick={() => onFilterChange({ period: '30d', category: 'all', priority: 'all' })}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.72rem', padding: '4px 8px', color: '#ef4444' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Buildings Interactive Grid */}
      {isLoading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
          <div>Computing spatial anomaly concentrations...</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '14px'
        }}>
          {(Array.isArray(buildings) ? buildings : (buildings?.buildings || [])).map(b => {
            const count = b.totalCount ?? b.complaintCount ?? b.activeCount ?? 0;
            const colors = getDensityColor(b.density, count);
            const isSelected = selectedBuilding && (selectedBuilding.id === b.id || selectedBuilding.name === b.name);

            return (
              <div
                key={b.id}
                onClick={() => onSelectBuilding(b)}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  backgroundColor: isSelected ? 'rgba(236, 72, 153, 0.12)' : 'var(--bg-card)',
                  border: isSelected ? '2px solid #ec4899' : `1px solid ${colors.border}`,
                  boxShadow: isSelected ? '0 6px 20px rgba(236, 72, 153, 0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Density indicator pill */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      backgroundColor: colors.bg,
                      color: colors.text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem'
                    }}>
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {b.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {b.topZone || b.zone || 'Campus Zone'}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '3px 8px',
                    borderRadius: '10px',
                    backgroundColor: colors.bg,
                    color: colors.text,
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}>
                    {count} {count === 1 ? 'ticket' : 'tickets'}
                  </div>
                </div>

                {/* Sub details */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div>
                    {b.topCategory ? (
                      <span>Primary: <strong>{b.topCategory}</strong></span>
                    ) : (
                      <span>No active issues</span>
                    )}
                  </div>

                  {b.recurringDetected && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      color: '#ef4444',
                      fontWeight: 700,
                      fontSize: '0.7rem'
                    }}>
                      <AlertTriangle size={11} />
                      <span>Recurring</span>
                    </span>
                  )}
                </div>

                {/* Most affected spot */}
                {(b.mostAffectedLocation || b.topZone) && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '6px' }}>
                    📍 Hotspot: <strong>{b.mostAffectedLocation || b.topZone}</strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
