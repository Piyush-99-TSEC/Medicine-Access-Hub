import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ownerMedicineRequestApi } from '../../api/client';
import Badge from '../../components/Badge.js';

const STATUS_VARIANT = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' };

export default function MyMedicineRequests() {
  const { currentUser } = useApp();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ownerMedicineRequestApi
      .list(currentUser?.token)
      .then(setRows)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentUser?.token]);

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-danger">{error}</p>}
      {!loading && rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-6 text-sm text-ink-soft text-center">
          No requests yet. Use "Can't find it?" in Add Stock to request a missing medicine.
        </div>
      )}
      {rows.map(r => (
        <div key={r.id} className="rounded-2xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-ink text-sm">{r.brandName}</p>
              <p className="text-xs text-ink-soft mt-0.5">
                {r.saltComposition} · {r.strength} · {r.dosageForm} · MRP ₹{r.mrp}
              </p>
            </div>
            <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
          </div>
          {r.status === 'REJECTED' && r.rejectionReason && (
            <p className="mt-2 text-xs text-danger">Reason: {r.rejectionReason}</p>
          )}
          {r.status === 'APPROVED' && (
            <p className="mt-2 text-xs text-ink-soft">Approved. You can now add stock for it from the Inventory tab.</p>
          )}
        </div>
      ))}
    </div>
  );
}