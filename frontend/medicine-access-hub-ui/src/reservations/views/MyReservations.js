import { Link } from 'react-router-dom';
import ReservationCard from '../components/ReservationCard.js';
import { useApp } from '../../context/AppContext.js';

export default function MyReservations() {
  const { reservations, pharmacies } = useApp();

  // Demo scope: patient_demo is the signed-in patient's mock user id.
  const myReservations = reservations
    .filter(r => r.userId === 'patient_demo')
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-semibold text-xl text-ink">My Reservations</h1>
        <Link to="/search" className="text-sm font-medium text-primary">
          + New search
        </Link>
      </div>

      {myReservations.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-ink-soft">
          No reservations yet. Search a medicine and reserve it to see your tickets here.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {myReservations.map(r => (
          <ReservationCard key={r.id} reservation={r} pharmacy={pharmacies.find(p => p.id === r.pharmacyId)} />
        ))}
      </div>
    </div>
  );
}
