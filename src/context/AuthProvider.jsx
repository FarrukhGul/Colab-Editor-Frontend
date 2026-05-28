import { getMeAPI, loginAPI, logoutAPI } from "../services/api";
import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
        const token = localStorage.getItem("accessToken")

        if (!token) {
            setUser(null)
            setLoading(false)
            return
        }

        try {
            const res = await getMeAPI()
            setUser(res.data.user)
        } catch (error) {
            console.error("Error fetching user:", error)
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    fetchUser()
}, [])


    const login = async (email, password) => {
        try {
            const res = await loginAPI({ email, password })
            localStorage.setItem('accessToken', res.data.accessToken)
            if(res.data.refreshToken) {
                localStorage.setItem('refreshToken', res.data.refreshToken)
            }
            setUser(res.data.user)
        } catch(error) {
            console.error("Login error:", error)
            throw error
        }
    }

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken')
            if(refreshToken) await logoutAPI()
        } catch(error) {
            console.error("Logout error:", error)
        } finally {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            setUser(null)
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}