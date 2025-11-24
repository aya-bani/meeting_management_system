import api from '../api/axios';

export const roomService = {
  getAllRooms: async () => {
    const response = await api.get('/rooms');
    return response.data;
  },

  getRoomById: async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  getRoomsByFloor: async (floorId) => {
    const response = await api.get(`/rooms/floor/${floorId}`);
    return response.data;
  },

  getAvailableRooms: async (startDate, endDate) => {
    const response = await api.get('/rooms/available', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  createRoom: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  updateRoom: async (id, roomData) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  deleteRoom: async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },
};