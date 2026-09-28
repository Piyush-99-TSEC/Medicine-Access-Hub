import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Pill, AlertCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext.js';
import { authApi } from '../../../api/client.js';

const inputClass =
  'w-full h-10 mt-1 px-3 rounded-lg border border-border bg-app text-sm outline-none focus:border-primary/50';

export default function Register() {
  const { completeLogin, showToast } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (step === 'form') {
        // Role is never sent: the backend always creates a PATIENT account.
        await authApi.registerInit({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone
        });
        setStep('otp');
        showToast(`OTP sent to ${form.email.trim()}.`, 'success');
      } else {
        const data = await authApi.registerVerify({ email: form.email.trim(), otp });
        completeLogin(data);
        showToast(`Welcome, ${data.user.name}! Account verified.`, 'success');
        navigate('/search');
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
      await authApi.resendOtp({ email: form.email.trim(), purpose: 'REGISTRATION_OTP' });
      showToast('A new OTP has been sent.', 'success');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-surface shadow-card p-6">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Pill size={18} className="text-white" />
        </div>
        <div>
          <p className="font-display font-semibold text-ink text-[15px]">Medicine Access Hub</p>
          <p className="text-[11px] text-ink-soft -mt-0.5">
            {step === 'form' ? 'Create your account' : 'Verify your email'}
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

        {step === 'form' ? (
          <>
            <div>
              <label className="text-xs text-ink-soft">Full name</label>
              <input
                required
                minLength={2}
                maxLength={100}
                value={form.name}
                onChange={e => update('name', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-ink-soft">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-ink-soft">Phone number</label>
              <input
                required
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                title="Enter a 10-digit phone number"
                value={form.phone}
                onChange={e => update('phone', e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-ink-soft">Password</label>
              <input
                required
                type="password"
                minLength={8}
                value={form.password}
                onChange={e => update('password', e.target.value)}
                placeholder="At least 8 characters"
                className={inputClass}
              />
            </div>
          </>
        ) : (
          <div>
            <p className="text-xs text-ink-soft mb-2">
              Enter the 6-digit code sent to <span className="text-ink font-medium">{form.email}</span>. It expires in 5 minutes.
            </p>
            <input
              required
              autoFocus
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className={`${inputClass} text-center tracking-[0.4em] text-base`}
            />
            <div className="flex justify-between mt-2 text-xs">
              <button type="button" onClick={() => { setStep('form'); setOtp(''); setError(''); }} className="text-ink-soft hover:text-ink">
                Edit details
              </button>
              <button type="button" onClick={handleResend} className="text-primary font-medium">
                Resend OTP
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors mt-1 disabled:opacity-60"
        >
          {loading ? 'Please wait...' : step === 'form' ? 'Create Account' : 'Verify & Continue'}
        </button>
      </form>

      <p className="text-xs text-ink-soft text-center mt-4">
        Already have an account? <Link to="/login" className="text-primary font-medium">Sign in</Link>
      </p>
    </div>
  );
}