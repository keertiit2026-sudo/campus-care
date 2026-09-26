import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ComplaintCard } from './ComplaintCard';
import { CATEGORIES, PRIORITIES, STATUSES } from '../../data/categories';
import { DEPARTMENTS } from '../../data/departments';
import { CategoryBadge, PriorityBadge, StatusBadge, CategoryIcon } from '../common/Badge';
import { formatLocationString } from '../../utils/intelligenceEngine';
import { 
  Search, Filter, LayoutGrid, Table, ArrowUpDown, 
  PlusCircle, RefreshCw, AlertCircle, CheckCircle2, ChevronRight, Download
} from 'lucide-react';

export const ComplaintList = ({ customTitle, onlyMyComplaints = false }) => {
  const navigate = useNavigate();
  const {
    complaints,
    currentPersona,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    categoryFilter,
    setCategoryFilter,
    viewMode,
    setViewMode,
    openModal
  } = useApp();

  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'priority' | 'status'

  // Base pool of complaints: either only the logged-in student's complaints or all campus complaints
  const baseComplaints = useMemo(() => {
    if (!onlyMyComplaints) return complaints || [];
    return (complaints || []).filter(item => {
      if (!item) return false;
      const isMy = 
        (item.student?.id && currentPersona?.id && String(item.student.id) === String(currentPersona.id)) ||
        (item.student?.email && currentPersona?.email && item.student.email.toLowerCase() === currentPersona.email.toLowerCase()) ||
        (item.student?.studentId && currentPersona?.studentId && item.student.studentId.toLowerCase() === currentPersona.studentId.toLowerCase()) ||
        (item.studentId && currentPersona?.studentId && item.studentId.toLowerCase() === currentPersona.studentId.toLowerCase());
      return isMy;
    });
  }, [complaints, onlyMyComplaints, currentPersona]);

  // Filter complaints within the base pool
  const filteredComplaints = useMemo(() => {
    return baseComplaints.filter(item => {
      if (!item) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        const matchId = (item.id || '').toLowerCase().includes(q);
        const matchLoc = formatLocationString(item.location).toLowerCase().includes(q);
        const matchCat = (item.category || '').toLowerCase().includes(q);
        const matchStudent = (item.student?.name || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchId && !matchLoc && !matchCat && !matchStudent) {
          return false;
        }
      }

      // Status Filter
      if (statusFilter !== 'all' && (item.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Priority Filter
      if (priorityFilter !== 'all' && (item.priority || '').toLowerCase() !== priorityFilter.toLowerCase()) {
        return false;
      }

      // Category Filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'priority') {
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      if (sortBy === 'status') {
        return (a.status || '').localeCompare(b.status || '');
      }
      return 0;
    });
  }, [baseComplaints, searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {customTitle || (onlyMyComplaints ? 'My Reported Complaints' : 'Campus Complaints Hub')}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {onlyMyComplaints
              ? `Showing ${filteredComplaints.length} of ${baseComplaints.length} ticket${baseComplaints.length === 1 ? '' : 's'} reported by you`
              : `Showing ${filteredComplaints.length} of ${complaints.length} total campus records`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* View mode toggle */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-tertiary)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                background: viewMode === 'cards' ? 'var(--primary-600)' : 'transparent',
                color: viewMode === 'cards' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Card Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? 'var(--primary-600)' : 'transparent',
                color: viewMode === 'table' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Table View"
            >
              <Table size={16} />
            </button>
          </div>

          {currentPersona?.role === 'student' ? (
            <button
              onClick={() => navigate('/complaints/new')}
              className="btn btn-primary"
              style={{ gap: '6px' }}
            >
              <PlusCircle size={18} />
              <span>New Complaint</span>
            </button>
          ) : (
            <button
              onClick={() => openModal('export')}
              className="btn btn-secondary"
              style={{ gap: '6px' }}
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Slider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        paddingTop: '2px',
        width: '100%',
        WebkitOverflowScrolling: 'touch'
      }}>
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          style={{
            padding: '7px 16px',
            borderRadius: 'var(--radius-full)',
            border: categoryFilter === 'all' ? '1.5px solid var(--primary-500)' : '1px solid var(--border-color)',
            backgroundColor: categoryFilter === 'all' ? 'var(--primary-500)' : 'var(--bg-card)',
            color: categoryFilter === 'all' ? '#ffffff' : 'var(--text-secondary)',
            fontSize: '0.825rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            boxShadow: categoryFilter === 'all' ? '0 4px 12px rgba(236, 72, 153, 0.28)' : 'none',
            transition: 'all var(--transition-fast)'
          }}
        >
          All Categories ({baseComplaints.length})
        </button>

        {CATEGORIES.map(cat => {
          const count = baseComplaints.filter(c => c.category === cat.id).length;
          const isSelected = categoryFilter === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(isSelected ? 'all' : cat.id)}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                border: isSelected ? `1.5px solid ${cat.color}` : '1px solid var(--border-color)',
                backgroundColor: isSelected ? `${cat.color}20` : 'var(--bg-card)',
                color: isSelected ? cat.color : 'var(--text-secondary)',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: isSelected ? '0 4px 12px rgba(236, 72, 153, 0.15)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              <CategoryIcon iconName={cat.icon} size={14} />
              <span>{cat.name}</span>
              <span style={{
                opacity: 0.85,
                fontSize: '0.72rem',
                backgroundColor: isSelected ? `${cat.color}30` : 'rgba(0,0,0,0.06)',
                padding: '2px 6px',
                borderRadius: '10px'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Controls Row */}
      <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-control"
              style={{ padding: '6px 10px', fontSize: '0.85rem', width: 'auto', minWidth: '130px' }}
            >
              <option value="all">All Statuses</option>
              {STATUSES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-control"
              style={{ padding: '6px 10px', fontSize: '0.85rem', width: 'auto', minWidth: '120px' }}
            >
              <option value="all">All Priorities</option>
              {PRIORITIES.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--accent-rose)', fontSize: '0.8rem' }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowUpDown size={15} color="var(--text-muted)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-control"
            style={{ padding: '6px 10px', fontSize: '0.85rem', width: 'auto' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Highest Priority</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Complaint List Display */}
      {filteredComplaints.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: 'var(--primary-400)'
          }}>
            <AlertCircle size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
            No complaints found
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 20px auto', fontSize: '0.9rem' }}>
            {hasActiveFilters
              ? 'No tickets match your active search and filter criteria. Try resetting your filters.'
              : 'There are currently no complaints registered in this view.'}
          </p>
          {hasActiveFilters ? (
            <button onClick={clearAllFilters} className="btn btn-secondary btn-sm">
              Reset All Filters
            </button>
          ) : (
            <button onClick={() => navigate('/complaints/new')} className="btn btn-primary btn-sm">
              Create First Complaint
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards Grid View */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {filteredComplaints.map(complaint => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Ticket ID</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Complaint Title</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Category</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Priority</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Location</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Reported By</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map(c => {
                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/complaints/${c.id}`)}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--primary-400)' }}>
                      #{c.id}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '280px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.title}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <CategoryBadge categoryId={c.category} size="sm" />
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                      {formatLocationString(c.location)}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                      {c.student?.name || 'Student'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/complaints/${c.id}`);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px' }}
                      >
                        <span>View</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
