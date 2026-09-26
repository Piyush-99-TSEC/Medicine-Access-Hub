// import { useState } from 'react';
// import { useLocation, useNavigate, Link } from 'react-router-dom';
// import { Minus, Plus, Clock, CheckCircle2 } from 'lucide-react';
// import CheckoutForm from '../components/CheckoutForm.js';
// import { useApp } from '../../context/AppContext.js';
// import { MEDICINES } from '../../mock/mockData';

// const STEPS = { REVIEW: 'REVIEW', PAYMENT: 'PAYMENT', CONFIRMED: 'CONFIRMED' };

// export default function Checkout() {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const { pharmacies, createReservation } = useApp();
//   const [step, setStep] = useState(STEPS.REVIEW);
//   const [quantity, setQuantity] = useState(1);

//   if (!state) {
//     return (
//       <div className="max-w-md mx-auto rounded-2xl border border-dashed border-border p-8 text-center">
//         <p className="text-sm text-ink-soft">No reservation in progress.</p>
//         <Link to="/search" className="text-primary text-sm font-medium mt-2 inline-block">
//           Go back to search
//         </Link>
//       </div>
//     );
//   }

//   const { pharmacyId, medicineId, price, maxQuantity, inventoryId } = state;
//   const pharmacy = pharmacies.find(p => p.id === pharmacyId);
//   const medicine = MEDICINES.find(m => m.id === medicineId);
//   const total = price * quantity;

//   function handlePay() {
//     createReservation({
//       userId: 'patient_demo',
//       userName: 'Ananya Rao',
//       pharmacyId,
//       medicineId,
//       inventoryId,
//       quantity,
//       totalAmount: total
//     });
//     setStep(STEPS.CONFIRMED);
//   }

//   return (
//     <div className="max-w-md mx-auto rounded-2xl border border-border bg-surface shadow-card">
//       <div className="px-5 py-4 border-b border-border">
//         <h1 className="font-display font-semibold text-ink text-[15px]">
//           {step === STEPS.CONFIRMED ? 'Reservation Confirmed' : 'Reserve Medicine'}
//         </h1>
//       </div>

//       <div className="p-5">
//         {step === STEPS.REVIEW && (
//           <div className="flex flex-col gap-4">
//             <div className="rounded-xl bg-app p-3.5">
//               <p className="font-medium text-ink text-sm">{medicine?.brand}</p>
//               <p className="text-xs text-ink-soft mt-0.5">{pharmacy?.name} · {pharmacy?.address}</p>
//             </div>

//             <div className="flex items-center justify-between">
//               <span className="text-sm text-ink-soft">Quantity</span>
//               <div className="flex items-center gap-3">
//                 <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary/50">
//                   <Minus size={13} />
//                 </button>
//                 <span className="w-5 text-center text-sm font-medium">{quantity}</span>
//                 <button onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))} className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary/50">
//                   <Plus size={13} />
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center justify-between text-sm">
//               <span className="text-ink-soft">Price per unit</span>
//               <span className="font-medium text-ink">₹{price}</span>
//             </div>
//             <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
//               <span className="text-ink-soft">Total</span>
//               <span className="font-semibold text-ink text-base">₹{total}</span>
//             </div>

//             <div className="flex items-center gap-1.5 text-xs text-warning bg-warning/5 rounded-lg px-3 py-2">
//               <Clock size={13} /> Stock will be held for 15 minutes after payment.
//             </div>

//             <button onClick={() => setStep(STEPS.PAYMENT)} className="w-full h-11 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors">
//               Continue to Payment
//             </button>
//           </div>
//         )}

//         {step === STEPS.PAYMENT && <CheckoutForm total={total} onPay={handlePay} submitLabel={`Pay ₹${total} & Lock Stock`} />}

//         {step === STEPS.CONFIRMED && (
//           <div className="flex flex-col items-center text-center gap-3 py-2">
//             <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
//               <CheckCircle2 size={24} className="text-success" />
//             </div>
//             <p className="font-semibold text-ink">Reservation confirmed</p>
//             <p className="text-xs text-ink-soft max-w-[280px]">
//               Collect {quantity} × {medicine?.brand} at {pharmacy?.name} within 15 minutes.
//             </p>
//             <button
//               onClick={() => navigate('/reservations')}
//               className="w-full h-10 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors mt-2"
//             >
//               View My Reservations
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Minus, Plus, Clock, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { MEDICINES } from '../../mock/mockData';

const STEPS = { REVIEW: 'REVIEW', CONFIRMED: 'CONFIRMED' };

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { pharmacies, createReservation } = useApp();
  const [step, setStep] = useState(STEPS.REVIEW);
  const [quantity, setQuantity] = useState(1);

  if (!state) {
    return (
      <div className="max-w-md mx-auto rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-ink-soft">No reservation in progress.</p>
        <Link to="/search" className="text-primary text-sm font-medium mt-2 inline-block">
          Go back to search
        </Link>
      </div>
    );
  }

  const { pharmacyId, medicineId, price, maxQuantity, inventoryId } = state;
  const pharmacy = pharmacies.find(p => p.id === pharmacyId);
  const medicine = MEDICINES.find(m => m.id === medicineId);
  const total = price * quantity;

  function handleReserve() {
    createReservation({
      userId: 'patient_demo',
      userName: 'Ananya Rao',
      pharmacyId,
      medicineId,
      inventoryId,
      quantity,
      totalAmount: total
    });
    setStep(STEPS.CONFIRMED);
  }

  return (
    <div className="max-w-md mx-auto rounded-2xl border border-border bg-surface shadow-card">
      <div className="px-5 py-4 border-b border-border">
        <h1 className="font-display font-semibold text-ink text-[15px]">
          {step === STEPS.CONFIRMED ? 'Reservation Confirmed' : 'Reserve Medicine'}
        </h1>
      </div>

      <div className="p-5">
        {step === STEPS.REVIEW && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-app p-3.5">
              <p className="font-medium text-ink text-sm">{medicine?.brand}</p>
              <p className="text-xs text-ink-soft mt-0.5">{pharmacy?.name} · {pharmacy?.address}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-soft">Quantity</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary/50">
                  <Minus size={13} />
                </button>
                <span className="w-5 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))} className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary/50">
                  <Plus size={13} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-soft">Price per unit</span>
              <span className="font-medium text-ink">₹{price}</span>
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
              <span className="text-ink-soft">Total</span>
              <span className="font-semibold text-ink text-base">₹{total}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-warning bg-warning/5 rounded-lg px-3 py-2">
              <Clock size={13} /> Stock will be held for 15 minutes after you reserve.
            </div>

            <button onClick={handleReserve} className="w-full h-11 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors">
              Reserve
            </button>
          </div>
        )}

        {step === STEPS.CONFIRMED && (
          <div className="flex flex-col items-center text-center gap-3 py-2">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-success" />
            </div>
            <p className="font-semibold text-ink">Reservation confirmed</p>
            <p className="text-xs text-ink-soft max-w-[280px]">
              Collect {quantity} × {medicine?.brand} at {pharmacy?.name} within 15 minutes.
            </p>
            <button
              onClick={() => navigate('/reservations')}
              className="w-full h-10 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors mt-2"
            >
              View My Reservations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}