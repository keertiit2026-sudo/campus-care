import { db } from '../db/storage.js';
import { analyzeComplaint } from '../services/complaintIntelligenceService.js';

// 1. List Complaints with Filtering & Search
export const getComplaints = (req, res) => {
  try {
    const { category, status, priority, search, myOnly } = req.query;
    let list = db.getComplaints();

    // If student requested only their complaints, or default for myOnly param
    if (myOnly === 'true' || (req.user.role === 'student' && myOnly === 'true')) {
      list = list.filter(c => c.student?.id === req.user.id || c.student?.email === req.user.email);
    }

    // Filter Category
    if (category && category !== 'all') {
      list = list.filter(c => c.category === category);
    }

    // Filter Status
    if (status && status !== 'all') {
      list = list.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }

    // Filter Priority
    if (priority && priority !== 'all') {
      list = list.filter(c => c.priority.toLowerCase() === priority.toLowerCase());
    }

    // Search Query
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }

    res.json({ complaints: list, total: list.length });
  } catch (err) {
    console.error('getComplaints error:', err);
    res.status(500).json({ error: 'Failed to retrieve complaints.' });
  }
};

// 2. Get Single Complaint by ID
export const getComplaintById = (req, res) => {
  try {
    const { id } = req.params;
    const complaint = db.findComplaintById(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }
    res.json({ complaint });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve complaint details.' });
  }
};

// 3. Create New Complaint
export const createComplaint = (req, res) => {
  try {
    const { title, description, category, priority, location, manualLocation, gpsLocation, locationDetails, coordinates, floorLevel, attachments } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required.' });
    }

    // Build structured location
    const finalManualLocation = manualLocation || locationDetails || {};
    const finalGpsLocation = gpsLocation || (typeof location === 'object' ? location.gpsLocation : null);

    // Fallback composite location string if not explicitly passed
    let displayLocation = location;
    if (typeof displayLocation !== 'string' || !displayLocation.trim()) {
      const parts = [];
      if (finalManualLocation.building) parts.push(finalManualLocation.building);
      if (finalManualLocation.floor) parts.push(finalManualLocation.floor);
      if (finalManualLocation.roomOrSpot) parts.push(finalManualLocation.roomOrSpot);
      displayLocation = parts.join(' → ');
      if (finalGpsLocation?.address) {
        displayLocation = displayLocation ? `${displayLocation} (${finalGpsLocation.address})` : finalGpsLocation.address;
      }
    }

    const newId = `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newComplaint = {
      id: newId,
      title: title.trim(),
      description: description.trim(),
      category,
      priority: priority || 'medium',
      status: 'Submitted',
      location: (typeof displayLocation === 'string' && displayLocation.trim() ? displayLocation.trim() : 'Campus Location'),
      manualLocation: {
        building: finalManualLocation.building || '',
        floor: finalManualLocation.floor || floorLevel || 'Ground Floor',
        roomOrSpot: finalManualLocation.roomOrSpot || '',
        additionalDetails: finalManualLocation.additionalDetails || ''
      },
      gpsLocation: {
        address: finalGpsLocation?.address || (typeof finalGpsLocation === 'string' ? finalGpsLocation : null)
      },
      floorLevel: floorLevel || finalManualLocation.floor || 'Ground Floor',
      student: {
        id: req.user.id,
        name: req.user.name,
        studentId: req.user.studentId || 'STU-COLLEGE',
        email: req.user.email,
        department: req.user.department || 'Student',
        avatar: req.user.avatar
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedDepartment: null,
      assignedStaff: null,
      attachments: attachments || [],
      statusHistory: [
        {
          id: `sh-${Date.now()}`,
          fromStatus: null,
          toStatus: 'Submitted',
          changedBy: `${req.user.name} (${req.user.role})`,
          timestamp: new Date().toISOString(),
          note: 'Complaint registered by student'
        }
      ],
      comments: [],
      resolutionNotes: null,
      resolutionPhoto: null,
      resolvedAt: null,
      rating: null,
      feedback: null,
      intelligence: analyzeComplaint({
        title: title.trim(),
        description: description.trim(),
        category,
        priority: priority || 'medium',
        location: displayLocation
      })
    };

    db.createComplaint(newComplaint);

    res.status(201).json({
      message: 'Complaint submitted successfully.',
      complaint: newComplaint
    });
  } catch (err) {
    console.error('createComplaint error:', err);
    res.status(500).json({ error: 'Failed to create complaint.' });
  }
};

// 4. Triage & Dispatch (Admin / Staff Only)
export const triageComplaint = (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedDepartment, assignedStaff, statusNote, resolutionNotes, resolutionPhoto } = req.body;

    const complaint = db.findComplaintById(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    // Enforce resolution note requirement when moving to Resolved
    if (status === 'Resolved' && (!resolutionNotes || resolutionNotes.trim().length < 10)) {
      return res.status(400).json({ 
        error: 'A detailed resolution note (at least 10 characters) is required when marking a complaint as Resolved.' 
      });
    }

    const isStatusChange = status && status !== complaint.status;
    const newHistory = [...(complaint.statusHistory || [])];

    if (isStatusChange) {
      newHistory.push({
        id: `sh-${Date.now()}`,
        fromStatus: complaint.status,
        toStatus: status,
        changedBy: `${req.user.name} (${req.user.role})`,
        timestamp: new Date().toISOString(),
        note: statusNote || `Status updated from ${complaint.status} to ${status}`
      });
    }

    const isResolved = status === 'Resolved';

    const updated = db.updateComplaint(id, {
      status: status || complaint.status,
      priority: priority || complaint.priority,
      assignedDepartment: assignedDepartment !== undefined ? assignedDepartment : complaint.assignedDepartment,
      assignedStaff: assignedStaff !== undefined ? assignedStaff : complaint.assignedStaff,
      resolutionNotes: isResolved ? resolutionNotes.trim() : complaint.resolutionNotes,
      resolutionPhoto: isResolved ? (resolutionPhoto || complaint.resolutionPhoto) : complaint.resolutionPhoto,
      resolvedAt: isResolved ? new Date().toISOString() : complaint.resolvedAt,
      statusHistory: newHistory
    });

    res.json({
      message: 'Complaint updated successfully.',
      complaint: updated
    });
  } catch (err) {
    console.error('triageComplaint error:', err);
    res.status(500).json({ error: 'Failed to update complaint.' });
  }
};

// 5. Add Comment to Discussion
export const addComment = (req, res) => {
  try {
    const { id } = req.params;
    const { message, isInternal } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Comment message cannot be empty.' });
    }

    const complaint = db.findComplaintById(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const newComment = {
      id: `c-${Date.now()}`,
      authorName: req.user.name,
      authorRole: req.user.role,
      authorAvatar: req.user.avatar,
      timestamp: new Date().toISOString(),
      message: message.trim(),
      isInternal: !!isInternal
    };

    const updated = db.updateComplaint(id, {
      comments: [...(complaint.comments || []), newComment]
    });

    res.status(201).json({
      message: 'Comment posted.',
      comment: newComment,
      complaint: updated
    });
  } catch (err) {
    console.error('addComment error:', err);
    res.status(500).json({ error: 'Failed to post comment.' });
  }
};

// 6. Submit Satisfaction Rating
export const submitRating = (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    }

    const complaint = db.findComplaintById(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const updated = db.updateComplaint(id, {
      rating: Number(rating),
      feedback: feedback ? feedback.trim() : null
    });

    res.json({
      message: 'Rating submitted successfully.',
      complaint: updated
    });
  } catch (err) {
    console.error('submitRating error:', err);
    res.status(500).json({ error: 'Failed to submit rating.' });
  }
};
