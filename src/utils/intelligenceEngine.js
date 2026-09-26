import { CATEGORIES } from '../data/categories';

export const CAMPUS_BUILDINGS_PRESET = [
  {
    id: 'bld_turing',
    name: 'Turing Block',
    code: 'TUR',
    type: 'Academic & Labs',
    description: 'Computer Science, AI Labs & Data Center',
    zones: ['Lab 304', 'Lab 201', 'Server Room', 'Faculty Annex'],
    icon: 'Terminal'
  },
  {
    id: 'bld_science',
    name: 'Science Block',
    code: 'SCI',
    type: 'Lecture Halls & Research',
    description: 'Physics, Chemistry, Electronics & Lecture Theaters',
    zones: ['Hall LH-201', 'Hall LH-102', 'Optics Lab', 'Chemistry Core'],
    icon: 'FlaskConical'
  },
  {
    id: 'bld_library',
    name: 'Central Library',
    code: 'LIB',
    type: 'Learning Resource Center',
    description: 'Main Library, Study Pods & Digital Archive',
    zones: ['3rd Floor Quiet Zone', 'Ground Reading Hall', 'Digital Media Lab'],
    icon: 'BookOpen'
  },
  {
    id: 'bld_hostel_gargi',
    name: 'Gargi Hall of Residence',
    code: 'GARGI',
    type: 'Residential Hostel',
    description: 'Student Residential Quarters & Dining Annex',
    zones: ['Wing B 2nd Floor', 'Wing A 1st Floor', 'Common Room', 'Dining Hall'],
    icon: 'Building2'
  },
  {
    id: 'bld_sac',
    name: 'Student Activity Center',
    code: 'SAC',
    type: 'Student Welfare & Dining',
    description: 'Food Court, Canteen, Clubs & Amphitheater',
    zones: ['Canteen Courtyard', 'Main Cafeteria', 'Club Hub', 'Sports Center'],
    icon: 'Utensils'
  },
  {
    id: 'bld_admin',
    name: 'Administrative Block',
    code: 'ADMIN',
    type: 'Administration & Registry',
    description: "Dean's Office, Registrar, Accounts & Student Welfare",
    zones: ['Suite 101', 'Main Reception', 'Boardroom', 'Accounts Hall'],
    icon: 'Building'
  },
  {
    id: 'bld_engineering',
    name: 'Engineering Annex',
    code: 'ENG',
    type: 'Workshops & Mechanical',
    description: 'Mechanical Workshops, Robotics & High-Voltage Labs',
    zones: ['Workshop Bay 2', 'Robotics Lab', 'Heavy Machinery Yard'],
    icon: 'Wrench'
  },
  {
    id: 'bld_transport',
    name: 'Campus Transport Yard',
    code: 'TRANS',
    type: 'Logistics & Fleet',
    description: 'Gate 3 Bus Terminus & Fleet Maintenance',
    zones: ['Gate 3 Terminus', 'Dispatch Depot', 'EV Charging Bay'],
    icon: 'Bus'
  }
];

export const formatLocationString = (location) => {
  if (!location) return 'Campus Location';
  if (typeof location === 'string') return location;
  if (typeof location === 'object') {
    const parts = [];
    if (location.building) parts.push(location.building);
    if (location.floor) parts.push(String(location.floor).includes('Floor') ? location.floor : `${location.floor} Floor`);
    if (location.roomOrSpot || location.room) parts.push(location.roomOrSpot || location.room);
    if (location.additionalDetails) parts.push(location.additionalDetails);
    return parts.length > 0 ? parts.join(' → ') : 'Campus Location';
  }
  return String(location);
};

export const identifyBuildingFromLocation = (location) => {
  if (!location) return null;
  const str = String(typeof location === 'object' ? `${location.building || ''} ${location.room || ''} ${location.floor || ''}` : location).toLowerCase();

  for (const b of CAMPUS_BUILDINGS_PRESET) {
    if (str.includes(b.name.toLowerCase()) || str.includes(b.code.toLowerCase())) {
      return b;
    }
  }

  if (str.includes('turing') || str.includes('cs ') || str.includes('lab 3')) return CAMPUS_BUILDINGS_PRESET[0];
  if (str.includes('science') || str.includes('lh-') || str.includes('hall')) return CAMPUS_BUILDINGS_PRESET[1];
  if (str.includes('library') || str.includes('reading')) return CAMPUS_BUILDINGS_PRESET[2];
  if (str.includes('gargi') || str.includes('hostel') || str.includes('room 314') || str.includes('dorm')) return CAMPUS_BUILDINGS_PRESET[3];
  if (str.includes('sac') || str.includes('canteen') || str.includes('cafeteria') || str.includes('court')) return CAMPUS_BUILDINGS_PRESET[4];
  if (str.includes('admin') || str.includes('registry') || str.includes('dean')) return CAMPUS_BUILDINGS_PRESET[5];
  if (str.includes('workshop') || str.includes('engineering') || str.includes('mech')) return CAMPUS_BUILDINGS_PRESET[6];
  if (str.includes('transport') || str.includes('bus') || str.includes('gate 3')) return CAMPUS_BUILDINGS_PRESET[7];

  return CAMPUS_BUILDINGS_PRESET[0];
};

export const extractZoneFromLocation = (location) => {
  if (!location) return 'General Facility';
  if (typeof location === 'object') {
    if (location.roomOrSpot) return location.roomOrSpot;
    if (location.room) return location.room;
    if (location.floor) return `${location.floor} Floor`;
  }
  const str = String(location);
  const match = str.match(/(?:lab|lh|hall|room|wing|floor|suite|bay|yard|depot)\s*[-:]?\s*([a-z0-9-]+(?:\s+[a-z0-9-]+)?)/i);
  if (match) return match[0].trim();
  const parts = str.split('→');
  if (parts.length > 2) return parts[2].trim();
  return str.split(',')[0].trim() || 'General Area';
};

/**
 * Computes live heatmap intelligence data directly from active complaints
 */
export const computeClientHeatmapData = (complaints = [], filters = {}) => {
  const { category, priority, timeRange } = filters;
  const now = new Date();

  let windowDays = 30;
  if (timeRange === '7d') windowDays = 7;
  else if (timeRange === '90d') windowDays = 90;
  else if (timeRange === 'all') windowDays = 3650;

  const filtered = complaints.filter(c => {
    if (category && category !== 'all' && c.category !== category) return false;
    if (priority && priority !== 'all' && c.priority !== priority) return false;

    if (c.createdAt && timeRange !== 'all') {
      const diff = (now - new Date(c.createdAt)) / (1000 * 60 * 60 * 24);
      if (diff > windowDays) return false;
    }
    return true;
  });

  const bldMap = {};
  CAMPUS_BUILDINGS_PRESET.forEach(b => {
    bldMap[b.id] = {
      ...b,
      totalCount: 0,
      activeCount: 0,
      urgentCount: 0,
      resolvedCount: 0,
      categories: {},
      zones: {},
      complaints: [],
      density: 'low'
    };
  });

  filtered.forEach(comp => {
    const matchedBld = identifyBuildingFromLocation(comp.location) || CAMPUS_BUILDINGS_PRESET[0];
    const target = bldMap[matchedBld.id];

    if (target) {
      target.totalCount++;
      target.complaints.push(comp);

      const status = (comp.status || '').toLowerCase();
      if (status !== 'resolved' && status !== 'closed') {
        target.activeCount++;
      } else {
        target.resolvedCount++;
      }

      if (comp.priority === 'urgent') {
        target.urgentCount++;
      }

      const cat = comp.category || 'other';
      target.categories[cat] = (target.categories[cat] || 0) + 1;

      const zone = extractZoneFromLocation(comp.location);
      target.zones[zone] = (target.zones[zone] || 0) + 1;
    }
  });

  const buildings = Object.values(bldMap).map(b => {
    let density = 'low';
    if (b.activeCount >= 3 || b.urgentCount >= 2) {
      density = 'high';
    } else if (b.activeCount >= 1) {
      density = 'medium';
    }

    const sortedZones = Object.entries(b.zones).sort((x, y) => y[1] - x[1]);
    const topZone = sortedZones.length > 0 ? sortedZones[0][0] : 'Main Area';

    const sortedCats = Object.entries(b.categories).sort((x, y) => y[1] - x[1]);
    const topCategory = sortedCats.length > 0 ? sortedCats[0][0] : 'General';

    return {
      ...b,
      density,
      topZone,
      topCategory,
      complaints: Array.isArray(b.complaints) ? b.complaints.slice(0, 10) : []
    };
  });

  const totalComplaints = filtered.length;
  const activeComplaints = filtered.filter(c => {
    const s = (c.status || '').toLowerCase();
    return s !== 'resolved' && s !== 'closed';
  }).length;
  const criticalHotspots = buildings.filter(b => b.density === 'high').length;
  const healthyZones = buildings.filter(b => b.density === 'low').length;

  return {
    kpis: {
      totalComplaints,
      activeComplaints,
      criticalHotspots,
      healthyZones,
      recurringPatterns: Math.max(1, criticalHotspots)
    },
    buildings
  };
};

/**
 * Computes live intelligence alerts from complaints
 */
export const computeClientIntelligenceAlerts = (complaints = []) => {
  const alerts = [];

  // 1. High Urgency & Safety Tickets
  const urgentTickets = (Array.isArray(complaints) ? complaints : []).filter(c => {
    const s = String(c?.status || '').toLowerCase();
    return c?.priority === 'urgent' && s !== 'resolved' && s !== 'closed';
  });

  urgentTickets.forEach(c => {
    const bld = identifyBuildingFromLocation(c.location) || { name: 'Campus Facility' };
    const locText = formatLocationString(c.location) || bld.name;
    alerts.push({
      id: `alert_urg_${c.id}`,
      type: 'urgent_hazard',
      severity: 'urgent',
      title: `⚡ Urgent Safety Alert: ${c.title || 'Safety Hazard'}`,
      message: `Critical priority ticket reported at ${locText}. Immediate triage recommended.`,
      complaintId: c.id,
      timestamp: c.createdAt || new Date().toISOString(),
      actionUrl: `/admin/triage/${c.id}`
    });
  });

  // 2. High Density Building Hotspots
  const heatmap = computeClientHeatmapData(complaints, { timeRange: '30d' });
  (Array.isArray(heatmap?.buildings) ? heatmap.buildings : []).filter(b => b.density === 'high' || b.activeCount >= 2).forEach(b => {
    alerts.push({
      id: `alert_density_${b.id}`,
      type: 'hotspot_density',
      severity: b.density === 'high' ? 'critical' : 'warning',
      title: `📍 High Complaint Concentration: ${b.name}`,
      message: `${b.activeCount} active requests concentrated in ${b.name}. Top zone: ${b.topZone}.`,
      buildingName: b.name,
      category: b.topCategory,
      timestamp: new Date().toISOString(),
      actionUrl: `/admin/intelligence?building=${encodeURIComponent(b.name)}`
    });
  });

  return alerts;
};

/**
 * Computes summary telemetry
 */
export const computeClientIntelligenceSummary = (complaints = []) => {
  const heatmap = computeClientHeatmapData(complaints, { timeRange: '30d' });
  const alerts = computeClientIntelligenceAlerts(complaints);

  const urgentPending = (Array.isArray(complaints) ? complaints : []).filter(c => {
    const s = String(c?.status || '').toLowerCase();
    return c?.priority === 'urgent' && s !== 'resolved' && s !== 'closed';
  });

  return {
    kpis: {
      totalComplaints: heatmap.kpis.totalComplaints,
      activeComplaints: heatmap.kpis.activeComplaints,
      criticalHotspots: heatmap.kpis.criticalHotspots,
      recurringPatterns: heatmap.kpis.recurringPatterns,
      urgentPendingCount: urgentPending.length,
      healthyZonesCount: heatmap.kpis.healthyZones
    },
    topHotspots: (Array.isArray(heatmap?.buildings) ? heatmap.buildings : []).sort((a, b) => (b.activeCount || 0) - (a.activeCount || 0)).slice(0, 4),
    recentAlerts: (Array.isArray(alerts) ? alerts : []).slice(0, 5)
  };
};

/**
 * Client-Side Natural Language AI Smart Triage Engine
 */
export const analyzeDraftClient = ({ title = '', description = '', category = '', priority = '', location = '' } = {}) => {
  const locStr = formatLocationString(location);
  const text = `${title || ''} ${description || ''} ${locStr}`.toLowerCase();
  
  const scores = {
    it_wifi: 0,
    electrical: 0,
    water_plumbing: 0,
    washroom_cleanliness: 0,
    classroom_furniture: 0,
    laboratory: 0,
    hostel: 0,
    campus_grounds: 0,
    security_safety: 0,
    other: 0
  };

  if (/wifi|wi-fi|internet|network|router|lan|ethernet|server|portal|login|slow speed|no signal|disconnect|dns|ip address/i.test(text)) scores.it_wifi += 4;
  if (/spark|shock|socket|switchboard|power|blackout|mcb|tripped|wiring|light|tube light|bulb|fan|smoke|short circuit/i.test(text)) scores.electrical += 4;
  if (/leak|water|pipe|tap|faucet|plumb|burst|overflow|drain|seepage|sink|cooler|purifier/i.test(text)) scores.water_plumbing += 4;
  if (/washroom|toilet|restroom|dirty|smell|stink|urinal|soap|dustbin|garbage|mess|hygiene|clean/i.test(text)) scores.washroom_cleanliness += 4;
  if (/projector|hdmi|screen|podium|desk|bench|chair|whiteboard|marker|mic|speaker|audio|table/i.test(text)) scores.classroom_furniture += 4;
  if (/lab|centrifuge|microscope|oscilloscope|chemical|glassware|specimen|multimeter|instrument/i.test(text)) scores.laboratory += 4;
  if (/hostel|room|mess|geyser|bed|cupboard|almirah|dorm|warden/i.test(text)) scores.hostel += 4;
  if (/street light|pothole|pathway|gate|parking|grass|ground|drainage|lawn/i.test(text)) scores.campus_grounds += 4;
  if (/theft|stolen|ragging|fight|threat|emergency|fire|cctv|trespass|harassment/i.test(text)) scores.security_safety += 6;

  let bestCat = category || 'other';
  let maxScore = 0;
  for (const [catId, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCat = catId;
    }
  }

  let suggestedPriority = 'medium';
  let urgencyReason = 'Standard campus maintenance request.';

  if (/fire|smoke|spark|shock|burst|flood|theft|ragging|injury|emergency|blackout/i.test(text)) {
    suggestedPriority = 'urgent';
    urgencyReason = 'Critical safety hazard or severe infrastructure disruption detected.';
  } else if (/exam|urgent|broken|blocked|stinking|failed|critical|many students|unable to access/i.test(text) || text.includes('lab')) {
    suggestedPriority = 'high';
    urgencyReason = 'Multiple students or instructional facility impacted.';
  }

  const deptNames = {
    it_wifi: 'IT Services & Network Infrastructure',
    electrical: 'Electrical & Power Infrastructure',
    water_plumbing: 'Water & Plumbing Maintenance',
    washroom_cleanliness: 'Campus Sanitation & Hygiene',
    classroom_furniture: 'Estate & Classroom Infrastructure',
    laboratory: 'Laboratory Equipment & Tech Support',
    hostel: 'Hostel Administration & Facilities',
    campus_grounds: 'Civil Infrastructure & Grounds',
    security_safety: 'Campus Security & Safety',
    other: 'General Maintenance Pool'
  };

  const confidence = Math.min(0.96, Math.max(0.78, 0.70 + (maxScore * 0.05)));

  const reasons = [
    `Detected technical pattern matching ${deptNames[bestCat] || 'facilities'}.`,
    urgencyReason
  ];

  return {
    suggestedCategory: bestCat,
    suggestedPriority,
    suggestedDepartmentName: deptNames[bestCat] || 'Maintenance Department',
    suggestedDepartmentId: bestCat === 'it_wifi' ? 'it_services' : bestCat === 'electrical' ? 'electrical_maint' : 'facilities_estate',
    confidence,
    reasons,
    sentiment: suggestedPriority === 'urgent' ? 'negative' : 'neutral',
    urgencyReason
  };
};

/**
 * Client-Side Similar & Duplicate Complaint Detection Engine
 */
export const computeClientSimilarComplaints = (complaint, allComplaints = []) => {
  if (!complaint || !Array.isArray(allComplaints)) return [];

  const targetTitle = String(complaint.title || '').toLowerCase();
  const targetDesc = String(complaint.description || '').toLowerCase();
  const targetLoc = formatLocationString(complaint.location).toLowerCase();
  const targetCat = String(complaint.category || '').toLowerCase();

  const results = [];

  allComplaints.forEach(other => {
    if (!other || String(other.id) === String(complaint.id)) return;

    let score = 0;
    const reasons = [];

    // Category match
    const otherCat = String(other.category || '').toLowerCase();
    if (otherCat && otherCat === targetCat) {
      score += 0.3;
      reasons.push('Same category');
    }

    // Location match
    const otherLoc = formatLocationString(other.location).toLowerCase();
    if (targetLoc && otherLoc && targetLoc !== 'campus location' && otherLoc !== 'campus location') {
      if (targetLoc === otherLoc || targetLoc.includes(otherLoc) || otherLoc.includes(targetLoc)) {
        score += 0.4;
        reasons.push(`Same location (${formatLocationString(complaint.location)})`);
      }
    }

    // Text overlap
    const otherText = `${String(other.title || '')} ${String(other.description || '')}`.toLowerCase();
    const targetWords = `${targetTitle} ${targetDesc}`.split(/\W+/).filter(w => w.length > 3);
    let matchCount = 0;
    targetWords.forEach(w => {
      if (otherText.includes(w)) matchCount++;
    });

    if (targetWords.length > 0 && matchCount / targetWords.length > 0.25) {
      score += 0.35;
      reasons.push('Similar issue description');
    }

    if (score >= 0.35) {
      results.push({
        id: other.id,
        title: other.title || 'Untitled Complaint',
        location: formatLocationString(other.location),
        category: other.category || 'other',
        status: other.status || 'Submitted',
        similarityScore: Math.min(0.98, score),
        reason: reasons.join(' & ') || 'Shared context'
      });
    }
  });

  return results.sort((a, b) => b.similarityScore - a.similarityScore);
};

