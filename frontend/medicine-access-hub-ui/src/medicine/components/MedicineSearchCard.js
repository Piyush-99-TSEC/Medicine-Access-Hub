import { useState } from 'react';
import { Search, ScanLine, MapPin, FileText } from 'lucide-react';

const RADIUS_OPTIONS = [1, 3, 5, 10];

export default function MedicineSearchCard({ query, radiusKm, onRadiusChange, onSearch, onOpenScan, onOpenPrescription })  {
  const [value, setValue] = useState(query);

  function submit(e) {
    e.preventDefault();
    onSearch(value);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 md:p-5 shadow-card">
      <form onSubmit={submit} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Search by brand, generic, or salt — e.g. Crocin, Paracetamol"
            className="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-app focus:bg-surface focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none text-sm transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={onOpenScan}
          className="h-11 px-4 rounded-xl border border-primary/25 bg-primary-tint text-primary font-medium text-sm flex items-center gap-2 hover:bg-primary/10 transition-colors shrink-0"
        >
          <ScanLine size={16} />
          Scan Medicine Strip / Box
        </button>

        {/* <button
          type="button"
          onClick={onOpenPrescription}
          className="h-11 px-4 rounded-xl border border-primary/25 bg-primary-tint text-primary font-medium text-sm flex items-center gap-2 hover:bg-primary/10 transition-colors shrink-0"
        >
          <FileText size={16} />
          Prescription
        </button> */}

        <button
          type="submit"
          className="h-11 px-6 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      <div className="flex items-center gap-2 mt-3.5 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-ink-soft mr-1">
          <MapPin size={13} /> Radius
        </span>
        {RADIUS_OPTIONS.map(r => (
          <button
            key={r}
            onClick={() => onRadiusChange(r)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              radiusKm === r
                ? 'bg-primary text-white border-primary'
                : 'bg-app text-ink-soft border-border hover:border-primary/40 hover:text-ink'
            }`}
          >
            {r} km
          </button>
        ))}
      </div>
    </div>
  );
}
