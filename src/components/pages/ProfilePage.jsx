import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  MapPin,
  ShieldCheck,
  KeyRound,
  Bell,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit3,
  Save,
  Camera,
  Check,
  AlertCircle,
  ArrowLeft,
  Lock,
  Copy,
  ExternalLink,
  PlusCircle,
  Upload,
  Image,
  RefreshCw,
  X,
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { 
    complaints = [], 
    addToast, 
    openModal 
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tickets' | 'security'
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Avatar Picker Modal state
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarTab, setAvatarTab] = useState('upload'); // 'upload' | 'presets' | 'url'
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');

  // Profile Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    department: '',
    year: '',
    hostel: '',
    designation: '',
    bio: '',
    emergencyContact: '',
    avatar: '',
    // Campus Credentials fields
    enrollmentStatus: 'Enrolled & Verified',
    portalRole: 'student',
    registeredBatch: 'Academic Year 2024–2028',
    slaTier: 'Standard Tier (24h)'
  });

  // Password Form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: '', success: '' });

  // Notification Preferences
  const [notifications, setNotifPreferences] = useState({
    emailUpdates: true,
    smsAlerts: false,
    slaAlerts: true,
    weeklyDigest: false
  });

  // Ticket Filters in Tab 2
  const [ticketFilter, setTicketFilter] = useState('all'); // 'all' | 'active' | 'resolved'
  const [ticketSearch, setTicketSearch] = useState('');

  // Sync form data with current user
  useEffect(() => {
    if (user) {
      const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || 'Priya')}`;
      setFormData({
        name: user.name || 'Priya Sharma',
        email: user.email || 'priya.sharma@college.edu',
        phone: user.phone || '+91 98765 43210',
        studentId: user.studentId || (user.role === 'student' ? 'STU-2024-8841' : 'EMP-2024-1042'),
        department: user.department || (user.role === 'student' ? 'Computer Science & Engineering' : 'IT Services & Network Infrastructure'),
        year: user.year || (user.role === 'student' ? '3rd Year (Semester 5)' : 'Faculty / Staff'),
        hostel: user.hostel || (user.role === 'student' ? 'Gargi Hall, Room 314' : 'Campus Staff Residence A-4'),
        designation: user.designation || user.roleTitle || (user.role === 'admin' ? 'Dean of Campus Infrastructure' : user.role === 'staff' ? 'Lead Systems Specialist' : 'Undergraduate Scholar'),
        bio: user.bio || 'Passionate student advocating for a cleaner, smarter, and safer campus community.',
        emergencyContact: user.emergencyContact || 'Dr. M. Sharma (+91 98450 11223)',
        avatar: user.avatar || defaultAvatar,
        enrollmentStatus: user.enrollmentStatus || 'Enrolled & Verified',
        portalRole: user.portalRole || user.role || 'student',
        registeredBatch: user.registeredBatch || 'Academic Year 2024–2028',
        slaTier: user.slaTier || 'Standard Tier (24h)'
      });
      setPreviewAvatar(user.avatar || defaultAvatar);
    }
  }, [user]);

  const isStudent = formData.portalRole === 'student' || user?.role === 'student' || !user?.role;
  const isStaff = formData.portalRole === 'staff' || user?.role === 'staff';
  const isAdmin = formData.portalRole === 'admin' || user?.role === 'admin';

  // User tickets list
  const userTickets = (complaints || []).filter(item => {
    if (!item) return false;
    if (user?.id && item.student?.id && String(item.student.id) === String(user.id)) return true;
    if (user?.email && item.student?.email && item.student.email.toLowerCase() === user.email.toLowerCase()) return true;
    if (user?.studentId && item.student?.studentId && item.student.studentId.toLowerCase() === user.studentId.toLowerCase()) return true;
    if (user?.studentId && item.studentId && item.studentId.toLowerCase() === user.studentId.toLowerCase()) return true;
    if (isStudent && item.student?.name && user?.name && item.student.name.toLowerCase().includes(user.name.toLowerCase().split(' ')[0])) return true;
    return false;
  });

  const resolvedTickets = userTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');
  const activeTickets = userTickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed');
  const resolutionRate = userTickets.length > 0 ? Math.round((resolvedTickets.length / userTickets.length) * 100) : 100;

  // Filtered tickets in Tab 2
  const filteredTickets = userTickets.filter(ticket => {
    const matchesSearch = !ticketSearch || 
      ticket.title?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.id?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.category?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.location?.toLowerCase().includes(ticketSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (ticketFilter === 'active') return ticket.status !== 'Resolved' && ticket.status !== 'Closed';
    if (ticketFilter === 'resolved') return ticket.status === 'Resolved' || ticket.status === 'Closed';
    return true;
  });

  // Diverse avatar presets
  const avatarPresets = [
    { name: 'Priya Sharma', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
    { name: 'Student Female 1', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
    { name: 'Student Male 1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80' },
    { name: 'Student Male 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
    { name: 'Dean Jenkins', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80' },
    { name: 'Avatar Felix', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { name: 'Avatar Bella', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella' },
    { name: 'Avatar Zoe', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe' },
    { name: 'Avatar Alex', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    { name: 'Avatar Luna', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna' },
    { name: 'Avatar Leo', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo' },
    { name: 'Avatar Maya', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya' }
  ];

  // Handle local file upload from Gallery / Computer folders
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        title: 'Invalid File',
        message: 'Please select a valid image file (JPG, PNG, WEBP).'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'File Too Large',
        message: 'Please select an image smaller than 5MB.'
      });
      return;
    }

    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result;
      if (dataUrl) {
        setPreviewAvatar(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save selected avatar
  const handleApplyAvatar = async (avatarUrlToApply) => {
    const targetUrl = avatarUrlToApply || previewAvatar;
    if (!targetUrl) return;

    setFormData(prev => ({ ...prev, avatar: targetUrl }));
    try {
      await updateProfile({ avatar: targetUrl });
      addToast({
        type: 'success',
        title: 'Profile Photo Updated ✨',
        message: 'Your new avatar has been saved.'
      });
      setShowAvatarPicker(false);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update profile photo.'
      });
    }
  };

  // Copy Student ID to clipboard
  const handleCopyId = () => {
    if (formData.studentId) {
      navigator.clipboard.writeText(formData.studentId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      addToast({
        type: 'info',
        title: 'Copied to Clipboard',
        message: `ID ${formData.studentId} copied.`
      });
    }
  };

  // Save Profile Form
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        year: formData.year,
        hostel: formData.hostel,
        designation: formData.designation,
        bio: formData.bio,
        emergencyContact: formData.emergencyContact,
        avatar: formData.avatar,
        enrollmentStatus: formData.enrollmentStatus,
        portalRole: formData.portalRole,
        registeredBatch: formData.registeredBatch,
        slaTier: formData.slaTier
      });

      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (err) {}

      addToast({
        type: 'success',
        title: 'Profile Updated ✨',
        message: 'Your personal details and credentials have been saved.'
      });
      setIsEditing(false);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Could not update profile.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, error: '', success: '' });

    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      setPasswordStatus({ loading: false, error: 'New password must be at least 6 characters long.', success: '' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ loading: false, error: 'New password and confirmation do not match.', success: '' });
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordStatus({ loading: false, error: '', success: 'Password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addToast({
        type: 'success',
        title: 'Security Updated',
        message: 'Your account password has been updated.'
      });
    } catch (err) {
      setPasswordStatus({ loading: false, error: err.message || 'Failed to update password.', success: '' });
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6' }}>Submitted</span>;
      case 'Under Review':
        return <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#D97706' }}>Under Review</span>;
      case 'Assigned':
        return <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(14, 165, 233, 0.12)', color: '#0284C7' }}>Assigned</span>;
      case 'In Progress':
        return <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#6366F1' }}>In Progress</span>;
      case 'Resolved':
        return <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>Resolved</span>;
      default:
        return <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(100, 116, 139, 0.12)', color: '#64748B' }}>{status || 'Closed'}</span>;
    }
  };

  // Priority Badge Helper
  const renderPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
      case 'critical':
        return <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#EC4899', backgroundColor: '#FDF2F8', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>Critical</span>;
      case 'high':
        return <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#F59E0B', backgroundColor: '#FFFBEB', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>High</span>;
      case 'medium':
        return <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0EA5E9', backgroundColor: '#F0F9FF', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(14, 165, 233, 0.3)' }}>Medium</span>;
      default:
        return <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10B981', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Low</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '40px' }}>
      
      {/* 1. Breadcrumb & Page Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-ghost"
            style={{ padding: '8px 12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff' }}
            title="Return to Dashboard"
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#EC4899' }}>Student Portal</span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E1B4B' }}>My Profile</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
                style={{ fontSize: '0.825rem' }}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="btn btn-primary"
                style={{ fontSize: '0.825rem', gap: '6px' }}
                disabled={saving}
              >
                <Save size={15} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary"
                style={{ fontSize: '0.825rem', gap: '6px' }}
              >
                <Edit3 size={15} />
                <span>Edit Profile</span>
              </button>
              {isStudent && (
                <button
                  type="button"
                  onClick={() => openModal('submit')}
                  className="btn btn-primary"
                  style={{ fontSize: '0.825rem', gap: '6px' }}
                >
                  <PlusCircle size={15} />
                  <span>New Complaint</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 2. Hero Persona Card */}
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '0',
          borderRadius: '24px',
          border: '1.5px solid rgba(249, 168, 212, 0.6)',
          boxShadow: '0 12px 35px rgba(236, 72, 153, 0.08)',
          backgroundColor: '#ffffff'
        }}
      >
        {/* Top Decorative Header Strip */}
        <div
          style={{
            height: '115px',
            background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 50%, #A855F7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 24px',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.22)', backdropFilter: 'blur(10px)', padding: '6px 14px', borderRadius: '9999px', color: '#ffffff', fontSize: '0.78rem', fontWeight: 700 }}>
            <Sparkles size={14} />
            <span>CampusCare Verified Account</span>
          </div>
        </div>

        {/* Content Box Below Banner */}
        <div style={{ padding: '0 28px 24px 28px', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            
            {/* Left: Avatar + Details */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '22px', flexWrap: 'wrap' }}>
              
              {/* Avatar Box */}
              <div style={{ position: 'relative', marginTop: '-48px', flexShrink: 0 }}>
                <img
                  src={formData.avatar}
                  alt={formData.name}
                  style={{
                    width: '102px',
                    height: '102px',
                    borderRadius: '26px',
                    objectFit: 'cover',
                    border: '4px solid #ffffff',
                    boxShadow: '0 10px 28px rgba(236, 72, 153, 0.28)',
                    backgroundColor: '#ffffff',
                    display: 'block'
                  }}
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name)}`;
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewAvatar(formData.avatar);
                    setShowAvatarPicker(true);
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: '#EC4899',
                    color: '#ffffff',
                    border: '2.5px solid #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
                    transition: 'transform 0.2s'
                  }}
                  title="Upload or change profile picture"
                >
                  <Camera size={15} />
                </button>
              </div>

              {/* Name & Metadata */}
              <div style={{ paddingTop: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1E1B4B', margin: 0, lineHeight: 1.2 }}>
                    {formData.name}
                  </h1>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      backgroundColor: isAdmin ? '#8B5CF6' : isStaff ? '#0284C7' : '#EC4899',
                      color: '#ffffff',
                      boxShadow: '0 2px 8px rgba(236, 72, 153, 0.25)'
                    }}
                  >
                    {isAdmin ? 'Campus Admin' : isStaff ? 'Staff Officer' : 'Student'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#10B981', backgroundColor: '#ECFDF5', padding: '3px 9px', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    <span>Active Session</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} color="#EC4899" />
                    <span>{formData.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={14} color="#EC4899" />
                    <span>{formData.department}</span>
                  </div>
                  {formData.studentId && (
                    <button
                      type="button"
                      onClick={handleCopyId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'rgba(236, 72, 153, 0.08)',
                        color: '#EC4899',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(249, 168, 212, 0.6)',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}
                      title="Click to copy ID"
                    >
                      <span>ID: {formData.studentId}</span>
                      {copiedId ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Right: Sign out button */}
            <div style={{ paddingTop: '14px' }}>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/student/login');
                }}
                className="btn btn-ghost"
                style={{ color: '#EF4444', fontSize: '0.825rem', gap: '6px', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '8px 14px' }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Stat Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Total Filed */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '18px 20px',
            border: '1.5px solid rgba(249, 168, 212, 0.45)',
            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              My Complaints
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1E1B4B', marginTop: '2px' }}>
              {userTickets.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#EC4899', fontWeight: 600, marginTop: '2px' }}>
              Total lodged tickets
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899' }}>
            <FileText size={24} />
          </div>
        </div>

        {/* Active / In-Progress */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '18px 20px',
            border: '1.5px solid rgba(249, 168, 212, 0.45)',
            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Under Resolution
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B', marginTop: '2px' }}>
              {activeTickets.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600, marginTop: '2px' }}>
              Assigned & In Progress
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
            <Clock size={24} />
          </div>
        </div>

        {/* Successfully Resolved */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '18px 20px',
            border: '1.5px solid rgba(249, 168, 212, 0.45)',
            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Resolved Issues
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
              {resolvedTickets.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, marginTop: '2px' }}>
              {resolutionRate}% Resolution Rate
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Academic Status */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '18px 20px',
            border: '1.5px solid rgba(249, 168, 212, 0.45)',
            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Academic Standing
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B', marginTop: '6px' }}>
              {formData.year}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6366F1', fontWeight: 600, marginTop: '4px' }}>
              {formData.hostel}
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
            <GraduationCap size={24} />
          </div>
        </div>
      </div>

      {/* 4. Tab Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1.5px solid rgba(249, 168, 212, 0.5)',
          paddingBottom: '2px'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'overview' ? 800 : 600,
            color: activeTab === 'overview' ? '#EC4899' : 'var(--text-secondary)',
            borderBottom: activeTab === 'overview' ? '3px solid #EC4899' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            borderRadius: '8px 8px 0 0'
          }}
        >
          <User size={16} />
          <span>Profile & Academic Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'tickets' ? 800 : 600,
            color: activeTab === 'tickets' ? '#EC4899' : 'var(--text-secondary)',
            borderBottom: activeTab === 'tickets' ? '3px solid #EC4899' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            borderRadius: '8px 8px 0 0'
          }}
        >
          <FileText size={16} />
          <span>My Tickets & History</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              backgroundColor: activeTab === 'tickets' ? '#EC4899' : 'rgba(236, 72, 153, 0.1)',
              color: activeTab === 'tickets' ? '#ffffff' : '#EC4899'
            }}
          >
            {userTickets.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'security' ? 800 : 600,
            color: activeTab === 'security' ? '#EC4899' : 'var(--text-secondary)',
            borderBottom: activeTab === 'security' ? '3px solid #EC4899' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            borderRadius: '8px 8px 0 0'
          }}
        >
          <KeyRound size={16} />
          <span>Security & Settings</span>
        </button>
      </div>

      {/* 5. Tab Content Sections */}

      {/* --- TAB 1: Profile & Academic Details --- */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
          
          {/* Main Information Form Card */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                  Personal Information
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  {isEditing ? 'Make edits below and click Save Changes.' : 'Your official campus registration records.'}
                </p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '4px' }}
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                
                {/* Full Name */}
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    className="input-control"
                    value={formData.name}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {/* Email (Official) */}
                <div>
                  <label className="input-label">Campus Email</label>
                  <input
                    type="email"
                    className="input-control"
                    value={formData.email}
                    disabled={true}
                    style={{ backgroundColor: '#F8FAFC', cursor: 'not-allowed' }}
                    title="Email is linked to your campus SSO"
                  />
                </div>

                {/* Student / Employee ID */}
                <div>
                  <label className="input-label">Student / Employee ID</label>
                  <input
                    type="text"
                    className="input-control"
                    value={formData.studentId}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="input-label">Contact Phone Number</label>
                  <input
                    type="tel"
                    className="input-control"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                {/* Academic Department */}
                <div>
                  <label className="input-label">Department / Faculty</label>
                  {isEditing ? (
                    <select
                      className="input-control"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil & Environmental Engineering">Civil & Environmental Engineering</option>
                      <option value="Management Studies & MBA">Management Studies & MBA</option>
                      <option value="Design & Architecture">Design & Architecture</option>
                      <option value="Campus Administration">Campus Administration</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="input-control"
                      value={formData.department}
                      disabled
                    />
                  )}
                </div>

                {/* Academic Year / Designation */}
                <div>
                  <label className="input-label">{isStudent ? 'Academic Year & Semester' : 'Designation / Title'}</label>
                  {isEditing && isStudent ? (
                    <select
                      className="input-control"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    >
                      <option value="1st Year (Semester 1 & 2)">1st Year (Semester 1 & 2)</option>
                      <option value="2nd Year (Semester 3 & 4)">2nd Year (Semester 3 & 4)</option>
                      <option value="3rd Year (Semester 5)">3rd Year (Semester 5)</option>
                      <option value="3rd Year (Semester 6)">3rd Year (Semester 6)</option>
                      <option value="4th Year (Final Year)">4th Year (Final Year)</option>
                      <option value="Post-Graduate / Scholar">Post-Graduate / Scholar</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="input-control"
                      value={isStudent ? formData.year : formData.designation}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value, year: e.target.value })}
                    />
                  )}
                </div>

                {/* Hostel / Residence */}
                <div>
                  <label className="input-label">{isStudent ? 'Hostel / Campus Accommodation' : 'Office Location'}</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. Gargi Hall, Room 314 or Day Scholar"
                    value={formData.hostel}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="input-label">Emergency Contact Info</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. Guardian Name & Phone"
                    value={formData.emergencyContact}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  />
                </div>

              </div>

              {/* Bio / Campus Notes */}
              <div>
                <label className="input-label">Bio / Campus Interests</label>
                <textarea
                  className="input-control"
                  rows={3}
                  placeholder="Share a short bio or notes about your campus involvement..."
                  value={formData.bio}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {isEditing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    <Save size={15} />
                    <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Right Sidebar Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Campus Credentials Card (Fully Editable in Edit Mode) */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px', background: 'linear-gradient(180deg, #ffffff 0%, #FFF5F9 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                      Campus Credentials
                    </h4>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Official ID & Verification
                    </p>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    style={{ background: 'none', border: 'none', color: '#EC4899', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit3 size={12} />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.825rem' }}>
                
                {/* 1. Enrollment Status */}
                <div style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(249, 168, 212, 0.4)' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Enrollment Status:</span>
                  {isEditing ? (
                    <select
                      className="input-control"
                      value={formData.enrollmentStatus}
                      onChange={(e) => setFormData({ ...formData, enrollmentStatus: e.target.value })}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="Enrolled & Verified">Enrolled & Verified</option>
                      <option value="Active Student">Active Student</option>
                      <option value="Dean's Honor Scholar">Dean's Honor Scholar</option>
                      <option value="Research Fellow">Research Fellow</option>
                      <option value="Exchange Student">Exchange Student</option>
                      <option value="Staff on Duty">Staff on Duty</option>
                    </select>
                  ) : (
                    <span style={{ fontWeight: 700, color: '#10B981' }}>{formData.enrollmentStatus}</span>
                  )}
                </div>

                {/* 2. Portal Role */}
                <div style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(249, 168, 212, 0.4)' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Portal Role:</span>
                  {isEditing ? (
                    <select
                      className="input-control"
                      value={formData.portalRole}
                      onChange={(e) => setFormData({ ...formData, portalRole: e.target.value })}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff Officer</option>
                      <option value="admin">Campus Admin</option>
                    </select>
                  ) : (
                    <span style={{ fontWeight: 700, color: '#EC4899', textTransform: 'capitalize' }}>{formData.portalRole}</span>
                  )}
                </div>

                {/* 3. Registered Batch / Year Range */}
                <div style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(249, 168, 212, 0.4)' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Registered Batch / Period:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      className="input-control"
                      placeholder="e.g. Academic Year 2024–2028"
                      value={formData.registeredBatch}
                      onChange={(e) => setFormData({ ...formData, registeredBatch: e.target.value })}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    />
                  ) : (
                    <span style={{ fontWeight: 600, color: '#1E1B4B' }}>{formData.registeredBatch}</span>
                  )}
                </div>

                {/* 4. SLA Priority Tier */}
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontSize: '0.75rem', fontWeight: 600 }}>SLA Service Priority:</span>
                  {isEditing ? (
                    <select
                      className="input-control"
                      value={formData.slaTier}
                      onChange={(e) => setFormData({ ...formData, slaTier: e.target.value })}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="Standard Tier (24h)">Standard Tier (24h)</option>
                      <option value="Priority Tier (12h)">Priority Tier (12h)</option>
                      <option value="Urgent Tier (6h)">Urgent Tier (6h)</option>
                      <option value="VIP Student Welfare">VIP Student Welfare</option>
                    </select>
                  ) : (
                    <span style={{ fontWeight: 700, color: '#8B5CF6' }}>{formData.slaTier}</span>
                  )}
                </div>

              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 12px 0' }}>
                Quick Shortcuts
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => openModal('submit')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', width: '100%', gap: '8px' }}
                >
                  <PlusCircle size={15} color="#EC4899" />
                  <span>File a Campus Complaint</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/complaints/my')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', width: '100%', gap: '8px' }}
                >
                  <FileText size={15} color="#EC4899" />
                  <span>View My Ticket Queue</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/departments')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', width: '100%', gap: '8px' }}
                >
                  <Building size={15} color="#EC4899" />
                  <span>Campus Departments Directory</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- TAB 2: My Tickets & Complaint History --- */}
      {activeTab === 'tickets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Controls Bar */}
          <div
            className="glass-panel"
            style={{
              padding: '16px 20px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            {/* Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setTicketFilter('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: 'none',
                  backgroundColor: ticketFilter === 'all' ? '#EC4899' : 'rgba(236, 72, 153, 0.08)',
                  color: ticketFilter === 'all' ? '#ffffff' : '#1E1B4B',
                  cursor: 'pointer'
                }}
              >
                All Tickets ({userTickets.length})
              </button>
              <button
                type="button"
                onClick={() => setTicketFilter('active')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: 'none',
                  backgroundColor: ticketFilter === 'active' ? '#F59E0B' : 'rgba(245, 158, 11, 0.1)',
                  color: ticketFilter === 'active' ? '#ffffff' : '#D97706',
                  cursor: 'pointer'
                }}
              >
                Active ({activeTickets.length})
              </button>
              <button
                type="button"
                onClick={() => setTicketFilter('resolved')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: 'none',
                  backgroundColor: ticketFilter === 'resolved' ? '#10B981' : 'rgba(16, 185, 129, 0.1)',
                  color: ticketFilter === 'resolved' ? '#ffffff' : '#10B981',
                  cursor: 'pointer'
                }}
              >
                Resolved ({resolvedTickets.length})
              </button>
            </div>

            {/* Search Input */}
            <div style={{ minWidth: '220px' }}>
              <input
                type="text"
                className="input-control"
                placeholder="Search ticket title or ID..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                style={{ padding: '6px 12px', fontSize: '0.825rem' }}
              />
            </div>
          </div>

          {/* Tickets List */}
          {filteredTickets.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="glass-panel"
                  style={{
                    padding: '18px 20px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '70%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EC4899', backgroundColor: 'rgba(236, 72, 153, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                        #{ticket.id}
                      </span>
                      {renderStatusBadge(ticket.status)}
                      {renderPriorityBadge(ticket.priority)}
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E1B4B', margin: 0 }}>
                      {ticket.title}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="#EC4899" />
                        <span>{ticket.location || 'Campus'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={13} color="#EC4899" />
                        <span>{ticket.assignedDepartment || ticket.category || 'General'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link
                      to={`/complaints/${ticket.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '6px', fontSize: '0.8rem' }}
                    >
                      <span>View Details</span>
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div
              className="glass-panel"
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                borderRadius: '20px'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(236, 72, 153, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EC4899',
                  margin: '0 auto 16px auto'
                }}
              >
                <FileText size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '6px' }}>
                No Complaints Found
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 20px auto' }}>
                {ticketSearch ? `No complaints matching "${ticketSearch}".` : "You haven't filed any complaints matching this filter yet."}
              </p>
              {isStudent && (
                <button
                  type="button"
                  onClick={() => openModal('submit')}
                  className="btn btn-primary"
                  style={{ gap: '6px' }}
                >
                  <PlusCircle size={15} />
                  <span>Raise a Campus Complaint</span>
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* --- TAB 3: Security & Preferences --- */}
      {activeTab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* Change Password Card */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: 'rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899' }}>
                <Lock size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                  Change Password
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Ensure your campus account is secured
                </p>
              </div>
            </div>

            {passwordStatus.error && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', fontSize: '0.825rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{passwordStatus.error}</span>
              </div>
            )}

            {passwordStatus.success && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', fontSize: '0.825rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>{passwordStatus.success}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Current Password</label>
                <input
                  type="password"
                  className="input-control"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">New Password (min 6 chars)</label>
                <input
                  type="password"
                  className="input-control"
                  placeholder="Enter new strong password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="input-label">Confirm New Password</label>
                <input
                  type="password"
                  className="input-control"
                  placeholder="Re-enter new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={passwordStatus.loading}
                style={{ marginTop: '6px' }}
              >
                <KeyRound size={15} />
                <span>{passwordStatus.loading ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </form>
          </div>

          {/* Notification Preferences & Session Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Notification Toggles */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: 'rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899' }}>
                  <Bell size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                    Notification Preferences
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Manage how you receive ticket updates
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E1B4B' }}>Email Ticket Updates</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Receive emails when your complaint status changes</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailUpdates}
                    onChange={(e) => setNotifPreferences({ ...notifications, emailUpdates: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#EC4899' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E1B4B' }}>SLA Escalation Alerts</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Alerts for critical & urgent campus maintenance</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.slaAlerts}
                    onChange={(e) => setNotifPreferences({ ...notifications, slaAlerts: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#EC4899' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E1B4B' }}>Weekly Campus Digest</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Weekly summary of resolved campus issues</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.weeklyDigest}
                    onChange={(e) => setNotifPreferences({ ...notifications, weeklyDigest: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#EC4899' }}
                  />
                </label>
              </div>
            </div>

            {/* Session Info */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 10px 0' }}>
                Active Session Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div><strong>Authentication:</strong> CampusCare JWT Token (Valid)</div>
                <div><strong>Client:</strong> Web Browser (Secure HTTPS)</div>
                <div><strong>Last Refreshed:</strong> Just now</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- AVATAR & PHOTO UPLOAD MODAL --- */}
      {showAvatarPicker && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(30, 27, 75, 0.45)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
          onClick={() => setShowAvatarPicker(false)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '24px',
              borderRadius: '24px',
              backgroundColor: '#ffffff',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                  Update Profile Photo
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Upload your own photo from device, pick an avatar, or enter a web link.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="btn btn-ghost"
                style={{ padding: '6px', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Preview Strip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '14px',
              backgroundColor: '#FDF2F8',
              borderRadius: '16px',
              border: '1.5px solid rgba(249, 168, 212, 0.5)',
              marginBottom: '18px'
            }}>
              <img
                src={previewAvatar || formData.avatar}
                alt="Avatar Preview"
                style={{ width: '64px', height: '64px', borderRadius: '18px', objectFit: 'cover', border: '2px solid #ffffff', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.25)', backgroundColor: '#ffffff' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E1B4B' }}>Photo Preview</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {uploadFileName ? `Selected: ${uploadFileName}` : 'Ready to be set as your campus profile picture'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleApplyAvatar(previewAvatar)}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.78rem', gap: '4px' }}
              >
                <Check size={14} />
                <span>Apply Photo</span>
              </button>
            </div>

            {/* Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px', paddingBottom: '4px' }}>
              <button
                type="button"
                onClick={() => setAvatarTab('upload')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: avatarTab === 'upload' ? 'rgba(236, 72, 153, 0.12)' : 'transparent',
                  color: avatarTab === 'upload' ? '#EC4899' : 'var(--text-secondary)',
                  fontWeight: avatarTab === 'upload' ? 800 : 600,
                  fontSize: '0.825rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Upload size={14} />
                <span>Upload from Device</span>
              </button>

              <button
                type="button"
                onClick={() => setAvatarTab('presets')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: avatarTab === 'presets' ? 'rgba(236, 72, 153, 0.12)' : 'transparent',
                  color: avatarTab === 'presets' ? '#EC4899' : 'var(--text-secondary)',
                  fontWeight: avatarTab === 'presets' ? 800 : 600,
                  fontSize: '0.825rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Image size={14} />
                <span>Avatar Gallery</span>
              </button>

              <button
                type="button"
                onClick={() => setAvatarTab('url')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: avatarTab === 'url' ? 'rgba(236, 72, 153, 0.12)' : 'transparent',
                  color: avatarTab === 'url' ? '#EC4899' : 'var(--text-secondary)',
                  fontWeight: avatarTab === 'url' ? 800 : 600,
                  fontSize: '0.825rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <ExternalLink size={14} />
                <span>Web Image Link</span>
              </button>
            </div>

            {/* TAB: UPLOAD FROM DEVICE / GALLERY */}
            {avatarTab === 'upload' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(236, 72, 153, 0.4)',
                    borderRadius: '16px',
                    padding: '28px 16px',
                    textAlign: 'center',
                    backgroundColor: '#FFFDFE',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#EC4899'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)'}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899' }}>
                    <Upload size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E1B4B' }}>
                      Click to Browse Gallery or Folder
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Supports JPG, PNG, WEBP & GIF up to 5MB
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '4px', gap: '6px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <Image size={14} />
                    <span>Choose Photo from Device</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: PRESET GALLERY */}
            {avatarTab === 'presets' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                  {avatarPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewAvatar(preset.url)}
                      style={{
                        border: previewAvatar === preset.url ? '3px solid #EC4899' : '2px solid rgba(249, 168, 212, 0.35)',
                        borderRadius: '16px',
                        padding: '4px',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#1E1B4B', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                        {preset.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: WEB URL */}
            {avatarTab === 'url' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label className="input-label">Image URL</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="url"
                    className="input-control"
                    placeholder="https://images.unsplash.com/..."
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={!customAvatarUrl}
                    onClick={() => {
                      if (customAvatarUrl) {
                        setPreviewAvatar(customAvatarUrl);
                        addToast({ type: 'info', title: 'Preview Loaded', message: 'Click Apply Photo to save.' });
                      }
                    }}
                  >
                    Preview
                  </button>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => {
                  const def = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name || 'Priya')}`;
                  setPreviewAvatar(def);
                }}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', gap: '4px' }}
              >
                <RefreshCw size={13} />
                <span>Reset to Default</span>
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyAvatar(previewAvatar)}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '6px' }}
                >
                  <Save size={14} />
                  <span>Save Photo</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
