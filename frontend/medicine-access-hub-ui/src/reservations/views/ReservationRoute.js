import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import PharmacyMap from '../../map/components/PharmacyMap.js';
import { useApp } from '../../context/AppContext.js';
import { useGeolocation } from '../../hooks/useGeolocation.js';
import { reservationApi } from '../../api/client.js';

export default function ReservationRoute() {
  const { id } = useParams();
  const { currentUser } = useApp();
  const { location } = useGeolocation();
  const [reservation, setReservation] = useState(null);
  const [route, setRoute] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const mine = await reservationApi.listMine(currentUser.token);
        const found = mine.find(r => String(r.id) === id);
        if (!found) throw new Error('Reservation not found');
        if (cancelled) return;
        setReservation(found);
        const data = await reservationApi.route(id, location.lat, location.lng, currentUser.token);
        if (!cancelled) setRoute(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, currentUser.token, location.lat, location.lng]);

  return (
    <div className="flex flex-col gap-4">
      <Link to="/reservations" className="text-sm text-primary flex items-center gap-1">
        <ArrowLeft size={14} /> My reservations
      </Link>

      {reservation && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="font-semibold text-ink text-sm">{reservation.pharmacyName}</p>
          <p className="text-xs text-ink-soft flex items-center gap-1 mt-0.5">
            <MapPin size={11} /> {reservation.pharmacyAddress}
          </p>
          {route && <p className="text-xs text-ink-soft mt-2">{route.distanceKm} km by road</p>}
        </div>
      )}

      {loading && <p className="text-sm text-ink-soft">Finding the best route...</p>}
      {error && <p className="text-sm text-danger">{error}</p>}

      {route && reservation && (
        <PharmacyMap
          userLocation={location}
          height="480px"
          selectedRoute={{
            pharmacy: { lat: reservation.pharmacyLatitude, lng: reservation.pharmacyLongitude },
            distanceKm: route.distanceKm,
            path: route.path
          }}
        />
      )}
    </div>
  );
}