import axios from 'axios';

const api = axios.create({
baseURL: process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
});

// Queues
export const getQueues = () => api.get('/queues');
export const getQueue = (id) => api.get(`/queues/${id}`);
export const createQueue = (data) => api.post('/queues', data);
export const updateQueue = (id, data) => api.put(`/queues/${id}`, data);
export const deleteQueue = (id) => api.delete(`/queues/${id}`);
export const callNext = (id) => api.post(`/queues/${id}/next`);
export const resetQueue = (id) => api.post(`/queues/${id}/reset`);

// Tokens
export const getTokensByQueue = (queueId, status) =>
  api.get(`/tokens/queue/${queueId}`, { params: status ? { status } : {} });
export const getAllDisplayTokens = () => api.get('/tokens/all');
export const generateToken = (data) => api.post('/tokens/generate', data);
export const updateTokenStatus = (id, status) => api.put(`/tokens/${id}/status`, { status });
export const deleteToken = (id) => api.delete(`/tokens/${id}`);
export const getStats = () => api.get('/tokens/stats/summary');

export default api;
