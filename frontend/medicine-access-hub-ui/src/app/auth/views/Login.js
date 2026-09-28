import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Pill, Mail, Lock, KeyRound, AlertCircle, HeartPulse, MapPinned, ScanLine } from 'lucide-react';
import { useApp } from '../../../context/AppContext.js';
import { authApi } from '../../../api/client.js';
import { ROLES } from '../../../mock/mockData';

const HOME_BY_ROLE = {
  [ROLES.PATIENT]: '/search',
  [ROLES.PHARMACY_OWNER]: '/pharmacy-dashboard/inventory',
  [ROLES.ADMIN]: '/admin/verification'
};

export default function Login() {
  const { completeLogin, showToast } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (step === 'credentials' && (!email || !password)) {
      setError('Enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (step === 'credentials') {
        // Step 1: backend checks the password and emails a 6-digit OTP.
        await authApi.loginInit({ email: email.trim(), password });
        setStep('otp');
        showToast(`OTP sent to ${email.trim()}.`, 'success');
      } else {
        // Step 2: backend verifies the OTP and returns { token, user }.
        const data = await authApi.loginVerify({ email: email.trim(), otp });
        const user = completeLogin(data);
        navigate(HOME_BY_ROLE[user.role] || '/search');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    try {
      await authApi.resendOtp({ email: email.trim(), purpose: 'LOGIN_OTP' });
      showToast('A new OTP has been sent.', 'success');
    } catch (err) {
      setError(err.message);
    }
  }

  function backToCredentials() {
    setStep('credentials');
    setOtp('');
    setError('');
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
              <p className="text-[11px] text-ink-soft -mt-0.5">
                {step === 'credentials' ? 'Sign in to continue' : 'Enter your verification code'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-start gap-2 text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {step === 'credentials' ? (
              <>
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
              </>
            ) : (
              <div>
                <p className="text-xs text-ink-soft mb-2">
                  Enter the 6-digit code sent to <span className="text-ink font-medium">{email}</span>. It expires in 5 minutes.
                </p>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input
                    autoFocus
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full h-11 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm text-center tracking-[0.4em] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <button type="button" onClick={backToCredentials} className="text-ink-soft hover:text-ink">
                    Use a different account
                  </button>
                  <button type="button" onClick={handleResend} className="text-primary font-medium">
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (step === 'otp' && otp.length !== 6)}
              className="w-full h-11 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors mt-1 disabled:opacity-60"
            >
              {loading ? 'Please wait...' : step === 'credentials' ? 'Send OTP' : 'Verify & Sign In'}
            </button>
          </form>

          <p className="text-xs text-ink-soft text-center mt-4">
            Don't have an account? <Link to="/register" className="text-primary font-medium">Register</Link>
          </p>
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