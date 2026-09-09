import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import { simulateRoutePath } from '../../utils/map-utils.js';

/**
 * Draws a polyline standing in for the OSMnx + NetworkX A* road route
 * between the user's location and a selected pharmacy. In Phase 1 this is
 * a simulated waypoint path (see simulateRoutePath); it is designed to be
 * swapped for the real /api/v1 routing response without changing callers.
 */
export default function RoutePolyline({ start, end, distanceKm }) {
  if (!start || !end) return null;
  const path = simulateRoutePath(start, end);

  return (
    <>
      <Polyline
        positions={path}
        pathOptions={{ color: '#0D9488', weight: 4, opacity: 0.85, dashArray: '1 8', lineCap: 'round' }}
      />
      <CircleMarker center={path[Math.floor(path.length / 2)]} radius={4} pathOptions={{ color: '#0D9488', fillColor: '#0D9488', fillOpacity: 1 }}>
        {distanceKm != null && (
          <Tooltip permanent direction="top" className="!text-xs !font-medium">
            {distanceKm} km road route
          </Tooltip>
        )}
      </CircleMarker>
    </>
  );
}
