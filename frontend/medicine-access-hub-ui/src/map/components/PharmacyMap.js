import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import PharmacyMarker from './PharmacyMarker.js';
import RoutePolyline from './RoutePolyline.js';
import { coloredDivIcon } from './PharmacyMarker.js';

const USER_ICON = coloredDivIcon('#6D28D9', 20);

/**
 * results: [{ pharmacy, quantity, price, status, roadDistanceKm, inventoryId }]
 * selectedRoute: { pharmacy, distanceKm } | null — draws an A* route overlay to this pharmacy
 */
export default function PharmacyMap({ results = [], userLocation, selectedRoute, onSelectPharmacy, height = '100%' }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-card" style={{ height, minHeight: 360 }}>
      <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[userLocation.lat, userLocation.lng]} icon={USER_ICON}>
          <Popup>Your location</Popup>
        </Marker>
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={400}
          pathOptions={{ color: '#6D28D9', fillColor: '#6D28D9', fillOpacity: 0.08, weight: 1 }}
        />

        {results.map(r => (
          <PharmacyMarker
            key={r.inventoryId || r.pharmacy.id}
            pharmacy={r.pharmacy}
            quantity={r.quantity}
            price={r.price}
            status={r.status}
            roadDistanceKm={r.roadDistanceKm}
            onSelect={onSelectPharmacy}
          />
        ))}

        {selectedRoute && (
          <RoutePolyline start={userLocation} end={selectedRoute.pharmacy} distanceKm={selectedRoute.distanceKm} path={selectedRoute.path} />        )}
      </MapContainer>
    </div>
  );
}
