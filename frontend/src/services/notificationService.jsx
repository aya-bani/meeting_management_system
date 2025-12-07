import api from '../api/axios';

export const notificationService = {
  // Get all notifications for current user
  getNotifications: async (read = null) => {
    const params = {};
    if (read !== null) {
      params.read = read;
    }
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  },

  // Mark notification as read
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
};

