import api from '../api/axios';

export const floorService = {
  getAllFloors: async () => {
    const response = await api.get('/floors');
    return response.data;
  },

  getFloorById: async (id) => {
    const response = await api.get(`/floors/${id}`);
    return response.data;
  },

  createFloor: async (floorData) => {
    const response = await api.post('/floors', floorData);
    return response.data;
  },

  updateFloor: async (id, floorData) => {
    const response = await api.put(`/floors/${id}`, floorData);
    return response.data;
  },

  deleteFloor: async (id) => {
    const response = await api.delete(`/floors/${id}`);
    return response.data;
  },
};