import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthProvider } from './context/AuthProvider'
import { AuthContext } from './context/AuthContext'
import { ProtectedRoute } from './components/Routes/ProtectedRoutes'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'

const AppRoutes = () => {
    const { loading } = useContext(AuthContext)

    // Covers ALL routes including /login — no black screen
    if (loading) {
        return (
            <div className='min-h-screen bg-[#0a0a0a] flex items-center justify-center'>
                <div className='w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin' />
            </div>
        )
    }

    return (
        <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
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