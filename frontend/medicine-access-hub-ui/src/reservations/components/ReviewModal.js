import { useState } from 'react';
import { Star } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { reviewApi } from '../../api/client.js';

export default function ReviewModal({ reservation, onClose, onDone }) {
  const { currentUser } = useApp();
  const [rating, setRating] = useState(reservation.myRating || 0);
  const [comment, setComment] = useState(reservation.myComment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!rating) {
      setError('Please select a rating');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const body = { rating, comment };
      if (reservation.reviewed) {
        await reviewApi.update(reservation.id, body, currentUser.token);
      } else {
        await reviewApi.create(reservation.id, body, currentUser.token);
      }
      onDone();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-5 flex flex-col gap-3">
        <p className="font-semibold text-ink text-sm">
          {reservation.reviewed ? 'Edit your review of' : 'Rate'} {reservation.pharmacyName}
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
              <Star size={26} className={n <= rating ? 'text-warning fill-warning' : 'text-border'} />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Share your experience (optional)"
          className="w-full rounded-lg border border-border p-2 text-sm"
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-9 rounded-lg border border-border text-xs font-medium text-ink-soft">Cancel</button>
          <button onClick={submit} disabled={submitting} className="flex-1 h-9 rounded-lg bg-primary text-white text-xs font-medium disabled:opacity-60">
            {submitting ? 'Sending...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}