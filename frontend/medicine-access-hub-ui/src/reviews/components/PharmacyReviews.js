import { useState } from 'react';
import { Star } from 'lucide-react';
import { reviewApi } from '../../api/client.js';

export default function PharmacyReviews({ pharmacyId, rating, count }) {
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!count) {
    return <span className="text-xs text-ink-soft">No reviews yet</span>;
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && reviews.length === 0) {
      setLoading(true);
      reviewApi.list(pharmacyId).then(setReviews).catch(() => {}).finally(() => setLoading(false));
    }
  }

  return (
    <div className="col-span-2">
      <button onClick={toggle} className="flex items-center gap-1.5 text-xs text-ink-soft hover:text-primary">
        <Star size={13} className="text-warning fill-warning" />
        {rating} ({count} {count === 1 ? 'review' : 'reviews'}) · {open ? 'Hide' : 'Read'}
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
          {loading && <p className="text-xs text-ink-soft">Loading...</p>}
          {reviews.map(rv => (
            <div key={rv.id} className="rounded-lg bg-app p-2.5">
              <p className="text-xs font-medium text-ink">
                {rv.reviewerName} · {'★'.repeat(rv.rating)}
              </p>
              {rv.comment && <p className="text-xs text-ink-soft mt-0.5">{rv.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}