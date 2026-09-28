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