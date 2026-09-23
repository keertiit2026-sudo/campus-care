import { db } from '../db/storage.js';
import { INTELLIGENCE_CONFIG } from '../config/intelligenceConfig.js';
import { normalizeLocation } from './similarityService.js';

/**
 * Extract matched building from location string or object
 */
export const identifyBuilding = (location) => {
  const norm = normalizeLocation(location);
  if (!norm) return null;

  for (const bld of INTELLIGENCE_CONFIG.CAMPUS_BUILDINGS) {
    if (norm.includes(bld.name.toLowerCase()) || norm.includes(bld.code.toLowerCase())) {
      return bld;
    }
  }

  // Fallback heuristic: check if any word matches common building terms
  if (norm.includes('turing')) return INTELLIGENCE_CONFIG.CAMPUS_BUILDINGS.find(b => b.id === 'bld_turing');
  if (norm.includes('science')) return INTELLIGENCE_CONFIG.CAMPUS_BUILDINGS.find(b => b.id === 'bld_science');
  if (norm.includes('library')) return INTELLIGENCE_CONFIG.CAMPUS_BUILDINGS.find(b => b.id === 'bld_library');
  if (norm.includes('gargi') || norm.includes('hostel')) return INTELLIGENCE_CONFIG.CAMPUS_BUILDINGS.find(b => b.id === 'bld_hostel_gargi');
  if (norm.includes('sac') || norm.includes('canteen') || norm.includes('cafeteria')) return INTELLIGENCE_CONFIG.CAMPUS_BUILDINGS.find(b => b.id === 'bld_sac');
  if (norm.includes('admin')) return INTELLIGENCE_CONFIG.CAMPUS_BUILDINGS.find(b => b.id === 'bld_admin');
  if (norm.includes('workshop') || norm.includes('engineering')) return INTELLIGENCE_CONFIG.CAMPUS_BUILDINGS.find(b => b.id === 'bld_engineering');
  if (norm.includes('transport') || norm.includes('bus') || norm.includes('gate 3')) return INTELLIGENCE_CONFIG.CAMPUS_BUILDINGS.find(b => b.id === 'bld_transport');

  return null;
};

/**
 * Extract room or specific zone from location string
 */
export const extractZone = (location) => {
  if (!location) return 'General Facility';
  if (typeof location === 'object') {
    if (location.room) return location.room;
    if (location.floor) return `${location.floor} Floor`;
    if (location.landmark) return location.landmark;
  }
  const str = String(location);
  // Match patterns like "Lab 304", "LH-201", "Room 102", "Wing B", etc.
  const match = str.match(/(?:lab|lh|hall|room|wing|floor|suite|bay|depot|yard|zone)\s*[-:]?\s*([a-z0-9-]+(?:\s+[a-z0-9-]+)?)/i);
  if (match) {
    return match[0].trim();
  }
  return str.split(',')[0].trim() || 'General Area';
};

/**
 * Detect recurring issue clusters across campus
 */
export const detectRecurringProblems = (options = {}) => {
  const windowDays = options.windowDays || INTELLIGENCE_CONFIG.RECURRING_PERIOD_DAYS;
  const minThreshold = options.minThreshold || INTELLIGENCE_CONFIG.RECURRING_COMPLAINT_THRESHOLD;

  const allComplaints = db.getComplaints();
  const now = new Date();

  // Filter complaints in window
  const windowComplaints = allComplaints.filter(c => {
    if (!c.createdAt) return true;
    const date = new Date(c.createdAt);
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);
    return diffDays <= windowDays;
  });

  // Group by (Building + Zone + Category) and (Building + Category)
  const clusters = {};

  windowComplaints.forEach(c => {
    const building = identifyBuilding(c.location);
    const buildingName = building ? building.name : (c.location ? String(c.location).split(',')[0] : 'Campus Wide');
    const zone = extractZone(c.location);
    const category = c.category || 'general';

    const clusterKey = `${buildingName}:::${zone}:::${category}`;

    if (!clusters[clusterKey]) {
      clusters[clusterKey] = {
        key: clusterKey,
        buildingId: building ? building.id : null,
        buildingName,
        zone,
        category,
        complaints: [],
        openCount: 0,
        resolvedCount: 0,
        inProgressCount: 0
      };
    }

    clusters[clusterKey].complaints.push(c);
    if (c.status === 'resolved' || c.status === 'closed') {
      clusters[clusterKey].resolvedCount++;
    } else if (c.status === 'in_progress' || c.status === 'assigned') {
      clusters[clusterKey].inProgressCount++;
    } else {
      clusters[clusterKey].openCount++;
    }
  });

  // Filter clusters that meet minimum repeat threshold
  const recurringPatterns = Object.values(clusters)
    .filter(cl => cl.complaints.length >= minThreshold)
    .map(cl => {
      const count = cl.complaints.length;
      let severity = 'warning';
      if (count >= 4 || cl.openCount >= 3) {
        severity = 'critical';
      }

      const categoryLabel = cl.category.replace('_', ' ').toUpperCase();
      const reasons = [
        `${count} incidents of ${categoryLabel} reported at ${cl.buildingName} (${cl.zone}) in the last ${windowDays} days.`,
        `${cl.openCount} tickets are currently pending resolution.`
      ];

      return {
        id: `rec_${cl.key.replace(/[^a-z0-9]/gi, '_')}`,
        buildingId: cl.buildingId,
        buildingName: cl.buildingName,
        zone: cl.zone,
        category: cl.category,
        totalComplaints: count,
        openComplaints: cl.openCount,
        inProgressComplaints: cl.inProgressCount,
        resolvedComplaints: cl.resolvedCount,
        severity,
        reasons,
        complaintIds: cl.complaints.map(c => c.id),
        latestReportedAt: cl.complaints[0]?.createdAt || now.toISOString()
      };
    })
    .sort((a, b) => b.totalComplaints - a.totalComplaints);

  return recurringPatterns;
};

/**
 * Generate comprehensive Building-Level intelligence & Heatmap aggregations
 */
export const getCampusHeatmapData = (filters = {}) => {
  const { category, priority, timeRange } = filters;
  const allComplaints = db.getComplaints();
  const now = new Date();

  // Filter by time window if specified (7d, 30d, 90d, all)
  let windowDays = 30;
  if (timeRange === '7d') windowDays = 7;
  else if (timeRange === '90d') windowDays = 90;
  else if (timeRange === 'all') windowDays = 3650;

  const filteredComplaints = allComplaints.filter(c => {
    if (category && category !== 'all' && c.category !== category) return false;
    if (priority && priority !== 'all' && c.priority !== priority) return false;

    if (c.createdAt && timeRange !== 'all') {
      const date = new Date(c.createdAt);
      const diffDays = (now - date) / (1000 * 60 * 60 * 24);
      if (diffDays > windowDays) return false;
    }
    return true;
  });

  const buildingsMap = {};

  // Initialize presets
  INTELLIGENCE_CONFIG.CAMPUS_BUILDINGS.forEach(bld => {
    buildingsMap[bld.id] = {
      ...bld,
      totalCount: 0,
      activeCount: 0,
      urgentCount: 0,
      resolvedCount: 0,
      categories: {},
      zones: {},
      complaints: [],
      density: 'low' // low | medium | high
    };
  });

  // Aggregate complaints into buildings
  filteredComplaints.forEach(comp => {
    const identified = identifyBuilding(comp.location);
    const bldId = identified ? identified.id : 'bld_turing'; // map unknown to primary if needed or default

    if (buildingsMap[bldId]) {
      const target = buildingsMap[bldId];
      target.totalCount++;
      target.complaints.push(comp);

      if (comp.status !== 'resolved' && comp.status !== 'closed') {
        target.activeCount++;
      } else {
        target.resolvedCount++;
      }

      if (comp.priority === 'urgent') {
        target.urgentCount++;
      }

      // Categories
      const cat = comp.category || 'other';
      target.categories[cat] = (target.categories[cat] || 0) + 1;

      // Zones
      const zone = extractZone(comp.location);
      target.zones[zone] = (target.zones[zone] || 0) + 1;
    }
  });

  // Calculate density & summary metrics for each building
  const buildingNodes = Object.values(buildingsMap).map(b => {
    let density = 'low';
    if (b.activeCount >= INTELLIGENCE_CONFIG.HIGH_DENSITY_THRESHOLD || b.urgentCount >= 2) {
      density = 'high';
    } else if (b.activeCount >= INTELLIGENCE_CONFIG.MEDIUM_DENSITY_THRESHOLD) {
      density = 'medium';
    }

    // Top affected zone
    const sortedZones = Object.entries(b.zones).sort((x, y) => y[1] - x[1]);
    const topZone = sortedZones.length > 0 ? sortedZones[0][0] : 'None';

    // Top category
    const sortedCats = Object.entries(b.categories).sort((x, y) => y[1] - x[1]);
    const topCategory = sortedCats.length > 0 ? sortedCats[0][0] : 'None';

    return {
      ...b,
      density,
      topZone,
      topCategory,
      complaints: b.complaints.slice(0, 10) // provide top 10 previews
    };
  });

  // Global KPIs
  const totalComplaints = filteredComplaints.length;
  const activeComplaints = filteredComplaints.filter(c => c.status !== 'resolved' && c.status !== 'closed').length;
  const criticalHotspots = buildingNodes.filter(b => b.density === 'high').length;
  const recurringIssues = detectRecurringProblems({ windowDays }).length;

  return {
    kpis: {
      totalComplaints,
      activeComplaints,
      criticalHotspots,
      recurringIssues,
      healthyZones: buildingNodes.filter(b => b.density === 'low').length
    },
    buildings: buildingNodes,
    recurringIssuesList: detectRecurringProblems({ windowDays }).slice(0, 8),
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Get detailed deep-dive intelligence for a single building
 */
export const getBuildingDeepDive = (buildingIdOrName) => {
  const heatmap = getCampusHeatmapData({ timeRange: 'all' });
  const normalizedSearch = String(buildingIdOrName).toLowerCase();

  const building = heatmap.buildings.find(b =>
    b.id.toLowerCase() === normalizedSearch ||
    b.name.toLowerCase().includes(normalizedSearch) ||
    b.code.toLowerCase() === normalizedSearch
  );

  if (!building) {
    return null;
  }

  // Get recurring patterns specific to this building
  const recurringInBuilding = heatmap.recurringIssuesList.filter(r =>
    r.buildingId === building.id || r.buildingName.toLowerCase() === building.name.toLowerCase()
  );

  // Resolution speed / SLA pace simulation from timestamps
  let totalHours = 0;
  let resolvedWithTimeCount = 0;

  building.complaints.forEach(c => {
    if (c.status === 'resolved' && c.resolvedAt && c.createdAt) {
      const hours = (new Date(c.resolvedAt) - new Date(c.createdAt)) / (1000 * 60 * 60);
      if (hours > 0) {
        totalHours += hours;
        resolvedWithTimeCount++;
      }
    }
  });

  const avgResolutionHours = resolvedWithTimeCount > 0 ? Number((totalHours / resolvedWithTimeCount).toFixed(1)) : 18.5;

  return {
    building,
    recurringPatterns: recurringInBuilding,
    slaPaceHours: avgResolutionHours,
    slaTargetHours: 24,
    slaComplianceRate: avgResolutionHours <= 24 ? 94 : 78
  };
};
