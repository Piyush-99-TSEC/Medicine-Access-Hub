import { useState } from 'react';
import { CreditCard } from 'lucide-react';

export default function CheckoutForm({ total, onPay, submitLabel }) {
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });

  function handleSubmit(e) {
    e.preventDefault();
    onPay(card);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-xs text-ink-soft bg-app rounded-lg px-3 py-2">
        <CreditCard size={14} className="text-primary" />
        Mock Stripe Checkout — no real payment is processed.
      </div>

      <div>
        <label className="text-xs text-ink-soft">Card number</label>
        <input
          required
          maxLength={19}
          value={card.number}
          onChange={e => setCard({ ...card, number: e.target.value })}
          placeholder="4242 4242 4242 4242"
          className="w-full h-10 mt-1 px-3 rounded-lg border border-border bg-app focus:bg-surface focus:border-primary/50 outline-none text-sm"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-ink-soft">Expiry</label>
          <input
            required
            value={card.expiry}
            onChange={e => setCard({ ...card, expiry: e.target.value })}
            placeholder="MM/YY"
            className="w-full h-10 mt-1 px-3 rounded-lg border border-border bg-app focus:bg-surface focus:border-primary/50 outline-none text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-ink-soft">CVC</label>
          <input
            required
            value={card.cvc}
            onChange={e => setCard({ ...card, cvc: e.target.value })}
            placeholder="123"
            className="w-full h-10 mt-1 px-3 rounded-lg border border-border bg-app focus:bg-surface focus:border-primary/50 outline-none text-sm"
          />
        </div>
      </div>

      <button type="submit" className="w-full h-11 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors">
        {submitLabel || `Pay ₹${total}`}
      </button>
    </form>
  );
}
