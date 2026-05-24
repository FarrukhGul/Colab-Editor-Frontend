import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider } from './context/AuthProvider'

import { ProtectedRoute } from './components/Routes/ProtectedRoutes'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'

const AppRoutes = () => {

    return (
        <Routes>
            {/* Public routes — seedha render, no loading check */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />

            {/* Protected routes — loading ProtectedRoute handle karega */}
            <Route path='/dashboard' element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path='/editor/:id' element={
                <ProtectedRoute><Editor /></ProtectedRoute>
            } />
            <Route path='/' element={<Navigate to='/dashboard' replace />} />
            <Route path='*' element={<Navigate to='/dashboard' replace />} />
        </Routes>
    )
}

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App