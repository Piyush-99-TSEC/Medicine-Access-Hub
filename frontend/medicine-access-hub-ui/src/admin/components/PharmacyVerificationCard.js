import { CheckCircle2, XCircle } from 'lucide-react';

export default function PharmacyVerificationCard({ pharmacy, onApprove, onReject }) {
  return (
    <div className="rounded-2xl border border-warning/25 bg-warning/5 p-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-ink text-sm">{pharmacy.name}</p>
        <p className="text-xs text-ink-soft mt-0.5">{pharmacy.address}</p>
        <p className="text-xs text-ink-soft mt-0.5">Licence {pharmacy.licenceNo} · GST {pharmacy.gstNo}</p>
        <p className="text-xs text-ink-soft mt-0.5">
          {pharmacy.ownerName} · {pharmacy.contactPhone} · {pharmacy.email}
        </p>
        {pharmacy.createdAt && (
          <p className="text-[11px] text-ink-soft mt-2">Submitted {new Date(pharmacy.createdAt).toLocaleDateString()}</p>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={onApprove} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success text-white text-xs font-medium hover:bg-success/90 transition-colors">
          <CheckCircle2 size={13} /> Approve
        </button>
        <button onClick={onReject} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-danger/30 text-danger text-xs font-medium hover:bg-danger/5 transition-colors">
          <XCircle size={13} /> Reject
        </button>
      </div>
    </div>
  );
}
