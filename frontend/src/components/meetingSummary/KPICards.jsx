// frontend/src/components/meetingSummary/KPICards.jsx
import { FaCalendarCheck, FaClock, FaChartLine, FaTimesCircle } from 'react-icons/fa';

function KPICard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon className="text-2xl" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function KPICards({ data, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Meetings Created',
      value: data?.totalMeetings || 0,
      icon: FaCalendarCheck,
      color: '#6366F1', // indigo-500
    },
    {
      title: 'Average Duration (min)',
      value: data?.averageDuration ? Math.round(data.averageDuration) : 0,
      icon: FaClock,
      color: '#10B981', // green-500
    },
    {
      title: 'Median Duration (min)',
      value: data?.medianDuration ? Math.round(data.medianDuration) : 0,
      icon: FaChartLine,
      color: '#F59E0B', // amber-500
    },
    {
      title: 'Cancellation Rate (%)',
      value: data?.cancellationRate ? data.cancellationRate.toFixed(1) : '0.0',
      icon: FaTimesCircle,
      color: '#EF4444', // red-500
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}

export default KPICards;

