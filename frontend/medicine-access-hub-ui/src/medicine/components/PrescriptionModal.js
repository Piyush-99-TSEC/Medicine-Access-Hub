import { useState } from 'react';
import { X, UploadCloud, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { medicineApi } from '../../api/client';
import { toUiMedicine } from '../../utils/medicineMapper';

export default function PrescriptionModal({ open, onClose, onConfirm }) {
  const { currentUser } = useApp();
  const token = currentUser?.token;
  const [step, setStep] = useState('UPLOAD');
  const [rows, setRows] = useState([]);
  const [source, setSource] = useState('ocr');
  const [error, setError] = useState('');

  if (!open) return null;

  function reset() {
    setStep('UPLOAD');
    setRows([]);
    setError('');
  }

  async function handleFile(file) {
    if (!file) return;
    setError('');
    setStep('PROCESSING');
    try {
      const data = await medicineApi.prescription(file, token);
      setSource(data.source);
      setRows(
        data.items.map(item => {
          const candidates = item.candidates.map(c => ({ med: toUiMedicine(c.medicine), confidence: c.confidence }));
          return {
            query: item.query,
            candidates,
            selectedId: item.matched && candidates.length ? String(candidates[0].med.id) : ''
          };
        })
      );
      setStep('REVIEW');
    } catch (err) {
      setError(err.message);
      setStep('UPLOAD');
    }
  }

  function setSelected(index, value) {
    setRows(prev => prev.map((r, i) => (i === index ? { ...r, selectedId: value } : r)));
  }

  function handleConfirm() {
    const chosen = [];
    rows.forEach(r => {
      const c = r.candidates.find(x => String(x.med.id) === r.selectedId);
      if (c && !chosen.some(m => m.id === c.med.id)) chosen.push(c.med);
    });
    reset();
    onConfirm(chosen);
  }

  function handleClose() {
    reset();
    onClose();
  }

  const selectedCount = rows.filter(r => r.selectedId !== '').length;

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-surface shadow-card animate-fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText size={17} className="text-primary" />
            <h3 className="font-display font-semibold text-ink text-[15px]">Upload Prescription</h3>
          </div>
          <button onClick={handleClose} className="text-ink-soft hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {step === 'UPLOAD' && (
            <div className="flex flex-col gap-3">
              {error && (
                <p className="rounded-lg border border-danger/25 bg-danger/5 px-3 py-2 text-xs text-danger">{error}</p>
              )}
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl h-52 cursor-pointer hover:border-primary/40 hover:bg-primary-tint/40 transition-colors">
                <UploadCloud size={28} className="text-primary" />
                <p className="text-sm font-medium text-ink">Drop a photo, or click to upload</p>
                <p className="text-xs text-ink-soft">JPG or PNG · Printed or handwritten · Max 5 MB</p>
                <input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
              </label>
            </div>
          )}

          {step === 'PROCESSING' && (
            <div className="flex flex-col items-center gap-3 py-10">
              <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-ink-soft">Reading prescription… this can take up to 30 seconds</p>
            </div>
          )}

          {step === 'REVIEW' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-ink-soft">
                Check each medicine before continuing. Pick the right match, or skip a line.
                {source === 'vision' && ' Handwriting was read by an AI model, so check carefully.'}
              </p>

              {rows.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-ink-soft">
                  No medicines found in this photo.
                </p>
              ) : (
                <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
                  {rows.map((r, i) => (
                    <div key={i} className="rounded-xl border border-border p-3">
                      <p className="text-[11px] text-ink-soft">Read from prescription</p>
                      <p className="text-sm font-medium text-ink mb-2">{r.query}</p>
                      {r.candidates.length > 0 ? (
                        <select
                          value={r.selectedId}
                          onChange={e => setSelected(i, e.target.value)}
                          className="w-full rounded-lg border border-border bg-app px-2.5 py-2 text-xs text-ink"
                        >
                          <option value="">Skip this line</option>
                          {r.candidates.map(c => (
                            <option key={c.med.id} value={String(c.med.id)}>
                              {c.med.brand} · {c.med.strength} ({Math.round(c.confidence * 100)}%)
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-xs text-ink-soft">No match found for this line.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button onClick={reset} className="text-xs font-medium text-primary">
                  Upload again
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={selectedCount === 0}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Confirm {selectedCount} {selectedCount === 1 ? 'medicine' : 'medicines'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}