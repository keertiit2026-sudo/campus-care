import { db } from '../db/storage.js';

// Keywords dictionary for category classification
const CATEGORY_KEYWORDS = {
  wifi_it: ['wifi', 'wi-fi', 'internet', 'network', 'router', 'access point', 'ap-', 'dhcp', 'ethernet', 'lan', 'connection', 'portal', 'terminal', 'offline', 'server', 'dns'],
  electrical: ['light', 'tube', 'lamp', 'projector', 'bulb', 'power', 'plug', 'socket', 'switch', 'spark', 'blackout', 'short circuit', 'voltage', 'fan', 'ac', 'hvac', 'fuse', 'generator'],
  hostel: ['hostel', 'room', 'bed', 'warden', 'corridor', 'dorm', 'gargi', 'hall of residence', 'geyser', 'mattress', 'almirah', 'curtain', 'mess'],
  classroom: ['classroom', 'lecture hall', 'desk', 'bench', 'podium', 'chalkboard', 'whiteboard', 'mic', 'microphone', 'audio', 'speaker', 'chair', 'furniture', 'lab', 'lh-'],
  cleanliness: ['trash', 'dustbin', 'bin', 'garbage', 'waste', 'smell', 'odor', 'dirty', 'sweep', 'clean', 'washroom', 'toilet', 'hygiene', 'cockroach', 'insects', 'pest', 'litter'],
  infrastructure: ['door', 'window', 'ceiling', 'wall', 'crack', 'stair', 'steps', 'handrail', 'leak', 'leakage', 'pipe', 'tap', 'water', 'drain', 'puddle', 'tiles', 'roof', 'lift', 'elevator'],
  transport: ['bus', 'shuttle', 'route', 'driver', 'late', 'schedule', 'stop', 'gate 3', 'parking', 'ev', 'van'],
  canteen: ['canteen', 'food', 'meal', 'lunch', 'breakfast', 'dinner', 'hygiene', 'taste', 'spoiled', 'cafeteria', 'snack', 'price', 'court'],
  library: ['library', 'book', 'issue', 'journal', 'reading room', 'quiet zone', 'librarian', 'borrow', 'return', 'catalog', 'stack'],
  academics: ['grade', 'exam', 'marks', 'hall ticket', 'admit card', 'professor', 'faculty', 'transcript', 'registration', 'course', 'credit', 'syllabus']
};

// Department mapping from category
const CATEGORY_TO_DEPARTMENT = {
  wifi_it: 'it_services',
  electrical: 'electrical',
  hostel: 'hostel_admin',
  classroom: 'civil',
  cleanliness: 'sanitation',
  infrastructure: 'civil',
  transport: 'transport',
  canteen: 'canteen',
  library: 'library',
  academics: 'academics'
};

// Urgency keywords scoring
const URGENT_SIGNALS = [
  { term: 'exam', weight: 4, reason: 'Impacts ongoing student examinations' },
  { term: 'practical exam', weight: 5, reason: 'Impacting live practical evaluation sessions' },
  { term: 'spark', weight: 5, reason: 'Electrical fire / safety hazard detected' },
  { term: 'short circuit', weight: 5, reason: 'Electrical short circuit risk' },
  { term: 'smoke', weight: 5, reason: 'Smoke or fire warning signal' },
  { term: 'flood', weight: 4, reason: 'Water flooding risk in campus facility' },
  { term: 'severe leakage', weight: 4, reason: 'Severe plumbing / water containment failure' },
  { term: 'many students', weight: 3, reason: 'Affects multiple students concurrently' },
  { term: 'entire class', weight: 3, reason: 'Disrupting entire classroom / lecture cohort' },
  { term: 'completely down', weight: 4, reason: 'Total service outage reported' },
  { term: 'power cut', weight: 3, reason: 'Power loss in academic or residential zone' },
  { term: 'injury', weight: 5, reason: 'Physical hazard or injury risk' },
  { term: 'broken glass', weight: 3, reason: 'Physical sharp hazard present' }
];

const HIGH_SIGNALS = [
  { term: 'not working', weight: 2, reason: 'Equipment or system is completely inoperable' },
  { term: 'unable to connect', weight: 2, reason: 'Students blocked from accessing critical service' },
  { term: 'overflowing', weight: 2, reason: 'Sanitation overflow requires priority housekeeping' },
  { term: 'lecture', weight: 2, reason: 'Disrupting academic instruction' },
  { term: 'urgent', weight: 3, reason: 'Reported with high urgency tag by student' },
  { term: 'burnt', weight: 3, reason: 'Hardware failure or burnt component' }
];

/**
 * Smart Complaint Analysis Service
 * Evaluates complaint content and produces explainable category, priority, department, and assignment suggestions.
 */
export const analyzeComplaint = (complaintData) => {
  try {
    const title = (complaintData.title || '').toLowerCase();
    const desc = (complaintData.description || '').toLowerCase();
    const locationStr = typeof complaintData.location === 'string'
      ? complaintData.location.toLowerCase()
      : '';
    const fullText = `${title} ${desc} ${locationStr}`;

    const reasons = [];

    // 1. Category Suggestion & Scoring
    let bestCategory = complaintData.category || 'wifi_it';
    let highestCatScore = 0;

    Object.entries(CATEGORY_KEYWORDS).forEach(([catKey, keywords]) => {
      let score = 0;
      keywords.forEach(kw => {
        if (fullText.includes(kw)) {
          score += 1;
        }
      });
      if (score > highestCatScore) {
        highestCatScore = score;
        bestCategory = catKey;
      }
    });

    if (highestCatScore > 0) {
      reasons.push(`Detected signals matching ${bestCategory.replace('_', ' ').toUpperCase()} keywords in problem description.`);
    }

    // 2. Priority Suggestion & Scoring
    let priorityScore = 1; // 1 = low, 2 = medium, 3 = high, 4+ = urgent
    let suggestedPriority = 'medium';

    // Check urgent triggers
    URGENT_SIGNALS.forEach(sig => {
      if (fullText.includes(sig.term)) {
        priorityScore += sig.weight;
        reasons.push(sig.reason);
      }
    });

    // Check high triggers
    HIGH_SIGNALS.forEach(sig => {
      if (fullText.includes(sig.term)) {
        priorityScore += sig.weight;
        if (!reasons.includes(sig.reason)) {
          reasons.push(sig.reason);
        }
      }
    });

    if (priorityScore >= 5) {
      suggestedPriority = 'urgent';
    } else if (priorityScore >= 3) {
      suggestedPriority = 'high';
    } else if (priorityScore >= 2) {
      suggestedPriority = 'medium';
    } else {
      suggestedPriority = 'low';
    }

    // 3. Department Recommendation
    const suggestedDeptId = CATEGORY_TO_DEPARTMENT[bestCategory] || 'it_services';
    const deptObj = db.findDepartmentById(suggestedDeptId);
    const suggestedDeptName = deptObj ? deptObj.name : 'Maintenance Department';

    // 4. Staff Technician Suggestion (First available ACTIVE technician in department)
    const staffInDept = db.getStaffMembers('active').filter(s => s.departmentId === suggestedDeptId && (s.status || 'active') === 'active');
    const suggestedStaff = staffInDept.length > 0 ? staffInDept[0] : null;

    if (reasons.length === 0) {
      reasons.push('Standard campus service request based on location and reported category.');
    }

    return {
      analyzed: true,
      suggestedCategory: bestCategory,
      suggestedPriority,
      suggestedDepartmentId: suggestedDeptId,
      suggestedDepartmentName: suggestedDeptName,
      suggestedStaffId: suggestedStaff ? suggestedStaff.id : null,
      suggestedStaffName: suggestedStaff ? suggestedStaff.name : null,
      confidence: Math.min(0.95, Math.max(0.65, (highestCatScore * 0.15) + (priorityScore * 0.1))),
      reasons,
      analyzedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('complaintIntelligenceService error:', err);
    // Safe graceful fallback so complaint flow never breaks
    return {
      analyzed: false,
      suggestedCategory: complaintData.category || 'wifi_it',
      suggestedPriority: complaintData.priority || 'medium',
      suggestedDepartmentId: 'it_services',
      suggestedDepartmentName: 'IT Services & Network Infrastructure',
      suggestedStaffId: null,
      suggestedStaffName: null,
      confidence: 0.5,
      reasons: ['Smart analysis performed in basic fallback mode.'],
      analyzedAt: new Date().toISOString()
    };
  }
};
