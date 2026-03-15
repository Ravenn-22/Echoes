import axios from 'axios';

const API = axios.create({
    baseURL: 'https://echoes-j0mn.onrender.com/api'
});

API.interceptors.request.use((req) => {
    if (localStorage.getItem('user')) {
        req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('user')).token}`;
    }
    return req;
});
export const inviteMember = (id, email) => API.post(`/scrapbooks/${id}/invite`, { email });
export const registerUser = (formData) => API.post('/auth/register', formData);
export const loginUser = (formData) => API.post('/auth/login', formData);

export const createScrapbook = (formData) => API.post('/scrapbooks', formData);
export const getScrapbooks = (page = 1) => API.get(`/scrapbooks?page=${page}&limit=4`);
export const getScrapbook = (id) => API.get(`/scrapbooks/${id}`);
export const updateScrapbook = (id, formData) => API.put(`/scrapbooks/${id}`, formData);
export const deleteScrapbook = (id) => API.delete(`/scrapbooks/${id}`);

export const createMemory = (formData) => API.post('/memories', formData);
export const getMemories = (scrapbookId, page = 1) => API.get(`/memories?scrapbookId=${scrapbookId}&page=${page}&limit=6`);
export const updateMemory = (id, formData) => API.put(`/memories/${id}`, formData);
export const deleteMemory = (id) => API.delete(`/memories/${id}`);
export const updateUsername = (username) => API.put('/auth/update-username', { username });
export const initializePayment = (email, amount, plan) => API.post('/paystack/initialize', { email, amount, plan });
export const verifyPayment = (reference) => API.get(`/paystack/verify/${reference}`);

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const user = JSON.parse(localStorage.getItem('user'));

    const response = await API.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user.token}`
        }
    });

    return response.data.imageUrl; 
};
export const removeMember = (scrapbookId, memberId) => API.delete(`/scrapbooks/${scrapbookId}/members/${memberId}`);
export const forgotPassword = (email) => API.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => API.put(`/auth/reset-password/${token}`, { password });
export const updateProfilePicture = (profilePicture) => API.put('/auth/update-profile-picture', { profilePicture });
export const changePassword = (currentPassword, newPassword) => API.put('/auth/change-password', { currentPassword, newPassword });
export const pinMemory = (id) => API.put(`/memories/${id}/pin`);