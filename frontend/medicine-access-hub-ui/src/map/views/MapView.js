import { useMemo, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import PharmacyMap from '../components/PharmacyMap.js';
import { useApp } from '../../context/AppContext.js';
import { useGeolocation } from '../../hooks/useGeolocation.js';
import { USER_LOCATION, MEDICINES, simulatedRoadDistanceKm } from '../../mock/mockData';
import { formatDistance } from '../../utils/map-utils.js';

export default function MapView() {
  const { inventory, pharmacies } = useApp();
  const { location, source } = useGeolocation();
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(null);

  // Aggregate best-stocked medicine per pharmacy for a representative marker color
  const results = useMemo(() => {
    return pharmacies.map(pharmacy => {
      const stockRows = inventory.filter(inv => inv.pharmacyId === pharmacy.id);
      const best = stockRows.sort((a, b) => b.quantity - a.quantity)[0];
      return {
        pharmacy,
        quantity: best?.quantity ?? 0,
        price: best?.price,
        status: best?.status ?? 'OUT_OF_STOCK',
        roadDistanceKm: simulatedRoadDistanceKm(USER_LOCATION, pharmacy),
        inventoryId: pharmacy.id
      };
    });
  }, [inventory, pharmacies]);

  const selected = results.find(r => r.pharmacy.id === selectedPharmacyId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display font-semibold text-xl text-ink">Map Workspace</h1>
          <p className="text-sm text-ink-soft mt-0.5 flex items-center gap-1.5">
            <MapPin size={13} />
            {source === 'gps' ? 'Using your live GPS location' : 'Using default demo location (GPS unavailable)'}
          </p>
        </div>
        {selected && (
          <div className="flex items-center gap-2 text-sm bg-secondary/10 text-secondary px-3 py-1.5 rounded-lg">
            <Navigation size={14} />
            Route to <span className="font-medium">{selected.pharmacy.name}</span> · {formatDistance(selected.roadDistanceKm)}
          </div>
        )}
      </div>

      <div className="h-[calc(100vh-220px)] min-h-[480px]">
        <PharmacyMap
          results={results}
          userLocation={location}
          onSelectPharmacy={p => setSelectedPharmacyId(p.id)}
          selectedRoute={selected ? { pharmacy: selected.pharmacy, distanceKm: selected.roadDistanceKm } : null}
          height="100%"
        />
      </div>

      <p className="text-xs text-ink-soft">
        Click any pharmacy pin to draw its simulated A* road route from your location. {MEDICINES.length} medicines tracked across {pharmacies.length} pharmacies.
      </p>
    </div>
  );
}
