import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { adminMedicineApi } from '../../api/client.js';
import MedicineRequestsPanel from './MedicineRequestsPanel.js';

const EMPTY = {
  brandName: '', saltComposition: '', strength: '', dosageForm: '',
  manufacturer: '', packSize: '', mrp: '', rxRequired: false
};

const FIELDS = [
  ['brandName', 'Brand name *'],
  ['saltComposition', 'Salt composition *'],
  ['strength', 'Strength'],
  ['dosageForm', 'Dosage form'],
  ['manufacturer', 'Manufacturer'],
  ['packSize', 'Pack size'],
  ['mrp', 'MRP (₹) *']
];

function MedicineForm({ initial, onClose, onSaved }) {
  const { currentUser, showToast } = useApp();
  const [form, setForm] = useState({ ...EMPTY, ...initial, mrp: initial?.mrp ?? '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = Boolean(initial?.id);

  async function save() {
    setSaving(true);
    setError('');
    try {
      const body = { ...form, mrp: Number(form.mrp) };
      if (isEdit) {
        await adminMedicineApi.update(initial.id, body, currentUser.token);
      } else {
        await adminMedicineApi.create(body, currentUser.token);
      }
      showToast(isEdit ? 'Medicine updated.' : 'Medicine added.', 'success');
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-surface p-5 flex flex-col gap-3">
        <p className="font-semibold text-ink text-sm">{isEdit ? 'Edit medicine' : 'Add medicine'}</p>
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
          <input
            type="checkbox"
            checked={form.rxRequired}
            onChange={e => setForm({ ...form, rxRequired: e.target.checked })}
          />
          Prescription required
        </label>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-9 rounded-lg border border-border text-xs font-medium text-ink-soft">Cancel</button>
          <button onClick={save} disabled={saving} className="flex-1 h-9 rounded-lg bg-primary text-white text-xs font-medium disabled:opacity-60">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MasterDataTab() {
  const { currentUser } = useApp();
  const token = currentUser?.token;
  const [q, setQ] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, medicine = edit

  // Wait for the admin to stop typing before querying
  useEffect(() => {
    const t = setTimeout(() => { setTerm(q); setPage(0); }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(() => {
    adminMedicineApi.list(term, page, token).then(setData).catch(err => setError(err.message));
  }, [term, page, token]);

  useEffect(() => { load(); }, [load]);

  const rows = data?.content ?? [];

  return (
    <>
    <MedicineRequestsPanel onApproved={load} />
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search brand or salt…" className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-app text-sm outline-none focus:border-primary/50" />
        </div>
        <button onClick={() => setEditing({})} className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors">
          <Plus size={14} /> Add medicine
        </button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-app text-ink-soft text-xs uppercase tracking-wide">
              <th className="text-left font-medium px-4 py-3">Brand</th>
              <th className="text-left font-medium px-4 py-3">Salt Composition</th>
              <th className="text-left font-medium px-4 py-3">Strength</th>
              <th className="text-left font-medium px-4 py-3">Form</th>
              <th className="text-left font-medium px-4 py-3">Manufacturer</th>
              <th className="text-left font-medium px-4 py-3">MRP</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map(m => (
              <tr key={m.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-ink">{m.brandName}</td>
                <td className="px-4 py-3 text-ink-soft">{m.saltComposition}</td>
                <td className="px-4 py-3 text-ink-soft">{m.strength}</td>
                <td className="px-4 py-3 text-ink-soft">{m.dosageForm}</td>
                <td className="px-4 py-3 text-ink-soft">{m.manufacturer}</td>
                <td className="px-4 py-3 text-ink-soft">₹{m.mrp}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setEditing(m)} className="p-1.5 rounded-md hover:bg-app text-ink-soft hover:text-primary" aria-label="Edit">
                    <Pencil size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {data && rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-ink-soft">No medicines found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-ink-soft">
          <span>{data.totalElements} medicines · page {data.page + 1} of {data.totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40">Previous</button>
            <button disabled={data.last} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {editing && (
        <MedicineForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
    </>
  );
}