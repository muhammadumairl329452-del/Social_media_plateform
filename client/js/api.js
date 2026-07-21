// ============================================
// API Helper
// Centralizes all fetch calls to the backend REST API
// ============================================

// Change this if your backend runs on a different host/port
const API_BASE_URL = 'http://localhost:5000/api';
const UPLOADS_BASE_URL = 'http://localhost:5000/uploads';

// ---------- Token helpers ----------
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
const setStoredUser = (user) => localStorage.setItem('user', JSON.stringify(user));
const removeStoredUser = () => localStorage.removeItem('user');

const isLoggedIn = () => !!getToken();

// ---------- Image URL helper ----------
// Builds a full URL for an uploaded image, or returns a default placeholder
const profileImgUrl = (filename) =>
  filename ? `${UPLOADS_BASE_URL}/profiles/${filename}` : 'https://api.dicebear.com/7.x/initials/svg?seed=User';

const postImgUrl = (filename) => (filename ? `${UPLOADS_BASE_URL}/posts/${filename}` : null);

// ---------- Core request wrapper ----------
/**
 * apiRequest - wraps fetch with auth headers and JSON handling
 * @param {string} endpoint - path after /api, e.g. '/posts'
 * @param {object} options - { method, body, isFormData }
 */
async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, isFormData = false } = options;

  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData && body) headers['Content-Type'] = 'application/json';

  const config = { method, headers };
  if (body) config.body = isFormData ? body : JSON.stringify(body);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  let data;
  try {
    data = await response.json();
  } catch {
    data = { success: false, message: 'Unexpected server response.' };
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

// ---------- Toast notifications ----------
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ---------- Time formatting ----------
function timeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  const intervals = [
    { label: 'y', secs: 31536000 },
    { label: 'mo', secs: 2592000 },
    { label: 'd', secs: 86400 },
    { label: 'h', secs: 3600 },
    { label: 'm', secs: 60 }
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.secs);
    if (count >= 1) return `${count}${i.label} ago`;
  }
  return 'just now';
}

// ---------- Basic HTML escaping to prevent XSS from user content ----------
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
