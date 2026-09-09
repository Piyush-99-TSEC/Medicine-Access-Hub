import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { MEDICINES } from '../../mock/mockData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function InventoryStockChart({ inventory, pharmacyId }) {
  const chartData = useMemo(() => {
    const rows = inventory
      .filter(inv => inv.pharmacyId === pharmacyId)
      .map(inv => ({ ...inv, medicine: MEDICINES.find(m => m.id === inv.medicineId) }))
      .filter(r => r.medicine)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    return {
      labels: rows.map(r => r.medicine.brand),
      datasets: [
        {
          label: 'Units in stock',
          data: rows.map(r => r.quantity),
          backgroundColor: rows.map(r => (r.quantity > 10 ? '#6D28D9' : r.quantity > 0 ? '#D97706' : '#DC2626')),
          borderRadius: 6,
          maxBarThickness: 28
        }
      ]
    };
  }, [inventory, pharmacyId]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#0F172A', padding: 10, cornerRadius: 8 }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#64748B' } },
      y: { beginAtZero: true, grid: { color: '#E2E8F0' }, ticks: { font: { size: 11 }, color: '#64748B' } }
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <h3 className="font-display font-semibold text-ink text-[15px] mb-3">Stock Distribution</h3>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
