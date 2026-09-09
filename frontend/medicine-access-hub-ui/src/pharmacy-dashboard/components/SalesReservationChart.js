import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';
import { RESERVATION_TREND } from '../../mock/mockData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function SalesReservationChart() {
  const chartData = {
    labels: RESERVATION_TREND.map(d => d.day),
    datasets: [
      {
        label: 'Reservations',
        data: RESERVATION_TREND.map(d => d.reservations),
        borderColor: '#6D28D9',
        backgroundColor: 'rgba(109, 40, 217, 0.12)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#6D28D9',
        pointRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#0F172A', padding: 10, cornerRadius: 8 }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#64748B' } },
      y: { beginAtZero: true, grid: { color: '#E2E8F0' }, ticks: { font: { size: 11 }, color: '#64748B', stepSize: 3 } }
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <h3 className="font-display font-semibold text-ink text-[15px] mb-3">Daily Reservations (7 days)</h3>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
