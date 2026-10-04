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
  ListFilter,
  BarChart3,
  LogOut,
  Link2,
  Clipboard,
  AlertTriangle,
  Globe,
  Loader2,
  Trash2,
  UserMinus,
  UserPlus,
  Archive
} from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * Intelligent Image URL cleaner & resolver
 * Extracts real direct image URLs from Google Images redirects, Unsplash, Pexels, Pixabay, Wikipedia/Wikimedia, GitHub, Imgur, Reddit, Giphy, and Pinterest.
 */
export const cleanAndResolveImageUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let cleaned = rawUrl.trim();
  
  // Strip wrapper quotes, backticks, brackets, parentheses
  cleaned = cleaned.replace(/^["'`<(\[]+|["'`>)\]]+$/g, '').trim();
  
  // If HTML img tag format: <img ... src="url" ...>
  const htmlImgMatch = cleaned.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlImgMatch) cleaned = htmlImgMatch[1].trim();

  // If markdown link format: ![title](url) or [title](url)
  const mdMatch = cleaned.match(/\((https?:\/\/[^\s)]+)\)/i);
  if (mdMatch) cleaned = mdMatch[1].trim();

  // If BBCode format: [img]url[/img]
  const bbMatch = cleaned.match(/\[img\](.*?)\[\/img\]/i);
  if (bbMatch) cleaned = bbMatch[1].trim();

  // Replace HTML entity &amp; with & (critical for Reddit and image search URLs)
  cleaned = cleaned.replace(/&amp;/g, '&');

  // Handle data URLs directly
  if (cleaned.startsWith('data:image/')) return cleaned;

  // If protocol-relative url: //example.com/pic.jpg
  if (cleaned.startsWith('//')) {
    cleaned = 'https:' + cleaned;
  }

  // If user pasted bare domain or image path without protocol: e.g. images.unsplash.com/...
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    if (cleaned.includes('.') && !cleaned.includes(' ')) {
      cleaned = 'https://' + cleaned;
    }
  }

  try {
    const parsed = new URL(cleaned);
    
    // 1. Google Images Search / Redirect URL handler
    // e.g. https://www.google.com/imgres?imgurl=https%3A%2F%2F...&tbnid=...
    // e.g. https://www.google.com/url?sa=i&url=...
    if (parsed.hostname.includes('google.')) {
      const imgParam = parsed.searchParams.get('imgurl') || 
                       parsed.searchParams.get('url') || 
                       parsed.searchParams.get('q') ||
                       parsed.searchParams.get('src');
      if (imgParam && (imgParam.startsWith('http://') || imgParam.startsWith('https://') || imgParam.startsWith('data:image/'))) {
        return cleanAndResolveImageUrl(decodeURIComponent(imgParam));
      }
    }

    // Google Encrypted Images Thumbnail CDN: Keep as is, it works directly
    if (parsed.hostname.includes('gstatic.com')) {
      return cleaned;
    }
    
    // 2. Unsplash Page URL -> Direct High-Res Image URL
    // e.g. https://unsplash.com/photos/a-woman-smiling-d1UPkiFd04A or https://unsplash.com/photos/d1UPkiFd04A
    if (parsed.hostname.includes('unsplash.com')) {
      if (parsed.pathname.startsWith('/photos/')) {
        const parts = parsed.pathname.split('/').filter(Boolean);
        const photoSlug = parts[parts.length - 1];
        const match = photoSlug.match(/([a-zA-Z0-9_-]+)$/);
        if (match) {
          return `https://images.unsplash.com/photo-${match[1]}?w=400&auto=format&fit=crop&q=80`;
        }
      }
    }

    // 3. Pexels Page URL -> Direct Image URL
    // e.g. https://www.pexels.com/photo/smiling-woman-1239291/ or https://www.pexels.com/photo/1239291/
    if (parsed.hostname.includes('pexels.com')) {
      if (parsed.pathname.includes('/photo/')) {
        const parts = parsed.pathname.split('/').filter(Boolean);
        const lastPart = parts[parts.length - 1];
        const match = lastPart.match(/(\d+)/);
        if (match) {
          const photoId = match[1];
          return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=400`;
        }
      }
    }

    // 4. Pixabay Page URL -> Direct Image URL
    // e.g. https://pixabay.com/photos/girl-portrait-face-3064489/
    if (parsed.hostname.includes('pixabay.com')) {
      if (parsed.pathname.includes('/photos/')) {
        const parts = parsed.pathname.split('/').filter(Boolean);
        const lastPart = parts[parts.length - 1];
        const match = lastPart.match(/(\d+)/);
        if (match) {
          const photoId = match[1];
          return `https://pixabay.com/get/g${photoId}_640.jpg`;
        }
      }
    }

    // 5. Wikimedia Commons / Wikipedia File page -> Direct File URL
    // e.g. https://commons.wikimedia.org/wiki/File:Example.jpg
    if (parsed.hostname.includes('wikipedia.org') || parsed.hostname.includes('wikimedia.org')) {
      if (parsed.pathname.includes('File:') || parsed.pathname.includes('file:')) {
        const fileMatch = parsed.pathname.match(/(?:File|file):([^&?#/]+)/);
        if (fileMatch) {
          const fileName = fileMatch[1];
          return `https://commons.wikimedia.org/wiki/Special:FilePath/${fileName}?width=400`;
        }
      }
    }

    // 6. Imgur Webpage URL -> Direct Image URL
    // e.g. https://imgur.com/ABCDEF or https://imgur.com/gallery/ABCDEF or https://imgur.com/a/ABCDEF
    if (parsed.hostname.includes('imgur.com') && !parsed.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      const id = parts[parts.length - 1];
      if (id && id.length >= 4 && id.length <= 12) {
        return `https://i.imgur.com/${id}.jpg`;
      }
    }

    // 7. GitHub profile URL -> Direct Avatar URL
    // e.g. https://github.com/torvalds -> https://github.com/torvalds.png?size=200
    if (parsed.hostname === 'github.com' || parsed.hostname === 'www.github.com') {
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length === 1 && !parts[0].includes('.')) {
        return `https://github.com/${parts[0]}.png?size=200`;
      }
    }

    // 8. Giphy & Tenor
    if (parsed.hostname.includes('giphy.com') && parsed.pathname.includes('/gifs/')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      const slug = parts[parts.length - 1];
      const match = slug.match(/([a-zA-Z0-9]+)$/);
      if (match) {
        return `https://i.giphy.com/media/${match[1]}/giphy.gif`;
      }
    }

    // 9. Reddit preview images: fix &amp;
    if (parsed.hostname.includes('preview.redd.it') || parsed.hostname.includes('i.redd.it')) {
      return cleaned.replace(/&amp;/g, '&');
    }

    // 10. DiceBear seed URL generator
    if (parsed.hostname.includes('dicebear.com')) {
      return cleaned;
    }

    return cleaned;
  } catch (e) {
    return cleaned;
  }
};

/**
 * Returns a CORS-safe, anti-hotlinking proxy URL for third-party web images
 */
export const getSafeProxyUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:image/') || url.startsWith('blob:')) return url;
  if (url.includes('wsrv.nl') || url.includes('images.weserv.nl') || url.includes('dicebear.com') || url.includes('github.com')) {
    return url;
  }
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=400&output=webp`;
};

/**
 * Converts any accessible image URL into a high quality permanent Base64 Data URL
 */
export const convertImageToDataUrl = (imageUrl, maxWidth = 400, maxHeight = 400) => {
  return new Promise((resolve) => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return resolve(imageUrl);
    }
    if (imageUrl.startsWith('data:image/')) {
      return resolve(imageUrl);
    }

    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.referrerPolicy = 'no-referrer';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.naturalWidth || img.width || 400;
        let height = img.naturalHeight || img.height || 400;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
      } catch (canvasErr) {
        console.warn('Canvas conversion notice, using URL directly:', canvasErr);
        resolve(imageUrl);
      }
    };

    img.onerror = () => {
      // If direct load failed for canvas, try via CORS-safe wsrv.nl proxy
      if (!imageUrl.includes('wsrv.nl')) {
        const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=400&output=jpg`;
        const proxyImg = new window.Image();
        proxyImg.crossOrigin = 'Anonymous';
        proxyImg.referrerPolicy = 'no-referrer';
        proxyImg.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = proxyImg.width || 400;
            canvas.height = proxyImg.height || 400;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(proxyImg, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
          } catch (e) {
            resolve(proxyUrl);
          }
        };
        proxyImg.onerror = () => resolve(imageUrl);
        proxyImg.src = proxyUrl;
      } else {
        resolve(imageUrl);
      }
    };

    img.src = imageUrl;
  });
};

export const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { 
    complaints = [], 
    addToast, 
    openModal,
    currentPersona 
  } = useApp();

  // Role detection: Staff / Admin vs Student
  const isAdmin = user?.role === 'admin' || currentPersona?.role === 'admin' || (user?.email && user.email.toLowerCase().includes('admin'));
  const isStaff = (user?.role === 'staff' || currentPersona?.role === 'staff' || (user?.email && (user.email.toLowerCase().includes('staff') || user.email.toLowerCase().includes('alex') || user.email.toLowerCase().includes('devin')))) && !isAdmin;
  const isStaffOrAdmin = isAdmin || isStaff;
  const isStudent = !isStaffOrAdmin;

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tickets' | 'security'
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Avatar Picker Modal state
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarTab, setAvatarTab] = useState('upload'); // 'upload' | 'presets' | 'url'
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [urlStatus, setUrlStatus] = useState('idle'); // 'idle' | 'loading' | 'valid' | 'error'
  const [urlErrorMessage, setUrlErrorMessage] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [converting, setConverting] = useState(false);
  const [urlProxyLoaded, setUrlProxyLoaded] = useState(false);

  // Profile Form state
  const [formData, setFormData] = useState(() => {
    return {
      name: user?.name || (isAdmin ? 'Dean Sarah Jenkins' : isStaff ? 'Devin Thorne' : 'Priya Sharma'),
      email: user?.email || (isAdmin ? 'admin@college.edu' : isStaff ? 'devin.thorne@college.edu' : 'priya.sharma@college.edu'),
      phone: user?.phone || '+91 98765 43210',
      studentId: user?.studentId || (isStaffOrAdmin ? 'EMP-2024-1042' : 'STU-2024-8841'),
      department: user?.department || (isAdmin ? 'Campus Administration' : isStaff ? 'IT Services & Network Infrastructure' : 'Computer Science & Engineering'),
      year: user?.year || (isStaffOrAdmin ? 'Executive Faculty' : '3rd Year (Semester 5)'),
      hostel: user?.hostel || (isStaffOrAdmin ? 'Campus Staff Residence A-4' : 'Gargi Hall, Room 314'),
      designation: user?.designation || user?.roleTitle || (isAdmin ? 'Dean of Campus Infrastructure & Student Welfare' : isStaff ? 'Lead Systems Specialist' : 'Undergraduate Scholar'),
      bio: user?.bio || (isStaffOrAdmin ? 'Dedicated campus administrator ensuring safe infrastructure and timely resolution of collegiate complaints.' : 'Passionate student advocating for a cleaner, smarter, and safer campus community.'),
      emergencyContact: user?.emergencyContact || (isStaffOrAdmin ? 'Campus Helpdesk (+91 98450 11223)' : 'Dr. M. Sharma (+91 98765 11223)'),
      avatar: user?.avatar || (isAdmin ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80' : isStaff ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'),
      enrollmentStatus: user?.enrollmentStatus || (isStaffOrAdmin ? 'Active Faculty / Staff' : 'Enrolled & Verified'),
      portalRole: user?.portalRole || user?.role || (isAdmin ? 'admin' : isStaff ? 'staff' : 'student'),
      registeredBatch: user?.registeredBatch || (isStaffOrAdmin ? 'Appointed 2024' : 'Academic Year 2024–2028'),
      slaTier: user?.slaTier || (isStaffOrAdmin ? 'Admin Escalation Authority' : 'Standard Tier (24h)')
    };
  });

  // Password Form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: '', success: '' });

  // Student Registry State (Admin only - manage all students' credentials)
  const [studentRegistry, setStudentRegistry] = useState(() => {
    const saved = localStorage.getItem('campuscare_student_registry_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'usr_student_1',
        name: 'Priya Sharma',
        email: 'priya.sharma@college.edu',
        studentId: 'STU-2024-8841',
        department: 'Computer Science & Engineering',
        year: '3rd Year (Semester 5)',
        hostel: 'Gargi Hall, Room 314',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        enrollmentStatus: 'Enrolled & Verified',
        portalRole: 'student',
        registeredBatch: 'Academic Year 2024–2028',
        slaTier: 'Standard Tier (24h)'
      },
      {
        id: 'usr_student_2',
        name: 'Rahul Verma',
        email: 'rahul.verma@campuscare.edu',
        studentId: 'STU-2024-9102',
        department: 'Mechanical Engineering',
        year: '2nd Year (Semester 3)',
        hostel: 'Aryabhatta Hostel, Room 108',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        enrollmentStatus: 'Enrolled & Verified',
        portalRole: 'student',
        registeredBatch: 'Academic Year 2024–2028',
        slaTier: 'Standard Tier (24h)'
      },
      {
        id: 'usr_stu_1790044542789',
        name: 'kerti',
        email: 'jcer@2026',
        studentId: 'cs2025035',
        department: 'Computer Science & Engineering',
        year: '1st Year',
        hostel: 'Day Scholar',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kerti',
        enrollmentStatus: 'Enrolled & Verified',
        portalRole: 'student',
        registeredBatch: 'Academic Year 2025–2029',
        slaTier: 'Standard Tier (24h)'
      },
      {
        id: 'usr_stu_1789998395896',
        name: 'Test Student',
        email: 'test.student@college.edu',
        studentId: 'STU-2026-9999',
        department: 'Computer Science',
        year: '2nd Year',
        hostel: 'Block A',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Test%20Student',
        enrollmentStatus: 'Enrolled & Verified',
        portalRole: 'student',
        registeredBatch: 'Academic Year 2024–2028',
        slaTier: 'Standard Tier (24h)'
      }
    ];
  });

  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState(null);
  const [editingStudentData, setEditingStudentData] = useState(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');

  const handleOpenEditStudentModal = (student) => {
    setSelectedStudentForEdit(student);
    setEditingStudentData({
      ...student,
      enrollmentStatus: student.enrollmentStatus || 'Enrolled & Verified',
      portalRole: student.portalRole || 'student',
      registeredBatch: student.registeredBatch || 'Academic Year 2024–2028',
      slaTier: student.slaTier || 'Standard Tier (24h)',
      department: student.department || 'Computer Science & Engineering',
      year: student.year || '3rd Year (Semester 5)'
    });
  };

  const handleSaveStudentCredentials = () => {
    if (!editingStudentData || !selectedStudentForEdit) return;

    setStudentRegistry(prev => {
      const updated = prev.map(s => s.id === selectedStudentForEdit.id ? { ...s, ...editingStudentData } : s);
      localStorage.setItem('campuscare_student_registry_v1', JSON.stringify(updated));
      return updated;
    });

    if (user?.id === selectedStudentForEdit.id || user?.studentId === selectedStudentForEdit.studentId || user?.email === selectedStudentForEdit.email) {
      updateProfile({
        enrollmentStatus: editingStudentData.enrollmentStatus,
        portalRole: editingStudentData.portalRole,
        registeredBatch: editingStudentData.registeredBatch,
        slaTier: editingStudentData.slaTier,
        department: editingStudentData.department,
        year: editingStudentData.year
      });
    }

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    addToast({
      type: 'success',
      title: 'Student Credentials Updated 🛡️✨',
      message: `Updated institutional credentials for ${selectedStudentForEdit.name}.`
    });

    setSelectedStudentForEdit(null);
    setEditingStudentData(null);
  };

  // Student Lifecycle Management States
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentFormData, setNewStudentFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: 'Computer Science & Engineering',
    year: '1st Year (Semester 1)',
    hostel: 'Gargi Hall',
    registeredBatch: 'Academic Year 2025–2029',
    slaTier: 'Standard Tier (24h)',
    enrollmentStatus: 'Enrolled & Verified',
    portalRole: 'student'
  });

  const handleGraduateStudent = (student) => {
    if (!student) return;
    const isAlreadyGraduated = (student.enrollmentStatus || '').includes('Graduated') || (student.enrollmentStatus || '').includes('Alumnus');
    const newStatus = isAlreadyGraduated ? 'Enrolled & Verified' : 'Graduated / Alumnus';

    setStudentRegistry(prev => {
      const updated = prev.map(s => s.id === student.id ? { ...s, enrollmentStatus: newStatus } : s);
      localStorage.setItem('campuscare_student_registry_v1', JSON.stringify(updated));
      return updated;
    });

    if (user?.id === student.id || user?.studentId === student.studentId || user?.email === student.email) {
      updateProfile({ enrollmentStatus: newStatus });
    }

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    addToast({
      type: 'success',
      title: isAlreadyGraduated ? 'Student Reactivated 🎓' : 'Student Marked as Graduated Alumnus 🎓🎉',
      message: `${student.name} is now marked as "${newStatus}". Historical tickets are preserved.`
    });
  };

  const handleDeleteStudentConfirm = () => {
    if (!studentToDelete) return;
    setStudentRegistry(prev => {
      const updated = prev.filter(s => s.id !== studentToDelete.id);
      localStorage.setItem('campuscare_student_registry_v1', JSON.stringify(updated));
      return updated;
    });

    addToast({
      type: 'info',
      title: 'Student Record Removed 🗑️',
      message: `${studentToDelete.name} (${studentToDelete.studentId}) was removed from the active campus registry.`
    });

    setStudentToDelete(null);
    if (selectedStudentForEdit?.id === studentToDelete.id) {
      setSelectedStudentForEdit(null);
      setEditingStudentData(null);
    }
  };

  const handleRegisterNewStudent = (e) => {
    e?.preventDefault();
    if (!newStudentFormData.name.trim() || !newStudentFormData.studentId.trim()) {
      addToast({ type: 'warning', title: 'Missing Information', message: 'Please provide at least a Student Name and Student ID.' });
      return;
    }

    const newId = `usr_stu_${Date.now()}`;
    const newStudent = {
      ...newStudentFormData,
      id: newId,
      name: newStudentFormData.name.trim(),
      studentId: newStudentFormData.studentId.trim(),
      email: newStudentFormData.email.trim() || `${newStudentFormData.name.toLowerCase().replace(/\s+/g, '.')}@college.edu`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newStudentFormData.name.trim())}`
    };

    setStudentRegistry(prev => {
      const updated = [newStudent, ...prev];
      localStorage.setItem('campuscare_student_registry_v1', JSON.stringify(updated));
      return updated;
    });

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    addToast({
      type: 'success',
      title: 'New Student Registered 🎓✨',
      message: `Successfully enrolled ${newStudent.name} into ${newStudent.department}.`
    });

    setShowAddStudentModal(false);
    setNewStudentFormData({
      name: '',
      email: '',
      studentId: '',
      department: 'Computer Science & Engineering',
      year: '1st Year (Semester 1)',
      hostel: 'Gargi Hall',
      registeredBatch: 'Academic Year 2025–2029',
      slaTier: 'Standard Tier (24h)',
      enrollmentStatus: 'Enrolled & Verified',
      portalRole: 'student'
    });
  };

  // Notification Preferences
  const [notifications, setNotifPreferences] = useState({
    emailUpdates: true,
    smsAlerts: false,
    slaAlerts: true,
    weeklyDigest: false
  });

  // Ticket Filters in Tab 2 (Student only)
  const [ticketFilter, setTicketFilter] = useState('all'); // 'all' | 'active' | 'resolved'
  const [ticketSearch, setTicketSearch] = useState('');

  // Sync form data with current user and Admin Student Registry
  useEffect(() => {
    if (user) {
      const userIsAdmin = user.role === 'admin' || (user.email && user.email.toLowerCase().includes('admin'));
      const userIsStaff = (user.role === 'staff' || (user.email && (user.email.toLowerCase().includes('staff') || user.email.toLowerCase().includes('alex') || user.email.toLowerCase().includes('devin')))) && !userIsAdmin;
      const userIsStaffOrAdmin = userIsAdmin || userIsStaff;

      // Check if Admin made any updates in the official Student Registry
      let registryStudent = null;
      if (!userIsStaffOrAdmin) {
        try {
          const savedRegistry = localStorage.getItem('campuscare_student_registry_v1');
          if (savedRegistry) {
            const list = JSON.parse(savedRegistry);
            registryStudent = list.find(s => 
              (user.id && s.id === user.id) || 
              (user.studentId && s.studentId === user.studentId) ||
              (user.email && s.email?.toLowerCase() === user.email?.toLowerCase()) ||
              (user.name && s.name?.toLowerCase() === user.name?.toLowerCase())
            );
          }
        } catch (e) {}
      }
      
      const defaultAvatar = userIsAdmin
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
        : userIsStaff
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
          : (registryStudent?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || 'Priya')}`);

      setFormData(prev => ({
        ...prev,
        name: registryStudent?.name || user.name || (userIsAdmin ? 'Dean Sarah Jenkins' : userIsStaff ? 'Devin Thorne' : 'Priya Sharma'),
        email: registryStudent?.email || user.email || (userIsAdmin ? 'admin@college.edu' : userIsStaff ? 'devin.thorne@college.edu' : 'priya.sharma@college.edu'),
        phone: user.phone || prev.phone || '+91 98765 43210',
        studentId: registryStudent?.studentId || user.studentId || (userIsStaffOrAdmin ? 'EMP-2024-1042' : 'STU-2024-8841'),
        department: registryStudent?.department || user.department || (userIsAdmin ? 'Campus Administration' : userIsStaff ? 'IT Services & Network Infrastructure' : 'Computer Science & Engineering'),
        year: registryStudent?.year || user.year || (userIsStaffOrAdmin ? 'Executive Faculty' : '3rd Year (Semester 5)'),
        hostel: user.hostel || (userIsStaffOrAdmin ? 'Campus Staff Residence A-4' : 'Gargi Hall, Room 314'),
        designation: user.designation || user.roleTitle || (userIsAdmin ? 'Dean of Campus Infrastructure & Student Welfare' : userIsStaff ? 'Lead Systems Specialist' : 'Undergraduate Scholar'),
        bio: user.bio || (userIsStaffOrAdmin ? 'Dedicated campus administrator ensuring safe infrastructure and timely resolution of collegiate complaints.' : 'Passionate student advocating for a cleaner, smarter, and safer campus community.'),
        emergencyContact: user.emergencyContact || (userIsStaffOrAdmin ? 'Campus Helpdesk (+91 98450 11223)' : 'Dr. M. Sharma (+91 98765 11223)'),
        avatar: registryStudent?.avatar || user.avatar || prev.avatar || defaultAvatar,
        enrollmentStatus: registryStudent?.enrollmentStatus || user.enrollmentStatus || (userIsStaffOrAdmin ? 'Active Faculty / Staff' : 'Enrolled & Verified'),
        portalRole: user.portalRole || user.role || (userIsAdmin ? 'admin' : userIsStaff ? 'staff' : 'student'),
        registeredBatch: registryStudent?.registeredBatch || user.registeredBatch || (userIsStaffOrAdmin ? 'Appointed 2024' : 'Academic Year 2024–2028'),
        slaTier: registryStudent?.slaTier || user.slaTier || (userIsStaffOrAdmin ? 'Admin Escalation Authority' : 'Standard Tier (24h)')
      }));
      setPreviewAvatar(registryStudent?.avatar || user.avatar || defaultAvatar);
    }
  }, [user]);

  // If staff/admin is on tickets tab, switch back to overview
  useEffect(() => {
    if (isStaffOrAdmin && activeTab === 'tickets') {
      setActiveTab('overview');
    }
  }, [isStaffOrAdmin, activeTab]);

  // For Students: User's reported tickets
  const userTickets = (complaints || []).filter(item => {
    if (!item) return false;
    if (user?.id && item.student?.id && String(item.student.id) === String(user.id)) return true;
    if (user?.email && item.student?.email && item.student.email.toLowerCase() === user.email.toLowerCase()) return true;
    if (user?.studentId && item.student?.studentId && item.student.studentId.toLowerCase() === user.studentId.toLowerCase()) return true;
    if (user?.studentId && item.studentId && item.studentId.toLowerCase() === user.studentId.toLowerCase()) return true;
    if (item.student?.name && user?.name && item.student.name.toLowerCase().includes(user.name.toLowerCase().split(' ')[0])) return true;
    return false;
  });

  const resolvedTickets = userTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');
  const activeTickets = userTickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed');
  const resolutionRate = userTickets.length > 0 ? Math.round((resolvedTickets.length / userTickets.length) * 100) : 100;

  // Filtered tickets in Student Tab 2
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
    { name: 'Dean Jenkins', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80' },
    { name: 'Staff Specialist', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
    { name: 'Priya Sharma', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
    { name: 'Student Female', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
    { name: 'Student Male', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80' },
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
    processImageFile(file);
  };

  // Process raw Image File (from file input, drag & drop, or clipboard)
  const processImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        title: 'Invalid File',
        message: 'Please select a valid image file (JPG, PNG, WEBP, GIF).'
      });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'File Too Large',
        message: 'Please select an image smaller than 8MB.'
      });
      return;
    }

    setUploadFileName(file.name || 'Device Photo');
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result;
      if (dataUrl) {
        setPreviewAvatar(dataUrl);
        setCustomAvatarUrl(dataUrl);
        setUrlStatus('valid');
        setUrlProxyLoaded(false);
        setUrlErrorMessage('');
        setAvatarTab('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop handlers for file dropzone
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  // Global Ctrl+V Paste Listener when modal is open
  useEffect(() => {
    if (!showAvatarPicker) return;

    const handleGlobalPaste = (e) => {
      // 1. Check for clipboard binary images (e.g. copied from web page or screenshot)
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith('image/')) {
            const file = items[i].getAsFile();
            if (file) {
              e.preventDefault();
              processImageFile(file);
              addToast({
                type: 'success',
                title: 'Photo Pasted from Clipboard 📸',
                message: 'Copied image loaded successfully!'
              });
              return;
            }
          }
        }
      }

      // 2. Check for clipboard text / URL
      const text = e.clipboardData?.getData('text');
      if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image/') || text.includes('.'))) {
        e.preventDefault();
        setAvatarTab('url');
        handleUrlChange(text.trim());
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [showAvatarPicker]);

  // Sample quick web images for testing/inspiration
  const sampleWebImages = [
    { name: 'Student Scholar', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
    { name: 'Tech Engineer', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80' },
    { name: 'Professional Headshot', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
    { name: 'Campus Leader', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
    { name: '3D Avatar Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CampusCare' }
  ];

  // Validate and load image from URL live in real time with automatic CORS Proxy fallback
  const handleUrlChange = (rawUrl) => {
    if (rawUrl === undefined || rawUrl === null) return;
    
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      setCustomAvatarUrl('');
      setUrlStatus('idle');
      setUrlProxyLoaded(false);
      setUrlErrorMessage('');
      return;
    }

    const resolved = cleanAndResolveImageUrl(trimmed);
    setCustomAvatarUrl(resolved);

    if (!resolved.startsWith('http://') && !resolved.startsWith('https://') && !resolved.startsWith('data:image/')) {
      setUrlStatus('error');
      setUrlProxyLoaded(false);
      setUrlErrorMessage('Please enter a valid URL starting with https://, http://, or data:image');
      return;
    }

    // Immediately set preview and loading status
    setPreviewAvatar(resolved);
    setUrlStatus('loading');
    setUrlProxyLoaded(false);
    setUrlErrorMessage('');

    // Pre-test direct image loading with no-referrer
    const img = new window.Image();
    img.referrerPolicy = 'no-referrer';

    let isFinished = false;

    // Timeout safety
    const safetyTimer = setTimeout(() => {
      if (!isFinished) {
        // If timed out, try proxy fallback
        tryProxyFallback(resolved);
      }
    }, 4500);

    const tryProxyFallback = (targetUrl) => {
      if (isFinished) return;
      if (!targetUrl.startsWith('data:image/') && !targetUrl.includes('wsrv.nl') && !targetUrl.includes('images.weserv.nl')) {
        const proxyUrl = getSafeProxyUrl(targetUrl);
        const proxyImg = new window.Image();
        proxyImg.referrerPolicy = 'no-referrer';

        proxyImg.onload = () => {
          if (isFinished) return;
          isFinished = true;
          clearTimeout(safetyTimer);
          setUrlStatus('valid');
          setUrlProxyLoaded(true);
          setPreviewAvatar(proxyUrl);
          setUrlErrorMessage('');
        };

        proxyImg.onerror = () => {
          if (isFinished) return;
          isFinished = true;
          clearTimeout(safetyTimer);
          setUrlStatus('error');
          setUrlProxyLoaded(false);
          setUrlErrorMessage('Unable to load image from this web address. Tip: Right-click the image in your browser and click "Copy image", then press Ctrl+V here to paste it directly!');
        };

        proxyImg.src = proxyUrl;
      } else {
        isFinished = true;
        clearTimeout(safetyTimer);
        setUrlStatus('error');
        setUrlProxyLoaded(false);
        setUrlErrorMessage('Unable to load image. Please verify the URL points directly to an image or upload it from your device.');
      }
    };

    img.onload = () => {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(safetyTimer);
      setUrlStatus('valid');
      setUrlProxyLoaded(false);
      setPreviewAvatar(resolved);
      setUrlErrorMessage('');
    };

    img.onerror = () => {
      if (isFinished) return;
      tryProxyFallback(resolved);
    };

    img.src = resolved;
  };

  // Convert current preview to permanent local Base64 Data URL
  const handleConvertToLocalDataUrl = async () => {
    const current = previewAvatar || customAvatarUrl;
    if (!current) return;
    if (current.startsWith('data:image/')) {
      addToast({
        type: 'info',
        title: 'Already Offline-Ready',
        message: 'This photo is already permanently embedded.'
      });
      return;
    }

    setConverting(true);
    try {
      const dataUrl = await convertImageToDataUrl(current);
      if (dataUrl && dataUrl.startsWith('data:image/')) {
        setPreviewAvatar(dataUrl);
        setCustomAvatarUrl(dataUrl);
        setUrlStatus('valid');
        setUrlProxyLoaded(false);
        addToast({
          type: 'success',
          title: 'Converted to Local Photo 📸✨',
          message: 'Your photo is now 100% offline-ready and permanent.'
        });
      }
    } catch (e) {
      console.warn('Conversion failed:', e);
    } finally {
      setConverting(false);
    }
  };

  // Quick paste link / image from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      // 1. Check for clipboard binary images (e.g. screenshot or copied image)
      if (navigator.clipboard && navigator.clipboard.read) {
        try {
          const clipboardItems = await navigator.clipboard.read();
          for (const item of clipboardItems) {
            const imageType = item.types.find(type => type.startsWith('image/'));
            if (imageType) {
              const blob = await item.getType(imageType);
              processImageFile(blob);
              addToast({
                type: 'success',
                title: 'Photo Pasted from Clipboard 📸✨',
                message: 'Ready to be set as your profile picture.'
              });
              return;
            }
          }
        } catch (clipErr) {
          // Fall through to text read
        }
      }

      // 2. Read clipboard text URL
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setAvatarTab('url');
          handleUrlChange(text.trim());
          addToast({
            type: 'info',
            title: 'Link Pasted 📋',
            message: 'Loading image preview from web...'
          });
        } else {
          addToast({
            type: 'warning',
            title: 'Clipboard Empty',
            message: 'Copy an image link (or right-click image > "Copy image") in your browser, then click Paste.'
          });
        }
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
      addToast({
        type: 'info',
        title: 'Paste Tip',
        message: 'Press Ctrl+V on your keyboard to paste the copied image or link directly.'
      });
    }
  };

  // Save selected avatar
  const handleApplyAvatar = async (avatarUrlToApply) => {
    let targetUrl = avatarUrlToApply;
    if (!targetUrl) {
      if (avatarTab === 'url' && customAvatarUrl?.trim()) {
        targetUrl = customAvatarUrl.trim();
      } else {
        targetUrl = previewAvatar;
      }
    }
    if (!targetUrl) return;

    // Automatically convert external URLs to permanent Base64 Data URL for 100% offline & hotlink protection resilience
    let finalUrl = targetUrl;
    try {
      if (!targetUrl.startsWith('data:image/') && !targetUrl.startsWith('blob:')) {
        const converted = await convertImageToDataUrl(targetUrl);
        if (converted && converted.startsWith('data:image/')) {
          finalUrl = converted;
        }
      }
    } catch (convErr) {
      console.warn('Auto convert noticed, applying target URL:', convErr);
    }

    setFormData(prev => ({ ...prev, avatar: finalUrl }));
    setPreviewAvatar(finalUrl);
    try {
      await updateProfile({ avatar: finalUrl });
      addToast({
        type: 'success',
        title: 'Profile Photo Updated ✨',
        message: 'Your new avatar has been saved.'
      });
      setShowAvatarPicker(false);
      setUploadFileName('');
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update profile photo.'
      });
    }
  };

  // Copy Student / Staff ID to clipboard
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

  // Save Profile Form (Personal Details: Phone, Hostel, Bio, Contact, Photo)
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        year: formData.year,
        hostel: formData.hostel,
        designation: formData.designation,
        bio: formData.bio,
        emergencyContact: formData.emergencyContact,
        avatar: formData.avatar
      };

      // Only Admin can include campus credentials in profile updates
      if (isAdmin) {
        payload.enrollmentStatus = formData.enrollmentStatus;
        payload.portalRole = formData.portalRole;
        payload.registeredBatch = formData.registeredBatch;
        payload.slaTier = formData.slaTier;
      }

      await updateProfile(payload);

      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (err) {}

      addToast({
        type: 'success',
        title: 'Profile Updated ✨',
        message: 'Your personal details have been saved.'
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

  // Save Campus Credentials (Admin only)
  const handleSaveCredentials = async (e) => {
    if (e) e.preventDefault();
    setSavingCredentials(true);
    try {
      await updateProfile({
        studentId: formData.studentId,
        department: formData.department,
        enrollmentStatus: formData.enrollmentStatus,
        portalRole: formData.portalRole,
        registeredBatch: formData.registeredBatch,
        slaTier: formData.slaTier,
        role: formData.portalRole
      });

      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      } catch (err) {}

      addToast({
        type: 'success',
        title: 'Credentials Updated 🛡️✨',
        message: 'Campus credentials, institutional status, and SLA tier have been saved.'
      });
      setIsEditingCredentials(false);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Could not update campus credentials.'
      });
    } finally {
      setSavingCredentials(false);
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
        return <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6', whiteSpace: 'nowrap' }}>Submitted</span>;
      case 'Under Review':
        return <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#D97706', whiteSpace: 'nowrap' }}>Under Review</span>;
      case 'Assigned':
        return <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(14, 165, 233, 0.12)', color: '#0284C7', whiteSpace: 'nowrap' }}>Assigned</span>;
      case 'In Progress':
        return <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#6366F1', whiteSpace: 'nowrap' }}>In Progress</span>;
      case 'Resolved':
        return <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10B981', whiteSpace: 'nowrap' }}>Resolved</span>;
      default:
        return <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(100, 116, 139, 0.12)', color: '#64748B', whiteSpace: 'nowrap' }}>{status || 'Closed'}</span>;
    }
  };

  // Priority Badge Helper
  const renderPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
      case 'critical':
        return <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#EC4899', backgroundColor: '#FDF2F8', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(236, 72, 153, 0.3)', whiteSpace: 'nowrap' }}>Critical</span>;
      case 'high':
        return <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#F59E0B', backgroundColor: '#FFFBEB', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)', whiteSpace: 'nowrap' }}>High</span>;
      case 'medium':
        return <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0EA5E9', backgroundColor: '#F0F9FF', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(14, 165, 233, 0.3)', whiteSpace: 'nowrap' }}>Medium</span>;
      default:
        return <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10B981', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)', whiteSpace: 'nowrap' }}>Low</span>;
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
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#EC4899' }}>
              {isAdmin ? 'Admin Portal' : isStaff ? 'Staff Portal' : 'Student Portal'}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E1B4B' }}>
              {isAdmin ? 'Administrator Profile' : isStaff ? 'Staff Profile' : 'My Profile'}
            </span>
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

              {isStudent ? (
                <button
                  type="button"
                  onClick={() => openModal('submit')}
                  className="btn btn-primary"
                  style={{ fontSize: '0.825rem', gap: '6px' }}
                >
                  <PlusCircle size={15} />
                  <span>New Complaint</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/departments')}
                  className="btn btn-primary"
                  style={{ fontSize: '0.825rem', gap: '6px' }}
                >
                  <Building size={15} />
                  <span>Staff Directory</span>
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
                  referrerPolicy="no-referrer"
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
                    if (formData.avatar && !e.target.dataset.triedProxy && !formData.avatar.startsWith('data:') && !formData.avatar.includes('wsrv.nl')) {
                      e.target.dataset.triedProxy = 'true';
                      e.target.src = getSafeProxyUrl(formData.avatar);
                    } else {
                      e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name || 'Student')}`;
                    }
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

      {/* 3. Stat Cards Row (Role-Adaptive) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Card 1: Total Complaints / Tracked */}
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
              {isStudent ? 'My Complaints' : 'Campus Complaints'}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1E1B4B', marginTop: '2px' }}>
              {isStudent ? userTickets.length : (complaints?.length || 0)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#EC4899', fontWeight: 600, marginTop: '2px' }}>
              {isStudent ? 'Total lodged tickets' : 'Active campus complaint load'}
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899' }}>
            <FileText size={24} />
          </div>
        </div>

        {/* Card 2: Active / In-Progress */}
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
              {isStudent ? 'Under Resolution' : 'In Progress / Assigned'}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B', marginTop: '2px' }}>
              {isStudent ? activeTickets.length : (complaints || []).filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600, marginTop: '2px' }}>
              {isStudent ? 'Assigned & In Progress' : 'Requiring department action'}
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
            <Clock size={24} />
          </div>
        </div>

        {/* Card 3: Resolved Issues */}
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
              {isStudent ? 'Resolved Issues' : 'Resolution Rate'}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
              {isStudent ? resolvedTickets.length : `${(complaints || []).length > 0 ? Math.round(((complaints || []).filter(c => c.status === 'Resolved' || c.status === 'Closed').length / (complaints || []).length) * 100) : 100}%`}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, marginTop: '2px' }}>
              {isStudent ? `${resolutionRate}% Resolution Rate` : `${(complaints || []).filter(c => c.status === 'Resolved' || c.status === 'Closed').length} resolved cases`}
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Card 4: Academic / Staff Standing */}
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
              {isStudent ? 'Academic Standing' : 'Department & Division'}
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E1B4B', marginTop: '6px' }}>
              {isStudent ? formData.year : formData.department}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6366F1', fontWeight: 600, marginTop: '4px' }}>
              {isStudent ? formData.hostel : (formData.hostel || 'Main Administrative Complex')}
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
            {isStudent ? <GraduationCap size={24} /> : <Building size={24} />}
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
          <span>{isStudent ? 'Profile & Academic Details' : 'Staff Profile & Records'}</span>
        </button>

        {/* Tab 2 (Admins Only): Student Credentials Registry */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'students' ? 800 : 600,
              color: activeTab === 'students' ? '#EC4899' : 'var(--text-secondary)',
              borderBottom: activeTab === 'students' ? '3px solid #EC4899' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderRadius: '8px 8px 0 0'
            }}
          >
            <GraduationCap size={17} />
            <span>Student Credentials Registry</span>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 800,
                backgroundColor: activeTab === 'students' ? '#EC4899' : 'rgba(236, 72, 153, 0.1)',
                color: activeTab === 'students' ? '#ffffff' : '#EC4899'
              }}
            >
              {studentRegistry.length}
            </span>
          </button>
        )}

        {/* Tab 2: ONLY for Students (Staff / Admin profile does not have personal ticket history) */}
        {isStudent && (
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
            <span>My Ticket History</span>
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
        )}

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

      {/* --- TAB 1: Profile & Details --- */}
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
                
                {/* Profile Photo / Avatar Editor in Form */}
                <div style={{
                  gridColumn: '1 / -1',
                  padding: '16px',
                  backgroundColor: isEditing ? '#FFFDFE' : '#F8FAFC',
                  borderRadius: '16px',
                  border: isEditing ? '1.5px dashed rgba(236, 72, 153, 0.4)' : '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img
                      src={formData.avatar}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '16px',
                        objectFit: 'cover',
                        border: '2px solid #EC4899',
                        boxShadow: '0 4px 12px rgba(236, 72, 153, 0.2)',
                        backgroundColor: '#ffffff'
                      }}
                      onError={(e) => {
                        if (formData.avatar && !e.target.dataset.triedProxy && !formData.avatar.startsWith('data:') && !formData.avatar.includes('wsrv.nl')) {
                          e.target.dataset.triedProxy = 'true';
                          e.target.src = getSafeProxyUrl(formData.avatar);
                        } else {
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name || 'Student')}`;
                        }
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1E1B4B' }}>Profile Avatar & Photo</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {isEditing ? 'Upload from device, browse avatars, or paste web image link' : 'Verified campus profile avatar'}
                      </div>
                    </div>
                  </div>
                  {isEditing && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewAvatar(formData.avatar);
                          setShowAvatarPicker(true);
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ gap: '6px' }}
                      >
                        <Camera size={14} />
                        <span>Upload / Change Photo</span>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Full Name */}
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    className="input-control"
                    value={formData.name}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  <label className="input-label">{isStudent ? 'Student Registration ID' : 'Employee ID'}</label>
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
                      <option value="Campus Administration">Campus Administration</option>
                      <option value="IT Services & Network Infrastructure">IT Services & Network Infrastructure</option>
                      <option value="Electrical & Power Systems">Electrical & Power Systems</option>
                      <option value="Civil Works & Estate Maintenance">Civil Works & Estate Maintenance</option>
                      <option value="Hostel & Residential Life">Hostel & Residential Life</option>
                      <option value="Sanitation & Housekeeping Services">Sanitation & Housekeeping Services</option>
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Central Library Management">Central Library Management</option>
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

                {/* Designation / Academic Year */}
                <div>
                  <label className="input-label">{isStudent ? 'Academic Year & Semester' : 'Designation / Official Title'}</label>
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

                {/* Hostel / Residence / Office */}
                <div>
                  <label className="input-label">{isStudent ? 'Hostel / Campus Accommodation' : 'Office / Residence Location'}</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. Gargi Hall, Room 314 or Staff Residence A-4"
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
                    placeholder="e.g. Guardian / Department Contact"
                    value={formData.emergencyContact}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  />
                </div>

              </div>

              {/* Bio / Campus Notes */}
              <div>
                <label className="input-label">Bio / Profile Summary</label>
                <textarea
                  className="input-control"
                  rows={3}
                  placeholder="Share a short bio or notes..."
                  value={formData.bio}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Integrated Campus Credentials Section for Admin inside Main Edit Form */}
              {isAdmin && isEditing && (
                <div style={{
                  padding: '16px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(236, 72, 153, 0.04)',
                  border: '1.5px solid rgba(236, 72, 153, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  marginTop: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="#EC4899" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E1B4B' }}>
                      Institutional Governance & Campus Credentials (Admin Authority)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    {/* Status */}
                    <div>
                      <label className="input-label">Enrollment / Staff Status</label>
                      <select
                        className="input-control"
                        value={formData.enrollmentStatus}
                        onChange={(e) => setFormData({ ...formData, enrollmentStatus: e.target.value })}
                      >
                        <option value="Enrolled & Verified">Enrolled & Verified</option>
                        <option value="Active Faculty / Staff">Active Faculty / Staff</option>
                        <option value="Active Student">Active Student</option>
                        <option value="Dean's Honor Scholar">Dean's Honor Scholar</option>
                        <option value="Research Fellow">Research Fellow</option>
                        <option value="Exchange Student">Exchange Student</option>
                        <option value="Staff on Duty">Staff on Duty</option>
                        <option value="Suspended / On Leave">Suspended / On Leave</option>
                        <option value="Graduated / Alumnus">Graduated / Alumnus</option>
                      </select>
                    </div>

                    {/* Portal Role */}
                    <div>
                      <label className="input-label">Portal Access Role</label>
                      <select
                        className="input-control"
                        value={formData.portalRole}
                        onChange={(e) => setFormData({ ...formData, portalRole: e.target.value })}
                      >
                        <option value="student">Student</option>
                        <option value="staff">Staff Officer</option>
                        <option value="admin">Campus Admin</option>
                      </select>
                    </div>

                    {/* Batch / Period */}
                    <div>
                      <label className="input-label">Registered Period / Batch</label>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="e.g. Academic Year 2024–2028"
                        value={formData.registeredBatch}
                        onChange={(e) => setFormData({ ...formData, registeredBatch: e.target.value })}
                      />
                    </div>

                    {/* SLA Priority Tier */}
                    <div>
                      <label className="input-label">SLA Service Priority</label>
                      <select
                        className="input-control"
                        value={formData.slaTier}
                        onChange={(e) => setFormData({ ...formData, slaTier: e.target.value })}
                      >
                        <option value="Standard Tier (24h)">Standard Tier (24h)</option>
                        <option value="Priority Tier (12h)">Priority Tier (12h)</option>
                        <option value="Urgent Tier (6h)">Urgent Tier (6h)</option>
                        <option value="VIP Student Welfare">VIP Student Welfare</option>
                        <option value="Admin Escalation Authority">Admin Escalation Authority</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

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
                    <span>{saving ? 'Saving...' : 'Save Profile & Credentials'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Right Sidebar Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Campus Credentials Card (Governed by Campus Admin) */}
            <div className="glass-panel" style={{ padding: '22px', borderRadius: '20px', background: 'linear-gradient(180deg, #ffffff 0%, #FFF5F9 100%)', border: '1.5px solid rgba(236, 72, 153, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E1B4B', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Campus Credentials</span>
                    </h4>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Official Institutional Verification
                    </p>
                  </div>
                </div>

                {/* Right Header Action: Strictly NO edit button for students; Admins get dedicated Edit toggle */}
                {isAdmin ? (
                  isEditingCredentials ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingCredentials(false)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '5px 12px', fontSize: '0.78rem', gap: '4px' }}
                    >
                      <X size={14} />
                      <span>Cancel</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingCredentials(true)}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', gap: '6px', borderRadius: '10px', fontWeight: 700 }}
                    >
                      <Edit3 size={14} />
                      <span>Edit Credentials</span>
                    </button>
                  )
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 700, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                    <Lock size={12} />
                    <span>Admin Verified</span>
                  </span>
                )}
              </div>

              {/* Admin Governance Notice */}
              {isAdmin && !isEditingCredentials && (
                <div style={{ padding: '8px 10px', borderRadius: '10px', backgroundColor: 'rgba(236, 72, 153, 0.08)', border: '1px dashed rgba(236, 72, 153, 0.3)', marginBottom: '12px', fontSize: '0.74rem', color: '#DB2777', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={15} style={{ flexShrink: 0 }} />
                  <span>Admin Authority: You can edit institutional status, role, batch & SLA tier below.</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.825rem' }}>
                
                {/* 1. Enrollment / Duty Status */}
                <div style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(249, 168, 212, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>Status:</span>
                  {isAdmin && isEditingCredentials ? (
                    <select
                      className="input-control"
                      value={formData.enrollmentStatus}
                      onChange={(e) => setFormData({ ...formData, enrollmentStatus: e.target.value })}
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: '60%' }}
                    >
                      <option value="Enrolled & Verified">Enrolled & Verified</option>
                      <option value="Active Faculty / Staff">Active Faculty / Staff</option>
                      <option value="Active Student">Active Student</option>
                      <option value="Dean's Honor Scholar">Dean's Honor Scholar</option>
                      <option value="Research Fellow">Research Fellow</option>
                      <option value="Exchange Student">Exchange Student</option>
                      <option value="Staff on Duty">Staff on Duty</option>
                      <option value="Suspended / On Leave">Suspended / On Leave</option>
                      <option value="Graduated / Alumnus">Graduated / Alumnus</option>
                    </select>
                  ) : (
                    <span style={{ fontWeight: 700, color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                      <CheckCircle2 size={12} />
                      {formData.enrollmentStatus || 'Enrolled & Verified'}
                    </span>
                  )}
                </div>

                {/* 2. Portal Role */}
                <div style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(249, 168, 212, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>Portal Role:</span>
                  {isAdmin && isEditingCredentials ? (
                    <select
                      className="input-control"
                      value={formData.portalRole}
                      onChange={(e) => setFormData({ ...formData, portalRole: e.target.value })}
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: '60%' }}
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff Officer</option>
                      <option value="admin">Campus Admin</option>
                    </select>
                  ) : (
                    <span style={{ fontWeight: 700, color: '#DB2777', textTransform: 'capitalize', backgroundColor: 'rgba(236, 72, 153, 0.1)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                      {formData.portalRole || (isStaff ? 'Staff Officer' : isAdmin ? 'Campus Admin' : 'Student')}
                    </span>
                  )}
                </div>

                {/* 3. Registered Batch / Year Range */}
                <div style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(249, 168, 212, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>Registered Period / Batch:</span>
                  {isAdmin && isEditingCredentials ? (
                    <input
                      type="text"
                      className="input-control"
                      placeholder="e.g. Academic Year 2024–2028"
                      value={formData.registeredBatch}
                      onChange={(e) => setFormData({ ...formData, registeredBatch: e.target.value })}
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: '60%' }}
                    />
                  ) : (
                    <span style={{ fontWeight: 700, color: '#1E1B4B', fontSize: '0.78rem' }}>
                      {formData.registeredBatch || 'Academic Year 2024–2028'}
                    </span>
                  )}
                </div>

                {/* 4. SLA Priority Tier */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>SLA Service Priority:</span>
                  {isAdmin && isEditingCredentials ? (
                    <select
                      className="input-control"
                      value={formData.slaTier}
                      onChange={(e) => setFormData({ ...formData, slaTier: e.target.value })}
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: '60%' }}
                    >
                      <option value="Standard Tier (24h)">Standard Tier (24h)</option>
                      <option value="Priority Tier (12h)">Priority Tier (12h)</option>
                      <option value="Urgent Tier (6h)">Urgent Tier (6h)</option>
                      <option value="VIP Student Welfare">VIP Student Welfare</option>
                      <option value="Admin Escalation Authority">Admin Escalation Authority</option>
                    </select>
                  ) : (
                    <span style={{ fontWeight: 700, color: '#7C3AED', backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                      {formData.slaTier || 'Standard Tier (24h)'}
                    </span>
                  )}
                </div>

                {/* Admin Action Buttons when Editing Credentials */}
                {isAdmin && isEditingCredentials && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(236, 72, 153, 0.2)' }}>
                    <button
                      type="button"
                      onClick={() => setIsEditingCredentials(false)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCredentials}
                      disabled={savingCredentials}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.78rem', padding: '6px 16px', gap: '6px', fontWeight: 700 }}
                    >
                      <Save size={14} />
                      <span>{savingCredentials ? 'Saving...' : 'Save Credentials'}</span>
                    </button>
                  </div>
                )}

                {/* Prominent Bottom Button for Admin when not in edit mode */}
                {isAdmin && !isEditingCredentials && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(236, 72, 153, 0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setIsEditingCredentials(true)}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', justifyContent: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.825rem', fontWeight: 700, borderRadius: '10px' }}
                    >
                      <Edit3 size={15} />
                      <span>Edit My Admin Credentials</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('students')}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.825rem', fontWeight: 700, borderRadius: '10px', color: '#EC4899', backgroundColor: 'rgba(236, 72, 153, 0.08)' }}
                    >
                      <GraduationCap size={15} />
                      <span>Manage All Students' Credentials →</span>
                    </button>
                  </div>
                )}

                {/* Institutional Note for Students */}
                {!isAdmin && (
                  <div style={{ marginTop: '6px', padding: '8px 10px', borderRadius: '8px', backgroundColor: 'rgba(236, 72, 153, 0.05)', border: '1px dashed rgba(236, 72, 153, 0.25)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <ShieldCheck size={14} color="#EC4899" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.7rem', color: '#6B7280', lineHeight: 1.35 }}>
                      Official institutional records issued by the <strong>Registrar & Campus Administration</strong>. Non-editable by student accounts.
                    </span>
                  </div>
                )}

              </div>
            </div>

            {/* Quick Actions Card (Role-Specific: Staff/Admin vs Student) */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 12px 0' }}>
                Quick Shortcuts
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {isStudent ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveTab('students')}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start', width: '100%', gap: '8px', color: '#EC4899', backgroundColor: 'rgba(236, 72, 153, 0.08)', fontWeight: 700 }}
                    >
                      <GraduationCap size={15} color="#EC4899" />
                      <span>Student Credentials Registry</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/complaints')}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start', width: '100%', gap: '8px' }}
                    >
                      <ListFilter size={15} color="#EC4899" />
                      <span>View All Campus Complaints</span>
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
                    <button
                      type="button"
                      onClick={() => navigate('/admin/intelligence')}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start', width: '100%', gap: '8px' }}
                    >
                      <Sparkles size={15} color="#EC4899" />
                      <span>Intelligence AI Dashboard</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/analytics')}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start', width: '100%', gap: '8px' }}
                    >
                      <BarChart3 size={15} color="#EC4899" />
                      <span>Analytics & SLA Reports</span>
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- TAB (Admins Only): Campus Student Credentials Registry --- */}
      {isAdmin && activeTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Banner with Stats & Action */}
          <div className="glass-panel" style={{
            padding: '24px 28px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(244, 114, 182, 0.03) 100%)',
            border: '1.5px solid rgba(236, 72, 153, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 6px 18px rgba(236, 72, 153, 0.3)' }}>
                <GraduationCap size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E1B4B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Student Credentials & Lifecycle Registry</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#EC4899' }}>
                    Admin Governance Authority
                  </span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Manage institutional credentials, enroll incoming students, archive graduates, and manage campus rosters.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ padding: '8px 14px', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E1B4B' }}>{studentRegistry.length}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Roster</div>
              </div>
              <div style={{ padding: '8px 14px', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10B981' }}>
                  {studentRegistry.filter(s => !(s.enrollmentStatus || '').includes('Graduated') && !(s.enrollmentStatus || '').includes('Suspended')).length}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>Active Enrolled</div>
              </div>
              <div style={{ padding: '8px 14px', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#6366F1' }}>
                  {studentRegistry.filter(s => (s.enrollmentStatus || '').includes('Graduated') || (s.enrollmentStatus || '').includes('Alumnus')).length}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>Graduated Alumni</div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddStudentModal(true)}
                className="btn btn-primary"
                style={{ gap: '8px', padding: '10px 18px', fontWeight: 700, borderRadius: '12px', boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)' }}
              >
                <UserPlus size={16} />
                <span>Enroll New Student</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
              <input
                type="text"
                className="input-control"
                placeholder="Search students by name, registration ID (e.g. STU-2024-8841), or department..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                className="input-control"
                value={studentStatusFilter}
                onChange={(e) => setStudentStatusFilter(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.8rem', width: 'auto' }}
              >
                <option value="all">All Enrollment Statuses ({studentRegistry.length})</option>
                <option value="Enrolled & Verified">Enrolled & Verified</option>
                <option value="Active Student">Active Student</option>
                <option value="Dean's Honor Scholar">Dean's Honor Scholar</option>
                <option value="Research Fellow">Research Fellow</option>
                <option value="Graduated / Alumnus">Graduated / Alumnus (Archive)</option>
                <option value="Suspended / On Leave">Suspended / On Leave</option>
              </select>
            </div>
          </div>

          {/* Students List Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
            {studentRegistry
              .filter(stu => {
                const matchSearch = !studentSearchTerm ||
                  stu.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                  stu.studentId.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                  stu.department.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                  stu.email.toLowerCase().includes(studentSearchTerm.toLowerCase());
                const matchStatus = studentStatusFilter === 'all' || stu.enrollmentStatus === studentStatusFilter;
                return matchSearch && matchStatus;
              })
              .map((stu) => {
                const isGraduated = (stu.enrollmentStatus || '').includes('Graduated') || (stu.enrollmentStatus || '').includes('Alumnus');
                const isSuspended = (stu.enrollmentStatus || '').includes('Suspended');

                return (
                  <div
                    key={stu.id}
                    className="glass-panel"
                    style={{
                      padding: '22px',
                      borderRadius: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      border: isGraduated ? '1.5px solid rgba(99, 102, 241, 0.3)' : '1.5px solid rgba(236, 72, 153, 0.2)',
                      backgroundColor: isGraduated ? '#FAFAFF' : '#ffffff',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
                      position: 'relative'
                    }}
                  >
                    {/* Header: Avatar, Name, ID, Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={stu.avatar}
                          alt={stu.name}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            objectFit: 'cover',
                            border: `2px solid ${isGraduated ? '#6366F1' : '#EC4899'}`,
                            backgroundColor: '#ffffff'
                          }}
                          onError={(e) => {
                            e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(stu.name)}`;
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1E1B4B' }}>{stu.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stu.studentId} • {stu.email}</div>
                        </div>
                      </div>

                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '8px',
                        backgroundColor: isGraduated
                          ? 'rgba(99, 102, 241, 0.12)'
                          : isSuspended
                            ? 'rgba(239, 68, 68, 0.12)'
                            : 'rgba(16, 185, 129, 0.12)',
                        color: isGraduated
                          ? '#4F46E5'
                          : isSuspended
                            ? '#EF4444'
                            : '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap'
                      }}>
                        {isGraduated ? <GraduationCap size={13} /> : <CheckCircle2 size={13} />}
                        {stu.enrollmentStatus}
                      </span>
                    </div>

                    {/* Academic & SLA Details */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      backgroundColor: isGraduated ? '#EEF2FF' : '#FFF7FB',
                      border: `1px solid ${isGraduated ? 'rgba(199, 210, 254, 0.6)' : 'rgba(249, 168, 212, 0.4)'}`,
                      fontSize: '0.78rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Department:</span>
                        <strong style={{ color: '#1E1B4B' }}>{stu.department}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Academic Standing:</span>
                        <span style={{ color: '#1E1B4B', fontWeight: 600 }}>{stu.year}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>SLA Priority Tier:</span>
                        <span style={{
                          fontWeight: 700,
                          color: isGraduated ? '#6366F1' : '#7C3AED',
                          backgroundColor: isGraduated ? 'rgba(99, 102, 241, 0.12)' : 'rgba(139, 92, 246, 0.12)',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {stu.slaTier || 'Standard Tier (24h)'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Registered Batch:</span>
                        <span style={{ color: '#1E1B4B', fontWeight: 600 }}>{stu.registeredBatch || 'Academic Year 2024–2028'}</span>
                      </div>
                    </div>

                    {/* Action Row */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditStudentModal(stu)}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, justifyContent: 'center', gap: '6px', padding: '9px 12px', fontSize: '0.825rem', fontWeight: 700, borderRadius: '10px' }}
                      >
                        <Edit3 size={14} />
                        <span>Edit Credentials</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleGraduateStudent(stu)}
                        className="btn btn-secondary btn-sm"
                        title={isGraduated ? "Reactivate student to active roster" : "Mark student as Graduated Alumnus"}
                        style={{
                          padding: '9px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          borderRadius: '10px',
                          color: isGraduated ? '#10B981' : '#4F46E5',
                          backgroundColor: isGraduated ? 'rgba(16, 185, 129, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                          borderColor: isGraduated ? 'rgba(16, 185, 129, 0.25)' : 'rgba(99, 102, 241, 0.25)',
                          gap: '5px'
                        }}
                      >
                        <GraduationCap size={15} />
                        <span>{isGraduated ? 'Reactivate' : 'Graduate'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudentToDelete(stu)}
                        className="btn btn-ghost btn-sm"
                        title="Remove / De-register student from campus"
                        style={{
                          padding: '9px',
                          borderRadius: '10px',
                          color: '#EF4444',
                          backgroundColor: 'rgba(239, 68, 68, 0.06)'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

        </div>
      )}

      {/* --- TAB 2: Complaints / Tickets Queue (Students Only) --- */}
      {isStudent && activeTab === 'tickets' && (
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
                All Complaints ({userTickets.length})
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
                In Progress ({activeTickets.length})
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
                {ticketSearch ? `No complaints matching "${ticketSearch}".` : "No complaints lodged in your student record right now."}
              </p>
              <button
                type="button"
                onClick={() => openModal('submit')}
                className="btn btn-primary"
                style={{ gap: '6px' }}
              >
                <PlusCircle size={15} />
                <span>Raise a Campus Complaint</span>
              </button>
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Receive emails when complaint status changes</div>
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
              justifyContent: 'space-between',
              gap: '16px',
              padding: '16px',
              backgroundColor: '#FDF2F8',
              borderRadius: '18px',
              border: '1.5px solid rgba(249, 168, 212, 0.6)',
              marginBottom: '18px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={previewAvatar || formData.avatar}
                  alt="Avatar Preview"
                  referrerPolicy="no-referrer"
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '18px',
                    objectFit: 'cover',
                    border: '2.5px solid #ffffff',
                    boxShadow: '0 4px 14px rgba(236, 72, 153, 0.28)',
                    backgroundColor: '#ffffff'
                  }}
                  onLoad={() => {
                    if (avatarTab === 'url' && customAvatarUrl) setUrlStatus('valid');
                  }}
                  onError={(e) => {
                    if (previewAvatar && !e.target.dataset.triedProxy && !previewAvatar.startsWith('data:') && !previewAvatar.includes('wsrv.nl')) {
                      e.target.dataset.triedProxy = 'true';
                      e.target.src = getSafeProxyUrl(previewAvatar);
                      setUrlProxyLoaded(true);
                    } else {
                      if (avatarTab === 'url') {
                        setUrlStatus('error');
                        setUrlErrorMessage('Could not load image from this URL. Tip: Right-click the image in your browser > "Copy image", then press Ctrl+V here to paste it directly!');
                      }
                      e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name || 'Student')}`;
                    }
                  }}
                />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1E1B4B' }}>Photo Preview</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {uploadFileName 
                      ? `Selected: ${uploadFileName}` 
                      : (previewAvatar?.startsWith('data:image/') ? 'Offline-Ready Local Photo' : 'Ready to be set as your profile avatar')}
                  </div>
                  {urlProxyLoaded && (
                    <div style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <CheckCircle2 size={12} />
                      <span>Loaded via Safe CDN Proxy (Anti-Hotlink Active)</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {previewAvatar && !previewAvatar.startsWith('data:image/') && (
                  <button
                    type="button"
                    onClick={handleConvertToLocalDataUrl}
                    className="btn btn-secondary btn-sm"
                    disabled={converting}
                    style={{ fontSize: '0.75rem', gap: '4px' }}
                    title="Save this photo directly in your profile so it never expires or breaks"
                  >
                    {converting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} color="#EC4899" />}
                    <span>{converting ? 'Saving...' : 'Embed Offline'}</span>
                  </button>
                )}
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
            </div>

            {/* Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px', paddingBottom: '4px' }}>
              <button
                type="button"
                onClick={() => setAvatarTab('upload')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: avatarTab === 'upload' ? 'rgba(236, 72, 153, 0.12)' : 'transparent',
                  color: avatarTab === 'upload' ? '#EC4899' : 'var(--text-secondary)',
                  fontWeight: avatarTab === 'upload' ? 800 : 600,
                  fontSize: '0.825rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Upload size={14} />
                <span>Upload from Device</span>
              </button>

              <button
                type="button"
                onClick={() => setAvatarTab('presets')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: avatarTab === 'presets' ? 'rgba(236, 72, 153, 0.12)' : 'transparent',
                  color: avatarTab === 'presets' ? '#EC4899' : 'var(--text-secondary)',
                  fontWeight: avatarTab === 'presets' ? 800 : 600,
                  fontSize: '0.825rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Image size={14} />
                <span>Avatar Gallery</span>
              </button>

              <button
                type="button"
                onClick={() => setAvatarTab('url')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: avatarTab === 'url' ? 'rgba(236, 72, 153, 0.12)' : 'transparent',
                  color: avatarTab === 'url' ? '#EC4899' : 'var(--text-secondary)',
                  fontWeight: avatarTab === 'url' ? 800 : 600,
                  fontSize: '0.825rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <ExternalLink size={14} />
                <span>Web Image Link</span>
              </button>
            </div>

            {/* TAB: UPLOAD FROM DEVICE / GALLERY / CLIPBOARD */}
            {avatarTab === 'upload' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: isDraggingFile ? '2.5px dashed #EC4899' : '2px dashed rgba(236, 72, 153, 0.4)',
                    borderRadius: '18px',
                    padding: '30px 18px',
                    textAlign: 'center',
                    backgroundColor: isDraggingFile ? '#FFF0F5' : '#FFFDFE',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => { if (!isDraggingFile) e.currentTarget.style.borderColor = '#EC4899'; }}
                  onMouseLeave={(e) => { if (!isDraggingFile) e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)'; }}
                >
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(236, 72, 153, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EC4899'
                  }}>
                    <Upload size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E1B4B' }}>
                      {isDraggingFile ? 'Drop Image Here to Upload' : 'Click to Browse Photos or Drag & Drop'}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                      Supports JPG, PNG, WEBP, GIF & SVG up to 8MB
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ gap: '6px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Image size={14} />
                      <span>Choose from Computer / Phone</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '6px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePasteFromClipboard();
                      }}
                    >
                      <Clipboard size={14} />
                      <span>Paste Copied Photo</span>
                    </button>
                  </div>
                </div>

                {/* Paste Shortcut Banner */}
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(236, 72, 153, 0.06)',
                  border: '1px solid rgba(236, 72, 153, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.78rem',
                  color: '#1E1B4B'
                }}>
                  <Sparkles size={14} color="#EC4899" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Pro-tip:</strong> When browsing online, right-click any image & select <strong>"Copy Image"</strong> (or take a screenshot), then press <kbd style={{ padding: '1px 5px', borderRadius: '4px', backgroundColor: '#ffffff', border: '1px solid #d1d5db', fontSize: '0.75rem', fontWeight: 700 }}>Ctrl+V</kbd> anywhere on this screen to paste it instantly!
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRESET GALLERY */}
            {avatarTab === 'presets' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', maxHeight: '230px', overflowY: 'auto', paddingRight: '4px' }}>
                  {avatarPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPreviewAvatar(preset.url);
                        setCustomAvatarUrl(preset.url);
                        setUrlStatus('valid');
                        setUrlProxyLoaded(false);
                      }}
                      style={{
                        border: previewAvatar === preset.url ? '3px solid #EC4899' : '2px solid rgba(249, 168, 212, 0.35)',
                        borderRadius: '16px',
                        padding: '6px',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1E1B4B', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                        {preset.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: WEB URL */}
            {avatarTab === 'url' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Globe size={14} color="#EC4899" />
                    <span>Paste Web Image Link (URL)</span>
                  </label>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Paste any direct image URL or search link from your browser (Google Images, Unsplash, Pexels, Wikipedia, GitHub, Imgur, Pinterest). We resolve it and bypass anti-hotlinking automatically.
                  </p>
                  
                  {/* URL Input & Actions */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Link2 size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="url"
                        className="input-control"
                        placeholder="https://images.unsplash.com/photo-... or Google image link"
                        value={customAvatarUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        onPaste={(e) => {
                          const pasted = e.clipboardData.getData('text');
                          if (pasted) handleUrlChange(pasted);
                        }}
                        style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
                      />
                      {customAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomAvatarUrl('');
                            setUrlStatus('idle');
                            setUrlProxyLoaded(false);
                            setUrlErrorMessage('');
                          }}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '2px'
                          }}
                          title="Clear URL"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handlePasteFromClipboard}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '6px', whiteSpace: 'nowrap', padding: '0 14px' }}
                      title="Paste link or image from clipboard"
                    >
                      <Clipboard size={14} />
                      <span>Paste Link</span>
                    </button>
                  </div>
                </div>

                {/* Real-Time Status & Image Preview Box */}
                {urlStatus === 'loading' && (
                  <div style={{
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(236, 72, 153, 0.08)',
                    border: '1px solid rgba(236, 72, 153, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.825rem',
                    color: '#EC4899'
                  }}>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Resolving image URL and verifying preview...</span>
                  </div>
                )}

                {urlStatus === 'error' && (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '0.8rem',
                    color: '#ef4444'
                  }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>Unable to load image from URL: </strong>
                      <div>{urlErrorMessage || 'Could not load image directly from this website.'}</div>
                      <div style={{ marginTop: '6px', fontSize: '0.76rem', color: '#1E1B4B' }}>
                        💡 <strong>Easy Fix:</strong> In your browser, right-click the image, choose <strong>"Copy Image"</strong>, then press <kbd style={{ padding: '1px 5px', borderRadius: '4px', backgroundColor: '#ffffff', border: '1px solid #d1d5db' }}>Ctrl+V</kbd> here!
                      </div>
                    </div>
                  </div>
                )}

                {/* Real-Time Live Image Preview Box */}
                {customAvatarUrl && (
                  <div style={{
                    padding: '14px',
                    borderRadius: '14px',
                    backgroundColor: urlStatus === 'error' ? 'rgba(239, 68, 68, 0.06)' : 'rgba(16, 185, 129, 0.06)',
                    border: urlStatus === 'error' ? '1.5px solid rgba(239, 68, 68, 0.3)' : '1.5px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={customAvatarUrl}
                        alt="Web Preview"
                        referrerPolicy="no-referrer"
                        onLoad={() => {
                          setUrlStatus('valid');
                          setUrlErrorMessage('');
                        }}
                        onError={(e) => {
                          if (customAvatarUrl && !e.target.dataset.triedProxy && !customAvatarUrl.startsWith('data:') && !customAvatarUrl.includes('wsrv.nl')) {
                            e.target.dataset.triedProxy = 'true';
                            const pUrl = getSafeProxyUrl(customAvatarUrl);
                            e.target.src = pUrl;
                            setUrlProxyLoaded(true);
                            setUrlStatus('valid');
                          } else {
                            setUrlStatus('error');
                            setUrlErrorMessage('Could not load image from this site. Copy the image directly (Right-click > "Copy image") and paste with Ctrl+V.');
                            e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=preview`;
                          }
                        }}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '16px',
                          objectFit: 'cover',
                          border: urlStatus === 'error' ? '2px solid #ef4444' : '2px solid #10b981',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          backgroundColor: '#ffffff'
                        }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {urlStatus === 'error' ? (
                            <>
                              <AlertTriangle size={15} color="#ef4444" />
                              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444' }}>
                                Image Load Issue
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={15} color="#10b981" />
                              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>
                                {urlProxyLoaded ? 'Image Verified via Safe Proxy!' : 'Live Image Verified!'}
                              </span>
                            </>
                          )}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {customAvatarUrl}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleApplyAvatar(customAvatarUrl)}
                        className="btn btn-primary btn-sm"
                        style={{ gap: '6px', fontSize: '0.78rem' }}
                      >
                        <Check size={14} />
                        <span>Use This Photo</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Sample Links */}
                <div style={{ paddingTop: '6px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Sparkles size={12} color="#EC4899" />
                    <span>Try Sample Image URLs:</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {sampleWebImages.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleUrlChange(sample.url)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: customAvatarUrl === sample.url ? 'rgba(236, 72, 153, 0.12)' : 'var(--bg-tertiary)',
                          color: customAvatarUrl === sample.url ? '#EC4899' : 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          fontWeight: customAvatarUrl === sample.url ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>
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
                  setCustomAvatarUrl(def);
                  setUrlStatus('valid');
                  setUrlProxyLoaded(false);
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

      {/* --- MODAL (Admin Only): Edit Student Campus Credentials --- */}
      {selectedStudentForEdit && editingStudentData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedStudentForEdit(null);
              setEditingStudentData(null);
            }
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.25), 0 0 0 1px rgba(236, 72, 153, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={editingStudentData.avatar}
                  alt={editingStudentData.name}
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    objectFit: 'cover',
                    border: '2px solid #EC4899',
                    backgroundColor: '#ffffff'
                  }}
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(editingStudentData.name)}`;
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                      Edit {editingStudentData.name}'s Credentials
                    </h3>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontWeight: 700, color: '#EC4899' }}>{editingStudentData.studentId}</span>
                    <span>•</span>
                    <span>{editingStudentData.email}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedStudentForEdit(null);
                  setEditingStudentData(null);
                }}
                className="btn btn-ghost btn-sm"
                style={{ padding: '6px', borderRadius: '10px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Admin Badge Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              backgroundColor: 'rgba(236, 72, 153, 0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(236, 72, 153, 0.25)',
              fontSize: '0.78rem',
              color: '#831843'
            }}>
              <ShieldCheck size={18} color="#EC4899" style={{ flexShrink: 0 }} />
              <div>
                <strong>Institutional Governance Authority:</strong> Changes saved here directly update this student's official records, ticket SLA escalation thresholds, and profile badge.
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Enrollment Status */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="#EC4899" />
                  <span>Institutional Enrollment Status</span>
                </label>
                <select
                  className="input-control"
                  value={editingStudentData.enrollmentStatus}
                  onChange={(e) => setEditingStudentData({ ...editingStudentData, enrollmentStatus: e.target.value })}
                  style={{ fontWeight: 600 }}
                >
                  <option value="Enrolled & Verified">Enrolled & Verified (Standard)</option>
                  <option value="Active Student">Active Student</option>
                  <option value="Dean's Honor Scholar">Dean's Honor Scholar (Academic Distinction)</option>
                  <option value="Research Fellow">Research Fellow</option>
                  <option value="Suspended / On Leave">Suspended / On Leave</option>
                  <option value="Graduated / Alumnus">Graduated / Alumnus</option>
                </select>
              </div>

              {/* SLA Priority Tier */}
              <div>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} color="#EC4899" />
                  <span>SLA Service Priority</span>
                </label>
                <select
                  className="input-control"
                  value={editingStudentData.slaTier}
                  onChange={(e) => setEditingStudentData({ ...editingStudentData, slaTier: e.target.value })}
                >
                  <option value="Standard Tier (24h)">Standard Tier (24h)</option>
                  <option value="Priority Tier (12h)">Priority Tier (12h)</option>
                  <option value="Urgent Tier (6h)">Urgent Tier (6h)</option>
                  <option value="VIP Student Welfare">VIP Student Welfare</option>
                </select>
              </div>

              {/* Registered Batch */}
              <div>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="#EC4899" />
                  <span>Registered Batch / Period</span>
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={editingStudentData.registeredBatch}
                  onChange={(e) => setEditingStudentData({ ...editingStudentData, registeredBatch: e.target.value })}
                  placeholder="e.g. Academic Year 2024–2028"
                />
              </div>

              {/* Department */}
              <div>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building size={14} color="#EC4899" />
                  <span>Department / Faculty</span>
                </label>
                <select
                  className="input-control"
                  value={editingStudentData.department}
                  onChange={(e) => setEditingStudentData({ ...editingStudentData, department: e.target.value })}
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electrical & Electronics">Electrical & Electronics</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GraduationCap size={14} color="#EC4899" />
                  <span>Academic Standing / Year</span>
                </label>
                <select
                  className="input-control"
                  value={editingStudentData.year}
                  onChange={(e) => setEditingStudentData({ ...editingStudentData, year: e.target.value })}
                >
                  <option value="1st Year (Semester 1)">1st Year (Semester 1)</option>
                  <option value="1st Year (Semester 2)">1st Year (Semester 2)</option>
                  <option value="2nd Year (Semester 3)">2nd Year (Semester 3)</option>
                  <option value="2nd Year (Semester 4)">2nd Year (Semester 4)</option>
                  <option value="3rd Year (Semester 5)">3rd Year (Semester 5)</option>
                  <option value="3rd Year (Semester 6)">3rd Year (Semester 6)</option>
                  <option value="4th Year (Final Year)">4th Year (Final Year)</option>
                  <option value="Post-Graduate / Scholar">Post-Graduate / Scholar</option>
                </select>
              </div>

            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleGraduateStudent(selectedStudentForEdit);
                    setSelectedStudentForEdit(null);
                    setEditingStudentData(null);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#4F46E5', borderColor: 'rgba(99, 102, 241, 0.3)', gap: '6px' }}
                >
                  <GraduationCap size={14} />
                  <span>Archive as Graduated</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudentToDelete(selectedStudentForEdit);
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', gap: '4px' }}
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudentForEdit(null);
                    setEditingStudentData(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveStudentCredentials}
                  className="btn btn-primary"
                  style={{ gap: '6px' }}
                >
                  <Save size={15} />
                  <span>Save Credentials</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL (Admin Only): Enroll / Register New Student --- */}
      {showAddStudentModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1150,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddStudentModal(false);
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                    Enroll New Student
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    Register a new student profile and issue official campus credentials
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '6px', borderRadius: '10px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRegisterNewStudent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                
                {/* Full Name */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Student Full Name *</label>
                  <input
                    type="text"
                    className="input-control"
                    required
                    placeholder="e.g. Aryan Malhotra"
                    value={newStudentFormData.name}
                    onChange={(e) => setNewStudentFormData({ ...newStudentFormData, name: e.target.value })}
                  />
                </div>

                {/* Student ID */}
                <div>
                  <label className="input-label">Student Registration ID *</label>
                  <input
                    type="text"
                    className="input-control"
                    required
                    placeholder="e.g. STU-2025-1089"
                    value={newStudentFormData.studentId}
                    onChange={(e) => setNewStudentFormData({ ...newStudentFormData, studentId: e.target.value })}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="input-label">Campus Email</label>
                  <input
                    type="email"
                    className="input-control"
                    placeholder="e.g. aryan.m@college.edu"
                    value={newStudentFormData.email}
                    onChange={(e) => setNewStudentFormData({ ...newStudentFormData, email: e.target.value })}
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="input-label">Department / Faculty</label>
                  <select
                    className="input-control"
                    value={newStudentFormData.department}
                    onChange={(e) => setNewStudentFormData({ ...newStudentFormData, department: e.target.value })}
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Electrical & Electronics">Electrical & Electronics</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Business Administration">Business Administration</option>
                  </select>
                </div>

                {/* Academic Year */}
                <div>
                  <label className="input-label">Academic Standing / Year</label>
                  <select
                    className="input-control"
                    value={newStudentFormData.year}
                    onChange={(e) => setNewStudentFormData({ ...newStudentFormData, year: e.target.value })}
                  >
                    <option value="1st Year (Semester 1)">1st Year (Semester 1)</option>
                    <option value="1st Year (Semester 2)">1st Year (Semester 2)</option>
                    <option value="2nd Year (Semester 3)">2nd Year (Semester 3)</option>
                    <option value="2nd Year (Semester 4)">2nd Year (Semester 4)</option>
                    <option value="3rd Year (Semester 5)">3rd Year (Semester 5)</option>
                    <option value="4th Year (Final Year)">4th Year (Final Year)</option>
                  </select>
                </div>

                {/* Registered Batch */}
                <div>
                  <label className="input-label">Registered Batch</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. Academic Year 2025–2029"
                    value={newStudentFormData.registeredBatch}
                    onChange={(e) => setNewStudentFormData({ ...newStudentFormData, registeredBatch: e.target.value })}
                  />
                </div>

                {/* SLA Priority */}
                <div>
                  <label className="input-label">SLA Priority Tier</label>
                  <select
                    className="input-control"
                    value={newStudentFormData.slaTier}
                    onChange={(e) => setNewStudentFormData({ ...newStudentFormData, slaTier: e.target.value })}
                  >
                    <option value="Standard Tier (24h)">Standard Tier (24h)</option>
                    <option value="Priority Tier (12h)">Priority Tier (12h)</option>
                    <option value="Urgent Tier (6h)">Urgent Tier (6h)</option>
                    <option value="VIP Student Welfare">VIP Student Welfare</option>
                  </select>
                </div>

              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ gap: '6px' }}
                >
                  <UserPlus size={15} />
                  <span>Register & Enroll Student</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL (Admin Only): Confirm Student Removal / Deletion --- */}
      {studentToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setStudentToDelete(null);
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '14px', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                  Remove Student from CampusCare?
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Institutional student de-registration confirmation
                </p>
              </div>
            </div>

            {/* Student Info preview */}
            <div style={{ padding: '14px 16px', borderRadius: '14px', backgroundColor: '#FEF2F2', border: '1px solid rgba(254, 202, 202, 0.8)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={studentToDelete.avatar}
                alt={studentToDelete.name}
                style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #EF4444' }}
              />
              <div>
                <strong style={{ color: '#991B1B', fontSize: '0.92rem' }}>{studentToDelete.name}</strong>
                <div style={{ fontSize: '0.75rem', color: '#B91C1C' }}>
                  {studentToDelete.studentId} • {studentToDelete.department}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Are you sure you want to completely remove <strong>{studentToDelete.name}</strong> from the campus database? If the student has simply completed their degree, you can choose to <strong>Mark as Graduated Alumnus</strong> instead to preserve their historical complaint archives.
            </p>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleGraduateStudent(studentToDelete);
                  setStudentToDelete(null);
                }}
                className="btn btn-secondary"
                style={{ color: '#4F46E5', borderColor: 'rgba(99, 102, 241, 0.3)', fontWeight: 700 }}
              >
                <GraduationCap size={15} />
                <span>Archive as Graduated</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteStudentConfirm}
                className="btn btn-primary"
                style={{ backgroundColor: '#EF4444', borderColor: '#EF4444', gap: '6px' }}
              >
                <Trash2 size={15} />
                <span>Remove Student</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
