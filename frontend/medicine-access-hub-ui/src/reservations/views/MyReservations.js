import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReservationCard from '../components/ReservationCard.js';
import { useApp } from '../../context/AppContext.js';
import { reservationApi } from '../../api/client.js';

export default function MyReservations() {
  const { currentUser } = useApp();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    reservationApi
      .listMine(currentUser.token)
      .then(setReservations)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentUser.token]);

  // Poll so a pharmacy's accept/reject shows up without a refresh
  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  async function handleCancel(id) {
    setError('');
    try {
      await reservationApi.cancel(id, currentUser.token);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-semibold text-xl text-ink">My Reservations</h1>
        <Link to="/search" className="text-sm font-medium text-primary">
          + New search
        </Link>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {!loading && reservations.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-ink-soft">
          No reservations yet. Search a medicine and reserve it to see your tickets here.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {reservations.map(r => (
          <ReservationCard key={r.id} reservation={r} onCancel={handleCancel} onChanged={load} />
        ))}
      </div>
    </div>
  );
}