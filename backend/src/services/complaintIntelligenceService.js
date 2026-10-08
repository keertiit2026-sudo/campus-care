import { db } from '../db/storage.js';
import { INTELLIGENCE_CONFIG } from '../config/intelligenceConfig.js';
import { findSimilarComplaints } from './similarityService.js';

// Department & Category mappings
const CATEGORY_DEPARTMENT_MAP = {
  it_wifi: { id: 'it_services', name: 'IT Services & Network Infrastructure' },
  electrical: { id: 'electrical_dept', name: 'Electrical & Power Infrastructure' },
  water_plumbing: { id: 'water_plumbing', name: 'Water & Plumbing Maintenance' },
  washroom_cleanliness: { id: 'sanitation_dept', name: 'Campus Sanitation & Hygiene' },
  classroom_furniture: { id: 'estate_furniture', name: 'Estate & Classroom Infrastructure' },
  laboratory: { id: 'lab_maintenance', name: 'Laboratory Equipment & Tech Support' },
  hostel: { id: 'hostel_estate', name: 'Hostel Administration & Facilities' },
  campus_grounds: { id: 'civil_grounds', name: 'Civil Infrastructure & Grounds' },
  security_safety: { id: 'campus_security', name: 'Campus Security & Safety' },
  other: { id: 'estate_furniture', name: 'General Maintenance Pool' }
};

const CATEGORY_KEYWORDS = {
  it_wifi: [
    'wifi', 'wi-fi', 'internet', 'network', 'router', 'lan', 'ethernet',
    'slow internet', 'not connecting', 'portal', 'login', 'server', 'firewall',
    'access point', 'ip address', 'disconnect', 'packet drop', 'slow speed'
  ],
  electrical: [
    'spark', 'shock', 'switch', 'socket', 'switchboard', 'mcb', 'power',
    'blackout', 'power cut', 'short circuit', 'wiring', 'light', 'tube light',
    'bulb', 'fan', 'ac', 'air conditioner', 'smoke', 'generator', 'fuse'
  ],
  water_plumbing: [
    'water', 'pipe', 'tap', 'faucet', 'leak', 'leakage', 'burst', 'overflow',
    'drain', 'drainage', 'sink', 'washbasin', 'cooler', 'drinking water',
    'purifier', 'filter', 'seepage', 'low pressure', 'no water'
  ],
  washroom_cleanliness: [
    'washroom', 'toilet', 'restroom', 'dirty', 'smell', 'stink', 'stinking',
    'urinal', 'soap', 'dustbin', 'garbage', 'trash', 'hygiene', 'cleaning',
    'uncleaned', 'choked', 'flush', 'bad odor', 'sanitation'
  ],
  classroom_furniture: [
    'projector', 'hdmi', 'screen', 'podium', 'mic', 'microphone', 'speaker',
    'audio', 'desk', 'bench', 'chair', 'table', 'whiteboard', 'blackboard',
    'marker', 'broken desk', 'audio jack', 'classroom'
  ],
  laboratory: [
    'lab', 'laboratory', 'apparatus', 'microscope', 'centrifuge', 'chemical',
    'glassware', 'specimen', 'fume hood', 'bunsen burner', 'multimeter',
    'oscilloscope', 'pc lab', 'computer lab', 'instrument', 'calibration'
  ],
  hostel: [
    'hostel', 'room', 'mess', 'geyser', 'hot water', 'bed', 'almirah',
    'cupboard', 'window pane', 'dorm', 'warden', 'laundry', 'curfew'
  ],
  campus_grounds: [
    'road', 'pothole', 'street light', 'lamp post', 'pathway', 'walkway',
    'garden', 'grass', 'lawn', 'parking', 'gate', 'boundary', 'drainage ground'
  ],
  security_safety: [
    'theft', 'stolen', 'ragging', 'fight', 'threat', 'emergency', 'fire',
    'cctv', 'camera', 'guard', 'trespass', 'harassment', 'lost item'
  ]
};

const URGENT_TRIGGERS = [
  'fire', 'smoke', 'spark', 'electric shock', 'short circuit', 'blackout',
  'burst pipe', 'flooding', 'flood', 'theft', 'stolen', 'ragging', 'injury',
  'emergency', 'gas leak', 'danger', 'hazard', 'severe'
];

const HIGH_TRIGGERS = [
  'not working', 'unable to access', 'many students', 'completely down',
  'entire class', 'exam', 'practical', 'presentation', 'broken', 'blocked',
  'stinking', 'no water', 'urgent', 'critical'
];

/**
 * Perform Natural Language analysis on a complaint title, description, and location
 */
export const analyzeComplaint = async (complaint) => {
  const title = (complaint.title || '').toLowerCase();
  const description = (complaint.description || '').toLowerCase();
  const location = (typeof complaint.location === 'object' ? JSON.stringify(complaint.location) : (complaint.location || '')).toLowerCase();
  const fullText = `${title} ${description} ${location}`;

  // 1. Category Classification
  let bestCategory = complaint.category || 'other';
  let highestScore = 0;
  const matchedSignals = [];

  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (title.includes(kw)) score += 3;
      else if (description.includes(kw)) score += 1;
    }

    if (score > highestScore) {
      highestScore = score;
      bestCategory = catId;
    }
  }

  // 2. Priority & Urgency Scoring
  let suggestedPriority = 'medium';
  let priorityReason = 'Standard campus maintenance request.';

  const isUrgent = URGENT_TRIGGERS.some(trig => fullText.includes(trig));
  const isHigh = HIGH_TRIGGERS.some(trig => fullText.includes(trig)) || location.includes('lab') || location.includes('lh-') || location.includes('hall');

  if (isUrgent) {
    suggestedPriority = 'urgent';
    priorityReason = 'Urgent safety or infrastructure disruption pattern detected in complaint text.';
    matchedSignals.push('Critical safety / severe hazard terms detected');
  } else if (isHigh) {
    suggestedPriority = 'high';
    priorityReason = 'High academic impact or multiple student disruption reported in academic facility.';
    matchedSignals.push('Academic facility / widespread disruption indicator');
  } else if (fullText.includes('low') || fullText.includes('minor') || fullText.includes('cosmetic')) {
    suggestedPriority = 'low';
    priorityReason = 'Routine maintenance item with minimal disruption.';
  }

  // 3. Recommended Department
  const deptInfo = CATEGORY_DEPARTMENT_MAP[bestCategory] || CATEGORY_DEPARTMENT_MAP.other;

  // 4. Assign Recommended Technician (first active staff in department)
  let staffList = [];
  try {
    staffList = (await db.getStaffMembers('active')) || [];
  } catch {
    staffList = [];
  }
  const matchedStaff = staffList.find(s => (s.departmentId === deptInfo.id || s.department === deptInfo.id) && (s.status || 'active') === 'active') || null;

  // 5. Build Transparent Reasons
  const reasons = [];
  if (location.includes('lab') || location.includes('lh') || location.includes('hall') || location.includes('room')) {
    reasons.push(`Incident located in instructional facility (${complaint.location || 'Academic Zone'}).`);
  }
  if (highestScore > 0) {
    reasons.push(`Matches technical patterns for ${deptInfo.name}.`);
  }
  reasons.push(priorityReason);

  const confidence = Math.min(0.96, Math.max(0.75, 0.70 + (highestScore * 0.04)));

  return {
    analyzed: true,
    suggestedCategory: bestCategory,
    suggestedPriority,
    suggestedDepartmentId: deptInfo.id,
    suggestedDepartmentName: deptInfo.name,
    suggestedStaffId: matchedStaff ? matchedStaff.id : null,
    suggestedStaffName: matchedStaff ? matchedStaff.name : 'Next Available Technician',
    confidence,
    reasons,
    sentiment: suggestedPriority === 'urgent' ? 'negative' : 'neutral',
    urgencyReason: priorityReason,
    analyzedAt: new Date().toISOString()
  };
};
