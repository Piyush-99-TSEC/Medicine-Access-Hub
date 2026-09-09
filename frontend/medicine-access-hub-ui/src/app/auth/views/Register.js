import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Pill } from 'lucide-react';
import { useApp } from '../../../context/AppContext.js';
import { ROLES } from '../../../mock/mockData';

export default function Register() {
  const { loginAsUser, showToast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', address: '' });

  function handleSubmit(e) {
    e.preventDefault();
    showToast(`Account created for ${form.name || 'new user'}. Signed in.`, 'success');
    loginAsUser({
      name: form.name,
      email: form.email,
      role: ROLES.PATIENT,
      phone: form.phone,
      city: form.city,
      address: form.address
    });
    navigate('/search');
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-surface shadow-card p-6">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Pill size={18} className="text-white" />
        </div>
        <div>
          <p className="font-display font-semibold text-ink text-[15px]">Medicine Access Hub</p>
          <p className="text-[11px] text-ink-soft -mt-0.5">Create your account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-ink-soft">Full name</label>
          <input
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full h-10 mt-1 px-3 rounded-lg border border-border bg-app text-sm outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-xs text-ink-soft">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full h-10 mt-1 px-3 rounded-lg border border-border bg-app text-sm outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-xs text-ink-soft">Phone number</label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 98765 43210"
            className="w-full h-10 mt-1 px-3 rounded-lg border border-border bg-app text-sm outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-ink-soft">City</label>
            <input
              required
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
              className="w-full h-10 mt-1 px-3 rounded-lg border border-border bg-app text-sm outline-none focus:border-primary/50"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-ink-soft">Address</label>
          <input
            required
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            className="w-full h-10 mt-1 px-3 rounded-lg border border-border bg-app text-sm outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-xs text-ink-soft">Password</label>
          <input required type="password" className="w-full h-10 mt-1 px-3 rounded-lg border border-border bg-app text-sm outline-none focus:border-primary/50" />
        </div>

        <button type="submit" className="w-full h-11 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors mt-1">
          Create Account
        </button>
      </form>

      <p className="text-xs text-ink-soft text-center mt-4">
        Already have an account? <Link to="/login" className="text-primary font-medium">Sign in</Link>
      </p>
    </div>
  );
}
