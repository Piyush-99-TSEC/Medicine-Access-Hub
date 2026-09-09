import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { UNMET_DEMAND_CLUSTERS } from '../../mock/mockData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function UnmetDemandClusterChart() {
  const sorted = [...UNMET_DEMAND_CLUSTERS].sort((a, b) => b.searchCount - a.searchCount).slice(0, 5);

  const chartData = {
    labels: sorted.map(c => c.medicineName),
    datasets: [
      {
        label: 'Zero-result searches',
        data: sorted.map(c => c.searchCount),
        backgroundColor: '#4F46E5',
        borderRadius: 6,
        maxBarThickness: 32
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#0F172A', padding: 10, cornerRadius: 8 }
    },
    scales: {
      x: { beginAtZero: true, grid: { color: '#E2E8F0' }, ticks: { font: { size: 11 }, color: '#64748B' } },
      y: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#64748B' } }
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <h3 className="font-display font-semibold text-ink text-[15px] mb-3">Top 5 Unfulfilled Medicines (City-wide)</h3>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
