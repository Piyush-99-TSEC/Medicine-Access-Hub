import { useEffect, useState } from 'react';
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
import { useApp } from '../../context/AppContext.js';
import { ownerReservationApi } from '../../api/client.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function SalesReservationChart() {
  const { currentUser } = useApp();
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    ownerReservationApi.daily(7, currentUser?.token).then(setTrend).catch(() => {});
  }, [currentUser?.token]);

  const chartData = {
    labels: trend.map(d => new Date(`${d.date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short' })),
    datasets: [
      {
        label: 'Reservations',
        data: trend.map(d => d.count),
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
