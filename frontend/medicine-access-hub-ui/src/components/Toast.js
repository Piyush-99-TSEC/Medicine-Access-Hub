import { CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.js';

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  const isDanger = toast.variant === 'danger';

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[2000] animate-fade-in">
      <div
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-card border text-sm font-medium ${
          isDanger ? 'bg-danger/5 border-danger/20 text-danger' : 'bg-success/5 border-success/20 text-success'
        }`}
      >
        {isDanger ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
        {toast.message}
      </div>
    </div>
  );
}
