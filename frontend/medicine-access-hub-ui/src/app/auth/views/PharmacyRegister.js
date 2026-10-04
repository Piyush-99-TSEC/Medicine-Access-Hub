import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Pill } from 'lucide-react';
import { useApp } from '../../../context/AppContext.js';
import { pharmacyApi } from '../../../api/client.js';
import { USER_LOCATION } from '../../../mock/mockData';

const FIELDS = [
  ['name', 'Pharmacy name', 'text'],
  ['ownerName', 'Owner name', 'text'],
  ['email', 'Email', 'email'],
  ['contactPhone', 'Contact number', 'tel'],
  ['licenceNo', 'Drug licence no.', 'text'],
  ['gstNo', 'GST no.', 'text'],
  ['address', 'Address', 'text'],
  ['lat', 'Latitude', 'number'],
  ['lng', 'Longitude', 'number']
];

const INPUT = 'w-full h-11 px-3 mt-1 rounded-xl border border-border bg-surface text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15';

export default function PharmacyRegister() {
  const { showToast, currentUser } = useApp();
  const [existing, setExisting] = useState(null);   // saved pharmacy, if any
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    ownerName: currentUser?.name || '', email: currentUser?.email || '',
    openTime: '09:00', closeTime: '21:00', lat: USER_LOCATION.lat, lng: USER_LOCATION.lng
  });

  useEffect(() => {
    pharmacyApi.me(currentUser.token)
      .then(setExisting)
      .catch(() => setExisting(null))   // 404 means no pharmacy yet, so show the form
      .finally(() => setChecking(false));
  }, [currentUser.token]);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await pharmacyApi.register({
        name: form.name,
        licenceNo: form.licenceNo,
        address: form.address,
        latitude: Number(form.lat),
        longitude: Number(form.lng),
        openTime: form.openTime,
        closeTime: form.closeTime,
        ownerName: form.ownerName,
        email: form.email,
        contactPhone: form.contactPhone,
        gstNo: form.gstNo
      }, currentUser.token);
      showToast('Pharmacy submitted for admin verification.', 'success');
      navigate('/search');
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) return null;

  // Already applied: show the status instead of the form
  if (existing) {
    const msg = {
      PENDING: 'Your pharmacy is under review. You will get access once the admin verifies it.',
      VERIFIED: 'Your pharmacy is approved. Please log out and log in again to open your dashboard.',
      REJECTED: 'Your registration was not approved. Please contact support.',
      BLOCKED: 'Your pharmacy has been blocked. Please contact support.'
    }[existing.status];
    return (
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center shadow-card">
          <p className="font-display font-semibold text-ink text-[15px]">{existing.name}</p>
          <p className="text-xs text-ink-soft mt-0.5">Status: {existing.status}</p>
          <p className="text-sm text-ink-soft mt-3">{msg}</p>
          <Link to="/search" className="inline-block mt-4 text-primary text-sm font-medium">Back to search</Link>
        </div>
      </div>
    );
  }

  // No pharmacy yet: show the form
  return (
    <div className="flex items-center justify-center px-6 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-3">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center"><Pill size={18} className="text-white" /></div>
          <div>
            <p className="font-display font-semibold text-ink text-[15px]">Pharmacy Registration</p>
            <p className="text-[11px] text-ink-soft -mt-0.5">Submit details for admin verification</p>
          </div>
        </div>

        {FIELDS.map(([k, label, type]) => (
          <div key={k}>
            <label className="text-xs text-ink-soft">{label}</label>
            <input required type={type} step={type === 'number' ? 'any' : undefined} value={form[k] || ''} onChange={set(k)} className={INPUT} />
          </div>
        ))}

        <div className="flex gap-3">
          {[['openTime', 'Opens'], ['closeTime', 'Closes']].map(([k, label]) => (
            <div key={k} className="flex-1">
              <label className="text-xs text-ink-soft">{label}</label>
              <input required type="time" value={form[k]} onChange={set(k)} className={INPUT} />
            </div>
          ))}
        </div>

        <button type="submit" disabled={submitting} className="w-full h-11 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors mt-2 disabled:opacity-60">
          {submitting ? 'Submitting…' : 'Submit for verification'}
        </button>
        <p className="text-xs text-ink-soft text-center">
          Back to <Link to="/search" className="text-primary font-medium">Search</Link>
        </p>
      </form>
    </div>
  );
}