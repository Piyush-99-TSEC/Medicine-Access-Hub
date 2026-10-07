import { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { ownerMedicineRequestApi } from '../../api/client';

const FIELDS = [
  ['brandName', 'Brand name *'],
  ['saltComposition', 'Salt composition *'],
  ['strength', 'Strength'],
  ['dosageForm', 'Dosage form'],
  ['manufacturer', 'Manufacturer'],
  ['packSize', 'Pack size'],
  ['mrp', 'MRP (₹) *']
];

export default function RequestMedicineModal({ initialName = '', onClose, onDone }) {
  const { currentUser, showToast } = useApp();
  const [form, setForm] = useState({
    brandName: initialName, saltComposition: '', strength: '', dosageForm: '',
    manufacturer: '', packSize: '', mrp: '', rxRequired: false
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setSaving(true);
    setError('');
    try {
      await ownerMedicineRequestApi.submit({ ...form, mrp: Number(form.mrp) }, currentUser.token);
      showToast('Request sent. The admin will review it.', 'success');
      onDone();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-surface p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-ink text-sm">Request a new medicine</p>
          <button onClick={onClose} className="text-ink-soft hover:text-ink"><X size={18} /></button>
        </div>
        <p className="text-xs text-ink-soft">The admin reviews it. Once approved, it appears in search and you can add stock.</p>
        {FIELDS.map(([key, label]) => (
          <label key={key} className="flex flex-col gap-1 text-xs text-ink-soft">
            {label}
            <input
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="h-9 px-3 rounded-lg border border-border bg-app text-sm text-ink outline-none focus:border-primary/50"
            />
          </label>
        ))}
        <label className="flex items-center gap-2 text-xs text-ink-soft">
          <input type="checkbox" checked={form.rxRequired} onChange={e => setForm({ ...form, rxRequired: e.target.checked })} />
          Prescription required
        </label>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-9 rounded-lg border border-border text-xs font-medium text-ink-soft">Cancel</button>
          <button onClick={submit} disabled={saving} className="flex-1 h-9 rounded-lg bg-primary text-white text-xs font-medium disabled:opacity-60">
            {saving ? 'Sending...' : 'Send request'}
          </button>
        </div>
      </div>
    </div>
  );
}