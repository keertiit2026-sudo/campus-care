import { db } from '../db/storage.js';

export const getAnalytics = (req, res) => {
  try {
    const complaints = db.getComplaints();
    const total = complaints.length;

    const submitted = complaints.filter(c => c.status === 'Submitted').length;
    const underReview = complaints.filter(c => c.status === 'Under Review').length;
    const assigned = complaints.filter(c => c.status === 'Assigned').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const closed = complaints.filter(c => c.status === 'Closed').length;

    const resolutionRate = total > 0 ? Math.round(((resolved + closed) / total) * 100) : 100;
    const activeBacklog = total - resolved - closed;

    const rated = complaints.filter(c => c.rating);
    const avgRating = rated.length > 0
      ? (rated.reduce((acc, c) => acc + c.rating, 0) / rated.length).toFixed(1)
      : '5.0';

    res.json({
      stats: {
        total,
        submitted,
        underReview,
        assigned,
        inProgress,
        resolved,
        closed,
        resolutionRate,
        activeBacklog,
        avgRating,
        ratedCount: rated.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute analytics.' });
  }
};
