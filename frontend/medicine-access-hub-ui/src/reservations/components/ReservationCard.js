import { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import Badge from '../../components/Badge.js';
import { MEDICINES } from '../../mock/mockData';

const STATUS_VARIANT = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  REJECTED: 'danger',
  EXPIRED: 'neutral',
  CANCELLED: 'neutral',
  COLLECTED: 'info'
};

function useCountdown(createdAt, holdMinutes, active) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const elapsed = Math.floor((Date.now() - createdAt) / 1000);
    return Math.max(0, holdMinutes * 60 - elapsed);
  });

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      const elapsed = Math.floor((Date.now() - createdAt) / 1000);
      setSecondsLeft(Math.max(0, holdMinutes * 60 - elapsed));
    }, 1000);
    return () => clearInterval(t);
  }, [createdAt, holdMinutes, active]);

  return secondsLeft;
}

export default function ReservationCard({ reservation, pharmacy }) {
  const medicine = MEDICINES.find(m => m.id === reservation.medicineId);
  const isActive = reservation.status === 'PENDING' || reservation.status === 'CONFIRMED';
  const secondsLeft = useCountdown(reservation.createdAt, reservation.holdMinutes || 15, isActive);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const expired = isActive && secondsLeft === 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink text-sm">{medicine?.brand}</p>
          <p className="text-xs text-ink-soft flex items-center gap-1 mt-0.5">
            <MapPin size={11} /> {pharmacy?.name || 'Pharmacy'}
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[expired ? 'EXPIRED' : reservation.status]}>
          {expired ? 'EXPIRED' : reservation.status}
        </Badge>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-ink-soft">
        <span>Qty {reservation.quantity}</span>
        <span>₹{reservation.totalAmount}</span>
      </div>

      {isActive && !expired && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <Clock size={14} className="text-primary" />
          <span className="text-sm font-display font-semibold text-primary">{mm}:{ss}</span>
          <span className="text-xs text-ink-soft">hold remaining</span>
        </div>
      )}
    </div>
  );
}
