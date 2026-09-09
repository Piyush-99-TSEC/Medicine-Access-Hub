import { CheckCircle2, XCircle, FileText } from 'lucide-react';

export default function PharmacyVerificationCard({ pharmacy, verification, onApprove, onReject }) {
  return (
    <div className="rounded-2xl border border-warning/25 bg-warning/5 p-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-ink text-sm">{pharmacy.name}</p>
        <p className="text-xs text-ink-soft mt-0.5">{pharmacy.address} · Licence {pharmacy.licenceNo}</p>
        <div className="flex gap-2 mt-2">
          {verification.documents.map(doc => (
            <span key={doc} className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-surface border border-border text-ink-soft">
              <FileText size={11} /> {doc}
            </span>
          ))}
        </div>
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
