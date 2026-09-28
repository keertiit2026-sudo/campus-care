import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Navigation, Crosshair, MapPin, RefreshCw, CheckCircle2, 
  AlertTriangle, Layers, Building, DoorOpen, AlignLeft, Info
} from 'lucide-react';
import { reverseGeocodeAddress } from '../../utils/geoUtils';

// Belagavi Default Center (Belagavi City / Campus Zone)
const DEFAULT_BELAGAVI_LAT = 15.8497;
const DEFAULT_BELAGAVI_LON = 74.4977;

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

/**
 * Custom Pin DivIcon - Pink/Rose gradient pin with drop shadow
 */
const createCustomPinIcon = () => {
  return L.divIcon({
    className: 'custom-gps-pin-wrapper',
    html: `
      <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -100%);">
        <div style="
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #EC4899 0%, #E11D48 100%);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 6px 18px rgba(236, 72, 153, 0.5), 0 2px 6px rgba(0,0,0,0.25);
          border: 3px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
          transition: transform 0.2s;
        ">
          <div style="width: 12px; height: 12px; background: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

/**
 * Live GPS Blue Radar Dot (Just like Google Maps / Apple Maps)
 */
const createLiveGpsDotIcon = () => {
  return L.divIcon({
    className: 'custom-live-gps-dot',
    html: `
      <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); pointer-events: none;">
        <div style="
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.3);
          animation: gps-radar-pulse 2s infinite ease-out;
        "></div>
        <div style="
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #2563eb;
          border: 2.5px solid #ffffff;
          box-shadow: 0 0 10px rgba(37, 99, 235, 0.7);
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

export const GpsMapView = ({
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
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const pinMarkerRef = useRef(null);
  const gpsDotMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const watchIdRef = useRef(null);

  const [isLocating, setIsLocating] = useState(true);
  const [gpsStatus, setGpsStatus] = useState('searching'); // 'searching' | 'locked' | 'permission_denied' | 'error'
  const [accuracyMeters, setAccuracyMeters] = useState(null);
  const [activeCoords, setActiveCoords] = useState(null);
  const [geocodingInProgress, setGeocodingInProgress] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Acquiring live satellite & device GPS coordinates...');

  // Initialize Leaflet Map once on mount
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = gpsLocation?.latitude || DEFAULT_BELAGAVI_LAT;
    const initialLon = gpsLocation?.longitude || DEFAULT_BELAGAVI_LON;

    // Create Leaflet map instance
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 17,
      zoomControl: false,
      attributionControl: false
    });

    // Add high-resolution OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Add zoom controls to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add draggable location pin marker
    const pin = L.marker([initialLat, initialLon], {
      icon: createCustomPinIcon(),
      draggable: true,
      zIndexOffset: 1000
    }).addTo(map);

    // Handle pin drag end event -> Real-time reverse geocode
    pin.on('dragend', async () => {
      const pos = pin.getLatLng();
      setActiveCoords({ lat: pos.lat, lon: pos.lng });
      await resolveAndSetLocation(pos.lat, pos.lng, 'pin_dragged');
    });

    // Handle click anywhere on the map -> Moves pin & reverse geocodes
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      pin.setLatLng([lat, lng]);
      setActiveCoords({ lat, lon: lng });
      map.panTo([lat, lng], { animate: true, duration: 0.5 });
      await resolveAndSetLocation(lat, lng, 'map_clicked');
    });

    mapInstanceRef.current = map;
    pinMarkerRef.current = pin;

    // Auto-trigger device GPS scan immediately on load
    startLiveGpsAccess();

    return () => {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  /**
   * Reverse geocode coordinates, update state, and auto-populate the form
   */
  const resolveAndSetLocation = async (lat, lon, source = 'gps', accuracy = 15) => {
    setGeocodingInProgress(true);
    try {
      const geoInfo = await reverseGeocodeAddress(lat, lon);
      const locObj = {
        address: geoInfo?.address || `Campus Location (${lat.toFixed(5)}° N, ${lon.toFixed(5)}° E)`,
        buildingName: geoInfo?.buildingName || 'Campus Building',
        city: geoInfo?.city || 'Belagavi',
        state: geoInfo?.state || 'Karnataka',
        latitude: lat,
        longitude: lon,
        accuracy: Math.round(accuracy),
        source: source,
        isHighAccuracy: accuracy < 200,
        timestamp: Date.now()
      };

      setGpsLocation(locObj);
      setActiveCoords({ lat, lon });

      // Auto-populate building name if empty or newly resolved
      if (geoInfo?.buildingName) {
        setBuildingName(prev => {
          if (!prev || prev.trim() === '' || prev === 'Campus Facility' || prev === 'Campus Zone') {
            return geoInfo.buildingName;
          }
          return prev;
        });
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    } finally {
      setGeocodingInProgress(false);
    }
  };

  /**
   * Start Live Automatic GPS Location Tracking (Like Google Maps)
   */
  const startLiveGpsAccess = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsStatus('error');
      setStatusMessage('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    setIsLocating(true);
    setGpsStatus('searching');
    setStatusMessage('📡 Accessing device GPS satellites & Wi-Fi triangulation...');

    // 1. Immediate High-Accuracy Single Fix
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        handleGpsSuccess(pos, true);
      },
      (err) => {
        console.warn('High-accuracy GPS sensor timed out, trying standard accuracy:', err);
        // Retry with standard fallback if high-accuracy timed out
        navigator.geolocation.getCurrentPosition(
          (pos) => handleGpsSuccess(pos, false),
          (err2) => handleGpsError(err2),
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 10000 }
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );

    // 2. Continuous GPS Watcher to lock accuracy as satellites improve
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        // Stream update if accuracy is better
        handleGpsSuccess(pos, false);
      },
      (err) => {
        console.warn('watchPosition update error:', err);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  /**
   * Handle Live GPS Position Updates
   */
  const handleGpsSuccess = async (position, shouldCenter = false) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const accuracy = position.coords.accuracy || 15;

    setAccuracyMeters(Math.round(accuracy));
    setGpsStatus('locked');
    setIsLocating(false);
    setStatusMessage(`✓ GPS Locked (±${Math.round(accuracy)}m accuracy)`);

    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Update or create Blue Radar Dot
    if (!gpsDotMarkerRef.current) {
      gpsDotMarkerRef.current = L.marker([lat, lon], {
        icon: createLiveGpsDotIcon(),
        zIndexOffset: 500
      }).addTo(map);
    } else {
      gpsDotMarkerRef.current.setLatLng([lat, lon]);
    }

    // 2. Update or create Accuracy Radius Circle
    if (!accuracyCircleRef.current) {
      accuracyCircleRef.current = L.circle([lat, lon], {
        radius: Math.min(accuracy, 250),
        color: '#3B82F6',
        fillColor: '#60A5FA',
        fillOpacity: 0.12,
        weight: 1.5,
        interactive: false
      }).addTo(map);
    } else {
      accuracyCircleRef.current.setLatLng([lat, lon]);
      accuracyCircleRef.current.setRadius(Math.min(accuracy, 250));
    }

    // 3. Move draggable pin marker to GPS coordinate
    if (pinMarkerRef.current) {
      pinMarkerRef.current.setLatLng([lat, lon]);
    }

    // 4. Smoothly pan/fly map to the user's live position
    if (shouldCenter) {
      map.flyTo([lat, lon], 17, { animate: true, duration: 1.2 });
    }

    // 5. Auto-reverse geocode the address
    await resolveAndSetLocation(lat, lon, 'device_gps', accuracy);
  };

  /**
   * Handle GPS Errors (e.g. Permission Denied)
   */
  const handleGpsError = (error) => {
    setIsLocating(false);
    if (error.code === error.PERMISSION_DENIED) {
      setGpsStatus('permission_denied');
      setStatusMessage('GPS permission blocked. You can tap or drag the pin anywhere on the campus map!');
    } else {
      setGpsStatus('error');
      setStatusMessage('Unable to reach GPS satellites. Tap or drag the pin on the map to mark location.');
    }
  };

  /**
   * Re-center button click (Like Google Maps "My Location" FAB)
   */
  const handleRecenter = () => {
    startLiveGpsAccess();
    if (mapInstanceRef.current && activeCoords) {
      mapInstanceRef.current.flyTo([activeCoords.lat, activeCoords.lon], 17, { animate: true, duration: 0.8 });
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: error ? '2px solid #ef4444' : '1px solid var(--border-color)',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.07)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 1. Header Bar with Live GPS Radar Status */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.35)'
          }}>
            <Navigation size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Live GPS Campus Map
              </span>
              <span style={{ color: '#ef4444', fontWeight: 800 }}>*</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              <span>Automatically accessing live GPS</span>
              <span>•</span>
              <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Drag pin or tap map to refine</span>
            </div>
          </div>
        </div>

        {/* GPS Live Pill & Recenter Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleRecenter}
            disabled={isLocating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: isLocating ? 'not-allowed' : 'pointer',
              border: gpsStatus === 'locked' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(236, 72, 153, 0.4)',
              backgroundColor: gpsStatus === 'locked' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(236, 72, 153, 0.1)',
              color: gpsStatus === 'locked' ? '#10b981' : 'var(--primary-color)',
              transition: 'all 0.2s'
            }}
          >
            {isLocating ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Locating GPS...</span>
              </>
            ) : (
              <>
                <Crosshair size={14} />
                <span>Re-center GPS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Interactive Real GPS Map Viewport */}
      <div style={{ position: 'relative', width: '100%', height: '320px' }}>
        {/* Leaflet DOM Node */}
        <div 
          ref={mapContainerRef} 
          style={{ width: '100%', height: '100%', zIndex: 1, backgroundColor: '#f1f5f9' }} 
        />

        {/* Map Top Floating Overlay: Live Status Bar */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '56px',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(236, 72, 153, 0.25)',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#1e293b',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {isLocating ? (
              <>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6', animation: 'ping 1.5s infinite' }} />
                <span>Acquiring satellite GPS...</span>
              </>
            ) : geocodingInProgress ? (
              <>
                <RefreshCw size={13} className="animate-spin" color="#ec4899" />
                <span>Resolving campus address...</span>
              </>
            ) : gpsStatus === 'locked' ? (
              <>
                <CheckCircle2 size={14} color="#10b981" />
                <span>Live GPS Locked {accuracyMeters ? `(±${accuracyMeters}m)` : ''}</span>
              </>
            ) : gpsStatus === 'permission_denied' ? (
              <>
                <AlertTriangle size={14} color="#f59e0b" />
                <span>GPS Blocked - Drag Pin on Campus Map</span>
              </>
            ) : (
              <>
                <MapPin size={14} color="#ec4899" />
                <span>Pinned Location</span>
              </>
            )}

            {activeCoords && (
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                • {activeCoords.lat.toFixed(4)}° N, {activeCoords.lon.toFixed(4)}° E
              </span>
            )}
          </div>
        </div>

        {/* Floating Google Maps Style Re-center Button on bottom right */}
        <button
          type="button"
          onClick={handleRecenter}
          title="Recenter on My GPS Location"
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            zIndex: 10,
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--primary-color)',
            transition: 'all 0.2s'
          }}
        >
          <Crosshair size={20} className={isLocating ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 3. Auto-Resolved Address & Location Card */}
      <div style={{
        padding: '18px 20px',
        backgroundColor: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Address Display Strip */}
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <div style={{
            padding: '6px',
            borderRadius: '8px',
            backgroundColor: 'rgba(236, 72, 153, 0.12)',
            color: 'var(--primary-color)',
            marginTop: '2px'
          }}>
            <MapPin size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981'
              }}>
                ✓ Auto-Detected GPS Location
              </span>
              {gpsLocation?.city && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  🏙️ {gpsLocation.city}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {geocodingInProgress ? (
                <span style={{ color: 'var(--text-muted)' }}>Updating address from map pin...</span>
              ) : (
                gpsLocation?.address || 'Detecting exact campus address...'
              )}
            </div>
          </div>
        </div>

        {/* 4. Fine-Tune Building / Floor / Room */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          {/* Building / Block Name */}
          <div>
            <label className="input-label" style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
              <Building size={14} color="var(--primary-color)" />
              <span>Building / Block Name <span style={{ color: '#ef4444' }}>*</span></span>
            </label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Main Academic Block, CS Lab..."
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
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
              style={{ fontSize: '0.85rem', cursor: 'pointer' }}
            >
              {FLOOR_OPTIONS.map((f, i) => (
                <option key={i} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Room / Spot No. */}
          <div>
            <label className="input-label" style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
              <DoorOpen size={14} color="var(--primary-color)" />
              <span>Room / Spot (Optional)</span>
            </label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Lab 204, Room 12"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Additional Location Details */}
        <div>
          <label className="input-label" style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <AlignLeft size={14} color="var(--text-muted)" />
            <span>Specific Landmark / Spot Description (Optional)</span>
          </label>
          <input
            type="text"
            className="input-control"
            placeholder="e.g. Opposite elevator, near water fountain on the right"
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
            style={{ fontSize: '0.85rem' }}
          />
        </div>
      </div>
    </div>
  );
};
