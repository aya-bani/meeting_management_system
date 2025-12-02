import api from '../api/axios';

export const reportService = {
  getBookingReport: async (startDate, endDate) => {
    const response = await api.get('/reports/bookings', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getRoomUtilization: async () => {
    const response = await api.get('/reports/room-utilization');
    return response.data;
  },

  getComponentUsage: async () => {
    const response = await api.get('/reports/component-usage');
    return response.data;
  },

  // HR creates a new component/room issue report
  createReport: async (reportData) => {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  // Get all reports (for admin)
  getAllReports: async (status) => {
    const params = status ? { status } : {};
    const response = await api.get('/reports', { params });
    return response.data;
  },

  // Update report status (admin only)
  updateReport: async (id, reportData) => {
    const response = await api.put(`/reports/${id}`, reportData);
    return response.data;
  },
};