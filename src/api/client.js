const rawBaseUrl = import.meta.env.VITE_API_URL || 'https://campus-care-backend-2026.onrender.com/api';
const API_BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

// Check if running in an HTTPS production environment where http://localhost is unreachable
const isHttpsProd = typeof window !== 'undefined' && window.location.protocol === 'https:' && API_BASE_URL.startsWith('http://localhost');

async function safeFetch(url, options = {}, timeoutMs = 60000) {
  if (isHttpsProd && url.startsWith('http://localhost')) {
    throw new Error('Localhost API server is not reachable over HTTPS in cloud deployment. Please configure VITE_API_URL in your hosting platform.');
  }

  const controller = new AbortController();
  let isTimeout = false;

  const timeoutId = setTimeout(() => {
    isTimeout = true;
    try {
      controller.abort(new DOMException('Request timed out', 'TimeoutError'));
    } catch (_) {
      try {
        controller.abort();
      } catch (__) {}
    }
  }, timeoutMs);

  // Link caller signal if provided (preserves caller cancellation)
  let onCallerAbort = null;
  if (options.signal) {
    if (options.signal.aborted) {
      clearTimeout(timeoutId);
      try {
        controller.abort(options.signal.reason);
      } catch (_) {
        controller.abort();
      }
    } else {
      onCallerAbort = () => {
        try {
          controller.abort(options.signal.reason);
        } catch (_) {
          controller.abort();
        }
      };
      options.signal.addEventListener('abort', onCallerAbort, { once: true });
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (options.signal && onCallerAbort) {
      options.signal.removeEventListener('abort', onCallerAbort);
    }
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    if (options.signal && onCallerAbort) {
      options.signal.removeEventListener('abort', onCallerAbort);
    }

    // If caller explicitly cancelled the request, propagate that cancellation
    if (options.signal?.aborted) {
      throw err;
    }

    // Provide friendly, descriptive messages for abort/timeout or network disconnection
    const isAbortOrTimeout = 
      isTimeout ||
      err.name === 'AbortError' || 
      err.name === 'TimeoutError' || 
      (typeof err.message === 'string' && /abort|timeout|signal is aborted/i.test(err.message));

    if (isAbortOrTimeout) {
      throw new Error(
        'Server took too long to respond. The cloud backend is likely waking up from sleep (Render free tier cold start takes ~30 seconds). Please wait a moment and try again.'
      );
    }

    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error(
        'Unable to reach the CampusCare server. Please check your internet connection or verify the backend is online.'
      );
    }

    throw err;
  }
}

async function parseJsonResponse(res, defaultError = 'Request failed') {
  let json;
  try {
    json = await res.json();
  } catch {
    if (!res.ok) {
      throw new Error(`Server returned error ${res.status}: ${res.statusText || 'Unable to process request'}`);
    }
    throw new Error('Invalid response received from server.');
  }

  if (!res.ok) {
    const err = new Error(json?.error || json?.message || defaultError);
    if (json?.openCount !== undefined) err.openCount = json.openCount;
    if (json?.openTickets !== undefined) err.openTickets = json.openTickets;
    throw err;
  }

  return json;
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
    return parseJsonResponse(res, 'Registration failed');
  },

  async login(identifier, password) {
    const res = await safeFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, email: identifier, password })
    });
    return parseJsonResponse(res, 'Login failed');
  },

  async getMe() {
    const res = await safeFetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return parseJsonResponse(res, 'Failed to fetch session profile');
  },

  async updateProfile(data) {
    const res = await safeFetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return parseJsonResponse(res, 'Failed to update profile');
  },

  async changePassword(currentPassword, newPassword) {
    const res = await safeFetch(`${API_BASE_URL}/auth/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return parseJsonResponse(res, 'Failed to change password');
  },

  async getStudents() {
    try {
      const res = await safeFetch(`${API_BASE_URL}/admin/students`, {
        headers: getAuthHeaders()
      });
      const json = await parseJsonResponse(res, 'Failed to fetch registered students');
      return json;
    } catch (e) {
      // Fallback to /students endpoint
    }

    const res = await safeFetch(`${API_BASE_URL}/students`, {
      headers: getAuthHeaders()
    });
    return parseJsonResponse(res, 'Failed to fetch registered students');
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
    const json = await parseJsonResponse(res, 'Failed to fetch complaints');
    return json.complaints || [];
  },

  async createComplaint(data) {
    const res = await safeFetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await parseJsonResponse(res, 'Failed to submit complaint');
    return json.complaint;
  },

  async getComplaintById(id) {
    const res = await safeFetch(`${API_BASE_URL}/complaints/${id}`, {
      headers: getAuthHeaders()
    });
    const json = await parseJsonResponse(res, 'Failed to fetch complaint');
    return json.complaint;
  },

  async triageComplaint(id, data) {
    const res = await safeFetch(`${API_BASE_URL}/complaints/${id}/triage`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await parseJsonResponse(res, 'Failed to update complaint triage');
    return json.complaint;
  },

  async addComment(id, message, isInternal = false) {
    const res = await safeFetch(`${API_BASE_URL}/complaints/${id}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, isInternal })
    });
    const json = await parseJsonResponse(res, 'Failed to post comment');
    return json.complaint;
  },

  async submitRating(id, rating, feedback) {
    const res = await safeFetch(`${API_BASE_URL}/complaints/${id}/rating`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, feedback })
    });
    const json = await parseJsonResponse(res, 'Failed to submit rating');
    return json.complaint;
  },

  // --- Departments & Staff ---
  async getDepartments() {
    const res = await safeFetch(`${API_BASE_URL}/departments`, {
      headers: getAuthHeaders()
    });
    const json = await parseJsonResponse(res, 'Failed to fetch departments');
    return json.departments || [];
  },

  async updateDepartment(id, data) {
    const res = await safeFetch(`${API_BASE_URL}/departments/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await parseJsonResponse(res, 'Failed to update department');
    return json.department;
  },

  async getStaff(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await safeFetch(`${API_BASE_URL}/staff?${query}`, {
      headers: getAuthHeaders()
    });
    const json = await parseJsonResponse(res, 'Failed to fetch staff');
    return json.staff || [];
  },

  async getStaffById(id) {
    const res = await safeFetch(`${API_BASE_URL}/staff/${id}`, {
      headers: getAuthHeaders()
    });
    const json = await parseJsonResponse(res, 'Failed to fetch staff member');
    return json.staff;
  },

  async getStaffOpenTickets(id) {
    const res = await safeFetch(`${API_BASE_URL}/staff/${id}/open-tickets`, {
      headers: getAuthHeaders()
    });
    return parseJsonResponse(res, 'Failed to fetch staff open tickets');
  },

  async createStaff(data) {
    const res = await safeFetch(`${API_BASE_URL}/staff`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await parseJsonResponse(res, 'Failed to add staff member');
    return json.staff;
  },

  async updateStaff(id, data) {
    const res = await safeFetch(`${API_BASE_URL}/staff/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await parseJsonResponse(res, 'Failed to update staff member');
    return json.staff;
  },

  async replaceAndTransferStaff(data) {
    const res = await safeFetch(`${API_BASE_URL}/staff/replace`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return parseJsonResponse(res, 'Failed to replace staff and transfer tickets');
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
    return parseJsonResponse(res, 'Failed to deactivate staff member');
  },

  async reactivateStaff(id) {
    const res = await safeFetch(`${API_BASE_URL}/staff/${id}/reactivate`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return parseJsonResponse(res, 'Failed to reactivate staff member');
  },

  async deleteStaff(id, transferToStaffId = null) {
    const query = transferToStaffId ? `?transferToStaffId=${transferToStaffId}` : '';
    const res = await safeFetch(`${API_BASE_URL}/staff/${id}${query}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return parseJsonResponse(res, 'Failed to remove staff member');
  },

  // --- Analytics ---
  async getAnalytics() {
    const res = await safeFetch(`${API_BASE_URL}/analytics`, {
      headers: getAuthHeaders()
    });
    const json = await parseJsonResponse(res, 'Failed to fetch analytics');
    return json.stats;
  },

  // --- CampusCare Intelligence API ---
  async getIntelligenceSummary(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await safeFetch(`${API_BASE_URL}/intelligence/summary?${query}`, {
      headers: getAuthHeaders()
    });
    return parseJsonResponse(res, 'Failed to fetch intelligence summary');
  },

  async getHeatmapData(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await safeFetch(`${API_BASE_URL}/intelligence/heatmap?${query}`, {
      headers: getAuthHeaders()
    });
    return parseJsonResponse(res, 'Failed to fetch heatmap data');
  },

  async getIntelligenceAlerts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await safeFetch(`${API_BASE_URL}/intelligence/alerts?${query}`, {
      headers: getAuthHeaders()
    });
    const json = await parseJsonResponse(res, 'Failed to fetch intelligence alerts');
    return json.alerts || json.data || [];
  },

  async getRecurringProblems(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await safeFetch(`${API_BASE_URL}/intelligence/recurring-problems?${query}`, {
      headers: getAuthHeaders()
    });
    const json = await parseJsonResponse(res, 'Failed to fetch recurring problems');
    return json.recurringProblems || json.data || json.recurring || [];
  },

  async getSimilarComplaints(id) {
    const res = await safeFetch(`${API_BASE_URL}/intelligence/similar/${id}`, {
      headers: getAuthHeaders()
    });
    return parseJsonResponse(res, 'Failed to fetch similar complaints');
  },

  async analyzeComplaintDraft(data) {
    const res = await safeFetch(`${API_BASE_URL}/intelligence/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await parseJsonResponse(res, 'Failed to run complaint analysis');
    return json.intelligence;
  },

  async getBuildingIntelligence(buildingIdOrName) {
    const res = await safeFetch(`${API_BASE_URL}/intelligence/building/${encodeURIComponent(buildingIdOrName)}`, {
      headers: getAuthHeaders()
    });
    return parseJsonResponse(res, 'Failed to fetch building intelligence');
  },

  async linkComplaints(primaryId, linkedIds, note = '') {
    const res = await safeFetch(`${API_BASE_URL}/intelligence/link-complaints`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ primaryId, linkedIds, note })
    });
    return parseJsonResponse(res, 'Failed to link complaints');
  }
};
