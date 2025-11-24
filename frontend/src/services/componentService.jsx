import api from '../api/axios';

export const componentService = {
  getAllComponents: async () => {
    const response = await api.get('/components');
    return response.data;
  },

  getComponentById: async (id) => {
    const response = await api.get(`/components/${id}`);
    return response.data;
  },

  getAvailableComponents: async (startDate, endDate) => {
    const response = await api.get('/components/available', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  createComponent: async (componentData) => {
    const response = await api.post('/components', componentData);
    return response.data;
  },

  updateComponent: async (id, componentData) => {
    const response = await api.put(`/components/${id}`, componentData);
    return response.data;
  },

  deleteComponent: async (id) => {
    const response = await api.delete(`/components/${id}`);
    return response.data;
  },
};