import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import { UNMET_DEMAND_CLUSTERS, USER_LOCATION } from '../../mock/mockData';

function intensityColor(searchCount) {
  if (searchCount >= 30) return '#DC2626';
  if (searchCount >= 15) return '#D97706';
  return '#4F46E5';
}

export default function UnmetDemandHeatmap() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-card relative h-[420px]">
      <MapContainer center={[USER_LOCATION.lat, USER_LOCATION.lng]} zoom={12} scrollWheelZoom={false} style={{ height: '100%' }}>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {UNMET_DEMAND_CLUSTERS.map(c => (
          <Circle
            key={c.id}
            center={[c.centroid.lat, c.centroid.lng]}
            radius={c.radiusMeters * (c.searchCount / 10)}
            pathOptions={{ color: intensityColor(c.searchCount), fillColor: intensityColor(c.searchCount), fillOpacity: 0.3, weight: 1.5 }}
          >
            <Popup>
              <p className="text-sm font-medium">{c.medicineName}</p>
              <p className="text-xs text-ink-soft">{c.searchCount} failed searches · {c.distinctUsers} affected users</p>
              <p className="text-xs text-ink-soft">Nearest available stock: {c.nearestPharmacyKm} km away</p>
            </Popup>
          </Circle>
        ))}
      </MapContainer>

      <div className="absolute bottom-3 right-3 z-[500] bg-surface/95 border border-border rounded-lg px-3 py-2 text-[11px] text-ink-soft shadow-card">
        <p className="font-medium text-ink mb-1">Cluster intensity</p>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" /> Low (&lt;15 searches)</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> Medium (15–29)</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" /> High (30+)</div>
      </div>
    </div>
  );
}
