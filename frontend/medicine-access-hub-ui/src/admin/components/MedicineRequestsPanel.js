import { useCallback, useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { adminMedicineRequestApi } from '../../api/client.js';

export default function MedicineRequestsPanel({ onApproved }) {
  const { currentUser, showToast } = useApp();
  const token = currentUser?.token;
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');

  const load = useCallback(() => {
    adminMedicineRequestApi.list('PENDING', token).then(setRows).catch(err => setError(err.message));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function approve(id) {
    setError('');
    try {
      await adminMedicineRequestApi.approve(id, token);
      showToast('Medicine added to the catalogue.', 'success');
      load();
      onApproved();
    } catch (err) {
      setError(err.message);
    }
  }

  async function reject(id) {
    setError('');
    try {
      await adminMedicineRequestApi.reject(id, reason, token);
      showToast('Request rejected.', 'success');
      setRejectingId(null);
      setReason('');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (rows.length === 0 && !error) return null;

  return (
    <div className="rounded-2xl border border-warning/40 bg-warning/5 p-4 flex flex-col gap-3">
      <p className="font-semibold text-ink text-sm">Pending medicine requests ({rows.length})</p>
      {error && <p className="text-xs text-danger">{error}</p>}
      {rows.map(r => (
        <div key={r.id} className="rounded-xl border border-border bg-surface p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">{r.brandName}</p>
              <p className="text-xs text-ink-soft mt-0.5">
                {r.saltComposition} · {r.strength} · {r.dosageForm} · {r.manufacturer} · MRP ₹{r.mrp}
              </p>
              <p className="text-[11px] text-ink-soft mt-0.5">Requested by {r.pharmacyName}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => approve(r.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success text-white text-xs font-medium">
                <Check size={13} /> Approve
              </button>
              <button onClick={() => { setRejectingId(r.id); setReason(''); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-danger/30 text-danger text-xs font-medium">
                <X size={13} /> Reject
              </button>
            </div>
          </div>
          {rejectingId === r.id && (
            <div className="mt-3 flex gap-2">
              <input
                value={reason}
                onChange={e => setReason(e.target.value)}
                maxLength={500}
                placeholder="Reason for rejection"
                className="flex-1 h-9 px-3 rounded-lg border border-border bg-app text-sm outline-none focus:border-primary/50"
              />
              <button onClick={() => reject(r.id)} disabled={!reason.trim()} className="px-3 h-9 rounded-lg bg-danger text-white text-xs font-medium disabled:opacity-50">
                Confirm
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}