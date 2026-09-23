import React from 'react';
import { MapPin, Tag, ArrowRightLeft } from 'lucide-react';

/**
 * StaffCard Component
 * Structured 3-zone layout:
 * - LEFT: Profile Avatar
 * - CENTER: Staff Name + Active Badge, Employee ID + Designation, Campus Zone + Category
 * - RIGHT: Open Tickets Badge + Replace Staff Button
 */
export const StaffCard = ({ staff, openTicketsCount = 0, onReplace, isAdmin = true }) => {
  // Format clean Employee ID without timestamp artifacts
  let rawEmpId = staff.employeeId || '';
  if (!rawEmpId || rawEmpId.startsWith('usr_staff_')) {
    rawEmpId = `EMP-2024-${staff.id ? staff.id.slice(-3) : '001'}`;
  }
  
  // Truncate long IDs if they exceed normal display length
  const displayEmpId = rawEmpId.length > 14 
    ? `${rawEmpId.slice(0, 11)}...` 
    : rawEmpId;

  const designation = staff.roleTitle || staff.role || 'Technician';

  return (
    <div className="cc-staff-card">
      {/* 1. LEFT ZONE: Avatar */}
      <div className="cc-staff-left">
        <img
          src={staff.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(staff.name)}`}
          alt={staff.name}
          className="cc-staff-avatar"
        />
      </div>

      {/* 2. CENTER ZONE: Details */}
      <div className="cc-staff-center">
        {/* Line 1: Name & Status Badge */}
        <div className="cc-staff-name-row">
          <span className="cc-staff-name" title={staff.name}>
            {staff.name}
          </span>
          <span className="cc-staff-badge-active">
            Active
          </span>
        </div>

        {/* Line 2: Clean Employee ID & Designation */}
        <div className="cc-staff-role-row">
          <span className="cc-staff-emp-id" title={rawEmpId}>
            {displayEmpId}
          </span>
          <span className="cc-staff-bullet">•</span>
          <span className="cc-staff-designation" title={designation}>
            {designation}
          </span>
        </div>

        {/* Line 3: Location & Category tags */}
        <div className="cc-staff-meta-row">
          {staff.campusZone && (
            <span className="cc-staff-meta-item">
              <MapPin size={11} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
              <span title={staff.campusZone}>{staff.campusZone}</span>
            </span>
          )}
          {staff.categoryResponsibility && (
            <span className="cc-staff-meta-item">
              <Tag size={11} color="var(--primary-400)" style={{ flexShrink: 0 }} />
              <span title={staff.categoryResponsibility}>{staff.categoryResponsibility}</span>
            </span>
          )}
        </div>
      </div>

      {/* 3. RIGHT ZONE: Tickets Count & Replace Staff Button */}
      <div className="cc-staff-right">
        {openTicketsCount > 0 && (
          <span
            className="cc-staff-tickets-badge"
            title={`${openTicketsCount} open complaint(s) assigned`}
          >
            ⚡ {openTicketsCount} Open Ticket{openTicketsCount === 1 ? '' : 's'}
          </span>
        )}

        {isAdmin && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onReplace) onReplace(staff);
            }}
            className="cc-staff-replace-btn"
            title={`Replace ${staff.name} if they leave the college`}
            id={`btn-replace-staff-${staff.id}`}
          >
            <ArrowRightLeft size={12} />
            <span>Replace Staff</span>
          </button>
        )}
      </div>
    </div>
  );
};
