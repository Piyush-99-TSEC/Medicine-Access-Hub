// import { useState } from 'react';
// import { X, UploadCloud, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
// import { MEDICINES } from '../../mock/mockData';

// export default function AddStockModal({ open, onClose, pharmacyId, onAdd }) {
//   const [mode, setMode] = useState('manual');
//   const [form, setForm] = useState({ medicineId: MEDICINES[0].id, quantity: '', price: '', expiryDate: '' });
//   const [csvName, setCsvName] = useState(null);
//   const [csvDone, setCsvDone] = useState(false);

//   if (!open) return null;

//   function handleClose() {
//     setForm({ medicineId: MEDICINES[0].id, quantity: '', price: '', expiryDate: '' });
//     setCsvName(null);
//     setCsvDone(false);
//     setMode('manual');
//     onClose();
//   }

//   function handleManualSubmit(e) {
//     e.preventDefault();
//     const qty = Number(form.quantity) || 0;
//     onAdd({
//       pharmacyId,
//       medicineId: form.medicineId,
//       quantity: qty,
//       price: Number(form.price) || 0,
//       expiryDate: form.expiryDate || '2027-01-01',
//       status: qty > 10 ? 'IN_STOCK' : qty > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK'
//     });
//     handleClose();
//   }

//   function handleCsvFile(file) {
//     if (!file) return;
//     setCsvName(file.name);
//     setTimeout(() => setCsvDone(true), 1000);
//   }

//   return (
//     <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-ink/40 p-4">
//       <div className="w-full max-w-md rounded-2xl bg-surface shadow-card animate-fade-in">
//         <div className="flex items-center justify-between px-5 py-4 border-b border-border">
//           <h3 className="font-display font-semibold text-ink text-[15px]">Add / Update Stock</h3>
//           <button onClick={handleClose} className="text-ink-soft hover:text-ink"><X size={18} /></button>
//         </div>

//         <div className="flex gap-1 px-5 pt-4">
//           <button onClick={() => setMode('manual')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${mode === 'manual' ? 'bg-primary text-white' : 'bg-app text-ink-soft'}`}>
//             Manual Entry
//           </button>
//           <button onClick={() => setMode('csv')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${mode === 'csv' ? 'bg-primary text-white' : 'bg-app text-ink-soft'}`}>
//             CSV Bulk Upload
//           </button>
//         </div>

//         <div className="p-5">
//           {mode === 'manual' && (
//             <form onSubmit={handleManualSubmit} className="flex flex-col gap-3.5">
//               <div>
//                 <label className="text-xs text-ink-soft">Medicine</label>
//                 <select value={form.medicineId} onChange={e => setForm({ ...form, medicineId: e.target.value })} className="w-full h-10 mt-1 px-3 rounded-lg border border-border bg-app text-sm outline-none">
//                   {MEDICINES.map(m => (
//                     <option key={m.id} value={m.id}>{m.brand} — {m.salt} {m.strength}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="flex gap-3">
//                 <div className="flex-1">
//                   <label className="text-xs text-ink-soft">Quantity</label>
//                   <input required type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="w-full h-10 mt-1 px-3 rounded-lg border border-border bg-app text-sm outline-none" />
//                 </div>
//                 <div className="flex-1">
//                   <label className="text-xs text-ink-soft">Price (₹)</label>
//                   <input required type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full h-10 mt-1 px-3 rounded-lg border border-border bg-app text-sm outline-none" />
//                 </div>
//               </div>
//               <div>
//                 <label className="text-xs text-ink-soft">Expiry date</label>
//                 <input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} className="w-full h-10 mt-1 px-3 rounded-lg border border-border bg-app text-sm outline-none" />
//               </div>
//               <button type="submit" className="w-full h-11 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors mt-1">
//                 Save to Inventory
//               </button>
//             </form>
//           )}

//           {mode === 'csv' && (
//             <div className="flex flex-col gap-4">
//               {!csvName && (
//                 <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl h-40 cursor-pointer hover:border-primary/40 hover:bg-primary-tint/40 transition-colors">
//                   <UploadCloud size={26} className="text-primary" />
//                   <p className="text-sm font-medium text-ink">Upload inventory CSV</p>
//                   <p className="text-xs text-ink-soft">Columns: medicine_id, quantity, price, expiry_date</p>
//                   <input type="file" accept=".csv" className="hidden" onChange={e => handleCsvFile(e.target.files?.[0])} />
//                 </label>
//               )}
//               {csvName && !csvDone && (
//                 <div className="flex items-center gap-3 rounded-xl border border-border p-4">
//                   <FileSpreadsheet size={20} className="text-primary" />
//                   <div className="flex-1">
//                     <p className="text-sm text-ink font-medium">{csvName}</p>
//                     <p className="text-xs text-ink-soft">Parsing rows…</p>
//                   </div>
//                   <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
//                 </div>
//               )}
//               {csvDone && (
//                 <div className="flex items-center gap-3 rounded-xl border border-success/25 bg-success/5 p-4">
//                   <CheckCircle2 size={20} className="text-success" />
//                   <div>
//                     <p className="text-sm text-ink font-medium">{csvName} processed</p>
//                     <p className="text-xs text-ink-soft">12 rows imported, 0 errors (simulated).</p>
//                   </div>
//                 </div>
//               )}
//               <button onClick={handleClose} disabled={!csvDone} className="w-full h-11 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
//                 Done
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { medicineApi, ownerInventoryApi } from '../../api/client';

const EMPTY_FORM = { quantity: '', price: '', expiryDate: '' };

export default function AddStockModal({ open, onClose, onSaved }) {
  const { currentUser, showToast } = useApp();
  const token = currentUser?.token;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // search the medicine catalogue 300ms after typing stops
  useEffect(() => {
    const q = query.trim();
    if (selected || q.length < 2) {
      setResults([]);
      return undefined;
    }
    let cancelled = false;
    const t = setTimeout(() => {
      setSearching(true);
      medicineApi
        .search(q, 0, 8)
        .then(page => {
          if (!cancelled) setResults(page.content);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, selected]);

  if (!open) return null;

  function handleClose() {
    setQuery('');
    setResults([]);
    setSelected(null);
    setForm(EMPTY_FORM);
    setError('');
    onClose();
  }

  function pick(medicine) {
    setSelected(medicine);
    setForm(f => ({ ...f, price: String(medicine.mrp) }));
    setError('');
  }

  function clearSelection() {
    setSelected(null);
    setQuery('');
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selected) {
      setError('Search and select a medicine first.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await ownerInventoryApi.save(
        {
          medicineId: selected.id,
          quantity: Number(form.quantity),
          price: Number(form.price),
          expiryDate: form.expiryDate || null
        },
        token
      );
      showToast(`${selected.brandName} saved to your stock.`, 'success');
      onSaved();
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface shadow-card animate-fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-display font-semibold text-ink text-[15px]">Add / Update Stock</h3>
          <button onClick={handleClose} className="text-ink-soft hover:text-ink"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3.5">
          <div>
            <label className="text-xs text-ink-soft">Medicine</label>
            {selected ? (
              <div className="mt-1 flex items-start justify-between gap-3 rounded-lg border border-primary/40 bg-primary-tint/40 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-ink">{selected.brandName}</p>
                  <p className="text-xs text-ink-soft">
                    {selected.saltComposition} · {selected.strength} · {selected.dosageForm} · MRP ₹{selected.mrp}
                  </p>
                </div>
                <button type="button" onClick={clearSelection} className="text-xs text-primary font-medium shrink-0">Change</button>
              </div>
            ) : (
              <div className="relative mt-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search brand or salt name…"
                  className="w-full h-10 pl-8 pr-3 rounded-lg border border-border bg-app text-sm outline-none focus:border-primary/50"
                />
                {(searching || results.length > 0 || query.trim().length >= 2) && (
                  <div className="mt-1 rounded-lg border border-border bg-surface max-h-52 overflow-y-auto">
                    {searching && <p className="px-3 py-2 text-xs text-ink-soft">Searching…</p>}
                    {!searching && results.length === 0 && (
                      <p className="px-3 py-2 text-xs text-ink-soft">No medicine found.</p>
                    )}
                    {results.map(m => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => pick(m)}
                        className="w-full text-left px-3 py-2 hover:bg-app border-b border-border last:border-0"
                      >
                        <p className="text-sm text-ink font-medium">{m.brandName}</p>
                        <p className="text-xs text-ink-soft">{m.saltComposition} · {m.strength} · MRP ₹{m.mrp}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-ink-soft">Quantity</label>
              <input
                required
                type="number"
                min="0"
                max="100000"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                className="w-full h-10 mt-1 px-3 rounded-lg border border-border bg-app text-sm outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-ink-soft">Price (₹){selected ? ` · max ${selected.mrp}` : ''}</label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                max={selected ? selected.mrp : undefined}
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full h-10 mt-1 px-3 rounded-lg border border-border bg-app text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-ink-soft">Expiry date (optional)</label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={e => setForm({ ...form, expiryDate: e.target.value })}
              className="w-full h-10 mt-1 px-3 rounded-lg border border-border bg-app text-sm outline-none"
            />
          </div>

          <p className="text-[11px] text-ink-soft">If you already stock this medicine, its quantity and price are updated.</p>

          {error && <p className="text-xs text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving…' : 'Save to Inventory'}
          </button>
        </form>
      </div>
    </div>
  );
}