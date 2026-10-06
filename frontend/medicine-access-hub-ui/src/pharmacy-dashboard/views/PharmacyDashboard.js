import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Boxes, ClipboardList, MapPinned, Check, X, Clock3, AlertTriangle, Search } from 'lucide-react';
import InventoryTable from '../components/InventoryTable.js';
import InventoryStockChart from '../components/InventoryStockChart.js';
import SalesReservationChart from '../components/SalesReservationChart.js';
import UnmetDemandHeatmap from '../components/UnmetDemandHeatmap.js';
import { useApp } from '../../context/AppContext.js';
import { MEDICINES, MEDICINE_SEARCH_DEMAND, UNMET_DEMAND_CLUSTERS, UNMET_DEMAND_TREND } from '../../mock/mockData';
import Badge, { stockBadgeLabel, stockBadgeVariant } from '../../components/Badge.js';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import { ownerInventoryApi, ownerReservationApi } from '../../api/client';
import { pharmacyApi } from '../../api/client';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const TABS = [
  { key: 'inventory', label: 'Inventory', icon: Boxes },
  { key: 'reservations', label: 'Reservations', icon: ClipboardList },
  // { key: 'unmet-demand', label: 'Unmet Demand', icon: MapPinned }
];
const VALID_TABS = TABS.map(t => t.key);

const STATUS_VARIANT = { PENDING: 'warning', CONFIRMED: 'success', REJECTED: 'danger', EXPIRED: 'neutral', COLLECTED: 'info' };

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}
function timeAgo(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function SummaryCard({ label, value, tone = 'default' }) {
  const toneClass = { default: 'text-ink', warning: 'text-warning', danger: 'text-danger' }[tone];
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <p className={`text-2xl font-display font-semibold ${toneClass}`}>{value}</p>
      <p className="text-xs text-ink-soft mt-0.5">{label}</p>
    </div>
  );
}

// function InventoryTab({ pharmacyId }) {
//   // const { inventory } = useApp();
//   const { inventory, currentUser } = useApp();
//   const [summary, setSummary] = useState(null);
//   const [summaryKey, setSummaryKey] = useState(0);

//   useEffect(() => {
//     let cancelled = false;
//     ownerInventoryApi
//       .summary(currentUser?.token)
//       .then(data => { if (!cancelled) setSummary(data); })
//       .catch(() => { if (!cancelled) setSummary(null); });
//     return () => { cancelled = true; };
//   }, [currentUser?.token, summaryKey]);

//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('ALL');
//   const [expiryFilter, setExpiryFilter] = useState('ALL');

//   const rows = useMemo(
//     () => inventory.filter(inv => inv.pharmacyId === pharmacyId).map(inv => ({ ...inv, medicine: MEDICINES.find(m => m.id === inv.medicineId) })).filter(r => r.medicine),
//     [inventory, pharmacyId]
//   );

//   // const totalMedicines = rows.length;
//   // const totalStock = rows.reduce((s, r) => s + r.quantity, 0);
//   // const lowStock = rows.filter(r => r.status === 'LOW_STOCK').length;
//   // const outOfStock = rows.filter(r => r.status === 'OUT_OF_STOCK').length;
//   // const expiringSoon = rows.filter(r => { const d = daysUntil(r.expiryDate); return d >= 0 && d <= 30; }).length;
//   const totalMedicines = summary?.totalMedicines ?? 0;
//   const totalStock = summary?.totalUnits ?? 0;
//   const lowStock = summary?.lowStock ?? 0;
//   const outOfStock = summary?.outOfStock ?? 0;
//   const expiringSoon = summary?.expiringSoon ?? 0;

//   const lowStockAlerts = rows.filter(r => r.status === 'LOW_STOCK' || r.status === 'OUT_OF_STOCK');

//   const demandRows = rows.map(r => {
//     const demand = MEDICINE_SEARCH_DEMAND[r.medicineId] || 0;
//     let recommendation = 'Sufficient';
//     if (r.quantity === 0 && demand > 0) recommendation = 'Restock urgently';
//     else if (demand > r.quantity) recommendation = 'Restock soon';
//     return { ...r, demand, recommendation };
//   });

//   return (
//     <div className="flex flex-col gap-5">
//       <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
//         <SummaryCard label="Total Medicines" value={totalMedicines} />
//         <SummaryCard label="Total Stock (units)" value={totalStock} />
//         <SummaryCard label="Low Stock" value={lowStock} tone="warning" />
//         <SummaryCard label="Out of Stock" value={outOfStock} tone="danger" />
//         <SummaryCard label="Expiring Soon (30d)" value={expiringSoon} tone="warning" />
//       </div>

//       {lowStockAlerts.length > 0 && (
//         <div className="rounded-2xl border border-warning/25 bg-warning/5 p-4">
//           <p className="flex items-center gap-1.5 text-sm font-medium text-ink mb-2">
//             <AlertTriangle size={15} className="text-warning" /> Low Stock Alerts
//           </p>
//           <div className="flex flex-wrap gap-2">
//             {lowStockAlerts.map(r => (
//               <span key={r.id} className="text-xs px-2.5 py-1 rounded-lg bg-surface border border-warning/30 text-ink">
//                 {r.medicine.brand} — {r.quantity} left
//               </span>
//             ))}
//           </div>
//         </div>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <InventoryStockChart inventory={inventory} pharmacyId={pharmacyId} />
//         <SalesReservationChart />
//       </div>

//       <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
//         <h3 className="font-display font-semibold text-ink text-[15px] mb-3">Medicine Demand vs Current Stock</h3>
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="text-ink-soft text-xs uppercase tracking-wide border-b border-border">
//                 <th className="text-left font-medium px-3 py-2">Medicine</th>
//                 <th className="text-left font-medium px-3 py-2">Current Stock</th>
//                 <th className="text-left font-medium px-3 py-2">Demand (searches)</th>
//                 <th className="text-left font-medium px-3 py-2">Recommendation</th>
//               </tr>
//             </thead>
//             <tbody>
//               {demandRows.map(r => (
//                 <tr key={r.id} className="border-b border-border last:border-0">
//                   <td className="px-3 py-2 font-medium text-ink">{r.medicine.brand}</td>
//                   <td className="px-3 py-2 text-ink-soft">{r.quantity}</td>
//                   <td className="px-3 py-2 text-ink-soft">{r.demand}</td>
//                   <td className="px-3 py-2">
//                     <Badge variant={r.recommendation === 'Sufficient' ? 'success' : r.recommendation === 'Restock soon' ? 'warning' : 'danger'}>
//                       {r.recommendation}
//                     </Badge>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <div>
//         <h3 className="font-display font-semibold text-ink text-[15px] mb-3">Expiry Management</h3>
//         <div className="flex gap-2 mb-3 flex-wrap">
//           {[['ALL', 'All'], ['7', 'Next 7 days'], ['30', 'Next 30 days'], ['90', 'Next 90 days'], ['EXPIRED', 'Expired']].map(([val, label]) => (
//             <button
//               key={val}
//               onClick={() => setExpiryFilter(val)}
//               className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${expiryFilter === val ? 'bg-primary text-white border-primary' : 'bg-app text-ink-soft border-border hover:border-primary/40'}`}
//             >
//               {label}
//             </button>
//           ))}
//         </div>

//         <div className="flex flex-col sm:flex-row gap-2 mb-3">
//           <div className="relative flex-1 max-w-xs">
//             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
//             <input
//               value={searchTerm}
//               onChange={e => setSearchTerm(e.target.value)}
//               placeholder="Search medicine or salt…"
//               className="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-app text-sm outline-none focus:border-primary/50"
//             />
//           </div>
//           <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-app text-sm outline-none focus:border-primary/50">
//             <option value="ALL">All stock levels</option>
//             <option value="IN_STOCK">In Stock</option>
//             <option value="LOW_STOCK">Low Stock</option>
//             <option value="OUT_OF_STOCK">Out of Stock</option>
//           </select>
//         </div>

//         {/* <InventoryTable pharmacyId={pharmacyId} searchTerm={searchTerm} statusFilter={statusFilter} expiryFilter={expiryFilter} /> */}
//         <InventoryTable searchTerm={searchTerm} statusFilter={statusFilter} onChanged={() => setSummaryKey(k => k + 1)} />
//       </div>
//     </div>
//   );
// }
function InventoryTab() {
  const { currentUser } = useApp();
  const token = currentUser?.token;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expiryFilter, setExpiryFilter] = useState('ALL');
  const [summary, setSummary] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // summary cards, chart and alerts all come from the backend; refreshKey reloads them after any stock change
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      ownerInventoryApi.summary(token),
      ownerInventoryApi.list({ status: 'LOW_STOCK', size: 8 }, token)
    ])
      .then(([sum, low]) => {
        if (!cancelled) {
          setSummary(sum);
          setLowStockItems(low.content);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSummary(null);
          setLowStockItems([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token, refreshKey]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard label="Total Medicines" value={summary?.totalMedicines ?? 0} />
        <SummaryCard label="Total Stock (units)" value={summary?.totalUnits ?? 0} />
        <SummaryCard label="Low Stock" value={summary?.lowStock ?? 0} tone="warning" />
        <SummaryCard label="Out of Stock" value={summary?.outOfStock ?? 0} tone="danger" />
        <SummaryCard label="Expiring Soon (30d)" value={summary?.expiringSoon ?? 0} tone="warning" />
      </div>

      {lowStockItems.length > 0 && (
        <div className="rounded-2xl border border-warning/25 bg-warning/5 p-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-ink mb-2">
            <AlertTriangle size={15} className="text-warning" /> Low Stock Alerts
          </p>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map(r => (
              <span key={r.id} className="text-xs px-2.5 py-1 rounded-lg bg-surface border border-warning/30 text-ink">
                {r.brandName} — {r.quantity} left
              </span>
            ))}
            {summary && summary.lowStock > lowStockItems.length && (
              <button
                onClick={() => setStatusFilter('LOW_STOCK')}
                className="text-xs px-2.5 py-1 rounded-lg text-primary font-medium"
              >
                +{summary.lowStock - lowStockItems.length} more
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InventoryStockChart summary={summary} />
        <SalesReservationChart />
      </div>

      <div>
        <h3 className="font-display font-semibold text-ink text-[15px] mb-3">Expiry Management</h3>
        <div className="flex gap-2 mb-3 flex-wrap">
          {[['ALL', 'All'], ['7', 'Next 7 days'], ['30', 'Next 30 days'], ['90', 'Next 90 days'], ['EXPIRED', 'Expired']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setExpiryFilter(val)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${expiryFilter === val ? 'bg-primary text-white border-primary' : 'bg-app text-ink-soft border-border hover:border-primary/40'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search medicine or salt…"
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-app text-sm outline-none focus:border-primary/50"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-app text-sm outline-none focus:border-primary/50">
            <option value="ALL">All stock levels</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>

        <InventoryTable
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          expiryFilter={expiryFilter}
          onChanged={() => setRefreshKey(k => k + 1)}
        />
      </div>
    </div>
  );
}

function ReservationRequests() {
  const { currentUser } = useApp();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  // Shows PENDING + CONFIRMED; polls so new customer requests appear on their own
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      ownerReservationApi
        .list(null, currentUser?.token)
        .then(data => { if (!cancelled) setRows(data); })
        .catch(err => { if (!cancelled) setError(err.message); })
        .finally(() => { if (!cancelled) setLoading(false); });
    load();
    const t = setInterval(load, 15000);
    return () => { cancelled = true; clearInterval(t); };
  }, [currentUser?.token, tick]);

  async function act(fn, id) {
    setError('');
    try {
      await fn(id, currentUser.token);
      setTick(t => t + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-danger">{error}</p>}
      {!loading && rows.length === 0 && <div className="rounded-xl border border-dashed border-border p-6 text-sm text-ink-soft text-center">No active reservation requests.</div>}
      {rows.map(r => (
        <div key={r.id} className="rounded-2xl border border-border bg-surface p-4 shadow-card flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-ink text-sm">{r.medicineName}</p>
              <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
            </div>
            <p className="text-xs text-ink-soft mt-1">{r.customerName} · {r.customerPhone} · Qty {r.quantity}</p>
            <p className="text-[11px] text-ink-soft flex items-center gap-1 mt-0.5">
              <Clock3 size={11} /> Requested {timeAgo(new Date(r.createdAt).getTime())}
              {r.status === 'CONFIRMED' && ` · Collect by ${new Date(r.pickupBy).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          </div>
          {r.status === 'PENDING' && (
            <div className="flex gap-2 shrink-0">
              <button onClick={() => act(ownerReservationApi.accept, r.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success text-white text-xs font-medium hover:bg-success/90 transition-colors"><Check size={13} /> Accept</button>
              <button onClick={() => act(ownerReservationApi.reject, r.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-danger/30 text-danger text-xs font-medium hover:bg-danger/5 transition-colors"><X size={13} /> Reject</button>
            </div>
          )}
          {r.status === 'CONFIRMED' && (
            <button onClick={() => act(ownerReservationApi.collect, r.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors shrink-0"><Check size={13} /> Mark collected</button>
          )}
        </div>
      ))}
    </div>
  );
}

function UnmetDemandTab() {
  const failedSearches = UNMET_DEMAND_CLUSTERS.reduce((s, c) => s + c.searchCount, 0);
  const affectedUsers = UNMET_DEMAND_CLUSTERS.reduce((s, c) => s + c.distinctUsers, 0);
  const highPriority = UNMET_DEMAND_CLUSTERS.filter(c => c.searchCount >= 20).length;
  const top5 = [...UNMET_DEMAND_CLUSTERS].sort((a, b) => b.searchCount - a.searchCount).slice(0, 5);

  const trendData = {
    labels: UNMET_DEMAND_TREND.map(d => d.day),
    datasets: [{ label: 'Failed searches', data: UNMET_DEMAND_TREND.map(d => d.count), borderColor: '#DC2626', backgroundColor: 'rgba(220,38,38,0.1)', fill: true, tension: 0.35, pointRadius: 3 }]
  };
  const trendOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0F172A', padding: 10, cornerRadius: 8 } },
    scales: { x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#64748B' } }, y: { beginAtZero: true, grid: { color: '#E2E8F0' }, ticks: { font: { size: 11 }, color: '#64748B' } } }
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-ink-soft">DBSCAN parameters: ε = 500m · MinPts = 10 · window = last 7 days</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Failed Searches" value={failedSearches} />
        <SummaryCard label="Affected Users" value={affectedUsers} />
        <SummaryCard label="Demand Clusters" value={UNMET_DEMAND_CLUSTERS.length} />
        <SummaryCard label="High Priority" value={highPriority} tone="danger" />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
        <h3 className="font-display font-semibold text-ink text-[15px] mb-3">7-Day Failed Search Trend</h3>
        <div className="h-56"><Line data={trendData} options={trendOptions} /></div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
        <h3 className="font-display font-semibold text-ink text-[15px] mb-3">Top 5 Unavailable Medicines</h3>
        <div className="flex flex-col gap-2">
          {top5.map((c, i) => (
            <div key={c.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
              <span className="flex items-center gap-2"><Badge variant="primary">#{i + 1}</Badge><span className="font-medium text-ink">{c.medicineName}</span></span>
              <span className="text-ink-soft text-xs">{c.searchCount} searches · {c.distinctUsers} users · {c.nearestPharmacyKm}km to nearest stock</span>
            </div>
          ))}
        </div>
      </div>

      <UnmetDemandHeatmap />
    </div>
  );
}

export default function PharmacyDashboard() {
  const { tab } = useParams();
  const navigate = useNavigate();
  // const { reservations, currentUser } = useApp();
  const { currentUser } = useApp();
  const [pendingCount, setPendingCount] = useState(0);
  const [myPharmacy, setMyPharmacy] = useState(null);

  useEffect(() => {
    let cancelled = false;
    pharmacyApi
      .me(currentUser?.token)
      .then(data => { if (!cancelled) setMyPharmacy(data); })
      .catch(() => { if (!cancelled) setMyPharmacy(null); });
    return () => { cancelled = true; };
  }, [currentUser?.token]);

  useEffect(() => {
    const load = () =>
      ownerReservationApi
        .list('PENDING', currentUser?.token)
        .then(data => setPendingCount(data.length))
        .catch(() => {});
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [currentUser?.token]);

  const pharmacyId = currentUser?.pharmacyId || 'ph_1';
  const activeTab = VALID_TABS.includes(tab) ? tab : 'inventory';
  // const pendingCount = reservations.filter(r => r.pharmacyId === pharmacyId && r.status === 'PENDING').length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display font-semibold text-xl text-ink">Pharmacy Dashboard</h1>
        {/* <p className="text-sm text-ink-soft mt-0.5">Wellness Plus Pharmacy · FC Road, Shivajinagar</p> */}
        <p className="text-sm text-ink-soft mt-0.5">
          {myPharmacy ? `${myPharmacy.name} · ${myPharmacy.address}` : 'Loading pharmacy...'}
        </p>
      </div>

      <div className="flex gap-1.5 border-b border-border">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => navigate(`/pharmacy-dashboard/${t.key}`)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${active ? 'border-primary text-primary' : 'border-transparent text-ink-soft hover:text-ink'}`}
            >
              <Icon size={15} />
              {t.label}
              {t.key === 'reservations' && pendingCount > 0 && (
                <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] flex items-center justify-center">{pendingCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'inventory' && <InventoryTab pharmacyId={pharmacyId} />}
      {activeTab === 'reservations' && <ReservationRequests />}
      {/* {activeTab === 'unmet-demand' && <UnmetDemandTab />} */}
    </div>
  );
}
