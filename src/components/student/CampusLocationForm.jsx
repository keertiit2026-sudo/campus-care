import React from 'react';
import { 
  Building, Layers, DoorOpen, AlignLeft, MapPin, 
  CheckCircle2 
} from 'lucide-react';

export const FLOOR_OPTIONS = [
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor',
  '5th Floor',
  'Basement',
  'Rooftop'
];

export const CampusLocationForm = ({
  buildingName,
  setBuildingName,
  floorLevel,
  setFloorLevel,
  roomNumber,
  setRoomNumber,
  additionalDetails,
  setAdditionalDetails,
  error
}) => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: error ? '1.5px solid #ef4444' : '1px solid var(--border-color)',
      borderRadius: '18px',
      padding: '22px',
      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      transition: 'border-color 0.2s ease'
    }}>
      {/* 1. Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
          }}>
            <Building size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                Campus Location & Area
              </span>
              <span style={{ color: '#ef4444', fontWeight: 800 }}>*</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Specify the building block, floor level, and room / spot for maintenance dispatch
            </p>
          </div>
        </div>

        {buildingName && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '20px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <CheckCircle2 size={13} />
            <span>Location Specified</span>
          </div>
        )}
      </div>

      {/* Primary Location Fields Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        {/* Building Name Input */}
        <div>
          <label className="input-label" style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <Building size={14} color="var(--primary-color)" />
            <span>Building / Block Name <span style={{ color: '#ef4444' }}>*</span></span>
          </label>
          <input
            type="text"
            className="input-control"
            placeholder="e.g. Enter building or block name..."
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            style={{
              fontSize: '0.86rem',
              borderColor: error ? '#ef4444' : undefined
            }}
          />
          {error && (
            <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
              {error}
            </span>
          )}
        </div>

        {/* Floor Level Dropdown */}
        <div>
          <label className="input-label" style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <Layers size={14} color="var(--primary-color)" />
            <span>Floor Level <span style={{ color: '#ef4444' }}>*</span></span>
          </label>
          <select
            className="input-control"
            value={floorLevel}
            onChange={(e) => setFloorLevel(e.target.value)}
            style={{ fontSize: '0.86rem', cursor: 'pointer' }}
          >
            {FLOOR_OPTIONS.map((f, i) => (
              <option key={i} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Room / Spot Number */}
        <div>
          <label className="input-label" style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <DoorOpen size={14} color="var(--primary-color)" />
            <span>Room / Lab / Spot No.</span>
          </label>
          <input
            type="text"
            className="input-control"
            placeholder="e.g. Lab 204, Room 102, Corridor..."
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            style={{ fontSize: '0.86rem' }}
          />
        </div>
      </div>

      {/* 4. Specific Landmark / Directions */}
      <div>
        <label className="input-label" style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
          <AlignLeft size={14} color="var(--text-muted)" />
          <span>Specific Landmark / Spot Description (Optional)</span>
        </label>
        <input
          type="text"
          className="input-control"
          placeholder="e.g. Opposite elevator, near water cooler on the left corridor"
          value={additionalDetails}
          onChange={(e) => setAdditionalDetails(e.target.value)}
          style={{ fontSize: '0.86rem' }}
        />
      </div>

      {/* 5. Live Formatted Preview Strip */}
      {buildingName && (
        <div style={{
          padding: '10px 14px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.8rem'
        }}>
          <MapPin size={15} color="var(--primary-color)" style={{ flexShrink: 0 }} />
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Resolved Campus Dispatch Location:</span>
          <strong style={{ color: 'var(--text-primary)' }}>
            {buildingName} → {floorLevel || 'Ground Floor'} {roomNumber ? `→ ${roomNumber}` : ''}
          </strong>
        </div>
      )}
    </div>
  );
};
