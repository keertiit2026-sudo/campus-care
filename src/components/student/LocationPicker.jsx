import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, RefreshCw, CheckCircle2, AlertTriangle, Search, X, 
  Building, Layers, DoorOpen, AlignLeft, Check, Edit2, ChevronDown, 
  Globe, Compass, Sparkles, Bookmark, Navigation
} from 'lucide-react';
import { 
  CAMPUS_PRESETS, 
  detectCurrentLocation, 
  searchLocations, 
  savePreferredCampus, 
  getPreferredCampus,
  reverseGeocodeAddress
} from '../../utils/geoUtils';

const FLOOR_OPTIONS = [
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor',
  '5th Floor',
  'Basement',
  'Rooftop'
];

const COMMON_CAMPUS_BUILDINGS = [
  'Main Administrative Block',
  'Computer Science & IT Block',
  'Electronics & Electrical Engineering Block',
  'Mechanical & Civil Engineering Lab',
  'Central Academic Library',
  'Student Hostel Block A (Boys)',
  'Student Hostel Block B (Girls)',
  'Campus Health & Medical Center',
  'Central Canteen & Food Court',
  'Auditorium & Seminar Complex',
  'Sports Complex & Gymnasium',
  'Innovation & Research Lab'
];

export const LocationPicker = ({
  gpsLocation,
  setGpsLocation,
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
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  // Preferred campus state
  const [isSavedPreferred, setIsSavedPreferred] = useState(false);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
        setShowSearchDropdown(true);
      } catch (err) {
        console.warn('Location search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle GPS detection
  const handleDetectGPS = async () => {
    setGpsLoading(true);
    setGpsError('');
    setIsEditingAddress(false);

    try {
      const loc = await detectCurrentLocation();
      if (loc && loc.address) {
        setGpsLocation(loc);
        if (!buildingName.trim() && loc.buildingName) {
          setBuildingName(loc.buildingName);
        }
      } else {
        setGpsError('Could not auto-detect GPS. Select your Belagavi campus preset or search below.');
      }
    } catch (err) {
      setGpsError('GPS sensor timed out. Please select your campus preset or enter details manually.');
    } finally {
      setGpsLoading(false);
    }
  };

  // Handle selecting a preset
  const handleSelectPreset = (preset) => {
    const locObj = {
      address: preset.address,
      buildingName: preset.buildingName,
      city: preset.city,
      state: preset.state,
      latitude: preset.latitude,
      longitude: preset.longitude,
      accuracy: 15,
      source: 'preset',
      isHighAccuracy: true,
      isApproximateIp: false,
      timestamp: Date.now()
    };
    setGpsLocation(locObj);
    setBuildingName(preset.buildingName);
    setGpsError('');
    setShowSearchDropdown(false);
    setSearchQuery('');
  };

  // Handle selecting a search result
  const handleSelectSearchResult = (result) => {
    const locObj = {
      address: result.address,
      buildingName: result.buildingName,
      city: result.city,
      state: result.state,
      latitude: result.latitude,
      longitude: result.longitude,
      accuracy: 25,
      source: 'search',
      isHighAccuracy: true,
      isApproximateIp: false,
      timestamp: Date.now()
    };
    setGpsLocation(locObj);
    if (result.buildingName && result.buildingName !== 'Campus Area') {
      setBuildingName(result.buildingName);
    }
    setSearchQuery('');
    setShowSearchDropdown(false);
    setGpsError('');
  };

  // Handle saving preferred campus
  const handleToggleSavePreferred = () => {
    if (!isSavedPreferred && gpsLocation) {
      savePreferredCampus(gpsLocation);
      setIsSavedPreferred(true);
    } else {
      savePreferredCampus(null);
      setIsSavedPreferred(false);
    }
  };

  // Handle manual address edit save
  const handleSaveAddressEdit = () => {
    if (addressInput.trim()) {
      setGpsLocation(prev => ({
        ...(prev || {}),
        address: addressInput.trim(),
        buildingName: addressInput.split(',')[0]?.trim() || prev?.buildingName || 'Campus Facility',
        source: 'manual_edit'
      }));
    }
    setIsEditingAddress(false);
  };

  const isBelagavi = gpsLocation?.city?.toLowerCase().includes('belga') || 
                     gpsLocation?.city?.toLowerCase().includes('belag') ||
                     gpsLocation?.address?.toLowerCase().includes('belagavi') ||
                     gpsLocation?.address?.toLowerCase().includes('belgaum');

  const isIpMismatchWarning = gpsLocation?.isApproximateIp || 
    (!isBelagavi && gpsLocation?.city?.toLowerCase().includes('bengaluru') && !gpsLocation?.source?.includes('preset'));

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: error ? '1.5px solid #ef4444' : '1px solid var(--border-color)',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* 1. Header & Live GPS Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
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
            <MapPin size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Campus Geolocation & Floor Location
              </span>
              <span style={{ color: '#ef4444', fontWeight: 800 }}>*</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Pinpoints exact building, floor and coordinates for dispatching facility maintenance
            </p>
          </div>
        </div>

        {/* GPS Trigger Button */}
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={gpsLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: gpsLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            border: gpsLocation ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(236, 72, 153, 0.4)',
            backgroundColor: gpsLocation ? 'rgba(16, 185, 129, 0.1)' : 'rgba(236, 72, 153, 0.1)',
            color: gpsLocation ? '#10b981' : 'var(--primary-color)'
          }}
        >
          {gpsLoading ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              <span>Detecting precise location...</span>
            </>
          ) : gpsLocation ? (
            <>
              <CheckCircle2 size={15} color="#10b981" />
              <span>✓ Update GPS Location</span>
            </>
          ) : (
            <>
              <Navigation size={15} />
              <span>📍 Detect My GPS Location</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Detected Location Box (When Location is Present) */}
      {gpsLocation && gpsLocation.address && (
        <div style={{
          backgroundColor: isIpMismatchWarning ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
          border: isIpMismatchWarning ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '16px',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: '260px' }}>
              <div style={{
                marginTop: '2px',
                padding: '6px',
                borderRadius: '8px',
                backgroundColor: isIpMismatchWarning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: isIpMismatchWarning ? '#d97706' : '#10b981'
              }}>
                <MapPin size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: isIpMismatchWarning ? '#fef3c7' : '#dcfce7',
                    color: isIpMismatchWarning ? '#b45309' : '#15803d'
                  }}>
                    {isIpMismatchWarning ? '🌐 ISP Gateway Detected' : '📍 Active Campus Location'}
                  </span>

                  {gpsLocation.city && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--bg-tertiary)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)'
                    }}>
                      🏙️ {gpsLocation.city}
                    </span>
                  )}

                  {gpsLocation.latitude && gpsLocation.longitude && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      ({Number(gpsLocation.latitude).toFixed(4)}° N, {Number(gpsLocation.longitude).toFixed(4)}° E)
                    </span>
                  )}
                </div>

                {/* Editable / Readonly Address String */}
                {isEditingAddress ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <input
                      type="text"
                      className="input-control"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="Type custom campus location / address..."
                      style={{ fontSize: '0.85rem', padding: '6px 12px', height: '36px' }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveAddressEdit}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '6px 14px', height: '36px', fontSize: '0.8rem' }}
                    >
                      <Check size={14} />
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '6px 10px', height: '36px' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {gpsLocation.address}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions for detected address */}
            {!isEditingAddress && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setAddressInput(gpsLocation.address || '');
                    setIsEditingAddress(true);
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.75rem', padding: '4px 8px', color: 'var(--text-secondary)' }}
                  title="Edit address text"
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGpsLocation(null);
                    setIsEditingAddress(false);
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.75rem', padding: '4px 8px', color: '#ef4444' }}
                  title="Clear location"
                >
                  <X size={13} />
                  <span>Clear</span>
                </button>
              </div>
            )}
          </div>

          {/* ISP Mismatch / Belagavi Note */}
          {isIpMismatchWarning && (
            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px dashed rgba(245, 158, 11, 0.5)',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.8rem',
              color: '#92400e'
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Notice:</strong> Your internet router ISP gateway is in Bengaluru. If you are physically at the <strong>Belagavi Campus</strong>, please tap one of the Belagavi presets below or search your campus building!
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message if GPS failed */}
      {gpsError && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.825rem',
          color: '#ef4444'
        }}>
          <AlertTriangle size={16} />
          <span>{gpsError}</span>
        </div>
      )}

      {/* 3. Quick Campus Presets (Belagavi, VTU, KLE, GIT, etc.) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="var(--primary-color)" />
            <span>Quick Select Campus in Belagavi / Karnataka:</span>
          </label>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '8px'
        }}>
          {CAMPUS_PRESETS.map(preset => {
            const isSelected = gpsLocation?.address === preset.address || (gpsLocation?.latitude === preset.latitude && gpsLocation?.longitude === preset.longitude);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  border: isSelected ? '1.5px solid var(--primary-color)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'rgba(236, 72, 153, 0.12)' : 'var(--bg-tertiary)',
                  color: isSelected ? 'var(--primary-color)' : 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isSelected ? 'var(--primary-color)' : '#94a3b8',
                  flexShrink: 0
                }} />
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {preset.badge}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Live Search for Specific Campus Building / Street / City */}
      <div ref={searchContainerRef} style={{ position: 'relative' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Search size={14} />
          <span>Or Search Campus Area, Landmark or City in India:</span>
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="input-control"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
            placeholder="e.g. Belagavi, KLE Tech, VTU Belagavi, Tilakwadi, Udyambag, Main Canteen..."
            style={{ paddingLeft: '38px', fontSize: '0.85rem', height: '42px', borderRadius: '12px' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
          {isSearching && (
            <RefreshCw size={15} className="animate-spin" style={{ position: 'absolute', right: '12px', top: '13px', color: 'var(--primary-color)' }} />
          )}
          {searchQuery && !isSearching && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              style={{
                position: 'absolute',
                right: '10px',
                top: '10px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
            zIndex: 60,
            maxHeight: '260px',
            overflowY: 'auto',
            padding: '6px'
          }}>
            {searchResults.map((result, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectSearchResult(result)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background-color 0.15s',
                  fontSize: '0.85rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  padding: '6px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(236, 72, 153, 0.1)',
                  color: 'var(--primary-color)'
                }}>
                  <MapPin size={15} />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {result.buildingName || result.displayName.split(',')[0]}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {result.address}
                  </div>
                </div>
                {result.city && (
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)'
                  }}>
                    {result.city}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Precise Room / Floor / Building Specification Form */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        paddingTop: '6px',
        borderTop: '1px dashed var(--border-color)'
      }}>
        {/* Building Name with quick suggestions */}
        <div>
          <label className="input-label" style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building size={14} />
            <span>Building / Block Name <span style={{ color: '#ef4444' }}>*</span></span>
          </label>
          <input
            type="text"
            className="input-control"
            placeholder="e.g. CS Lab Complex, Main Admin Block..."
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            list="campus-building-suggestions"
            style={{ fontSize: '0.85rem' }}
          />
          <datalist id="campus-building-suggestions">
            {COMMON_CAMPUS_BUILDINGS.map((b, i) => (
              <option key={i} value={b} />
            ))}
          </datalist>
        </div>

        {/* Floor Level Dropdown */}
        <div>
          <label className="input-label" style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} />
            <span>Floor Level <span style={{ color: '#ef4444' }}>*</span></span>
          </label>
          <select
            className="input-control"
            value={floorLevel}
            onChange={(e) => setFloorLevel(e.target.value)}
            style={{ fontSize: '0.85rem', cursor: 'pointer' }}
          >
            {FLOOR_OPTIONS.map((fl, i) => (
              <option key={i} value={fl}>{fl}</option>
            ))}
          </select>
        </div>

        {/* Room / Spot Number */}
        <div>
          <label className="input-label" style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DoorOpen size={14} />
            <span>Room / Lab / Spot No.</span>
          </label>
          <input
            type="text"
            className="input-control"
            placeholder="e.g. Lab 304, Room 102, Corridor..."
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            style={{ fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Landmark / Extra Directions */}
      <div>
        <label className="input-label" style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlignLeft size={14} />
          <span>Specific Landmark / Directions (Optional)</span>
        </label>
        <input
          type="text"
          className="input-control"
          placeholder="e.g. Near Water Cooler on the left corridor, opposite Dean Office"
          value={additionalDetails}
          onChange={(e) => setAdditionalDetails(e.target.value)}
          style={{ fontSize: '0.85rem' }}
        />
      </div>

      {/* Remember Preferred Location Checkbox */}
      {gpsLocation && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
          <input
            type="checkbox"
            id="rememberCampusCheckbox"
            checked={isSavedPreferred}
            onChange={handleToggleSavePreferred}
            style={{ cursor: 'pointer', accentColor: 'var(--primary-color)' }}
          />
          <label htmlFor="rememberCampusCheckbox" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
            Remember this campus location for my future complaints
          </label>
        </div>
      )}
    </div>
  );
};
