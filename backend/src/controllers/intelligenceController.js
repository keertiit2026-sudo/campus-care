import { db } from '../db/storage.js';
import { analyzeComplaint } from '../services/complaintIntelligenceService.js';
import { findSimilarComplaints } from '../services/similarityService.js';
import {
  detectRecurringProblems,
  getCampusHeatmapData,
  getBuildingDeepDive
} from '../services/recurringProblemService.js';

/**
 * GET /api/intelligence/summary
 * Returns executive metrics, hotspot count, recurring issue count, and system status
 */
export const getIntelligenceSummary = async (req, res) => {
  try {
    const heatmap = getCampusHeatmapData({ timeRange: '30d' });
    const recurring = detectRecurringProblems({ windowDays: 30 });
    const complaints = db.getComplaints();

    // Urgent tickets pending
    const urgentPending = complaints.filter(c => c.priority === 'urgent' && c.status !== 'resolved' && c.status !== 'closed');
    const delayedTickets = complaints.filter(c => {
      if (c.status === 'resolved' || c.status === 'closed') return false;
      const hours = (new Date() - new Date(c.createdAt)) / (1000 * 60 * 60);
      return hours > 24;
    });

    res.json({
      success: true,
      data: {
        kpis: {
          totalComplaints: heatmap.kpis.totalComplaints,
          activeComplaints: heatmap.kpis.activeComplaints,
          criticalHotspots: heatmap.kpis.criticalHotspots,
          recurringPatterns: recurring.length,
          urgentPendingCount: urgentPending.length,
          delayedTicketsCount: delayedTickets.length,
          healthyZonesCount: heatmap.kpis.healthyZones
        },
        topHotspots: heatmap.buildings
          .filter(b => b.totalCount > 0)
          .sort((a, b) => b.activeCount - a.activeCount)
          .slice(0, 4),
        recentRecurring: recurring.slice(0, 5),
        engineStatus: {
          nlpClassifier: 'Active',
          similarityDetector: 'Active',
          recurringAggregator: 'Active',
          lastRun: new Date().toISOString()
        }
      }
    });
  } catch (err) {
    console.error('getIntelligenceSummary error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve intelligence summary' });
  }
};

/**
 * GET /api/intelligence/heatmap
 * Returns building nodes, coordinates, densities, and category breakdown
 */
export const getHeatmap = async (req, res) => {
  try {
    const { category, priority, timeRange } = req.query;
    const heatmapData = getCampusHeatmapData({ category, priority, timeRange });
    res.json({
      success: true,
      data: heatmapData
    });
  } catch (err) {
    console.error('getHeatmap error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve heatmap data' });
  }
};

/**
 * GET /api/intelligence/alerts
 * Returns intelligence alerts stream for admin dashboard
 */
export const getIntelligenceAlerts = async (req, res) => {
  try {
    const alerts = [];
    const complaints = db.getComplaints();
    const recurring = detectRecurringProblems({ windowDays: 30 });
    const heatmap = getCampusHeatmapData({ timeRange: '30d' });

    // 1. Critical Recurring Patterns Alerts
    recurring.filter(r => r.severity === 'critical').forEach(r => {
      alerts.push({
        id: `alert_${r.id}`,
        type: 'recurring_problem',
        severity: 'critical',
        title: `Recurring Spike: ${r.category.toUpperCase()} at ${r.buildingName}`,
        message: `${r.totalComplaints} tickets reported in ${r.zone} within last 30 days. ${r.openComplaints} open.`,
        buildingName: r.buildingName,
        category: r.category,
        timestamp: r.latestReportedAt,
        actionUrl: `/intelligence?building=${encodeURIComponent(r.buildingName)}`
      });
    });

    // 2. High Density Building Hotspots
    heatmap.buildings.filter(b => b.density === 'high').forEach(b => {
      alerts.push({
        id: `alert_density_${b.id}`,
        type: 'hotspot_density',
        severity: 'warning',
        title: `High Density Zone: ${b.name}`,
        message: `${b.activeCount} active complaints concentrated in ${b.name}. Top category: ${b.topCategory}.`,
        buildingName: b.name,
        category: b.topCategory,
        timestamp: new Date().toISOString(),
        actionUrl: `/intelligence?building=${encodeURIComponent(b.name)}`
      });
    });

    // 3. Urgent / Safety Hazard Alerts
    complaints.filter(c => c.priority === 'urgent' && c.status !== 'resolved' && c.status !== 'closed').slice(0, 5).forEach(c => {
      alerts.push({
        id: `alert_urgent_${c.id}`,
        type: 'urgent_hazard',
        severity: 'urgent',
        title: `High Urgency: ${c.title}`,
        message: `Safety/Disruption trigger reported at ${c.location || 'Campus'}. Immediate triage required.`,
        complaintId: c.id,
        timestamp: c.createdAt,
        actionUrl: `/admin/triage/${c.id}`
      });
    });

    res.json({
      success: true,
      data: {
        alerts,
        total: alerts.length
      }
    });
  } catch (err) {
    console.error('getIntelligenceAlerts error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve intelligence alerts' });
  }
};

/**
 * GET /api/intelligence/similar/:id
 * Find similar and duplicate complaints for a specific complaint ID
 */
export const getSimilarForComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = db.findComplaintById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const similar = findSimilarComplaints(complaint, { limit: 5 });
    res.json({
      success: true,
      data: {
        targetComplaintId: id,
        similarComplaints: similar,
        hasPotentialDuplicates: similar.length > 0 && similar[0].score >= 0.50
      }
    });
  } catch (err) {
    console.error('getSimilarForComplaint error:', err);
    res.status(500).json({ success: false, message: 'Failed to find similar complaints' });
  }
};

/**
 * POST /api/intelligence/analyze
 * Direct API to analyze a draft or payload
 */
export const analyzeComplaintPayload = async (req, res) => {
  try {
    const payload = req.body;
    const analysis = analyzeComplaint(payload);
    const similar = findSimilarComplaints(payload, { limit: 3 });

    res.json({
      success: true,
      data: {
        analysis,
        similarComplaints: similar
      }
    });
  } catch (err) {
    console.error('analyzeComplaintPayload error:', err);
    res.status(500).json({ success: false, message: 'Failed to analyze complaint' });
  }
};

/**
 * GET /api/intelligence/building/:idOrName
 * Get deep dive analytics for a building drawer
 */
export const getBuildingAnalysis = async (req, res) => {
  try {
    const { idOrName } = req.params;
    const deepDive = getBuildingDeepDive(idOrName);

    if (!deepDive) {
      return res.status(404).json({ success: false, message: 'Building landmark not found' });
    }

    res.json({
      success: true,
      data: deepDive
    });
  } catch (err) {
    console.error('getBuildingAnalysis error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve building deep dive' });
  }
};

/**
 * POST /api/intelligence/link-complaints
 * Link two or more complaints together as duplicates or related issues
 */
export const linkComplaints = async (req, res) => {
  try {
    const { primaryComplaintId, linkedComplaintId, linkType = 'duplicate' } = req.body;

    if (!primaryComplaintId || !linkedComplaintId) {
      return res.status(400).json({ success: false, message: 'Both primaryComplaintId and linkedComplaintId are required' });
    }

    const primary = db.findComplaintById(primaryComplaintId);
    const linked = db.findComplaintById(linkedComplaintId);

    if (!primary || !linked) {
      return res.status(404).json({ success: false, message: 'One or both complaints not found' });
    }

    // Update primary
    const primaryLinked = primary.linkedComplaintIds || [];
    if (!primaryLinked.includes(linkedComplaintId)) {
      primaryLinked.push(linkedComplaintId);
      db.updateComplaint(primaryComplaintId, {
        linkedComplaintIds: primaryLinked,
        hasLinkedTickets: true
      });
    }

    // Update secondary with master reference
    db.updateComplaint(linkedComplaintId, {
      duplicateOf: primaryComplaintId,
      linkType
    });

    res.json({
      success: true,
      message: `Ticket #${linkedComplaintId} successfully linked to #${primaryComplaintId}`,
      data: {
        primaryComplaint: db.findComplaintById(primaryComplaintId),
        linkedComplaint: db.findComplaintById(linkedComplaintId)
      }
    });
  } catch (err) {
    console.error('linkComplaints error:', err);
    res.status(500).json({ success: false, message: 'Failed to link complaints' });
  }
};
