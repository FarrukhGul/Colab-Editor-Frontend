import axios from 'axios'

const API = axios.create({
    // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

      baseURL: import.meta.env.VITE_API_URL || 'https://colab-editor-backend.onrender.com'
})

// add Access token in every request automatically
API.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('accessToken')
    if(token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// create new access token from refresh token if access token is expired
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if(error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const res = await axios.post(
                    `${import.meta.env.VITE_API_URL || 'https://colab-editor-backend.onrender.com'}/auth/refresh`,
                    {},
                    { withCredentials: true }
                )

                const newAccessToken = res.data.accessToken
                sessionStorage.setItem('accessToken', newAccessToken)

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return API(originalRequest)

            } catch(err) {
                console.error('Token refresh failed:', err)
                sessionStorage.removeItem('accessToken')
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

// Auth
export const registerAPI = (data) => API.post('/auth/register', data)
export const loginAPI = (data) => API.post('/auth/login', data, { withCredentials: true })
export const logoutAPI = () => API.post('/auth/logout', { 
    refreshToken: sessionStorage.getItem('refreshToken') 
})
export const getMeAPI = () => API.get('/auth/me')

// Documents
export const getAllDocumentsAPI = () => API.get('/documents')
export const createDocumentAPI = (data) => API.post('/documents', data)
export const getDocumentByIdAPI = (id) => API.get(`/documents/${id}`)
export const updateDocumentAPI = (id, data) => API.put(`/documents/${id}`, data)
export const deleteDocumentAPI = (id) => API.delete(`/documents/${id}`)

// Collaborators
export const getCollaboratorsAPI = (id) => API.get(`/documents/${id}/collaborators`)
export const addCollaboratorAPI = (id, data) => API.post(`/documents/${id}/collaborators`, data)
export const removeCollaboratorAPI = (id, userId) => API.delete(`/documents/${id}/collaborators/${userId}`)

// Versions
export const getVersionsAPI = (id) => API.get(`/documents/${id}/versions`)
export const restoreVersionAPI = (id, data) => API.post(`/documents/${id}/versions/restore`, data)

export default API