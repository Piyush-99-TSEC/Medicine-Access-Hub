import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Pill, Mail, Lock, AlertCircle, HeartPulse, MapPinned, ScanLine } from 'lucide-react';
import { useApp } from '../../../context/AppContext.js';
import { ROLES } from '../../../mock/mockData';

const HOME_BY_ROLE = {
  [ROLES.PATIENT]: '/search',
  [ROLES.PHARMACY_OWNER]: '/pharmacy-dashboard/inventory',
  [ROLES.ADMIN]: '/admin/verification'
};

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Enter both email and password.');
      return;
    }
    const user = login(email, password);
    if (!user) {
      setError('Invalid email or password.');
      return;
    }
    navigate(HOME_BY_ROLE[user.role] || '/search');
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Left: form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-app">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Pill size={18} className="text-white" />
            </div>
            <div>
              <p className="font-display font-semibold text-ink text-[15px]">Medicine Access Hub</p>
              <p className="text-[11px] text-ink-soft -mt-0.5">Sign in to continue</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <div>
              <label className="text-xs text-ink-soft">Email</label>
              <div className="relative mt-1">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.in"
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-ink-soft">Password</label>
              <div className="relative mt-1">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>

            <button type="submit" className="w-full h-11 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors mt-1">
              Sign In
            </button>
          </form>

          <p className="text-xs text-ink-soft text-center mt-4">
            Don't have an account? <Link to="/register" className="text-primary font-medium">Register</Link>
          </p>

          <div className="mt-6 rounded-xl border border-border bg-surface p-3 text-[11px] text-ink-soft leading-relaxed">
            <p className="font-medium text-ink mb-1">Demo credentials</p>
            <p>patient@demo.in / patient123</p>
            <p>pharmacy@demo.in / pharmacy123</p>
            <p>admin@demo.in / admin123</p>
          </div>
        </div>
      </div>

      {/* Right: branding */}
      <div className="flex-1 bg-primary relative overflow-hidden flex items-center justify-center px-8 py-12 min-h-[280px] md:min-h-screen">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative text-white max-w-sm text-center md:text-left">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-6 mx-auto md:mx-0">
            <HeartPulse size={26} />
          </div>
          <h2 className="font-display font-semibold text-2xl leading-tight">
            Find it nearby. Right now.
          </h2>
          <p className="text-white/80 text-sm mt-3">
            Real-time medicine availability, ranked pharmacy search, and instant reservations — so you never have to call around during an emergency.
          </p>

          <div className="flex flex-col gap-3 mt-8 text-sm">
            <div className="flex items-center gap-2.5 text-white/90">
              <MapPinned size={16} /> Live stock across nearby pharmacies
            </div>
            <div className="flex items-center gap-2.5 text-white/90">
              <ScanLine size={16} /> Scan a strip instead of typing the name
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
