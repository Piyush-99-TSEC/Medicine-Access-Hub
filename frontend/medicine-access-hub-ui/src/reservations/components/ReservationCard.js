import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Navigation } from 'lucide-react';
import Badge from '../../components/Badge.js';

const STATUS_VARIANT = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  REJECTED: 'danger',
  EXPIRED: 'neutral',
  CANCELLED: 'neutral',
  COLLECTED: 'info'
};

function useCountdown(target, active) {
  const calc = () => Math.max(0, Math.floor((new Date(target) - Date.now()) / 1000));
  const [secondsLeft, setSecondsLeft] = useState(calc);

  useEffect(() => {
    if (!active) return undefined;
    const t = setInterval(() => setSecondsLeft(calc()), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, active]);

  return secondsLeft;
}

export default function ReservationCard({ reservation, onCancel }) {
  const { status } = reservation;
  const isActive = status === 'PENDING' || status === 'CONFIRMED';
  // PENDING: time left for the pharmacy to respond. CONFIRMED: time left to collect.
  const target = status === 'CONFIRMED' ? reservation.pickupBy : reservation.expiresAt;
  const secondsLeft = useCountdown(target, isActive);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink text-sm">{reservation.medicineName}</p>
          <p className="text-xs text-ink-soft flex items-center gap-1 mt-0.5">
            <MapPin size={11} /> {reservation.pharmacyName}
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-ink-soft">
        <span>Qty {reservation.quantity}</span>
        <span>{reservation.pharmacyAddress}</span>
      </div>

      {isActive && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <Clock size={14} className="text-primary" />
          <span className="text-sm font-display font-semibold text-primary">{mm}:{ss}</span>
          <span className="text-xs text-ink-soft">
            {status === 'CONFIRMED' ? 'left to collect' : 'for pharmacy to respond'}
          </span>
        </div>
      )}

      {isActive && (
        <div className="flex items-center gap-2 mt-3">
          {status === 'CONFIRMED' && (
            <Link
              to={`/reservations/${reservation.id}/route`}
              className="flex-1 h-9 rounded-lg bg-primary text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-primary-hover transition-colors"
            >
              <Navigation size={13} /> View route
            </Link>
          )}
          <button
            onClick={() => onCancel(reservation.id)}
            className="flex-1 h-9 rounded-lg border border-border text-xs font-medium text-ink-soft hover:border-danger/50 hover:text-danger transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}