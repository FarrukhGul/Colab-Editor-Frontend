import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"


export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext)

 if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
    )
}

    if(!user) return <Navigate to="/login" replace />

    return children
}
