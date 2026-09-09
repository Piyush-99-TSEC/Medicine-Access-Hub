import { X, FlaskConical, ShieldAlert, RefreshCcw } from 'lucide-react';
import { getSubstitutes } from '../../mock/mockData';

export default function MedicineDetailModal({ medicine, open, onClose, onSelectSubstitute }) {
  if (!open || !medicine) return null;

  const substitutes = getSubstitutes(medicine.id);

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface shadow-card animate-fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FlaskConical size={17} className="text-primary" />
            <h3 className="font-display font-semibold text-ink text-[15px]">Medicine Details</h3>
          </div>
          <button onClick={onClose} className="text-ink-soft hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <p className="font-semibold text-ink text-lg">{medicine.brand}</p>
            <p className="text-sm text-ink-soft">{medicine.manufacturer}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-app p-3">
              <p className="text-[11px] text-ink-soft uppercase tracking-wide">Salt Composition</p>
              <p className="font-medium text-ink mt-0.5">{medicine.salt}</p>
            </div>
            <div className="rounded-lg bg-app p-3">
              <p className="text-[11px] text-ink-soft uppercase tracking-wide">Strength</p>
              <p className="font-medium text-ink mt-0.5">{medicine.strength}</p>
            </div>
            <div className="rounded-lg bg-app p-3">
              <p className="text-[11px] text-ink-soft uppercase tracking-wide">Dosage Form</p>
              <p className="font-medium text-ink mt-0.5">{medicine.form}</p>
            </div>
            <div className="rounded-lg bg-app p-3">
              <p className="text-[11px] text-ink-soft uppercase tracking-wide">MRP</p>
              <p className="font-medium text-ink mt-0.5">₹{medicine.mrp}</p>
            </div>
          </div>

          {medicine.rxRequired && (
            <div className="flex items-center gap-1.5 text-xs text-warning bg-warning/5 rounded-lg px-3 py-2">
              <ShieldAlert size={13} /> Prescription required for this medicine.
            </div>
          )}

          {substitutes.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-ink mb-2">
                <RefreshCcw size={14} className="text-info" /> Same-salt substitutes
              </p>
              <div className="flex flex-wrap gap-2">
                {substitutes.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => onSelectSubstitute?.(sub)}
                    className="px-3 py-1.5 rounded-lg bg-app border border-border text-xs font-medium text-ink hover:border-info/50 transition-colors"
                  >
                    {sub.brand} <span className="text-ink-soft">· {sub.manufacturer}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-ink-soft mt-2">
                Matched on identical salt, strength, and dosage form. Confirm with a pharmacist before substituting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
