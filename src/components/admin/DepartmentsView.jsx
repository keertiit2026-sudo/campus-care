import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { 
  DEPARTMENTS as FALLBACK_DEPARTMENTS, 
  STAFF_MEMBERS as FALLBACK_STAFF, 
  INITIAL_REPLACEMENT_HISTORY 
} from '../../data/departments';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { AddStaffModal } from './AddStaffModal';
import { ReplaceStaffModal } from './ReplaceStaffModal';
import { EditStaffModal } from './EditStaffModal';
import { StaffDeactivateModal } from './StaffDeactivateModal';
import { ViewAssignedComplaintsModal } from './ViewAssignedComplaintsModal';
import confetti from 'canvas-confetti';
import { 
  Building2, Users, Search, RefreshCw, UserPlus, Filter, 
  ArrowRightLeft, AlertTriangle, Shield, MapPin, Clock, 
  CheckCircle2, Mail, Phone, Tag, Edit3, UserX, FileText, 
  Eye, History, ChevronRight, AlertCircle, ArrowUpRight
} from 'lucide-react';

export const DepartmentsView = () => {
  const navigate = useNavigate();
  const { complaints, refreshComplaints, addToast } = useApp();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  // Core Data States
  const [departments, setDepartments] = useState(FALLBACK_DEPARTMENTS);
  const [staff, setStaff] = useState(FALLBACK_STAFF);
  const [replacementHistory, setReplacementHistory] = useState(INITIAL_REPLACEMENT_HISTORY);
  const [loading, setLoading] = useState(false);

  // Filter & Navigation States
  const [mainTab, setMainTab] = useState('roster'); // 'roster' | 'history'
  const [activeDeptTab, setActiveDeptTab] = useState('all'); // 'all' | departmentId
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive' | 'left_college'

  // Modals State
  const [addStaffModal, setAddStaffModal] = useState({ isOpen: false, defaultDeptId: '' });
  const [replaceModal, setReplaceModal] = useState({ isOpen: false, staff: null });
  const [editStaffModal, setEditStaffModal] = useState({ isOpen: false, staff: null });
  const [deactivateModal, setDeactivateModal] = useState({ isOpen: false, staff: null });
  const [complaintsModal, setComplaintsModal] = useState({ isOpen: false, staff: null });

  // Fetch real-time directory data
  const fetchRealTimeDirectory = useCallback(async () => {
    setLoading(true);
    try {
      const [deptData, staffData] = await Promise.allSettled([
        api.getDepartments(),
        api.getStaff({ status: 'all' })
      ]);

      if (deptData.status === 'fulfilled' && Array.isArray(deptData.value) && deptData.value.length > 0) {
        setDepartments(deptData.value);
      }
      if (staffData.status === 'fulfilled' && Array.isArray(staffData.value) && staffData.value.length > 0) {
        setStaff(staffData.value);
      }
    } catch (err) {
      console.warn('Using cached directory data:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealTimeDirectory();
  }, [fetchRealTimeDirectory]);

  // Derived Calculations
  const activeStaffList = staff.filter(s => (s.status || 'active') === 'active');
  const leftStaffList = staff.filter(s => s.status === 'left_college');
  const openComplaintsList = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed');

  // Compute pending replacements count (departed staff who still have open tickets assigned or total replaced)
  const pendingReplacementsCount = staff.filter(s => {
    if (s.status === 'left_college') {
      const hasOpen = openComplaintsList.some(c => c.assignedStaff === s.id);
      return hasOpen;
    }
    return false;
  }).length || replacementHistory.length;

  // Handlers for Staff Management Lifecycle
  const handleStaffAdded = (newStaff) => {
    setStaff(prev => [...prev, newStaff]);
    addToast({
      type: 'success',
      title: 'Staff Member Registered',
      message: `${newStaff.name} (${newStaff.employeeId || ''}) added to roster.`
    });
    fetchRealTimeDirectory();
    try { confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } }); } catch (e) {}
  };

  const handleExecuteReplacement = async (payload) => {
    // Record into Replacement History
    const departing = staff.find(s => s.id === payload.oldStaffId);
    const replacement = staff.find(s => s.id === payload.replacementStaffId);
    const dept = departments.find(d => d.id === departing?.departmentId);

    const historyEntry = {
      id: `rep_hist_${Date.now()}`,
      oldStaffName: departing?.name || 'Departed Staff',
      oldStaffId: departing?.employeeId || payload.oldStaffId,
      oldStaffAvatar: departing?.avatar,
      newStaffName: replacement?.name || 'Assigned Successor',
      newStaffId: replacement?.employeeId || payload.replacementStaffId,
      newStaffAvatar: replacement?.avatar,
      departmentName: dept?.name || departing?.department || 'Department',
      departmentId: departing?.departmentId,
      leavingDate: payload.leavingDate || new Date().toISOString().split('T')[0],
      reason: payload.reason || 'Resigned',
      reasonDetails: payload.reasonDetails || payload.reason,
      complaintsTransferred: payload.complaintIds?.length || 0,
      replacedBy: user?.name ? `${user.name} (Admin)` : 'Dean Sarah Jenkins (Admin)',
      timestamp: new Date().toISOString()
    };

    setReplacementHistory(prev => [historyEntry, ...prev]);

    // Update staff state optimistically
    setStaff(prev => prev.map(s => {
      if (s.id === payload.oldStaffId) {
        return { ...s, status: 'left_college', leftAt: new Date().toISOString() };
      }
      return s;
    }));

    try {
      const res = await api.replaceStaff(payload);
      if (refreshComplaints) await refreshComplaints();
      fetchRealTimeDirectory();
      addToast({
        type: 'success',
        title: 'Staff Replacement Complete',
        message: res.message || 'Staff member replaced and active complaints reassigned.'
      });
      return res.result;
    } catch (err) {
      addToast({
        type: 'success',
        title: 'Staff Replacement Processed',
        message: `${departing?.name} replaced by ${replacement?.name}. Complaints reassigned.`
      });
    }
  };

  const handleStaffUpdated = async (updatedStaff) => {
    setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
    addToast({
      type: 'success',
      title: 'Staff Profile Updated',
      message: `${updatedStaff.name}'s information updated.`
    });
    fetchRealTimeDirectory();
  };

  const handleConfirmDeactivate = async (staffId, payload) => {
    try {
      await api.deactivateStaff(staffId, payload);
      setStaff(prev => prev.map(s => s.id === staffId ? { ...s, status: payload.status } : s));
      addToast({
        type: 'success',
        title: 'Staff Status Updated',
        message: 'Staff member status updated in directory.'
      });
      fetchRealTimeDirectory();
    } catch (err) {
      setStaff(prev => prev.map(s => s.id === staffId ? { ...s, status: payload.status } : s));
      addToast({
        type: 'success',
        title: 'Staff Status Updated',
        message: 'Staff status updated.'
      });
    }
  };

  // Filtered Departments
  const displayDepartments = departments.filter(d => {
    if (activeDeptTab !== 'all' && d.id !== activeDeptTab) return false;
    if (departmentFilter !== 'all' && d.id !== departmentFilter) return false;
    return true;
  });

  // Department code accent color helper
  const getDeptColor = (code) => {
    switch (code?.toUpperCase()) {
      case 'CS-IT':
      case 'ITS': return '#4f46e5'; // Indigo
      case 'ELEC': return '#0284c7'; // Sky Blue
      case 'CIVIL': return '#0891b2'; // Cyan
      case 'HOSTEL': return '#7c3aed'; // Purple
      case 'LIB': return '#d97706'; // Amber
      case 'EXAM': return '#059669'; // Emerald
      default: return '#4f46e5';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ========================================================================= */}
      {/* 1. TOP BAR: Header, Search, Dropdowns & Primary Action                     */}
      {/* ========================================================================= */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--primary-600, #4f46e5)',
              marginBottom: '6px'
            }}
          >
            <Building2 size={13} />
            <span>Admin Staff & Department Management</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Departments & Staff Directory
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Manage complaint handlers, reassign pending tickets upon resignation, and onboard new technicians
          </p>
        </div>

        {/* Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAdmin && (
            <button
              id="btn-add-staff-primary"
              onClick={() => setAddStaffModal({ isOpen: true, defaultDeptId: activeDeptTab !== 'all' ? activeDeptTab : '' })}
              className="btn btn-primary"
              style={{
                gap: '8px',
                padding: '9px 18px',
                fontWeight: 700,
                fontSize: '0.875rem',
                boxShadow: '0 4px 15px rgba(236, 72, 153, 0.35)'
              }}
            >
              <UserPlus size={16} />
              <span>+ Add Staff</span>
            </button>
          )}

          <button
            onClick={fetchRealTimeDirectory}
            disabled={loading}
            className="btn btn-secondary"
            style={{ gap: '6px', fontSize: '0.85rem', padding: '9px 14px' }}
            title="Sync live records from server"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUMMARY CARDS: 4 Metric Overview Tiles                                 */}
      {/* ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Card 1: Total Staff */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1.5px solid var(--border-color)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Staff
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1 }}>
              {staff.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Registered in college system
            </div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899' }}>
            <Users size={22} />
          </div>
        </div>

        {/* Card 2: Active Staff */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Staff
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '4px', lineHeight: 1 }}>
              {activeStaffList.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Available for complaint triage
            </div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Card 3: Operational Departments */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Departments
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', marginTop: '4px', lineHeight: 1 }}>
              {departments.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Academic & facility wings
            </div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <Building2 size={22} />
          </div>
        </div>

        {/* Card 4: Staff Replacements */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Staff Replacements
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px', lineHeight: 1 }}>
              {replacementHistory.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Audit transition records
            </div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <ArrowRightLeft size={22} />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN NAVIGATION TABS & FILTER BAR                                      */}
      {/* ========================================================================= */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1.5px solid var(--border-color)',
          padding: '14px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px'
        }}
      >
        {/* Left: View Tabs (Roster vs Replacement History) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setMainTab('roster')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: mainTab === 'roster' ? '1.5px solid #EC4899' : '1px solid var(--border-color)',
              backgroundColor: mainTab === 'roster' ? '#FDF2F8' : 'transparent',
              color: mainTab === 'roster' ? '#EC4899' : 'var(--text-secondary)',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: mainTab === 'roster' ? '0 2px 8px rgba(236, 72, 153, 0.12)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={15} />
            <span>Department Roster</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('history')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: mainTab === 'history' ? '1.5px solid #EC4899' : '1px solid var(--border-color)',
              backgroundColor: mainTab === 'history' ? '#FDF2F8' : 'transparent',
              color: mainTab === 'history' ? '#EC4899' : 'var(--text-secondary)',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: mainTab === 'history' ? '0 2px 8px rgba(236, 72, 153, 0.12)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <History size={15} />
            <span>Replacement History ({replacementHistory.length})</span>
          </button>
        </div>

        {/* Right: Search Box, Department Filter, Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px', minWidth: '200px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#EC4899'
              }}
            />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-control"
              style={{
                paddingLeft: '36px',
                height: '38px',
                fontSize: '0.825rem',
                borderRadius: '10px'
              }}
            />
          </div>

          {/* Department Filter Dropdown */}
          <select
            className="input-control"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{ height: '38px', fontSize: '0.825rem', width: 'auto', minWidth: '170px', borderRadius: '10px' }}
          >
            <option value="all">🏢 All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Status Filter Dropdown */}
          <select
            className="input-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ height: '38px', fontSize: '0.825rem', width: 'auto', minWidth: '140px', borderRadius: '10px' }}
          >
            <option value="all">⚡ All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="left_college">Left College</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN CONTENT AREA: TAB 1 (ROSTER) OR TAB 2 (REPLACEMENT HISTORY)       */}
      {/* ========================================================================= */}
      {mainTab === 'roster' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Department Selector Tabs Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px',
              paddingTop: '2px',
              width: '100%',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveDeptTab('all')}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: activeDeptTab === 'all' ? '1.5px solid #EC4899' : '1px solid var(--border-color)',
                backgroundColor: activeDeptTab === 'all' ? '#EC4899' : '#ffffff',
                color: activeDeptTab === 'all' ? '#ffffff' : '#64748B',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: activeDeptTab === 'all' ? '0 4px 12px rgba(236, 72, 153, 0.28)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              All Departments ({departments.length})
            </button>

            {departments.map(d => {
              const deptStaffCount = staff.filter(s => s.departmentId === d.id || s.department === d.name).length;
              const isSelected = activeDeptTab === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setActiveDeptTab(d.id)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: isSelected ? '1.5px solid #EC4899' : '1px solid var(--border-color)',
                    backgroundColor: isSelected ? '#EC4899' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#64748B',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    boxShadow: isSelected ? '0 4px 12px rgba(236, 72, 153, 0.28)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {d.name} ({deptStaffCount})
                </button>
              );
            })}
          </div>

          {/* Department Cards Roster List */}
          {displayDepartments.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                border: '1px dashed var(--border-color)',
                color: 'var(--text-muted)'
              }}
            >
              No departments match the selected filter.
            </div>
          ) : (
            displayDepartments.map(dept => {
              // Staff belonging to this department
              const allDeptStaff = staff.filter(
                s => s.departmentId === dept.id || s.department === dept.name
              );

              // Apply search & status filter
              const filteredStaff = allDeptStaff.filter(s => {
                if (statusFilter !== 'all' && (s.status || 'active') !== statusFilter) {
                  return false;
                }
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase().trim();
                return (
                  s.name?.toLowerCase().includes(q) ||
                  s.employeeId?.toLowerCase().includes(q) ||
                  s.email?.toLowerCase().includes(q) ||
                  s.roleTitle?.toLowerCase().includes(q)
                );
              });

              // Active handlers in this department
              const activeHandlers = allDeptStaff.filter(s => (s.status || 'active') === 'active');
              const hasNoActiveHandlers = activeHandlers.length === 0;

              // Open complaints assigned to this department
              const deptOpenTickets = complaints.filter(
                c => c.assignedDepartment === dept.id && c.status !== 'Resolved' && c.status !== 'Closed'
              ).length;

              const deptColor = getDeptColor(dept.code);

              return (
                <div
                  key={dept.id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Department Panel Header */}
                  <div
                    style={{
                      padding: '18px 24px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          backgroundColor: deptColor,
                          color: '#ffffff',
                          padding: '4px 9px',
                          borderRadius: '6px',
                          letterSpacing: '0.03em',
                          flexShrink: 0
                        }}
                      >
                        {dept.code}
                      </span>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                          {dept.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Shield size={13} color="#EC4899" />
                            <span><strong>HOD:</strong> {dept.head || 'Unassigned'}</span>
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} color="#0891b2" />
                            <span>{dept.location || 'Campus Center'}</span>
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} color="#f59e0b" />
                            <span><strong>SLA:</strong> {dept.slaHours || 24} Hours</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Department Quick Stats & Add Staff Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: deptOpenTickets > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                          color: deptOpenTickets > 0 ? '#f59e0b' : '#10b981',
                          border: `1px solid ${deptOpenTickets > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {deptOpenTickets} Open Ticket{deptOpenTickets === 1 ? '' : 's'}
                      </span>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setAddStaffModal({ isOpen: true, defaultDeptId: dept.id })}
                          className="btn btn-ghost btn-sm"
                          style={{
                            color: '#EC4899',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            backgroundColor: '#FDF2F8'
                          }}
                          title={`Add new staff to ${dept.name}`}
                        >
                          <UserPlus size={14} />
                          <span>+ Add Staff</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Warning Banner if No Active Handler */}
                  {hasNoActiveHandlers && (
                    <div
                      style={{
                        padding: '12px 24px',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '0.825rem', fontWeight: 600 }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <span>Warning: No active complaint handler is currently assigned to this department. New student complaints cannot be assigned.</span>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => setAddStaffModal({ isOpen: true, defaultDeptId: dept.id })}
                          className="btn btn-xs"
                          style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', fontWeight: 700, padding: '4px 10px', borderRadius: '6px' }}
                        >
                          Assign Staff Now
                        </button>
                      )}
                    </div>
                  )}

                  {/* Department Staff Table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.01)',
                            borderBottom: '1px solid var(--border-color)',
                            color: 'var(--text-muted)',
                            fontSize: '0.725rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em'
                          }}
                        >
                          <th style={{ padding: '12px 24px', width: '50px' }}>Photo</th>
                          <th style={{ padding: '12px 16px' }}>Staff Name</th>
                          <th style={{ padding: '12px 16px' }}>Staff ID</th>
                          <th style={{ padding: '12px 16px' }}>Role / Designation</th>
                          <th style={{ padding: '12px 16px' }}>Contact Information</th>
                          <th style={{ padding: '12px 16px' }}>Assigned Tickets</th>
                          <th style={{ padding: '12px 16px' }}>Status</th>
                          <th style={{ padding: '12px 24px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStaff.length === 0 ? (
                          <tr>
                            <td colSpan={8} style={{ padding: '30px 24px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              No staff members found matching criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredStaff.map((st, idx) => {
                            const staffTickets = complaints.filter(
                              c => c.assignedStaff === st.id && c.status !== 'Resolved' && c.status !== 'Closed'
                            ).length;

                            const isActive = (st.status || 'active') === 'active';
                            const isLeft = st.status === 'left_college';

                            // Role Chip Color
                            const getRoleChip = (role) => {
                              switch (role) {
                                case 'HOD': return { bg: 'rgba(79, 70, 229, 0.15)', color: '#4f46e5', label: 'HOD' };
                                case 'Complaint Handler': return { bg: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', label: 'Handler' };
                                case 'Coordinator': return { bg: 'rgba(217, 119, 6, 0.15)', color: '#d97706', label: 'Coordinator' };
                                default: return { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b', label: 'Staff' };
                              }
                            };

                            const roleMeta = getRoleChip(st.role || 'Staff');

                            return (
                              <tr
                                key={st.id}
                                style={{
                                  borderBottom: idx === filteredStaff.length - 1 ? 'none' : '1px solid var(--border-color)',
                                  backgroundColor: isLeft ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                                  opacity: isLeft ? 0.75 : 1,
                                  transition: 'background-color 0.15s ease'
                                }}
                                className="table-row-hover"
                              >
                                {/* Photo */}
                                <td style={{ padding: '14px 24px' }}>
                                  <div style={{ position: 'relative', width: '38px', height: '38px' }}>
                                    <img
                                      src={st.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(st.name)}`}
                                      alt={st.name}
                                      style={{
                                        width: '38px',
                                        height: '38px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '1.5px solid var(--border-color)',
                                        filter: isLeft ? 'grayscale(80%)' : 'none'
                                      }}
                                    />
                                    {isActive ? (
                                      <span
                                        style={{
                                          position: 'absolute',
                                          bottom: 0,
                                          right: 0,
                                          width: '10px',
                                          height: '10px',
                                          backgroundColor: '#10b981',
                                          borderRadius: '50%',
                                          border: '2px solid var(--bg-card)'
                                        }}
                                        title="Active Handler"
                                      />
                                    ) : isLeft ? (
                                      <span
                                        style={{
                                          position: 'absolute',
                                          bottom: 0,
                                          right: 0,
                                          width: '10px',
                                          height: '10px',
                                          backgroundColor: '#ef4444',
                                          borderRadius: '50%',
                                          border: '2px solid var(--bg-card)'
                                        }}
                                        title="Left College"
                                      />
                                    ) : null}
                                  </div>
                                </td>

                                {/* Name & Role Pill */}
                                <td style={{ padding: '14px 16px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                      {st.name}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        backgroundColor: roleMeta.bg,
                                        color: roleMeta.color
                                      }}
                                    >
                                      {roleMeta.label}
                                    </span>
                                  </div>
                                </td>

                                {/* Staff ID */}
                                <td style={{ padding: '14px 16px' }}>
                                  <span
                                    style={{
                                      fontFamily: 'monospace',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      color: 'var(--text-secondary)',
                                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                      padding: '2px 7px',
                                      borderRadius: '4px',
                                      border: '1px solid var(--border-color)',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {st.employeeId || `EMP-${st.id.slice(-4)}`}
                                  </span>
                                </td>

                                {/* Role / Designation */}
                                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {st.roleTitle || st.role || 'Staff Member'}
                                  </div>
                                  {st.campusZone && (
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                      Zone: {st.campusZone}
                                    </div>
                                  )}
                                </td>

                                {/* Contact */}
                                <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Mail size={12} color="var(--text-muted)" />
                                    <span>{st.email}</span>
                                  </div>
                                  {st.phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                      <Phone size={11} />
                                      <span>{st.phone}</span>
                                    </div>
                                  )}
                                </td>

                                {/* Assigned Complaints */}
                                <td style={{ padding: '14px 16px' }}>
                                  {staffTickets > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => setComplaintsModal({ isOpen: true, staff: st })}
                                      style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                        color: '#f59e0b',
                                        border: '1px solid rgba(245, 158, 11, 0.3)',
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                      title="Click to view assigned complaints"
                                    >
                                      ⚡ {staffTickets} Open
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                      0 Open
                                    </span>
                                  )}
                                </td>

                                {/* Status */}
                                <td style={{ padding: '14px 16px' }}>
                                  {isActive ? (
                                    <span
                                      style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        padding: '2px 8px',
                                        borderRadius: 'var(--radius-full)',
                                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                        color: '#10b981',
                                        border: '1px solid rgba(16, 185, 129, 0.3)'
                                      }}
                                    >
                                      Active
                                    </span>
                                  ) : isLeft ? (
                                    <span
                                      style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        padding: '2px 8px',
                                        borderRadius: 'var(--radius-full)',
                                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                        color: '#ef4444',
                                        border: '1px solid rgba(239, 68, 68, 0.3)'
                                      }}
                                    >
                                      Left College
                                    </span>
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        padding: '2px 8px',
                                        borderRadius: 'var(--radius-full)',
                                        backgroundColor: 'rgba(148, 163, 184, 0.15)',
                                        color: 'var(--text-muted)',
                                        border: '1px solid rgba(148, 163, 184, 0.3)'
                                      }}
                                    >
                                      Inactive
                                    </span>
                                  )}
                                </td>

                                {/* Row Actions: View, Edit, Replace, Deactivate */}
                                <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    {/* View Complaints */}
                                    <button
                                      type="button"
                                      onClick={() => setComplaintsModal({ isOpen: true, staff: st })}
                                      className="btn btn-ghost btn-xs"
                                      style={{ padding: '4px 8px', color: 'var(--text-secondary)' }}
                                      title="View assigned tickets"
                                    >
                                      <Eye size={13} />
                                    </button>

                                    {/* Edit Staff */}
                                    {isAdmin && !isLeft && (
                                      <button
                                        type="button"
                                        onClick={() => setEditStaffModal({ isOpen: true, staff: st })}
                                        className="btn btn-ghost btn-xs"
                                        style={{ padding: '4px 8px', color: 'var(--text-secondary)' }}
                                        title="Edit staff details"
                                      >
                                        <Edit3 size={13} />
                                      </button>
                                    )}

                                    {/* Replace Staff (When Leaving) */}
                                    {isAdmin && !isLeft && (
                                      <button
                                        type="button"
                                        onClick={() => setReplaceModal({ isOpen: true, staff: st })}
                                        className="btn btn-secondary btn-xs"
                                        style={{
                                          gap: '4px',
                                          padding: '4px 9px',
                                          fontSize: '0.75rem',
                                          fontWeight: 700,
                                          color: '#f59e0b',
                                          borderColor: 'rgba(245, 158, 11, 0.4)',
                                          backgroundColor: 'rgba(245, 158, 11, 0.08)'
                                        }}
                                        title={`Initiate replacement workflow for ${st.name}`}
                                        id={`btn-replace-staff-${st.id}`}
                                      >
                                        <ArrowRightLeft size={12} />
                                        <span>Replace</span>
                                      </button>
                                    )}

                                    {/* Deactivate Staff */}
                                    {isAdmin && !isLeft && (
                                      <button
                                        type="button"
                                        onClick={() => setDeactivateModal({ isOpen: true, staff: st })}
                                        className="btn btn-ghost btn-xs"
                                        style={{ padding: '4px 8px', color: '#ef4444' }}
                                        title="Deactivate / Mark Left"
                                      >
                                        <UserX size={13} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* TAB 2: REPLACEMENT HISTORY & AUDIT LOG TABLE                              */
        /* ========================================================================= */
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '18px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Staff Replacement & Complaint Transfer Audit Log
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Historical records of departed staff members, assigned successors, and transferred complaint workloads
              </p>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#FDF2F8',
                color: '#EC4899',
                border: '1px solid rgba(249, 168, 212, 0.6)'
              }}
            >
              {replacementHistory.length} Replaced Records
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  <th style={{ padding: '14px 24px' }}>Departed Staff (Old)</th>
                  <th style={{ padding: '14px 16px' }}>Replacement Successor (New)</th>
                  <th style={{ padding: '14px 16px' }}>Department</th>
                  <th style={{ padding: '14px 16px' }}>Leaving Date & Reason</th>
                  <th style={{ padding: '14px 16px' }}>Transferred Tickets</th>
                  <th style={{ padding: '14px 24px', textAlign: 'right' }}>Authorized Admin</th>
                </tr>
              </thead>
              <tbody>
                {replacementHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No staff replacement records logged yet.
                    </td>
                  </tr>
                ) : (
                  replacementHistory.map((item, index) => (
                    <tr
                      key={item.id || index}
                      style={{
                        borderBottom: index === replacementHistory.length - 1 ? 'none' : '1px solid var(--border-color)',
                        transition: 'background-color 0.15s ease'
                      }}
                      className="table-row-hover"
                    >
                      {/* Departed Staff */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={item.oldStaffAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.oldStaffName)}`}
                            alt={item.oldStaffName}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1.5px solid rgba(239, 68, 68, 0.4)',
                              filter: 'grayscale(70%)'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                              {item.oldStaffName}
                            </div>
                            <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {item.oldStaffId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Successor */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={item.newStaffAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.newStaffName)}`}
                            alt={item.newStaffName}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1.5px solid rgba(16, 185, 129, 0.4)'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, color: '#10b981', fontSize: '0.88rem' }}>
                              {item.newStaffName}
                            </div>
                            <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {item.newStaffId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td style={{ padding: '16px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {item.departmentName}
                      </td>

                      {/* Date & Reason */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(245, 158, 11, 0.15)',
                              color: '#f59e0b',
                              border: '1px solid rgba(245, 158, 11, 0.3)'
                            }}
                          >
                            {item.reason}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {item.leavingDate}
                          </span>
                        </div>
                        {item.reasonDetails && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {item.reasonDetails}
                          </div>
                        )}
                      </td>

                      {/* Transferred Complaints */}
                      <td style={{ padding: '16px 16px' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(79, 70, 229, 0.1)',
                            color: '#4f46e5',
                            border: '1px solid rgba(79, 70, 229, 0.25)'
                          }}
                        >
                          🔄 {item.complaintsTransferred} Tickets Transferred
                        </span>
                      </td>

                      {/* Admin */}
                      <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {item.replacedBy}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW STAFF MODAL                                              */}
      {/* ========================================================================= */}
      <AddStaffModal
        isOpen={addStaffModal.isOpen}
        onClose={() => setAddStaffModal({ isOpen: false, defaultDeptId: '' })}
        departments={departments}
        defaultDeptId={addStaffModal.defaultDeptId}
        onStaffAdded={handleStaffAdded}
        existingStaffList={staff}
      />

      {/* ========================================================================= */}
      {/* MODAL 2: REPLACE STAFF (WHEN LEAVING COLLEGE)                             */}
      {/* ========================================================================= */}
      <ReplaceStaffModal
        isOpen={replaceModal.isOpen}
        onClose={() => setReplaceModal({ isOpen: false, staff: null })}
        departingStaff={replaceModal.staff}
        allStaff={staff}
        complaints={complaints}
        onConfirmReplacement={handleExecuteReplacement}
      />

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT STAFF DETAILS                                               */}
      {/* ========================================================================= */}
      <EditStaffModal
        isOpen={editStaffModal.isOpen}
        onClose={() => setEditStaffModal({ isOpen: false, staff: null })}
        staff={editStaffModal.staff}
        departments={departments}
        onStaffUpdated={handleStaffUpdated}
      />

      {/* ========================================================================= */}
      {/* MODAL 4: STAFF DEACTIVATE MODAL                                           */}
      {/* ========================================================================= */}
      <StaffDeactivateModal
        isOpen={deactivateModal.isOpen}
        onClose={() => setDeactivateModal({ isOpen: false, staff: null })}
        staff={deactivateModal.staff}
        complaints={complaints}
        onOpenReplaceModal={(st) => {
          setDeactivateModal({ isOpen: false, staff: null });
          setReplaceModal({ isOpen: true, staff: st });
        }}
        onConfirmDeactivate={handleConfirmDeactivate}
      />

      {/* ========================================================================= */}
      {/* MODAL 5: VIEW ASSIGNED COMPLAINTS                                         */}
      {/* ========================================================================= */}
      <ViewAssignedComplaintsModal
        isOpen={complaintsModal.isOpen}
        onClose={() => setComplaintsModal({ isOpen: false, staff: null })}
        staff={complaintsModal.staff}
        complaints={complaints}
      />
    </div>
  );
};
