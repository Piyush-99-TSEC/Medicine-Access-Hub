import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Pill } from 'lucide-react';
import { useApp } from '../../../context/AppContext.js';
import { registerPharmacy, USER_LOCATION } from '../../../mock/mockData';

const FIELDS = [
  ['name', 'Pharmacy name', 'text'],
  ['ownerName', 'Owner name', 'text'],
  ['email', 'Email', 'email'],
  ['contact', 'Contact number', 'tel'],
  ['licenceNo', 'Drug licence no.', 'text'],
  ['gstNo', 'GST no.', 'text'],
  ['address', 'Address', 'text'],
  ['lat', 'Latitude', 'number'],
  ['lng', 'Longitude', 'number']
];
const DEMO = { name: 'MedPlus Care Pharmacy', ownerName: 'Rohan Mehta', email: 'rohan@medpluscare.in', contact: '+91 98765 43210', licenceNo: 'MH-PH-12345', gstNo: '27ABCDE1234F1Z5', address: 'Shivaji Chowk, Kalyan West', lat: 19.235, lng: 73.13, openTime: '08:00', closeTime: '22:00' };
const INPUT = 'w-full h-11 px-3 mt-1 rounded-xl border border-border bg-surface text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15';

export default function PharmacyRegister() {
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ openTime: '09:00', closeTime: '21:00', lat: USER_LOCATION.lat, lng: USER_LOCATION.lng });
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  function handleSubmit(e) {
    e.preventDefault();
    registerPharmacy(form);
    showToast('Pharmacy submitted for admin verification.', 'success');
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 bg-app">
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

        <button type="submit" className="w-full h-11 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors mt-2">
          Submit for verification
        </button>
        <p className="text-xs text-ink-soft text-center">
          Back to <Link to="/login" className="text-primary font-medium">Sign in</Link>
        </p>
      </form>
    </div>
  );
}