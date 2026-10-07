// import { useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Star, Clock, MapPinned, PackageCheck, Info } from 'lucide-react';
// import MedicineSearchCard from '../components/MedicineSearchCard.js';
// import StripOcrModal from '../components/StripOcrModal.js';
// import MedicineDetailModal from '../components/MedicineDetailModal.js';
// import PharmacyMap from '../../map/components/PharmacyMap.js';
// import Badge, { stockBadgeLabel, stockBadgeVariant } from '../../components/Badge.js';
// import { useApp } from '../../context/AppContext.js';
// import { useGeolocation } from '../../hooks/useGeolocation.js';
// import {
//   MEDICINES,
//   haversineKm,
//   simulatedRoadDistanceKm,
//   rankPharmaciesWSM,
//   isPharmacyOpenNow,
//   getSubstitutes
// } from '../../mock/mockData';
// import { buildFuzzyIndex, getFuzzyMatches, FUZZY_MATCH_THRESHOLD } from '../../utils/fuzzyMatch';

// const FUZZY_INDEX = buildFuzzyIndex(MEDICINES);

// export default function SearchResults() {
//   const { inventory, pharmacies } = useApp();
//   const { location } = useGeolocation();
//   const navigate = useNavigate();

//   const [query, setQuery] = useState('');
//   const [radiusKm, setRadiusKm] = useState(5);
//   const [activeMedicineId, setActiveMedicineId] = useState(null);
//   const [ocrOpen, setOcrOpen] = useState(false);
//   const [detailMedicine, setDetailMedicine] = useState(null);
//   const [hasSearched, setHasSearched] = useState(false);
//   const [suggestions, setSuggestions] = useState([]);
//   const [correctedFrom, setCorrectedFrom] = useState(null);

//   function resolveMedicine(rawQuery) {
//     const q = rawQuery.trim().toLowerCase();
//     if (!q) return null;
//     const exact = MEDICINES.find(
//       m => m.brand.toLowerCase() === q || m.generic.toLowerCase() === q || m.salt.toLowerCase() === q
//     );
//     if (exact) return exact;
//     return (
//       MEDICINES.find(
//         m =>
//           m.brand.toLowerCase().includes(q) ||
//           m.generic.toLowerCase().includes(q) ||
//           m.salt.toLowerCase().includes(q) ||
//           q.includes(m.brand.toLowerCase().split(' ')[0])
//       ) || null
//     );
//   }

//   function runSearch(rawQuery) {
//     setQuery(rawQuery);
//     setHasSearched(true);
//     setSuggestions([]);
//     setCorrectedFrom(null);

//     const resolved = resolveMedicine(rawQuery);
//     if (resolved) {
//       setActiveMedicineId(resolved.id);
//       return;
//     }

//     const matches = getFuzzyMatches(rawQuery, FUZZY_INDEX);
//     if (matches.length > 0) {
//       setSuggestions(matches);
//       setActiveMedicineId('NOT_FOUND');
//     } else {
//       setActiveMedicineId('NOT_FOUND');
//     }
//   }

//   function handleSuggestionClick(medicine) {
//     setCorrectedFrom(query);
//     setSuggestions([]);
//     setActiveMedicineId(medicine.id);
//   }

//   const activeMedicine = useMemo(() => MEDICINES.find(m => m.id === activeMedicineId) || null, [activeMedicineId]);

//   const rankedResults = useMemo(() => {
//     if (!activeMedicine) return [];
//     const candidates = inventory
//       .filter(inv => inv.medicineId === activeMedicine.id && inv.quantity > 0)
//       .map(inv => {
//         const pharmacy = pharmacies.find(p => p.id === inv.pharmacyId);
//         if (!pharmacy) return null;
//         const straightKm = haversineKm(location, pharmacy);
//         if (straightKm > radiusKm) return null;
//         return {
//           inventoryId: inv.id,
//           pharmacy,
//           quantity: inv.quantity,
//           price: inv.price,
//           status: inv.status,
//           rating: pharmacy.rating,
//           roadDistanceKm: simulatedRoadDistanceKm(location, pharmacy),
//           isOpenNow: isPharmacyOpenNow(pharmacy)
//         };
//       })
//       .filter(Boolean);
//     return rankPharmaciesWSM(candidates);
//   }, [activeMedicine, inventory, pharmacies, radiusKm, location]);

//   const substitutes = useMemo(() => {
//     if (!activeMedicine || rankedResults.length > 0) return [];
//     return getSubstitutes(activeMedicine.id).filter(sub => inventory.some(inv => inv.medicineId === sub.id && inv.quantity > 0));
//   }, [activeMedicine, rankedResults, inventory]);

//   function handleOcrConfirm(medicine) {
//     setOcrOpen(false);
//     setQuery(medicine.brand);
//     setHasSearched(true);
//     setActiveMedicineId(medicine.id);
//   }

//   function handleSubstituteSearch(medicine) {
//     setDetailMedicine(null);
//     setQuery(medicine.brand);
//     setActiveMedicineId(medicine.id);
//   }

//   function handleReserve(result) {
//     navigate('/reservations/checkout', {
//       state: {
//         pharmacyId: result.pharmacy.id,
//         medicineId: activeMedicine.id,
//         inventoryId: result.inventoryId,
//         price: result.price,
//         maxQuantity: result.quantity
//       }
//     });
//   }

//   return (
//     <div className="flex flex-col gap-5">
//       <MedicineSearchCard
//         query={query}
//         radiusKm={radiusKm}
//         onRadiusChange={setRadiusKm}
//         onSearch={runSearch}
//         onOpenScan={() => setOcrOpen(true)}
//       />

//       {hasSearched && activeMedicineId === 'NOT_FOUND' && suggestions.length > 0 && (
//         <div className="rounded-xl border border-border bg-surface p-4">
//           <p className="text-sm text-ink-soft">
//             No exact match for "<span className="text-ink font-medium">{query}</span>". Did you mean:
//           </p>
//           <div className="flex flex-wrap gap-2 mt-3">
//             {suggestions.map(({ medicine, score }) => (
//               <button
//                 key={medicine.id}
//                 onClick={() => handleSuggestionClick(medicine)}
//                 className="px-3 py-1.5 rounded-lg bg-app border border-border text-xs font-medium text-ink hover:border-primary/40 transition-colors"
//               >
//                 {medicine.brand} <span className="text-ink-soft">· {Math.round(score * 100)}% match</span>
//                 {score >= FUZZY_MATCH_THRESHOLD && <span className="ml-1 text-primary">★</span>}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {hasSearched && activeMedicineId === 'NOT_FOUND' && suggestions.length === 0 && (
//         <div className="rounded-xl border border-border bg-surface p-4 text-sm text-ink-soft">
//           No medicine matched "<span className="text-ink font-medium">{query}</span>". Try the generic or salt name, or use strip scan.
//         </div>
//       )}

//       {activeMedicine && (
//         <>
//           {rankedResults.length === 0 && substitutes.length > 0 && (
//             <div className="rounded-2xl border border-info/20 bg-info/5 p-4">
//               <p className="text-sm font-medium text-ink">
//                 {activeMedicine.brand} is out of stock nearby — same-salt substitutes are available
//               </p>
//               <div className="flex flex-wrap gap-2 mt-3">
//                 {substitutes.map(sub => (
//                   <button
//                     key={sub.id}
//                     onClick={() => handleSubstituteSearch(sub)}
//                     className="px-3 py-1.5 rounded-lg bg-surface border border-info/30 text-xs font-medium text-ink hover:border-info/60 transition-colors"
//                   >
//                     {sub.brand} <span className="text-ink-soft">· {sub.manufacturer}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {rankedResults.length === 0 && substitutes.length === 0 && (
//             <div className="rounded-xl border border-warning/25 bg-warning/5 p-4 text-sm text-ink">
//               <span className="font-medium">{activeMedicine.brand}</span> isn't available at any pharmacy within {radiusKm}km, and no safe same-salt substitute was found nearby. This search has been logged to help pharmacies restock.
//             </div>
//           )}

//           <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
//             <div className="lg:col-span-2 order-2 lg:order-1 flex flex-col gap-3">
//               {rankedResults.length > 0 && (
//                 <>
//                   {correctedFrom && (
//                     <p className="text-xs text-ink-soft px-1">
//                       Showing results for <span className="font-medium text-ink">{activeMedicine.brand}</span> ·{' '}
//                       <button onClick={() => runSearch(correctedFrom)} className="underline hover:text-ink">
//                         Search instead for "{correctedFrom}"
//                       </button>
//                     </p>
//                   )}
//                   <div className="flex items-baseline justify-between px-1">
//                     <h2 className="font-display font-semibold text-ink text-[15px]">
//                       {rankedResults.length} {rankedResults.length === 1 ? 'pharmacy has' : 'pharmacies have'} {activeMedicine.brand}
//                     </h2>
//                     <button onClick={() => setDetailMedicine(activeMedicine)} className="flex items-center gap-1 text-xs text-primary font-medium">
//                       <Info size={12} /> Details
//                     </button>
//                   </div>

//                   <div className="flex flex-col gap-3 max-h-[560px] overflow-y-auto pr-1">
//                     {rankedResults.map((r, idx) => (
//                       <div key={r.inventoryId} className="rounded-2xl border border-border bg-surface p-4 shadow-card hover:border-primary/30 transition-colors">
//                         <div className="flex items-start justify-between gap-3">
//                           <div>
//                             <div className="flex items-center gap-2">
//                               {idx === 0 && <Badge variant="primary">Best match</Badge>}
//                               <h3 className="font-semibold text-ink text-[15px]">{r.pharmacy.name}</h3>
//                             </div>
//                             <p className="text-xs text-ink-soft mt-0.5">{r.pharmacy.address}</p>
//                           </div>
//                           <Badge variant={stockBadgeVariant(r.status)}>{stockBadgeLabel(r.status)}</Badge>
//                         </div>

//                         <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 text-xs text-ink-soft">
//                           <span className="flex items-center gap-1.5"><Star size={13} className="text-warning fill-warning" /> {r.pharmacy.rating} rating</span>
//                           <span className="flex items-center gap-1.5"><MapPinned size={13} /> {r.roadDistanceKm} km road distance</span>
//                           <span className="flex items-center gap-1.5"><PackageCheck size={13} /> {r.quantity} units · ₹{r.price}/unit</span>
//                           <span className="flex items-center gap-1.5"><Clock size={13} /> {r.isOpenNow ? 'Open now' : `${r.pharmacy.openTime}–${r.pharmacy.closeTime}`}</span>
//                         </div>

//                         <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-border">
//                           <div className="text-xs text-ink-soft">
//                             Fit score <span className="font-semibold text-primary">{r.wsmScore}</span>/100
//                           </div>
//                           <button
//                             onClick={() => handleReserve(r)}
//                             className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors"
//                           >
//                             Reserve Medicine
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               )}

//               {rankedResults.length === 0 && !hasSearched && (
//                 <div className="rounded-xl border border-dashed border-border p-6 text-sm text-ink-soft">
//                   Search a medicine by brand, generic, or salt name — or scan a strip — to see ranked nearby pharmacies here.
//                 </div>
//               )}
//             </div>

//             <div className="lg:col-span-3 order-1 lg:order-2 h-[420px] lg:h-auto">
//               <PharmacyMap results={rankedResults} userLocation={location} />
//             </div>
//           </div>
//         </>
//       )}

//       {!activeMedicine && !hasSearched && (
//         <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
//           <div className="lg:col-span-2 order-2 lg:order-1 rounded-xl border border-dashed border-border p-6 text-sm text-ink-soft">
//             Search a medicine by brand, generic, or salt name — or scan a strip — to see ranked nearby pharmacies here.
//           </div>
//           <div className="lg:col-span-3 order-1 lg:order-2 h-[420px] lg:h-auto">
//             <PharmacyMap results={[]} userLocation={location} />
//           </div>
//         </div>
//       )}

//       <StripOcrModal open={ocrOpen} onClose={() => setOcrOpen(false)} onConfirm={handleOcrConfirm} />
//       <MedicineDetailModal
//         medicine={detailMedicine}
//         open={!!detailMedicine}
//         onClose={() => setDetailMedicine(null)}
//         onSelectSubstitute={handleSubstituteSearch}
//       />
//     </div>
//   );
// }
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, MapPinned, PackageCheck, Info } from 'lucide-react';
import MedicineSearchCard from '../components/MedicineSearchCard.js';
import StripOcrModal from '../components/StripOcrModal.js';
import MedicineDetailModal from '../components/MedicineDetailModal.js';
import PharmacyMap from '../../map/components/PharmacyMap.js';
import Badge, { stockBadgeLabel, stockBadgeVariant } from '../../components/Badge.js';
import PharmacyReviews from '../../reviews/components/PharmacyReviews.js';
// import { useApp } from '../../context/AppContext.js';
import { useGeolocation } from '../../hooks/useGeolocation.js';
// import {
//   haversineKm,
//   simulatedRoadDistanceKm,
//   rankPharmaciesWSM,
//   isPharmacyOpenNow,
//   getSubstitutes
// } from '../../mock/mockData';
import { rankPharmaciesWSM, isPharmacyOpenNow } from '../../mock/mockData';
import { medicineApi } from '../../api/client';
import { toUiMedicine } from '../../utils/medicineMapper';

function freshness(mins) {
  if (mins == null) return null;
  if (mins < 1) return 'Updated just now';
  if (mins < 60) return `Updated ${mins} min ago`;
  if (mins < 1440) return `Updated ${Math.floor(mins / 60)} h ago`;
  return `Updated ${Math.floor(mins / 1440)} d ago`;
}

export default function SearchResults() {
  // const { inventory, pharmacies } = useApp();
  const { location } = useGeolocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState(5);
  const [activeMedicine, setActiveMedicine] = useState(null);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [detailMedicine, setDetailMedicine] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [matches, setMatches] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadedFor, setLoadedFor] = useState(null);
  const [error, setError] = useState('');

  async function runSearch(rawQuery) {
    setQuery(rawQuery);
    const q = rawQuery.trim();
    if (!q) return;

    setHasSearched(true);
    setLoading(true);
    setError('');
    setMatches([]);
    setTotalMatches(0);
    setActiveMedicine(null);

    try {
      const page = await medicineApi.search(q, 0, 20);
      setMatches(page.content.map(toUiMedicine));
      setTotalMatches(page.totalElements);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // const rankedResults = useMemo(() => {
  //   if (!activeMedicine) return [];
  //   const candidates = inventory
  //     .filter(inv => inv.medicineId === activeMedicine.id && inv.quantity > 0)
  //     .map(inv => {
  //       const pharmacy = pharmacies.find(p => p.id === inv.pharmacyId);
  //       if (!pharmacy) return null;
  //       const straightKm = haversineKm(location, pharmacy);
  //       if (straightKm > radiusKm) return null;
  //       return {
  //         inventoryId: inv.id,
  //         pharmacy,
  //         quantity: inv.quantity,
  //         price: inv.price,
  //         status: inv.status,
  //         rating: pharmacy.rating,
  //         roadDistanceKm: simulatedRoadDistanceKm(location, pharmacy),
  //         isOpenNow: isPharmacyOpenNow(pharmacy)
  //       };
  //     })
  //     .filter(Boolean);
  //   return rankPharmaciesWSM(candidates);
  // }, [activeMedicine, inventory, pharmacies, radiusKm, location]);

  // const substitutes = useMemo(() => {
  //   if (!activeMedicine || rankedResults.length > 0) return [];
  //   return getSubstitutes(activeMedicine.id).filter(sub => inventory.some(inv => inv.medicineId === sub.id && inv.quantity > 0));
  // }, [activeMedicine, rankedResults, inventory]);

    const [availability, setAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Real stock near the user, from the backend (inventory table + distance filter).
  useEffect(() => {
    if (!activeMedicine) {
      setAvailability([]);
      setLoadedFor(null);
      return undefined;
    }
    let cancelled = false;
    setAvailabilityLoading(true);
    setError('');
    medicineApi
      .availability(activeMedicine.id, location.lat, location.lng, radiusKm)
      .then(rows => {
        if (!cancelled) setAvailability(rows);
      })
      .catch(err => {
        if (!cancelled) {
          setAvailability([]);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAvailabilityLoading(false);
          setLoadedFor(activeMedicine.id);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeMedicine, radiusKm, location.lat, location.lng]);

  const availabilityReady = !availabilityLoading && loadedFor === activeMedicine?.id;

  const rankedResults = useMemo(() => {
    const candidates = availability.map(row => {
      const pharmacy = {
        id: row.pharmacyId,
        name: row.pharmacyName,
        address: row.address,
        lat: row.latitude,
        lng: row.longitude,
        rating: Number(row.avgRating),
        reviewCount: row.reviewCount,
        openTime: row.openTime,
        closeTime: row.closeTime
      };
      return {
        inventoryId: row.inventoryId,
        pharmacy,
        quantity: row.quantity,
        price: Number(row.price),
        status: row.quantity <= 10 ? 'LOW_STOCK' : 'IN_STOCK',
        rating: pharmacy.rating,
        // backend gives road distance (A*) when the Python service is up
        roadDistanceKm: row.distanceKm,
        updatedMinutesAgo: row.updatedMinutesAgo,
        isOpenNow: row.isOpen ?? isPharmacyOpenNow(pharmacy),
        wsmScore: row.score != null ? +(row.score * 100).toFixed(1) : null
      };
    });
    // Already ranked by the backend; fall back to the local ranking if Python was down
    if (candidates.every(c => c.wsmScore != null)) return candidates;
    return rankPharmaciesWSM(candidates);
  }, [availability]);

  // Same-salt substitutes will come from the backend in a later step.
  const substitutes = [];

  function handleOcrConfirm(medicine) {
    setOcrOpen(false);
    setQuery(medicine.brand);
    setHasSearched(true);
    setMatches([]);
    setError('');
    setActiveMedicine(medicine);
  }

  function handleSubstituteSearch(medicine) {
    setDetailMedicine(null);
    setQuery(medicine.brand);
    setActiveMedicine(medicine);
  }

  function handleReserve(result) {
    navigate('/reservations/checkout', {
      state: {
        pharmacyId: result.pharmacy.id,
        medicineId: activeMedicine.id,
        inventoryId: result.inventoryId,
        price: result.price,
        maxQuantity: result.quantity,
        medicineName: activeMedicine.brand,
        pharmacyName: result.pharmacy.name,
        pharmacyAddress: result.pharmacy.address
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <MedicineSearchCard
        query={query}
        radiusKm={radiusKm}
        onRadiusChange={setRadiusKm}
        onSearch={runSearch}
        onOpenScan={() => setOcrOpen(true)}
      />

      {loading && (
        <div className="rounded-xl border border-border bg-surface p-4 text-sm text-ink-soft">
          Searching medicines...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-warning/25 bg-warning/5 p-4 text-sm text-ink">{error}</div>
      )}

      {hasSearched && !loading && !error && matches.length === 0 && !activeMedicine && (
        <div className="rounded-xl border border-border bg-surface p-4 text-sm text-ink-soft">
          No medicine matched "<span className="text-ink font-medium">{query}</span>". Try the generic or salt name, or use strip scan.
        </div>
      )}

      {matches.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-ink-soft">
            {totalMatches} {totalMatches === 1 ? 'medicine' : 'medicines'} found for "
            <span className="text-ink font-medium">{query}</span>". Select one:
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {matches.map(medicine => (
              <button
                key={medicine.id}
                onClick={() => setActiveMedicine(medicine)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium text-ink transition-colors ${
                  activeMedicine?.id === medicine.id
                    ? 'bg-primary-tint border-primary/50'
                    : 'bg-app border-border hover:border-primary/40'
                }`}
              >
                {medicine.brand} <span className="text-ink-soft">· {medicine.manufacturer}</span>
              </button>
            ))}
          </div>
          {totalMatches > matches.length && (
            <p className="text-[11px] text-ink-soft mt-3">
              Showing the top {matches.length} of {totalMatches}. Add the strength or form to narrow it down.
            </p>
          )}
        </div>
      )}


      {activeMedicine && (
        <>
          {!availabilityReady && <p className="text-sm text-ink-soft">Checking nearby pharmacies…</p>}

          {availabilityReady && rankedResults.length === 0 && substitutes.length > 0 && (
            <div className="rounded-2xl border border-info/20 bg-info/5 p-4">
              <p className="text-sm font-medium text-ink">
                {activeMedicine.brand} is out of stock nearby — same-salt substitutes are available
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {substitutes.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => handleSubstituteSearch(sub)}
                    className="px-3 py-1.5 rounded-lg bg-surface border border-info/30 text-xs font-medium text-ink hover:border-info/60 transition-colors"
                  >
                    {sub.brand} <span className="text-ink-soft">· {sub.manufacturer}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

         {availabilityReady && rankedResults.length === 0 && substitutes.length === 0 && (
            <div className="rounded-xl border border-warning/25 bg-warning/5 p-4 text-sm text-ink">
              <span className="font-medium">{activeMedicine.brand}</span> isn't available at any pharmacy within {radiusKm}km.
              <button onClick={() => setDetailMedicine(activeMedicine)} className="ml-2 text-primary font-medium underline">
                View details
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-2 order-2 lg:order-1 flex flex-col gap-3">
              {rankedResults.length > 0 && (
                <>
                  <div className="flex items-baseline justify-between px-1">
                    <h2 className="font-display font-semibold text-ink text-[15px]">
                      {rankedResults.length} {rankedResults.length === 1 ? 'pharmacy has' : 'pharmacies have'} {activeMedicine.brand}
                    </h2>
                    <button onClick={() => setDetailMedicine(activeMedicine)} className="flex items-center gap-1 text-xs text-primary font-medium">
                      <Info size={12} /> Details
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 max-h-[560px] overflow-y-auto pr-1">
                    {rankedResults.map((r, idx) => (
                      <div key={r.inventoryId} className="rounded-2xl border border-border bg-surface p-4 shadow-card hover:border-primary/30 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              {idx === 0 && <Badge variant="primary">Best match</Badge>}
                              <h3 className="font-semibold text-ink text-[15px]">{r.pharmacy.name}</h3>
                            </div>
                            <p className="text-xs text-ink-soft mt-0.5">{r.pharmacy.address}</p>
                          </div>
                          <Badge variant={stockBadgeVariant(r.status)}>{stockBadgeLabel(r.status)}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 text-xs text-ink-soft">
                          <PharmacyReviews pharmacyId={r.pharmacy.id} rating={r.pharmacy.rating} count={r.pharmacy.reviewCount} />
                          <span className="flex items-center gap-1.5"><MapPinned size={13} /> {r.roadDistanceKm} km road distance</span>
                          <span className="flex items-center gap-1.5"><PackageCheck size={13} /> {r.quantity} units · ₹{r.price}/unit</span>
                          <span className="flex items-center gap-1.5"><Clock size={13} /> {r.isOpenNow ? 'Open now' : `${r.pharmacy.openTime}–${r.pharmacy.closeTime}`}</span>
                          {r.updatedMinutesAgo != null && (
                            <span className={`flex items-center gap-1.5 ${r.updatedMinutesAgo >= 1440 ? 'text-warning' : ''}`}>
                              <Clock size={13} /> {freshness(r.updatedMinutesAgo)}{r.updatedMinutesAgo >= 1440 && ' · may be outdated'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-border">
                          <div className="text-xs text-ink-soft">
                            Fit score <span className="font-semibold text-primary">{r.wsmScore}</span>/100
                          </div>
                          <button
                            onClick={() => handleReserve(r)}
                            className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors"
                          >
                            Reserve Medicine
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {rankedResults.length === 0 && !hasSearched && (
                <div className="rounded-xl border border-dashed border-border p-6 text-sm text-ink-soft">
                  Search a medicine by brand, generic, or salt name — or scan a strip — to see ranked nearby pharmacies here.
                </div>
              )}
            </div>

            <div className="lg:col-span-3 order-1 lg:order-2 h-[420px] lg:h-auto">
              <PharmacyMap results={rankedResults} userLocation={location} />
            </div>
          </div>
        </>
      )}

      {!activeMedicine && !hasSearched && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2 order-2 lg:order-1 rounded-xl border border-dashed border-border p-6 text-sm text-ink-soft">
            Search a medicine by brand, generic, or salt name — or scan a strip — to see ranked nearby pharmacies here.
          </div>
          <div className="lg:col-span-3 order-1 lg:order-2 h-[420px] lg:h-auto">
            <PharmacyMap results={[]} userLocation={location} />
          </div>
        </div>
      )}

      <StripOcrModal open={ocrOpen} onClose={() => setOcrOpen(false)} onConfirm={handleOcrConfirm} />
      <MedicineDetailModal
        medicine={detailMedicine}
        open={!!detailMedicine}
        onClose={() => setDetailMedicine(null)}
        onSelectSubstitute={handleSubstituteSearch}
      />
    </div>
  );
}