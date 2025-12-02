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
};