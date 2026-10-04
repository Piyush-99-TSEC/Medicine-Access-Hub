import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Database, BarChart3, Search, ShieldAlert, FileClock, Download, FileText } from 'lucide-react';
import PharmacyVerificationCard from '../components/PharmacyVerificationCard.js';
import SystemAnalyticsChart from '../components/SystemAnalyticsChart.js';
import UnmetDemandClusterChart from '../components/UnmetDemandClusterChart.js';
import { useApp } from '../../context/AppContext.js';
import { MEDICINES, UNMET_DEMAND_CLUSTERS, ADMIN_ACTIVITY_LOG, ADMIN_REPORTS } from '../../mock/mockData';
import Badge from '../../components/Badge.js';
import { adminPharmacyApi } from '../../api/client.js';

const TABS = [
  { key: 'verification', label: 'Pharmacy Verification', icon: ShieldCheck },
  { key: 'medicines', label: 'Medicine Master Data', icon: Database },
  { key: 'metrics', label: 'System Metrics', icon: BarChart3 },
  { key: 'audit-reports', label: 'Audit & Reports', icon: FileClock }
];
const VALID_TABS = TABS.map(t => t.key);

function VerificationTab() {
  const { currentUser, showToast } = useApp();
  const token = currentUser?.token;
  const [pending, setPending] = useState([]);
  const [verified, setVerified] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [p, v, r] = await Promise.all([
        adminPharmacyApi.list('PENDING', token),
        adminPharmacyApi.list('VERIFIED', token),
        adminPharmacyApi.list('REJECTED', token)
      ]);
      setPending(p);
      setVerified(v);
      setRejected(r);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function decide(id, approve) {
    try {
      if (approve) await adminPharmacyApi.verify(id, token);
      else await adminPharmacyApi.reject(id, token);
      showToast(approve ? 'Pharmacy approved.' : 'Pharmacy registration rejected.', approve ? 'success' : 'danger');
      await load();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <div className="rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</div>}
      {loading && <p className="text-sm text-ink-soft">Loading pharmacies…</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pending Verification', value: pending.length },
          { label: 'Verified Pharmacies', value: verified.length },
          { label: 'Rejected Pharmacies', value: rejected.length },
          { label: 'Total Pharmacies', value: pending.length + verified.length + rejected.length }
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-4 shadow-card">
            <p className="text-2xl font-display font-semibold text-ink">{s.value}</p>
            <p className="text-xs text-ink-soft mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-display font-semibold text-ink text-[15px] mb-3">Pending Verification ({pending.length})</h2>
        {!loading && pending.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-6 text-sm text-ink-soft text-center">
            No pharmacies awaiting verification.
          </div>
        )}
        <div className="flex flex-col gap-3">
          {pending.map(p => (
            <PharmacyVerificationCard
              key={p.id}
              pharmacy={p}
              onApprove={() => decide(p.id, true)}
              onReject={() => decide(p.id, false)}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display font-semibold text-ink text-[15px] mb-3">Verified Pharmacies ({verified.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {verified.map(p => (
            <div key={p.id} className="rounded-xl border border-border bg-surface p-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">{p.name}</p>
                <p className="text-xs text-ink-soft">{p.licenceNo}</p>
              </div>
              <Badge variant="success"><ShieldCheck size={11} /> Verified</Badge>
            </div>
          ))}
        </div>
      </div>

       <div>
        <h2 className="font-display font-semibold text-ink text-[15px] mb-3">Pending Verification ({pending.length})</h2>
        {!loading && pending.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-6 text-sm text-ink-soft text-center">
            No pharmacies awaiting verification.
          </div>
        )}
        <div className="flex flex-col gap-3">
          {pending.map(p => (
            <PharmacyVerificationCard
              key={p.id}
              pharmacy={p}
              onApprove={() => decide(p.id, true)}
              onReject={() => decide(p.id, false)}
            />
          ))}
          <div>
            <h2 className="font-display font-semibold text-ink text-[15px] mb-3">Rejected Pharmacies ({rejected.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rejected.map(p => (
                <div key={p.id} className="rounded-xl border border-border bg-surface p-3.5">
                  <p className="text-sm font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-ink-soft">{p.licenceNo} · {p.ownerName} · {p.contactPhone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>    
  );
}

function MasterDataTab() {
  const [q, setQ] = useState('');
  const rows = MEDICINES.filter(m => {
    const term = q.toLowerCase();
    return m.brand.toLowerCase().includes(term) || m.generic.toLowerCase().includes(term) || m.salt.toLowerCase().includes(term);
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filter master medicine data…" className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-app text-sm outline-none focus:border-primary/50" />
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-app text-ink-soft text-xs uppercase tracking-wide">
              <th className="text-left font-medium px-4 py-3">Brand</th>
              <th className="text-left font-medium px-4 py-3">Salt Composition</th>
              <th className="text-left font-medium px-4 py-3">Strength</th>
              <th className="text-left font-medium px-4 py-3">Form</th>
              <th className="text-left font-medium px-4 py-3">Manufacturer</th>
              <th className="text-left font-medium px-4 py-3">MRP</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(m => (
              <tr key={m.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-ink">{m.brand}</td>
                <td className="px-4 py-3 text-ink-soft">{m.salt}</td>
                <td className="px-4 py-3 text-ink-soft">{m.strength}</td>
                <td className="px-4 py-3 text-ink-soft">{m.form}</td>
                <td className="px-4 py-3 text-ink-soft">{m.manufacturer}</td>
                <td className="px-4 py-3 text-ink-soft">₹{m.mrp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricsTab() {
  const { pharmacies, reservations, inventory, verifications } = useApp();
  const totalUnits = inventory.reduce((sum, i) => sum + i.quantity, 0);
  const activeReservations = reservations.filter(r => r.status === 'PENDING' || r.status === 'CONFIRMED').length;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Registered Pharmacies', value: pharmacies.length },
          { label: 'Medicines in Master Table', value: MEDICINES.length },
          { label: 'Active Reservations', value: activeReservations },
          { label: 'Total Units Stocked', value: totalUnits }
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-4 shadow-card">
            <p className="text-2xl font-display font-semibold text-ink">{s.value}</p>
            <p className="text-xs text-ink-soft mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SystemAnalyticsChart pharmacies={pharmacies} pendingCount={verifications.length} />
        <UnmetDemandClusterChart />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
        <h3 className="font-display font-semibold text-ink text-[15px] mb-3">System-wide unmet demand</h3>
        <div className="flex flex-col gap-2">
          {UNMET_DEMAND_CLUSTERS.map(c => (
            <div key={c.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
              <span className="text-ink font-medium">{c.medicineName}</span>
              <span className="text-ink-soft text-xs">{c.searchCount} failed searches · {c.distinctUsers} users affected</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuditReportsTab() {
  const { showToast } = useApp();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display font-semibold text-ink text-[15px] mb-3">Recent Admin Activity</h2>
        <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-app text-ink-soft text-xs uppercase tracking-wide">
                <th className="text-left font-medium px-4 py-3">Date &amp; Time</th>
                <th className="text-left font-medium px-4 py-3">Admin</th>
                <th className="text-left font-medium px-4 py-3">Action</th>
                <th className="text-left font-medium px-4 py-3">Module</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_ACTIVITY_LOG.map(log => (
                <tr key={log.id} className="border-t border-border">
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{log.dateTime}</td>
                  <td className="px-4 py-3 text-ink">{log.admin}</td>
                  <td className="px-4 py-3 text-ink-soft">{log.action}</td>
                  <td className="px-4 py-3 text-ink-soft">{log.module}</td>
                  <td className="px-4 py-3">
                    <Badge variant={log.status === 'Success' ? 'success' : 'danger'}>{log.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="font-display font-semibold text-ink text-[15px] mb-3">Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ADMIN_REPORTS.map(r => (
            <div key={r.id} className="rounded-2xl border border-border bg-surface p-4 shadow-card flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-tint flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{r.name}</p>
                  <p className="text-xs text-ink-soft mt-0.5">{r.description}</p>
                  <p className="text-[11px] text-ink-soft mt-1">Updated {r.updated}</p>
                </div>
              </div>
              <button
                onClick={() => showToast(`${r.name} download started (simulated).`, 'success')}
                className="p-2 rounded-lg border border-border hover:border-primary/40 text-ink-soft hover:text-primary transition-colors shrink-0"
              >
                <Download size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = VALID_TABS.includes(tab) ? tab : 'verification';

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display font-semibold text-xl text-ink">System Admin Console</h1>
        <p className="text-sm text-ink-soft mt-0.5">Platform-wide oversight for Medicine Access Hub</p>
      </div>

      <div className="flex gap-1.5 border-b border-border overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => navigate(`/admin/${t.key}`)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                active ? 'border-primary text-primary' : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'verification' && <VerificationTab />}
      {activeTab === 'medicines' && <MasterDataTab />}
      {activeTab === 'metrics' && <MetricsTab />}
      {activeTab === 'audit-reports' && <AuditReportsTab />}
    </div>
  );
}
