import { haversineKm } from '../mock/mockData';

/**
 * Returns a Leaflet-compatible bounding box [[southWestLat, southWestLng], [northEastLat, northEastLng]]
 * around a center point for a given radius in kilometres. Useful for
 * map.fitBounds() calls when framing search results.
 */
export function getBoundingBox(center, radiusKm) {
  const latDelta = radiusKm / 111; // ~111km per degree latitude
  const lngDelta = radiusKm / (111 * Math.cos((center.lat * Math.PI) / 180));

  return [
    [center.lat - latDelta, center.lng - lngDelta],
    [center.lat + latDelta, center.lng + lngDelta]
  ];
}

/** Filters a list of { lat, lng, ... } points to those within radiusKm of center. */
export function filterWithinRadius(points, center, radiusKm) {
  return points.filter(p => haversineKm(center, p) <= radiusKm);
}

/** Formats a distance in km for display, switching to metres under 1km. */
export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/** Returns the midpoint between two lat/lng points (simple planar approximation, fine at city scale). */
export function midpoint(a, b) {
  return { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };
}

/**
 * Generates a slightly curved/jittered polyline of waypoints between two
 * points, standing in for an actual OSMnx/A* road path until the real
 * routing microservice is wired up.
 */
export function simulateRoutePath(start, end, segments = 6) {
  const path = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const jitter = Math.sin(t * Math.PI) * 0.0025 * (i % 2 === 0 ? 1 : -1);
    path.push([
      start.lat + (end.lat - start.lat) * t + jitter,
      start.lng + (end.lng - start.lng) * t + jitter
    ]);
  }
  return path;
}
