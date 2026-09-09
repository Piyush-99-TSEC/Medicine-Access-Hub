import { useState } from 'react';
import { X, UploadCloud, ScanLine, CheckCircle2 } from 'lucide-react';
import { OCR_SIMULATION_RESULTS, MEDICINES } from '../../mock/mockData';

const STEPS = { UPLOAD: 'UPLOAD', PROCESSING: 'PROCESSING', RESULT: 'RESULT' };

export default function StripOcrModal({ open, onClose, onConfirm }) {
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [preview, setPreview] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  if (!open) return null;

  function reset() {
    setStep(STEPS.UPLOAD);
    setPreview(null);
    setScanResult(null);
  }

  function handleFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setStep(STEPS.PROCESSING);

    setTimeout(() => {
      const mock = OCR_SIMULATION_RESULTS[Math.floor(Math.random() * OCR_SIMULATION_RESULTS.length)];
      setScanResult(mock);
      setStep(STEPS.RESULT);
    }, 1400);
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-surface shadow-card animate-fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ScanLine size={17} className="text-primary" />
            <h3 className="font-display font-semibold text-ink text-[15px]">Scan Medicine Strip / Box</h3>
          </div>
          <button onClick={handleClose} className="text-ink-soft hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {step === STEPS.UPLOAD && (
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl h-52 cursor-pointer hover:border-primary/40 hover:bg-primary-tint/40 transition-colors">
              <UploadCloud size={28} className="text-primary" />
              <p className="text-sm font-medium text-ink">Drop a photo, or click to upload</p>
              <p className="text-xs text-ink-soft">JPG or PNG · Strip, box, prescription, or blister pack</p>
              <input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
            </label>
          )}

          {step === STEPS.PROCESSING && (
            <div className="flex flex-col items-center gap-4 py-6">
              {preview && (
                <img src={preview} alt="Uploaded strip" className="w-40 h-40 object-cover rounded-xl border border-border grayscale contrast-125" />
              )}
              <div className="flex items-center gap-2 text-sm text-ink-soft">
                <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                CLAHE contrast enhancement &amp; EasyOCR extraction…
              </div>
              <div className="w-full max-w-xs h-1.5 rounded-full bg-app overflow-hidden">
                <div className="h-full bg-primary animate-pulse w-2/3" />
              </div>
            </div>
          )}

          {step === STEPS.RESULT && scanResult && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                {preview && (
                  <img src={preview} alt="Uploaded strip" className="w-20 h-20 object-cover rounded-lg border border-border shrink-0" />
                )}
                <div>
                  <p className="text-xs text-ink-soft mb-1">Raw extracted tokens</p>
                  <div className="flex flex-wrap gap-1.5">
                    {scanResult.rawTokens.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-app border border-border text-[11px] font-mono text-ink-soft">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-ink-soft mb-2">Confirm the correct match — top {scanResult.candidates.length} candidates</p>
                <div className="flex flex-col gap-2">
                  {scanResult.candidates.map((medId, i) => {
                    const med = MEDICINES.find(m => m.id === medId);
                    if (!med) return null;
                    return (
                      <button
                        key={medId}
                        onClick={() => onConfirm(med)}
                        className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-border hover:border-primary/50 hover:bg-primary-tint/40 transition-colors text-left"
                      >
                        <div>
                          <p className="text-sm font-medium text-ink">{med.brand}</p>
                          <p className="text-xs text-ink-soft">{med.salt} · {med.strength} · {med.manufacturer}</p>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-medium text-primary shrink-0">
                          {Math.round(scanResult.confidence[i] * 100)}%
                          <CheckCircle2 size={14} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-[11px] text-ink-soft">
                None of these correct? Try retaking the photo with better lighting, or search by name instead.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
