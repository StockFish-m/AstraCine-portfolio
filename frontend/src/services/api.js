import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Genre APIs
export const genreAPI = {
    getAll: () => api.get('/api/admin/genres'),
    getById: (id) => api.get(`/api/admin/genres/${id}`),
    create: (data) => api.post('/api/admin/genres', data),
    update: (id, data) => api.put(`/api/admin/genres/${id}`, data),
    delete: (id) => api.delete(`/api/admin/genres/${id}`),
};

// Movie APIs
export const movieAPI = {
    getAll: (status) => {
        const params = {};
        if (status) {
            params.status = status;
        }
        return api.get('/api/admin/movies', { params });
    },
    getById: (id) => api.get(`/api/admin/movies/${id}`),
    search: (title) => api.get('/api/admin/movies/search', { params: { title } }),
    getByGenre: (genreId) => api.get(`/api/admin/movies/genre/${genreId}`),
    create: (formData) => api.post('/api/admin/movies', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, formData) => api.put(`/api/admin/movies/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (id) => api.delete(`/api/admin/movies/${id}`),
};

export default api;
