import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SystemAnalyticsChart({ pharmacies, pendingCount }) {
  const verifiedCount = pharmacies.filter(p => p.isVerified).length;
  const rejectedCount = Math.max(0, pharmacies.length - verifiedCount - pendingCount);

  const chartData = {
    labels: ['Verified', 'Pending', 'Unverified'],
    datasets: [
      {
        data: [verifiedCount, pendingCount, rejectedCount],
        backgroundColor: ['#16A34A', '#D97706', '#DC2626'],
        borderWidth: 0,
        hoverOffset: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 12 }, color: '#0F172A' } },
      tooltip: { backgroundColor: '#0F172A', padding: 10, cornerRadius: 8 }
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <h3 className="font-display font-semibold text-ink text-[15px] mb-3">Pharmacy Verification Status</h3>
      <div className="h-64">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}
