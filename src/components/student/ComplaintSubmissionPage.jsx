import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, PRIORITIES } from '../../data/categories';
import { CategoryIcon, CategoryBadge, PriorityBadge } from '../common/Badge';
import { reverseGeocodeAddress, detectCurrentLocation } from '../../utils/geoUtils';
import { api } from '../../api/client';
import { 
  PlusCircle, AlertCircle, 
  MapPin, Sparkles, Layers, Building, DoorOpen, AlignLeft, 
  Camera, ImagePlus, RefreshCw, ArrowLeft, Send, CheckCircle2, Crosshair, X, Globe, Edit2, Check, Zap, HelpCircle
} from 'lucide-react';

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

const MAX_PHOTOS = 5;
const DRAFT_STORAGE_KEY = 'campuscare_complaint_draft_v1';

export const ComplaintSubmissionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { submitComplaint, currentPersona } = useApp();

  // Load draft or initial state
  const getInitialState = () => {
    try {
      const savedDraft = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        return {
          title: parsed.title || '',
          category: location.state?.category || parsed.category || 'wifi_it',
          priority: parsed.priority || 'medium',
          buildingName: parsed.buildingName || '',
          floorLevel: parsed.floorLevel || 'Ground Floor',
          roomNumber: parsed.roomNumber || '',
          additionalDetails: parsed.additionalDetails || '',
          gpsLocation: parsed.gpsLocation || null,
          description: parsed.description || '',
          attachments: parsed.attachments || []
        };
      }
    } catch (e) {}
    return {
      title: '',
      category: location.state?.category || 'wifi_it',
      priority: 'medium',
      buildingName: '',
      floorLevel: 'Ground Floor',
      roomNumber: '',
      additionalDetails: '',
      gpsLocation: null,
      description: '',
      attachments: []
    };
  };

  const initialState = getInitialState();

  const [title, setTitle] = useState(initialState.title);
  const [category, setCategory] = useState(initialState.category);
  const [priority, setPriority] = useState(initialState.priority);

  // 1. Manual Location Fields (Preserved)
  const [buildingName, setBuildingName] = useState(initialState.buildingName);
  const [floorLevel, setFloorLevel] = useState(initialState.floorLevel);
  const [roomNumber, setRoomNumber] = useState(initialState.roomNumber);
  const [additionalDetails, setAdditionalDetails] = useState(initialState.additionalDetails);

  // 2. Real GPS Location Detection State
  const [gpsLocation, setGpsLocation] = useState(initialState.gpsLocation); // { latitude, longitude, accuracy }
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [gpsSuccess, setGpsSuccess] = useState(!!initialState.gpsLocation);
  const [isEditingGpsAddress, setIsEditingGpsAddress] = useState(false);

  const [description, setDescription] = useState(initialState.description);
  const [attachments, setAttachments] = useState(initialState.attachments);
  const [uploadError, setUploadError] = useState('');
  const [previewZoomImage, setPreviewZoomImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Direct In-App Live Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('environment');
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Hidden separate file inputs
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Save draft to sessionStorage on changes
  useEffect(() => {
    const draft = {
      title,
      category,
      priority,
      buildingName,
      floorLevel,
      roomNumber,
      additionalDetails,
      gpsLocation,
      description,
      attachments
    };
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [title, category, priority, buildingName, floorLevel, roomNumber, additionalDetails, gpsLocation, description, attachments]);

  // Stop camera stream on unmount
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraLoading(false);
  };

  useEffect(() => {
    // Auto-fetch location on load if not already detected
    if (!initialState.gpsLocation) {
      handleGetGPSLocation();
    }
    return () => stopCameraStream();
  }, []);

  // --- Real Geolocation Detection (Address Only) ---
  const handleGetGPSLocation = async () => {
    setGpsLoading(true);
    setGpsError('');
    setIsEditingGpsAddress(false);

    try {
      const loc = await detectCurrentLocation();
      if (loc && loc.address) {
        setGpsLocation({
          address: loc.address,
          buildingName: loc.buildingName,
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy,
          isHighAccuracy: loc.isHighAccuracy
        });
        setGpsSuccess(true);
        // Auto-fill building name if not already typed
        setBuildingName(prev => (!prev.trim() && loc.buildingName ? loc.buildingName : prev));
      } else {
        setGpsError('Unable to auto-detect location. You can enter location details below or retry.');
      }
    } catch (err) {
      setGpsError('Location service timed out. You can enter location details below or retry.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleClearGPS = () => {
    setGpsLocation(null);
    setGpsSuccess(false);
    setGpsError('');
    setIsEditingGpsAddress(false);
  };

  // Live Camera Viewfinder
  const startLiveCamera = async (facingMode = 'environment') => {
    if (attachments.length >= MAX_PHOTOS) {
      setUploadError(`You can attach a maximum of ${MAX_PHOTOS} photos.`);
      return;
    }
    setUploadError('');
    setCameraLoading(true);
    setIsCameraActive(true);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraFacingMode(facingMode);
      setCameraLoading(false);
    } catch (err) {
      console.warn('getUserMedia camera stream failed or blocked, falling back to capture input:', err);
      stopCameraStream();
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  // Capture Live Frame
  const captureLivePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);

    setAttachments(prev => {
      if (prev.length >= MAX_PHOTOS) return prev;
      return [
        ...prev,
        {
          id: `camera-photo-${Date.now()}`,
          name: `camera_evidence_${prev.length + 1}.jpg`,
          url: photoDataUrl,
          size: '~1.2 MB'
        }
      ];
    });

    stopCameraStream();
  };

  const toggleCameraFacingMode = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    startLiveCamera(nextMode);
  };

  // Files Handler
  const handleFilesAdded = (filesList, sourceName = 'upload') => {
    setUploadError('');
    if (!filesList || filesList.length === 0) return;

    const currentCount = attachments.length;
    const incomingFiles = Array.from(filesList);

    if (currentCount + incomingFiles.length > MAX_PHOTOS) {
      setUploadError(`You can attach a maximum of ${MAX_PHOTOS} photos. You currently have ${currentCount}.`);
      return;
    }

    incomingFiles.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setUploadError(`File "${file.name}" is not a supported image format. Please select JPG, PNG, or WebP.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Url = e.target.result;
        setAttachments(prev => {
          if (prev.length >= MAX_PHOTOS) return prev;
          return [
            ...prev,
            {
              id: `${sourceName}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              name: file.name || `evidence_${prev.length + 1}.jpg`,
              url: base64Url,
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            }
          ];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCameraInputChange = (e) => {
    handleFilesAdded(e.target.files, 'camera');
    e.target.value = '';
  };

  const handleGalleryInputChange = (e) => {
    handleFilesAdded(e.target.files, 'gallery');
    e.target.value = '';
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
    setUploadError('');
  };

  const handleTakePhotoClick = () => {
    if (attachments.length >= MAX_PHOTOS) {
      setUploadError(`You can attach a maximum of ${MAX_PHOTOS} photos.`);
      return;
    }
    setUploadError('');

    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.matchMedia && window.matchMedia('(max-width: 768px)').matches && 'ontouchstart' in window);

    if (isMobileDevice) {
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    } else {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        startLiveCamera('environment');
      } else if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  const handleChoosePhotosClick = () => {
    if (attachments.length >= MAX_PHOTOS) {
      setUploadError(`You can attach a maximum of ${MAX_PHOTOS} photos.`);
      return;
    }
    setUploadError('');
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  const validate = () => {
    const errs = {};
    if (!title.trim() || title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters';
    }

    // Require location: either GPS detected OR manual building name provided
    const hasLocation = (buildingName && buildingName.trim()) || (gpsLocation && gpsLocation.address);
    if (!hasLocation) {
      errs.buildingName = 'Please detect your location or enter Building / Block Name';
    }

    if (!description.trim() || description.trim().length < 15) {
      errs.description = 'Please provide at least 15 characters of detail';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const derivedBuilding = buildingName.trim() || gpsLocation?.buildingName || (gpsLocation?.address ? gpsLocation.address.split(',')[0].trim() : 'Campus Zone');
      const derivedRoom = roomNumber.trim() || 'General / Campus Area';

      // 1. Manual location object
      const manualData = {
        building: derivedBuilding,
        floor: floorLevel,
        roomOrSpot: derivedRoom,
        additionalDetails: additionalDetails.trim()
      };

      // 2. GPS location object (saved as requested: { address: "..." })
      const gpsData = {
        address: gpsLocation?.address || null
      };

      // 3. Composite location string
      const campusParts = [];
      if (derivedBuilding) campusParts.push(derivedBuilding);
      if (floorLevel) campusParts.push(floorLevel);
      if (derivedRoom && derivedRoom !== 'General / Campus Area') campusParts.push(derivedRoom);

      const campusLocationStr = campusParts.join(' → ');
      const compositeLocationString = gpsLocation?.address
        ? `${campusLocationStr} (${gpsLocation.address})`
        : (campusLocationStr || 'Campus Location');

      const created = await submitComplaint({
        title,
        category,
        priority,
        location: compositeLocationString,
        manualLocation: manualData,
        locationDetails: manualData,
        gpsLocation: gpsData,
        floorLevel,
        description,
        attachments
      });

      // Clear draft
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);

      // Navigate to complaints or detail
      if (created?.id) {
        navigate(`/complaints/${created.id}`);
      } else {
        navigate('/complaints');
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryMeta = CATEGORIES.find(c => c.id === category);

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Breadcrumb / Back button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-ghost"
          style={{ gap: '8px', padding: '8px 12px', fontSize: '0.875rem' }}
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Logged in as <strong>{currentPersona.name}</strong> ({currentPersona.studentId || currentPersona.role})
        </div>
      </div>

      {/* Admin Notice Banner if Dean visits submission page */}
      {(currentPersona?.role === 'admin' || currentPersona?.role === 'staff') && (
        <div style={{
          padding: '14px 18px',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            ⚠️ <strong>Admin / Staff Notice:</strong> You are currently logged in as <strong>{currentPersona.name} ({currentPersona.role})</strong>. Issue reporting is typically performed by students.
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem' }}
          >
            Return to Admin Hub
          </button>
        </div>
      )}

      {/* Main Form Glass Panel */}
      <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary-500), var(--accent-cyan))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
          }}>
            <PlusCircle size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Submit Campus Complaint</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Fill in the details below to report an infrastructure or academic concern to maintenance staff
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Category Selector */}
          <div>
            <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>
              Select Issue Category <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '8px'
            }}>
              {CATEGORIES.map(cat => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 8px',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid ${cat.color}` : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? `${cat.color}20` : 'var(--bg-tertiary)',
                      color: isSelected ? cat.color : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                      gap: '6px'
                    }}
                  >
                    <CategoryIcon iconName={cat.icon} size={20} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.2 }}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
            {selectedCategoryMeta && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                💡 Handles: {selectedCategoryMeta.description}
              </div>
            )}
          </div>

          {/* Priority Selector */}
          <div>
            <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>
              Urgency / Priority Level <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px'
            }}>
              {PRIORITIES.map(p => {
                const isSelected = priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid ${p.color}` : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? `${p.color}15` : 'var(--bg-tertiary)',
                      color: isSelected ? p.color : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}
                  >
                    <span>{p.name}</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.8, fontWeight: 500 }}>{p.eta}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Complaint Title */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">
              Complaint Summary / Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Wi-Fi router flashing red in CS Lab, no internet connection"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-control"
              style={{ borderColor: errors.title ? '#ef4444' : undefined }}
            />
            {errors.title && (
              <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '2px' }}>
                {errors.title}
              </span>
            )}
          </div>

          {/* --- EXACT CAMPUS LOCATION SECTION (MANUAL + GPS) --- */}
          <div style={{
            padding: '22px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '18px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            {/* Section Header with GPS Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={19} color="var(--accent-cyan)" />
                <span style={{ fontWeight: 800, fontSize: '0.975rem', color: 'var(--text-primary)' }}>
                  Exact Campus Location & Floor Level <span style={{ color: '#ef4444' }}>*</span>
                </span>
              </div>

              {/* 1. USE MY CURRENT LOCATION BUTTON */}
              <button
                type="button"
                onClick={handleGetGPSLocation}
                disabled={gpsLoading}
                className="btn btn-secondary btn-sm"
                style={{
                  gap: '6px',
                  backgroundColor: gpsSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                  borderColor: gpsSuccess ? 'rgba(16, 185, 129, 0.4)' : 'rgba(6, 182, 212, 0.4)',
                  color: gpsSuccess ? '#10b981' : 'var(--accent-cyan)',
                  fontWeight: 700,
                  fontSize: '0.825rem'
                }}
              >
                {gpsLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>📍 Getting your location...</span>
                  </>
                ) : gpsSuccess ? (
                  <>
                    <CheckCircle2 size={14} color="#10b981" />
                    <span>✓ Location Detected</span>
                  </>
                ) : (
                  <>
                    <MapPin size={14} />
                    <span>📍 Use My Current Location</span>
                  </>
                )}
              </button>
            </div>

            {/* GPS Status Card (Displayed when detected, loading, or errored) */}
            {gpsLoading && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--accent-cyan)',
                fontSize: '0.85rem'
              }}>
                <RefreshCw size={16} className="animate-spin" />
                <span>📍 Getting your location... Detecting general readable address</span>
              </div>
            )}

            {gpsSuccess && gpsLocation?.address && (
              <div style={{
                padding: '14px 18px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 800, fontSize: '0.875rem' }}>
                    <CheckCircle2 size={16} />
                    <span>✓ Real-time Location Detected</span>
                  </div>
                  {isEditingGpsAddress ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <input
                        type="text"
                        className="input"
                        value={gpsLocation.address}
                        onChange={(e) => setGpsLocation(prev => ({ ...prev, address: e.target.value }))}
                        style={{ fontSize: '0.85rem', padding: '5px 10px', height: '34px', width: '100%', maxWidth: '420px' }}
                        autoFocus
                        placeholder="Edit detected campus area/zone..."
                      />
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setIsEditingGpsAddress(false)}
                        style={{ fontSize: '0.75rem', padding: '5px 10px', height: '34px' }}
                      >
                        <Check size={14} />
                        <span>Save</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ marginTop: '5px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {gpsLocation.address}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {!isEditingGpsAddress && (
                    <button
                      type="button"
                      onClick={() => setIsEditingGpsAddress(true)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 8px', color: 'var(--text-secondary)' }}
                      title="Edit detected address string"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleGetGPSLocation}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 8px', color: 'var(--text-muted)' }}
                    title="Refresh fresh GPS reading"
                  >
                    <RefreshCw size={13} className={gpsLoading ? 'animate-spin' : ''} />
                    <span>Update</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearGPS}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 8px', color: '#ef4444' }}
                    title="Remove GPS location"
                  >
                    <X size={13} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            )}

            {gpsError && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                color: '#ef4444',
                fontSize: '0.825rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{gpsError}</span>
                </div>
                <button
                  type="button"
                  onClick={handleGetGPSLocation}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Manual Location Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {/* Building */}
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontSize: '0.825rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building size={14} color="var(--primary-400)" />
                  <span>Building / Campus Zone {gpsSuccess ? <span style={{ color: '#10b981', fontSize: '0.72rem', fontWeight: 600 }}>(Auto-detected)</span> : <span style={{ color: '#ef4444' }}>*</span>}</span>
                </label>
                <input
                  type="text"
                  placeholder={gpsLocation?.buildingName || "e.g. Academic Block, Main Building, CS Lab Block"}
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  className="input-control"
                  style={{ fontSize: '0.875rem', borderColor: errors.buildingName ? '#ef4444' : undefined }}
                />
                {errors.buildingName && (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '2px' }}>
                    {errors.buildingName}
                  </span>
                )}
              </div>

              {/* Room */}
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontSize: '0.825rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DoorOpen size={14} color="var(--primary-400)" />
                  <span>Room No. / Lab / Specific Spot <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 500 }}>(Optional)</span></span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room 304, Lab 3, Washroom, Corridor"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="input-control"
                  style={{ fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* Floor Level */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Layers size={14} color="var(--primary-400)" />
                <label className="input-label" style={{ marginBottom: 0, fontSize: '0.825rem', fontWeight: 700 }}>
                  Floor Level <span style={{ color: '#ef4444' }}>*</span>
                </label>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))',
                gap: '8px'
              }}>
                {FLOOR_OPTIONS.map(f => {
                  const isSelected = floorLevel === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFloorLevel(f)}
                      style={{
                        padding: '9px 6px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'var(--bg-card)',
                        color: isSelected ? 'var(--primary-300)' : 'var(--text-secondary)',
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        textAlign: 'center'
                      }}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Details */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontSize: '0.825rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlignLeft size={14} color="var(--text-muted)" />
                <span>Additional Location Details (Optional)</span>
              </label>
              <textarea
                placeholder="e.g. Near staircase, beside Room 305, opposite laboratory..."
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                className="input-control"
                style={{ minHeight: '65px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="input-label">
                Detailed Description <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {description.length} characters
              </span>
            </div>
            <textarea
              placeholder="Please detail what is happening, when it started, any error messages or physical damage observed, and how it affects students..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-control"
              style={{ minHeight: '100px', borderColor: errors.description ? '#ef4444' : undefined }}
            />
            {errors.description && (
              <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '2px' }}>
                {errors.description}
              </span>
            )}
          </div>

          {/* 🤖 Live Real-Time AI Smart Triage Assistant Widget */}
          {liveAiTriage && (
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(236, 72, 153, 0.06) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.08)',
                animation: 'fadeIn 0.3s ease-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--primary-500), #ec4899)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff'
                  }}>
                    <Sparkles size={15} />
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      AI Smart Triage Assistant
                    </span>
                    <span style={{
                      marginLeft: '8px', fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary-400)'
                    }}>
                      {Math.round((liveAiTriage.confidence || 0.85) * 100)}% Match
                    </span>
                  </div>
                </div>

                {/* 1-Click Apply Category / Priority if different */}
                {(category !== liveAiTriage.suggestedCategory || priority !== liveAiTriage.suggestedPriority) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (liveAiTriage.suggestedCategory) setCategory(liveAiTriage.suggestedCategory);
                      if (liveAiTriage.suggestedPriority) setPriority(liveAiTriage.suggestedPriority);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '6px', fontSize: '0.78rem', padding: '6px 12px' }}
                  >
                    <Sparkles size={13} />
                    <span>Auto-Sync Category & Urgency</span>
                  </button>
                )}
              </div>

              {/* AI Detection Summary Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '10px',
                background: 'rgba(0, 0, 0, 0.15)',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '0.8rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.7rem', marginBottom: '3px' }}>
                    Detected Category:
                  </span>
                  <CategoryBadge categoryId={liveAiTriage.suggestedCategory} size="sm" />
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.7rem', marginBottom: '3px' }}>
                    Assessed Urgency & SLA:
                  </span>
                  <PriorityBadge priority={liveAiTriage.suggestedPriority} size="sm" />
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.7rem', marginBottom: '3px' }}>
                    Auto-Dispatched Department:
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {liveAiTriage.suggestedDepartmentName || 'IT Services & Network Infrastructure'}
                  </span>
                </div>
              </div>

              {/* Reasoning */}
              {liveAiTriage.reasons && liveAiTriage.reasons.length > 0 && (
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>AI Evidence: </strong>
                  {liveAiTriage.reasons.join(' • ')}
                </div>
              )}
            </div>
          )}

          {/* Photo Evidence Section */}
          <div>
            {/* 1. Dedicated Camera Input */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleCameraInputChange}
            />

            {/* 2. Dedicated Gallery / Files Input */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleGalleryInputChange}
            />

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="input-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={16} color="var(--primary-400)" />
                <span>Attach Photo Evidence (Optional)</span>
              </label>
              <span style={{ fontSize: '0.78rem', color: attachments.length >= MAX_PHOTOS ? '#ef4444' : 'var(--primary-400)', fontWeight: 700 }}>
                {attachments.length} / {MAX_PHOTOS} Photos Attached
              </span>
            </div>

            <div style={{
              padding: '22px 20px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px dashed var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              textAlign: 'center'
            }}>
              {isCameraActive ? (
                <div style={{
                  width: '100%',
                  maxWidth: '480px',
                  backgroundColor: '#000000',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '2px solid var(--primary-500)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{ position: 'relative', width: '100%', minHeight: '260px', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cameraLoading && (
                      <div style={{ color: '#ffffff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Initializing Device Camera...</span>
                      </div>
                    )}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        maxHeight: '340px',
                        objectFit: 'cover',
                        display: cameraLoading ? 'none' : 'block'
                      }}
                    />
                    
                    <button
                      type="button"
                      onClick={toggleCameraFacingMode}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#ffffff',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Flip camera"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>

                  <div style={{
                    padding: '14px 20px',
                    width: '100%',
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-color)'
                  }}>
                    <button
                      type="button"
                      onClick={stopCameraStream}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={captureLivePhoto}
                      className="btn btn-primary"
                      style={{
                        borderRadius: 'var(--radius-full)',
                        padding: '8px 24px',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        gap: '6px',
                        backgroundColor: '#ef4444',
                        borderColor: '#ef4444',
                        boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)'
                      }}
                    >
                      <Camera size={18} />
                      <span>Snap Photo</span>
                    </button>

                    <span style={{ width: '40px' }} />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '440px' }}>
                  <button
                    type="button"
                    onClick={handleTakePhotoClick}
                    disabled={attachments.length >= MAX_PHOTOS}
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      minWidth: '170px',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      gap: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(99, 102, 241, 0.12)',
                      borderColor: 'rgba(99, 102, 241, 0.3)',
                      color: 'var(--primary-300)'
                    }}
                  >
                    <Camera size={18} color="var(--primary-400)" />
                    <span>📷 Take Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleChoosePhotosClick}
                    disabled={attachments.length >= MAX_PHOTOS}
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      minWidth: '170px',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      gap: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(6, 182, 212, 0.12)',
                      borderColor: 'rgba(6, 182, 212, 0.3)',
                      color: 'var(--accent-cyan)'
                    }}
                  >
                    <ImagePlus size={18} color="var(--accent-cyan)" />
                    <span>🖼️ Choose Photos</span>
                  </button>
                </div>
              )}

              {!isCameraActive && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  You can attach up to 5 photos (JPG, PNG, WebP)
                </div>
              )}

              {uploadError && (
                <div style={{
                  padding: '8px 14px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AlertCircle size={15} />
                  <span>{uploadError}</span>
                </div>
              )}

              {attachments.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                  gap: '12px',
                  width: '100%',
                  marginTop: '6px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-color)'
                }}>
                  {attachments.map((att, index) => (
                    <div
                      key={att.id || index}
                      style={{
                        position: 'relative',
                        height: '95px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-card)',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                      }}
                    >
                      <img
                        src={att.url}
                        alt={att.name || `photo ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                        onClick={() => setPreviewZoomImage(att.url)}
                        title="Click to zoom preview"
                      />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAttachment(att.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(239, 68, 68, 0.9)',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                        }}
                        title="Remove photo"
                      >
                        ✕
                      </button>

                      <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '4px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        Photo {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ gap: '8px' }}
            >
              <Sparkles size={16} />
              <span>{isSubmitting ? 'Registering...' : 'Submit Complaint'}</span>
            </button>
          </div>
        </form>

        {previewZoomImage && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              backgroundColor: 'rgba(0,0,0,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '30px'
            }}
            onClick={() => setPreviewZoomImage(null)}
          >
            <img
              src={previewZoomImage}
              alt="Preview"
              style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px', objectFit: 'contain' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
