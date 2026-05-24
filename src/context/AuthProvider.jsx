import { getMeAPI, loginAPI, logoutAPI } from "../services/api";
import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";



export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchUser = async() => {
        try {
            const token = sessionStorage.getItem("accessToken");
            if(token) {
                const res = await getMeAPI();
                setUser(res.data.user)
            }
            // No token — directly set loading false
        } catch(error) {
            console.error("Error fetching user:", error);
            sessionStorage.removeItem("accessToken")
            setUser(null)
        } finally {
            setLoading(false); // Ensure loading is false regardless of success or failure
        }
    }
    fetchUser();
}, [])
    const login = async (email, password) => {
        try {
            const res = await loginAPI({ email, password });
            sessionStorage.setItem('accessToken', res.data.accessToken);
            setUser(res.data.user);
        } catch(error) {
            console.error("Login error:", error);
            throw error;
        }
    }

 const logout = async () => {
    try {
        const token = sessionStorage.getItem("accessToken")
        const refreshToken = sessionStorage.getItem("refreshToken")
        if(token) {
            await logoutAPI(refreshToken)
            sessionStorage.removeItem("accessToken")
            sessionStorage.removeItem("refreshToken")
            setUser(null)
        }
    } catch(error) {
        console.error("Logout error:", error);
        // Even if logout API fails — clear session anyway
        sessionStorage.removeItem("accessToken")
        sessionStorage.removeItem("refreshToken")
        setUser(null)
    }
}

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}