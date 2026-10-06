// Thin wrapper around fetch for the Spring Boot backend.
// Only auth endpoints exist on the backend so far; everything else stays on mockData.js.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export async function api(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    const isForm = body instanceof FormData;
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        // For FormData the browser sets the multipart boundary itself
        ...(isForm ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    // Validation errors come back as ["phone: Phone number must be ...", ...]
    const fieldErrors = Array.isArray(json.errors)
      ? json.errors.map(e => e.split(': ').slice(1).join(': ') || e)
      : [];
    throw new Error(fieldErrors.length ? fieldErrors.join('. ') : json.message || 'Something went wrong.');
  }
  return json.data;
}

export const authApi = {
  registerInit: body => api('/api/v1/auth/register/init', { method: 'POST', body }),
  registerVerify: body => api('/api/v1/auth/register/verify', { method: 'POST', body }),
  loginInit: body => api('/api/v1/auth/login/init', { method: 'POST', body }),
  loginVerify: body => api('/api/v1/auth/login/verify', { method: 'POST', body }),
  resendOtp: body => api('/api/v1/auth/otp/resend', { method: 'POST', body }),
  me: token => api('/api/v1/auth/me', { token })
};

export const pharmacyApi = {
  register: (body, token) => api('/api/v1/pharmacies/register', { method: 'POST', body, token }),
  me: token => api('/api/v1/pharmacies/me', { token }),
  updateMe: (body, token) => api('/api/v1/pharmacies/me', { method: 'PUT', body, token }),
  getById: id => api(`/api/v1/pharmacies/${id}`)
};

export const adminPharmacyApi = {
  list: (status, token) => api(`/api/v1/admin/pharmacies?status=${status}`, { token }),
  verify: (id, token) => api(`/api/v1/admin/pharmacies/${id}/verify`, { method: 'PATCH', token }),
  reject: (id, token) => api(`/api/v1/admin/pharmacies/${id}/reject`, { method: 'PATCH', token })
};

export const medicineApi = {
  search: (q, page = 0, size = 20) =>
    api(`/api/v1/medicines?q=${encodeURIComponent(q)}&page=${page}&size=${size}`),
  getById: id => api(`/api/v1/medicines/${id}`),
  availability: (id, lat, lng, radiusKm) =>
    api(`/api/v1/medicines/${id}/availability?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`),
  scan: (file, token) => {
    const form = new FormData();
    form.append('file', file);
    return api('/api/v1/medicines/scan', { method: 'POST', body: form, token });
  }
};

export const ownerInventoryApi = {
  list: ({ q = '', status = 'ALL', expiry = 'ALL', page = 0, size = 20 } = {}, token) =>
    api(`/api/v1/pharmacies/me/inventory?q=${encodeURIComponent(q)}&status=${status}&expiry=${expiry}&page=${page}&size=${size}`, { token }),
  summary: token => api('/api/v1/pharmacies/me/inventory/summary', { token }),
  save: (body, token) => api('/api/v1/pharmacies/me/inventory', { method: 'POST', body, token }),
  update: (id, body, token) => api(`/api/v1/pharmacies/me/inventory/${id}`, { method: 'PUT', body, token }),
  remove: (id, token) => api(`/api/v1/pharmacies/me/inventory/${id}`, { method: 'DELETE', token })
};
