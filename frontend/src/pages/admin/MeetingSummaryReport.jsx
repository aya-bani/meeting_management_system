// frontend/src/pages/admin/MeetingSummaryReport.jsx
import { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import KPICards from '../../components/meetingSummary/KPICards';
import ReportFilters from '../../components/meetingSummary/ReportFilters';
import MeetingCharts from '../../components/meetingSummary/MeetingCharts';
import { reportService } from '../../services/reportService';
import { bookingService } from '../../services/bookingServices';

// Mock data generator for fallback
function generateMockData(filters) {
  const mockMeetings = [];
  const startDate = new Date(filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const endDate = new Date(filters.endDate || new Date());
  
  // Generate mock meetings over the date range
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < Math.min(daysDiff * 2, 50); i++) {
    const meetingDate = new Date(startDate);
    meetingDate.setDate(meetingDate.getDate() + Math.floor(Math.random() * daysDiff));
    
    const duration = 30 + Math.random() * 120; // 30-150 minutes
    const startHour = 8 + Math.floor(Math.random() * 10);
    const startMinutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
    const endTime = new Date(meetingDate);
    endTime.setHours(startHour, startMinutes + duration, 0);
    
    const statuses = ['booked', 'canceled', 'completed'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    if (filters.status && status !== filters.status) continue;
    
    mockMeetings.push({
      _id: `mock_${i}`,
      date: meetingDate.toISOString().split('T')[0],
      startTime: `${String(startHour).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`,
      endTime: endTime.toTimeString().split(' ')[0].substring(0, 5),
      status,
      duration: Math.round(duration),
    });
  }
  
  // Calculate KPIs
  const totalMeetings = mockMeetings.length;
  const canceledMeetings = mockMeetings.filter(m => m.status === 'canceled').length;
  const durations = mockMeetings.map(m => m.duration).filter(d => d > 0);
  const averageDuration = durations.length > 0 
    ? durations.reduce((a, b) => a + b, 0) / durations.length 
    : 0;
  const sortedDurations = [...durations].sort((a, b) => a - b);
  const medianDuration = sortedDurations.length > 0
    ? sortedDurations[Math.floor(sortedDurations.length / 2)]
    : 0;
  const cancellationRate = totalMeetings > 0 ? (canceledMeetings / totalMeetings) * 100 : 0;
  
  // Generate time series data
  const meetingsOverTime = [];
  const dateMap = {};
  mockMeetings.forEach(meeting => {
    const dateKey = meeting.date;
    dateMap[dateKey] = (dateMap[dateKey] || 0) + 1;
  });
  
  Object.entries(dateMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([date, count]) => {
      meetingsOverTime.push({ date, count });
    });
  
  // Status distribution
  const statusCounts = {
    booked: 0,
    canceled: 0,
    completed: 0,
    upcoming: 0,
  };
  mockMeetings.forEach(meeting => {
    statusCounts[meeting.status] = (statusCounts[meeting.status] || 0) + 1;
  });
  
  const statusDistribution = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  
  // Meetings per period (weekly)
  const meetingsPerPeriod = [];
  const weekMap = {};
  mockMeetings.forEach(meeting => {
    const date = new Date(meeting.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    weekMap[weekKey] = (weekMap[weekKey] || 0) + 1;
  });
  
  Object.entries(weekMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([period, count]) => {
      meetingsPerPeriod.push({ period, count });
    });
  
  return {
    totalMeetings,
    averageDuration,
    medianDuration,
    cancellationRate,
    meetingsOverTime,
    statusDistribution,
    meetingsPerPeriod,
    rawData: mockMeetings,
  };
}

// Process real booking data into report format
function processBookingData(bookings, filters) {
  if (!bookings || bookings.length === 0) {
    return {
      totalMeetings: 0,
      averageDuration: 0,
      medianDuration: 0,
      cancellationRate: 0,
      meetingsOverTime: [],
      statusDistribution: [],
      meetingsPerPeriod: [],
      rawData: [],
    };
  }
  
  // Filter bookings
  let filteredBookings = bookings.filter(booking => {
    if (filters.startDate && booking.date < filters.startDate) return false;
    if (filters.endDate && booking.date > filters.endDate) return false;
    if (filters.status && booking.status !== filters.status) {
      // Map statuses: 'booked' can be upcoming or completed based on date
      const now = new Date();
      const bookingDateTime = new Date(`${booking.date}T${booking.endTime}`);
      if (filters.status === 'upcoming' && booking.status === 'booked' && bookingDateTime > now) {
        return true;
      }
      if (filters.status === 'completed' && booking.status === 'booked' && bookingDateTime <= now) {
        return true;
      }
      if (filters.status === booking.status) return true;
      return false;
    }
    if (filters.roomId && booking.room !== filters.roomId) {
      const roomId = typeof booking.room === 'object' ? booking.room._id : booking.room;
      return roomId === filters.roomId;
    }
    return true;
  });
  
  // Calculate duration for each booking
  const bookingsWithDuration = filteredBookings.map(booking => {
    const start = booking.startTime.split(':').map(Number);
    const end = booking.endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    const duration = endMinutes - startMinutes;
    
    return {
      ...booking,
      duration: Math.max(duration, 0),
    };
  });
  
  // Calculate KPIs
  const totalMeetings = bookingsWithDuration.length;
  const canceledMeetings = bookingsWithDuration.filter(b => b.status === 'canceled').length;
  const durations = bookingsWithDuration
    .filter(b => b.status !== 'canceled')
    .map(b => b.duration)
    .filter(d => d > 0);
  
  const averageDuration = durations.length > 0 
    ? durations.reduce((a, b) => a + b, 0) / durations.length 
    : 0;
  
  const sortedDurations = [...durations].sort((a, b) => a - b);
  const medianDuration = sortedDurations.length > 0
    ? sortedDurations[Math.floor(sortedDurations.length / 2)]
    : 0;
  
  const cancellationRate = totalMeetings > 0 ? (canceledMeetings / totalMeetings) * 100 : 0;
  
  // Generate time series data
  const meetingsOverTime = [];
  const dateMap = {};
  bookingsWithDuration.forEach(booking => {
    const dateKey = booking.date;
    dateMap[dateKey] = (dateMap[dateKey] || 0) + 1;
  });
  
  Object.entries(dateMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([date, count]) => {
      meetingsOverTime.push({ date, count });
    });
  
  // Status distribution
  const now = new Date();
  const statusCounts = {
    'Booked': 0,
    'Canceled': 0,
    'Completed': 0,
    'Upcoming': 0,
  };
  
  bookingsWithDuration.forEach(booking => {
    if (booking.status === 'canceled') {
      statusCounts['Canceled']++;
    } else {
      const bookingDateTime = new Date(`${booking.date}T${booking.endTime}`);
      if (bookingDateTime > now) {
        statusCounts['Upcoming']++;
      } else {
        statusCounts['Completed']++;
      }
    }
  });
  
  const statusDistribution = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));
  
  // Meetings per period (weekly)
  const meetingsPerPeriod = [];
  const weekMap = {};
  bookingsWithDuration.forEach(booking => {
    const date = new Date(booking.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    weekMap[weekKey] = (weekMap[weekKey] || 0) + 1;
  });
  
  Object.entries(weekMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([period, count]) => {
      meetingsPerPeriod.push({ period, count });
    });
  
  return {
    totalMeetings,
    averageDuration,
    medianDuration,
    cancellationRate,
    meetingsOverTime,
    statusDistribution,
    meetingsPerPeriod,
    rawData: bookingsWithDuration,
  };
}

function MeetingSummaryReport() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useMockData, setUseMockData] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: null,
    roomId: null,
  });
  
  // Initialize filters with default date range (last 30 days)
  const getDefaultFilters = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: null,
      roomId: null,
    };
  };
  
  // Set default filters on mount
  useEffect(() => {
    const defaultFilters = getDefaultFilters();
    setFilters(defaultFilters);
  }, []);
  
  const fetchReportData = useCallback(async () => {
    if (!filters.startDate || !filters.endDate) {
      return; // Don't fetch until dates are set
    }
    
    try {
      setLoading(true);
      setError('');
      setUseMockData(false);
      
      // Try to fetch from API
      try {
        const data = await reportService.getMeetingSummary(filters);
        setReportData(data);
      } catch (apiError) {
        console.warn('API endpoint not available, using mock data:', apiError);
        // Fallback: try to get bookings and process them
        try {
          const bookings = await bookingService.getAllBookings();
          const processedData = processBookingData(bookings, filters);
          setReportData(processedData);
          setUseMockData(true);
        } catch (bookingError) {
          console.warn('Could not fetch bookings, using pure mock data:', bookingError);
          // Final fallback: use mock data
          const mockData = generateMockData(filters);
          setReportData(mockData);
          setUseMockData(true);
        }
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err.response?.data?.message || 'Failed to load report data');
      // Use mock data as fallback
      const mockData = generateMockData(filters);
      setReportData(mockData);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      fetchReportData();
    }
  }, [fetchReportData, filters]);
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  const handleGenerate = () => {
    fetchReportData();
  };
  
  const handleExportPDF = () => {
    // TODO: Implement PDF export using a library like jsPDF or react-pdf
    alert('PDF export feature will be implemented with a PDF library');
  };
  
  const handleExportCSV = () => {
    if (!reportData || !reportData.rawData) {
      alert('No data to export');
      return;
    }
    
    // Convert raw data to CSV
    const headers = ['Date', 'Start Time', 'End Time', 'Status', 'Duration (min)'];
    const rows = reportData.rawData.map(meeting => [
      meeting.date,
      meeting.startTime,
      meeting.endTime,
      meeting.status,
      meeting.duration || 0,
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-summary-${filters.startDate}-to-${filters.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  
  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-5"></div>
          <div className="relative px-8 py-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Meeting Summary Report</h1>
                <p className="text-indigo-100 text-lg">Comprehensive meeting analytics and insights</p>
                {useMockData && (
                  <p className="text-yellow-200 text-sm mt-2">
                    ⚠️ Using mock data - API endpoint not available
                  </p>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <main className="px-8 py-8 bg-gradient-to-b from-slate-50 to-white min-h-screen">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {/* Filters */}
          <ReportFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onGenerate={handleGenerate}
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
            loading={loading}
          />
          
          {/* KPI Cards */}
          <KPICards data={reportData} loading={loading} />
          
          {/* Charts */}
          {reportData && (
            <MeetingCharts data={reportData} loading={loading} />
          )}
          
          {/* Empty State */}
          {!loading && reportData && reportData.totalMeetings === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Found</h3>
              <p className="text-gray-600">
                No meetings match the selected filters. Try adjusting your date range or filter criteria.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default MeetingSummaryReport;

