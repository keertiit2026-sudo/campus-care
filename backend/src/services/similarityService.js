import { db } from '../db/storage.js';
import { INTELLIGENCE_CONFIG } from '../config/intelligenceConfig.js';

const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d',
  'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves', 'please', 'sir', 'madam', 'issue', 'problem'
]);

/**
 * Tokenize and normalize text into meaningful keywords
 */
export const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
};

/**
 * Calculate Jaccard similarity between two token arrays
 */
export const calculateJaccardSimilarity = (tokensA, tokensB) => {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersection = 0;
  setA.forEach(item => {
    if (setB.has(item)) intersection++;
  });

  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
};

/**
 * Normalize location string to aid building/room matching
 */
export const normalizeLocation = (loc) => {
  if (!loc) return '';
  if (typeof loc === 'string') return loc.toLowerCase();
  if (typeof loc === 'object') {
    return `${loc.building || ''} ${loc.floor || ''} ${loc.room || ''} ${loc.landmark || ''}`.toLowerCase();
  }
  return '';
};

/**
 * Compute similarity score between two complaints
 */
export const compareComplaints = (target, candidate) => {
  const targetTokens = tokenize(`${target.title || ''} ${target.description || ''}`);
  const candidateTokens = tokenize(`${candidate.title || ''} ${candidate.description || ''}`);

  // 1. Text similarity (Jaccard)
  const textSim = calculateJaccardSimilarity(targetTokens, candidateTokens);

  // 2. Category match
  const categoryMatch = target.category && candidate.category && (target.category === candidate.category);
  const categoryScore = categoryMatch ? 1.0 : 0.0;

  // 3. Location match
  const targetLoc = normalizeLocation(target.location);
  const candidateLoc = normalizeLocation(candidate.location);
  let locationScore = 0.0;
  let sameBuilding = false;
  let sameRoom = false;

  if (targetLoc && candidateLoc) {
    const locTokensA = tokenize(targetLoc);
    const locTokensB = tokenize(candidateLoc);
    const locSim = calculateJaccardSimilarity(locTokensA, locTokensB);
    locationScore = locSim;

    // Check specific building tokens
    INTELLIGENCE_CONFIG.CAMPUS_BUILDINGS.forEach(bld => {
      const bName = bld.name.toLowerCase();
      if (targetLoc.includes(bName) && candidateLoc.includes(bName)) {
        sameBuilding = true;
        locationScore = Math.max(locationScore, 0.8);
      }
    });

    if (targetLoc === candidateLoc) {
      sameBuilding = true;
      sameRoom = true;
      locationScore = 1.0;
    }
  }

  // Weighted overall score: 45% Text, 35% Location, 20% Category
  const score = (textSim * 0.45) + (locationScore * 0.35) + (categoryScore * 0.20);

  // Shared keywords
  const sharedTokens = targetTokens.filter(t => candidateTokens.includes(t));

  const reasons = [];
  if (sameRoom) {
    reasons.push('Exact room / location match');
  } else if (sameBuilding) {
    reasons.push('Located in the same building');
  } else if (locationScore > 0.4) {
    reasons.push('High location overlap');
  }

  if (categoryMatch) {
    reasons.push(`Same issue category (${target.category})`);
  }

  if (textSim >= 0.3) {
    reasons.push(`High textual similarity (${Math.round(textSim * 100)}% match)`);
  }

  if (sharedTokens.length > 0) {
    const preview = [...new Set(sharedTokens)].slice(0, 4).join(', ');
    reasons.push(`Common keywords: "${preview}"`);
  }

  return {
    score: Number(score.toFixed(3)),
    textSim: Number(textSim.toFixed(3)),
    locationScore: Number(locationScore.toFixed(3)),
    categoryMatch,
    sameBuilding,
    sameRoom,
    sharedTokens: [...new Set(sharedTokens)],
    reasons
  };
};

/**
 * Find similar and duplicate complaints in the system
 */
export const findSimilarComplaints = (targetComplaint, options = {}) => {
  const threshold = options.threshold || INTELLIGENCE_CONFIG.SIMILARITY_THRESHOLD;
  const limit = options.limit || 5;
  const windowDays = options.windowDays || INTELLIGENCE_CONFIG.SIMILARITY_TIME_WINDOW_DAYS;

  const allComplaints = db.getComplaints();
  const now = new Date();

  const results = [];

  for (const comp of allComplaints) {
    // Exclude exact same complaint ID
    if (targetComplaint.id && comp.id === targetComplaint.id) continue;

    // Filter by time window if date is present
    if (comp.createdAt) {
      const compDate = new Date(comp.createdAt);
      const diffDays = (now - compDate) / (1000 * 60 * 60 * 24);
      if (diffDays > windowDays) continue;
    }

    const comparison = compareComplaints(targetComplaint, comp);

    if (comparison.score >= threshold) {
      results.push({
        complaint: comp,
        score: comparison.score,
        matchPercentage: Math.round(comparison.score * 100),
        textSim: comparison.textSim,
        locationScore: comparison.locationScore,
        categoryMatch: comparison.categoryMatch,
        sameBuilding: comparison.sameBuilding,
        sameRoom: comparison.sameRoom,
        sharedTokens: comparison.sharedTokens,
        reasons: comparison.reasons
      });
    }
  }

  // Sort by highest score first
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
};
