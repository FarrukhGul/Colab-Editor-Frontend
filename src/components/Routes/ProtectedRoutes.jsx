import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"


export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext)

    if(loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if(!user) return <Navigate to="/login" replace />

    return children
}
