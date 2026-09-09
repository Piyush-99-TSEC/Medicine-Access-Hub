import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { stockBadgeLabel } from '../../components/Badge.js';

// Per spec: Green = stock > 10, Yellow = stock < 5, Red = out of stock / unverified.
// Quantities between 5 and 10 inclusive are treated as Yellow (Low Stock) too,
// since they are neither comfortably in the Green band nor zero.
export function stockColor(quantity) {
  if (quantity > 10) return '#16A34A'; // Green
  if (quantity > 0) return '#D97706'; // Yellow
  return '#DC2626'; // Red
}

export function coloredDivIcon(hex, size = 26) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${hex};border:3px solid white;
      box-shadow:0 1px 4px rgba(15,23,42,0.35);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}

export default function PharmacyMarker({ pharmacy, quantity, price, status, roadDistanceKm, onSelect }) {
  const icon = coloredDivIcon(stockColor(quantity));

  return (
    <Marker
      position={[pharmacy.lat, pharmacy.lng]}
      icon={icon}
      eventHandlers={onSelect ? { click: () => onSelect(pharmacy) } : undefined}
    >
      <Popup>
        <div className="text-sm">
          <p className="font-semibold text-ink">{pharmacy.name}</p>
          <p className="text-ink-soft text-xs mt-0.5">{pharmacy.address}</p>
          {status && (
            <p className="text-xs mt-1">
              <span className="font-medium">{stockBadgeLabel(status)}</span>
              {typeof quantity === 'number' && ` · ${quantity} units`}
              {price != null && ` · ₹${price}`}
            </p>
          )}
          {roadDistanceKm != null && (
            <p className="text-xs text-ink-soft mt-0.5">{roadDistanceKm} km by road</p>
          )}
          {!pharmacy.isVerified && (
            <p className="text-[11px] text-danger mt-1">Unverified pharmacy</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
