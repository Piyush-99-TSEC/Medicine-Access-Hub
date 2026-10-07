import { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { bulkInventoryApi } from '../../api/client';
import RequestMedicineModal from './RequestMedicineModal.js';

const FIELDS = [
  ['brandName', 'Brand name *'],
  ['strength', 'Strength'],
  ['quantity', 'Quantity (shelf count) *'],
  ['price', 'Price *'],
  ['expiryDate', 'Expiry date']
];
const GUESS = {
  brandName: ['brand', 'medicine', 'item', 'product', 'drug', 'name'],
  strength: ['strength', 'power', 'dose'],
  quantity: ['qty', 'quantity', 'stock', 'balance', 'closing', 'units'],
  price: ['price', 'mrp', 'rate', 'sale'],
  expiryDate: ['expiry', 'exp']
};
const MAP_KEY = 'bulkUploadMapping';
const MAX_ROWS = 2000;
const STATUS_STYLE = {
  CREATE: 'text-success', UPDATE: 'text-success', NOT_IN_CATALOGUE: 'text-warning', INVALID: 'text-danger'
};

async function readFile(file) {
  if (file.name.toLowerCase().endsWith('.csv')) {
    return new Promise((resolve, reject) =>
      Papa.parse(file, { header: true, skipEmptyLines: true, complete: r => resolve(r.data), error: reject }));
  }
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false, dateNF: 'yyyy-mm-dd' });
}

function guessMapping(headers) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(MAP_KEY) || '{}'); } catch { saved = {}; }
  const map = {};
  FIELDS.forEach(([field]) => {
    if (saved[field] && headers.includes(saved[field])) {
      map[field] = saved[field];
      return;
    }
    let found = '';
    for (const key of GUESS[field]) {
      found = headers.find(h => h.toLowerCase().includes(key));
      if (found) break;
    }
    map[field] = found || '';
  });
  return map;
}

function toNumber(v) {
  const s = String(v ?? '').replace(/[₹,\s]/g, '');
  const n = Number(s);
  return s === '' || Number.isNaN(n) ? null : n;
}

// dd/mm/yyyy or dd-mm-yyyy -> yyyy-mm-dd; anything else is passed on and checked by the backend
// Accepts yyyyMMdd, yyyy/mm/dd and dd/mm/yyyy (also with - or .) and returns yyyy-mm-dd.
// Anything else is passed on and checked by the backend.
function toDate(v) {
  const s = String(v ?? '').trim();
  let m = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : s;
}
function downloadTemplate() {
  const csv = 'Brand Name,Strength,Quantity,Price,Expiry Date\nParacetamol 500,500mg,40,25,2027-06-30\n';
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'stock-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function BulkUploadModal({ open, onClose, onSaved }) {
  const { currentUser, showToast } = useApp();
  const token = currentUser?.token;

  const [step, setStep] = useState('pick'); // pick -> map -> preview -> done
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [map, setMap] = useState({});
  const [result, setResult] = useState(null);
  const [onlyProblems, setOnlyProblems] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [requestName, setRequestName] = useState(null);

  if (!open) return null;

  function handleClose() {
    setStep('pick'); setRows([]); setHeaders([]); setMap({}); setResult(null); setError('');
    onClose();
  }

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const data = await readFile(file);
      if (data.length === 0) throw new Error('The file has no rows.');
      if (data.length > MAX_ROWS) throw new Error(`At most ${MAX_ROWS} rows per upload (file has ${data.length}).`);
      const h = Object.keys(data[0]);
      setRows(data);
      setHeaders(h);
      setMap(guessMapping(h));
      setStep('map');
    } catch (err) {
      setError(err.message || 'Could not read the file.');
    }
  }

  function payload() {
    return rows.map(r => ({
      brandName: String(r[map.brandName] ?? '').trim(),
      strength: map.strength ? String(r[map.strength] ?? '').trim() : '',
      quantity: toNumber(r[map.quantity]),
      price: toNumber(r[map.price]),
      expiryDate: map.expiryDate ? toDate(r[map.expiryDate]) : ''
    }));
  }

  async function preview() {
    if (!map.brandName || !map.quantity || !map.price) {
      setError('Map the brand name, quantity and price columns.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await bulkInventoryApi.upload(payload(), true, token);
      localStorage.setItem(MAP_KEY, JSON.stringify(map));
      setResult(res);
      setOnlyProblems(res.notInCatalogue + res.invalid > 0);
      setStep('preview');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    setBusy(true);
    setError('');
    try {
      const res = await bulkInventoryApi.upload(payload(), false, token);
      setResult(res);
      setStep('done');
      showToast(`Stock updated: ${res.created + res.updated} rows.`, 'success');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const applicable = result ? result.created + result.updated : 0;
  const shown = result
    ? result.rows.filter(r => !onlyProblems || r.status === 'NOT_IN_CATALOGUE' || r.status === 'INVALID').slice(0, 300)
    : [];

  return (
    <>
      <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-ink/40 p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface shadow-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-display font-semibold text-ink text-[15px]">Upload stock</h3>
            <button onClick={handleClose} className="text-ink-soft hover:text-ink"><X size={18} /></button>
          </div>

          <div className="p-5 flex flex-col gap-4">
            {step === 'pick' && (
              <>
                <p className="text-sm text-ink-soft">
                  Upload your stock export (CSV or Excel). Quantity is what is on the shelf now, so uploading the same file twice is safe.
                </p>
                <input type="file" accept=".csv,.xlsx,.xls" onChange={onFile} className="text-sm" />
                <button onClick={downloadTemplate} className="self-start text-xs text-primary font-medium">Download template</button>
              </>
            )}

            {step === 'map' && (
              <>
                <p className="text-sm text-ink-soft">{rows.length} rows found. Check which column is which:</p>
                {FIELDS.map(([field, label]) => (
                  <label key={field} className="flex items-center justify-between gap-3 text-xs text-ink-soft">
                    {label}
                    <select
                      value={map[field] || ''}
                      onChange={e => setMap({ ...map, [field]: e.target.value })}
                      className="h-9 w-56 px-2 rounded-lg border border-border bg-app text-sm text-ink"
                    >
                      <option value="">— not in file —</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </label>
                ))}
                <button onClick={preview} disabled={busy} className="h-10 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-60">
                  {busy ? 'Checking…' : 'Preview'}
                </button>
              </>
            )}

            {(step === 'preview' || step === 'done') && result && (
              <>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-app p-2"><p className="text-lg font-semibold text-success">{result.created}</p>New</div>
                  <div className="rounded-lg bg-app p-2"><p className="text-lg font-semibold text-success">{result.updated}</p>Updated</div>
                  <div className="rounded-lg bg-app p-2"><p className="text-lg font-semibold text-warning">{result.notInCatalogue}</p>Not in catalogue</div>
                  <div className="rounded-lg bg-app p-2"><p className="text-lg font-semibold text-danger">{result.invalid}</p>Invalid</div>
                </div>

                <label className="flex items-center gap-2 text-xs text-ink-soft">
                  <input type="checkbox" checked={onlyProblems} onChange={e => setOnlyProblems(e.target.checked)} />
                  Show only rows that need attention
                </label>

                <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
                  <table className="w-full text-xs">
                    <tbody>
                      {shown.map(r => (
                        <tr key={r.rowNumber} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 text-ink-soft">#{r.rowNumber}</td>
                          <td className="px-3 py-2 text-ink">{r.brandName} {r.strength}</td>
                          <td className={`px-3 py-2 font-medium ${STATUS_STYLE[r.status]}`}>{r.status.replaceAll('_', ' ')}</td>
                          <td className="px-3 py-2 text-ink-soft">{r.message}</td>
                          <td className="px-3 py-2">
                            {r.status === 'NOT_IN_CATALOGUE' && (
                              <button onClick={() => setRequestName(r.brandName)} className="text-primary font-medium">Request</button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {shown.length === 0 && (
                        <tr><td className="px-3 py-4 text-center text-ink-soft">Nothing to show.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {step === 'preview' && (
                  <div className="flex gap-2">
                    <button onClick={() => setStep('map')} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-ink-soft">Back</button>
                    <button onClick={apply} disabled={busy || applicable === 0} className="flex-1 h-10 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50">
                      {busy ? 'Saving…' : `Apply ${applicable} rows`}
                    </button>
                  </div>
                )}
                {step === 'done' && (
                  <button onClick={handleClose} className="h-10 rounded-lg bg-primary text-white text-sm font-medium">Done</button>
                )}
              </>
            )}

            {error && <p className="text-xs text-danger">{error}</p>}
          </div>
        </div>
      </div>

      {requestName !== null && (
        <RequestMedicineModal
          initialName={requestName}
          onClose={() => setRequestName(null)}
          onDone={() => setRequestName(null)}
        />
      )}
    </>
  );
}