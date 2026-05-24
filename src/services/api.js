import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://colab-editor-backend.onrender.com/api'

const API = axios.create({ baseURL: BASE_URL })

// Add access token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Auto refresh token on 401
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                const res = await axios.post(`${BASE_URL}/auth/refresh`, {
                    refreshToken: localStorage.getItem('refreshToken')
                })
                const newAccessToken = res.data.accessToken
                localStorage.setItem('accessToken', newAccessToken)
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return API(originalRequest)
            } catch (err) {
                console.error(err)
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

// Auth
export const registerAPI = (data) => API.post('/auth/register', data)
export const loginAPI    = (data) => API.post('/auth/login', data)
export const logoutAPI   = ()     => API.post('/auth/logout', {
    refreshToken: localStorage.getItem('refreshToken')
})
export const getMeAPI = () => API.get('/auth/me')

// Documents
export const getAllDocumentsAPI    = ()           => API.get('/documents')
export const createDocumentAPI     = (data)       => API.post('/documents', data)
export const getDocumentByIdAPI    = (id)         => API.get(`/documents/${id}`)
export const updateDocumentAPI     = (id, data)   => API.put(`/documents/${id}`, data)
export const deleteDocumentAPI     = (id)         => API.delete(`/documents/${id}`)

// Collaborators
export const getCollaboratorsAPI   = (id)         => API.get(`/documents/${id}/collaborators`)
export const addCollaboratorAPI    = (id, data)   => API.post(`/documents/${id}/collaborators`, data)
export const removeCollaboratorAPI = (id, userId) => API.delete(`/documents/${id}/collaborators/${userId}`)

// Versions
export const getVersionsAPI    = (id)       => API.get(`/documents/${id}/versions`)
export const restoreVersionAPI = (id, data) => API.post(`/documents/${id}/versions/restore`, data)

export default API