import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/client';
import { INITIAL_COMPLAINTS, INITIAL_NOTIFICATIONS } from '../data/mockData';
import confetti from 'canvas-confetti';

const AppContext = createContext();

const STORAGE_KEYS = {
  COMPLAINTS: 'campuscare_complaints_v1',
  THEME: 'campuscare_theme_v1',
  NOTIFICATIONS: 'campuscare_notifs_v1'
};

export const AppProvider = ({ children }) => {
  const { user } = useAuth();

  // Current persona is derived from the real authenticated user
  const currentPersona = user || {
    id: 'guest',
    name: 'College Guest',
    role: 'student',
    email: 'guest@college.edu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
  };

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Complaints State
  const [complaints, setComplaints] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_COMPLAINTS;
  });

  const [loadingComplaints, setLoadingComplaints] = useState(false);

  // Sync with Backend REST API
  const refreshComplaints = useCallback(async () => {
    setLoadingComplaints(true);
    try {
      const liveComplaints = await api.getComplaints();
      if (Array.isArray(liveComplaints) && liveComplaints.length > 0) {
        setComplaints(liveComplaints);
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(liveComplaints));
      }
    } catch (err) {
      // Backend not reached or offline - continue with local cached state
    } finally {
      setLoadingComplaints(false);
    }
  }, []);

  useEffect(() => {
    refreshComplaints();
  }, [refreshComplaints, user]);

  // Notifications State
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Toasts State
  const [toasts, setToasts] = useState([]);

  const addToast = ({ type = 'info', title, message }) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Navigation / Filters
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards');

  // Modals state
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // 'submit' | 'detail' | 'triage' | 'export'
    data: null
  });

  const openModal = (type, data = null) => {
    setModalState({ isOpen: true, type, data });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null, data: null });
  };

  // --- Real-time Actions ---

  // 1. Submit New Complaint
  const submitComplaint = async (formData) => {
    try {
      const newComplaint = await api.createComplaint(formData);
      setComplaints(prev => [newComplaint, ...prev]);

      // Confetti effect!
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}

      addToast({
        type: 'success',
        title: 'Complaint Registered!',
        message: `Ticket #${newComplaint.id} has been submitted to campus administration.`
      });

      closeModal();
      return newComplaint;
    } catch (err) {
      // Local fallback if server fails
      const fallbackId = `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const localComplaint = {
        id: fallbackId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        status: 'Submitted',
        location: formData.location ? formData.location.trim() : 'Campus Location',
        manualLocation: formData.manualLocation || formData.locationDetails || {
          building: '',
          floor: '',
          roomOrSpot: '',
          additionalDetails: ''
        },
        gpsLocation: {
          address: formData.gpsLocation?.address || null
        },
        floorLevel: formData.floorLevel || 'Ground Floor',
        student: {
          id: currentPersona.id,
          name: currentPersona.name,
          studentId: currentPersona.studentId || 'STU-COLLEGE',
          email: currentPersona.email,
          department: currentPersona.department || 'Student',
          avatar: currentPersona.avatar
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedDepartment: null,
        assignedStaff: null,
        attachments: formData.attachments || [],
        statusHistory: [
          {
            id: `sh-${Date.now()}`,
            fromStatus: null,
            toStatus: 'Submitted',
            changedBy: `${currentPersona.name} (${currentPersona.role})`,
            timestamp: new Date().toISOString(),
            note: 'Complaint registered by student'
          }
        ],
        comments: [],
        resolutionNotes: null,
        resolutionPhoto: null,
        resolvedAt: null,
        rating: null,
        feedback: null
      };

      setComplaints(prev => [localComplaint, ...prev]);
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify([localComplaint, ...complaints]));

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}

      addToast({
        type: 'success',
        title: 'Complaint Logged (Local)',
        message: `Ticket #${fallbackId} registered.`
      });

      closeModal();
      return localComplaint;
    }
  };

  // 2. Triage & Update Status (Admin / Staff)
  const triageComplaint = async (complaintId, updates) => {
    try {
      const updated = await api.triageComplaint(complaintId, updates);
      setComplaints(prev => {
        const next = prev.map(c => c.id === complaintId ? updated : c);
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(next));
        return next;
      });

      if (updates.status === 'Resolved') {
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        } catch (e) {}
      }

      addToast({
        type: 'success',
        title: 'Ticket Updated',
        message: `Ticket #${complaintId} was successfully updated.`
      });
      closeModal();
      return updated;
    } catch (err) {
      // Local fallback
      let fallbackUpdated = null;
      setComplaints(prev => {
        const next = prev.map(c => {
          if (c.id !== complaintId) return c;
          const isStatusChange = updates.status && updates.status !== c.status;
          const newHistory = [...(c.statusHistory || [])];
          if (isStatusChange) {
            newHistory.push({
              id: `sh-${Date.now()}`,
              fromStatus: c.status,
              toStatus: updates.status,
              changedBy: `${currentPersona.name} (${currentPersona.role})`,
              timestamp: new Date().toISOString(),
              note: updates.statusNote || `Status updated from ${c.status} to ${updates.status}`
            });
          }
          const item = {
            ...c,
            ...updates,
            updatedAt: new Date().toISOString(),
            statusHistory: newHistory
          };
          fallbackUpdated = item;
          return item;
        });
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(next));
        return next;
      });
      addToast({
        type: 'success',
        title: 'Ticket Updated',
        message: `Ticket #${complaintId} was updated.`
      });
      closeModal();
      return fallbackUpdated;
    }
  };

  // Helper alias for triageComplaint with individual arguments
  const updateComplaintStatus = async (complaintId, status, statusNote, departmentId, staffId, resolutionNotes, resolutionPhoto) => {
    return await triageComplaint(complaintId, {
      status,
      statusNote,
      assignedDepartment: departmentId,
      assignedStaff: staffId,
      resolutionNotes,
      resolutionPhoto
    });
  };

  // 3. Add Discussion Comment
  const addComment = async (complaintId, message, isInternal = false) => {
    if (!message.trim()) return;
    try {
      const updated = await api.addComment(complaintId, message, isInternal);
      setComplaints(prev => prev.map(c => c.id === complaintId ? updated : c));
      addToast({
        type: 'info',
        title: 'Message Posted',
        message: 'Your update has been appended to the ticket timeline.'
      });
    } catch (err) {
      // Local fallback
      const newComment = {
        id: `c-${Date.now()}`,
        authorName: currentPersona.name,
        authorRole: currentPersona.role,
        authorAvatar: currentPersona.avatar,
        timestamp: new Date().toISOString(),
        message: message.trim(),
        isInternal
      };
      setComplaints(prev =>
        prev.map(c => {
          if (c.id !== complaintId) return c;
          return {
            ...c,
            updatedAt: new Date().toISOString(),
            comments: [...(c.comments || []), newComment]
          };
        })
      );
      addToast({
        type: 'info',
        title: 'Message Posted',
        message: 'Your update has been appended.'
      });
    }
  };

  // 4. Submit Satisfaction Rating
  const submitRating = async (complaintId, rating, feedback) => {
    try {
      const updated = await api.submitRating(complaintId, rating, feedback);
      setComplaints(prev => prev.map(c => c.id === complaintId ? updated : c));
      addToast({
        type: 'success',
        title: 'Feedback Received',
        message: 'Thank you for rating our resolution quality!'
      });
    } catch (err) {
      setComplaints(prev =>
        prev.map(c => {
          if (c.id !== complaintId) return c;
          return { ...c, rating, feedback: feedback?.trim() || null };
        })
      );
      addToast({
        type: 'success',
        title: 'Feedback Saved',
        message: 'Thank you for your rating!'
      });
    }
  };

  // 5. Reset All Sample Data
  const resetToSampleData = () => {
    setComplaints(INITIAL_COMPLAINTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    addToast({
      type: 'info',
      title: 'Data Reset',
      message: 'CampusCare complaint records reset to sample data.'
    });
    closeModal();
  };

  // Selectors
  const studentComplaints = (complaints || []).filter(item => {
    if (!item) return false;
    return (
      (item.student?.id && currentPersona?.id && String(item.student.id) === String(currentPersona.id)) ||
      (item.student?.email && currentPersona?.email && item.student.email.toLowerCase() === currentPersona.email.toLowerCase()) ||
      (item.student?.studentId && currentPersona?.studentId && item.student.studentId.toLowerCase() === currentPersona.studentId.toLowerCase()) ||
      (item.studentId && currentPersona?.studentId && item.studentId.toLowerCase() === currentPersona.studentId.toLowerCase())
    );
  });

  const stats = {
    total: complaints.length,
    submitted: complaints.filter(c => c.status === 'Submitted').length,
    underReview: complaints.filter(c => c.status === 'Under Review').length,
    assigned: complaints.filter(c => c.status === 'Assigned').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    closed: complaints.filter(c => c.status === 'Closed').length,
    urgent: complaints.filter(c => c.priority === 'urgent' && c.status !== 'Resolved' && c.status !== 'Closed').length,
    myTotal: studentComplaints.length,
    myActive: studentComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length,
    myResolved: studentComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentPersona,
        complaints,
        loadingComplaints,
        refreshComplaints,
        notifications,
        setNotifications,
        toasts,
        addToast,
        removeToast,
        activeTab,
        setActiveTab,
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
        modalState,
        openModal,
        closeModal,
        submitComplaint,
        triageComplaint,
        updateComplaintStatus,
        addComment,
        submitRating,
        resetToSampleData,
        studentComplaints,
        stats
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
