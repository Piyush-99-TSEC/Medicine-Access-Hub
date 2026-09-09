import { useMemo, useState } from 'react';
import { Pencil, Trash2, Plus, UploadCloud, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { MEDICINES } from '../../mock/mockData';
import Badge, { stockBadgeLabel, stockBadgeVariant } from '../../components/Badge.js';
import AddStockModal from './AddStockModal.js';

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

export default function InventoryTable({ pharmacyId, searchTerm = '', statusFilter = 'ALL', expiryFilter = 'ALL' }) {
  const { inventory, updateInventoryItem, deleteInventoryItem, addInventoryItem } = useApp();
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ quantity: '', price: '' });
  const [modalOpen, setModalOpen] = useState(false);

  const rows = useMemo(
    () =>
      inventory
        .filter(inv => inv.pharmacyId === pharmacyId)
        .map(inv => ({ ...inv, medicine: MEDICINES.find(m => m.id === inv.medicineId) }))
        .filter(r => r.medicine)
        .filter(r => !searchTerm || r.medicine.brand.toLowerCase().includes(searchTerm.toLowerCase()) || r.medicine.salt.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(r => statusFilter === 'ALL' || r.status === statusFilter)
        .filter(r => {
          if (expiryFilter === 'ALL') return true;
          const d = daysUntil(r.expiryDate);
          if (expiryFilter === 'EXPIRED') return d < 0;
          if (expiryFilter === '7') return d >= 0 && d <= 7;
          if (expiryFilter === '30') return d >= 0 && d <= 30;
          if (expiryFilter === '90') return d >= 0 && d <= 90;
          return true;
        }),
    [inventory, pharmacyId, searchTerm, statusFilter, expiryFilter]
  );

  function startEdit(row) {
    setEditingId(row.id);
    setDraft({ quantity: row.quantity, price: row.price });
  }

  function saveEdit(row) {
    const quantity = Math.max(0, Number(draft.quantity) || 0);
    const status = quantity > 10 ? 'IN_STOCK' : quantity > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK';
    updateInventoryItem(row.id, { quantity, price: Number(draft.price) || 0, status });
    setEditingId(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">{rows.length} medicines in stock</p>
        <div className="flex gap-2">
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-sm font-medium text-ink hover:bg-app transition-colors">
            <UploadCloud size={15} /> Bulk CSV Upload
          </button>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors">
            <Plus size={15} /> Add Stock
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-app text-ink-soft text-xs uppercase tracking-wide">
              <th className="text-left font-medium px-4 py-3">Medicine</th>
              <th className="text-left font-medium px-4 py-3">Salt Composition</th>
              <th className="text-left font-medium px-4 py-3">Stock</th>
              <th className="text-left font-medium px-4 py-3">Price</th>
              <th className="text-left font-medium px-4 py-3">Expiry</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const isEditing = editingId === row.id;
              const dLeft = daysUntil(row.expiryDate);
              const expiringSoon = dLeft <= 60;
              return (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{row.medicine.brand}</p>
                    <p className="text-xs text-ink-soft">{row.medicine.strength} · {row.medicine.form}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{row.medicine.salt}</td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input type="number" value={draft.quantity} onChange={e => setDraft({ ...draft, quantity: e.target.value })} className="w-20 h-8 px-2 rounded-md border border-border text-sm" />
                    ) : (
                      row.quantity
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input type="number" value={draft.price} onChange={e => setDraft({ ...draft, price: e.target.value })} className="w-20 h-8 px-2 rounded-md border border-border text-sm" />
                    ) : (
                      `₹${row.price}`
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={expiringSoon ? 'text-warning font-medium flex items-center gap-1' : 'text-ink-soft'}>
                      {expiringSoon && <AlertTriangle size={12} />}
                      {row.expiryDate}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={stockBadgeVariant(row.status)}>{stockBadgeLabel(row.status)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(row)} className="text-xs font-medium px-2.5 py-1 rounded-md bg-primary text-white">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-xs font-medium px-2.5 py-1 rounded-md border border-border text-ink-soft">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(row)} className="p-1.5 rounded-md hover:bg-app text-ink-soft hover:text-primary"><Pencil size={14} /></button>
                          <button onClick={() => deleteInventoryItem(row.id)} className="p-1.5 rounded-md hover:bg-app text-ink-soft hover:text-danger"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AddStockModal open={modalOpen} onClose={() => setModalOpen(false)} pharmacyId={pharmacyId} onAdd={addInventoryItem} />
    </div>
  );
}
