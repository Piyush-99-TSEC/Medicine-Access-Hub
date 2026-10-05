// Thin wrapper around fetch for the Spring Boot backend.
// Only auth endpoints exist on the backend so far; everything else stays on mockData.js.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export async function api(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
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
  getById: id => api(`/api/v1/medicines/${id}`)
};