const rawBaseUrl = import.meta.env.VITE_API_URL || 'https://campus-care-backend-6acz.onrender.com/api';
const API_BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

// Check if running in an HTTPS production environment where http://localhost is unreachable
const isHttpsProd = typeof window !== 'undefined' && window.location.protocol === 'https:' && API_BASE_URL.startsWith('http://localhost');

async function safeFetch(url, options = {}, timeoutMs = 8000) {
  if (isHttpsProd && url.startsWith('http://localhost')) {
    throw new Error('Localhost API server is not reachable over HTTPS in cloud deployment.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('campuscare_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // --- Auth API ---
  async register(data) {
    const res = await safeFetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed');
    return json;
  },

  async login(identifier, password) {
    const res = await safeFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, email: identifier, password })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json;
  },

  async getMe() {
    const res = await safeFetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch session profile');
    return json;
  },

  async updateProfile(data) {
    const res = await safeFetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update profile');
    return json;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await safeFetch(`${API_BASE_URL}/auth/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to change password');
    return json;
  },

  async getStudents() {
    try {
      const res = await safeFetch(`${API_BASE_URL}/admin/students`, {
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (res.ok) return json;
    } catch (e) {}

    const res = await safeFetch(`${API_BASE_URL}/students`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch registered students');
    return json;
  },

  async getAdminStudents() {
    return this.getStudents();
  },

  // --- Complaints API ---
  async getComplaints(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await safeFetch(`${API_BASE_URL}/complaints?${query}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch complaints');
    return json.complaints || [];
  },

  async createComplaint(data) {
    const res = await safeFetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to submit complaint');
    return json.complaint;
  },

  async getComplaintById(id) {
    const res = await safeFetch(`${API_BASE_URL}/complaints/${id}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch complaint');
    return json.complaint;
  },

  async triageComplaint(id, data) {
    const res = await safeFetch(`${API_BASE_URL}/complaints/${id}/triage`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update complaint triage');
    return json.complaint;
  },

  async addComment(id, message, isInternal = false) {
    const res = await safeFetch(`${API_BASE_URL}/complaints/${id}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, isInternal })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to post comment');
    return json.complaint;
  },

  async submitRating(id, rating, feedback) {
    const res = await safeFetch(`${API_BASE_URL}/complaints/${id}/rating`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, feedback })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to submit rating');
    return json.complaint;
  },

  // --- Departments & Staff ---
  async getDepartments() {
    const res = await safeFetch(`${API_BASE_URL}/departments`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch departments');
    return json.departments || [];
  },

  async updateDepartment(id, data) {
    const res = await safeFetch(`${API_BASE_URL}/departments/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update department');
    return json.department;
  },

  async getStaff(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await safeFetch(`${API_BASE_URL}/staff?${query}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch staff');
    return json.staff || [];
  },

  async getStaffById(id) {
    const res = await safeFetch(`${API_BASE_URL}/staff/${id}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch staff member');
    return json.staff;
  },

  async getStaffOpenTickets(id) {
    const res = await safeFetch(`${API_BASE_URL}/staff/${id}/open-tickets`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch staff open tickets');
    return json;
  },

  async createStaff(data) {
    const res = await safeFetch(`${API_BASE_URL}/staff`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add staff member');
    return json.staff;
  },

  async updateStaff(id, data) {
    const res = await safeFetch(`${API_BASE_URL}/staff/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update staff member');
    return json.staff;
  },

  async replaceAndTransferStaff(data) {
    const res = await safeFetch(`${API_BASE_URL}/staff/replace`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to replace staff and transfer tickets');
    return json;
  },

  async replaceStaff(data) {
    return this.replaceAndTransferStaff(data);
  },

  async deactivateStaff(id, options = {}) {
    const res = await safeFetch(`${API_BASE_URL}/staff/${id}/deactivate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(options)
    });
    const json = await res.json();
    if (!res.ok) {
      const err = new Error(json.error || 'Failed to deactivate staff member');
      err.openCount = json.openCount;
      err.openTickets = json.openTickets;
      throw err;
    }
    return json;
  },

  async reactivateStaff(id) {
    const res = await safeFetch(`${API_BASE_URL}/staff/${id}/reactivate`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to reactivate staff member');
    return json;
  },

  async deleteStaff(id, transferToStaffId = null) {
    const query = transferToStaffId ? `?transferToStaffId=${transferToStaffId}` : '';
    const res = await safeFetch(`${API_BASE_URL}/staff/${id}${query}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to remove staff member');
    return json;
  },

  // --- Analytics ---
  async getAnalytics() {
    const res = await safeFetch(`${API_BASE_URL}/analytics`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch analytics');
    return json.stats;
  },

  // --- CampusCare Intelligence API ---
  async getIntelligenceSummary(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await safeFetch(`${API_BASE_URL}/intelligence/summary?${query}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch intelligence summary');
    return json;
  },

  async getHeatmapData(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await safeFetch(`${API_BASE_URL}/intelligence/heatmap?${query}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch heatmap data');
    return json;
  },

  async getIntelligenceAlerts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await safeFetch(`${API_BASE_URL}/intelligence/alerts?${query}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch intelligence alerts');
    return json.alerts || json.data || [];
  },

  async getRecurringProblems(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await safeFetch(`${API_BASE_URL}/intelligence/recurring-problems?${query}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch recurring problems');
    return json.recurringProblems || json.data || json.recurring || [];
  },

  async getSimilarComplaints(id) {
    const res = await safeFetch(`${API_BASE_URL}/intelligence/similar/${id}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch similar complaints');
    return json;
  },

  async analyzeComplaintDraft(data) {
    const res = await safeFetch(`${API_BASE_URL}/intelligence/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to run complaint analysis');
    return json.intelligence;
  },

  async getBuildingIntelligence(buildingIdOrName) {
    const res = await safeFetch(`${API_BASE_URL}/intelligence/building/${encodeURIComponent(buildingIdOrName)}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch building intelligence');
    return json;
  },

  async linkComplaints(primaryId, linkedIds, note = '') {
    const res = await safeFetch(`${API_BASE_URL}/intelligence/link-complaints`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ primaryId, linkedIds, note })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to link complaints');
    return json;
  }
};

